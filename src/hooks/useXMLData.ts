import { useState } from 'react'
import { analyzeXML } from '../utils/xmlParser'
import type { AnalysisResult } from '../types'

export function useXMLData() {
  const [data, setData] = useState<AnalysisResult | null>(null)
  const [xmlContent, setXmlContent] = useState<string | null>(null)

  const loadXML = async (xmlText: string) => {
    try {
      setXmlContent(xmlText)
      const result = await analyzeXML(xmlText)
      setData(result)
      return { success: true }
    } catch (error) {
      console.error('Error parsing XML:', error)
      return { success: false, error }
    }
  }

  const reanalyzeData = async () => {
    if (xmlContent) {
      const result = await analyzeXML(xmlContent)
      setData(result)
    }
  }

  return {
    data,
    xmlContent,
    loadXML,
    reanalyzeData
  }
}
