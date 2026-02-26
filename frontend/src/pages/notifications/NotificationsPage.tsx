import Header from '@/components/layout/Header'

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'report', title: '온라인 신고 완료', desc: '배출번호 발급이 완료되었습니다. 상...', time: '방금 전' },
  { id: 2, type: 'chat', title: '새로운 채팅', desc: "'원목 의자 나눔합니다' 게시글에 채...", time: '1시간 전' },
  { id: 3, type: 'payment', title: '결제 완료 안내', desc: '수수료 3,000원 결제가 성공적으로 ...', time: '어제' },
  { id: 4, type: 'scrap', title: '스크랩 나눔 완료', desc: "관심 목록에 있던 '소형 냉장고' 나눔...", time: '2일 전' },
  { id: 5, type: 'collection', title: '수거 완료 안내', desc: '신고하신 대형폐기물 수거가 완료되...', time: '3일 전' },
]

const ICONS: Record<string, JSX.Element> = {
  report: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="7" r="4"/>
    </svg>
  ),
  chat: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  payment: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <path d="M1 10h22"/>
    </svg>
  ),
  scrap: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  collection: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
}

export default function NotificationsPage() {
  return (
    <div>
      <Header title="알림" showBack showNotification />
      <div className="pt-14">
        <div className="divide-y divide-gray-50">
          {MOCK_NOTIFICATIONS.map((noti) => (
            <button key={noti.id} className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-gray-50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                {ICONS[noti.type]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{noti.title}</p>
                  <span className="shrink-0 text-xs text-gray-300">{noti.time}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-gray-400">{noti.desc}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
                <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
