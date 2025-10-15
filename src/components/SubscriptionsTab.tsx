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
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="text-center py-8 sm:py-12">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={40} />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
            Няма открити абонаменти
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            Не са открити повтарящи се плащания във вашата история на транзакции.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Info alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
          <p className="text-sm text-blue-800">
            Откриваме абонаменти като анализираме транзакциите ти локално (без да се изпращат към
            сървъри). Възможни са неточности.
          </p>
        </div>
      </div>
      {/* Active Subscriptions */}
      {activeSubscriptions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-600 flex-shrink-0" size={20} />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              Активни абонаменти ({activeSubscriptions.length})
            </h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {activeSubscriptions.map((subscription, index) => (
              <SubscriptionCard key={`active-${index}`} subscription={subscription} />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Subscriptions */}
      {inactiveSubscriptions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-gray-500 flex-shrink-0" size={20} />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-700">
              Неактивни абонаменти ({inactiveSubscriptions.length})
            </h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
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
      className={`border rounded-lg p-3 sm:p-4 transition-all ${
        isInactive ? 'border-gray-300 bg-gray-50' : 'border-green-200 bg-green-50'
      }`}
    >
      {/* Header: Name + Badge on left, Calculation on right */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3 sm:mb-2">
        <div className="flex flex-col gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-md sm:text-lg font-semibold text-gray-900 break-words">
              {subscription.businessName}
            </h3>
            {!isInactive && (
              <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-green-100 border-green-600 text-green-800 border whitespace-nowrap">
                Активен
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {formatDate(subscription.firstPayment)} - {formatDate(subscription.lastPayment)}
            <span className="text-gray-500 ml-1 hidden sm:inline">(Последно плащане)</span>
          </div>
        </div>

        <div className="flex flex-row items-center sm:flex-col sm:items-start text-left sm:text-right flex-shrink-0">
          <div className="text-sm text-gray-500 sm:text-gray-600 mr-2 sm:mb-0.5 sm:mr-0">
            {formatCurrency(averageAmount)} × {subscription.consecutiveMonths} =
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {formatCurrency(totalPaid)}
          </div>
        </div>
      </div>

      {/* Expandable payment history */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800 list-none">
          <span className="inline-flex items-center">
            Вижте всички плащания
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 ml-1 transition-transform group-open:rotate-180"
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
        <div className="mt-3 space-y-3 pl-2 sm:pl-4 pt-3 border-t border-gray-200">
          {subscription.payments.map((payment, idx) => (
            <div
              key={idx}
              className="flex flex-row justify-between items-center gap-1 sm:gap-2 text-sm"
            >
              <span className="text-gray-600">{formatDate(payment.date)}</span>
              <span className="font-medium text-gray-900">{formatCurrency(payment.amount)}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
