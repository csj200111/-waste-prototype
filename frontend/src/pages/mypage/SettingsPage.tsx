import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useAuth } from '@/features/auth/AuthContext'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <div>
      <Header title="설정" showBack showNotification />
      <div className="pt-14 p-4">
        <div className="rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <button
            onClick={() => navigate('/mypage/settings/profile')}
            className="flex w-full items-center justify-between px-4 py-4 text-left active:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-900">개인정보 수정</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
              <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex w-full items-center justify-between px-4 py-4 text-left active:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-900">로그아웃</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
              <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="flex w-full items-center justify-between px-4 py-4 text-left active:bg-gray-50">
            <span className="text-sm text-gray-400">탈퇴</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
              <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
