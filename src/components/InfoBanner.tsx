import { Shield } from 'lucide-react'

export function InfoBanner() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <Shield className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-1">🔒 Пълна поверителност и сигурност</h3>
          <p className="text-sm text-blue-800">
            Всички данни се обработват <strong>локално на вашия компютър</strong>. Никаква
            информация не се изпраща към сървъри. Приложението работи само с банка{' '}
            <strong>ДСК</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
