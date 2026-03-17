import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Input from '@/components/ui/Input'
import { useAuth } from '@/features/auth/AuthContext'
import { useLocationStore } from '@/stores/useLocationStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const setOnboarded = useLocationStore((s) => s.setOnboarded)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isValid = email.trim() && password.trim()

  const handleSubmit = async () => {
    if (!isValid) return
    setError('')
    setLoading(true)
    try {
      await login({ email: email.trim(), password })
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그인에 실패했습니다')
      setLoading(false)
    }
  }

  const handleGuest = () => {
    setOnboarded()
    navigate('/')
  }

  return (
    <div>
      <Header title="로그인" showNotification />
      <div className="pt-14 p-4">
        {/* 타이틀 */}
        <div className="mt-2 mb-6">
          <h2 className="text-xl font-bold text-gray-900">로그인</h2>
          <p className="mt-2 text-sm text-gray-500">
            결제, 채팅, 스크랩 등 서비스를 이용하려면 로그인이 필요해요.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <Input
            label="이메일"
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={setEmail}
          />
          <Input
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={setPassword}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="mb-3 w-full rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white disabled:bg-gray-300 active:bg-gray-800"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

        <div className="mb-6 flex items-center justify-between px-1">
          <Link to="/signup" className="text-sm text-gray-500 underline">회원가입</Link>
          <button className="text-sm text-gray-500 underline">비밀번호를 잊었나요?</button>
        </div>

        <button
          onClick={handleGuest}
          className="mb-3 w-full rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-700 active:bg-gray-50"
        >
          게스트로 둘러보기
        </button>

        <p className="text-center text-xs text-gray-400">
          게스트는 목록과 상세만 볼 수 있고, 결제·채팅·스크랩 등의 기능은 로그인 후 이용할 수 있어요.
        </p>
      </div>
    </div>
  )
}
