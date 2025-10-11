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
  BGN_PRICE_THRESHOLD_PERCENTAGE: 0.1, // 10% tolerance for BGN-only transactions
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
    if (txns.length < SUBSCRIPTION_CONFIG.MINIMUM_CONSECUTIVE_MONTHS) return

    // Sort by date (oldest first)
    const sortedTxns = [...txns].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

    // Group transactions by month-year
    const monthlyTxns: Record<string, StandardTransaction[]> = {}
    sortedTxns.forEach((t) => {
      const monthKey = `${t.dateObj.getFullYear()}-${String(t.dateObj.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyTxns[monthKey]) {
        monthlyTxns[monthKey] = []
      }
      monthlyTxns[monthKey].push(t)
    })

    // Get sorted month keys
    const monthKeys = Object.keys(monthlyTxns).sort()

    // Find consecutive month sequences
    const sequences = findConsecutiveSequences(monthKeys, monthlyTxns)

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
 * Find consecutive month sequences with matching amounts
 */
function findConsecutiveSequences(
  monthKeys: string[],
  monthlyTxns: Record<string, StandardTransaction[]>
): SubscriptionPayment[][] {
  const sequences: SubscriptionPayment[][] = []
  let currentSequence: SubscriptionPayment[] = []
  let lastForeignCurrency: { amount: number; currency: string } | null = null
  let lastBgnAmount: number | null = null
  let lastMonthKey: string | null = null
  let lastDayOfMonth: number | null = null

  monthKeys.forEach((monthKey) => {
    // Find the transaction that matches the previous foreign currency pattern
    // Or use the first transaction if this is the start of a sequence
    const monthTxn =
      monthlyTxns[monthKey].find((t) =>
        lastForeignCurrency && t.foreignCurrency
          ? t.foreignCurrency.amount === lastForeignCurrency.amount &&
            t.foreignCurrency.currency === lastForeignCurrency.currency
          : true
      ) || monthlyTxns[monthKey][0]

    const currentBgnAmount = monthTxn.amount
    const currentDayOfMonth = monthTxn.dateObj.getDate()
    const currentForeignCurrency = monthTxn.foreignCurrency

    if (lastMonthKey === null) {
      // First transaction in potential sequence
      currentSequence = [
        {
          date: monthTxn.dateObj,
          amount: currentBgnAmount,
          monthYear: monthTxn.monthYear,
          transaction: monthTxn
        }
      ]
      lastForeignCurrency = currentForeignCurrency || null
      lastBgnAmount = currentBgnAmount
      lastMonthKey = monthKey
      lastDayOfMonth = currentDayOfMonth
    } else {
      // Check if this month is consecutive
      const isConsecutive = isConsecutiveMonth(lastMonthKey, monthKey)

      // Check if day of month is within tolerance
      const dayDifference = Math.abs(currentDayOfMonth - lastDayOfMonth!)
      const isWithinDaysThreshold = dayDifference <= SUBSCRIPTION_CONFIG.DATE_TOLERANCE_DAYS

      if (isConsecutive && isWithinDaysThreshold) {
        // Check if amounts match
        const amountsMatch = doAmountsMatch(
          currentBgnAmount,
          lastBgnAmount!,
          currentForeignCurrency,
          lastForeignCurrency
        )

        if (amountsMatch) {
          // Add to current sequence
          currentSequence.push({
            date: monthTxn.dateObj,
            amount: currentBgnAmount,
            monthYear: monthTxn.monthYear,
            transaction: monthTxn
          })
          lastForeignCurrency = currentForeignCurrency || null
          lastBgnAmount = currentBgnAmount
          lastMonthKey = monthKey
          lastDayOfMonth = currentDayOfMonth
        } else {
          // Amount mismatch - save current sequence and start new
          if (currentSequence.length >= SUBSCRIPTION_CONFIG.MINIMUM_CONSECUTIVE_MONTHS) {
            sequences.push(currentSequence)
          }
          currentSequence = [
            {
              date: monthTxn.dateObj,
              amount: currentBgnAmount,
              monthYear: monthTxn.monthYear,
              transaction: monthTxn
            }
          ]
          lastForeignCurrency = currentForeignCurrency || null
          lastBgnAmount = currentBgnAmount
          lastMonthKey = monthKey
          lastDayOfMonth = currentDayOfMonth
        }
      } else {
        // Not consecutive or wrong day - save current sequence and start new
        if (currentSequence.length >= SUBSCRIPTION_CONFIG.MINIMUM_CONSECUTIVE_MONTHS) {
          sequences.push(currentSequence)
        }
        currentSequence = [
          {
            date: monthTxn.dateObj,
            amount: currentBgnAmount,
            monthYear: monthTxn.monthYear,
            transaction: monthTxn
          }
        ]
        lastForeignCurrency = currentForeignCurrency || null
        lastBgnAmount = currentBgnAmount
        lastMonthKey = monthKey
        lastDayOfMonth = currentDayOfMonth
      }
    }
  })

  // Check final sequence
  if (currentSequence.length >= SUBSCRIPTION_CONFIG.MINIMUM_CONSECUTIVE_MONTHS) {
    sequences.push(currentSequence)
  }

  return sequences
}

/**
 * Check if two month keys are consecutive
 */
function isConsecutiveMonth(lastMonthKey: string, currentMonthKey: string): boolean {
  const [lastYear, lastMonth] = lastMonthKey.split('-').map(Number)
  const [currentYear, currentMonth] = currentMonthKey.split('-').map(Number)

  const lastDate = new Date(lastYear, lastMonth - 1)
  const currentDate = new Date(currentYear, currentMonth - 1)
  const monthDiff =
    (currentDate.getFullYear() - lastDate.getFullYear()) * 12 +
    (currentDate.getMonth() - lastDate.getMonth())

  return monthDiff === 1
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
    const threshold = lastBgnAmount * SUBSCRIPTION_CONFIG.BGN_PRICE_THRESHOLD_PERCENTAGE
    const lowerBound = lastBgnAmount - threshold
    const upperBound = lastBgnAmount + threshold
    return currentBgnAmount >= lowerBound && currentBgnAmount <= upperBound
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
