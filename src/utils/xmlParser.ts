/**
 * XML Parser - Main orchestrator
 * This module coordinates bank adapters and analyzers for processing bank exports
 *
 * Architecture:
 * - Bank adapters: Parse bank-specific XML formats to StandardTransaction
 * - Analyzers: Detect patterns (subscriptions, aggregations)
 * - This module: Orchestrates the flow and maintains backward compatibility
 */

import type { BusinessGroupMappings, SettingsData, AnalysisResult, Transaction } from '../types'
import { bankRegistry } from '../adapters/bankRegistry'
import { detectSubscriptions } from '../analyzers/subscriptions'
import { aggregateByMonth, aggregateByBusiness, calculateTotals } from '../analyzers/aggregations'

// Re-export from services and utilities for backward compatibility
export { merchantDatabase } from '../services/merchantMatcher'
export {
  getBusinessInfo,
  getBusinessName,
  getCustomMappings,
  saveCustomMapping
} from '../services/merchantMatcher'
export { formatCurrency, parseAmount } from '../utils/currency'
export { getMonthYear, parseDate } from '../utils/dateUtils'

// Default groups
export const defaultGroups: string[] = [
  'Храна',
  'Техника',
  'Жилище',
  'Битови',
  'Транспорт',
  'Развлечения',
  'Ресторанти',
  'Онлайн пазаруване',
  'Здраве',
  'Облекло',
  'Други'
]

// Build defaultBusinessGroupMapping from merchantDatabase
import { merchantDatabase } from '../services/merchantMatcher'
export const defaultBusinessGroupMapping: Record<string, string> = Object.values(
  merchantDatabase
).reduce(
  (acc, merchant) => {
    acc[merchant.name] = merchant.category
    return acc
  },
  {} as Record<string, string>
)

// ==================== Group Management ====================

export function getCustomGroups(): string[] {
  const stored = localStorage.getItem('customGroups')
  return stored ? JSON.parse(stored) : []
}

export function saveCustomGroup(groupName: string): void {
  const customGroups = getCustomGroups()
  if (!customGroups.includes(groupName)) {
    customGroups.push(groupName)
    localStorage.setItem('customGroups', JSON.stringify(customGroups))
  }
}

export function deleteCustomGroup(groupName: string): void {
  const customGroups = getCustomGroups().filter((g) => g !== groupName)
  localStorage.setItem('customGroups', JSON.stringify(customGroups))

  // Also remove any business-group mappings using this group
  const businessGroupMappings = getBusinessGroupMappings()
  Object.keys(businessGroupMappings).forEach((business) => {
    if (businessGroupMappings[business] === groupName) {
      delete businessGroupMappings[business]
    }
  })
  localStorage.setItem('businessGroupMappings', JSON.stringify(businessGroupMappings))
}

export function getAllGroups(): string[] {
  return [...defaultGroups, ...getCustomGroups()]
}

// ==================== Business-Group Mapping ====================

export function getBusinessGroupMappings(): BusinessGroupMappings {
  const stored = localStorage.getItem('businessGroupMappings')
  return stored ? JSON.parse(stored) : {}
}

export function saveBusinessGroupMapping(businessName: string, groupName: string): void {
  const mappings = getBusinessGroupMappings()
  mappings[businessName] = groupName
  localStorage.setItem('businessGroupMappings', JSON.stringify(mappings))
}

export function getBusinessGroup(businessName: string): string {
  const customMappings = getBusinessGroupMappings()
  if (customMappings[businessName]) {
    return customMappings[businessName]
  }

  if (defaultBusinessGroupMapping[businessName]) {
    return defaultBusinessGroupMapping[businessName]
  }

  return 'Други'
}

// ==================== Settings Import/Export ====================

export function exportSettings(): SettingsData {
  return {
    version: '1.0',
    customBusinessMappings: require('../services/merchantMatcher').getCustomMappings(),
    customGroups: getCustomGroups(),
    businessGroupMappings: getBusinessGroupMappings(),
    exportDate: new Date().toISOString()
  }
}

export function importSettings(settingsData: SettingsData): boolean {
  try {
    if (!settingsData.version) {
      throw new Error('Invalid settings file format')
    }

    // Import custom business mappings
    if (settingsData.customBusinessMappings) {
      localStorage.setItem(
        'customBusinessMappings',
        JSON.stringify(settingsData.customBusinessMappings)
      )
    }

    // Import custom groups
    if (settingsData.customGroups) {
      localStorage.setItem('customGroups', JSON.stringify(settingsData.customGroups))
    }

    // Import business-group mappings
    if (settingsData.businessGroupMappings) {
      localStorage.setItem(
        'businessGroupMappings',
        JSON.stringify(settingsData.businessGroupMappings)
      )
    }

    return true
  } catch (error) {
    console.error('Error importing settings:', error)
    return false
  }
}

// ==================== Main Analysis Function ====================

/**
 * Main function to parse and analyze bank XML exports
 * This is the orchestrator that:
 * 1. Detects which bank the XML is from
 * 2. Delegates parsing to the appropriate bank adapter
 * 3. Runs analyzers (subscriptions, aggregations)
 * 4. Enriches results with group mappings
 */
export async function analyzeXML(xmlContent: string): Promise<AnalysisResult> {
  // Find the appropriate bank adapter
  const adapter = bankRegistry.findAdapter(xmlContent)

  if (!adapter) {
    throw new Error('Unsupported bank format. Currently supported: DSK Bank')
  }

  // Parse XML using bank-specific adapter
  const standardTransactions = await adapter.parseXML(xmlContent)

  // Calculate totals
  const { totalSpent, totalIncome, netBalance } = calculateTotals(standardTransactions)

  // Aggregate by month
  const monthlySpending = aggregateByMonth(standardTransactions)

  // Aggregate by business and enrich with group mappings
  const businessSpending = aggregateByBusiness(standardTransactions).map((business) => ({
    ...business,
    group: getBusinessGroup(business.name)
  }))

  // Detect subscriptions
  const subscriptions = detectSubscriptions(standardTransactions)

  // Sort transactions by date (most recent first)
  const transactions = [...standardTransactions].sort(
    (a, b) => b.dateObj.getTime() - a.dateObj.getTime()
  ) as Transaction[]

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
