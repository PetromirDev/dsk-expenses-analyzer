import { Trash2, Tag, Upload, Download, FileUp } from 'lucide-react'
import type { CustomMappings } from '../types'
import { ChangeEvent } from 'react'

export interface SettingsPanelProps {
  customMappings: CustomMappings
  onDeleteMapping: (originalName: string) => void
  businessGroupMappings: Record<string, string>
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  onExportSettings: () => void
  onImportSettings: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  customGroups: string[]
  onDeleteGroup: (groupName: string) => void
}

export function SettingsPanel({
  customMappings,
  onDeleteMapping,
  businessGroupMappings,
  onFileUpload,
  onExportSettings,
  onImportSettings,
  customGroups,
  onDeleteGroup
}: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      {/* File Actions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-blue-50 border-b border-blue-100 px-4 sm:px-6 py-4">
          <h3 className="text-lg font-semibold text-blue-900">Файлове и настройки</h3>
          <p className="text-sm text-blue-700 mt-1">
            Качете XML файл или експортирайте/импортирайте настройките си
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Upload XML File */}
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
              <Upload size={18} className="flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Качи XML файл</span>
              <input type="file" accept=".xml" onChange={onFileUpload} className="hidden" />
            </label>

            {/* Export Settings */}
            <button
              onClick={onExportSettings}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={18} className="flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Експорт на настройки</span>
            </button>

            {/* Import Settings */}
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
              <FileUp size={18} className="flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Импорт на настройки</span>
              <input type="file" accept=".json" onChange={onImportSettings} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Custom Groups Table */}
      {customGroups.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-yellow-50 border-b border-yellow-100 px-4 sm:px-6 py-4">
            <h3 className="text-lg font-semibold text-yellow-900">Персонализирани групи</h3>
            <p className="text-sm text-yellow-700 mt-1">Вашите собствени групи</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Име на групата
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customGroups.map((group) => (
                  <tr key={group} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Tag size={12} />
                        {group}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onDeleteGroup(group)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Изтрий група"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Група
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(businessGroupMappings).map(([business, group]) => (
                  <tr key={business} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{business}</td>
                    <td className="px-6 py-4 text-right">
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <td className="px-6 py-4 text-right">
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
