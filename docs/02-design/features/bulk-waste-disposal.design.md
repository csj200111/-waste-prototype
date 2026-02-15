# 대형폐기물 배출 도우미 서비스 Design Document

> **Summary**: 대형폐기물 수수료 조회, 오프라인/온라인 배출, 운반 대행, 역경매를 제공하는 모바일 우선 웹 서비스의 상세 설계
>
> **Project**: throw_it
> **Version**: 0.3.0
> **Author**: User
> **Date**: 2026-02-12
> **Last Updated**: 2026-02-15
> **Status**: Implementation Complete (Prototype)
> **Planning Doc**: [bulk-waste-disposal.plan.md](../../01-plan/features/bulk-waste-disposal.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 모바일 UI 기준으로 모든 화면 설계 (428px max-width, 반응형 대응)
- 추후 Spring 백엔드, DB, 지도 API, 결제 API 연동이 용이한 확장 가능한 구조
- 프로토타입 단계에서는 Mock 데이터로 동작하되, API 레이어 분리
- 지도 UI 자리를 미리 확보하여 추후 API 연동만으로 동작 가능하도록 설계

### 1.2 Design Principles

- **모바일 우선**: 모든 컴포넌트를 모바일 뷰포트 기준으로 설계 (max-width: 428px)
- **Feature-based 모듈화**: 기능별 독립 모듈로 유지보수 용이
- **Data Layer 분리**: Mock 데이터와 실제 API를 교체할 수 있는 서비스 레이어
- **Custom Hook 패턴**: 비즈니스 로직을 Hook으로 캡슐화하여 UI와 분리
- **점진적 확장**: 프로토타입 → DB 연동 → 결제/인증/지도 연동 순서로 확장

---

## 2. Architecture

### 2.1 Component Diagram

```
┌──────────────────────────────────────────────────────────┐
│                Client (React 19 + Vite 7)                 │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Pages   │  │Components│  │ Features │  │  Stores  │ │
│  │(React   │──│(UI/Waste/│──│(fee/     │──│(Zustand  │ │
│  │ Router  │  │ Layout/  │  │disposal/ │  │ 5)       │ │
│  │ 7)      │  │ Map)     │  │recycle/  │  │          │ │
│  │         │  │          │  │mypage)   │  │          │ │
│  └─────────┘  └──────────┘  └──────────┘  └──────────┘ │
│       │                          │                       │
│  ┌────▼──────────────────────────▼──────────────────┐   │
│  │              Services Layer                       │   │
│  │  (Mock Data ↔ 추후 Spring API Client 교체)        │   │
│  └───────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
           │ (추후 연동)
┌──────────▼──────────────────────────────────────────────┐
│              Backend (Java + Spring Boot)                │
│  REST API → Service → Repository → Database             │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
사용자 입력 → Page(React Router) → Feature Hook → Service Layer → Mock Data/API
                                      ↓
                                 Zustand Store → UI 업데이트
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| Pages | Components, Features, Stores | 화면 렌더링 |
| Features | Services, Types, Stores | 비즈니스 로직 (Custom Hooks + Domain Components) |
| Services | Types, Mock Data | 데이터 접근 |
| Components | Types | UI 표현 |
| Stores | Types | 전역 상태 관리 (Region, Disposal) |

### 2.4 Tech Stack (Implemented)

| Category | Package | Version |
|----------|---------|---------|
| UI Framework | React | ^19.2.0 |
| Build Tool | Vite | ^7.3.1 |
| Language | TypeScript | ~5.9.3 |
| Routing | react-router-dom | ^7.13.0 |
| State Management | Zustand | ^5.0.11 |
| Server State | @tanstack/react-query | ^5.90.21 |
| Form | react-hook-form | ^7.71.1 |
| Styling | Tailwind CSS | ^4.1.18 (@tailwindcss/vite) |
| Linting | ESLint | ^9.39.1 |

---

## 3. Data Model

### 3.1 Entity Definition

```typescript
// types/region.ts
interface Region {
  id: string;
  city: string;          // 시/도 (예: "서울특별시")
  district: string;      // 구 (예: "강남구")
  dong: string;          // 동 (예: "역삼동")
}

// types/waste.ts
interface WasteCategory {
  id: string;
  name: string;          // 카테고리명 (예: "가구")
  parentId: string | null; // 상위 카테고리 ID (null이면 최상위)
  children?: WasteCategory[];
}

interface WasteItem {
  id: string;
  categoryId: string;    // 소속 카테고리 ID
  name: string;          // 폐기물명 (예: "책상")
  sizes: WasteSize[];    // 규격 목록
}

interface WasteSize {
  id: string;
  label: string;         // 규격 표시 (예: "소형 (1m 이하)")
  description: string;   // 상세 설명
}

// types/fee.ts
interface FeeInfo {
  id: string;
  regionId: string;      // 지역 ID
  wasteItemId: string;   // 폐기물 항목 ID
  sizeId: string;        // 규격 ID
  fee: number;           // 수수료 (원)
}

// types/disposal.ts
type DisposalStatus = 'draft' | 'pending_payment' | 'paid' | 'scheduled' | 'collected' | 'cancelled' | 'refunded';
type PaymentMethod = 'card' | 'transfer';

interface DisposalItem {
  wasteItemId: string;
  wasteItemName: string;
  sizeId: string;
  sizeLabel: string;
  quantity: number;
  fee: number;
  photoUrl?: string;     // 사진 (선택)
}

interface DisposalApplication {
  id: string;
  applicationNumber: string;  // 배출 번호
  userId: string;
  regionId: string;
  items: DisposalItem[];
  disposalAddress: string;    // 배출 장소
  preferredDate: string;      // 희망 배출일 (YYYY-MM-DD)
  totalFee: number;
  status: DisposalStatus;
  paymentMethod: PaymentMethod | null;
  createdAt: string;
  updatedAt: string;
}

// types/offline.ts
interface TransportCompany {
  id: string;
  name: string;          // 업체명
  phone: string;         // 전화번호
  regionId: string;      // 서비스 지역
  description?: string;
}

interface StickerShop {
  id: string;
  name: string;          // 판매소명
  address: string;       // 주소
  phone?: string;
  regionId: string;
  lat?: number;          // 위도 (추후 지도 연동)
  lng?: number;          // 경도 (추후 지도 연동)
}

interface CommunityCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  regionId: string;
  lat?: number;
  lng?: number;
}

// types/recycle.ts
type RecycleStatus = 'available' | 'reserved' | 'collected';

interface RecycleItem {
  id: string;
  userId: string;
  title: string;         // 물품명
  description: string;   // 설명
  photos: string[];      // 사진 URL 목록
  categoryId: string;
  regionId: string;
  address: string;       // 수거 가능 위치
  lat?: number;
  lng?: number;
  status: RecycleStatus;
  createdAt: string;
}
```

### 3.2 Entity Relationships

```
[Region] 1 ──── N [FeeInfo]
   │
   ├── 1 ──── N [StickerShop]
   ├── 1 ──── N [CommunityCenter]
   └── 1 ──── N [TransportCompany]

[WasteCategory] 1 ──── N [WasteCategory] (self-referencing tree)
   │
   └── 1 ──── N [WasteItem]
                    │
                    └── 1 ──── N [WasteSize]

[DisposalApplication] 1 ──── N [DisposalItem]

[RecycleItem] (독립)
```

---

## 4. API Specification (Services Layer)

프로토타입 단계에서는 Mock 데이터를 반환하는 서비스 함수로 구현. 추후 Spring API Client로 교체.

### 4.1 서비스 인터페이스 (Implemented)

| Service | Method | Description | Returns |
|---------|--------|-------------|---------|
| **RegionService** (`services/regionService.ts`) | | | |
| | `getRegions()` | 전체 지역 목록 | `Region[]` |
| | `searchRegion(query)` | 주소 검색 → 지역 매핑 (city/district/dong 매칭) | `Region[]` |
| | `getRegionById(id)` | ID로 지역 조회 | `Region \| undefined` |
| | `getRegionLabel(region)` | 지역을 문자열로 포맷 | `string` |
| **WasteService** (`services/wasteService.ts`) | | | |
| | `getCategories()` | 전체 카테고리 트리 | `WasteCategory[]` |
| | `getItemsByCategory(categoryId)` | 카테고리별 폐기물 목록 | `WasteItem[]` |
| | `searchWasteItems(keyword)` | 키워드 검색 (이름 매칭) | `WasteItem[]` |
| | `getItemById(id)` | ID로 폐기물 항목 조회 | `WasteItem \| undefined` |
| **FeeService** (`services/feeService.ts`) | | | |
| | `calculateFee(regionId, wasteItemId, sizeId)` | 수수료 조회 (미매칭 시 r1 fallback) | `FeeInfo \| undefined` |
| | `calculateTotalFee(items)` | 복수 항목 총 수수료 | `number` |
| **DisposalService** (`services/disposalService.ts`) | | | |
| | `createApplication(data)` | 배출 신청 생성 | `DisposalApplication` |
| | `getApplication(id)` | 신청 상세 조회 | `DisposalApplication \| undefined` |
| | `getMyApplications()` | 내 신청 목록 | `DisposalApplication[]` |
| | `cancelApplication(id)` | 신청 취소 | `DisposalApplication` |
| | `processPayment(id, method)` | 결제 처리 (Mock) | `DisposalApplication` |
| **OfflineService** (`services/offlineService.ts`) | | | |
| | `getStickerShops(regionId?)` | 스티커 판매소 목록 (regionId 선택적 필터) | `StickerShop[]` |
| | `getCommunityCenters(regionId?)` | 주민센터 목록 (regionId 선택적 필터) | `CommunityCenter[]` |
| | `getTransportCompanies(regionId?)` | 운반 대행 업체 (regionId 선택적 필터) | `TransportCompany[]` |
| **RecycleService** (`services/recycleService.ts`) | | | |
| | `registerItem(data)` | 역경매 물품 등록 | `RecycleItem` |
| | `getItems(regionId?)` | 물품 목록 조회 (regionId 선택적 필터) | `RecycleItem[]` |
| | `updateStatus(id, status)` | 상태 변경 | `RecycleItem` |

### 4.2 추후 Spring API 매핑

| Service Method | Spring API Endpoint |
|---------------|---------------------|
| `getRegions()` | `GET /api/regions` |
| `searchRegion(query)` | `GET /api/regions/search?q={query}` |
| `getCategories()` | `GET /api/waste/categories` |
| `searchWasteItems(keyword)` | `GET /api/waste/items?q={keyword}` |
| `getItemById(id)` | `GET /api/waste/items/{id}` |
| `calculateFee(...)` | `GET /api/fees?region={}&item={}&size={}` |
| `createApplication(data)` | `POST /api/disposals` |
| `getMyApplications()` | `GET /api/disposals/my` |
| `cancelApplication(id)` | `PATCH /api/disposals/{id}/cancel` |
| `processPayment(id, method)` | `POST /api/disposals/{id}/payment` |
| `getStickerShops(regionId)` | `GET /api/offline/sticker-shops?region={}` |
| `getCommunityCenters(regionId)` | `GET /api/offline/centers?region={}` |
| `getTransportCompanies(regionId)` | `GET /api/offline/transport?region={}` |
| `registerItem(data)` | `POST /api/recycle/items` |
| `getItems(regionId?)` | `GET /api/recycle/items?region={}` |

---

## 5. UI/UX Design

### 5.1 화면 목록 (Implemented)

| # | 화면 | Route | 설명 |
|---|------|-------|------|
| 1 | 홈 | `/` | 메인 진입점, 주요 기능 바로가기 카드 |
| 2 | 수수료 조회 | `/fee-check` | 3단계: 지역 → 폐기물(트리/검색) → 규격 → 수수료 표시 |
| 3 | 오프라인 안내 | `/offline` | 오프라인 배출 안내 + 3개 메뉴 카드 |
| 4 | 스티커 판매소 | `/offline/sticker-shops` | 구 선택 + MapPlaceholder + 판매소 목록 |
| 5 | 동사무소/주민센터 | `/offline/centers` | 구 선택 + MapPlaceholder + 주민센터 목록 |
| 6 | 운반 대행 | `/offline/transport` | 운반 업체 카드 (전화 링크 포함) |
| 7 | 온라인 배출 안내 | `/online` | 4단계 프로세스 안내 + 시작 버튼 |
| 8 | 배출 신청 폼 | `/online/apply` | ProgressBar(1/4) + DisposalForm |
| 9 | 검수 화면 | `/online/review` | ProgressBar(2/4) + ReviewSummary |
| 10 | 결제 화면 | `/online/payment` | ProgressBar(3/4) + PaymentForm |
| 11 | 완료 화면 | `/online/complete` | ProgressBar(4/4) + DisposalNumber + 영수증 링크 |
| 12 | 역경매 목록 | `/recycle` | 물품 카드 목록 + 등록 버튼 |
| 13 | 역경매 등록 | `/recycle/register` | RecycleRegisterForm |
| 14 | 마이페이지 | `/mypage` | ApplicationList + 상세/취소/영수증 |
| 15 | 영수증 조회 | `/mypage/receipt/:id` | ReceiptView |

### 5.2 화면 상세 설계

#### 5.2.1 홈 화면 (`/`)

```
┌─────────────────────────────┐
│  대형폐기물 배출 도우미       │  ← Header (서비스명)
├─────────────────────────────┤
│                             │
│  ┌─────────────────────────┐│
│  │  수수료 조회하기         ││  ← CTA 카드 (가장 큰 영역)
│  └─────────────────────────┘│
│                             │
│  ┌────────────┐┌───────────┐│
│  │ 오프라인   ││ 온라인    ││  ← 2x2 그리드 카드
│  │ 배출 안내  ││ 배출 신청 ││
│  └────────────┘└───────────┘│
│  ┌────────────┐┌───────────┐│
│  │ 운반       ││ 재활용    ││
│  │ 대행       ││ 역경매    ││
│  └────────────┘└───────────┘│
│                             │
├─────────────────────────────┤
│  🏠 홈              👤 MY  │  ← BottomNav (2탭, 고정)
└─────────────────────────────┘
```

#### 5.2.2 수수료 조회 (`/fee-check`)

```
┌─────────────────────────────┐
│  ← 수수료 조회               │  ← Header + 뒤로가기
├─────────────────────────────┤
│                             │
│  Step 1. 지역 선택           │
│  ┌─────────────────────────┐│
│  │ 주소를 입력하세요         ││  ← 텍스트 입력 (자동완성)
│  └─────────────────────────┘│
│  서울특별시 강남구 역삼동      │  ← 파싱 결과 표시
│                             │
│  Step 2. 폐기물 선택         │
│  ┌─────────────────────────┐│
│  │ 🔍 폐기물 검색...        ││  ← WasteSearchBar
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ ▶ 가구                   ││  ← CategoryTree (재귀 컴포넌트)
│  │   ▶ 책상                 ││    펼침/접힘 + 들여쓰기
│  │     • 일반 책상           ││    선택 시 하이라이트
│  │     • 컴퓨터 책상         ││
│  │   ▶ 의자                 ││
│  │ ▶ 가전제품               ││
│  │ ▶ 침구류                 ││
│  └─────────────────────────┘│
│                             │
│  Step 3. 규격 선택           │
│  ○ 소형 (1m 이하)           │  ← SizeSelector (라디오)
│  ● 중형 (1m ~ 1.5m)        │
│  ○ 대형 (1.5m 초과)         │
│                             │
│  ┌─────────────────────────┐│
│  │  수수료: 8,000원         ││  ← FeeResultCard
│  │  강남구 기준 | 책상 중형   ││
│  └─────────────────────────┘│
│                             │
│  [온라인으로 바로 신청하기 →]  │
│                             │
├─────────────────────────────┤
│  🏠 홈              👤 MY  │
└─────────────────────────────┘
```

#### 5.2.3 온라인 배출 신청 (`/online/apply`)

```
┌─────────────────────────────┐
│  ← 온라인 배출 신청          │
├─────────────────────────────┤
│  ●──○──○──○                 │  ← ProgressBar (step 1/4)
│  입력                       │
│                             │
│  배출 지역                   │
│  ┌─────────────────────────┐│
│  │ 지역 검색 입력            ││  ← 검색 + 선택
│  └─────────────────────────┘│
│                             │
│  배출 장소 (상세 주소)        │
│  ┌─────────────────────────┐│
│  │ 역삼동 123-45 아파트 앞   ││
│  └─────────────────────────┘│
│                             │
│  희망 배출일                  │
│  ┌─────────────────────────┐│
│  │ 2026-02-15              ││  ← DatePicker
│  └─────────────────────────┘│
│                             │
│  배출 품목                   │
│  ┌─────────────────────────┐│
│  │ 책상 (중형) x1  8,000원  ││  ← WasteItemCard (삭제 가능)
│  │ 의자 (소형) x2  6,000원  ││
│  └─────────────────────────┘│
│  [+ 품목 추가]               │  ← Modal로 카테고리/규격 선택
│                             │
│  총 수수료: 14,000원         │
│                             │
│  [다음: 검수하기 →]          │
├─────────────────────────────┤
│  🏠 홈              👤 MY  │
└─────────────────────────────┘
```

#### 5.2.4 검수 화면 (`/online/review`)

```
┌─────────────────────────────┐
│  ← 신청 내용 확인            │
├─────────────────────────────┤
│  ✓──●──○──○                 │  ← ProgressBar (step 2/4)
│     검수                     │
│                             │
│  배출 정보                   │
│  지역: 서울특별시 강남구       │
│  주소: 역삼동 123-45 앞      │
│  희망일: 2026-02-15          │
│                             │
│  배출 품목                   │
│  ┌─────────────────────────┐│
│  │ 1. 책상 (중형) x1 8,000 ││
│  │ 2. 의자 (소형) x2 6,000 ││
│  ├─────────────────────────┤│
│  │ 합계:        14,000원    ││
│  └─────────────────────────┘│
│                             │
│  [← 수정하기] [결제하기 →]   │
├─────────────────────────────┤
│  🏠 홈              👤 MY  │
└─────────────────────────────┘
```

#### 5.2.5 결제 완료 / 배출번호 (`/online/complete`)

```
┌─────────────────────────────┐
│  배출 신청 완료               │
├─────────────────────────────┤
│  ✓──✓──✓──●                 │  ← ProgressBar (step 4/4)
│           완료               │
│                             │
│  ┌─────────────────────────┐│
│  │   배출 번호              ││
│  │   ┌─────────────────┐   ││
│  │   │  GN-2026-0215   │   ││  ← DisposalNumber (크게 표시)
│  │   │  -00123         │   ││
│  │   └─────────────────┘   ││
│  │                         ││
│  │ 이 번호를 종이에         ││
│  │ 크게 적어서 폐기물에     ││
│  │ 붙여주세요!              ││
│  └─────────────────────────┘│
│                             │
│  배출일: 2026-02-15         │
│  배출장소: 역삼동 123-45 앞  │
│  결제금액: 14,000원          │
│                             │
│  [영수증 보기]               │
│  [홈으로 돌아가기]            │
├─────────────────────────────┤
│  🏠 홈              👤 MY  │
└─────────────────────────────┘
```

#### 5.2.6 스티커 판매소 (`/offline/sticker-shops`)

```
┌─────────────────────────────┐
│  ← 스티커 판매소             │
├─────────────────────────────┤
│  지역 선택 (구 단위)         │
│  ┌─────────────────────────┐│
│  │ 강남구 ▼                 ││  ← Select (구 필터)
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │                         ││
│  │    지도 영역              ││  ← MapPlaceholder
│  │    (추후 API 연동 시     ││
│  │     지도가 표시됩니다)    ││
│  │                         ││
│  └─────────────────────────┘│
│                             │
│  판매소 목록                 │
│  ┌─────────────────────────┐│
│  │ 📍 역삼동 CU 편의점      ││  ← LocationCard
│  │ 강남구 역삼로 123        ││
│  │ 02-1234-5678            ││
│  ├─────────────────────────┤│
│  │ 📍 삼성동 GS25           ││
│  │ 강남구 삼성로 456        ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  🏠 홈              👤 MY  │
└─────────────────────────────┘
```

#### 5.2.7 마이페이지 (`/mypage`)

```
┌─────────────────────────────┐
│  마이페이지                  │
├─────────────────────────────┤
│                             │
│  신청 내역                   │
│  ┌─────────────────────────┐│
│  │ GN-2026-0215-00123      ││  ← ApplicationCard
│  │ 책상(중형) x1, 의자 x2  ││
│  │ 상태: 결제완료            ││  ← StatusBadge (color-coded)
│  │ 신청일: 2026-02-12       ││
│  │ [상세보기] [취소하기]     ││
│  ├─────────────────────────┤│
│  │ GN-2026-0210-00098      ││
│  │ 소파(대형) x1            ││
│  │ 상태: 수거완료            ││
│  │ [상세보기] [영수증]       ││
│  └─────────────────────────┘│
│                             │
├─────────────────────────────┤
│  🏠 홈              👤 MY  │
└─────────────────────────────┘
```

### 5.3 Component List (Implemented)

| Component | Location | Responsibility |
|-----------|----------|----------------|
| **Layout** (4개) | | |
| `Header` | `components/layout/Header.tsx` | 상단 헤더 (제목, showBack 옵션, onBack 콜백) |
| `BottomNav` | `components/layout/BottomNav.tsx` | 하단 네비게이션 (홈, MY) - 2탭 구조, 활성 상태 스타일링 |
| `MobileContainer` | `components/layout/MobileContainer.tsx` | 모바일 최대 너비 래퍼 (max-width: 428px) |
| `ProgressBar` | `components/layout/ProgressBar.tsx` | 단계별 진행 표시 (steps 배열, currentStep) |
| **UI 공통** (8개) | | |
| `Button` | `components/ui/Button.tsx` | 공통 버튼 (variants: primary/secondary/danger/ghost, sizes: sm/md/lg, fullWidth) |
| `Input` | `components/ui/Input.tsx` | 텍스트 입력 (label, error 지원) |
| `Card` | `components/ui/Card.tsx` | 카드 컨테이너 (onClick 지원, shadow) |
| `Select` | `components/ui/Select.tsx` | 드롭다운 선택 (label, options, error) |
| `DatePicker` | `components/ui/DatePicker.tsx` | 날짜 선택 (label, min, error) |
| `Modal` | `components/ui/Modal.tsx` | 바텀시트 모달 (isOpen, onClose, title, 슬라이드 애니메이션) |
| `Badge` | `components/ui/Badge.tsx` | 상태 뱃지 (variants: success/warning/danger/info/default) |
| `SearchBar` | `components/ui/SearchBar.tsx` | 검색 입력 (검색 아이콘, 클리어 버튼) |
| **폐기물 관련** (5개) | | |
| `CategoryTree` | `components/waste/CategoryTree.tsx` | 트리 구조 카테고리 선택 (재귀 컴포넌트, 펼침/접힘, 들여쓰기, 선택 하이라이트) |
| `WasteSearchBar` | `components/waste/WasteSearchBar.tsx` | 폐기물 키워드 검색 (onSelect 콜백, 실시간 결과 드롭다운) |
| `SizeSelector` | `components/waste/SizeSelector.tsx` | 규격 라디오 선택 (sizes, selectedId, onSelect) |
| `FeeResultCard` | `components/waste/FeeResultCard.tsx` | 수수료 결과 표시 카드 (금액, 항목, 규격, 지역) |
| `WasteItemCard` | `components/waste/WasteItemCard.tsx` | 배출 품목 항목 카드 (이름, 규격, 수량, 수수료, 삭제) |
| **지도 관련** (2개) | | |
| `MapPlaceholder` | `components/map/MapPlaceholder.tsx` | 지도 자리 표시 (추후 API 연동, 회색 박스 + 아이콘) |
| `LocationCard` | `components/map/LocationCard.tsx` | 장소 정보 카드 (이름, 주소, 전화번호, 파란 핀 아이콘) |

### 5.4 Feature Components & Hooks (Implemented)

| Component/Hook | Location | Responsibility |
|----------------|----------|----------------|
| **배출 관련** (5개) | | |
| `DisposalForm` | `features/disposal/DisposalForm.tsx` | 배출 신청 폼 (지역 검색/선택, 주소, 날짜, 품목 추가/삭제, 모달) |
| `ReviewSummary` | `features/disposal/ReviewSummary.tsx` | 검수 요약 (지역, 주소, 날짜, 품목 목록, 수정/확인 버튼) |
| `PaymentForm` | `features/disposal/PaymentForm.tsx` | 결제 UI - 카드/계좌이체 선택 (Mock) |
| `DisposalNumber` | `features/disposal/DisposalNumber.tsx` | 배출번호 크게 표시 + 안내 문구 |
| `useDisposalForm` | `features/disposal/useDisposalForm.ts` | 배출 신청 비즈니스 로직 Hook |
| **수수료 관련** (1개) | | |
| `useFeeCheck` | `features/fee/useFeeCheck.ts` | 수수료 조회 로직 Hook (지역/항목/규격 선택, 실시간 계산) |
| **마이페이지 관련** (5개) | | |
| `ApplicationList` | `features/mypage/ApplicationList.tsx` | 신청 내역 목록 (상태별 취소/영수증 버튼, 빈 상태 메시지) |
| `ApplicationCard` | `features/mypage/ApplicationCard.tsx` | 개별 신청 카드 (번호, 품목 요약, 상태, 수수료) |
| `StatusBadge` | `features/mypage/StatusBadge.tsx` | 상태 뱃지 (7개 상태 color-coded) |
| `ReceiptView` | `features/mypage/ReceiptView.tsx` | 전자 영수증 (블루 헤더, 항목별 명세, 합계) |
| `useMyApplications` | `features/mypage/useMyApplications.ts` | 신청 내역 관리 Hook (조회, 새로고침, 취소, ID 조회) |
| **역경매 관련** (4개) | | |
| `RecycleItemCard` | `features/recycle/RecycleItemCard.tsx` | 역경매 물품 카드 (제목, 설명, 사진, 상태, 주소, 날짜) |
| `PhotoUploader` | `features/recycle/PhotoUploader.tsx` | 사진 업로드 (Mock, 최대 5장, 추가/삭제) |
| `RecycleRegisterForm` | `features/recycle/RecycleRegisterForm.tsx` | 역경매 등록 폼 (제목, 설명, 사진, 카테고리, 지역, 주소) |
| `useRecycle` | `features/recycle/useRecycle.ts` | 역경매 관리 Hook (목록, 등록, 새로고침) |

---

## 6. State Management (Implemented)

### 6.1 Zustand Stores

| Store | Location | State | Actions |
|-------|----------|-------|---------|
| `useDisposalStore` | `stores/useDisposalStore.ts` | region, disposalAddress, preferredDate, items[], completedApplication | setRegion, setDisposalAddress, setPreferredDate, addItem, removeItem, setCompletedApplication, getTotalFee(), reset() |
| `useRegionStore` | `stores/useRegionStore.ts` | selectedRegion | setSelectedRegion, clearRegion |

---

## 7. Error Handling

### 7.1 Error Code Definition

| Code | Message | Cause | Handling |
|------|---------|-------|----------|
| `REGION_NOT_FOUND` | 해당 지역을 찾을 수 없습니다 | 잘못된 주소 입력 | 재입력 안내 |
| `FEE_NOT_AVAILABLE` | 수수료 정보가 없습니다 | 해당 지역/품목 미지원 | 구청 문의 안내 (r1 fallback 적용) |
| `INVALID_DATE` | 배출 가능한 날짜를 선택해주세요 | 과거 날짜 선택 | DatePicker min 제한 |
| `PAYMENT_FAILED` | 결제에 실패했습니다 | 결제 오류 | 재시도 안내 |
| `CANCEL_NOT_ALLOWED` | 취소할 수 없는 상태입니다 | 이미 수거 완료 | 상태 안내 |
| `FILE_TOO_LARGE` | 사진 크기가 너무 큽니다 | 파일 크기 초과 | 5MB 이하 안내 |

### 7.2 Error Response Format

```typescript
interface AppError {
  code: string;
  message: string;        // 사용자 친화적 메시지 (한국어)
  details?: unknown;
}
```

---

## 8. Security Considerations

- [x] Input validation: 모든 사용자 입력 검증 (XSS 방지)
- [ ] Authentication: 추후 본인 인증 연동 시 구현
- [ ] HTTPS enforcement: 배포 시 적용
- [x] 파일 업로드 제한: 5MB, 이미지 파일만 허용 (PhotoUploader에서 Mock 구현)
- [x] 결제 정보 클라이언트 미저장 (프로토타입이므로 Mock)

---

## 9. Test Plan

### 9.1 Test Scope

| Type | Target | Tool |
|------|--------|------|
| 수동 테스트 | 주요 User Flow | 브라우저 (모바일 뷰) |
| Lint | 코드 품질 | ESLint 9 |
| Build | 빌드 성공 여부 | `vite build` |

### 9.2 Test Cases (Key)

- [ ] 수수료 조회: 지역 선택 → 카테고리 선택 → 규격 선택 → 수수료 정상 표시
- [ ] 온라인 배출: 폼 입력 → 검수 확인 → 결제 → 배출번호 발급
- [ ] 마이페이지: 신청 내역 표시, 취소 동작
- [ ] 카테고리 트리: 펼치기/접기, 검색 동작
- [ ] 지도 자리: MapPlaceholder가 정상 렌더링
- [ ] 모바일 반응형: 375px~428px 뷰포트에서 레이아웃 정상

---

## 10. Clean Architecture

### 10.1 Layer Structure

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | UI 컴포넌트, 페이지, 레이아웃 | `src/pages/`, `src/components/` |
| **Application** | Feature hooks + domain components, 비즈니스 로직 | `src/features/*/`, `src/stores/` |
| **Domain** | 타입 정의, 비즈니스 규칙 | `src/types/` |
| **Infrastructure** | 서비스 레이어, Mock 데이터 | `src/services/`, `src/lib/mock-data/` |

### 10.2 This Feature's Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| Pages (15개, React Router) | Presentation | `src/pages/*.tsx` |
| Layout Components (4개) | Presentation | `src/components/layout/` |
| UI Components (8개) | Presentation | `src/components/ui/` |
| Waste Components (5개) | Presentation | `src/components/waste/` |
| Map Components (2개) | Presentation | `src/components/map/` |
| Feature Hooks (4개) | Application | `src/features/*/use*.ts` |
| Feature Components (11개) | Application | `src/features/*/` |
| Zustand Stores (2개) | Application | `src/stores/` |
| Services (6개) | Infrastructure | `src/services/` |
| Mock Data (8개 JSON) | Infrastructure | `src/lib/mock-data/` |
| Types (6개) | Domain | `src/types/` |

---

## 11. Coding Convention Reference

### 11.1 This Feature's Conventions

| Item | Convention Applied |
|------|-------------------|
| Component naming | PascalCase (예: `CategoryTree.tsx`, `DisposalForm.tsx`) |
| Hook naming | camelCase with `use` prefix (예: `useFeeCheck.ts`, `useDisposalForm.ts`) |
| Service naming | camelCase (예: `regionService.ts`, `feeService.ts`) |
| File organization | Feature-based (`features/fee/`, `features/disposal/`) |
| State management | Zustand store per domain (Region, Disposal) |
| Error handling | AppError 타입 통일, 한국어 사용자 메시지 |
| API 통신 | `src/services/` 레이어를 통해서만 데이터 접근 |
| Mock 데이터 | `src/lib/mock-data/`에 JSON 형태로 관리 |

---

## 12. Implementation Guide

### 12.1 File Structure (Implemented)

```
src/
├── main.tsx                          # 엔트리 포인트
├── App.tsx                           # App 컴포넌트 (Router + Layout)
├── App.css                           # 루트 스타일
├── index.css                         # 글로벌 스타일
├── router/
│   └── index.tsx                     # React Router 라우트 정의 (15개 라우트)
├── pages/
│   ├── HomePage.tsx                  # 홈 (5개 기능 카드)
│   ├── FeeCheckPage.tsx              # 수수료 조회 (3단계)
│   ├── offline/
│   │   ├── OfflinePage.tsx           # 오프라인 안내 (절차 + 3개 메뉴)
│   │   ├── StickerShopsPage.tsx      # 스티커 판매소 (구 선택 + 지도 + 목록)
│   │   ├── CentersPage.tsx           # 동사무소/주민센터 (구 선택 + 지도 + 목록)
│   │   └── TransportPage.tsx         # 운반 대행 (업체 카드 + 전화)
│   ├── online/
│   │   ├── OnlinePage.tsx            # 온라인 안내 (4단계 프로세스)
│   │   ├── ApplyPage.tsx             # 배출 신청 폼 (ProgressBar 1/4)
│   │   ├── ReviewPage.tsx            # 검수 (ProgressBar 2/4)
│   │   ├── PaymentPage.tsx           # 결제 (ProgressBar 3/4)
│   │   └── CompletePage.tsx          # 완료/배출번호 (ProgressBar 4/4)
│   ├── recycle/
│   │   ├── RecyclePage.tsx           # 역경매 목록
│   │   └── RegisterPage.tsx          # 역경매 등록
│   └── mypage/
│       ├── MyPage.tsx                # 마이페이지 (신청 내역)
│       └── ReceiptPage.tsx           # 영수증 상세
├── components/
│   ├── ui/
│   │   ├── Button.tsx                # primary/secondary/danger/ghost, sm/md/lg
│   │   ├── Input.tsx                 # label + error 지원
│   │   ├── Card.tsx                  # onClick, shadow
│   │   ├── Select.tsx                # label, options, error
│   │   ├── DatePicker.tsx            # label, min, error
│   │   ├── Modal.tsx                 # 바텀시트, 슬라이드 애니메이션
│   │   ├── Badge.tsx                 # success/warning/danger/info/default
│   │   └── SearchBar.tsx             # 검색 아이콘 + 클리어
│   ├── waste/
│   │   ├── CategoryTree.tsx          # 재귀 트리, 펼침/접힘
│   │   ├── WasteSearchBar.tsx        # 실시간 검색 드롭다운
│   │   ├── SizeSelector.tsx          # 라디오 규격 선택
│   │   ├── FeeResultCard.tsx         # 수수료 결과 표시
│   │   └── WasteItemCard.tsx         # 품목 카드 (삭제 가능)
│   ├── map/
│   │   ├── MapPlaceholder.tsx        # 지도 자리 (추후 API 연동)
│   │   └── LocationCard.tsx          # 장소 정보 (핀 아이콘)
│   └── layout/
│       ├── Header.tsx                # title, showBack, onBack
│       ├── BottomNav.tsx             # 2탭 (홈, MY), 활성 스타일
│       ├── MobileContainer.tsx       # max-width: 428px 래퍼
│       └── ProgressBar.tsx           # steps[], currentStep
├── features/
│   ├── fee/
│   │   └── useFeeCheck.ts           # 수수료 조회 Hook
│   ├── disposal/
│   │   ├── useDisposalForm.ts        # 배출 신청 폼 Hook
│   │   ├── DisposalForm.tsx          # 배출 신청 폼 (지역, 주소, 날짜, 품목, 모달)
│   │   ├── ReviewSummary.tsx         # 검수 요약
│   │   ├── PaymentForm.tsx           # 결제 UI (카드/계좌이체)
│   │   └── DisposalNumber.tsx        # 배출번호 표시
│   ├── recycle/
│   │   ├── useRecycle.ts             # 역경매 Hook
│   │   ├── RecycleItemCard.tsx       # 역경매 물품 카드
│   │   ├── PhotoUploader.tsx         # 사진 업로드 (Mock, 최대 5장)
│   │   └── RecycleRegisterForm.tsx   # 역경매 등록 폼
│   └── mypage/
│       ├── useMyApplications.ts      # 신청 내역 Hook
│       ├── ApplicationList.tsx       # 신청 내역 목록
│       ├── ApplicationCard.tsx       # 개별 신청 카드
│       ├── StatusBadge.tsx           # 7개 상태 뱃지
│       └── ReceiptView.tsx           # 전자 영수증
├── services/
│   ├── regionService.ts              # getRegions, searchRegion, getRegionById, getRegionLabel
│   ├── wasteService.ts               # getCategories, getItemsByCategory, searchWasteItems, getItemById
│   ├── feeService.ts                 # calculateFee (r1 fallback), calculateTotalFee
│   ├── disposalService.ts            # CRUD + processPayment
│   ├── offlineService.ts             # getStickerShops, getCommunityCenters, getTransportCompanies
│   └── recycleService.ts             # registerItem, getItems, updateStatus
├── types/
│   ├── region.ts                     # Region
│   ├── waste.ts                      # WasteCategory, WasteItem, WasteSize
│   ├── fee.ts                        # FeeInfo
│   ├── disposal.ts                   # DisposalApplication, DisposalItem, DisposalStatus, PaymentMethod
│   ├── offline.ts                    # TransportCompany, StickerShop, CommunityCenter
│   └── recycle.ts                    # RecycleItem, RecycleStatus
├── stores/
│   ├── useRegionStore.ts             # selectedRegion, setSelectedRegion, clearRegion
│   └── useDisposalStore.ts           # region, address, date, items, completedApplication, getTotalFee, reset
└── lib/
    └── mock-data/
        ├── regions.json              # 서울 행정구역 데이터
        ├── waste-categories.json     # 중첩 카테고리 트리
        ├── waste-items.json          # 폐기물 항목 + 규격
        ├── fees.json                 # 지역별 수수료 테이블
        ├── sticker-shops.json        # 스티커 판매소
        ├── community-centers.json    # 동사무소/주민센터
        ├── transport-companies.json  # 운반 대행 업체
        └── sample-applications.json  # 샘플 배출 신청 내역
```

### 12.2 Implementation Order (Completed)

| 순서 | 작업 | 의존성 | 산출물 | Status |
|------|------|--------|--------|--------|
| 1 | 프로젝트 초기 설정 | 없음 | React 19 + Vite 7 + TypeScript 5.9 + Tailwind 4 | Done |
| 2 | 타입 정의 | 없음 | `src/types/*.ts` (6개) | Done |
| 3 | Mock 데이터 작성 | 타입 정의 | `src/lib/mock-data/*.json` (8개) | Done |
| 4 | 공통 UI 컴포넌트 | 없음 | `src/components/ui/*` (8개) | Done |
| 5 | 레이아웃 컴포넌트 | UI 컴포넌트 | `src/components/layout/*` (4개) | Done |
| 6 | 서비스 레이어 | 타입, Mock 데이터 | `src/services/*` (6개) | Done |
| 7 | Zustand 스토어 | 타입 | `src/stores/*` (2개) | Done |
| 8 | 라우터 + 홈 화면 | 레이아웃 | `src/router/`, `src/pages/HomePage.tsx` | Done |
| 9 | 수수료 조회 (Phase 1) | 서비스, 카테고리트리 | `FeeCheckPage`, `components/waste/*`, `features/fee/` | Done |
| 10 | 온라인 배출 신청 (Phase 2) | 서비스, 폼 | `pages/online/*`, `features/disposal/*` | Done |
| 11 | 오프라인 안내 + 운반 대행 (Phase 3) | 서비스, 지도placeholder | `pages/offline/*`, `components/map/*` | Done |
| 12 | 마이페이지 (Phase 4) | 서비스, 스토어 | `pages/mypage/*`, `features/mypage/*` | Done |
| 13 | 역경매 (Phase 5) | 서비스 | `pages/recycle/*`, `features/recycle/*` | Done |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-12 | Initial draft based on Plan document | User |
| 0.2 | 2026-02-12 | Frontend 기술스택 Next.js → React + Vite 변경 | User |
| 0.3 | 2026-02-15 | 실제 구현 코드 기준으로 전체 문서 업데이트 (기술스택 버전, 컴포넌트/서비스/스토어 목록, BottomNav 2탭, 구현 완료 상태) | Auto |
