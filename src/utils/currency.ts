/**
 * Currency-related utilities
 */

import type { ForeignCurrency } from '../types/banking'

/**
 * Extract foreign currency information from a text string
 * Looks for patterns like "14.99 USD" or "10,00 EUR"
 */
export function extractForeignCurrency(text: string | undefined): ForeignCurrency | undefined {
  if (!text || typeof text !== 'string') return undefined

  // Pattern: "NUMBER USD" or "NUMBER EUR"
  const match = text.match(/(\d+[,.]?\d*)\s*(USD|EUR|GBP)/i)

  if (match) {
    const amount = parseFloat(match[1].replace(',', '.'))
    const currency = match[2].toUpperCase()
    return { amount, currency }
  }

  return undefined
}

/**
 * Parse amount from string format (e.g., "18,20" -> 18.20)
 */
export function parseAmount(amountStr: string): number {
  return parseFloat(amountStr.replace(',', '.'))
}

/**
 * Format currency in Bulgarian format
 */
export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} лв.`
}
