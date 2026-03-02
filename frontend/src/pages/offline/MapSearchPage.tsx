import { useState, useRef, useEffect, useCallback } from 'react'
import Header from '@/components/layout/Header'
import MapView from '@/components/map/MapView'
import type { MapViewHandle } from '@/components/map/MapView'
import LocationCard from '@/components/map/LocationCard'
import { createMapAdapter } from '@/lib/map/createMapAdapter'
import type { PlaceResult } from '@/lib/map/MapAdapter'
import { useLocationStore } from '@/stores/useLocationStore'

type Tab = 'disposal' | 'sticker'

const TAB_CONFIG: Record<Tab, { label: string; icon: JSX.Element; keywords: string[]; emptyText: string }> = {
  disposal: {
    label: '폐기물 처리업체',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    keywords: ['폐기물 처리업체', '대형폐기물 처리', '폐기물 수거'],
    emptyText: '주변에 폐기물 처리업체가 없습니다',
  },
  sticker: {
    label: '스티커 판매소',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    keywords: ['편의점', '주민센터'],
    emptyText: '주변에 스티커 판매소가 없습니다',
  },
}

export default function MapSearchPage() {
  const mapRef = useRef<MapViewHandle>(null)
  const adapterRef = useRef(createMapAdapter())
  const loc = useLocationStore((s) => s.currentLocation)

  const [activeTab, setActiveTab] = useState<Tab>('disposal')
  const [keyword, setKeyword] = useState('')
  const [places, setPlaces] = useState<PlaceResult[]>([])
  const [loading, setLoading] = useState(false)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsLoading, setGpsLoading] = useState(true)

  // GPS 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setGpsLoading(false)
        },
        () => {
          if (loc) {
            setUserPos({ lat: loc.latitude, lng: loc.longitude })
          } else {
            setUserPos({ lat: 37.5665, lng: 126.978 })
          }
          setGpsLoading(false)
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    } else {
      if (loc) {
        setUserPos({ lat: loc.latitude, lng: loc.longitude })
      } else {
        setUserPos({ lat: 37.5665, lng: 126.978 })
      }
      setGpsLoading(false)
    }
  }, [loc])

  const searchByTab = useCallback(async (tab: Tab, customKeyword?: string) => {
    if (!userPos) return

    const kw = customKeyword?.trim()
    setLoading(true)

    if (kw) {
      const results = await adapterRef.current.searchNearby(kw, userPos.lat, userPos.lng, 5000)
      setPlaces(results)
    } else {
      const config = TAB_CONFIG[tab]
      const allResults = await Promise.all(
        config.keywords.map((k) => adapterRef.current.searchNearby(k, userPos.lat, userPos.lng, 5000))
      )
      const merged = allResults.flat()

      const seen = new Set<string>()
      const unique = merged.filter((p) => {
        const key = `${p.name}_${p.address}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      setPlaces(unique)
    }

    setLoading(false)
  }, [userPos])

  // GPS 위치 확보 후 자동 검색
  useEffect(() => {
    if (userPos && !gpsLoading) {
      searchByTab(activeTab)
    }
  }, [userPos, gpsLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setKeyword('')
    searchByTab(tab)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') searchByTab(activeTab, keyword)
  }

  const handlePlaceClick = (place: PlaceResult) => {
    mapRef.current?.panTo(place.lat, place.lng)
  }

  const markers = places.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    title: p.name,
  }))

  const allMarkers = userPos
    ? [{ lat: userPos.lat, lng: userPos.lng, title: '내 위치' }, ...markers]
    : markers

  const config = TAB_CONFIG[activeTab]

  return (
    <div>
      <Header title="주변 시설 찾기" showBack showNotification />
      <div className="pt-14 flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
        {/* 탭 */}
        <div className="flex border-b border-gray-100">
          {(Object.entries(TAB_CONFIG) as [Tab, typeof TAB_CONFIG[Tab]][]).map(([key, tab]) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                activeTab === key
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-400'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 검색 바 */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activeTab === 'disposal' ? '처리업체명, 주소 검색' : '편의점, 주민센터 검색'}
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
            />
            {keyword && (
              <button onClick={() => { setKeyword(''); searchByTab(activeTab) }} className="text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 지도 영역 */}
        {gpsLoading ? (
          <div className="flex items-center justify-center bg-gray-50" style={{ height: 300 }}>
            <p className="text-sm text-gray-400">위치를 확인하는 중...</p>
          </div>
        ) : (
          <MapView ref={mapRef} markers={allMarkers} className="!rounded-none" />
        )}

        {/* 시설 목록 */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-3 pb-1">
            <h3 className="text-sm font-bold text-gray-900">
              {loading ? '검색 중...' : `${config.label} ${places.length}곳`}
            </h3>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {!loading && places.length === 0 && !gpsLoading && (
              <div className="rounded-2xl bg-gray-50 py-10 text-center">
                <p className="text-sm text-gray-400">{config.emptyText}</p>
                <p className="mt-1 text-xs text-gray-300">검색 범위를 넓혀 다시 시도해 보세요</p>
              </div>
            )}
            {!loading && places.map((place, idx) => (
              <LocationCard
                key={idx}
                name={place.name}
                address={place.address}
                phone={place.phone}
                onClick={() => handlePlaceClick(place)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
