import { Search } from 'lucide-react'

export interface ControlsProps {
  selectedView: 'month' | 'business'
  onViewChange: (view: 'month' | 'business') => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function Controls({
  selectedView,
  onViewChange,
  searchTerm,
  onSearchChange
}: ControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => onViewChange('month')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            По месец
          </button>
          <button
            onClick={() => onViewChange('business')}
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
      </div>
    </div>
  )
}
