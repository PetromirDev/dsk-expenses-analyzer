import { useState, ChangeEvent } from 'react'
import { Search } from 'lucide-react'
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
import { DataTable } from './components/DataTable'
import { ActionButtons } from './components/ActionButtons'
import { SettingsPanel } from './components/SettingsPanel'
import { SubscriptionsTab } from './components/SubscriptionsTab'
import { MonthlyChart } from './components/MonthlyChart'
import { Footer } from './components/Footer'

function App() {
  const [activeTab, setActiveTab] = useState<'month' | 'business' | 'subscriptions'>('month')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Custom hooks
  const { data, loadXML, reanalyzeData, reanalyzeWithBusinessUpdates } = useXMLData()
  const businessEditor = useBusinessEditor(reanalyzeWithBusinessUpdates)
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
    const dataSource = activeTab === 'month' ? data.monthlySpending : data.businessSpending
    return filterData(dataSource, searchTerm, activeTab === 'month' ? 'month' : 'business')
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

            {/* Tab Navigation & Search - Single Compact Row */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                {/* Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('month')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                      activeTab === 'month'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    По месеци
                  </button>
                  <button
                    onClick={() => setActiveTab('business')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                      activeTab === 'business'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    По търговци
                  </button>
                  <button
                    onClick={() => setActiveTab('subscriptions')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                      activeTab === 'subscriptions'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Абонаменти
                    {data.subscriptions.length > 0 && (
                      <span
                        className={`ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          activeTab === 'subscriptions'
                            ? 'bg-white text-indigo-600'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {data.subscriptions.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Search - only show on transaction tabs */}
                {activeTab !== 'subscriptions' && (
                  <div className="relative w-full sm:w-64">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Търсене..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Transactions Tab */}
            {activeTab === 'month' && (
              <>
                <MonthlyChart data={data.monthlyChartData} />
                <DataTable
                  data={getFilteredData()}
                  selectedView="month"
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
              </>
            )}

            {/* Business Transactions Tab */}
            {activeTab === 'business' && (
              <DataTable
                data={getFilteredData()}
                selectedView="business"
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
            )}

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <SubscriptionsTab subscriptions={data.subscriptions} />
            )}

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
