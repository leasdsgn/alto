import { storyblokEditable } from '@storyblok/react/rsc'

type Blok = Record<string, unknown>
type Editable = Parameters<typeof storyblokEditable>[0]

export function BookingDepositNoticeBlok({ blok }: { blok: Blok }) {
  const title = text(blok.title)
  const body = text(blok.body)

  if (!title && !body) return null

  return (
    <section
      {...storyblokEditable(blok as Editable)}
      className="border-divider bg-sand/40 mb-8 rounded-lg border p-5"
    >
      {title ? <h2 className="text-coffee text-sm font-semibold">{title}</h2> : null}
      {body ? <p className="text-taupe mt-2 text-sm leading-relaxed">{body}</p> : null}
    </section>
  )
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}
