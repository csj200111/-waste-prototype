import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'

export default function OfflinePage() {
  const navigate = useNavigate()

  return (
    <div>
      <Header title="오프라인 배출 안내" showBack onBack={() => navigate(-1)} />
      <div className="p-4 pt-18 space-y-4">
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-bold mb-2">📋 오프라인 배출 방법</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>스티커(납부필증)을 판매소에서 구매하거나 주민센터에서 신청</li>
            <li>대형폐기물 배출 신고서에 품목, 규격, 수량, 배출 장소 작성</li>
            <li>수수료를 현금 또는 카드로 결제</li>
            <li>스티커를 폐기물 잘 보이는 곳에 부착</li>
            <li>약속된 날짜와 장소에 배출</li>
          </ol>
        </div>

        <Card className="cursor-pointer active:bg-gray-50" onClick={() => navigate('/offline/sticker-shops')}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">🏪</div>
            <div>
              <div className="font-semibold">스티커 판매소</div>
              <div className="text-xs text-gray-500">주변 스티커 판매소 찾기</div>
            </div>
            <div className="ml-auto text-gray-400">›</div>
          </div>
        </Card>

        <Card className="cursor-pointer active:bg-gray-50" onClick={() => navigate('/offline/centers')}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">🏛️</div>
            <div>
              <div className="font-semibold">동사무소/주민센터</div>
              <div className="text-xs text-gray-500">직접 방문 신청하기</div>
            </div>
            <div className="ml-auto text-gray-400">›</div>
          </div>
        </Card>

        <Card className="cursor-pointer active:bg-gray-50" onClick={() => navigate('/offline/transport')}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">🚛</div>
            <div>
              <div className="font-semibold">운반 대행</div>
              <div className="text-xs text-gray-500">무거운 폐기물 운반 업체 안내</div>
            </div>
            <div className="ml-auto text-gray-400">›</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
