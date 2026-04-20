'use client'

import { t } from '@/lib/i18n/booking-dictionary'
import { type InquiryLocale } from '@/types/inquiry'

export interface PolicyValues {
  privacy: boolean
  terms: boolean
}

interface PolicyCheckboxesProps {
  locale: InquiryLocale
  values: PolicyValues
  onChange: (values: PolicyValues) => void
  disabled?: boolean
}

export function PolicyCheckboxes({
  locale,
  values,
  onChange,
  disabled,
}: PolicyCheckboxesProps) {
  return (
    <div className="space-y-2" role="group">
      <CheckboxField
        label={t(locale, 'policyPrivacy')}
        checked={values.privacy}
        onChange={(v) => onChange({ ...values, privacy: v })}
        disabled={disabled}
      />
      <CheckboxField
        label={t(locale, 'policyTerms')}
        checked={values.terms}
        onChange={(v) => onChange({ ...values, terms: v })}
        disabled={disabled}
      />
    </div>
  )
}

interface CheckboxFieldProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

function CheckboxField({ label, checked, onChange, disabled }: CheckboxFieldProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        required
        className="border-divider text-coffee focus:ring-coffee mt-0.5 size-4 rounded border accent-[#2f1a09]"
      />
      <span className="text-coffee">{label}</span>
    </label>
  )
}
