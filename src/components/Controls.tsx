import { Search } from 'lucide-react'

export interface ControlsProps {
  selectedView: 'overview' | 'business'
  onViewChange: (view: 'overview' | 'business') => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function Controls({ searchTerm, onSearchChange }: ControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="relative w-full max-w-md mx-auto">
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
  )
}
