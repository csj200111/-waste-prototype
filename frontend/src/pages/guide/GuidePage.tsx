import Header from '@/components/layout/Header'

const GUIDE_SECTIONS = [
  {
    title: '1. 수수료 조회',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="14" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="3" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="14" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    steps: [
      '홈 화면에서 "수수료 조회"를 탭하세요.',
      '폐기할 품목을 검색하거나 AI 판독으로 찾으세요.',
      '품목을 선택하면 해당 지역의 수수료를 확인할 수 있어요.',
    ],
  },
  {
    title: '2. 온라인 신고',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
        <rect x="4" y="4" width="16" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 9h6M9 13h4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    steps: [
      '"온라인 신고" 메뉴에서 폐기물 배출 신고를 할 수 있어요.',
      '품목 선택 후 배출 장소와 날짜를 지정하세요.',
      '결제까지 완료하면 스티커가 발급돼요.',
    ],
  },
  {
    title: '3. 오프라인 안내',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="9" r="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    steps: [
      '가까운 대형폐기물 처리장, 스티커 판매점을 찾아보세요.',
      '지도에서 위치와 연락처를 바로 확인할 수 있어요.',
    ],
  },
  {
    title: '4. 무상수거 안내',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    steps: [
      '지역별 무상수거 서비스 정보를 확인하세요.',
      '대상 품목과 신청 방법을 안내해 드려요.',
    ],
  },
  {
    title: '5. 무료 나눔',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    steps: [
      '버리기 아까운 물건은 이웃에게 나눔하세요.',
      '"나눔 등록"에서 사진과 설명을 올리면 끝!',
      '채팅으로 나눔 약속을 잡을 수 있어요.',
    ],
  },
  {
    title: '6. AI 판독',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    steps: [
      '폐기물 사진을 촬영하거나 갤러리에서 선택하세요.',
      'AI가 자동으로 품목을 판별해 수수료까지 바로 조회해요.',
    ],
  },
]

export default function GuidePage() {
  return (
    <div>
      <Header title="서비스 이용 안내" showBack />
      <div className="pt-14 p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">버려잇 사용 가이드</h2>
          <p className="mt-1 text-sm text-gray-500">
            대형폐기물 처리의 모든 것, 간편하게 이용하세요.
          </p>
        </div>

        <div className="space-y-4">
          {GUIDE_SECTIONS.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-gray-100 p-4"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  {section.icon}
                </div>
                <h3 className="text-sm font-bold text-gray-900">{section.title}</h3>
              </div>
              <ol className="space-y-2 pl-1">
                {section.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
