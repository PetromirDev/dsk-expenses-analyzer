/**
 * Transaction aggregation analyzer
 * Aggregates transactions by month and business
 */

import type { StandardTransaction } from '../types/banking'
import type { MonthlySpending, BusinessSpending, Transaction } from '../types'

/**
 * Aggregate transactions by month
 */
export function aggregateByMonth(transactions: StandardTransaction[]): MonthlySpending[] {
  const monthlyData: Record<string, MonthlySpending> = {}

  // Only process Debit transactions (spending)
  const debitTransactions = transactions.filter((t) => t.movementType === 'Debit')

  debitTransactions.forEach((t) => {
    const monthYear = t.monthYear

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        month: monthYear,
        amount: 0,
        transactions: []
      }
    }

    monthlyData[monthYear].amount += t.amount
    monthlyData[monthYear].transactions.push(t as Transaction)
  })

  // Convert to array and sort by date (most recent first)
  return Object.values(monthlyData).sort(
    (a, b) => b.transactions[0].dateObj.getTime() - a.transactions[0].dateObj.getTime()
  )
}

/**
 * Aggregate both income and expenses by month for charting
 */
export function aggregateIncomeAndExpensesByMonth(transactions: StandardTransaction[]): {
  month: string
  income: number
  expenses: number
  dateObj: Date
}[] {
  const monthlyData: Record<
    string,
    { month: string; income: number; expenses: number; dateObj: Date }
  > = {}

  transactions.forEach((t) => {
    const monthYear = t.monthYear

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        month: monthYear,
        income: 0,
        expenses: 0,
        dateObj: t.dateObj
      }
    }

    if (t.movementType === 'Credit') {
      monthlyData[monthYear].income += t.amount
    } else if (t.movementType === 'Debit') {
      monthlyData[monthYear].expenses += t.amount
    }
  })

  // Convert to array and sort by date (oldest first for charts)
  return Object.values(monthlyData).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
}

/**
 * Aggregate transactions by business
 */
export function aggregateByBusiness(transactions: StandardTransaction[]): BusinessSpending[] {
  const businessData: Record<string, BusinessSpending> = {}

  // Only process Debit transactions (spending)
  const debitTransactions = transactions.filter((t) => t.movementType === 'Debit')

  debitTransactions.forEach((t) => {
    const businessName = t.businessName

    if (!businessData[businessName]) {
      businessData[businessName] = {
        name: businessName,
        originalNames: [t.oppositeSideName],
        group: 'Други', // Will be populated by group mapping
        amount: 0,
        transactions: []
      }
    } else {
      // Add to originalNames if not already there
      if (!businessData[businessName].originalNames.includes(t.oppositeSideName)) {
        businessData[businessName].originalNames.push(t.oppositeSideName)
      }
    }

    businessData[businessName].amount += t.amount
    businessData[businessName].transactions.push(t as Transaction)
  })

  // Convert to array and sort by amount (highest first)
  return Object.values(businessData).sort((a, b) => b.amount - a.amount)
}

/**
 * Calculate total income and spending
 */
export function calculateTotals(transactions: StandardTransaction[]): {
  totalSpent: number
  totalIncome: number
  netBalance: number
} {
  let totalSpent = 0
  let totalIncome = 0

  transactions.forEach((t) => {
    if (t.movementType === 'Debit') {
      totalSpent += t.amount
    } else if (t.movementType === 'Credit') {
      totalIncome += t.amount
    }
  })

  return {
    totalSpent,
    totalIncome,
    netBalance: totalIncome - totalSpent
  }
}
