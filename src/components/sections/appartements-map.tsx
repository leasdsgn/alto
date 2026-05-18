'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { type Map as MapboxMap } from 'mapbox-gl'
import { useLocale } from '@/components/providers/locale-provider'

interface Apartment {
  name: string
  price: number
  slug: string
  image?: string
  lat?: number
  lng?: number
  city?: string
  address?: string
  neighborhoodLabel?: string
  priceSource?: 'base' | 'quote'
}

export function AppartementsMap({ apartments }: { apartments: Apartment[] }) {
  const locale = useLocale()
  const copy = MAP_COPY[locale]
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapboxMap | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const mappableApartments = useMemo(
    () => apartments.filter((apartment) => apartment.lat && apartment.lng),
    [apartments],
  )

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token || !mapContainerRef.current || mappableApartments.length === 0) return

    let cancelled = false
    let mapInstance: MapboxMap | null = null
    let handleLoad: (() => void) | null = null
    const cleanups: Array<() => void> = []

    async function initMap() {
      const mapboxgl = (await import('mapbox-gl')).default
      if (cancelled || !mapContainerRef.current) return

      mapboxgl.accessToken = token

      const center = getMapCenter(mappableApartments)
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center,
        zoom: 12.5,
        pitch: 0,
        bearing: 0,
        attributionControl: false,
        scrollZoom: false,
        dragRotate: false,
        touchZoomRotate: false,
      })

      mapInstance = map
      mapRef.current = map
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')
      requestAnimationFrame(() => map.resize())

      handleLoad = () => {
        if (cancelled) return
        setIsLoaded(true)
        map.resize()

        try {
          map.setPaintProperty('land', 'background-color', '#f3f3ed')
          map.setPaintProperty('water', 'fill-color', '#e8e4de')
        } catch {
          // Certaines couches changent selon le style Mapbox.
        }

        const bounds = new mapboxgl.LngLatBounds()

        mappableApartments.forEach((apartment) => {
          if (!apartment.lng || !apartment.lat) return

          bounds.extend([apartment.lng, apartment.lat])

          const markerElement = document.createElement('button')
          markerElement.type = 'button'
          markerElement.className = 'alto-results-pin'
          markerElement.innerHTML = `<span class="alto-results-pin-inner">${getPricePrefix(apartment.priceSource, copy.fromShort)}${Math.round(apartment.price)}€</span>`

          const popupCard = document.createElement('a')
          popupCard.href = `/appartements/${apartment.slug}`
          popupCard.className = 'alto-results-popup'

          if (apartment.image) {
            const media = document.createElement('div')
            media.className = 'alto-results-popup-media'

            const image = document.createElement('img')
            image.src = apartment.image
            image.alt = apartment.name
            image.loading = 'lazy'

            media.appendChild(image)
            popupCard.appendChild(media)
          }

          const body = document.createElement('div')
          body.className = 'alto-results-popup-body'

          const heading = document.createElement('div')
          heading.className = 'alto-results-popup-heading'

          const name = document.createElement('p')
          name.className = 'alto-results-popup-name'
          name.textContent = apartment.name

          const price = document.createElement('p')
          price.className = 'alto-results-popup-price'
          price.textContent = `${getPricePrefix(apartment.priceSource, copy.from)}${Math.round(apartment.price)}€${copy.perNight}`

          heading.append(name, price)

          const meta = document.createElement('p')
          meta.className = 'alto-results-popup-meta'
          meta.textContent =
            apartment.neighborhoodLabel || apartment.address || apartment.city || copy.discover

          const cta = document.createElement('div')
          cta.className = 'alto-results-popup-cta'
          cta.innerHTML =
            `<span>${copy.viewApartment}</span><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6h7M6.5 3l3 3-3 3"/></svg>`

          body.append(heading, meta, cta)
          popupCard.appendChild(body)

          const popup = new mapboxgl.Popup({
            offset: [0, -14],
            closeButton: false,
            closeOnClick: true,
            className: 'alto-results-popup-shell',
            maxWidth: '280px',
          }).setDOMContent(popupCard)

          const handlePopupOpen = () => {
            const inner = markerElement.querySelector('.alto-results-pin-inner')
            inner?.classList.add('alto-results-pin-active')
            document.querySelectorAll('.alto-results-pin-inner.alto-results-pin-active').forEach((other) => {
              if (other !== inner) other.classList.remove('alto-results-pin-active')
            })
          }

          const handlePopupClose = () => {
            markerElement
              .querySelector('.alto-results-pin-inner')
              ?.classList.remove('alto-results-pin-active')
          }

          popup.on('open', handlePopupOpen)
          popup.on('close', handlePopupClose)
          cleanups.push(() => {
            popup.off('open', handlePopupOpen)
            popup.off('close', handlePopupClose)
          })

          new mapboxgl.Marker({ element: markerElement })
            .setLngLat([apartment.lng, apartment.lat])
            .setPopup(popup)
            .addTo(map)

          const handleMarkerClick = () => {
            map.flyTo({ center: [apartment.lng as number, apartment.lat as number], zoom: 15, duration: 650 })
          }

          markerElement.addEventListener('click', handleMarkerClick)
          cleanups.push(() => markerElement.removeEventListener('click', handleMarkerClick))
        })

        if (mappableApartments.length === 1) {
          map.flyTo({ center, zoom: 13.5, duration: 0 })
          return
        }

        map.fitBounds(bounds, {
          padding: 80,
          maxZoom: 13.25,
          duration: 0,
        })
      }

      map.on('load', handleLoad)
    }

    void initMap()

    return () => {
      cancelled = true
      cleanups.forEach((cleanup) => cleanup())
      if (mapInstance && handleLoad) mapInstance.off('load', handleLoad)
      mapInstance?.remove()
      mapRef.current = null
      setIsLoaded(false)
    }
  }, [copy.discover, copy.from, copy.fromShort, copy.perNight, copy.viewApartment, mappableApartments])

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return <MapPlaceholder message={copy.unavailable} />
  }

  if (mappableApartments.length === 0) {
    return <MapPlaceholder message={copy.empty} />
  }

  return (
    <div className="relative h-results-panel overflow-hidden rounded-xl border border-divider bg-sand/40">
      <style>{`
        .alto-results-pin {
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        .alto-results-pin-inner {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 56px;
          height: 36px;
          padding: 0 14px;
          border-radius: 999px;
          background: #fffff8;
          color: #301a0a;
          border: 1px solid rgba(171, 163, 158, 0.5);
          box-shadow: 0 10px 24px rgba(48, 26, 10, 0.12);
          font-family: 'Manrope', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.24px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .alto-results-pin-inner:hover,
        .alto-results-pin-active {
          background: #301a0a;
          color: #fffff8;
          border-color: #301a0a;
          transform: scale(1.06);
        }
        .alto-results-popup-shell {
          pointer-events: auto !important;
        }
        .alto-results-popup-shell .mapboxgl-popup-content {
          padding: 0;
          overflow: hidden;
          border-radius: 12px;
          background: #fffff8;
          box-shadow: 0 18px 40px rgba(48, 26, 10, 0.16);
        }
        .alto-results-popup-shell .mapboxgl-popup-tip {
          display: none;
        }
        .alto-results-popup {
          display: block;
          color: inherit;
          text-decoration: none;
        }
        .alto-results-popup-media {
          height: 144px;
          overflow: hidden;
          background: #e8e8e2;
        }
        .alto-results-popup-media img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .alto-results-popup-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px;
          font-family: 'Manrope', sans-serif;
        }
        .alto-results-popup-heading {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
        }
        .alto-results-popup-name {
          margin: 0;
          color: #301a0a;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.3;
        }
        .alto-results-popup-price {
          margin: 0;
          color: #82756b;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.55;
          letter-spacing: 0.24px;
          white-space: nowrap;
        }
        .alto-results-popup-meta {
          margin: 0;
          color: #59453d;
          font-size: 12px;
          font-weight: 400;
          line-height: 1.55;
          letter-spacing: 0.24px;
        }
        .alto-results-popup-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #301a0a;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.55;
          letter-spacing: 0.24px;
        }
        .mapboxgl-ctrl-group {
          border: none !important;
          box-shadow: 0 8px 24px rgba(48, 26, 10, 0.08) !important;
          border-radius: 10px !important;
          overflow: hidden;
        }
        .mapboxgl-ctrl-group button {
          border: none !important;
        }
      `}</style>

      <div ref={mapContainerRef} className="size-full" />

      {!isLoaded ? (
        <div className="bg-sand/70 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
          <p className="text-taupe text-xs font-bold uppercase tracking-[0.24px]">
            {copy.loading}
          </p>
        </div>
      ) : null}
    </div>
  )
}

const MAP_COPY = {
  fr: {
    from: 'Dès',
    fromShort: 'Dès',
    perNight: '/nuit',
    discover: 'Découvrir',
    viewApartment: 'Voir l’appartement',
    unavailable: 'La carte n’est pas disponible pour le moment.',
    empty: 'Aucun appartement géolocalisé à afficher sur la carte.',
    loading: 'Chargement de la carte',
  },
  en: {
    from: 'From',
    fromShort: 'From',
    perNight: '/night',
    discover: 'Discover',
    viewApartment: 'View apartment',
    unavailable: 'The map is not available right now.',
    empty: 'No geolocated apartment to display on the map.',
    loading: 'Loading map',
  },
} as const

function getPricePrefix(priceSource: Apartment['priceSource'], from: string) {
  return priceSource === 'quote' ? '' : `${from} `
}

function getMapCenter(apartments: Array<{ lat?: number; lng?: number }>): [number, number] {
  const valid = apartments.filter(hasCoordinates)

  if (valid.length === 0) return [2.3488, 48.8634]

  const totals = valid.reduce(
    (acc, apartment) => ({
      lat: acc.lat + apartment.lat,
      lng: acc.lng + apartment.lng,
    }),
    { lat: 0, lng: 0 },
  )

  return [totals.lng / valid.length, totals.lat / valid.length]
}

function hasCoordinates(apartment: {
  lat?: number
  lng?: number
}): apartment is { lat: number; lng: number } {
  return typeof apartment.lat === 'number' && typeof apartment.lng === 'number'
}

function MapPlaceholder({ message }: { message: string }) {
  return (
    <div className="flex h-[420px] items-center justify-center rounded-xl border border-divider bg-sand/40 p-8 text-center md:h-[520px]">
      <p className="text-taupe text-xs font-bold uppercase tracking-[0.24px]">{message}</p>
    </div>
  )
}
