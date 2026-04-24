'use client'

import { CardElement } from '@stripe/react-stripe-js'
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
        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: {
                color: '#2f1a09',
                fontFamily: 'Manrope, system-ui, sans-serif',
                fontSize: '16px',
                '::placeholder': {
                  color: '#8e7d6d',
                },
              },
              invalid: {
                color: '#9b2c2c',
                iconColor: '#9b2c2c',
              },
            },
          }}
        />
      </div>
      <p className="text-taupe text-xs">{t(locale, 'cardHelp')}</p>
    </div>
  )
}
