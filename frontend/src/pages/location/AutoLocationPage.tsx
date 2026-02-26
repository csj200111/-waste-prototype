import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import { useLocationStore } from '@/stores/useLocationStore'

export default function AutoLocationPage() {
  const navigate = useNavigate()
  const setLocation = useLocationStore((s) => s.setLocation)

  const handleConfirm = () => {
    // TODO: 실제 GPS + 역지오코딩 연동
    setLocation({
      latitude: 37.5665,
      longitude: 126.978,
      address: '서울시 광진구 구의동',
      dong: '구의동',
      sigungu: '광진구',
      sido: '서울특별시',
    })
    navigate('/')
  }

  return (
    <div>
      <Header title="현재 위치로 설정" showBack showNotification />
      <div className="pt-14">
        <div className="flex h-64 items-center justify-center bg-gray-100">
          <span className="text-gray-400">지도 영역 (MapView)</span>
        </div>

        <div className="p-4 space-y-4">
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">현재 위치 &nbsp; 지도를 움직여 위치를 조정할 수 있어요</p>
            <p className="mt-1 text-lg font-bold">서울시 광진구 구의동</p>
            <p className="mt-1 text-xs text-gray-400">
              정확하지 않으면 지도를 드래그해서 위치를 맞춰 주세요.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">위치 권한이 필요해요</p>
              <p className="text-xs text-gray-400">정확한 위치를 위해 권한을 허용해 주세요.</p>
            </div>
            <Button size="sm">권한 허용</Button>
          </div>

          <div className="flex gap-3">
            <Button fullWidth onClick={handleConfirm}>
              이 위치로 설정
            </Button>
            <Button fullWidth variant="secondary" onClick={() => navigate('/location/manual')}>
              주소로 설정
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
