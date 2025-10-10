import { Upload, FolderOpen, Download } from 'lucide-react'
import type { ChangeEvent } from 'react'

export interface ActionButtonsProps {
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void
  showSettings: boolean
  onToggleSettings: () => void
  onExportSettings: () => void
  onImportSettings: (event: ChangeEvent<HTMLInputElement>) => void
}

export function ActionButtons({
  onFileUpload,
  showSettings,
  onToggleSettings,
  onExportSettings,
  onImportSettings
}: ActionButtonsProps) {
  return (
    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
      <label>
        <input type="file" accept=".xml" onChange={onFileUpload} className="hidden" />
        <span className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors">
          <Upload size={18} />
          Качи нов файл
        </span>
      </label>

      <button
        onClick={onToggleSettings}
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        <FolderOpen size={18} />
        {showSettings ? 'Скрий настройки' : 'Настройки'}
      </button>

      <button
        onClick={onExportSettings}
        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        <Download size={18} />
        Експорт
      </button>

      <label>
        <input type="file" accept=".json" onChange={onImportSettings} className="hidden" />
        <span className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors">
          <Upload size={18} />
          Импорт
        </span>
      </label>
    </div>
  )
}
