import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useAiImageStore } from '@/stores/useAiImageStore'
import { useLocationStore } from '@/stores/useLocationStore'
import { aiService } from '@/services/aiService'
import { feeService } from '@/services/feeService'
import type { PredictionItem, DamageInfo } from '@/types/ai'
import type { SpecFee } from '@/services/feeService'

const DAMAGE_STYLES = {
  NONE:     { bg: 'bg-green-50',  text: 'text-green-800',  label: '양호',       desc: '손상이 감지되지 않았습니다' },
  MINOR:    { bg: 'bg-yellow-50', text: 'text-yellow-800', label: '경미한 손상', desc: '경미한 스크래치가 감지되었습니다' },
  MODERATE: { bg: 'bg-orange-50', text: 'text-orange-800', label: '손상 있음',   desc: '손상이 감지되었습니다' },
  SEVERE:   { bg: 'bg-red-50',    text: 'text-red-800',    label: '심한 손상',   desc: '심한 파손이 감지되었습니다' },
} as const

const RECOMMEND = {
  NONE:     { type: 'share',   msg: '상태가 양호합니다! 나눔으로 등록해보세요' },
  MINOR:    { type: 'share',   msg: '경미한 손상입니다. 나눔도 가능합니다' },
  MODERATE: { type: 'dispose', msg: '손상이 있습니다. 폐기를 권장합니다' },
  SEVERE:   { type: 'dispose', msg: '심한 손상입니다. 폐기를 권장합니다' },
} as const

export default function AiResultPage() {
  const navigate = useNavigate()
  const { imageFile, previewUrl, clear } = useAiImageStore()
  const location = useLocationStore((s) => s.currentLocation)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<PredictionItem[]>([])
  const [damage, setDamage] = useState<DamageInfo | null>(null)
  const [selectedIdx, setSelectedIdx] = useState<number>(0)
  const [specFees, setSpecFees] = useState<SpecFee[]>([])
  const [selectedSpec, setSelectedSpec] = useState<number | null>(null)
  const [specsLoading, setSpecsLoading] = useState(false)

  // AI 예측 호출
  useEffect(() => {
    if (!imageFile) {
      navigate('/ai/predict', { replace: true })
      return
    }

    let cancelled = false
    const predict = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await aiService.predict(imageFile)
        if (cancelled) return
        setResults(res.predictions || [])
        setDamage(res.damage || null)
        setSelectedIdx(0)
      } catch (err: any) {
        if (cancelled) return
        setError(err.message || 'AI 판독에 실패했습니다.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    predict()
    return () => { cancelled = true }
  }, [imageFile, navigate])

  // 품목 선택 시 규격별 수수료 조회
  const selected = results[selectedIdx]
  useEffect(() => {
    if (!selected || !location) {
      setSpecFees([])
      setSelectedSpec(null)
      return
    }

    setSpecsLoading(true)
    setSelectedSpec(null)

    feeService.getSpecFees({
      sido: location.sido,
      sigungu: location.sigungu,
      wasteName: selected.wasteName,
    })
      .then(res => {
        setSpecFees(res.specs)
        if (res.specs.length <= 1) {
          setSelectedSpec(0)
        }
      })
      .catch(() => setSpecFees([]))
      .finally(() => setSpecsLoading(false))
  }, [selected, location])

  const handleRetry = () => {
    clear()
    navigate('/ai/predict')
  }

  const handleShare = () => {
    const spec = selectedSpec !== null ? specFees[selectedSpec] : null
    navigate('/sharing/register', {
      state: {
        aiImage: imageFile,
        aiPreviewUrl: previewUrl,
        aiWasteName: selected?.wasteName,
        aiWasteCategory: selected?.wasteCategory,
        aiSpec: spec?.standard,
        aiFee: spec?.fee,
      },
    })
  }

  const handleDispose = () => {
    if (!selected) return
    const spec = selectedSpec !== null ? specFees[selectedSpec] : null
    if (spec) {
      // 규격이 선택된 경우: 품목을 미리 선택된 상태로 전달
      navigate('/online/search', {
        state: {
          selectedItems: [{
            wasteName: selected.wasteName,
            wasteCategory: selected.wasteCategory || '',
            wasteStandard: spec.standard || '',
            fee: spec.fee,
            qty: 1,
          }],
        },
      })
    } else {
      navigate(`/online/search?keyword=${encodeURIComponent(selected.wasteName)}`)
    }
  }

  const damageLevel = damage?.level || 'NONE'
  const damageStyle = DAMAGE_STYLES[damageLevel]
  const recommend = RECOMMEND[damageLevel]
  const isShareRecommend = recommend.type === 'share'

  return (
    <div>
      <Header title="AI 판독 결과" showBack />
      <div className="pt-14 p-4">
        {/* 이미지 미리보기 */}
        <div className="mb-4 flex h-48 items-center justify-center rounded-2xl bg-gray-100 overflow-hidden">
          {previewUrl ? (
            <img src={previewUrl} alt="업로드된 이미지" className="h-full w-full object-cover" />
          ) : (
            <div className="text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" className="mx-auto mb-2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              <p className="text-xs text-gray-400">업로드된 이미지</p>
            </div>
          )}
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="py-12 text-center">
            <svg className="mx-auto h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="mt-3 text-sm text-gray-500">AI가 이미지를 분석하고 있습니다...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {!loading && error && (
          <div className="rounded-2xl bg-red-50 p-6 text-center mb-6">
            <p className="text-sm font-medium text-red-800 mb-1">판독에 실패했습니다</p>
            <p className="text-xs text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white active:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 결과 없음 */}
        {!loading && !error && results.length === 0 && (
          <div className="rounded-2xl bg-gray-50 p-6 text-center mb-6">
            <p className="text-sm font-medium text-gray-800 mb-1">AI가 판별하지 못했습니다</p>
            <p className="text-xs text-gray-500 mb-4">
              이 품목은 아직 AI 판별이 어렵습니다.<br />
              직접 검색으로 수수료를 조회해 주세요.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => navigate('/fee-check')}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white active:bg-blue-700"
              >
                직접 검색하기
              </button>
              <button
                onClick={handleRetry}
                className="rounded-xl bg-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 active:bg-gray-300"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 판독 결과 목록 */}
        {!loading && !error && results.length > 0 && (
          <>
            <h3 className="mb-3 text-sm font-bold text-gray-900">판독 결과</h3>
            <div className="space-y-2 mb-4">
              {results.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left ${
                    selectedIdx === idx
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    selectedIdx === idx
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedIdx === idx && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{item.wasteName || item.className}</p>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{item.wasteCategory}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* 손상도 표시 */}
            {damage && (
              <div className={`mb-4 rounded-2xl p-4 ${damageStyle.bg}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-bold ${damageStyle.text}`}>{damageStyle.label}</span>
                  {damage.type && (
                    <span className={`text-xs ${damageStyle.text} opacity-70`}>
                      ({Math.round(damage.confidence * 100)}%)
                    </span>
                  )}
                </div>
                <p className={`text-xs ${damageStyle.text} opacity-80`}>{damageStyle.desc}</p>
              </div>
            )}

            {/* 규격 선택 */}
            {specsLoading && (
              <div className="mb-4 rounded-2xl bg-gray-50 p-4 text-center">
                <p className="text-xs text-gray-500">수수료 정보를 불러오는 중...</p>
              </div>
            )}

            {!specsLoading && selected && location && specFees.length === 0 && (
              <div className="mb-4 rounded-2xl bg-gray-50 p-4 text-center">
                <p className="text-sm font-medium text-gray-700">
                  {location.sigungu}의 수수료 정보가 없습니다
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  위치를 변경하거나 수동으로 검색해주세요
                </p>
              </div>
            )}

            {!specsLoading && specFees.length >= 2 && (
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-bold text-gray-900">규격을 선택해주세요</h3>
                <div className="grid grid-cols-3 gap-2">
                  {specFees.map((spec, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSpec(idx)}
                      className={`rounded-xl border p-3 text-center ${
                        selectedSpec === idx
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <p className="text-xs font-medium text-gray-900">{spec.standard}</p>
                      <p className={`mt-1 text-sm font-bold ${
                        selectedSpec === idx ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {spec.fee.toLocaleString()}원
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 수수료 표시 (규격 1개 이하이거나 규격 선택 완료 시) */}
            {!specsLoading && selectedSpec !== null && specFees[selectedSpec] && (
              <div className="mb-4 rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">수수료</span>
                  <span className="text-lg font-bold text-blue-600">
                    {specFees[selectedSpec].fee.toLocaleString()}원
                  </span>
                </div>
                {specFees.length >= 2 && (
                  <p className="mt-1 text-xs text-gray-400">
                    {selected?.wasteName} ({specFees[selectedSpec].standard})
                  </p>
                )}
              </div>
            )}

            {/* 위치 미설정 안내 */}
            {!location && (
              <div className="mb-4 rounded-2xl bg-yellow-50 p-4">
                <p className="text-xs text-yellow-800">
                  위치를 설정하면 해당 지역의 수수료를 바로 확인할 수 있습니다.
                </p>
              </div>
            )}

            {/* 추천 배너 */}
            <div className={`mb-4 rounded-2xl p-4 ${isShareRecommend ? 'bg-green-50' : 'bg-orange-50'}`}>
              <p className={`text-sm font-medium ${isShareRecommend ? 'text-green-800' : 'text-orange-800'}`}>
                {recommend.msg}
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-700 active:bg-gray-50"
                >
                  다시 판독
                </button>
                {isShareRecommend ? (
                  <>
                    <button
                      onClick={handleShare}
                      className="flex-1 rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white active:bg-green-700"
                    >
                      나눔 등록하기
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleDispose}
                      className="flex-1 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white active:bg-blue-700"
                    >
                      폐기 신청하기
                    </button>
                  </>
                )}
              </div>
              {/* 보조 버튼 */}
              <button
                onClick={isShareRecommend ? handleDispose : handleShare}
                className="w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 active:bg-gray-50"
              >
                {isShareRecommend ? '폐기 신청하기' : '나눔 등록하기'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
