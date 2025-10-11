import { useState } from 'react'
import { toast } from 'sonner'
import {
  saveBusinessGroupMapping,
  saveCustomGroup,
  deleteCustomGroup,
  getAllGroups
} from '../utils/xmlParser'
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
    const trimmedName = newGroupName.trim()
    if (!trimmedName) return false

    const allGroups = getAllGroups()
    if (allGroups.some((g) => g.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error(`Група с името "${trimmedName}" вече съществува.`)
      return false
    }

    saveCustomGroup(trimmedName)
    toast.success(`Групата "${trimmedName}" беше добавена успешно.`)
    setNewGroupName('')
    reanalyzeData()
    return true
  }

  const cancelGroupEdit = () => {
    setEditingGroup(null)
    setSelectedGroup('')
  }

  const deleteGroup = (groupName: string) => {
    if (window.confirm(`Сигурни ли сте, че искате да изтриете групата "${groupName}"?`)) {
      deleteCustomGroup(groupName)
      toast.success(`Групата "${groupName}" беше изтрита успешно.`)
      reanalyzeData()
    }
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
    cancelGroupEdit,
    deleteGroup
  }
}
