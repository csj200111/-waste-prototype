# app-restructure Planning Document

> **Summary**: 와이어프레임 기반 전체 앱 구조 재설계 (32개 화면, 5탭 네비게이션)
>
> **Project**: throw_it (대형폐기물 배출 도우미)
> **Version**: 0.0.0
> **Author**: AI Assistant
> **Date**: 2026-02-26
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

와이어프레임(32개 화면)을 기준으로 프론트엔드 앱 구조를 전면 재설계한다.
현재 2탭 구조(홈, MY)를 와이어프레임의 5탭 구조(홈, 온라인 신고, 오프라인 안내, 무료나눔, 마이페이지)로 변경하고,
각 화면을 와이어프레임과 일치하도록 재구성한다.

### 1.2 Background

- 현재 앱은 기본 기능 위주로 구현되어 있으나, 와이어프레임에서 정의한 UX 흐름과 차이가 크다.
- 무료 나눔(채팅 포함), 온보딩/위치설정, 알림, 결제수단 관리 등 새로운 기능이 와이어프레임에 추가됨.
- AI 기능(사진 식별)은 기존 코드를 유지하고 이번 재구조화에서 제외한다.

### 1.3 Related Documents

- 와이어프레임: `wireframe/` 폴더 (SCR-01 ~ SCR-32, 총 32개 화면)
- 기존 설계: `docs/archive/2026-02/bulk-waste-disposal/`

---

## 2. Scope

### 2.1 In Scope

- [ ] BottomNav 5탭 구조 변경 (홈, 온라인 신고, 오프라인 안내, 무료나눔, 마이페이지)
- [ ] 온보딩/위치설정 플로우 신규 구현 (SCR-01, 30, 31)
- [ ] 홈 화면 재설계 (SCR-02: 위치 헤더, 배너, 바로가기, 무료나눔 미리보기)
- [ ] 수수료 조회 플로우 재설계 (SCR-05, 07, 08, 09)
- [ ] 온라인 신고 플로우 재설계 (SCR-06, 07, 08, 10, 11)
- [ ] 무상수거 안내 신규 (SCR-12)
- [ ] 오프라인 안내 재설계 (SCR-13, 14)
- [ ] 무료 나눔 전체 신규 구현 (SCR-15, 16, 17, 18, 32)
- [ ] 마이페이지 재설계 (SCR-19, 20, 21, 22, 23, 24, 25, 26, 27, 28)
- [ ] 알림 목록 신규 (SCR-29)
- [ ] 인증 화면 UI 업데이트 (SCR-03, 04)
- [ ] 라우터 구조 전면 재설계

### 2.2 Out of Scope

- AI 사진 식별 기능 (기존 코드 유지, 향후 별도 구축)
- 백엔드 서버 (Spring Boot) 변경
- ai-server 관련 모든 파일
- 실제 결제 연동 (UI만 구현)
- 실시간 채팅 백엔드 (UI 프로토타입만)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | 관련 화면 |
|----|-------------|----------|-----------|
| FR-01 | 5탭 BottomNav (홈/온라인신고/오프라인안내/무료나눔/마이페이지) | High | 전체 |
| FR-02 | 온보딩: 첫 진입 시 위치 설정 (GPS/주소 검색) | High | SCR-01, 30, 31 |
| FR-03 | 홈: 위치 헤더 + 배너 캐러셀 + 바로가기 4개 + 무료나눔 미리보기 | High | SCR-02 |
| FR-04 | 수수료 조회: 품목 검색 → 카테고리 탭 → 품목 선택(추가) → 선택 확인 → 결과 | High | SCR-05, 07, 08, 09 |
| FR-05 | 온라인 신고: 안내 → 품목 선택 → 확인 → 결제 → 완료(배출번호) | High | SCR-06, 07, 08, 10, 11 |
| FR-06 | 무상수거 안내 페이지 | Medium | SCR-12 |
| FR-07 | 오프라인 안내: 지도보기/수수료조회/FAQ 구성 | Medium | SCR-13, 14 |
| FR-08 | 무료 나눔: 목록/상세/채팅/등록/수정 | High | SCR-15, 16, 17, 18, 32 |
| FR-09 | 마이페이지: 프로필 + 배출내역/구매내역/나눔내역/결제수단/스크랩/설정 | High | SCR-19~28 |
| FR-10 | 알림 목록 | Medium | SCR-29 |
| FR-11 | 로그인/회원가입 UI 와이어프레임 일치 (게스트 모드 포함) | Medium | SCR-03, 04 |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 페이지 전환 < 300ms | Lighthouse |
| Mobile First | 모바일 최적화 (max-width: 428px) | 수동 테스트 |
| Reusability | 기존 UI 컴포넌트 최대 재사용 | 코드 리뷰 |

---

## 4. 화면 목록 및 라우트 매핑

### 4.1 전체 화면 목록 (와이어프레임 기준)

| 화면 ID | 화면명 | 라우트 | 신규/수정 | 재사용 가능 코드 |
|---------|--------|--------|-----------|-----------------|
| SCR-01 | 온보딩(위치설정) | `/onboarding` | 신규 | - |
| SCR-02 | 홈 | `/` | 수정 | HomePage 구조 |
| SCR-03 | 로그인 | `/login` | 수정 | LoginPage, AuthContext |
| SCR-04 | 회원가입 | `/signup` | 수정 | SignupPage |
| SCR-05 | 수수료 조회 | `/fee-check` | 수정 | FeeCheckPage, feeService, wasteService |
| SCR-06 | 온라인 신고 안내 | `/online` | 수정 | OnlinePage |
| SCR-07 | 품목검색 | `/online/search` | 수정 | CategoryTree, WasteSearchBar, wasteService |
| SCR-08 | 선택 품목 확인 | `/online/confirm` | 수정 | WasteItemCard |
| SCR-09 | 수수료 계산 결과 | `/fee-check/result` | 신규 | FeeResultCard |
| SCR-10 | 수수료 결제 | `/online/payment` | 수정 | PaymentForm |
| SCR-11 | 배출 번호 발급(완료) | `/online/complete` | 수정 | DisposalNumber, CompletePage |
| SCR-12 | 무상수거 안내 | `/free-collection` | 신규 | - |
| SCR-13 | 오프라인 안내 | `/offline` | 수정 | OfflinePage |
| SCR-14 | 지도 검색 | `/offline/map` | 수정 | MapView, KakaoMapAdapter, LocationCard |
| SCR-15 | 무료 나눔 목록 | `/sharing` | 신규 | - |
| SCR-16 | 무료 나눔 상세 | `/sharing/:id` | 신규 | Card, Badge |
| SCR-17 | 무료 나눔 채팅 | `/sharing/:id/chat` | 신규 | - |
| SCR-18 | 무료 나눔 등록 | `/sharing/register` | 신규 | Input, Button |
| SCR-19 | 마이페이지 | `/mypage` | 수정 | MyPage 구조 |
| SCR-20 | 배출 내역 목록 | `/mypage/disposal` | 신규 | ApplicationList, StatusBadge |
| SCR-21 | 배출 내역 상세 | `/mypage/disposal/:id` | 신규 | ReceiptView |
| SCR-22 | 나눔 내역 목록 | `/mypage/sharing` | 신규 | - |
| SCR-23 | 구매 내역 목록 | `/mypage/purchases` | 신규 | - |
| SCR-24 | 결제 수단 목록 | `/mypage/payment-methods` | 신규 | - |
| SCR-25 | 결제 수단 추가 | `/mypage/payment-methods/add` | 신규 | Input, Button |
| SCR-26 | 무료 나눔 스크랩 목록 | `/mypage/scraps` | 신규 | Card, Badge |
| SCR-27 | 설정 | `/mypage/settings` | 신규 | - |
| SCR-28 | 개인 정보 수정 | `/mypage/settings/profile` | 신규 | Input, Button |
| SCR-29 | 알림 목록 | `/notifications` | 신규 | - |
| SCR-30 | 자동 위치 설정 | `/location/auto` | 신규 | MapView, useMap |
| SCR-31 | 수동 위치 설정 | `/location/manual` | 신규 | SearchBar, MapView |
| SCR-32 | 무료 나눔 수정 | `/sharing/:id/edit` | 신규 | Input, Button |

### 4.2 화면 흐름도

```
[온보딩 SCR-01]
  ├─ 현재 위치로 설정 → [자동 위치 SCR-30] → [홈]
  └─ 주소로 직접 입력 → [수동 위치 SCR-31] → [홈]

[홈 SCR-02]
  ├─ 수수료 조회 → [수수료 조회 SCR-05]
  │     └─ 품목 검색하기 → [품목검색 SCR-07] → [선택 확인 SCR-08] → [결과 SCR-09]
  ├─ 온라인 신고 → [온라인 신고 안내 SCR-06]
  │     ├─ 온라인 신고(유료) → [품목검색 SCR-07] → [확인 SCR-08] → [결제 SCR-10] → [완료 SCR-11]
  │     └─ 무상수거 안내 → [무상수거 SCR-12]
  ├─ 오프라인 안내 → [오프라인 안내 SCR-13]
  │     ├─ 지도 보기 → [지도 SCR-14]
  │     └─ 수수료 조회 → [수수료 조회 SCR-05]
  ├─ 무상수거 안내 → [무상수거 SCR-12]
  └─ 무료 나눔 미리보기 → [무료 나눔 목록 SCR-15]

[무료 나눔 목록 SCR-15]
  ├─ 아이템 클릭 → [상세 SCR-16]
  │     ├─ 스크랩 → 스크랩 토글
  │     └─ 채팅하기 → [채팅 SCR-17]
  └─ + 등록 → [등록 SCR-18]

[마이페이지 SCR-19]
  ├─ 배출 내역 → [배출 내역 목록 SCR-20] → [상세 SCR-21]
  ├─ 구매 내역 → [구매 내역 SCR-23]
  ├─ 나눔 내역 → [나눔 내역 SCR-22] → 수정 [SCR-32] / 채팅 [SCR-17]
  ├─ 결제수단 → [결제수단 목록 SCR-24] → [추가 SCR-25]
  ├─ 스크랩 → [스크랩 목록 SCR-26]
  └─ 설정 → [설정 SCR-27] → [개인정보 수정 SCR-28]

[알림 SCR-29] ← 헤더 알림 아이콘에서 접근
```

---

## 5. 기존 코드 재사용 분석

### 5.1 그대로 유지 (AI 관련 - 변경 금지)

| 파일 | 설명 |
|------|------|
| `features/ai/PhotoCapture.tsx` | AI 사진 촬영 |
| `features/ai/PredictionResult.tsx` | AI 예측 결과 |
| `services/aiService.ts` | AI 서비스 |
| `types/ai.ts` | AI 타입 |
| `pages/AiPredictPage.tsx` | AI 예측 페이지 |

### 5.2 재사용 가능 (수정 필요)

| 파일 | 재사용 방식 |
|------|-------------|
| `components/ui/Button.tsx` | 그대로 재사용 |
| `components/ui/Input.tsx` | 그대로 재사용 |
| `components/ui/Card.tsx` | 그대로 재사용 |
| `components/ui/Badge.tsx` | 그대로 재사용 |
| `components/ui/SearchBar.tsx` | 그대로 재사용 |
| `components/ui/Modal.tsx` | 그대로 재사용 |
| `components/ui/Select.tsx` | 그대로 재사용 |
| `components/ui/DatePicker.tsx` | 그대로 재사용 |
| `components/layout/MobileContainer.tsx` | 그대로 재사용 |
| `components/layout/Header.tsx` | 알림 아이콘 추가 필요 |
| `components/layout/BottomNav.tsx` | 5탭으로 전면 수정 |
| `components/map/MapView.tsx` | 위치설정/지도에서 재사용 |
| `components/map/KakaoMapAdapter.ts` | 그대로 재사용 |
| `components/map/LocationCard.tsx` | 지도 검색에서 재사용 |
| `components/waste/CategoryTree.tsx` | 품목검색에서 재사용 (탭 UI로 변경) |
| `components/waste/FeeResultCard.tsx` | 수수료 결과에서 재사용 |
| `components/waste/WasteItemCard.tsx` | 품목 목록에서 재사용 |
| `features/auth/AuthContext.tsx` | 게스트 모드 추가 필요 |
| `features/disposal/PaymentForm.tsx` | 결제 화면에서 재사용 |
| `features/disposal/DisposalNumber.tsx` | 완료 화면에서 재사용 |
| `services/regionService.ts` | 위치 관련에서 재사용 |
| `services/wasteService.ts` | 품목 검색에서 재사용 |
| `services/feeService.ts` | 수수료 조회에서 재사용 |
| `services/disposalService.ts` | 배출 관련에서 재사용 |
| `services/authService.ts` | 인증에서 재사용 |
| `stores/useRegionStore.ts` | 위치 상태 관리 재사용 |
| `stores/useDisposalStore.ts` | 배출 상태 관리 재사용 |
| `types/*.ts` (ai 제외) | 확장하여 재사용 |

### 5.3 삭제 대상 (무료 나눔으로 대체)

| 파일 | 사유 |
|------|------|
| `features/recycle/` 전체 | 무료 나눔(sharing) 기능으로 대체 |
| `pages/recycle/` 전체 | 무료 나눔 페이지로 대체 |
| `services/recycleService.ts` | sharingService로 대체 |
| `types/recycle.ts` | sharing 타입으로 대체 |

### 5.4 신규 구현 필요

| 파일/모듈 | 설명 |
|-----------|------|
| `pages/onboarding/` | 온보딩 플로우 |
| `pages/location/` | 위치 설정 (자동/수동) |
| `pages/sharing/` | 무료 나눔 (목록/상세/채팅/등록/수정) |
| `pages/notifications/` | 알림 목록 |
| `pages/mypage/` 확장 | 배출내역, 나눔내역, 구매내역, 결제수단, 스크랩, 설정, 개인정보수정 |
| `pages/fee-check/` 확장 | 수수료 결과 별도 페이지 |
| `pages/free-collection/` | 무상수거 안내 |
| `features/sharing/` | 무료 나눔 관련 컴포넌트/훅 |
| `features/chat/` | 채팅 UI 컴포넌트 |
| `features/notification/` | 알림 관련 |
| `features/payment/` | 결제수단 관리 |
| `services/sharingService.ts` | 무료 나눔 서비스 |
| `services/chatService.ts` | 채팅 서비스 |
| `services/notificationService.ts` | 알림 서비스 |
| `services/paymentMethodService.ts` | 결제수단 서비스 |
| `stores/useLocationStore.ts` | 위치 전역 상태 |
| `stores/useSharingStore.ts` | 나눔 상태 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Selected |
|-------|-----------------|:--------:|
| **Starter** | Simple structure | - |
| **Dynamic** | Feature-based modules, BaaS integration | **Selected** |
| **Enterprise** | Strict layer separation | - |

### 6.2 Key Architectural Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Framework | React + Vite | 기존 유지 |
| State Management | Zustand | 기존 유지 |
| API Client | React Query | 기존 유지 |
| Form Handling | React Hook Form | 기존 유지 |
| Styling | Tailwind CSS | 기존 유지 |
| Routing | React Router v7 | 기존 유지, 라우트 구조만 변경 |

### 6.3 폴더 구조 (재설계)

```
src/
├── components/          # 공통 UI 컴포넌트 (기존 유지)
│   ├── ui/              # Button, Input, Card, Badge, SearchBar, Modal, Select, DatePicker
│   ├── layout/          # MobileContainer, Header(수정), BottomNav(수정), ProgressBar
│   ├── map/             # MapView, MapPlaceholder, LocationCard, KakaoMapAdapter
│   └── waste/           # CategoryTree, FeeResultCard, WasteItemCard, SizeSelector, WasteSearchBar
│
├── features/            # 도메인별 기능 모듈
│   ├── ai/              # [유지] PhotoCapture, PredictionResult
│   ├── auth/            # AuthContext (게스트모드 추가)
│   ├── disposal/        # PaymentForm, DisposalNumber, DisposalForm, ReviewSummary
│   ├── sharing/         # [신규] SharingCard, SharingForm, SharingStatusBadge
│   ├── chat/            # [신규] ChatBubble, ChatInput, ChatHeader
│   ├── notification/    # [신규] NotificationItem
│   ├── payment/         # [신규] PaymentMethodCard, PaymentMethodForm
│   ├── fee/             # useFeeCheck
│   ├── mypage/          # ApplicationCard, StatusBadge, ApplicationList, ReceiptView
│   └── location/        # [신규] LocationPermissionCard, AddressSearchInput
│
├── pages/               # 페이지 컴포넌트
│   ├── onboarding/      # [신규] OnboardingPage
│   ├── HomePage.tsx      # [수정] 와이어프레임 일치
│   ├── AiPredictPage.tsx # [유지]
│   ├── auth/            # LoginPage(수정), SignupPage(수정)
│   ├── fee-check/       # [수정] FeeCheckPage, FeeResultPage(신규)
│   ├── online/          # [수정] OnlinePage, SearchPage, ConfirmPage, PaymentPage, CompletePage
│   ├── offline/         # [수정] OfflinePage, MapPage
│   ├── free-collection/ # [신규] FreeCollectionPage
│   ├── sharing/         # [신규] SharingListPage, SharingDetailPage, SharingChatPage, SharingRegisterPage, SharingEditPage
│   ├── mypage/          # [수정+신규] MyPage, DisposalListPage, DisposalDetailPage, SharingHistoryPage, PurchaseHistoryPage, PaymentMethodsPage, AddPaymentMethodPage, ScrapsPage, SettingsPage, ProfileEditPage
│   ├── notifications/   # [신규] NotificationsPage
│   └── location/        # [신규] AutoLocationPage, ManualLocationPage
│
├── services/            # API 서비스
│   ├── aiService.ts      # [유지]
│   ├── authService.ts    # [유지]
│   ├── regionService.ts  # [유지]
│   ├── wasteService.ts   # [유지]
│   ├── feeService.ts     # [유지]
│   ├── disposalService.ts # [유지]
│   ├── offlineService.ts  # [유지]
│   ├── sharingService.ts  # [신규] 무료 나눔 API
│   ├── chatService.ts     # [신규] 채팅 API
│   ├── notificationService.ts # [신규] 알림 API
│   └── paymentMethodService.ts # [신규] 결제수단 API
│
├── stores/              # Zustand 상태 관리
│   ├── useRegionStore.ts   # [유지]
│   ├── useDisposalStore.ts # [유지]
│   ├── useLocationStore.ts # [신규] 위치 전역 상태
│   └── useSharingStore.ts  # [신규] 나눔 장바구니 등
│
├── types/               # TypeScript 타입
│   ├── ai.ts            # [유지]
│   ├── auth.ts          # [유지]
│   ├── waste.ts         # [유지]
│   ├── fee.ts           # [유지]
│   ├── disposal.ts      # [유지]
│   ├── offline.ts       # [유지]
│   ├── region.ts        # [유지]
│   ├── sharing.ts       # [신규] 무료 나눔 타입
│   ├── chat.ts          # [신규] 채팅 타입
│   ├── notification.ts  # [신규] 알림 타입
│   └── payment.ts       # [신규] 결제수단 타입
│
├── lib/                 # 유틸리티
│   ├── apiClient.ts     # [유지]
│   └── map/             # [유지] MapAdapter, useMap 등
│
├── router/
│   └── index.tsx        # [전면 수정] 새 라우트 구조
│
├── App.tsx              # [수정] 온보딩 분기 추가
├── App.css              # [유지]
├── index.css            # [유지]
└── main.tsx             # [유지]
```

---

## 7. 구현 순서 (우선순위)

### Phase 1: 기반 구조 (BottomNav + 라우터)
1. BottomNav 5탭 구조 변경
2. 라우터 전면 재설계
3. Header에 알림 아이콘 추가
4. 위치 전역 상태 스토어 생성

### Phase 2: 홈 + 온보딩
5. 온보딩 페이지 (SCR-01)
6. 자동 위치 설정 (SCR-30)
7. 수동 위치 설정 (SCR-31)
8. 홈 화면 재설계 (SCR-02)

### Phase 3: 수수료 조회 + 온라인 신고
9. 수수료 조회 재설계 (SCR-05)
10. 품목검색 (SCR-07) - 카테고리 탭 + 목록
11. 선택 품목 확인 (SCR-08)
12. 수수료 계산 결과 (SCR-09)
13. 온라인 신고 안내 (SCR-06)
14. 결제 (SCR-10)
15. 배출 완료 (SCR-11)

### Phase 4: 오프라인 안내 + 무상수거
16. 오프라인 안내 재설계 (SCR-13)
17. 지도 검색 (SCR-14)
18. 무상수거 안내 (SCR-12)

### Phase 5: 무료 나눔
19. 무료 나눔 목록 (SCR-15)
20. 무료 나눔 상세 (SCR-16)
21. 무료 나눔 등록 (SCR-18)
22. 무료 나눔 수정 (SCR-32)
23. 무료 나눔 채팅 (SCR-17)

### Phase 6: 마이페이지
24. 마이페이지 메인 (SCR-19)
25. 배출 내역 목록/상세 (SCR-20, 21)
26. 나눔 내역 목록 (SCR-22)
27. 구매 내역 목록 (SCR-23)
28. 결제수단 목록/추가 (SCR-24, 25)
29. 스크랩 목록 (SCR-26)
30. 설정 + 개인정보 수정 (SCR-27, 28)

### Phase 7: 인증 + 알림
31. 로그인 UI 수정 (SCR-03)
32. 회원가입 UI 수정 (SCR-04)
33. 알림 목록 (SCR-29)

---

## 8. Success Criteria

### 8.1 Definition of Done

- [ ] 32개 화면 모두 와이어프레임과 UI 일치
- [ ] 5탭 BottomNav 정상 동작
- [ ] 화면 간 네비게이션 흐름 완성
- [ ] AI 관련 파일 변경 없음 확인
- [ ] 빌드 성공 (tsc + vite build)

### 8.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build succeeds
- [ ] 모든 라우트 접근 가능

---

## 9. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 대규모 변경으로 기존 기능 손상 | High | Medium | Phase별 점진적 구현, 기존 코드 최대 재사용 |
| 백엔드 API 미지원 기능 | Medium | High | 목업 서비스로 UI 먼저 구현 |
| AI 파일 실수로 수정 | High | Low | AI 관련 파일 목록 명시, 변경 전 확인 |
| 채팅 기능 복잡도 | Medium | Medium | UI 프로토타입만 우선 구현 |

---

## 10. Next Steps

1. [ ] Plan 승인 후 Design 문서 작성 (`/pdca design app-restructure`)
2. [ ] Phase 1부터 순차 구현 시작
3. [ ] 각 Phase 완료 시 Gap 분석

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-26 | 초기 작성 - 32개 화면 분석 완료 | AI Assistant |
