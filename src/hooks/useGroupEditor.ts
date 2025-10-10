import { useState } from 'react'
import { saveBusinessGroupMapping, saveCustomGroup, deleteCustomGroup } from '../utils/xmlParser'
import type { BusinessSpending } from '../types'

export function useGroupEditor(reanalyzeData: () => Promise<void>) {
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState('')
  const [newGroupName, setNewGroupName] = useState('')

  const startGroupEdit = (businessItem: BusinessSpending) => {
    setEditingGroup(businessItem.name)
    setSelectedGroup(businessItem.group)
  }

  const saveGroup = async (businessName: string) => {
    if (!selectedGroup) return

    saveBusinessGroupMapping(businessName, selectedGroup)
    await reanalyzeData()
    setEditingGroup(null)
    setSelectedGroup('')
  }

  const addCustomGroup = () => {
    if (!newGroupName.trim()) return

    saveCustomGroup(newGroupName.trim())
    setNewGroupName('')
    reanalyzeData()
  }

  const deleteGroup = (groupName: string) => {
    if (window.confirm(`Сигурни ли сте, че искате да изтриете групата "${groupName}"?`)) {
      deleteCustomGroup(groupName)
      reanalyzeData()
    }
  }

  const cancelGroupEdit = () => {
    setEditingGroup(null)
    setSelectedGroup('')
  }

  return {
    editingGroup,
    selectedGroup,
    newGroupName,
    setSelectedGroup,
    setNewGroupName,
    startGroupEdit,
    saveGroup,
    addCustomGroup,
    deleteGroup,
    cancelGroupEdit
  }
}
