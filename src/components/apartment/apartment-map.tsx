'use client'

import { useEffect, useRef, useState } from 'react'
import { type Map as MapboxMap } from 'mapbox-gl'
import { useLocale } from '@/components/providers/locale-provider'

interface ApartmentMapProps {
  name: string
  lat?: number
  lng?: number
  address?: string
  neighborhood?: string
}

export function ApartmentMap({ name, lat, lng, address, neighborhood }: ApartmentMapProps) {
  const locale = useLocale()
  const copy = MAP_COPY[locale]
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapboxMap | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const hasCoordinates = typeof lat === 'number' && typeof lng === 'number'

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token || !hasCoordinates || !mapContainerRef.current) return

    let cancelled = false
    let mapInstance: MapboxMap | null = null
    let handleLoad: (() => void) | null = null

    async function initMap() {
      const mapboxgl = (await import('mapbox-gl')).default
      if (cancelled || !mapContainerRef.current || !hasCoordinates) return

      mapboxgl.accessToken = token

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [lng, lat],
        zoom: 14.2,
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
          // Les noms de couches peuvent varier selon le style Mapbox.
        }

        const markerElement = document.createElement('div')
        markerElement.className = 'alto-apartment-map-pin'
        markerElement.setAttribute('aria-label', name)

        new mapboxgl.Marker({ element: markerElement, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .addTo(map)
      }

      map.on('load', handleLoad)
    }

    void initMap()

    return () => {
      cancelled = true
      if (mapInstance && handleLoad) mapInstance.off('load', handleLoad)
      mapInstance?.remove()
      mapRef.current = null
      setIsLoaded(false)
    }
  }, [address, hasCoordinates, lat, lng, name])

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return <ApartmentMapPlaceholder message={copy.unavailable} />
  }

  if (!hasCoordinates) {
    return <ApartmentMapPlaceholder message={copy.missingAddress} />
  }

  return (
    <div className="border-divider bg-sand/40 relative overflow-hidden rounded-lg border">
      <style>{`
        .alto-apartment-map-pin {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          background: #301a0a;
          border: 7px solid #fffff8;
          box-shadow: 0 12px 28px rgba(48, 26, 10, 0.2);
        }
        .alto-apartment-map-pin::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #fffff8;
          transform: translate(-50%, -50%);
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

      <div
        ref={mapContainerRef}
        className="h-apartment-location-map md:h-apartment-location-map-md"
      />

      <div className="from-cream/80 pointer-events-none absolute inset-x-0 top-0 bg-linear-to-b to-transparent p-5">
        <p className="text-coffee text-body-xl font-semibold">{neighborhood || address}</p>
        {address ? <p className="text-ash text-body-sm mt-1">{address}</p> : null}
      </div>

      {!isLoaded ? (
        <div className="bg-sand/70 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
          <p className="text-taupe text-xs font-bold tracking-[0.24px] uppercase">{copy.loading}</p>
        </div>
      ) : null}
    </div>
  )
}

const MAP_COPY = {
  fr: {
    unavailable: 'La carte n’est pas disponible pour le moment.',
    missingAddress: 'Adresse non géolocalisée pour cet appartement.',
    loading: 'Chargement de la carte',
  },
  en: {
    unavailable: 'The map is currently unavailable.',
    missingAddress: 'This apartment does not have a geolocated address.',
    loading: 'Loading map',
  },
} as const

function ApartmentMapPlaceholder({ message }: { message: string }) {
  return (
    <div className="h-apartment-location-map border-divider bg-sand/40 md:h-apartment-location-map-md flex items-center justify-center rounded-lg border p-8 text-center">
      <p className="text-taupe text-xs font-bold tracking-[0.24px] uppercase">{message}</p>
    </div>
  )
}
