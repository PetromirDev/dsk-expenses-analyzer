/**
 * Subscription detection analyzer
 * Detects recurring payment patterns from transactions
 */

import type { StandardTransaction } from '../types/banking'
import type { Subscription, SubscriptionPayment } from '../types'

/**
 * Configuration for subscription detection
 */
export const SUBSCRIPTION_CONFIG = {
  DATE_TOLERANCE_DAYS: 3, // Day-of-month tolerance (±3 days)
  MINIMUM_CONSECUTIVE_MONTHS: 2, // Minimum consecutive months to be considered a subscription
  FOREIGN_CURRENCY_TOLERANCE: 0.02 // 2 cents tolerance for foreign currency transactions
}

/**
 * Detect subscriptions from a list of transactions
 */
export function detectSubscriptions(transactions: StandardTransaction[]): Subscription[] {
  const subscriptions: Subscription[] = []

  // Filter only Debit transactions without OppositeSideAccount (not bank transfers)
  // AND where canBeSubscription is true
  const eligibleTransactions = transactions.filter(
    (t) =>
      t.movementType === 'Debit' &&
      (!t.oppositeSideAccount || t.oppositeSideAccount.trim() === '') &&
      t.canBeSubscription
  )

  // Group by business name
  const businessGroups: Record<string, StandardTransaction[]> = {}
  eligibleTransactions.forEach((t) => {
    if (!businessGroups[t.businessName]) {
      businessGroups[t.businessName] = []
    }
    businessGroups[t.businessName].push(t)
  })

  // Analyze each business for subscription patterns
  Object.entries(businessGroups).forEach(([businessName, txns]) => {
    if (!businessName) return

    if (txns.length < SUBSCRIPTION_CONFIG.MINIMUM_CONSECUTIVE_MONTHS) return

    // Sort by date (oldest first)
    const sortedTxns = [...txns].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

    // Find consecutive sequences based on 25-35 day intervals
    const sequences = findConsecutiveSequences(sortedTxns)

    // Create subscription for each valid sequence
    sequences.forEach((payments) => {
      if (payments.length >= SUBSCRIPTION_CONFIG.MINIMUM_CONSECUTIVE_MONTHS) {
        createSubscription(businessName, payments, subscriptions)
      }
    })
  })

  // Sort subscriptions by last payment date (most recent first)
  return subscriptions.sort((a, b) => b.lastPayment.getTime() - a.lastPayment.getTime())
}

/**
 * Find consecutive sequences with matching amounts occurring every 25-35 days
 * Handles multiple concurrent subscriptions to the same merchant
 */
function findConsecutiveSequences(transactions: StandardTransaction[]): SubscriptionPayment[][] {
  const sequences: SubscriptionPayment[][] = []

  // Group transactions by amount (rounded to handle minor variations)
  const amountGroups: Record<string, StandardTransaction[]> = {}

  transactions.forEach((txn) => {
    // Create a unique key based on amount and currency
    const amountKey = txn.foreignCurrency
      ? `${txn.foreignCurrency.currency}-${txn.foreignCurrency.amount}`
      : `BGN-${txn.amount}`

    if (!amountGroups[amountKey]) {
      amountGroups[amountKey] = []
    }
    amountGroups[amountKey].push(txn)
  })

  // Analyze each amount group separately
  Object.values(amountGroups).forEach((groupTxns) => {
    if (groupTxns.length < SUBSCRIPTION_CONFIG.MINIMUM_CONSECUTIVE_MONTHS) return

    // Sort by date within the group
    const sortedTxns = [...groupTxns].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

    let currentSequence: SubscriptionPayment[] = []
    let lastTransaction: StandardTransaction | null = null

    sortedTxns.forEach((txn) => {
      const currentBgnAmount = txn.amount
      const currentForeignCurrency = txn.foreignCurrency

      if (lastTransaction === null) {
        // First transaction in potential sequence
        currentSequence = [
          {
            date: txn.dateObj,
            amount: currentBgnAmount,
            monthYear: txn.monthYear,
            transaction: txn
          }
        ]
        lastTransaction = txn
      } else {
        // Calculate days between transactions
        const daysBetween =
          (txn.dateObj.getTime() - lastTransaction.dateObj.getTime()) / (1000 * 60 * 60 * 24)

        // Check if within 25-35 days interval
        const isWithinInterval = daysBetween >= 25 && daysBetween <= 35

        if (isWithinInterval) {
          // Check if amounts match (should always match within same group, but double-check)
          const amountsMatch = doAmountsMatch(
            currentBgnAmount,
            lastTransaction.amount,
            currentForeignCurrency,
            lastTransaction.foreignCurrency || null
          )

          if (amountsMatch) {
            // Add to current sequence
            currentSequence.push({
              date: txn.dateObj,
              amount: currentBgnAmount,
              monthYear: txn.monthYear,
              transaction: txn
            })
            lastTransaction = txn
          } else {
            // Amount mismatch - save current sequence and start new
            if (currentSequence.length >= SUBSCRIPTION_CONFIG.MINIMUM_CONSECUTIVE_MONTHS) {
              sequences.push(currentSequence)
            }
            currentSequence = [
              {
                date: txn.dateObj,
                amount: currentBgnAmount,
                monthYear: txn.monthYear,
                transaction: txn
              }
            ]
            lastTransaction = txn
          }
        } else if (daysBetween > 35) {
          // Gap too large - save current sequence and start new
          if (currentSequence.length >= SUBSCRIPTION_CONFIG.MINIMUM_CONSECUTIVE_MONTHS) {
            sequences.push(currentSequence)
          }
          currentSequence = [
            {
              date: txn.dateObj,
              amount: currentBgnAmount,
              monthYear: txn.monthYear,
              transaction: txn
            }
          ]
          lastTransaction = txn
        }
        // If daysBetween < 25, skip this transaction (too soon)
      }
    })

    // Check final sequence
    if (currentSequence.length >= SUBSCRIPTION_CONFIG.MINIMUM_CONSECUTIVE_MONTHS) {
      sequences.push(currentSequence)
    }
  })

  return sequences
}

/**
 * Check if amounts match based on currency type
 */
function doAmountsMatch(
  currentBgnAmount: number,
  lastBgnAmount: number,
  currentForeignCurrency: { amount: number; currency: string } | undefined,
  lastForeignCurrency: { amount: number; currency: string } | null
): boolean {
  // If both have foreign currency and same currency, compare those
  if (
    currentForeignCurrency &&
    lastForeignCurrency &&
    currentForeignCurrency.currency === lastForeignCurrency.currency
  ) {
    const diff = Math.abs(currentForeignCurrency.amount - lastForeignCurrency.amount)
    return diff <= SUBSCRIPTION_CONFIG.FOREIGN_CURRENCY_TOLERANCE
  }

  // Both are BGN transactions, use threshold
  if (!currentForeignCurrency && !lastForeignCurrency) {
    return currentBgnAmount === lastBgnAmount
  }

  // If one has foreign currency and other doesn't, they don't match
  return false
}

/**
 * Create a subscription object from a payment sequence
 */
function createSubscription(
  businessName: string,
  payments: SubscriptionPayment[],
  subscriptions: Subscription[]
): void {
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const averageAmount = totalAmount / payments.length
  const firstPayment = payments[0].date
  const lastPayment = payments[payments.length - 1].date

  // Check if subscription is active (last payment was within the last 45 days)
  const now = new Date()
  const daysSinceLastPayment = (now.getTime() - lastPayment.getTime()) / (1000 * 60 * 60 * 24)
  const isActive = daysSinceLastPayment <= 45

  subscriptions.push({
    businessName,
    payments,
    averageAmount,
    isActive,
    firstPayment,
    lastPayment,
    consecutiveMonths: payments.length
  })
}
