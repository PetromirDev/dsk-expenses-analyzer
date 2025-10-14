import { useState, ChangeEvent } from 'react'
import { toast } from 'sonner'
import { getAllGroups, getBusinessGroupMappings, getCustomGroups } from './utils/xmlParser'
import { useXMLData } from './hooks/useXMLData'
import { useBusinessEditor } from './hooks/useBusinessEditor'
import { useGroupEditor } from './hooks/useGroupEditor'
import { useSettings } from './hooks/useSettings'
import { createFileInputHandler, fetchDemoFile } from './helpers/fileHelpers'
import { filterData } from './helpers/dataHelpers'
import { Header } from './components/Header'
import { InfoBanner } from './components/InfoBanner'
import { UploadSection } from './components/UploadSection'
import { DataTable } from './components/DataTable'
import { SettingsPanel } from './components/SettingsPanel'
import { SubscriptionsTab } from './components/SubscriptionsTab'
import { MonthlyChart } from './components/MonthlyChart'
import { BusinessFilters } from './components/BusinessFilters'
import { AddGroupModal } from './components/AddGroupModal'
import { Footer } from './components/Footer'

function App() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'business' | 'subscriptions' | 'settings'
  >('overview')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterGroup, setFilterGroup] = useState<string>('')
  const [showAddGroupModal, setShowAddGroupModal] = useState(false)

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
        toast.error('Грешка при четене на файла. Моля, уверете се, че файлът е валиден XML от ДСК.')
      }
    },
    (error) => {
      toast.error('Грешка при четене на файла. Моля, уверете се, че файлът е валиден XML от ДСК.')
      console.error('Error parsing XML:', error)
    }
  )

  const handleLoadDemo = async () => {
    try {
      const text = await fetchDemoFile()
      await loadXML(text)
    } catch (error) {
      toast.error('Грешка при зареждане на Demo файла.')
      console.error('Error loading demo:', error)
    }
  }

  const handleImportSettings = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const result = await settings.handleImportSettings(text)
      toast.success(result.message)
    } catch (error) {
      toast.error('Невалиден файл с настройки.')
      console.error('Error importing settings:', error)
    }

    // Reset file input
    event.target.value = ''
  }

  // Get filtered data
  const getFilteredData = () => {
    if (!data) return []

    if (activeTab === 'overview') {
      return filterData(data.monthlySpending, searchTerm, 'overview')
    } else {
      // Filter by search term
      let filtered = filterData(data.businessSpending, searchTerm, 'business')

      // Filter by group if selected
      if (filterGroup && Array.isArray(filtered) && filtered.length > 0 && 'group' in filtered[0]) {
        filtered = filtered.filter((item: any) => item.group === filterGroup)
      }

      return filtered
    }
  }

  const filteredData = getFilteredData()

  const filteredTotal = filteredData.reduce((sum, item) => sum + item.amount, 0)

  const handleAddGroup = () => {
    setShowAddGroupModal(true)
  }

  const handleSaveNewGroup = () => {
    const success = groupEditor.addCustomGroup()
    if (success) {
      groupEditor.setNewGroupName('')
    }
    return success
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InfoBanner />

        {/* Upload Section */}
        {!data && <UploadSection onFileUpload={handleFileUpload} onLoadDemo={handleLoadDemo} />}

        {/* Data Display */}
        {data && (
          <>
            {/* Centered Tab Navigation */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="flex justify-center p-2 overflow-x-auto">
                <div className="inline-flex gap-1 p-1 bg-gray-100 rounded-lg min-w-max">
                  <button
                    onClick={() => {
                      setActiveTab('overview')
                      setSearchTerm('')
                      setFilterGroup('')
                    }}
                    className={`px-2 sm:px-6 py-2 sm:py-2.5 rounded-md font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                      activeTab === 'overview'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Оглед
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('business')
                      setSearchTerm('')
                      setFilterGroup('')
                    }}
                    className={`px-2 sm:px-6 py-2 sm:py-2.5 rounded-md font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                      activeTab === 'business'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    По търговци
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('subscriptions')
                      setSearchTerm('')
                      setFilterGroup('')
                    }}
                    className={`relative px-2 sm:px-6 py-2 sm:py-2.5 rounded-md font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                      activeTab === 'subscriptions'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Абонаменти
                    {data.subscriptions.length > 0 && (
                      <span className="ml-1 sm:ml-1.5 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-[10px] sm:text-xs font-bold text-white bg-indigo-600 rounded-full">
                        {data.subscriptions.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('settings')
                      setSearchTerm('')
                      setFilterGroup('')
                    }}
                    className={`px-2 sm:px-6 py-2 sm:py-2.5 rounded-md font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                      activeTab === 'settings'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Настройки
                  </button>
                </div>
              </div>
            </div>

            {/* Business Filters - Only show on business tab */}
            {activeTab === 'business' && (
              <BusinessFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedGroup={filterGroup}
                onGroupChange={setFilterGroup}
                allGroups={getAllGroups()}
                onAddGroup={handleAddGroup}
                filteredTotal={filteredTotal}
              />
            )}

            {/* Add Group Modal */}
            <AddGroupModal
              isOpen={showAddGroupModal}
              onClose={() => setShowAddGroupModal(false)}
              groupName={groupEditor.newGroupName}
              onGroupNameChange={groupEditor.setNewGroupName}
              onSave={handleSaveNewGroup}
            />

            {/* Monthly Transactions Tab */}
            {activeTab === 'overview' && (
              <>
                <MonthlyChart data={data.monthlyChartData} />
                <DataTable
                  data={filteredData}
                  selectedView="overview"
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
                data={filteredData}
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

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <SettingsPanel
                customMappings={settings.getCustomMappings()}
                onDeleteMapping={settings.deleteMapping}
                businessGroupMappings={getBusinessGroupMappings()}
                onFileUpload={handleFileUpload}
                onExportSettings={settings.handleExportSettings}
                onImportSettings={handleImportSettings}
                customGroups={getCustomGroups()}
                onDeleteGroup={groupEditor.deleteGroup}
              />
            )}
          </>
        )}
      </div>

      {data && <Footer />}
    </div>
  )
}

export default App
