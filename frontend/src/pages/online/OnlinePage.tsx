import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import Header from '@/components/layout/Header'

const STEPS = [
  { num: 1, title: '배출 품목 검색 및 선택', desc: '버릴 품목을 검색하여 수수료를 확인합니다.' },
  { num: 2, title: '배출 장소 및 정보 입력', desc: '정확한 배출 위치와 일정을 입력합니다.' },
  { num: 3, title: '수수료 결제', desc: '신용카드, 계좌이체 등으로 결제합니다.' },
  { num: 4, title: '신고번호 부착 후 배출', desc: '발급된 번호를 부착하여 지정된 장소에 배출합니다.' },
]

export default function OnlinePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleStartReport = () => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate('/online/search')
  }

  return (
    <div>
      <Header title="온라인 신고 안내" showBack showNotification />
      <div className="pt-14 p-4">
        <div className="mt-2 mb-6">
          <h2 className="text-xl font-bold leading-snug text-gray-900">
            온라인으로 간편하게
            <br />
            대형폐기물을 신고하세요
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            아래 4단계 절차를 통해 신고가 접수됩니다.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {STEPS.map((step) => (
            <div key={step.num} className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {step.num}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{step.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleStartReport}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white active:bg-blue-700"
          >
            온라인 신고(유료)
          </button>
          <button
            onClick={() => navigate('/free-collection')}
            className="w-full rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-700 active:bg-gray-50"
          >
            무상수거 안내
          </button>
        </div>
      </div>
    </div>
  )
}
