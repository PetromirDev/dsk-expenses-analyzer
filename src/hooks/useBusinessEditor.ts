import { useState } from 'react'
import { saveCustomMapping } from '../utils/xmlParser'
import type { BusinessSpending } from '../types'

export function useBusinessEditor(reanalyzeData: () => Promise<void>) {
  const [editingBusiness, setEditingBusiness] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const startEdit = (businessItem: BusinessSpending) => {
    setEditingBusiness(businessItem.name)
    setEditValue(businessItem.name)
  }

  const saveEdit = async (businessSpending: BusinessSpending[]) => {
    if (!editingBusiness || !editValue.trim()) return

    const newName = editValue.trim()
    const businessItem = businessSpending.find((b) => b.name === editingBusiness)

    if (businessItem) {
      // Save all original names to the new mapped name
      businessItem.originalNames.forEach((originalName) => {
        saveCustomMapping(originalName, newName)
      })

      await reanalyzeData()
    }

    setEditingBusiness(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingBusiness(null)
    setEditValue('')
  }

  return {
    editingBusiness,
    editValue,
    setEditValue,
    startEdit,
    saveEdit,
    cancelEdit
  }
}
