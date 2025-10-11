import { useState } from 'react'
import { exportSettings, importSettings } from '../utils/xmlParser'
import type { CustomMappings } from '../types'
import { toast } from 'sonner'

export function useSettings(reanalyzeData: () => Promise<void>) {
  const [showSettings, setShowSettings] = useState(false)

  const handleExportSettings = () => {
    try {
      const settings = exportSettings()
      const dataStr = JSON.stringify(settings, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dsk-analyzer-settings-${new Date().toISOString().split('T')[0]}.json`

      // Append to body, click, and then remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Revoke URL after a short delay to ensure the download starts
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } catch (error) {
      toast.error('Грешка при експортиране на настройките.')
      console.error('Error exporting settings:', error)
    }
  }

  const handleImportSettings = async (text: string) => {
    try {
      const settings = JSON.parse(text)
      const success = importSettings(settings)

      if (success) {
        await reanalyzeData()
        return { success: true, message: 'Настройките бяха успешно импортирани!' }
      } else {
        return { success: false, message: 'Грешка при импортиране на настройките.' }
      }
    } catch (error) {
      console.error('Error importing settings:', error)
      return { success: false, message: 'Невалиден файл с настройки.' }
    }
  }

  const getCustomMappings = (): CustomMappings => {
    const stored = localStorage.getItem('customBusinessMappings')
    return stored ? JSON.parse(stored) : {}
  }

  const deleteMapping = (originalName: string) => {
    const customMappings = getCustomMappings()
    delete customMappings[originalName]
    localStorage.setItem('customBusinessMappings', JSON.stringify(customMappings))
    reanalyzeData()
  }

  return {
    showSettings,
    setShowSettings,
    handleExportSettings,
    handleImportSettings,
    getCustomMappings,
    deleteMapping
  }
}
