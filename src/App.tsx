import { useState, ChangeEvent } from 'react'
import { getAllGroups, getBusinessGroupMappings } from './utils/xmlParser'
import { useXMLData } from './hooks/useXMLData'
import { useBusinessEditor } from './hooks/useBusinessEditor'
import { useGroupEditor } from './hooks/useGroupEditor'
import { useSettings } from './hooks/useSettings'
import { createFileInputHandler, fetchDemoFile } from './helpers/fileHelpers'
import { filterData } from './helpers/dataHelpers'
import { Header } from './components/Header'
import { InfoBanner } from './components/InfoBanner'
import { UploadSection } from './components/UploadSection'
import { SummaryCards } from './components/SummaryCards'
import { Controls } from './components/Controls'
import { DataTable } from './components/DataTable'
import { ActionButtons } from './components/ActionButtons'
import { SettingsPanel } from './components/SettingsPanel'
import { Footer } from './components/Footer'

function App() {
  const [selectedView, setSelectedView] = useState<'month' | 'business'>('month')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Custom hooks
  const { data, loadXML, reanalyzeData } = useXMLData()
  const businessEditor = useBusinessEditor(reanalyzeData)
  const groupEditor = useGroupEditor(reanalyzeData)
  const settings = useSettings(reanalyzeData)

  // File upload handlers
  const handleFileUpload = createFileInputHandler(
    async (text) => {
      const result = await loadXML(text)
      if (!result.success) {
        alert('Грешка при четене на файла. Моля, уверете се, че файлът е валиден XML от ДСК.')
      }
    },
    (error) => {
      alert('Грешка при четене на файла. Моля, уверете се, че файлът е валиден XML от ДСК.')
      console.error('Error parsing XML:', error)
    }
  )

  const handleLoadDemo = async () => {
    try {
      const text = await fetchDemoFile()
      await loadXML(text)
    } catch (error) {
      alert('Грешка при зареждане на Demo файла.')
      console.error('Error loading demo:', error)
    }
  }

  const handleImportSettings = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const result = await settings.handleImportSettings(text)
      alert(result.message)
    } catch (error) {
      alert('Невалиден файл с настройки.')
      console.error('Error importing settings:', error)
    }

    // Reset file input
    event.target.value = ''
  }

  // Get filtered data
  const getFilteredData = () => {
    if (!data) return []
    const dataSource = selectedView === 'month' ? data.monthlySpending : data.businessSpending
    return filterData(dataSource, searchTerm, selectedView)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InfoBanner />

        {/* Upload Section */}
        {!data && <UploadSection onFileUpload={handleFileUpload} onLoadDemo={handleLoadDemo} />}

        {/* Data Display */}
        {data && (
          <>
            <SummaryCards
              totalIncome={data.totalIncome}
              totalSpent={data.totalSpent}
              netBalance={data.netBalance}
            />

            <Controls
              selectedView={selectedView}
              onViewChange={setSelectedView}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            <DataTable
              data={getFilteredData()}
              selectedView={selectedView}
              editingBusiness={businessEditor.editingBusiness}
              editValue={businessEditor.editValue}
              onEditValueChange={businessEditor.setEditValue}
              onSaveEdit={() => businessEditor.saveEdit(data.businessSpending)}
              onCancelEdit={businessEditor.cancelEdit}
              onStartEdit={businessEditor.startEdit}
              editingGroup={groupEditor.editingGroup}
              selectedGroup={groupEditor.selectedGroup}
              onGroupChange={groupEditor.setSelectedGroup}
              onSaveGroup={groupEditor.saveGroup}
              onCancelGroupEdit={groupEditor.cancelGroupEdit}
              onStartGroupEdit={groupEditor.startGroupEdit}
              allGroups={getAllGroups()}
            />

            <ActionButtons
              onFileUpload={handleFileUpload}
              showSettings={settings.showSettings}
              onToggleSettings={() => settings.setShowSettings(!settings.showSettings)}
              onExportSettings={settings.handleExportSettings}
              onImportSettings={handleImportSettings}
            />

            <SettingsPanel
              showSettings={settings.showSettings}
              customMappings={settings.getCustomMappings()}
              onDeleteMapping={settings.deleteMapping}
              newGroupName={groupEditor.newGroupName}
              onNewGroupNameChange={groupEditor.setNewGroupName}
              onAddCustomGroup={groupEditor.addCustomGroup}
              onDeleteCustomGroup={groupEditor.deleteGroup}
              allGroups={getAllGroups()}
              businessGroupMappings={getBusinessGroupMappings()}
            />
          </>
        )}
      </div>

      {data && <Footer />}
    </div>
  )
}

export default App
