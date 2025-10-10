import { useState } from 'react'
import { Upload, Search, Edit2, Github, Shield, Database, Trash2, Download, FolderOpen, Plus, Tag } from 'lucide-react'
import { 
  analyzeXML, 
  formatCurrency, 
  saveCustomMapping,
  getAllGroups,
  saveCustomGroup,
  deleteCustomGroup,
  saveBusinessGroupMapping,
  exportSettings,
  importSettings,
  getBusinessGroupMappings
} from './utils/xmlParser'

function App() {
  const [data, setData] = useState(null)
  const [selectedView, setSelectedView] = useState('month') // 'month' or 'business'
  const [searchTerm, setSearchTerm] = useState('')
  const [editingBusiness, setEditingBusiness] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [xmlContent, setXmlContent] = useState(null) // Store XML for re-parsing
  const [editingGroup, setEditingGroup] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      setXmlContent(text) // Store the XML
      const result = await analyzeXML(text)
      setData(result)
    } catch (error) {
      alert('Грешка при четене на файла. Моля, уверете се, че файлът е валиден XML от ДСК.')
      console.error('Error parsing XML:', error)
    }
  }

  const reanalyzeData = async () => {
    if (xmlContent) {
      const result = await analyzeXML(xmlContent)
      setData(result)
    }
  }

  const handleEditBusiness = (businessItem) => {
    setEditingBusiness(businessItem.name)
    setEditValue(businessItem.name)
  }

  const handleSaveEdit = async () => {
    if (!editingBusiness || !editValue.trim()) return

    const newName = editValue.trim()
    const businessItem = data.businessSpending.find((b) => b.name === editingBusiness)

    if (businessItem) {
      // Save all original names to the new mapped name
      businessItem.originalNames.forEach((originalName) => {
        saveCustomMapping(originalName, newName)
      })

      // Re-analyze to merge everything properly
      await reanalyzeData()
    }

    setEditingBusiness(null)
    setEditValue('')
  }

  const handleDeleteMapping = (originalName) => {
    const customMappings = getCustomMappings()
    delete customMappings[originalName]
    localStorage.setItem('customBusinessMappings', JSON.stringify(customMappings))
    reanalyzeData()
  }

  const handleEditGroup = (businessItem) => {
    setEditingGroup(businessItem.name)
    setSelectedGroup(businessItem.group)
  }

  const handleSaveGroup = async (businessName) => {
    if (!selectedGroup) return
    
    saveBusinessGroupMapping(businessName, selectedGroup)
    await reanalyzeData()
    setEditingGroup(null)
    setSelectedGroup('')
  }

  const handleAddCustomGroup = () => {
    if (!newGroupName.trim()) return
    
    saveCustomGroup(newGroupName.trim())
    setNewGroupName('')
    reanalyzeData()
  }

  const handleDeleteCustomGroup = (groupName) => {
    if (window.confirm(`Сигурни ли сте, че искате да изтриете групата "${groupName}"?`)) {
      deleteCustomGroup(groupName)
      reanalyzeData()
    }
  }

  const handleExportSettings = () => {
    const settings = exportSettings()
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dsk-analyzer-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportSettings = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const settings = JSON.parse(text)
      const success = importSettings(settings)
      
      if (success) {
        await reanalyzeData()
        alert('Настройките бяха успешно импортирани!')
      } else {
        alert('Грешка при импортиране на настройките.')
      }
    } catch (error) {
      alert('Невалиден файл с настройки.')
      console.error('Error importing settings:', error)
    }
    
    // Reset file input
    event.target.value = ''
  }

  const getCustomMappings = () => {
    const stored = localStorage.getItem('customBusinessMappings')
    return stored ? JSON.parse(stored) : {}
  }

  const getFilteredData = () => {
    if (!data) return []

    const dataSource = selectedView === 'month' ? data.monthlySpending : data.businessSpending

    if (!searchTerm.trim()) return dataSource

    return dataSource.filter((item) => {
      const searchIn = selectedView === 'month' ? item.month : item.name
      return searchIn.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ДСК Анализатор</h1>
              <p className="text-sm text-gray-600 mt-1">Анализ на банкови движения</p>
            </div>
            <a
              href="https://github.com/PetromirDev/dsk-expenses-analyzer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github size={20} />
              <span className="hidden lg:inline">Source Code (за да питаш ChatGPT дали има вируси)</span>
            </a>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                🔒 Пълна поверителност и сигурност
              </h3>
              <p className="text-sm text-blue-800">
                Всички данни се обработват <strong>локално на вашия компютър</strong>. Никаква
                информация не се изпраща към сървъри. Приложението работи само с банка{' '}
                <strong>ДСК</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        {!data && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="text-indigo-600" size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Качете XML файл</h2>
                <p className="text-gray-600 mb-6">
                  Изберете XML файл с банкови движения от ДСК банка
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  Как да изтеглите XML файла:
                </h3>
                <ol className="space-y-3 text-sm text-blue-800">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <span>
                      Влезте на{' '}
                      <a
                        href="https://dskdirect.bg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline hover:text-blue-600"
                      >
                        dskdirect.bg
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <span>Изберете раздел "Средства" от навигацията</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <span>Скролнете до сметката, която искате да анализирате</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    <span>Натиснете върху "Движения"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      5
                    </span>
                    <span>Изберете желания период и натиснете "Покажи"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      6
                    </span>
                    <span>Изтеглете файла във формат <strong>XML</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      7
                    </span>
                    <span>Качете изтегления файл тук 👇</span>
                  </li>
                </ol>
              </div>

              {/* Upload Button */}
              <div className="text-center">
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".xml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <span className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg cursor-pointer inline-flex items-center gap-2 transition-colors">
                    <Database size={20} />
                    Избери файл
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Data Display */}
        {data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Общо приходи</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.totalIncome)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Общо разходи</h3>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(data.totalSpent)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Нетен баланс</h3>
                <p
                  className={`text-2xl font-bold ${data.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatCurrency(data.netBalance)}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedView('month')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedView === 'month'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    По месец
                  </button>
                  <button
                    onClick={() => setSelectedView('business')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedView === 'business'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    По търговец
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Търсене..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {selectedView === 'month' ? 'Месец' : 'Търговец'}
                      </th>
                      {selectedView === 'business' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Група
                        </th>
                      )}
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Сума
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Транзакции
                      </th>
                      {selectedView === 'business' && (
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Действия
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getFilteredData().map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          {editingBusiness === item.name ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleSaveEdit}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit()
                                if (e.key === 'Escape') {
                                  setEditingBusiness(null)
                                  setEditValue('')
                                }
                              }}
                              autoFocus
                              className="w-full px-2 py-1 border border-indigo-500 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          ) : (
                            <div className="font-medium text-gray-900">
                              {selectedView === 'month' ? item.month : item.name}
                            </div>
                          )}
                        </td>
                        {selectedView === 'business' && (
                          <td className="px-6 py-4">
                            {editingGroup === item.name ? (
                              <select
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                onBlur={() => handleSaveGroup(item.name)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveGroup(item.name)
                                  if (e.key === 'Escape') {
                                    setEditingGroup(null)
                                    setSelectedGroup('')
                                  }
                                }}
                                autoFocus
                                className="w-full px-2 py-1 border border-indigo-500 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                              >
                                {getAllGroups().map((group) => (
                                  <option key={group} value={group}>
                                    {group}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <button
                                onClick={() => handleEditGroup(item)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                              >
                                <Tag size={12} />
                                {item.group}
                              </button>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-red-600">
                            {formatCurrency(item.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          {item.transactions.length}
                        </td>
                        {selectedView === 'business' && (
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleEditBusiness(item)}
                              disabled={editingBusiness !== null}
                              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Edit2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {getFilteredData().length === 0 && (
                  <div className="text-center py-12 text-gray-500">Няма намерени резултати</div>
                )}
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {getFilteredData().length === 0 ? (
                  <div className="text-center py-12 text-gray-500">Няма намерени резултати</div>
                ) : (
                  getFilteredData().map((item, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0 pr-2">
                          {editingBusiness === item.name ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleSaveEdit}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit()
                                if (e.key === 'Escape') {
                                  setEditingBusiness(null)
                                  setEditValue('')
                                }
                              }}
                              autoFocus
                              className="w-full px-2 py-1 border border-indigo-500 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                          ) : (
                            <h3 className="font-medium text-gray-900 break-words">
                              {selectedView === 'month' ? item.month : item.name}
                            </h3>
                          )}
                        </div>
                        {selectedView === 'business' && (
                          <button
                            onClick={() => handleEditBusiness(item)}
                            disabled={editingBusiness !== null}
                            className="flex-shrink-0 p-2 text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </div>
                      {selectedView === 'business' && (
                        <div className="mb-2">
                          {editingGroup === item.name ? (
                            <select
                              value={selectedGroup}
                              onChange={(e) => setSelectedGroup(e.target.value)}
                              onBlur={() => handleSaveGroup(item.name)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveGroup(item.name)
                                if (e.key === 'Escape') {
                                  setEditingGroup(null)
                                  setSelectedGroup('')
                                }
                              }}
                              autoFocus
                              className="w-full px-2 py-1 border border-indigo-500 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            >
                              {getAllGroups().map((group) => (
                                <option key={group} value={group}>
                                  {group}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <button
                              onClick={() => handleEditGroup(item)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                            >
                              <Tag size={12} />
                              {item.group}
                            </button>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-4 text-sm flex-wrap">
                        <span className="text-gray-600 whitespace-nowrap">
                          {item.transactions.length} транзакции
                        </span>
                        <span className="font-semibold text-red-600 text-base break-all">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upload New File Button */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <label>
                <input type="file" accept=".xml" onChange={handleFileUpload} className="hidden" />
                <span className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors">
                  <Upload size={18} />
                  Качи нов файл
                </span>
              </label>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <FolderOpen size={18} />
                {showSettings ? 'Скрий настройки' : 'Настройки'}
              </button>

              <button
                onClick={handleExportSettings}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Download size={18} />
                Експорт
              </button>

              <label>
                <input type="file" accept=".json" onChange={handleImportSettings} className="hidden" />
                <span className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors">
                  <Upload size={18} />
                  Импорт
                </span>
              </label>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="mt-8 space-y-6">
                {/* Custom Groups Management */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-purple-50 border-b border-purple-100 px-4 sm:px-6 py-4">
                    <h3 className="text-lg font-semibold text-purple-900">Персонализирани групи</h3>
                    <p className="text-sm text-purple-700 mt-1">
                      Създайте собствени групи за класификация на разходите
                    </p>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    {/* Add New Group */}
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddCustomGroup()
                        }}
                        placeholder="Име на нова група..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                      <button
                        onClick={handleAddCustomGroup}
                        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        <Plus size={18} />
                        Добави
                      </button>
                    </div>

                    {/* List of Custom Groups */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Всички групи:</h4>
                      <div className="flex flex-wrap gap-2">
                        {getAllGroups().map((group) => {
                          const isCustom = !['Храна', 'Жилище', 'Битови', 'Транспорт', 'Развлечения', 'Здраве', 'Облекло', 'Други'].includes(group)
                          return (
                            <div
                              key={group}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                                isCustom
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              <Tag size={14} />
                              {group}
                              {isCustom && (
                                <button
                                  onClick={() => handleDeleteCustomGroup(group)}
                                  className="ml-1 text-purple-600 hover:text-purple-900 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business-Group Mappings */}
                {Object.keys(getBusinessGroupMappings()).length > 0 && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-green-50 border-b border-green-100 px-4 sm:px-6 py-4">
                      <h3 className="text-lg font-semibold text-green-900">Асоциации търговец-група</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Вашите персонализирани групи за всеки търговец
                      </p>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Търговец
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Група
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {Object.entries(getBusinessGroupMappings()).map(([business, group]) => (
                            <tr key={business} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm text-gray-900">{business}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <Tag size={12} />
                                  {group}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Custom Mappings Table */}
                {Object.keys(getCustomMappings()).length > 0 && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-indigo-50 border-b border-indigo-100 px-4 sm:px-6 py-4">
                      <h3 className="text-lg font-semibold text-indigo-900">Персонализирани имена</h3>
                      <p className="text-sm text-indigo-700 mt-1">
                        Вашите собствени преименувания (запазени локално)
                      </p>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Оригинално име
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Персонализирано име
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Действия
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {Object.entries(getCustomMappings()).map(([original, mapped]) => (
                            <tr key={original} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm text-gray-600">{original}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                  {mapped}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => handleDeleteMapping(original)}
                                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                                  title="Изтрий преименуване"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-200">
                      {Object.entries(getCustomMappings()).map(([original, mapped]) => (
                        <div key={original} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                Оригинално
                              </p>
                              <p className="text-sm text-gray-900 break-words">{original}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteMapping(original)}
                              className="p-2 text-red-600 hover:text-red-800 transition-colors flex-shrink-0"
                              title="Изтрий преименуване"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Персонализирано
                            </p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                              {mapped}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {!!data && (
        <footer className="mt-12 text-center bg-white p-8 lg:py-12 border-t border-gray-200">
          <div className="max-w-2xl mx-auto px-4">
            <p className="text-lg font-semibold text-gray-700 mb-4">Дай някой лев, мишка 🐭</p>
            <div className="flex flex-col items-center gap-3 text-sm mb-4">
              <span className="font-medium text-gray-700">Revolut:</span>
              <a
                href="https://revolut.me/petromirp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-mono bg-indigo-50 px-3 py-1 rounded transition-colors"
              >
                @petromirp
              </a>
            </div>
            <div className="flex flex-col items-center gap-3 text-sm">
              <span className="font-medium text-gray-700">Ethereum:</span>
              <code className="text-xs bg-gray-100 px-3 py-2 rounded text-gray-800 break-all max-w-full">
                0xfa12F44071291d7D75FFC201C1A15f904Bc78268
              </code>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export default App
