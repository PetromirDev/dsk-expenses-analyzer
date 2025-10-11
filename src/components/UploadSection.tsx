import { Upload, Database } from 'lucide-react'
import type { ChangeEvent } from 'react'

export interface UploadSectionProps {
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onLoadDemo: () => void
}

export function UploadSection({ onFileUpload, onLoadDemo }: UploadSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="bg-indigo-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="text-indigo-600" size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Качете XML файл</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Изберете XML файл с банкови движения от ДСК банка
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
            Как да изтеглите XML файла:
          </h3>
          <ol className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-blue-800">
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span className="pt-0.5">
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
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span className="pt-0.5">Изберете раздел "Средства" от навигацията</span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span className="pt-0.5">Скролнете до сметката, която искате да анализирате</span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </span>
              <span className="pt-0.5">Натиснете върху "Движения"</span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                5
              </span>
              <span className="pt-0.5">Изберете желания период и натиснете "Покажи"</span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                6
              </span>
              <span className="pt-0.5">
                Изтеглете файла във формат <strong>XML</strong>
              </span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                7
              </span>
              <span className="pt-0.5">Качете изтегления файл тук 👇</span>
            </li>
          </ol>
        </div>

        {/* Upload Button */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <label className="inline-block w-full sm:w-auto">
              <input type="file" accept=".xml" onChange={onFileUpload} className="hidden" />
              <span className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg cursor-pointer inline-flex items-center justify-center gap-2 transition-colors w-full text-sm sm:text-base">
                <Database size={18} className="sm:w-5 sm:h-5" />
                Избери файл
              </span>
            </label>

            <button
              onClick={onLoadDemo}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg inline-flex items-center justify-center gap-2 transition-colors w-full sm:w-auto text-sm sm:text-base"
            >
              <Upload size={18} className="sm:w-5 sm:h-5" />
              Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
