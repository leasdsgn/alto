'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import Link from 'next/link'

interface Apartment {
  name: string
  price: number
  slug: string
  image?: string
  lat?: number
  lng?: number
}

interface QuartiersSectionProps {
  apartments?: Apartment[]
}

const QUARTIERS = [
  {
    id: 'marais',
    name: 'Le Marais',
    arrondissement: '3e',
    description: 'Ruelles pavées, galeries d\'art, bistrots. Le Paris authentique et vivant.',
    lng: 2.3622,
    lat: 48.8637,
  },
  {
    id: 'saint-germain',
    name: 'Saint-Germain',
    arrondissement: '6e',
    description: 'Cafés littéraires, jardins secrets, élégance rive gauche.',
    lng: 2.3338,
    lat: 48.8530,
  },
  {
    id: 'opera',
    name: 'Opera',
    arrondissement: '9e',
    description: 'Grands boulevards, Palais Garnier, la vie parisienne à son apogée.',
    lng: 2.3316,
    lat: 48.8719,
  },
]


function getClosestQuartier(lat?: number, lng?: number): string | null {
  if (!lat || !lng) return null
  let closest: string | null = null
  let minDist = Infinity
  for (const q of QUARTIERS) {
    const dist = Math.abs(q.lat - lat) + Math.abs(q.lng - lng)
    if (dist < minDist) {
      minDist = dist
      closest = q.id
    }
  }
  return closest
}

const ITEMS_PER_PAGE = 3

export function QuartiersSection({ apartments = [] }: QuartiersSectionProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const _activeQuartier = QUARTIERS.find((q) => q.id === active)

  const filteredApartments = useMemo(() => {
    if (!active) return apartments
    return apartments.filter((apt) => getClosestQuartier(apt.lat, apt.lng) === active)
  }, [active, apartments])

  const totalPages = Math.ceil(filteredApartments.length / ITEMS_PER_PAGE)
  const pagedApartments = filteredApartments.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [2.3488, 48.8634],
      zoom: 12.5,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      scrollZoom: false,
      dragRotate: false,
      touchZoomRotate: false,
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')

    map.on('load', () => {
      try {
        map.setPaintProperty('land', 'background-color', '#f3f3ed')
        map.setPaintProperty('water', 'fill-color', '#e8e4de')
      } catch {
        // layers might not exist in all styles
      }
      QUARTIERS.forEach((q) => {
        const sourceId = `quartier-${q.id}`

        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [q.lng, q.lat],
            },
            properties: {},
          },
        })

        map.addLayer({
          id: `${sourceId}-fill`,
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-radius': 80,
            'circle-color': '#59453d',
            'circle-opacity': 0.06,
          },
        })

        map.addLayer({
          id: `${sourceId}-stroke`,
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-radius': 80,
            'circle-color': 'transparent',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#59453d',
            'circle-stroke-opacity': 0.15,
          },
        })

        const el = document.createElement('div')
        el.className = 'alto-marker'
        el.dataset.quartier = q.id
        el.innerHTML = `<div class="alto-marker-inner" data-arr="${q.arrondissement}"><span class="alto-marker-label">${q.name}</span></div>`
        el.addEventListener('click', () => {
          setActive(q.id)
          map.flyTo({ center: [q.lng, q.lat], zoom: 14, duration: 800 })
        })

        new mapboxgl.Marker({ element: el }).setLngLat([q.lng, q.lat]).addTo(map)
      })
    })

    apartments.forEach((apt) => {
      if (!apt.lat || !apt.lng) return

      const el = document.createElement('div')
      el.className = 'alto-apt-pin'
      el.innerHTML = `<div class="alto-apt-pin-inner">${apt.price}€</div>`

      const imgSrc = apt.image ?? ''
      const imgBlock = imgSrc
        ? `<div style="width:100%;height:140px;overflow:hidden;border-radius:8px 8px 0 0;">
            <img src="${imgSrc}" alt="${apt.name}" style="width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.5s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" />
          </div>`
        : `<div style="width:100%;height:100px;background:#d9d9d9;border-radius:8px 8px 0 0;"></div>`

      const popup = new mapboxgl.Popup({
        offset: [0, -10],
        closeButton: false,
        closeOnClick: true,
        className: 'alto-popup',
        maxWidth: '260px',
      }).setHTML(`
        <a href="/appartements/${apt.slug}" class="alto-popup-card">
          ${imgBlock}
          <div style="padding:12px 14px 14px;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
              <p style="font-weight:700;font-size:15px;color:#301a0a;margin:0;">${apt.name}</p>
              <p style="font-size:12px;color:#82756b;margin:0;white-space:nowrap;">${apt.price}€/nuit</p>
            </div>
            <div style="margin-top:10px;display:flex;align-items:center;gap:4px;">
              <span style="font-size:11px;font-weight:700;color:#301a0a;letter-spacing:0.24px;">Découvrir</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#301a0a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6h7M6.5 3l3 3-3 3"/></svg>
            </div>
          </div>
        </a>
      `)

      popup.on('open', () => {
        const pinInner = el.querySelector('.alto-apt-pin-inner')
        pinInner?.classList.add('alto-apt-pin-active')
        document.querySelectorAll('.alto-apt-pin-inner.alto-apt-pin-active').forEach((other) => {
          if (other !== pinInner) other.classList.remove('alto-apt-pin-active')
        })
      })

      popup.on('close', () => {
        el.querySelector('.alto-apt-pin-inner')?.classList.remove('alto-apt-pin-active')
      })

      const _marker = new mapboxgl.Marker({ element: el })
        .setLngLat([apt.lng, apt.lat])
        .setPopup(popup)
        .addTo(map)

      el.addEventListener('click', () => {
        map.flyTo({ center: [apt.lng!, apt.lat!], zoom: 15, duration: 600 })
      })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [apartments])

  useEffect(() => {
    const map = mapRef.current
    document.querySelectorAll('.alto-marker-inner').forEach((m) => {
      const quartier = (m.closest('.alto-marker') as HTMLElement)?.dataset.quartier
      if (quartier === active) {
        m.classList.add('alto-marker-active')
      } else {
        m.classList.remove('alto-marker-active')
      }
    })

    if (!map || !map.isStyleLoaded()) return
    QUARTIERS.forEach((q) => {
      const isActive = q.id === active
      try {
        map.setPaintProperty(`quartier-${q.id}-fill`, 'circle-opacity', isActive ? 0.12 : 0.06)
        map.setPaintProperty(`quartier-${q.id}-fill`, 'circle-color', isActive ? '#301a0a' : '#59453d')
        map.setPaintProperty(`quartier-${q.id}-stroke`, 'circle-stroke-opacity', isActive ? 0.3 : 0.15)
      } catch {
        // layer might not be ready
      }
    })
  }, [active])

  return (
    <section className="mx-auto max-w-content px-gutter py-section md:px-gutter-md md:py-section-md">
      <style>{`
        .alto-marker-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }
        .alto-marker-inner::before {
          content: attr(data-arr);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #59453d;
          color: #fffff8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.24px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 8px rgba(48, 26, 10, 0.2);
        }
        .alto-marker-inner:hover::before,
        .alto-marker-active::before {
          background: #301a0a;
          transform: scale(1.15);
        }
        .alto-marker-label {
          font-size: 10px;
          font-weight: 700;
          color: #59453d;
          letter-spacing: 0.24px;
          white-space: nowrap;
          text-shadow: 0 1px 3px rgba(255,255,248,0.8);
        }
        .alto-apt-pin-inner {
          background: #fffff8;
          color: #301a0a;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 20px;
          box-shadow: 0 2px 10px rgba(48, 26, 10, 0.18);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          border: 1.5px solid transparent;
        }
        .alto-apt-pin-inner:hover,
        .alto-apt-pin-active {
          background: #301a0a;
          color: #fffff8;
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(48, 26, 10, 0.25);
        }
        .alto-popup {
          pointer-events: auto !important;
        }
        .alto-popup .mapboxgl-popup-content {
          background: #fffff8;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(48, 26, 10, 0.12), 0 2px 8px rgba(48, 26, 10, 0.06);
          padding: 0;
          font-family: 'Manrope', sans-serif;
          overflow: hidden;
          animation: popup-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .alto-popup .mapboxgl-popup-tip {
          display: none;
        }
        .alto-popup-card {
          display: block;
          text-decoration: none;
          color: inherit;
          transition: opacity 0.2s;
        }
        .alto-popup-card:hover {
          opacity: 0.92;
        }
        @keyframes popup-in {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .mapboxgl-ctrl-group {
          border: none !important;
          box-shadow: 0 1px 4px rgba(48, 26, 10, 0.1) !important;
          border-radius: 8px !important;
        }
        .mapboxgl-ctrl-group button {
          border: none !important;
        }
      `}</style>

      <p className="text-silver text-xs font-bold tracking-[0.24px] uppercase">Nos quartiers</p>

      <h2 className="text-coffee mt-4 text-2xl leading-[1.3] font-bold tracking-[-0.48px] md:text-4xl md:tracking-[-0.72px]">
        Au cœur de Paris
      </h2>

      <div className="mt-10 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[1fr_340px]">
        <div
          ref={mapContainer}
          className="h-[350px] overflow-hidden rounded-lg md:h-[480px]"
        />

        <div className="flex max-h-[480px] flex-col gap-3">
          <div className="flex gap-2">
            {QUARTIERS.map((q) => (
              <button
                key={q.id}
                type="button"
                className={`flex-1 rounded-sm px-4 py-2.5 text-xs font-bold tracking-[0.24px] transition-colors ${
                  active === q.id
                    ? 'bg-coffee text-cream'
                    : 'bg-sand text-coffee'
                }`}
                onClick={() => {
                  setActive(active === q.id ? null : q.id)
                  setPage(0)
                  mapRef.current?.flyTo({ center: [q.lng, q.lat], zoom: 14, duration: 800 })
                }}
              >
                {q.name}
              </button>
            ))}
          </div>

          <div className="flex flex-1 flex-col gap-2">
            {pagedApartments.length > 0 ? (
              pagedApartments.map((apt) => (
                <button
                  key={apt.slug}
                  type="button"
                  className="bg-sand hover:bg-sand/80 flex items-center gap-3 rounded-lg p-3 text-left transition-colors"
                  onClick={() => {
                    if (apt.lat && apt.lng) {
                      mapRef.current?.flyTo({ center: [apt.lng, apt.lat], zoom: 15, duration: 800 })
                    }
                  }}
                >
                  {apt.image ? (
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-sm">
                      <img src={apt.image} alt={apt.name} className="size-full object-cover" />
                    </div>
                  ) : (
                    <div className="bg-silver/30 size-12 shrink-0 rounded-sm" />
                  )}
                  <div className="flex-1">
                    <p className="text-coffee text-xs font-bold">{apt.name}</p>
                    <p className="text-taupe text-caption">{apt.price}€/nuit</p>
                  </div>
                  <Link
                    href={`/appartements/${apt.slug}`}
                    className="text-coffee text-caption font-bold underline underline-offset-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Voir
                  </Link>
                </button>
              ))
            ) : (
              <p className="text-taupe py-4 text-center text-xs">Aucun appartement dans ce quartier</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-coffee text-xs font-bold disabled:opacity-30"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                ← Précédent
              </button>
              <span className="text-taupe text-caption tabular-nums">{page + 1}/{totalPages}</span>
              <button
                type="button"
                className="text-coffee text-xs font-bold disabled:opacity-30"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Suivant →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
