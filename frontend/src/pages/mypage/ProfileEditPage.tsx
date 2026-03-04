import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useAuth } from '@/features/auth/AuthContext'
import { useLocationStore } from '@/stores/useLocationStore'
import { authService } from '@/services/authService'

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const currentLocation = useLocationStore((s) => s.currentLocation)

  const [nickname, setNickname] = useState(user?.nickname || '환경지킴이')
  const [phone, setPhone] = useState(formatPhone(user?.phone || ''))
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [saving, setSaving] = useState(false)

  const handleCheckNickname = async () => {
    const trimmed = nickname.trim()
    if (!trimmed || trimmed.length < 2) {
      alert('닉네임은 2자 이상이어야 합니다.')
      return
    }
    if (trimmed === user?.nickname) {
      setNicknameStatus('available')
      return
    }
    setNicknameStatus('checking')
    try {
      const res = await authService.checkNickname(trimmed)
      setNicknameStatus(res.available ? 'available' : 'taken')
    } catch {
      alert('중복확인에 실패했습니다.')
      setNicknameStatus('idle')
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const updated = await authService.updateProfile(user.id, {
        nickname: nickname.trim(),
        phone: phone.trim(),
      })
      updateUser(updated)
      navigate(-1)
    } catch (err) {
      alert('저장에 실패했습니다: ' + (err instanceof Error ? err.message : '알 수 없는 오류'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Header title="개인정보 수정" showBack showNotification />
      <div className="pt-14 p-4">
        {/* 프로필 사진 */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 폼 */}
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">이메일</label>
            <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-400">
              {user?.email || 'user@example.com'}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">닉네임</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value)
                  setNicknameStatus('idle')
                }}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none"
              />
              <button
                onClick={handleCheckNickname}
                disabled={nicknameStatus === 'checking'}
                className="shrink-0 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 active:bg-gray-50"
              >
                {nicknameStatus === 'checking' ? '확인중...' : '중복확인'}
              </button>
            </div>
            {nicknameStatus === 'available' && (
              <p className="mt-1.5 text-xs text-green-600">사용 가능한 닉네임입니다.</p>
            )}
            {nicknameStatus === 'taken' && (
              <p className="mt-1.5 text-xs text-red-500">이미 사용 중인 닉네임입니다.</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">내 동네 설정</label>
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                {currentLocation ? `${currentLocation.sido} ${currentLocation.sigungu}` : '서울특별시 강남구'}
              </div>
              <button
                onClick={() => navigate('/location/auto', { state: { returnTo: '/mypage/settings/profile' } })}
                className="shrink-0 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 active:bg-gray-50"
              >
                변경
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">휴대폰 번호</label>
            <input
              type="tel"
              placeholder="010-1234-5678"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              maxLength={13}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-700 active:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white active:bg-blue-700 disabled:bg-gray-300"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
