import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import MapView from '@/components/map/MapView'

export default function OnboardingPage() {
  const navigate = useNavigate()

  return (
    <div className="p-4">
      <div className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-lg font-semibold">시작하기</h1>
          <p className="text-sm text-gray-500">내 동네부터 설정해요</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">내 동네부터 설정할까요?</h2>
        <p className="mt-2 text-sm text-gray-500">
          지역 기준으로 수수료/신고/나눔 정보를 정확히 보여드려요.
        </p>
      </div>

      <div className="mt-8">
        <MapView markers={[]} className="!h-[192px]" />
      </div>

      <div className="mt-8 space-y-3">
        <Button fullWidth onClick={() => navigate('/location/auto')}>
          현재 위치로 설정
        </Button>
        <Button fullWidth variant="secondary" onClick={() => navigate('/location/manual')}>
          주소로 직접 입력
        </Button>
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        권한을 허용하지 않아도 주소 입력으로 이용할 수 있어요.
      </p>
    </div>
  )
}
