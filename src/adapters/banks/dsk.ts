/**
 * DSK Bank (Банка ДСК) adapter
 * Parses DSK-specific XML format to StandardTransaction format
 */

import xml2js from 'xml2js'
import type { BankAdapter, StandardTransaction, ForeignCurrency } from '../../types/banking'
import { parseAmount, extractForeignCurrency } from '../../utils/currency'
import { parseDate, getMonthYear } from '../../utils/dateUtils'
import { getBusinessInfo } from '../../services/merchantMatcher'

export class DSKBankAdapter implements BankAdapter {
  readonly bankId = 'dsk'
  readonly bankName = 'Банка ДСК'

  /**
   * Check if XML is from DSK Bank
   * DSK uses <AccountMovements> root with <AccountMovement> children
   */
  canHandle(xmlContent: string): boolean {
    // Check for AccountMovements tag (with or without namespace)
    const hasAccountMovements =
      xmlContent.includes('<AccountMovements') || xmlContent.includes('AccountMovements>')

    const hasAccountMovement =
      xmlContent.includes('<AccountMovement>') || xmlContent.includes('<AccountMovement ')

    return hasAccountMovements && hasAccountMovement
  }

  /**
   * Extract foreign currency from DSK transaction reason field
   */
  extractForeignCurrency(transaction: any): ForeignCurrency | undefined {
    const reason = transaction.Reason?.[0]
    return extractForeignCurrency(reason)
  }

  /**
   * Parse DSK XML to standard transactions
   */
  async parseXML(xmlContent: string): Promise<StandardTransaction[]> {
    const parser = new xml2js.Parser()
    const result = await parser.parseStringPromise(xmlContent)

    const movements = result.AccountMovements.AccountMovement
    const transactions: StandardTransaction[] = []

    movements.forEach((movement: any) => {
      const amount = parseAmount(movement.Amount[0])
      const dateStr = movement.ValueDate[0]
      const date = parseDate(dateStr)
      const oppositeSideName = movement.OppositeSideName[0]
      const oppositeSideAccount = movement.OppositeSideAccount?.[0] || ''
      const movementType = movement.MovementType[0] as 'Debit' | 'Credit'
      // Extract reason - handle both string and object format
      const reasonRaw = movement.Reason[0] ?? ''
      const reason = typeof reasonRaw === 'string' ? reasonRaw : reasonRaw._ || ''
      const businessInfo = getBusinessInfo(oppositeSideName, reason)
      const monthYear = getMonthYear(date)

      // Extract foreign currency if available
      const foreignCurrency = extractForeignCurrency(reason)

      const transaction: StandardTransaction = {
        date: dateStr,
        dateObj: date,
        amount,
        movementType,
        oppositeSideName,
        oppositeSideAccount,
        businessName: businessInfo.name,
        // Exclude transfers from subscriptions
        canBeSubscription: businessInfo.canBeSubscription && !oppositeSideAccount,
        monthYear,
        reason,
        foreignCurrency
      }

      transactions.push(transaction)
    })

    return transactions
  }
}

/**
 * Export singleton instance
 */
export const dskAdapter = new DSKBankAdapter()
