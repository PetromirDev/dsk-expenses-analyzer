/**
 * Transaction re-aggregation utilities
 * These functions recalculate aggregations from already-parsed transactions
 * WITHOUT reparsing the XML - for fast updates after user actions
 */

import type { AnalysisResult, Transaction } from '../types'
import { detectSubscriptions } from '../analyzers/subscriptions'
import { aggregateByMonth, aggregateByBusiness, calculateTotals } from '../analyzers/aggregations'
import { getBusinessGroup } from '../utils/xmlParser'

/**
 * Recalculate analysis from existing transactions
 * This is FAST because it doesn't reparse XML - just re-aggregates
 * Use this after:
 * - Business name changes (custom mappings)
 * - Group changes
 * - Any localStorage updates
 */
export function recomputeAnalysis(transactions: Transaction[]): AnalysisResult {
  // Calculate totals (fast - just sum)
  const { totalSpent, totalIncome, netBalance } = calculateTotals(transactions)

  // Aggregate by month (fast - just grouping)
  const monthlySpending = aggregateByMonth(transactions)

  // Aggregate by business and enrich with group mappings (fast - just grouping)
  const businessSpending = aggregateByBusiness(transactions).map((business) => ({
    ...business,
    group: getBusinessGroup(business.name)
  }))

  // Detect subscriptions (medium - pattern matching, but no XML parsing)
  const subscriptions = detectSubscriptions(transactions)

  return {
    totalSpent,
    totalIncome,
    netBalance,
    monthlySpending,
    businessSpending,
    subscriptions,
    transactions
  }
}

/**
 * Update business names in transactions after a custom mapping change
 * This modifies transactions in-place for performance
 */
export function updateBusinessNamesInTransactions(
  transactions: Transaction[],
  getBusinessInfo: (name: string) => { name: string; canBeSubscription: boolean }
): Transaction[] {
  return transactions.map((t) => {
    const businessInfo = getBusinessInfo(t.oppositeSideName)
    return {
      ...t,
      businessName: businessInfo.name,
      canBeSubscription: businessInfo.canBeSubscription
    }
  })
}
