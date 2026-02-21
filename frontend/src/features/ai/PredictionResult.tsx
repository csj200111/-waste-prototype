import type { PredictionItem } from '@/types/ai'

interface PredictionResultProps {
  predictions: PredictionItem[]
  onFeeCheck: (wasteName: string) => void
  onRetry: () => void
}

function ConfidenceBar({ value }: { value: number }) {
  const percent = Math.round(value * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-blue-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-500 w-10 text-right">{percent}%</span>
    </div>
  )
}

export default function PredictionResult({ predictions, onFeeCheck, onRetry }: PredictionResultProps) {
  if (predictions.length === 0) {
    return (
      <div className="rounded-xl bg-gray-50 p-6 text-center">
        <div className="text-3xl mb-3">🔍</div>
        <p className="font-semibold text-gray-800 mb-1">식별된 품목이 없습니다</p>
        <p className="text-sm text-gray-500 mb-4">
          다른 각도에서 다시 촬영하거나<br />직접 검색해보세요
        </p>
        <div className="flex gap-2">
          <button
            onClick={onRetry}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 active:bg-gray-50"
          >
            다시 촬영/업로드
          </button>
          <button
            onClick={() => onFeeCheck('')}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white active:bg-blue-700"
          >
            직접 검색하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2">
        <p className="text-xs text-yellow-700">
          AI 분석 결과는 정확하지 않을 수 있습니다. 참고용으로 활용해주세요.
        </p>
      </div>

      <div className="space-y-2">
        {predictions.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-xs text-gray-400 mr-1">{idx + 1}.</span>
                <span className="font-semibold text-gray-900">{item.className}</span>
              </div>
            </div>
            <ConfidenceBar value={item.confidence} />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                → {item.wasteName} ({item.wasteCategory})
              </span>
              <button
                onClick={() => onFeeCheck(item.wasteName)}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white active:bg-blue-700"
              >
                수수료 조회
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onRetry}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 active:bg-gray-50"
      >
        다시 촬영/업로드
      </button>
    </div>
  )
}
