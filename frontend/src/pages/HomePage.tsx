import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import { useAuth } from '@/features/auth/AuthContext'

export default function HomePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <div className="p-4">
      <div className="flex items-center justify-end py-2">
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 font-medium">{user.nickname}님</span>
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-blue-600 font-medium"
          >
            로그인
          </button>
        )}
      </div>

      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-gray-900">대형폐기물 배출 도우미</h1>
        <p className="text-sm text-gray-500 mt-1">수수료 조회부터 배출까지 한번에</p>
      </div>

      <Card
        className="bg-primary text-black mb-4 cursor-pointer active:opacity-90"
        onClick={() => navigate('/fee-check')}
      >
        <div className="py-4 text-center">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-lg font-bold">수수료 조회하기</div>
          <div className="text-sm opacity-90 mt-1">내 폐기물의 수수료를 바로 확인하세요</div>
        </div>
      </Card>

      <Card
        className="bg-green-50 border border-green-200 text-black mb-4 cursor-pointer active:opacity-90"
        onClick={() => navigate('/ai-predict')}
      >
        <div className="py-4 text-center">
          <div className="text-3xl mb-2">📸</div>
          <div className="text-lg font-bold">AI 사진 식별</div>
          <div className="text-sm text-gray-600 mt-1">사진으로 폐기물 품목을 자동 식별합니다</div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="cursor-pointer active:bg-gray-50" onClick={() => navigate('/offline')}>
          <div className="text-center py-3">
            <div className="text-2xl mb-1">📋</div>
            <div className="font-semibold text-sm">오프라인</div>
            <div className="text-xs text-gray-500">배출 안내</div>
          </div>
        </Card>

        <Card className="cursor-pointer active:bg-gray-50" onClick={() => navigate('/online')}>
          <div className="text-center py-3">
            <div className="text-2xl mb-1">💻</div>
            <div className="font-semibold text-sm">온라인</div>
            <div className="text-xs text-gray-500">배출 신청</div>
          </div>
        </Card>

        <Card className="cursor-pointer active:bg-gray-50" onClick={() => navigate('/offline/transport')}>
          <div className="text-center py-3">
            <div className="text-2xl mb-1">🚛</div>
            <div className="font-semibold text-sm">운반 대행</div>
            <div className="text-xs text-gray-500">업체 안내</div>
          </div>
        </Card>

        <Card className="cursor-pointer active:bg-gray-50" onClick={() => navigate('/recycle')}>
          <div className="text-center py-3">
            <div className="text-2xl mb-1">♻️</div>
            <div className="font-semibold text-sm">재활용</div>
            <div className="text-xs text-gray-500">역경매</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
