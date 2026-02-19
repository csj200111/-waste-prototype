import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import { offlineService } from '@/services/offlineService'
import { regionService } from '@/services/regionService'
import type { WasteFacility } from '@/types/offline'

export default function TransportPage() {
  const navigate = useNavigate()

  const [sidoList, setSidoList] = useState<string[]>([])
  const [sigunguList, setSigunguList] = useState<string[]>([])
  const [selectedSido, setSelectedSido] = useState('')
  const [selectedSigungu, setSelectedSigungu] = useState('')
  const [facilities, setFacilities] = useState<WasteFacility[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    regionService.getSido().then(setSidoList)
  }, [])

  useEffect(() => {
    if (!selectedSido) {
      setSigunguList([])
      setSelectedSigungu('')
      return
    }
    regionService.getSigungu(selectedSido).then(setSigunguList)
    setSelectedSigungu('')
  }, [selectedSido])

  useEffect(() => {
    if (!selectedSido) return
    setLoading(true)
    setSearched(true)
    offlineService
      .getWasteFacilities(selectedSido, selectedSigungu || undefined)
      .then(setFacilities)
      .finally(() => setLoading(false))
  }, [selectedSido, selectedSigungu])

  return (
    <div>
      <Header title="운반 대행" showBack onBack={() => navigate(-1)} />
      <div className="p-4 pt-18 space-y-4">
        <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-bold mb-1">🚛 운반 대행 안내</p>
          <p className="text-xs">
            지역을 선택하면 해당 지역의 폐기물 처리 업소 정보를 확인할 수 있습니다.
          </p>
        </div>

        {/* 지역 선택 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">지역 선택</label>
          <div className="flex gap-2">
            <select
              value={selectedSido}
              onChange={(e) => setSelectedSido(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white"
            >
              <option value="">시/도 선택</option>
              {sidoList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={selectedSigungu}
              onChange={(e) => setSelectedSigungu(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white"
              disabled={!selectedSido}
            >
              <option value="">시/군/구 선택</option>
              {sigunguList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 결과 카운트 */}
        {searched && !loading && (
          <p className="text-xs text-gray-500">
            총 <span className="font-semibold text-gray-700">{facilities.length}</span>개 업소
          </p>
        )}

        {/* 업소 목록 */}
        <div className="space-y-3">
          {loading && (
            <p className="text-sm text-gray-400 text-center py-8">
              업소 정보를 불러오는 중...
            </p>
          )}

          {!loading && facilities.map((f) => (
            <Card key={f.id}>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{f.name}</div>
                    <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                      {f.businessType}
                    </span>
                  </div>
                  {f.phone && (
                    <a
                      href={`tel:${f.phone}`}
                      className="flex-shrink-0 bg-primary text-white text-xs px-3 py-2 rounded-lg font-medium"
                    >
                      📞 전화
                    </a>
                  )}
                </div>
                {f.roadAddress && (
                  <p className="text-xs text-gray-500">{f.roadAddress}</p>
                )}
                {f.specialtyArea && (
                  <p className="text-xs text-gray-400">전문분야: {f.specialtyArea}</p>
                )}
                {f.serviceArea && (
                  <p className="text-xs text-gray-400">영업구역: {f.serviceArea}</p>
                )}
              </div>
            </Card>
          ))}

          {!loading && searched && facilities.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              해당 지역에 등록된 폐기물 처리 업소가 없습니다.
            </p>
          )}

          {!searched && (
            <p className="text-sm text-gray-400 text-center py-8">
              시/도를 선택하면 해당 지역의 업소를 조회합니다.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
