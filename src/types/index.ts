// Type definitions for merchants.json and analysis data

export interface Merchant {
  id: string
  patterns: string[]
  name: string
  category: string
}

export interface MerchantsConfig {
  [category: string]: Merchant[]
}

export interface Transaction {
  date: string
  dateObj: Date
  amount: number
  oppositeSideName: string
  businessName: string
  movementType: 'Debit' | 'Credit'
  monthYear: string
  reason: string
}

export interface MonthlySpending {
  month: string
  amount: number
  transactions: Transaction[]
}

export interface BusinessSpending {
  name: string
  originalNames: string[]
  group: string
  amount: number
  transactions: Transaction[]
}

export interface AnalysisResult {
  totalSpent: number
  totalIncome: number
  netBalance: number
  monthlySpending: MonthlySpending[]
  businessSpending: BusinessSpending[]
  transactions: Transaction[]
  unmappedBusinesses?: string[]
}

export interface CustomMappings {
  [originalName: string]: string
}

export interface BusinessGroupMappings {
  [businessName: string]: string
}

export interface SettingsData {
  version: string
  customBusinessMappings: CustomMappings
  customGroups: string[]
  businessGroupMappings: BusinessGroupMappings
  exportDate: string
}

export interface MerchantDatabase {
  [id: string]: Merchant
}
