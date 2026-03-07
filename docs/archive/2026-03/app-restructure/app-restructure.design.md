# app-restructure Design Document

> **Summary**: 와이어프레임 32개 화면 기반 프론트엔드 전체 구조 상세 설계
>
> **Project**: throw_it (대형폐기물 배출 도우미)
> **Version**: 0.0.0
> **Author**: AI Assistant
> **Date**: 2026-02-26
> **Status**: Draft
> **Planning Doc**: [app-restructure.plan.md](../01-plan/features/app-restructure.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 와이어프레임 32개 화면과 1:1 대응하는 컴포넌트 구조 설계
- 기존 UI 컴포넌트 및 서비스 최대 재사용
- AI 관련 코드 무변경 보장
- 5탭 네비게이션 기반 명확한 화면 계층 구조

### 1.2 Design Principles

- **Mobile First**: 428px 기준 모바일 최적화
- **Component Reuse**: 기존 ui/, layout/, map/, waste/ 컴포넌트 활용
- **Feature Isolation**: 도메인별 features/ 분리로 관심사 분리
- **Mock First**: 백엔드 미지원 기능은 목업 서비스로 UI 우선 구현

---

## 2. Architecture

### 2.1 전체 구조

```
┌─────────────────────────────────────────────┐
│                  App.tsx                      │
│  ┌─────────────────────────────────────────┐ │
│  │  AuthProvider + LocationProvider         │ │
│  │  ┌───────────────────────────────────┐  │ │
│  │  │  MobileContainer                  │  │ │
│  │  │  ┌─────────────────────────────┐  │  │ │
│  │  │  │  ScrollToTop                │  │  │ │
│  │  │  │  ┌───────────────────────┐  │  │  │ │
│  │  │  │  │  Outlet (Pages)       │  │  │  │ │
│  │  │  │  └───────────────────────┘  │  │  │ │
│  │  │  │  BottomNav (5 tabs)         │  │  │ │
│  │  │  └─────────────────────────────┘  │  │ │
│  │  └───────────────────────────────────┘  │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 2.2 라우터 구조

```typescript
// router/index.tsx
createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // 홈
      { index: true, element: <HomePage /> },

      // 온보딩 / 위치
      { path: 'onboarding', element: <OnboardingPage /> },
      { path: 'location/auto', element: <AutoLocationPage /> },
      { path: 'location/manual', element: <ManualLocationPage /> },

      // 인증
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },

      // 수수료 조회
      { path: 'fee-check', element: <FeeCheckPage /> },
      { path: 'fee-check/search', element: <ItemSearchPage /> },
      { path: 'fee-check/confirm', element: <ItemConfirmPage /> },
      { path: 'fee-check/result', element: <FeeResultPage /> },

      // 온라인 신고
      { path: 'online', element: <OnlineGuidePage /> },
      { path: 'online/search', element: <ItemSearchPage /> },     // 공유
      { path: 'online/confirm', element: <ItemConfirmPage /> },    // 공유
      { path: 'online/payment', element: <PaymentPage /> },
      { path: 'online/complete', element: <CompletePage /> },

      // 무상수거
      { path: 'free-collection', element: <FreeCollectionPage /> },

      // 오프라인 안내
      { path: 'offline', element: <OfflineGuidePage /> },
      { path: 'offline/map', element: <MapSearchPage /> },

      // 무료 나눔
      { path: 'sharing', element: <SharingListPage /> },
      { path: 'sharing/register', element: <SharingRegisterPage /> },
      { path: 'sharing/:id', element: <SharingDetailPage /> },
      { path: 'sharing/:id/chat', element: <SharingChatPage /> },
      { path: 'sharing/:id/edit', element: <SharingEditPage /> },

      // 마이페이지
      { path: 'mypage', element: <MyPage /> },
      { path: 'mypage/disposal', element: <DisposalListPage /> },
      { path: 'mypage/disposal/:id', element: <DisposalDetailPage /> },
      { path: 'mypage/sharing', element: <SharingHistoryPage /> },
      { path: 'mypage/purchases', element: <PurchaseHistoryPage /> },
      { path: 'mypage/payment-methods', element: <PaymentMethodsPage /> },
      { path: 'mypage/payment-methods/add', element: <AddPaymentMethodPage /> },
      { path: 'mypage/scraps', element: <ScrapsPage /> },
      { path: 'mypage/settings', element: <SettingsPage /> },
      { path: 'mypage/settings/profile', element: <ProfileEditPage /> },

      // 알림
      { path: 'notifications', element: <NotificationsPage /> },

      // AI (유지)
      { path: 'ai-predict', element: <AiPredictPage /> },
    ],
  },
])
```

---

## 3. Data Model

### 3.1 신규 타입 정의

```typescript
// types/sharing.ts
export type SharingStatus = '나눔중' | '예약중' | '나눔완료';

export interface SharingItem {
  id: number;
  title: string;
  description: string;
  category: string;
  images: string[];
  status: SharingStatus;
  location: string;          // 동네명 (예: 역삼동)
  preferredPlace: string;    // 희망 거래 장소
  authorId: number;
  authorNickname: string;
  viewCount: number;
  chatCount: number;
  scrapCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SharingCreateRequest {
  title: string;
  description: string;
  category: string;
  images: File[];
  preferredPlace: string;
}

export interface SharingUpdateRequest extends SharingCreateRequest {
  status: SharingStatus;
}
```

```typescript
// types/chat.ts
export interface ChatRoom {
  id: number;
  sharingItemId: number;
  sharingTitle: string;
  sharingStatus: SharingStatus;
  otherUserId: number;
  otherUserNickname: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  content: string;
  createdAt: string;
  isMe: boolean;
}
```

```typescript
// types/notification.ts
export type NotificationType =
  | 'disposal_complete'
  | 'new_chat'
  | 'payment_complete'
  | 'scrap_shared'
  | 'collection_complete';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
```

```typescript
// types/payment.ts
export type PaymentMethodType = 'credit_card' | 'bank_account' | 'kakao_pay';

export interface PaymentMethod {
  id: number;
  type: PaymentMethodType;
  label: string;          // 별칭
  displayName: string;    // "신한카드", "국민은행" 등
  lastFourDigits?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface PaymentMethodCreateRequest {
  type: 'credit_card';
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  password: string;       // 앞 2자리
  label?: string;
}
```

```typescript
// types/location.ts
export interface Location {
  latitude: number;
  longitude: number;
  address: string;        // 전체 주소
  dong: string;           // 동 이름 (예: 역삼1동)
  sigungu: string;        // 시군구
  sido: string;           // 시도
}
```

### 3.2 기존 타입 확장

```typescript
// types/auth.ts (확장)
export interface User {
  id: number;
  email: string;
  nickname: string;
  profileImage?: string;
  phone?: string;
  location?: Location;
  createdAt: string;
}

// 게스트 모드 지원
export interface GuestUser {
  isGuest: true;
  nickname: '게스트';
}
```

### 3.3 Entity Relationships

```
[User] 1 ──── N [DisposalApplication]
  │
  ├── 1 ──── N [SharingItem] (등록한 나눔)
  │
  ├── 1 ──── N [ChatRoom]
  │
  ├── 1 ──── N [PaymentMethod]
  │
  ├── 1 ──── N [Scrap] ──── 1 [SharingItem]
  │
  ├── 1 ──── N [Notification]
  │
  └── 1 ──── 1 [Location] (현재 위치)

[SharingItem] 1 ──── N [ChatRoom]
  │
  └── 1 ──── N [ChatMessage]

[DisposalApplication] 1 ──── N [DisposalItem]
```

---

## 4. 전역 상태 설계

### 4.1 useLocationStore (신규)

```typescript
// stores/useLocationStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Location } from '@/types/location';

interface LocationState {
  currentLocation: Location | null;
  isOnboarded: boolean;
  setLocation: (location: Location) => void;
  setOnboarded: () => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      currentLocation: null,
      isOnboarded: false,
      setLocation: (location) => set({ currentLocation: location, isOnboarded: true }),
      setOnboarded: () => set({ isOnboarded: true }),
      clearLocation: () => set({ currentLocation: null }),
    }),
    { name: 'throwit_location' }
  )
);
```

### 4.2 useCartStore (신규 - 품목 선택 장바구니)

```typescript
// stores/useCartStore.ts
import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  mode: 'fee-check' | 'online-report';  // 수수료조회 vs 온라인신고
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setMode: (mode: CartState['mode']) => void;
  totalPrice: () => number;
  totalCount: () => number;
}
```

---

## 5. 화면별 상세 설계

### 5.1 BottomNav (전면 수정)

```
┌──────┬──────────┬──────────┬──────────┬──────────┐
│  홈  │ 온라인   │ 오프라인 │ 무료나눔 │마이페이지│
│  🏠  │  신고 📋 │  안내 🗺 │   🎁    │   👤    │
└──────┴──────────┴──────────┴──────────┴──────────┘
```

| 탭 | 라벨 | 경로 | 아이콘 |
|---|------|------|--------|
| 1 | 홈 | `/` | house |
| 2 | 온라인 신고 | `/online` | document-plus |
| 3 | 오프라인 안내 | `/offline` | map-pin |
| 4 | 무료나눔 | `/sharing` | gift |
| 5 | 마이페이지 | `/mypage` | user |

**Active 판별**: `pathname.startsWith(path)` (하위 경로 포함)

### 5.2 Header (수정)

```
┌─────────────────────────────────────────┐
│ [←] 페이지 타이틀              [🔔] [...] │
└─────────────────────────────────────────┘
```

**Props 확장:**
```typescript
interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showNotification?: boolean;   // 신규: 알림 아이콘
  showMore?: boolean;           // 신규: 더보기 메뉴
  onMore?: () => void;
  rightContent?: React.ReactNode; // 신규: 커스텀 우측 영역
}
```

### 5.3 SCR-01 온보딩 (위치설정) - OnboardingPage

```
┌─────────────────────────────┐
│ 시작하기                  🔔 │
│ 내 동네부터 설정해요          │
├─────────────────────────────┤
│                             │
│ 내 동네부터 설정할까요?      │
│ 지역 기준으로 수수료/신고/   │
│ 나눔 정보를 정확히 보여드    │
│ 려요.                       │
│                             │
│ ┌─────────────────────────┐ │
│ │   온보딩 일러스트 영역   │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │   현재 위치로 설정       │ │ → /location/auto
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │   주소로 직접 입력       │ │ → /location/manual
│ └─────────────────────────┘ │
│                             │
│ 권한을 허용하지 않아도       │
│ 주소 입력으로 이용할 수      │
│ 있어요.                     │
├─────────────────────────────┤
│ [홈][온라인][오프라인][나눔][MY]│
└─────────────────────────────┘
```

**구현 파일**: `pages/onboarding/OnboardingPage.tsx`
**동작**: `useLocationStore.isOnboarded`가 false이면 App에서 리다이렉트

### 5.4 SCR-30 자동 위치 설정 - AutoLocationPage

```
┌─────────────────────────────┐
│ [←] 현재 위치로 설정      🔔 │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │       지도 영역          │ │  MapView 재사용
│ │       📍 내 위치         │ │
│ │                    [⊕]  │ │  현재위치 재조정 버튼
│ └─────────────────────────┘ │
│                             │
│ 현재 위치  지도를 움직여     │
│           위치를 조정할 수   │
│           있어요             │
│ 서울시 광진구 구의동          │
│ 정확하지 않으면 지도를       │
│ 드래그해서 위치를 맞춰 주세요│
│                             │
│ ┌─────────────────────────┐ │
│ │ 위치 권한이 필요해요     │ │
│ │ [권한 허용]  주소로 설정  │ │
│ └─────────────────────────┘ │
│                             │
│ [이 위치로 설정] [주소로 설정]│
└─────────────────────────────┘
```

**구현 파일**: `pages/location/AutoLocationPage.tsx`
**재사용**: `MapView`, `useMap`, `LocationCard`
**동작**:
1. `navigator.geolocation.getCurrentPosition()` 호출
2. 좌표 → 카카오 Reverse Geocoding API로 주소 변환
3. 확정 시 `useLocationStore.setLocation()` → 홈으로 이동

### 5.5 SCR-02 홈 - HomePage

```
┌─────────────────────────────┐
│ 역삼1동 ▾                 🔔 │  위치 헤더 (클릭 → 위치 변경)
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │  대형폐기물 배출,        │ │  배너 캐러셀 (자동 슬라이드)
│ │  이제 모바일로 쉽게!     │ │  dot indicators ● ● ●
│ │  온라인 신고 절차 알아보기│ │
│ └─────────────────────────┘ │
│                             │
│ 자주 찾는 서비스             │
│ ┌────┐┌────┐┌────┐┌────┐   │
│ │수수│ │온라│ │오프│ │무상│   │  4개 바로가기 아이콘
│ │료  │ │인  │ │라인│ │수거│   │
│ │조회│ │신고│ │안내│ │안내│   │
│ └────┘└────┘└────┘└────┘   │
│                             │
│ 이웃들의 무료 나눔    더보기>│
│ ┌─────────────────────────┐ │
│ │ [img] 상태 좋은 3인용... │ │  SharingPreviewCard
│ │       역삼1동 · 10분 전  │ │
│ │       [나눔중]           │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ [img] 원목 책상 가져가...│ │
│ │       도곡동 · 1시간 전  │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ [img] 작은 수납장(깨끗...)│ │
│ │       대치동 · 3시간 전  │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [홈][온라인][오프라인][나눔][MY]│
└─────────────────────────────┘
```

**구현 파일**: `pages/HomePage.tsx`
**신규 컴포넌트**:
- `features/home/BannerCarousel.tsx` - 배너 캐러셀
- `features/home/QuickServiceGrid.tsx` - 바로가기 4개
- `features/home/SharingPreviewCard.tsx` - 나눔 미리보기 카드
- `features/home/LocationHeader.tsx` - 위치 헤더 (동네명 + 알림)

### 5.6 SCR-03 로그인 - LoginPage (수정)

```
┌─────────────────────────────┐
│ 로그인                    🔔 │
├─────────────────────────────┤
│ 로그인                      │
│ 결제, 채팅, 스크랩 등       │
│ 서비스를 이용하려면          │
│ 로그인이 필요해요.          │
│                             │
│ 이메일                      │
│ ┌─────────────────────────┐ │
│ │ 이메일을 입력하세요      │ │  Input 재사용
│ └─────────────────────────┘ │
│ 비밀번호                    │
│ ┌─────────────────────────┐ │
│ │ 비밀번호를 입력하세요    │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │        로그인            │ │  Button primary
│ └─────────────────────────┘ │
│ 회원가입     비밀번호를      │
│             잊었나요?        │
│                             │
│ ┌─────────────────────────┐ │
│ │    게스트로 둘러보기     │ │  Button secondary
│ └─────────────────────────┘ │
│ 게스트는 목록과 상세만 볼   │
│ 수 있고, 결제·채팅·스크랩   │
│ 등의 기능은 로그인 후       │
│ 이용할 수 있어요.           │
├─────────────────────────────┤
│ [홈][온라인][오프라인][나눔][MY]│
└─────────────────────────────┘
```

**수정사항**: 게스트 모드 버튼 추가, AuthContext에 `loginAsGuest()` 메서드 추가

### 5.7 SCR-05 수수료 조회 - FeeCheckPage (수정)

```
┌─────────────────────────────┐
│ [←] 수수료 조회           🔔 │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 수수료 조회              │ │
│ │ 버리실 품목을 미리 검색  │ │
│ │ 해 예상 수수료를 확인해  │ │
│ │ 보세요.                  │ │
│ │                          │ │
│ │ ┌─────────────────────┐ │ │
│ │ │    품목 검색하기     │ │ │  → /fee-check/search
│ │ └─────────────────────┘ │ │
│ └─────────────────────────┘ │
│                             │
│ 이웃들이 자주 찾는 품목      │
│ ┌────┐┌────┐┌─────┐┌────┐  │
│ │의자││침대││매트리스││냉장고│  │  인기 태그 (Chip)
│ └────┘└────┘└─────┘└────┘  │  클릭 → /fee-check/search?keyword=의자
│ ┌────┐┌────┐┌────┐┌─────┐  │
│ │책상││옷장││소파 ││전자레인지│
│ └────┘└────┘└────┘└─────┘  │
│ ┌────┐┌────┐                │
│ │식탁││선풍기│               │
│ └────┘└────┘                │
├─────────────────────────────┤
│ [홈][온라인][오프라인][나눔][MY]│
└─────────────────────────────┘
```

**신규 컴포넌트**: `features/fee/PopularItemChips.tsx`

### 5.8 SCR-07 품목검색 - ItemSearchPage (공유)

```
┌─────────────────────────────┐
│ [←] 품목 검색             🔔 │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 🔍 품목 검색             │ │  SearchBar 재사용
│ └─────────────────────────┘ │
│                             │
│ [전체][가구류][가전류][주방용품][기타]│  CategoryTree → 탭 UI 변경
│                             │
│ 의자 (일반/등받이 부착)      │
│ ||||  2,000원    [✓ 추가됨] │  이미 추가된 경우
│                             │
│ 의자 (회전/바퀴 부착)        │
│ ||||  3,000원    [✓ 추가됨] │
│                             │
│ 책상 (편수/서랍 부착)        │
│ ||||  4,000원    [+ 추가]   │
│                             │
│ 책상 (양수/서랍 양쪽)        │
│ ||||  5,000원    [+ 추가]   │
│                             │
│ 식탁 (4인용 이하)            │
│ ||||  4,000원    [+ 추가]   │
│                             │
│ ─────────────────────────── │
│ 선택 2개                     │
│ |||| 5,000원     [선택 확인]│  하단 고정 바
└─────────────────────────────┘
```

**구현 파일**: `pages/fee-check/ItemSearchPage.tsx`
**핵심**: 수수료조회와 온라인신고 플로우에서 공유 사용. `useCartStore.mode`로 구분.
**재사용**: `SearchBar`, `wasteService`, `CategoryTree` (탭 스타일로 변경)

### 5.9 SCR-08 선택 품목 확인 - ItemConfirmPage

```
┌─────────────────────────────┐
│ [←] 선택 품목 확인        🔔 │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 의자 (일반)          ✕  │ │
│ │ 2,000원                 │ │
│ │          [−] 1 [+]     │ │  수량 조절
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 침대 (1인용)         ✕  │ │
│ │ 5,000원                 │ │
│ │          [−] 1 [+]     │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 총 수량         2개     │ │
│ │ 예상 수수료   7,000원   │ │
│ └─────────────────────────┘ │
│                             │
│ [품목 추가]       [확정]    │
│ (secondary)      (primary)  │
└─────────────────────────────┘
```

**구현 파일**: `pages/fee-check/ItemConfirmPage.tsx`
**동작**: 확정 → mode에 따라 `/fee-check/result` 또는 `/online/payment`로 이동

### 5.10 SCR-09 수수료 계산 결과 - FeeResultPage

```
┌─────────────────────────────┐
│ [←] 수수료 계산 결과      🔔 │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │     예상 수수료          │ │
│ │    12,000원              │ │  큰 텍스트
│ │     선택 품목 3개        │ │
│ └─────────────────────────┘ │
│                             │
│ 상세 내역                   │
│ ┌─────────────────────────┐ │
│ │ 의자        ||||  4,000 │ │
│ │ 수량 1개    ||||  4,000원│ │
│ ├─────────────────────────┤ │
│ │ 침대 프레임 ||||  5,000 │ │
│ │ 수량 1개    ||||  5,000원│ │
│ ├─────────────────────────┤ │
│ │ 매트리스    ||||  3,000 │ │
│ │ 수량 1개    ||||  3,000원│ │
│ └─────────────────────────┘ │
│                             │
│ [다시 조회]     [홈으로]    │
│                             │
│ ┌─────────────────────────┐ │
│ │ 바로 온라인 신고(유료)로 │ │
│ │ 진행할 수 있어요.        │ │
│ │ [온라인 신고(유료)로 진행]│ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**구현 파일**: `pages/fee-check/FeeResultPage.tsx`
**재사용**: `FeeResultCard` 확장

### 5.11 SCR-06 온라인 신고 안내 - OnlineGuidePage

```
┌─────────────────────────────┐
│ [←] 온라인 신고 안내      🔔 │
├─────────────────────────────┤
│ 온라인으로 간편하게          │
│ 대형폐기물을 신고하세요      │
│ 아래 4단계 절차를 통해       │
│ 신고가 접수됩니다.          │
│                             │
│ ① 배출 품목 검색 및 선택    │
│    버릴 품목을 검색하여      │
│    수수료를 확인합니다.      │
│                             │
│ ② 배출 장소 및 정보 입력    │
│    정확한 배출 위치와        │
│    일정을 입력합니다.        │
│                             │
│ ③ 수수료 결제               │
│    신용카드, 계좌이체 등으로 │
│    결제합니다.               │
│                             │
│ ④ 신고번호 부착 후 배출     │
│    발급된 번호를 부착하여    │
│    지정된 장소에 배출합니다. │
│                             │
│ ┌─────────────────────────┐ │
│ │   온라인 신고(유료)      │ │  primary → /online/search
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │   무상수거 안내          │ │  secondary → /free-collection
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [홈][온라인][오프라인][나눔][MY]│
└─────────────────────────────┘
```

### 5.12 SCR-10 수수료 결제 - PaymentPage (수정)

```
┌─────────────────────────────┐
│ [←] 결제                  🔔 │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ ⓘ 결제 오류 안내  [재시도]│ │  오류 시만 표시
│ │ 잔액이 부족하거나 카드    │ │
│ │ 정보를 확인할 수 없습니다.│ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 총 결제 금액   5,000원  │ │
│ │                          │ │
│ │ 의자(일반) 1개  2,000원 │ │
│ │ 의자(회전) 1개  3,000원 │ │
│ └─────────────────────────┘ │
│                             │
│ 결제 수단                   │
│ ┌─────────────────────────┐ │
│ │ 💳 신용/체크카드      ◉ │ │  라디오 선택
│ ├─────────────────────────┤ │
│ │ 📱 간편 결제(카카오)  ○ │ │
│ ├─────────────────────────┤ │
│ │ 🏦 실시간 계좌이체    ○ │ │
│ └─────────────────────────┘ │
│                             │
│ ☑ 주문할 품목 정보 및 결제  │
│   대행 서비스 이용 약관에    │
│   동의하며, 결제를 진행합니다│
│                             │
│ ┌─────────────────────────┐ │
│ │   5,000원 결제하기       │ │  primary
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [홈][온라인][오프라인][나눔][MY]│
└─────────────────────────────┘
```

### 5.13 SCR-11 배출 완료 - CompletePage (수정)

```
┌─────────────────────────────┐
│ [←]                       🔔 │
├─────────────────────────────┤
│           ✓                 │
│        완료됐어요            │
│ 배출 신고가 정상적으로       │
│ 접수되었습니다.              │
│                             │
│ ┌─────────────────────────┐ │
│ │ 배출번호                 │ │
│ │ 20231024-0001    📋 복사 │ │
│ └─────────────────────────┘ │
│                             │
│   [공유하기] [저장하기]      │
│            [스크린샷]        │
│                             │
│ ┌─────────────────────────┐ │
│ │    배출 내역 보기        │ │  primary → /mypage/disposal
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │      홈으로              │ │  secondary → /
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [홈][온라인][오프라인][나눔][MY]│
└─────────────────────────────┘
```

### 5.14 SCR-12 무상수거 안내 - FreeCollectionPage (신규)

```
┌─────────────────────────────┐
│ [←] 무상수거 안내         🔔 │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 📦 무상수거 대상         │ │
│ │ 냉장고, 세탁기, 에어컨,  │ │
│ │ TV 등 대형 가전제품을    │ │
│ │ 대상으로 합니다...       │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ⏰ 수거 조건             │ │
│ │ 원형이 크게 훼손되지     │ │
│ │ 않은 제품만 수거가       │ │
│ │ 가능합니다...            │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📞 신청 방법 및 문의     │ │
│ │ 폐가전 무상방문수거      │ │
│ │ 홈페이지(15990903.or.kr) │ │
│ │ 콜센터 1599-0903         │ │
│ └─────────────────────────┘ │
│                             │
│ [홈으로] [오프라인 안내 보기]│
├─────────────────────────────┤
│ [홈][온라인][오프라인][나눔][MY]│
└─────────────────────────────┘
```

### 5.15 SCR-13 오프라인 안내 - OfflineGuidePage (수정)

```
┌─────────────────────────────┐
│ [←] 오프라인 안내         🔔 │
├─────────────────────────────┤
│ 원하시는 안내를 선택해주세요 │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📍 지도 보기          > │ │ → /offline/map
│ │    주변 처리소 및 판매소  │ │
│ │    찾기                  │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🧾 수수료 조회        > │ │ → /fee-check
│ │    품목별 배출 수수료    │ │
│ │    확인하기              │ │
│ └─────────────────────────┘ │
│                             │
│ 자주 묻는 질문              │
│ ┌─────────────────────────┐ │
│ │ 오프라인으로 배출 스티커 │ │  아코디언 FAQ
│ │ 는 어디서 사나요?     ▾ │ │
│ ├─────────────────────────┤ │
│ │ 종량제 봉투에 담아서     │ │
│ │ 버려도 되나요?        ▾ │ │
│ ├─────────────────────────┤ │
│ │ 가전제품 무상수거는      │ │
│ │ 어떻게 신청하나요?    ▾ │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [홈][온라인][오프라인][나눔][MY]│
└─────────────────────────────┘
```

**신규 컴포넌트**: `features/offline/FaqAccordion.tsx`

### 5.16 SCR-14 지도 검색 - MapSearchPage

```
┌─────────────────────────────┐
│ [←] 지도 검색             🔔 │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 🔍 지역, 시설, 판매소   │ │  SearchBar
│ └─────────────────────────┘ │
│ [전체][처리 업체][지정 판매소][재활용]│  필터 탭
│                             │
│ ┌─────────────────────────┐ │
│ │                          │ │
│ │      지도 영역           │ │  MapView 재사용
│ │                          │ │
│ └─────────────────────────┘ │
│                             │
│ 주변 시설 12곳              │
│ ┌─────────────────────────┐ │
│ │ 강남구 대형폐기물 처리장 │ │  LocationCard 재사용
│ │ 서울 강남구 역삼로 123   │ │
│ │ 09:00-18:00     1.2km   │ │
│ ├─────────────────────────┤ │
│ │ CU 역삼행복점(지정판매소)│ │
│ │ 서울 강남구 테헤란로 456 │ │
│ │ 24시간 영업     350m    │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [홈][온라인][오프라인][나눔][MY]│
└─────────────────────────────┘
```

### 5.17 SCR-15 무료 나눔 목록 - SharingListPage (신규)

```
┌─────────────────────────────┐
│ [←] 무료 나눔             🔔 │
├─────────────────────────────┤
│ [역삼동 ▾] [🔍 나눔 물품 검색]│
│                             │
│ ┌─────────────────────────┐ │
│ │[img] 원목 의자 무료 나눔 │ │
│ │      역삼동 · 10분 전    │ │  SharingCard
│ │      [나눔중]            │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │[img] 안 쓰는 스탠드 조명 │ │
│ │      도곡동 · 45분 전    │ │
│ │      [나눔중]            │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │[img] 이사 정리로 1인용...│ │
│ │      대치동 · 2시간 전   │ │
│ │      [예약중]            │ │
│ └─────────────────────────┘ │
│ ...                         │
│                      [+ 등록]│  FAB 버튼 → /sharing/register
├─────────────────────────────┤
│ [홈][온라인][오프라인][나눔][MY]│
└─────────────────────────────┘
```

**신규 컴포넌트**:
- `features/sharing/SharingCard.tsx` - 나눔 카드
- `features/sharing/SharingStatusBadge.tsx` - 상태 뱃지

### 5.18 SCR-16 무료 나눔 상세 - SharingDetailPage (신규)

```
┌─────────────────────────────┐
│ [←]                   [...] 🔔│
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │                          │ │
│ │    이미지 슬라이더       │ │  1/3 페이지 인디케이터
│ │                          │ │
│ └─────────────────────────┘ │
│                             │
│ 👤 친절한이웃               │
│    역삼동                   │
│                             │
│ [나눔중]                    │
│ 원목 의자 무료 나눔합니다    │
│ 조회 142 · 10분 전          │
│                             │
│ 이사 가면서 안 쓰는 원목    │
│ 의자 나눔합니다.            │
│ 직접 오셔서 가져가실 분     │
│ 찾아요. 생활 기스 약간      │
│ 있지만 튼튼하고 쓰기        │
│ 좋습니다.                   │
│ 빠르게 오실 수 있는 분      │
│ 우대합니다!                 │
│                             │
├─────────────────────────────┤
│ ♡ 스크랩   [    채팅하기    ]│  하단 고정 바
├─────────────────────────────┤
│ [홈][온라인][오프라인][나눔][MY]│
└─────────────────────────────┘
```

### 5.19 SCR-17 무료 나눔 채팅 - SharingChatPage (신규)

```
┌─────────────────────────────┐
│ [←] 이웃주민              🔔 │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │[img] 원목 의자 무료 나눔 │ │  채팅 상단: 나눔 아이템 요약
│ │      나눔중           > │ │
│ └─────────────────────────┘ │
│                             │
│        2023년 10월 24일     │
│                             │
│ 👤 이웃주민                 │
│ ┌──────────────┐            │
│ │ 안녕하세요!   │ 10:30     │
│ │ 혹시 의자     │            │
│ │ 아직 있나요?  │            │
│ └──────────────┘            │
│                             │
│            ┌──────────────┐ │
│   10:32    │ 네, 아직     │ │  내 메시지
│            │ 있습니다.    │ │
│            └──────────────┘ │
│                             │
│ 👤 이웃주민                 │
│ ┌──────────────┐            │
│ │ 오늘 저녁 7시│ 10:35     │
│ │ 쯤 가지러 가 │            │
│ │ 도 될까요?   │            │
│ └──────────────┘            │
│                             │
├─────────────────────────────┤
│ [+] [메시지를 입력하세요] [▶]│  ChatInput
└─────────────────────────────┘
```

**신규 컴포넌트**:
- `features/chat/ChatBubble.tsx` - 채팅 말풍선
- `features/chat/ChatInput.tsx` - 메시지 입력
- `features/chat/ChatItemHeader.tsx` - 상단 아이템 요약

### 5.20 SCR-18/32 무료 나눔 등록/수정

**등록 (SCR-18)**: `pages/sharing/SharingRegisterPage.tsx`
**수정 (SCR-32)**: `pages/sharing/SharingEditPage.tsx`

공유 컴포넌트: `features/sharing/SharingForm.tsx`

```
필드 구성:
- 사진 등록 (최대 10장, 카메라/갤러리)
- 글 제목 (Input)
- 카테고리 선택 (Select)
- 희망 거래 장소 (현재 위치 기반)
- 설명 (Textarea)
- [수정 시] 상태 변경 (진행중/예약중/거래완료)
```

### 5.21 SCR-19 마이페이지 - MyPage (수정)

```
┌─────────────────────────────┐
│ [←] 마이페이지            🔔 │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 👤  당근이웃              │ │  프로필 카드
│ │     서초구 방배동         │ │
│ └─────────────────────────┘ │
│                             │
│ 내역                        │
│ ┌─────────────────────────┐ │
│ │ 🚛 배출 내역          > │ │ → /mypage/disposal
│ │    대형 폐기물 배출 신고  │ │
│ ├─────────────────────────┤ │
│ │ 🧾 구매 내역          > │ │ → /mypage/purchases
│ │    온라인 신고 결제 내역  │ │
│ ├─────────────────────────┤ │
│ │ 🎁 나눔 내역          > │ │ → /mypage/sharing
│ │    등록한 무료 나눔 목록  │ │
│ └─────────────────────────┘ │
│                             │
│ 관리                        │
│ ┌─────────────────────────┐ │
│ │ 결제수단               > │ │ → /mypage/payment-methods
│ ├─────────────────────────┤ │
│ │ 스크랩 목록            > │ │ → /mypage/scraps
│ ├─────────────────────────┤ │
│ │ 설정                   > │ │ → /mypage/settings
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [홈][온라인][오프라인][나눔][MY]│
└─────────────────────────────┘
```

### 5.22 SCR-20/21 배출 내역 목록/상세

**목록 (SCR-20)**: 필터 탭 [전체][진행중][완료][취소]
**상세 (SCR-21)**: 배출번호 + 결제정보 + 배출품목 상세

### 5.23 SCR-22 나눔 내역 / SCR-23 구매 내역

**나눔 내역**: 필터 [전체][모집중][예약중][나눔완료], 확장 시 상태변경/수정/채팅 이동
**구매 내역**: 필터 [전체][진행중][거래완료], 확장 시 상세/채팅 이동

### 5.24 SCR-24/25 결제수단 관리

**목록**: 등록된 결제수단 리스트 + 기본 설정 뱃지 + 추가 버튼
**추가**: 카드번호/유효기간/CVC/비밀번호/별칭 폼

### 5.25 SCR-27/28 설정/개인정보 수정

**설정**: 개인정보 수정 / 로그아웃 / 탈퇴
**개인정보**: 프로필 이미지 / 이메일(readonly) / 닉네임 / 내 동네 / 휴대폰 번호

### 5.26 SCR-29 알림 목록

```
타입별 아이콘:
- disposal_complete: 📦
- new_chat: 💬
- payment_complete: 💳
- scrap_shared: 📌
- collection_complete: 🚛
```

---

## 6. 신규 서비스 설계

### 6.1 sharingService.ts

```typescript
export const sharingService = {
  getList(params: { dong?: string; keyword?: string; page?: number }): Promise<SharingItem[]>,
  getDetail(id: number): Promise<SharingItem>,
  create(data: SharingCreateRequest): Promise<SharingItem>,
  update(id: number, data: SharingUpdateRequest): Promise<SharingItem>,
  delete(id: number): Promise<void>,
  toggleScrap(id: number): Promise<{ scraped: boolean }>,
  getMyList(): Promise<SharingItem[]>,
  getMyPurchases(): Promise<SharingItem[]>,
  getMyScraps(): Promise<SharingItem[]>,
};
```

### 6.2 chatService.ts

```typescript
export const chatService = {
  getRooms(): Promise<ChatRoom[]>,
  getMessages(roomId: number): Promise<ChatMessage[]>,
  sendMessage(roomId: number, content: string): Promise<ChatMessage>,
  createRoom(sharingItemId: number): Promise<ChatRoom>,
};
```

### 6.3 notificationService.ts

```typescript
export const notificationService = {
  getList(): Promise<Notification[]>,
  markAsRead(id: number): Promise<void>,
  markAllAsRead(): Promise<void>,
  getUnreadCount(): Promise<number>,
};
```

### 6.4 paymentMethodService.ts

```typescript
export const paymentMethodService = {
  getList(): Promise<PaymentMethod[]>,
  create(data: PaymentMethodCreateRequest): Promise<PaymentMethod>,
  delete(id: number): Promise<void>,
  setDefault(id: number): Promise<void>,
};
```

> **Note**: 모든 신규 서비스는 초기 구현 시 Mock 데이터를 반환합니다.

---

## 7. 컴포넌트 전체 목록

### 7.1 기존 유지 (변경 없음)

| 컴포넌트 | 위치 |
|----------|------|
| Button | `components/ui/Button.tsx` |
| Input | `components/ui/Input.tsx` |
| Card | `components/ui/Card.tsx` |
| Badge | `components/ui/Badge.tsx` |
| SearchBar | `components/ui/SearchBar.tsx` |
| Modal | `components/ui/Modal.tsx` |
| Select | `components/ui/Select.tsx` |
| DatePicker | `components/ui/DatePicker.tsx` |
| MobileContainer | `components/layout/MobileContainer.tsx` |
| ProgressBar | `components/layout/ProgressBar.tsx` |
| MapView | `components/map/MapView.tsx` |
| MapPlaceholder | `components/map/MapPlaceholder.tsx` |
| KakaoMapAdapter | `components/map/KakaoMapAdapter.ts` |
| FeeResultCard | `components/waste/FeeResultCard.tsx` |
| WasteItemCard | `components/waste/WasteItemCard.tsx` |
| SizeSelector | `components/waste/SizeSelector.tsx` |
| WasteSearchBar | `components/waste/WasteSearchBar.tsx` |

### 7.2 기존 수정

| 컴포넌트 | 수정 내용 |
|----------|-----------|
| Header | showNotification, showMore, rightContent props 추가 |
| BottomNav | 5탭 구조로 전면 변경 |
| CategoryTree | 수평 탭 스타일로 변경 |
| LocationCard | 거리 표시 추가 |
| AuthContext | loginAsGuest(), isGuest 추가 |

### 7.3 신규 컴포넌트

| 컴포넌트 | 위치 | 사용 화면 |
|----------|------|-----------|
| LocationHeader | `features/home/LocationHeader.tsx` | SCR-02 |
| BannerCarousel | `features/home/BannerCarousel.tsx` | SCR-02 |
| QuickServiceGrid | `features/home/QuickServiceGrid.tsx` | SCR-02 |
| SharingPreviewCard | `features/home/SharingPreviewCard.tsx` | SCR-02 |
| PopularItemChips | `features/fee/PopularItemChips.tsx` | SCR-05 |
| ItemSearchList | `features/fee/ItemSearchList.tsx` | SCR-07 |
| CartSummaryBar | `features/fee/CartSummaryBar.tsx` | SCR-07 하단 |
| CartItemCard | `features/fee/CartItemCard.tsx` | SCR-08 |
| FeeBreakdown | `features/fee/FeeBreakdown.tsx` | SCR-09 |
| StepGuideCard | `features/online/StepGuideCard.tsx` | SCR-06 |
| PaymentMethodSelector | `features/disposal/PaymentMethodSelector.tsx` | SCR-10 |
| DisposalComplete | `features/disposal/DisposalComplete.tsx` | SCR-11 |
| InfoSection | `features/free-collection/InfoSection.tsx` | SCR-12 |
| FaqAccordion | `features/offline/FaqAccordion.tsx` | SCR-13 |
| MapFilterTabs | `features/offline/MapFilterTabs.tsx` | SCR-14 |
| SharingCard | `features/sharing/SharingCard.tsx` | SCR-15 |
| SharingStatusBadge | `features/sharing/SharingStatusBadge.tsx` | SCR-15, 16, 22 |
| ImageSlider | `features/sharing/ImageSlider.tsx` | SCR-16 |
| SharingForm | `features/sharing/SharingForm.tsx` | SCR-18, 32 |
| ChatBubble | `features/chat/ChatBubble.tsx` | SCR-17 |
| ChatInput | `features/chat/ChatInput.tsx` | SCR-17 |
| ChatItemHeader | `features/chat/ChatItemHeader.tsx` | SCR-17 |
| ProfileCard | `features/mypage/ProfileCard.tsx` | SCR-19 |
| MenuListItem | `features/mypage/MenuListItem.tsx` | SCR-19 |
| DisposalHistoryCard | `features/mypage/DisposalHistoryCard.tsx` | SCR-20 |
| SharingHistoryCard | `features/mypage/SharingHistoryCard.tsx` | SCR-22 |
| PurchaseHistoryCard | `features/mypage/PurchaseHistoryCard.tsx` | SCR-23 |
| PaymentMethodCard | `features/payment/PaymentMethodCard.tsx` | SCR-24 |
| PaymentMethodForm | `features/payment/PaymentMethodForm.tsx` | SCR-25 |
| ScrapCard | `features/mypage/ScrapCard.tsx` | SCR-26 |
| ProfileEditForm | `features/mypage/ProfileEditForm.tsx` | SCR-28 |
| NotificationItem | `features/notification/NotificationItem.tsx` | SCR-29 |
| LocationPermissionCard | `features/location/LocationPermissionCard.tsx` | SCR-30 |
| AddressSearchInput | `features/location/AddressSearchInput.tsx` | SCR-31 |
| FilterTabs | `components/ui/FilterTabs.tsx` | SCR-20, 22, 23 공용 |

---

## 8. 구현 순서 (상세)

### Phase 1: 기반 구조

```
1. [types] location.ts, sharing.ts, chat.ts, notification.ts, payment.ts 생성
2. [stores] useLocationStore.ts, useCartStore.ts 생성
3. [layout] BottomNav.tsx 5탭 변경
4. [layout] Header.tsx props 확장 (알림 아이콘)
5. [ui] FilterTabs.tsx 공용 컴포넌트 생성
6. [router] index.tsx 전면 재작성
7. [App.tsx] 온보딩 분기 로직 추가
```

### Phase 2: 온보딩 + 홈

```
8. [location] LocationPermissionCard, AddressSearchInput 생성
9. [pages] OnboardingPage 구현
10. [pages] AutoLocationPage 구현
11. [pages] ManualLocationPage 구현
12. [home] LocationHeader, BannerCarousel, QuickServiceGrid, SharingPreviewCard 생성
13. [pages] HomePage 전면 재작성
```

### Phase 3: 수수료 조회 + 온라인 신고

```
14. [fee] PopularItemChips, ItemSearchList, CartSummaryBar, CartItemCard, FeeBreakdown 생성
15. [pages] FeeCheckPage 수정 (SCR-05)
16. [pages] ItemSearchPage 신규 (SCR-07)
17. [pages] ItemConfirmPage 신규 (SCR-08)
18. [pages] FeeResultPage 신규 (SCR-09)
19. [online] StepGuideCard 생성
20. [pages] OnlineGuidePage 수정 (SCR-06)
21. [disposal] PaymentMethodSelector 생성
22. [pages] PaymentPage 수정 (SCR-10)
23. [pages] CompletePage 수정 (SCR-11)
```

### Phase 4: 오프라인 + 무상수거

```
24. [offline] FaqAccordion, MapFilterTabs 생성
25. [pages] OfflineGuidePage 수정 (SCR-13)
26. [pages] MapSearchPage 수정 (SCR-14)
27. [free-collection] InfoSection 생성
28. [pages] FreeCollectionPage 신규 (SCR-12)
```

### Phase 5: 무료 나눔

```
29. [services] sharingService.ts (mock) 생성
30. [services] chatService.ts (mock) 생성
31. [sharing] SharingCard, SharingStatusBadge, ImageSlider, SharingForm 생성
32. [chat] ChatBubble, ChatInput, ChatItemHeader 생성
33. [pages] SharingListPage 신규 (SCR-15)
34. [pages] SharingDetailPage 신규 (SCR-16)
35. [pages] SharingRegisterPage 신규 (SCR-18)
36. [pages] SharingEditPage 신규 (SCR-32)
37. [pages] SharingChatPage 신규 (SCR-17)
```

### Phase 6: 마이페이지

```
38. [services] paymentMethodService.ts (mock) 생성
39. [services] notificationService.ts (mock) 생성
40. [mypage] ProfileCard, MenuListItem, DisposalHistoryCard, SharingHistoryCard, PurchaseHistoryCard, ScrapCard, ProfileEditForm 생성
41. [payment] PaymentMethodCard, PaymentMethodForm 생성
42. [pages] MyPage 수정 (SCR-19)
43. [pages] DisposalListPage, DisposalDetailPage 신규 (SCR-20, 21)
44. [pages] SharingHistoryPage 신규 (SCR-22)
45. [pages] PurchaseHistoryPage 신규 (SCR-23)
46. [pages] PaymentMethodsPage, AddPaymentMethodPage 신규 (SCR-24, 25)
47. [pages] ScrapsPage 신규 (SCR-26)
48. [pages] SettingsPage, ProfileEditPage 신규 (SCR-27, 28)
```

### Phase 7: 인증 + 알림

```
49. [auth] AuthContext 수정 (게스트 모드)
50. [pages] LoginPage 수정 (SCR-03)
51. [pages] SignupPage 수정 (SCR-04)
52. [notification] NotificationItem 생성
53. [pages] NotificationsPage 신규 (SCR-29)
```

---

## 9. Coding Conventions

### 9.1 Naming

| Target | Rule | Example |
|--------|------|---------|
| 페이지 컴포넌트 | PascalCase + Page 접미사 | `SharingListPage` |
| 기능 컴포넌트 | PascalCase | `SharingCard` |
| 서비스 | camelCase + Service 접미사 | `sharingService` |
| 스토어 | use + PascalCase + Store | `useLocationStore` |
| 타입 | PascalCase | `SharingItem` |

### 9.2 Import Order

```typescript
// 1. React / 외부 라이브러리
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. 내부 컴포넌트
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'

// 3. features
import SharingCard from '@/features/sharing/SharingCard'

// 4. services / stores
import { sharingService } from '@/services/sharingService'
import { useLocationStore } from '@/stores/useLocationStore'

// 5. types
import type { SharingItem } from '@/types/sharing'
```

### 9.3 Button Variant Mapping (와이어프레임 ↔ 코드)

| 와이어프레임 | variant | 사용처 |
|-------------|---------|--------|
| 검은 배경 / 흰 텍스트 (주요 버튼) | `primary` (bg를 black으로 변경) | 로그인, 가입하기, 결제 등 |
| 흰 배경 / 검은 테두리 (보조 버튼) | `secondary` | 품목 추가, 게스트, 홈으로 |
| 텍스트만 (링크형) | `ghost` | 회원가입, 비밀번호찾기 |

> **Note**: 와이어프레임의 primary 버튼 색상이 검은색(#000)이므로, Button의 `primary` variant 색상을 blue에서 black으로 변경 필요.

---

## 10. AI 파일 보호 목록 (변경 금지)

```
src/features/ai/PhotoCapture.tsx      ❌ 변경 금지
src/features/ai/PredictionResult.tsx  ❌ 변경 금지
src/services/aiService.ts             ❌ 변경 금지
src/types/ai.ts                       ❌ 변경 금지
src/pages/AiPredictPage.tsx           ❌ 변경 금지
ai-server/ 전체                       ❌ 변경 금지
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-26 | 초기 작성 - 32개 화면 상세 설계 | AI Assistant |
