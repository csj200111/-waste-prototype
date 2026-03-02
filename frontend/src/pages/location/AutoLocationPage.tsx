import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import MapView from '@/components/map/MapView'
import { useLocationStore } from '@/stores/useLocationStore'

export default function AutoLocationPage() {
  const navigate = useNavigate()
  const setLocation = useLocationStore((s) => s.setLocation)
  const [coords, setCoords] = useState({ lat: 37.5665, lng: 126.978 })
  const [address, setAddress] = useState('위치를 확인하는 중...')
  const [permissionGranted, setPermissionGranted] = useState(false)

  // region 데이터를 별도 ref로 관리 (split 파싱 대신)
  const regionRef = useRef({ sido: '', sigungu: '', dong: '' })

  const reverseGeocode = (lat: number, lng: number) => {
    const kakao = (window as any).kakao
    if (!kakao?.maps?.services) return

    const geocoder = new kakao.maps.services.Geocoder()
    geocoder.coord2RegionCode(lng, lat, (result: any[], status: string) => {
      if (status !== kakao.maps.services.Status.OK || result.length === 0) return

      // 행정동(H) 우선, 없으면 법정동(B) 사용
      const r = result.find((item: any) => item.region_type === 'H') || result[0]

      regionRef.current = {
        sido: r.region_1depth_name || '',
        sigungu: r.region_2depth_name || '',
        dong: r.region_3depth_name || '',
      }

      const displayAddr = [
        r.region_1depth_name,
        r.region_2depth_name,
        r.region_3depth_name,
      ].filter(Boolean).join(' ')

      setAddress(displayAddr)
    })
  }

  const requestLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lng: longitude })
        setPermissionGranted(true)
        reverseGeocode(latitude, longitude)
      },
      () => {
        setAddress('위치 권한이 필요합니다')
      },
    )
  }

  useEffect(() => {
    requestLocation()
  }, [])

  const markers = [{ lat: coords.lat, lng: coords.lng, title: '현재 위치' }]

  const handleConfirm = () => {
    const { sido, sigungu, dong } = regionRef.current
    if (!sido) {
      alert('위치 정보를 가져올 수 없습니다. 위치 권한을 허용해 주세요.')
      return
    }
    setLocation({
      latitude: coords.lat,
      longitude: coords.lng,
      address,
      dong,
      sigungu,
      sido,
    })
    navigate('/')
  }

  return (
    <div>
      <Header title="현재 위치로 설정" showBack showNotification />
      <div className="pt-14">
        <MapView markers={markers} className="!rounded-none" />

        <div className="p-4 space-y-4">
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">현재 위치</p>
            <p className="mt-1 text-lg font-bold">{address}</p>
            <p className="mt-1 text-xs text-gray-400">
              정확하지 않으면 수동으로 주소를 설정해 주세요.
            </p>
          </div>

          {!permissionGranted && (
            <div className="rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">위치 권한이 필요해요</p>
                <p className="text-xs text-gray-400">정확한 위치를 위해 권한을 허용해 주세요.</p>
              </div>
              <Button size="sm" onClick={requestLocation}>권한 허용</Button>
            </div>
          )}

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
