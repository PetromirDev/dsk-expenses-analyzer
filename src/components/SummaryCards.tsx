import { formatCurrency } from '../utils/xmlParser'

export interface SummaryCardsProps {
  totalIncome: number
  totalSpent: number
  netBalance: number
}

export function SummaryCards({ totalIncome, totalSpent, netBalance }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Общо приходи</h3>
        <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Общо разходи</h3>
        <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Нетен баланс</h3>
        <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(netBalance)}
        </p>
      </div>
    </div>
  )
}
