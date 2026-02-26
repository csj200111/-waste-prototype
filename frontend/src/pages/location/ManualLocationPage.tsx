import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import SearchBar from '@/components/ui/SearchBar'
import Button from '@/components/ui/Button'
import { useLocationStore } from '@/stores/useLocationStore'

export default function ManualLocationPage() {
  const navigate = useNavigate()
  const setLocation = useLocationStore((s) => s.setLocation)
  const [keyword, setKeyword] = useState('')

  const handleConfirm = () => {
    // TODO: 주소 검색 API 연동
    setLocation({
      latitude: 37.5665,
      longitude: 126.978,
      address: '서울 광진구 구의동 123-4',
      dong: '구의동',
      sigungu: '광진구',
      sido: '서울특별시',
    })
    navigate('/')
  }

  return (
    <div>
      <Header title="주소로 설정" showBack showNotification />
      <div className="pt-14 p-4 space-y-4">
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          placeholder="주소 검색 (예: 구의동, 강남대로 123)"
        />
        <p className="text-xs text-gray-400">동/도로명/건물명으로 검색할 수 있어요.</p>

        <div className="flex h-48 items-center justify-center rounded-xl bg-gray-100">
          <span className="text-gray-400">지도 영역 (MapView)</span>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">선택된 주소</p>
          <p className="mt-1 text-lg font-bold">서울 광진구 구의동 123-4</p>
          <p className="text-xs text-gray-400">광진구 · 구의동</p>
        </div>

        <div className="space-y-3">
          <Button fullWidth onClick={handleConfirm}>
            이 위치로 설정
          </Button>
          <button
            onClick={() => navigate('/location/auto')}
            className="w-full text-center text-sm text-gray-500"
          >
            현재 위치로 설정
          </button>
        </div>
      </div>
    </div>
  )
}
