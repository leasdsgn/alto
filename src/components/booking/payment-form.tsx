'use client'

import { PaymentElement } from '@stripe/react-stripe-js'
import { t } from '@/lib/i18n/booking-dictionary'
import { type InquiryLocale } from '@/types/inquiry'

interface PaymentFormProps {
  locale: InquiryLocale
}

export function PaymentForm({ locale }: PaymentFormProps) {
  return (
    <div className="space-y-3">
      <p className="text-coffee text-xs font-medium uppercase tracking-[0.08em]">
        {t(locale, 'cardLabel')}
      </p>
      <div className="border-divider bg-cream rounded-lg border p-4">
        <PaymentElement
          options={{
            layout: 'tabs',
            fields: { billingDetails: { email: 'never' } },
          }}
        />
      </div>
      <p className="text-taupe text-xs">{t(locale, 'cardHelp')}</p>
    </div>
  )
}
