import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Input from '@/components/ui/Input'
import { useAuth } from '@/features/auth/AuthContext'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isValid = email.trim() && password.length >= 4 && nickname.trim().length >= 2

  const handleSubmit = async () => {
    if (!isValid) return
    setError('')
    setLoading(true)
    try {
      await signup({ email: email.trim(), password, nickname: nickname.trim() })
      navigate(-1)
    } catch (e) {
      setError(e instanceof Error ? e.message : '회원가입에 실패했습니다')
      setLoading(false)
    }
  }

  return (
    <div>
      <Header title="회원가입" showBack showNotification />
      <div className="pt-14 p-4">
        {/* 타이틀 */}
        <div className="mt-2 mb-6">
          <h2 className="text-xl font-bold leading-snug text-gray-900">
            간편하게 가입하고
            <br />
            모든 기능을 사용해보세요.
          </h2>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <Input
            label="이메일"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={setEmail}
          />
          <Input
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChange={setPassword}
          />
          <Input
            label="닉네임"
            placeholder="사용하실 닉네임을 입력해주세요"
            value={nickname}
            onChange={setNickname}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="mb-3 w-full rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white disabled:bg-gray-300 active:bg-gray-800"
        >
          {loading ? '가입 중...' : '가입하기'}
        </button>

        <p className="text-center text-xs text-gray-400">
          가입 완료 시 이전 화면으로 돌아갑니다.
        </p>
      </div>
    </div>
  )
}
