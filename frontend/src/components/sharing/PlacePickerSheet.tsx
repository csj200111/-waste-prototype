import { useState, useRef, useEffect } from 'react'
import MapView from '@/components/map/MapView'
import type { MapViewHandle } from '@/components/map/MapView'
import { createMapAdapter } from '@/lib/map/createMapAdapter'
import type { PlaceResult } from '@/lib/map/MapAdapter'

interface PlacePickerSheetProps {
  initialPlace: string
  initialDetail: string
  dong: string
  onConfirm: (place: string, detail: string, coords: { lat: number; lng: number } | null) => void
  onClose: () => void
}

export default function PlacePickerSheet({
  initialPlace,
  initialDetail,
  dong,
  onConfirm,
  onClose,
}: PlacePickerSheetProps) {
  const mapRef = useRef<MapViewHandle>(null)
  const adapterRef = useRef(createMapAdapter())

  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [selected, setSelected] = useState<PlaceResult | null>(null)
  const [placeName, setPlaceName] = useState(initialPlace)
  const [detail, setDetail] = useState(initialDetail)
  const [searching, setSearching] = useState(false)

  const popStateRef = useRef<(() => void) | null>(null)
  useEffect(() => {
    history.pushState({ placePicker: true }, '')
    const handler = () => onClose()
    popStateRef.current = handler
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [onClose])

  const handleClose = () => {
    history.back()
  }

  const handleConfirm = () => {
    if (popStateRef.current) {
      window.removeEventListener('popstate', popStateRef.current)
    }
    history.back()
    onConfirm(placeName, detail, selected ? { lat: selected.lat, lng: selected.lng } : null)
  }

  const handleSearch = async () => {
    if (keyword.length < 2) return
    setSearching(true)
    const places = await adapterRef.current.searchPlaces(keyword, '')
    setResults(places)
    setSearching(false)
  }

  const handleSelect = (place: PlaceResult) => {
    setSelected(place)
    setResults([])
    setPlaceName(place.name)
    setKeyword(place.name)
    mapRef.current?.panTo(place.lat, place.lng)
  }

  const markers = selected
    ? [{ lat: selected.lat, lng: selected.lng, title: selected.name }]
    : []

  return (
    <div className="fixed inset-0 bottom-14 z-40 flex justify-center bg-black/40">
      <div className="relative flex h-full w-full max-w-[428px] flex-col bg-white">
        <header className="flex h-14 shrink-0 items-center border-b border-gray-200 px-4">
          <button onClick={handleClose} className="mr-3 text-gray-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h3 className="text-base font-semibold">희망 거래 장소</h3>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" strokeWidth="2"/><path d="M21 21l-4.35-4.35" strokeWidth="2"/>
              </svg>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="장소 검색 (예: 역삼역, 주민센터)"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="shrink-0 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white active:bg-gray-700"
            >
              검색
            </button>
          </div>

          {searching && (
            <p className="text-center text-sm text-gray-400 py-2">검색 중...</p>
          )}
          {results.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm max-h-40 overflow-y-auto">
              {results.map((place, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(place)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 border-b border-gray-50 last:border-0"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">{place.name}</p>
                  <p className="text-xs text-gray-400 truncate">{place.address}</p>
                </button>
              ))}
            </div>
          )}

          <MapView ref={mapRef} markers={markers} />

          {selected && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="mt-0.5 shrink-0">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selected.name}</p>
                  <p className="text-xs text-gray-500">{selected.address}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              상세 위치 (선택)
            </label>
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={`예: 1층 정문 앞, ${dong} 주민센터 옆 벤치`}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 placeholder-gray-400"
            />
          </div>

          {!selected && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                또는 장소명 직접 입력
              </label>
              <input
                type="text"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder={`예: ${dong} 주민센터 앞`}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 placeholder-gray-400"
              />
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            onClick={handleConfirm}
            disabled={!placeName.trim()}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white active:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            이 장소로 설정
          </button>
        </div>
      </div>
    </div>
  )
}
