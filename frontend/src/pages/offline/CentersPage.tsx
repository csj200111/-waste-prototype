import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import MapPlaceholder from '@/components/map/MapPlaceholder'
import LocationCard from '@/components/map/LocationCard'
import { offlineService } from '@/services/offlineService'
import { regionService } from '@/services/regionService'

export default function CentersPage() {
  const navigate = useNavigate()
  const regions = regionService.getRegions()
  const districts = [...new Set(regions.map((r) => r.district))]
  const [selectedDistrict, setSelectedDistrict] = useState(districts[0] ?? '')

  const selectedRegion = regions.find((r) => r.district === selectedDistrict)
  const centers = useMemo(
    () => offlineService.getCommunityCenters(selectedRegion?.id),
    [selectedRegion?.id],
  )

  return (
    <div>
      <Header title="동사무소/주민센터" showBack onBack={() => navigate(-1)} />
      <div className="p-4 pt-18 space-y-4">
        <select
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white"
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
        >
          {districts.map((d) => (
            <option key={d} value={d}>서울특별시 {d}</option>
          ))}
        </select>

        <MapPlaceholder />

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            주민센터 목록 ({centers.length}건)
          </p>
          <div className="space-y-2">
            {centers.map((c) => (
              <LocationCard key={c.id} name={c.name} address={c.address} phone={c.phone} />
            ))}
            {centers.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                해당 지역의 주민센터 정보가 없습니다
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
