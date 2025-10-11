/**
 * Common banking interfaces for multi-bank support
 * These types represent a standardized format that all bank adapters should convert to
 */

/**
 * Foreign currency information extracted from transaction details
 */
export interface ForeignCurrency {
  amount: number
  currency: 'USD' | 'EUR' | 'GBP' | string
}

/**
 * Standard transaction format that all banks convert to
 */
export interface StandardTransaction {
  // Core transaction data
  date: string // Original date string
  dateObj: Date // Parsed date object
  amount: number // Amount in local currency (BGN)
  movementType: 'Debit' | 'Credit'

  // Merchant/counterparty information
  oppositeSideName: string // Raw merchant/counterparty name
  oppositeSideAccount: string // Bank account if available

  // Processed business information
  businessName: string // Cleaned/mapped business name
  canBeSubscription: boolean // Whether this business can be a subscription

  // Additional metadata
  monthYear: string // Formatted month-year for grouping
  reason: string // Transaction description/reason
  foreignCurrency?: ForeignCurrency // Foreign currency if available
}

/**
 * Bank adapter interface - each bank implements this
 */
export interface BankAdapter {
  /**
   * Unique identifier for the bank
   */
  readonly bankId: string

  /**
   * Human-readable bank name
   */
  readonly bankName: string

  /**
   * Detect if an XML file belongs to this bank
   */
  canHandle(xmlContent: string): boolean

  /**
   * Parse bank-specific XML to standard transaction format
   */
  parseXML(xmlContent: string): Promise<StandardTransaction[]>

  /**
   * Extract foreign currency from bank-specific format
   */
  extractForeignCurrency(transaction: any): ForeignCurrency | undefined
}

/**
 * Raw analysis result before any processing
 */
export interface StandardAnalysisResult {
  transactions: StandardTransaction[]
  totalSpent: number
  totalIncome: number
  netBalance: number
}
