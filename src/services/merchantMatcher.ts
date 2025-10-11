/**
 * Merchant matching and business name resolution service
 */

import merchantsConfig from '../data/merchants.json'
import type { MerchantDatabase, CustomMappings } from '../types'
import { normalizeText, cleanBusinessName } from '../utils/textNormalization'

// Build merchant database from JSON config
export const merchantDatabase: MerchantDatabase = Object.values(merchantsConfig)
  .flat()
  .reduce((acc, merchant) => {
    acc[merchant.id] = merchant
    return acc
  }, {} as MerchantDatabase)

/**
 * Get custom mappings from localStorage
 */
export function getCustomMappings(): CustomMappings {
  const stored = localStorage.getItem('customBusinessMappings')
  return stored ? JSON.parse(stored) : {}
}

/**
 * Save custom mapping to localStorage
 */
export function saveCustomMapping(originalName: string, newName: string): void {
  const customMappings = getCustomMappings()
  customMappings[originalName] = newName
  localStorage.setItem('customBusinessMappings', JSON.stringify(customMappings))
}

/**
 * Get business name and subscription eligibility from merchant name
 * This is the core merchant matching logic
 */
export function getBusinessInfo(oppositeSideName: string): {
  name: string
  canBeSubscription: boolean
} {
  if (!oppositeSideName || oppositeSideName.trim() === '') {
    return { name: 'Без име', canBeSubscription: true }
  }

  // Normalize the input (transliterate Cyrillic to Latin and uppercase)
  const normalizedInput = normalizeText(oppositeSideName)

  // First priority: Check exact custom mappings
  const customMappings = getCustomMappings()
  if (customMappings[oppositeSideName]) {
    // Custom mappings are always eligible for subscriptions
    return { name: customMappings[oppositeSideName], canBeSubscription: true }
  }

  // Second priority: Check merchantDatabase with pattern matching
  // Sort merchants by longest pattern first for better matching
  const merchants = Object.values(merchantDatabase)
  const sortedMerchants = merchants.sort((a, b) => {
    const maxLengthA = Math.max(...a.patterns.map((p) => p.length))
    const maxLengthB = Math.max(...b.patterns.map((p) => p.length))
    return maxLengthB - maxLengthA
  })

  for (const merchant of sortedMerchants) {
    for (const pattern of merchant.patterns) {
      const normalizedPattern = normalizeText(pattern)

      // Check if the normalized pattern is in the normalized input
      if (normalizedInput.includes(normalizedPattern)) {
        // Use merchant's canBeSubscription flag, default to false if not set
        return {
          name: merchant.name,
          canBeSubscription: !!merchant.canBeSubscription
        }
      }
    }
  }

  // If no mapping found, clean up the name and allow as subscription (unknown merchant)
  return { name: cleanBusinessName(oppositeSideName), canBeSubscription: true }
}

/**
 * Legacy function for backward compatibility
 */
export function getBusinessName(oppositeSideName: string): string {
  const result = getBusinessInfo(oppositeSideName)
  return result.name
}
