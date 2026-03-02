import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import SearchBar from '@/components/ui/SearchBar'
import Button from '@/components/ui/Button'
import MapView from '@/components/map/MapView'
import type { MapViewHandle } from '@/components/map/MapView'
import { createMapAdapter } from '@/lib/map/createMapAdapter'
import type { PlaceResult } from '@/lib/map/MapAdapter'
import { useLocationStore } from '@/stores/useLocationStore'

export default function ManualLocationPage() {
  const navigate = useNavigate()
  const setLocation = useLocationStore((s) => s.setLocation)
  const mapRef = useRef<MapViewHandle>(null)
  const adapterRef = useRef(createMapAdapter())
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [selected, setSelected] = useState<PlaceResult | null>(null)
  const [searching, setSearching] = useState(false)

  // coord2RegionCode로 가져온 정확한 행정구역
  const regionRef = useRef({ sido: '', sigungu: '', dong: '' })

  const reverseGeocode = (lat: number, lng: number) => {
    const kakao = (window as any).kakao
    if (!kakao?.maps?.services) return

    const geocoder = new kakao.maps.services.Geocoder()
    geocoder.coord2RegionCode(lng, lat, (result: any[], status: string) => {
      if (status !== kakao.maps.services.Status.OK || result.length === 0) return

      const r = result.find((item: any) => item.region_type === 'H') || result[0]
      regionRef.current = {
        sido: r.region_1depth_name || '',
        sigungu: r.region_2depth_name || '',
        dong: r.region_3depth_name || '',
      }
    })
  }

  const handleSearch = async (value: string) => {
    setKeyword(value)
    if (value.length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    const places = await adapterRef.current.searchPlaces(value, '')
    setResults(places)
    setSearching(false)
  }

  const handleSelect = (place: PlaceResult) => {
    setSelected(place)
    setResults([])
    setKeyword(place.address || place.name)
    mapRef.current?.panTo(place.lat, place.lng)

    // 선택된 장소의 좌표로 역지오코딩 → 정확한 시도/시군구 획득
    reverseGeocode(place.lat, place.lng)
  }

  const markers = selected
    ? [{ lat: selected.lat, lng: selected.lng, title: selected.name }]
    : []

  const handleConfirm = () => {
    if (!selected) return

    const { sido, sigungu, dong } = regionRef.current

    setLocation({
      latitude: selected.lat,
      longitude: selected.lng,
      address: selected.address,
      dong: dong || '',
      sigungu: sigungu || '',
      sido: sido || '',
    })
    navigate('/')
  }

  return (
    <div>
      <Header title="주소로 설정" showBack showNotification />
      <div className="pt-14 p-4 space-y-4">
        <SearchBar
          value={keyword}
          onChange={handleSearch}
          placeholder="주소 검색 (예: 구의동, 강남대로 123)"
        />
        <p className="text-xs text-gray-400">동/도로명/건물명으로 검색할 수 있어요.</p>

        {/* 검색 결과 드롭다운 */}
        {results.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
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
        {searching && (
          <p className="text-sm text-gray-400 text-center py-2">검색 중...</p>
        )}

        <MapView ref={mapRef} markers={markers} />

        {selected && (
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">선택된 주소</p>
            <p className="mt-1 text-lg font-bold">{selected.name}</p>
            <p className="text-xs text-gray-400">{selected.address}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button fullWidth onClick={handleConfirm} disabled={!selected}>
            이 위치로 설정
          </Button>
          <button
            onClick={() => navigate('/location/auto')}
            className="w-full text-center text-sm text-gray-500"
          >
            현재 위치로 설정
          </button>
        </div>
      </div>
    </div>
  )
}
