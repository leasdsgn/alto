import Image from 'next/image'
import Link from 'next/link'

interface ApartmentCardProps {
  name: string
  price: number
  guests: number
  surface: number
  bedrooms: number
  slug: string
  image?: string
  city?: string
  neighborhood?: string
}

export function ApartmentCard({
  name,
  price,
  guests,
  surface,
  bedrooms,
  slug,
  image,
  city,
  neighborhood,
}: ApartmentCardProps) {
  const totalEstimate = Math.round(price * 6.5)

  return (
    <Link href={`/appartements/${slug}`} className="group block">
      <article className="flex flex-col gap-[9px]">
        <div className="relative h-[278px] w-full overflow-hidden rounded-lg">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="bg-taupe size-full" />
          )}

          {(city || neighborhood) && (
            <div className="absolute left-5 top-5 flex items-center gap-[10px]">
              {city && (
                <span className="bg-cream text-ash rounded-xl px-4 py-[2px] text-caption tracking-[0.24px]">
                  {city}
                </span>
              )}
              {neighborhood && (
                <span className="bg-cream text-ash rounded-xl px-4 py-[2px] text-caption tracking-[0.24px]">
                  {neighborhood}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-[9px] pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-coffee w-[170px] truncate text-body-xl font-semibold leading-[1.55]">
              {name}
            </h3>
            <div className="flex items-center gap-1">
              <StarIcon />
              <span className="text-coffee text-body-sm leading-[1.5]">4,9 (113)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SpecBadge icon="guests" value={`${guests} p.`} />
            <SpecBadge icon="surface" value={`${surface} m`} sup="2" />
            <SpecBadge icon="bedrooms" value={String(bedrooms)} />
          </div>

          <div className="flex items-center gap-[10px]">
            <span className="text-silver text-body leading-[1.5]">{price}&euro;/nuit</span>
            <span className="text-ash decoration-ash/50 text-body leading-[1.5] underline underline-offset-2">
              {totalEstimate.toLocaleString('fr-FR')}&euro; au total
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function SpecBadge({ value, sup, icon }: { value: string; sup?: string; icon: 'guests' | 'surface' | 'bedrooms' }) {
  return (
    <div className="flex items-center gap-[10px]">
      <SpecIcon kind={icon} />
      <span className="text-taupe text-caption font-bold leading-[1.55]">
        {sup ? (
          <>
            {value}
            <sup className="text-[7.74px] tracking-[0.24px]">{sup}</sup>
          </>
        ) : value}
      </span>
    </div>
  )
}

function SpecIcon({ kind }: { kind: 'guests' | 'surface' | 'bedrooms' }) {
  const common = 'shrink-0 text-silver'
  if (kind === 'guests') {
    return (
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={common}>
        <circle cx="9.5" cy="6.5" r="3" />
        <path d="M3.5 16c0-3 2.7-5 6-5s6 2 6 5" />
      </svg>
    )
  }
  if (kind === 'surface') {
    return (
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={common}>
        <rect x="3" y="3" width="13" height="13" rx="0.5" />
        <path d="M5.5 5.5v2M5.5 5.5h2M13.5 13.5v-2M13.5 13.5h-2" />
      </svg>
    )
  }
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={common}>
      <path d="M2.5 13V6.5M16.5 13V9.5a2 2 0 0 0-2-2H7" />
      <path d="M2.5 11h14" />
      <circle cx="5.5" cy="9" r="1.2" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="#301A0A">
      <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.885l-3.09 1.625.59-3.44L2 4.635l3.455-.505L7 1z" />
    </svg>
  )
}
