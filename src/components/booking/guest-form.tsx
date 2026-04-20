'use client'

import { t } from '@/lib/i18n/booking-dictionary'
import { type InquiryLocale } from '@/types/inquiry'

export interface GuestFormValues {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface GuestFormProps {
  locale: InquiryLocale
  values: GuestFormValues
  onChange: (values: GuestFormValues) => void
  disabled?: boolean
}

export function GuestForm({ locale, values, onChange, disabled }: GuestFormProps) {
  function update<K extends keyof GuestFormValues>(field: K, value: GuestFormValues[K]) {
    onChange({ ...values, [field]: value })
  }

  return (
    <fieldset className="space-y-4" disabled={disabled}>
      <legend className="text-coffee mb-3 text-base font-semibold uppercase tracking-[0.08em]">
        {t(locale, 'stepGuest')}
      </legend>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField
          label={t(locale, 'firstName')}
          value={values.firstName}
          onChange={(v) => update('firstName', v)}
          autoComplete="given-name"
          required
        />
        <InputField
          label={t(locale, 'lastName')}
          value={values.lastName}
          onChange={(v) => update('lastName', v)}
          autoComplete="family-name"
          required
        />
      </div>

      <InputField
        label={t(locale, 'email')}
        type="email"
        value={values.email}
        onChange={(v) => update('email', v)}
        autoComplete="email"
        required
      />

      <InputField
        label={t(locale, 'phone')}
        type="tel"
        value={values.phone}
        onChange={(v) => update('phone', v)}
        autoComplete="tel"
        required
      />
    </fieldset>
  )
}

interface InputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'tel'
  autoComplete?: string
  required?: boolean
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  required,
}: InputFieldProps) {
  return (
    <label className="block">
      <span className="text-coffee mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        className="border-divider bg-cream text-coffee focus:border-coffee w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors"
      />
    </label>
  )
}
