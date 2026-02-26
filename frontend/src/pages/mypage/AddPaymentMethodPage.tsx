import Header from '@/components/layout/Header'

export default function AddPaymentMethodPage() {
  return (
    <div>
      <Header title="결제수단 추가" showBack showNotification />
      <div className="pt-14 p-4 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">카드 번호</label>
          <div className="flex items-center rounded-xl border border-gray-200 px-4 py-3">
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              className="flex-1 text-sm outline-none placeholder-gray-400"
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
              <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
            </svg>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">유효기간</label>
            <input
              type="text"
              placeholder="MM/YY"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none placeholder-gray-400"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-bold text-gray-700">CVC</label>
            <input
              type="text"
              placeholder="뒷면 3자리"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none placeholder-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">카드 비밀번호</label>
          <input
            type="password"
            placeholder="앞 2자리"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none placeholder-gray-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">결제수단 별칭 (선택)</label>
          <input
            type="text"
            placeholder="예: 내 주력 카드, 회사 법인카드"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none placeholder-gray-400"
          />
        </div>

        <div className="pt-4">
          <button className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white active:bg-gray-800">
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
