'use client'

import { storyblokEditable } from '@storyblok/react/rsc'
import { bloksOf, textOr } from '@/lib/storyblok-asset'

type Blok = Record<string, unknown>
type Editable = Parameters<typeof storyblokEditable>[0]
type SocialPlatform = 'instagram' | 'facebook' | 'x' | 'linkedin' | 'tiktok' | 'youtube'

const editable = (blok: Blok) => storyblokEditable(blok as Editable)

export function ContactFormSectionBlok({ blok }: { blok: Blok }) {
  const subjects = bloksOf<{ value?: unknown; label?: unknown }>(blok.subjects).map((item) => ({
    value: textOr(item.value, 'autre'),
    label: textOr(item.label, ''),
  }))
  const socials = bloksOf<{ platform?: unknown; url?: unknown } & Blok>(blok.sidebar_socials).map(
    (item) => ({
      ...item,
      platform: (textOr(item.platform, 'instagram') as SocialPlatform) ?? 'instagram',
      url: textOr(item.url, '#'),
    }),
  )
  const addressLines = textOr(blok.sidebar_address_lines, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const email = textOr(blok.sidebar_email, '')
  const phone = textOr(blok.sidebar_phone, '')

  return (
    <main
      {...editable(blok)}
      className="max-w-content px-gutter py-section md:px-gutter-md mx-auto"
    >
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_304px]">
        <div>
          {blok.eyebrow ? (
            <p className="text-silver text-xs font-bold tracking-[0.24px] uppercase">
              {textOr(blok.eyebrow, '')}
            </p>
          ) : null}
          <h2 className="text-coffee mt-1 text-base leading-[24px] font-medium">
            {textOr(blok.title, '')}
          </h2>
          {blok.intro ? (
            <p className="text-coffee mt-4 max-w-[600px] text-xs leading-[20px] font-medium">
              {textOr(blok.intro, '')}
            </p>
          ) : null}

          <form className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field id="firstName" label={textOr(blok.firstname_label, 'Prénom')} required />
              <Field id="lastName" label={textOr(blok.lastname_label, 'Nom')} required />
            </div>

            <Field id="email" type="email" label={textOr(blok.email_label, 'Email')} required />

            <div>
              <label htmlFor="subject" className="text-coffee text-xs font-bold tracking-[0.24px]">
                {textOr(blok.subject_label, 'Sujet')}
              </label>
              <select
                id="subject"
                name="subject"
                className="border-divider text-coffee focus:border-coffee mt-2 block w-full rounded-sm border bg-transparent px-4 py-3 text-xs font-medium outline-none"
              >
                {subjects.length > 0 ? (
                  subjects.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="reservation">Réservation</option>
                    <option value="autre">Autre</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="text-coffee text-xs font-bold tracking-[0.24px]">
                {textOr(blok.message_label, 'Message')}
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="border-divider text-coffee placeholder:text-taupe focus:border-coffee mt-2 block w-full resize-none rounded-sm border bg-transparent px-4 py-3 text-xs leading-[22px] font-medium outline-none"
              />
            </div>

            <button
              type="submit"
              className="bg-coffee text-cream btn-fill rounded-sm px-8 py-3 text-xs font-bold tracking-[0.24px]"
            >
              {textOr(blok.submit_label, 'Envoyer')}
            </button>
          </form>
        </div>

        <aside className="space-y-8">
          {email ? <ContactRow label="Email" value={email} href={`mailto:${email}`} /> : null}
          {phone ? (
            <ContactRow
              label={textOr(blok.sidebar_phone_label, 'Téléphone')}
              value={phone}
              href={`tel:${phone.replace(/\s+/g, '')}`}
            />
          ) : null}
          {addressLines.length > 0 ? (
            <div>
              <p className="text-silver text-xs font-bold tracking-[0.24px] uppercase">
                {textOr(blok.sidebar_address_label, 'Adresse')}
              </p>
              <div className="text-coffee mt-2 space-y-1 text-sm leading-[1.6] font-medium">
                {addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          ) : null}
          {socials.length > 0 ? (
            <div>
              <p className="text-silver text-xs font-bold tracking-[0.24px] uppercase">
                {textOr(blok.sidebar_socials_label, 'Réseaux')}
              </p>
              <div className="mt-3 flex gap-4">
                {socials.map((social) => (
                  <a
                    key={`${social.platform}-${social.url}`}
                    {...editable(social as Blok)}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.platform}
                    className="text-coffee text-sm font-bold capitalize"
                  >
                    {social.platform}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  )
}

function Field({
  id,
  label,
  type = 'text',
  required = false,
}: {
  id: string
  label: string
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="text-coffee text-xs font-bold tracking-[0.24px]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="border-divider text-coffee placeholder:text-taupe focus:border-coffee mt-2 block w-full rounded-sm border bg-transparent px-4 py-3 text-xs font-medium outline-none"
      />
    </div>
  )
}

function ContactRow({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <div>
      <p className="text-silver text-xs font-bold tracking-[0.24px] uppercase">{label}</p>
      <a href={href} className="text-coffee mt-2 block text-sm font-medium">
        {value}
      </a>
    </div>
  )
}
