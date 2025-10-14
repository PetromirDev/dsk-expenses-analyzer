import { useState } from 'react'
import { analyzeXML } from '../utils/xmlParser'
import { recomputeAnalysis, updateBusinessNamesInTransactions } from '../utils/recomputeAnalysis'
import { getBusinessInfo } from '../services/merchantMatcher'
import type { AnalysisResult, Transaction } from '../types'

export function useXMLData() {
  const [data, setData] = useState<AnalysisResult | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const loadXML = async (xmlText: string) => {
    try {
      // Parse XML ONCE - this is the only slow operation
      const result = await analyzeXML(xmlText)
      setTransactions(result.transactions)
      setData(result)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return { success: true }
    } catch (error) {
      console.error('Error parsing XML:', error)
      return { success: false, error }
    }
  }

  /**
   * Fast reanalysis - just re-aggregates existing transactions
   * Use for: group changes, settings updates
   */
  const reanalyzeData = async () => {
    if (transactions.length === 0) return

    // FAST: Just re-aggregate existing transactions (no XML parsing)
    const result = recomputeAnalysis(transactions)
    setData(result)
  }

  /**
   * Reanalysis with business name updates
   * Use for: custom business name mappings
   */
  const reanalyzeWithBusinessUpdates = async () => {
    if (transactions.length === 0) return

    // Update business names based on new custom mappings
    const updatedTransactions = updateBusinessNamesInTransactions(transactions, getBusinessInfo)
    setTransactions(updatedTransactions)

    // Then recompute aggregations
    const result = recomputeAnalysis(updatedTransactions)
    setData(result)
  }

  const reset = () => {
    setData(null)
    setTransactions([])
  }

  return {
    data,
    reset,
    loadXML,
    reanalyzeData,
    reanalyzeWithBusinessUpdates
  }
}
