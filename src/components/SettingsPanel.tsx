import { Trash2, Plus, Tag } from 'lucide-react'
import type { CustomMappings } from '../types'

export interface SettingsPanelProps {
  showSettings: boolean
  customMappings: CustomMappings
  onDeleteMapping: (originalName: string) => void
  newGroupName: string
  onNewGroupNameChange: (name: string) => void
  onAddCustomGroup: () => void
  onDeleteCustomGroup: (groupName: string) => void
  allGroups: string[]
  businessGroupMappings: Record<string, string>
}

export function SettingsPanel({
  showSettings,
  customMappings,
  onDeleteMapping,
  newGroupName,
  onNewGroupNameChange,
  onAddCustomGroup,
  onDeleteCustomGroup,
  allGroups,
  businessGroupMappings
}: SettingsPanelProps) {
  if (!showSettings) return null

  const defaultGroups = [
    'Храна',
    'Техника',
    'Жилище',
    'Битови',
    'Транспорт',
    'Развлечения',
    'Ресторанти',
    'Онлайн пазаруване',
    'Здраве',
    'Облекло',
    'Други'
  ]

  return (
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
              onChange={(e) => onNewGroupNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAddCustomGroup()
              }}
              placeholder="Име на нова група..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <button
              onClick={onAddCustomGroup}
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
              {allGroups.map((group) => {
                const isCustom = !defaultGroups.includes(group)
                return (
                  <div
                    key={group}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                      isCustom ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Tag size={14} />
                    {group}
                    {isCustom && (
                      <button
                        onClick={() => onDeleteCustomGroup(group)}
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
      {Object.keys(businessGroupMappings).length > 0 && (
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
                {Object.entries(businessGroupMappings).map(([business, group]) => (
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
      {Object.keys(customMappings).length > 0 && (
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
                {Object.entries(customMappings).map(([original, mapped]) => (
                  <tr key={original} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{original}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        {mapped}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onDeleteMapping(original)}
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
            {Object.entries(customMappings).map(([original, mapped]) => (
              <div key={original} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Оригинално</p>
                    <p className="text-sm text-gray-900 break-words">{original}</p>
                  </div>
                  <button
                    onClick={() => onDeleteMapping(original)}
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
  )
}
