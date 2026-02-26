import Header from '@/components/layout/Header'
import { useAuth } from '@/features/auth/AuthContext'
import { useLocationStore } from '@/stores/useLocationStore'

export default function ProfileEditPage() {
  const { user } = useAuth()
  const currentLocation = useLocationStore((s) => s.currentLocation)

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
            <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
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
                defaultValue={user?.nickname || '환경지킴이'}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none"
              />
              <button className="shrink-0 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600">
                중복확인
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">내 동네 설정</label>
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                {currentLocation ? `${currentLocation.sido} ${currentLocation.sigungu}` : '서울특별시 강남구'}
              </div>
              <button className="shrink-0 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600">
                변경
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">휴대폰 번호</label>
            <div className="flex gap-2">
              <input
                type="tel"
                defaultValue="010-1234-5678"
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none"
              />
              <button className="shrink-0 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600">
                변경
              </button>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="mt-8 flex gap-3">
          <button className="flex-1 rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-700 active:bg-gray-50">
            취소
          </button>
          <button className="flex-1 rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white active:bg-gray-800">
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
