import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import MapView from '@/components/map/MapView'
import type { MapViewHandle } from '@/components/map/MapView'
import LocationCard from '@/components/map/LocationCard'
import { regionService } from '@/services/regionService'
import { createMapAdapter } from '@/lib/map/createMapAdapter'
import type { PlaceResult } from '@/lib/map/MapAdapter'

export default function StickerShopsPage() {
  const navigate = useNavigate()
  const mapRef = useRef<MapViewHandle>(null)
  const [sidoList, setSidoList] = useState<string[]>([])
  const [sigunguList, setSigunguList] = useState<string[]>([])
  const [selectedSido, setSelectedSido] = useState('')
  const [selectedSigungu, setSelectedSigungu] = useState('')
  const [places, setPlaces] = useState<PlaceResult[]>([])
  const [loading, setLoading] = useState(false)
  const adapterRef = useRef(createMapAdapter())

  useEffect(() => {
    regionService.getSido().then(setSidoList)
  }, [])

  const handleSidoChange = (sido: string) => {
    setSelectedSido(sido)
    setSelectedSigungu('')
    setPlaces([])
    if (sido) {
      regionService.getSigungu(sido).then(setSigunguList)
    } else {
      setSigunguList([])
    }
  }

  const handleSigunguChange = async (sigungu: string) => {
    setSelectedSigungu(sigungu)
    if (!sigungu) {
      setPlaces([])
      return
    }

    setLoading(true)
    const region = `${selectedSido} ${sigungu}`
    const results = await adapterRef.current.searchPlaces('편의점 마트', region)
    setPlaces(results)
    setLoading(false)
  }

  const markers = places.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    title: p.name,
  }))

  return (
    <div>
      <Header title="스티커 판매소" showBack onBack={() => navigate(-1)} />
      <div className="p-4 pt-18 space-y-4">
        <div className="flex gap-2">
          <select
            className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-sm bg-white"
            value={selectedSido}
            onChange={(e) => handleSidoChange(e.target.value)}
          >
            <option value="">시/도 선택</option>
            {sidoList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-sm bg-white"
            value={selectedSigungu}
            onChange={(e) => handleSigunguChange(e.target.value)}
            disabled={!selectedSido}
          >
            <option value="">시/군/구 선택</option>
            {sigunguList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <MapView ref={mapRef} markers={markers} />

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            판매소 목록 ({places.length}건)
          </p>
          <div className="space-y-2">
            {loading && (
              <p className="text-sm text-gray-400 text-center py-8">
                검색 중...
              </p>
            )}
            {!loading && places.map((place, idx) => (
              <LocationCard
                key={idx}
                name={place.name}
                address={place.address}
                phone={place.phone}
                onClick={() => mapRef.current?.panTo(place.lat, place.lng)}
              />
            ))}
            {!loading && places.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                지역을 선택하면 주변 편의점/마트가 표시됩니다
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
