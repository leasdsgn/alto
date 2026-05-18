'use client'

import Link from 'next/link'
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
        checked={values.privacy}
        onChange={(v) => onChange({ ...values, privacy: v })}
        disabled={disabled}
      >
        {t(locale, 'policyPrivacyPrefix')}{' '}
        <PolicyLink href="/confidentialite">{t(locale, 'policyPrivacyLink')}</PolicyLink>
      </CheckboxField>
      <CheckboxField
        checked={values.terms}
        onChange={(v) => onChange({ ...values, terms: v })}
        disabled={disabled}
      >
        {t(locale, 'policyTermsPrefix')}{' '}
        <PolicyLink href="/cgv">{t(locale, 'policyTermsLink')}</PolicyLink>
      </CheckboxField>
    </div>
  )
}

interface CheckboxFieldProps {
  children: React.ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

function CheckboxField({ children, checked, onChange, disabled }: CheckboxFieldProps) {
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
      <span className="text-coffee">{children}</span>
    </label>
  )
}

function PolicyLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="underline decoration-current underline-offset-2 transition-opacity hover:opacity-70"
    >
      {children}
    </Link>
  )
}
