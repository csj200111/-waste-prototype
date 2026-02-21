import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import PhotoCapture from '@/features/ai/PhotoCapture'
import PredictionResult from '@/features/ai/PredictionResult'
import { aiService } from '@/services/aiService'
import type { PredictionItem } from '@/types/ai'

type PageState = 'capture' | 'loading' | 'result'

export default function AiPredictPage() {
  const navigate = useNavigate()

  const [pageState, setPageState] = useState<PageState>('capture')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<PredictionItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleImageSelect = (file: File, preview: string) => {
    setSelectedImage(file)
    setPreviewUrl(preview)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!selectedImage) return

    setPageState('loading')
    setError(null)

    try {
      const result = await aiService.predict(selectedImage)
      setPredictions(result.predictions)
      setPageState('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI 분석 중 오류가 발생했습니다.')
      setPageState('capture')
    }
  }

  const handleRetry = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedImage(null)
    setPreviewUrl(null)
    setPredictions([])
    setError(null)
    setPageState('capture')
  }

  const handleFeeCheck = (wasteName: string) => {
    if (wasteName) {
      navigate(`/fee-check?wasteName=${encodeURIComponent(wasteName)}`)
    } else {
      navigate('/fee-check')
    }
  }

  return (
    <div>
      <Header title="AI 사진 식별" showBack onBack={() => navigate(-1)} />
      <div className="p-4 pt-18 space-y-4">

        {/* 이미지 미리보기 */}
        {previewUrl && (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <img
              src={previewUrl}
              alt="선택한 사진"
              className="w-full object-contain max-h-64"
            />
          </div>
        )}

        {/* 캡처 상태 */}
        {pageState === 'capture' && (
          <>
            {!previewUrl && <PhotoCapture onImageSelect={handleImageSelect} />}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {previewUrl && (
              <div className="space-y-2">
                <button
                  onClick={handleAnalyze}
                  className="w-full rounded-xl bg-blue-600 px-4 py-4 text-base font-bold text-white active:bg-blue-700"
                >
                  AI로 분석하기
                </button>
                <button
                  onClick={handleRetry}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-600 active:bg-gray-50"
                >
                  다른 사진 선택
                </button>
              </div>
            )}
          </>
        )}

        {/* 로딩 상태 */}
        {pageState === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-4 text-sm font-medium text-gray-600">AI가 분석하고 있습니다...</p>
            <p className="mt-1 text-xs text-gray-400">잠시만 기다려주세요</p>
          </div>
        )}

        {/* 결과 상태 */}
        {pageState === 'result' && (
          <PredictionResult
            predictions={predictions}
            onFeeCheck={handleFeeCheck}
            onRetry={handleRetry}
          />
        )}

      </div>
    </div>
  )
}
