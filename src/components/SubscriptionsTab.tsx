import { Calendar, TrendingUp, AlertCircle } from 'lucide-react'
import { formatCurrency } from '../utils/xmlParser'
import type { Subscription } from '../types'

export interface SubscriptionsTabProps {
  subscriptions: Subscription[]
}

export function SubscriptionsTab({ subscriptions }: SubscriptionsTabProps) {
  const activeSubscriptions = subscriptions.filter((s) => s.isActive)
  const inactiveSubscriptions = subscriptions.filter((s) => !s.isActive)

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Няма открити абонаменти</h3>
          <p className="text-gray-500">
            Не са открити повтарящи се плащания във вашата история на транзакции.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Subscriptions */}
      {activeSubscriptions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">
              Активни абонаменти ({activeSubscriptions.length})
            </h2>
          </div>
          <div className="space-y-4">
            {activeSubscriptions.map((subscription, index) => (
              <SubscriptionCard key={`active-${index}`} subscription={subscription} />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Subscriptions */}
      {inactiveSubscriptions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-gray-500" size={24} />
            <h2 className="text-2xl font-bold text-gray-700">
              Неактивни абонаменти ({inactiveSubscriptions.length})
            </h2>
          </div>
          <div className="space-y-4">
            {inactiveSubscriptions.map((subscription, index) => (
              <SubscriptionCard key={`inactive-${index}`} subscription={subscription} isInactive />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface SubscriptionCardProps {
  subscription: Subscription
  isInactive?: boolean
}

function SubscriptionCard({ subscription, isInactive = false }: SubscriptionCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const totalPaid = subscription.payments.reduce((sum, p) => sum + p.amount, 0)
  const averageAmount = subscription.averageAmount

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        isInactive ? 'border-gray-300 bg-gray-50' : 'border-green-200 bg-green-50'
      }`}
    >
      {/* Header: Name + Badge on left, Calculation on right */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{subscription.businessName}</h3>
            {!isInactive && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 border-green-600 text-green-800 border">
                Активен
              </span>
            )}
          </div>
          <div className="mb-2 text-sm text-gray-600">
            {formatDate(subscription.firstPayment)} - {formatDate(subscription.lastPayment)}
            <span className="text-gray-500 ml-1">(Последно плащане)</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-600 mb-0.5">
            {formatCurrency(averageAmount)} × {subscription.consecutiveMonths} =
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalPaid)}</div>
        </div>
      </div>

      {/* Expandable payment history */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800 list-none">
          <span className="inline-flex items-center">
            Вижте всички плащания
            <svg
              className="w-4 h-4 ml-1 transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </summary>
        <div className="mt-3 space-y-2 pl-4 pt-3 border-t border-gray-200">
          {subscription.payments.map((payment, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {formatDate(payment.date)} • {payment.monthYear}
              </span>
              <span className="font-medium text-gray-900">{formatCurrency(payment.amount)}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
