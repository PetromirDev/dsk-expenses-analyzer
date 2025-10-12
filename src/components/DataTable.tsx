import { Edit2, Tag, ListChevronsDownUpIcon, ListChevronsUpDownIcon } from 'lucide-react'
import { formatCurrency } from '../utils/xmlParser'
import { isBusinessSpending, getItemName, getItemGroup } from '../helpers'
import type { BusinessSpending, MonthlySpending } from '../types'
import { useState } from 'react'

export interface DataTableProps {
  data: (MonthlySpending | BusinessSpending)[]
  selectedView: 'overview' | 'business'
  editingBusiness: string | null
  editValue: string
  onEditValueChange: (value: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onStartEdit: (item: BusinessSpending) => void
  editingGroup: string | null
  selectedGroup: string
  onGroupChange: (group: string) => void
  onSaveGroup: (businessName: string) => void
  onCancelGroupEdit: () => void
  onStartGroupEdit: (item: BusinessSpending) => void
  allGroups: string[]
}

export function DataTable({
  data,
  selectedView,
  editingBusiness,
  editValue,
  onEditValueChange,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  editingGroup,
  selectedGroup,
  onGroupChange,
  onSaveGroup,
  onCancelGroupEdit,
  onStartGroupEdit,
  allGroups
}: DataTableProps) {
  const [expandedBusiness, setExpandedBusiness] = useState<string | null>(null)

  const toggleExpanded = (businessName: string) => {
    setExpandedBusiness(expandedBusiness === businessName ? null : businessName)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {selectedView === 'overview' ? 'Месец' : 'Търговец'}
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
            {data.map((item, index) => {
              const itemName = getItemName(item)
              const itemGroup = getItemGroup(item)
              const isExpanded = expandedBusiness === itemName

              return (
                <>
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {selectedView === 'business' && editingBusiness === itemName ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => onEditValueChange(e.target.value)}
                          onBlur={onSaveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') onSaveEdit()
                            if (e.key === 'Escape') onCancelEdit()
                          }}
                          autoFocus
                          className="w-full px-2 py-1 border border-indigo-500 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      ) : (
                        <div className="font-medium text-gray-900">{itemName}</div>
                      )}
                    </td>
                    {selectedView === 'business' && (
                      <td className="px-6 py-4">
                        {editingGroup === itemName ? (
                          <select
                            value={selectedGroup}
                            onChange={(e) => onGroupChange(e.target.value)}
                            onBlur={() => onSaveGroup(itemName)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') onSaveGroup(itemName)
                              if (e.key === 'Escape') onCancelGroupEdit()
                            }}
                            autoFocus
                            className="w-full px-2 py-1 border border-indigo-500 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                          >
                            {allGroups.map((group) => (
                              <option key={group} value={group}>
                                {group}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <button
                            onClick={() => isBusinessSpending(item) && onStartGroupEdit(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                          >
                            <Tag size={12} />
                            {itemGroup}
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
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => isBusinessSpending(item) && onStartEdit(item)}
                            disabled={editingBusiness !== null}
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Редактирай име"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => toggleExpanded(itemName)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title={isExpanded ? 'Скрий транзакции' : 'Виж транзакции'}
                          >
                            {isExpanded ? (
                              <ListChevronsUpDownIcon size={20} />
                            ) : (
                              <ListChevronsDownUpIcon size={20} />
                            )}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                  {selectedView === 'business' && isExpanded && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Всички транзакции ({item.transactions.length})
                          </h4>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {item.transactions.map((transaction, txIndex) => (
                              <div
                                key={txIndex}
                                className="flex justify-between items-center gap-2 text-sm py-2 px-3 bg-white rounded border border-gray-200"
                              >
                                <span className="text-gray-600">
                                  {formatDate(transaction.dateObj)}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {formatCurrency(transaction.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="text-center py-12 text-gray-500">Няма намерени резултати</div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Няма намерени резултати</div>
        ) : (
          data.map((item, index) => {
            const itemName = getItemName(item)
            const itemGroup = getItemGroup(item)
            const isExpanded = expandedBusiness === itemName

            return (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    {selectedView === 'business' && editingBusiness === itemName ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => onEditValueChange(e.target.value)}
                        onBlur={onSaveEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onSaveEdit()
                          if (e.key === 'Escape') onCancelEdit()
                        }}
                        autoFocus
                        className="w-full px-2 py-1 border border-indigo-500 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                    ) : (
                      <h3 className="font-medium text-gray-900 break-words">{itemName}</h3>
                    )}
                  </div>
                  {selectedView === 'business' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => isBusinessSpending(item) && onStartEdit(item)}
                        disabled={editingBusiness !== null}
                        className="p-2 text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Редактирай име"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => toggleExpanded(itemName)}
                        className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                        title={isExpanded ? 'Скрий транзакции' : 'Виж транзакции'}
                      >
                        {isExpanded ? (
                          <ListChevronsUpDownIcon size={20} />
                        ) : (
                          <ListChevronsDownUpIcon size={20} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
                {selectedView === 'business' && (
                  <div className="mb-2">
                    {editingGroup === itemName ? (
                      <select
                        value={selectedGroup}
                        onChange={(e) => onGroupChange(e.target.value)}
                        onBlur={() => onSaveGroup(itemName)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onSaveGroup(itemName)
                          if (e.key === 'Escape') onCancelGroupEdit()
                        }}
                        autoFocus
                        className="w-full px-2 py-1 border border-indigo-500 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      >
                        {allGroups.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => isBusinessSpending(item) && onStartGroupEdit(item)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        <Tag size={12} />
                        {itemGroup}
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

                {/* Expanded transactions list */}
                {selectedView === 'business' && isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Всички транзакции ({item.transactions.length})
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {item.transactions.map((transaction, txIndex) => (
                        <div
                          key={txIndex}
                          className="flex justify-between items-center gap-2 text-sm py-2 px-3 bg-white rounded border border-gray-200"
                        >
                          <span className="text-gray-600">{formatDate(transaction.dateObj)}</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
