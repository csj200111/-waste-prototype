import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useAiImageStore } from '@/stores/useAiImageStore'
import { aiService } from '@/services/aiService'
import type { PredictionItem } from '@/types/ai'

export default function AiResultPage() {
  const navigate = useNavigate()
  const { imageFile, previewUrl, clear } = useAiImageStore()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<PredictionItem[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number>(0)

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

  const selected = results[selectedIdx]

  const handleConfirm = () => {
    if (!selected) return
    // 선택된 품목명으로 수수료 검색 페이지로 이동
    clear()
    navigate(`/fee-check/search?keyword=${encodeURIComponent(selected.wasteName)}`)
  }

  const handleRetry = () => {
    clear()
    navigate('/ai/predict')
  }

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
            <p className="text-sm font-medium text-gray-800 mb-1">판독 결과가 없습니다</p>
            <p className="text-xs text-gray-500 mb-4">다른 이미지로 다시 시도해 주세요.</p>
            <button
              onClick={handleRetry}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white active:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 판독 결과 목록 */}
        {!loading && !error && results.length > 0 && (
          <>
            <h3 className="mb-3 text-sm font-bold text-gray-900">판독 결과</h3>
            <div className="space-y-2 mb-6">
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

            {/* 선택 품목 정보 */}
            {selected && (
              <div className="mb-6 rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">선택 품목</span>
                  <span className="text-sm font-semibold text-gray-900">{selected.wasteName || selected.className}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">카테고리</span>
                  <span className="text-sm text-gray-900">{selected.wasteCategory}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">정확도</span>
                  <span className="text-sm font-bold text-blue-600">{Math.round(selected.confidence * 100)}%</span>
                </div>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-700 active:bg-gray-50"
              >
                다시 판독
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white active:bg-blue-700"
              >
                품목 검색
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
