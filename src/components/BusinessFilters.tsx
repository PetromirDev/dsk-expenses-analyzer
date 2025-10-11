/**
 * Business Filters Component
 * Displays search and group filter for the business tab
 */

import { Search, Filter, Plus } from 'lucide-react'

interface BusinessFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedGroup: string
  onGroupChange: (value: string) => void
  allGroups: string[]
  onAddGroup: () => void
}

export function BusinessFilters({
  searchTerm,
  onSearchChange,
  selectedGroup,
  onGroupChange,
  allGroups,
  onAddGroup
}: BusinessFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Търсене по търговец..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Group Filter */}
        <div className="relative min-w-[200px]">
          <Filter
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            size={18}
          />
          <select
            value={selectedGroup}
            onChange={(e) => onGroupChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
          >
            <option value="">Всички групи</option>
            {allGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        {/* Add Group Button */}
        <button
          onClick={onAddGroup}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Нова група
        </button>
      </div>
    </div>
  )
}
