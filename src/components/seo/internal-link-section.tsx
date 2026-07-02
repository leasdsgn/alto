import Link from 'next/link'

interface InternalLinkItem {
  label: string
  href: string
  description: string
}

interface InternalLinkSectionProps {
  eyebrow?: string
  title: string
  items: InternalLinkItem[]
  className?: string
}

export function InternalLinkSection({
  eyebrow,
  title,
  items,
  className = '',
}: InternalLinkSectionProps) {
  if (items.length === 0) return null

  return (
    <section className={`border-divider border-t pt-10 ${className}`}>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          {eyebrow && (
            <p className="text-silver text-overline font-bold uppercase tracking-[0.24px]">
              {eyebrow}
            </p>
          )}
          <h2 className="text-coffee text-h4 mt-3 font-medium">{title}</h2>
        </div>

        <div className="grid flex-1 gap-3 md:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-divider bg-cream group rounded-lg border p-5 transition-colors hover:bg-sand"
            >
              <span className="text-coffee text-body-xl font-semibold">{item.label}</span>
              <span className="text-ash text-body-sm mt-3 block leading-[1.6]">
                {item.description}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
