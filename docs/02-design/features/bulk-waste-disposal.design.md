# 대형폐기물 배출 도우미 서비스 Design Document

> **Summary**: 대형폐기물 수수료 조회, 오프라인/온라인 배출, 운반 대행, 역경매를 제공하는 모바일 우선 웹 서비스 (실제 서비스 수준)
>
> **Project**: throw_it
> **Version**: 0.6.0
> **Author**: User
> **Date**: 2026-02-12
> **Last Updated**: 2026-02-19
> **Status**: Design Updated (sido/sigungu 통일, 프론트엔드 서비스 API 재정렬)
> **Planning Doc**: [bulk-waste-disposal.plan.md](../../01-plan/features/bulk-waste-disposal.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 모바일 UI 기준으로 모든 화면 설계 (428px max-width, 반응형 대응)
- **대한민국 전국 모든 자치구**를 대상으로 지역별 수수료 데이터 제공
- **지도 API 플러그인 구조**: `MapAdapter` 인터페이스로 추상화하여 키 입력만으로 즉시 연동
- **Spring Boot + MySQL 백엔드** 연동을 위한 서비스 레이어 분리
- **지역-DB 매핑**: 주소 입력 → 자치구 코드 → DB 수수료 테이블 자동 매핑
- 결제는 "결제 가능하다"는 가정 하에 UI만 구현 (PG 실연동 제외)
- 디자인은 현재 프로토타입에서 크게 벗어나지 않도록 유지

### 1.2 Design Principles

- **모바일 우선**: 모든 컴포넌트를 모바일 뷰포트 기준으로 설계 (max-width: 428px)
- **Feature-based 모듈화**: 기능별 독립 모듈로 유지보수 용이
- **Data Layer 분리**: Mock 데이터와 실제 Spring API를 교체할 수 있는 서비스 레이어
- **Custom Hook 패턴**: 비즈니스 로직을 Hook으로 캡슐화하여 UI와 분리
- **MapAdapter 추상화**: 지도 공급자를 인터페이스로 분리하여 키 주입만으로 교체 가능
- **점진적 확장**: 프로토타입 → DB 연동 → Spring API → 지도/결제/인증 연동

---

## 2. Architecture

### 2.1 전체 시스템 구성

```
┌───────────────────────────────────────────────────────────────┐
│                   Client (React 19 + Vite 7)                  │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────┐  │
│  │ Pages   │ │Components│ │ Features │ │    Stores       │  │
│  │(React   │─│(UI/Waste/│─│(fee/     │─│(Zustand 5)     │  │
│  │ Router7)│ │Layout/   │ │disposal/ │ │                 │  │
│  │         │ │MapAdapter│ │recycle/  │ │ useRegionStore  │  │
│  │         │ │)         │ │mypage)   │ │ useDisposalStore│  │
│  └─────────┘ └──────────┘ └──────────┘ └─────────────────┘  │
│       │                         │                            │
│  ┌────▼─────────────────────────▼──────────────────────────┐ │
│  │                  Services Layer                          │ │
│  │  (현재: Mock Data / 추후: Spring Boot API Client 교체)   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              lib/map/ (MapAdapter Layer)                  │ │
│  │  MapAdapter (Interface)                                  │ │
│  │  ├── MockMapAdapter      ← 기본값 (키 없을 때)           │ │
│  │  └── KakaoMapAdapter     ← VITE_MAP_API_KEY 주입 시      │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
           │ REST API (추후 연동)
┌──────────▼──────────────────────────────────────────────────┐
│              Backend (Java + Spring Boot 3.x)               │
│  Controller → Service → Repository → MySQL 8.x              │
│                                                             │
│  도메인: region / waste / fee / disposal / recycle          │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

#### 현재 (Mock)
```
사용자 입력 → Page → Feature Hook → Service Layer → Mock JSON
                                          ↓
                                     Zustand Store → UI 업데이트
```

#### 목표 (Spring API 연동 후)
```
사용자 주소 입력
  → regionService.detectRegion(address)
  → RegionCode 반환 (법정동 코드 기준)
  → Spring API: GET /api/fees?regionCode=11010&wasteId=1&sizeId=M
  → MySQL: fees 테이블 → region_code 매핑 → 수수료 반환
  → UI 표시
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| Pages | Components, Features, Stores | 화면 렌더링 |
| Features | Services, Types, Stores | 비즈니스 로직 |
| Services | Types, Mock Data / Spring API | 데이터 접근 |
| Components | Types, lib/map (MapAdapter) | UI 표현 |
| Stores | Types | 전역 상태 관리 |
| lib/map | - | 지도 공급자 추상화 |

### 2.4 Tech Stack

#### Frontend (현행)
| Category | Package | Version |
|----------|---------|---------|
| UI Framework | React | ^19.2.0 |
| Build Tool | Vite | ^7.3.1 |
| Language | TypeScript | ~5.9.3 |
| Routing | react-router-dom | ^7.13.0 |
| State Management | Zustand | ^5.0.11 |
| Server State | @tanstack/react-query | ^5.90.21 |
| Form | react-hook-form | ^7.71.1 |
| Styling | Tailwind CSS | ^4.1.18 |
| Linting | ESLint | ^9.39.1 |

#### Backend (목표)
| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Spring Boot | 3.x |
| Language | Java | 17+ |
| Database | MySQL | 8.x |
| ORM | Spring Data JPA | - |
| Build | Gradle / Maven | - |

---

## 3. Data Model

### 3.1 Entity Definition

#### Frontend Types (TypeScript)

```typescript
// types/region.ts
// 실제 DB(large_waste_fee)의 시도명/시군구명 컬럼 구조에 맞춤
interface Region {
  sido: string;       // 시/도 (예: "서울특별시") — DB 컬럼: 시도명
  sigungu: string;    // 구/군 (예: "강남구")      — DB 컬럼: 시군구명
}
```

> **전국 자치구 범위**:
> - 특별시 (서울): 25개 자치구
> - 광역시 (6개): 부산·대구·인천·광주·대전·울산 소속 구/군
> - 특별자치시 (세종): 1개
> - 특별자치도 (제주): 제주시·서귀포시
> - 도 (8개): 경기·강원·충청·전라·경상 소속 시/군/구
> - **실제 DB 기준: 17개 시도, 131개 시군구** (large_waste_fee 데이터 기준)

```typescript
// types/waste.ts
interface WasteCategory {
  id: string;
  name: string;
  parentId: string | null;
  children?: WasteCategory[];
}

interface WasteItem {
  id: string;
  categoryId: string;
  name: string;
  sizes: WasteSize[];
}

interface WasteSize {
  id: string;
  label: string;         // 예: "소형 (1m 이하)"
  description: string;
}

// types/fee.ts
// large_waste_fee 테이블 기반 — 규격(wasteStandard)이 있는 경우와 없는 경우 모두 포함
interface FeeInfo {
  sido: string;                  // 시도명 (DB: 시도명)
  sigungu: string;               // 시군구명 (DB: 시군구명)
  wasteName: string;             // 대형폐기물명
  wasteCategory: string;         // 대형폐기물구분명 (가구류 | 가전제품류 | 기타 | 생활용품류)
  wasteStandard: string | null;  // 대형폐기물규격 (예: "1m 이하", null 가능)
  feeType: string;               // 유무료여부 ("유료" | "무료")
  fee: number;                   // 수수료 (원)
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
  photoUrl?: string;
}

interface DisposalApplication {
  id: string;
  applicationNumber: string;
  userId: string;
  regionCode: string;    // 자치구 코드로 변경
  regionLabel: string;   // 표시용 문자열 (예: "서울특별시 강남구")
  items: DisposalItem[];
  disposalAddress: string;
  preferredDate: string;
  totalFee: number;
  status: DisposalStatus;
  paymentMethod: PaymentMethod | null;
  createdAt: string;
  updatedAt: string;
}

// types/offline.ts
interface TransportCompany {
  id: string;
  name: string;
  phone: string;
  regionCode: string;    // 자치구 코드
  description?: string;
}

interface StickerShop {
  id: string;
  name: string;
  address: string;
  phone?: string;
  regionCode: string;
  lat?: number;
  lng?: number;
}

interface CommunityCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  regionCode: string;
  lat?: number;
  lng?: number;
}

// types/recycle.ts
type RecycleStatus = 'available' | 'reserved' | 'collected';

interface RecycleItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  photos: string[];
  categoryId: string;
  regionCode: string;
  address: string;
  lat?: number;
  lng?: number;
  status: RecycleStatus;
  createdAt: string;
}
```

### 3.2 Entity Relationships

```
[Region] (regionCode)
   │
   ├── 1 ──── N [FeeInfo]          (region_code 기준 매핑)
   ├── 1 ──── N [StickerShop]
   ├── 1 ──── N [CommunityCenter]
   └── 1 ──── N [TransportCompany]

[WasteCategory] 1 ──── N [WasteCategory]  (self-referencing tree)
   └── 1 ──── N [WasteItem]
                    └── 1 ──── N [WasteSize]

[WasteItem] + [WasteSize] + [Region] → [FeeInfo]

[DisposalApplication] 1 ──── N [DisposalItem]

[RecycleItem] (독립)
```

---

## 4. MapAdapter 설계 (신규)

### 4.1 인터페이스 정의

```typescript
// lib/map/MapAdapter.ts

export interface MapMarker {
  lat: number;
  lng: number;
  title?: string;
}

export interface MapAdapter {
  /** 지도를 특정 DOM 요소에 렌더링 */
  render(container: HTMLElement, center: { lat: number; lng: number }, zoom?: number): void;
  /** 마커 추가 */
  addMarkers(markers: MapMarker[]): void;
  /** 지도 파괴 (cleanup) */
  destroy(): void;
}
```

### 4.2 구현체

```typescript
// lib/map/MockMapAdapter.ts
// 지도 API 키 없을 때 기본값 - 현재 MapPlaceholder 컴포넌트와 동일 역할

export class MockMapAdapter implements MapAdapter {
  render(container: HTMLElement): void {
    container.innerHTML = `
      <div class="flex items-center justify-center h-full bg-gray-100 text-gray-500">
        <span>지도 API 연동 준비 중</span>
      </div>`;
  }
  addMarkers(): void { /* no-op */ }
  destroy(): void { /* no-op */ }
}

// lib/map/KakaoMapAdapter.ts
// VITE_MAP_API_KEY 환경변수 존재 시 활성화

export class KakaoMapAdapter implements MapAdapter {
  private map: kakao.maps.Map | null = null;

  render(container: HTMLElement, center: { lat: number; lng: number }, zoom = 4): void {
    const options = { center: new kakao.maps.LatLng(center.lat, center.lng), level: zoom };
    this.map = new kakao.maps.Map(container, options);
  }
  addMarkers(markers: MapMarker[]): void {
    markers.forEach(m => {
      new kakao.maps.Marker({
        map: this.map!,
        position: new kakao.maps.LatLng(m.lat, m.lng),
        title: m.title,
      });
    });
  }
  destroy(): void { this.map = null; }
}
```

### 4.3 팩토리 & React 훅

```typescript
// lib/map/createMapAdapter.ts
export function createMapAdapter(): MapAdapter {
  if (import.meta.env.VITE_MAP_API_KEY) {
    return new KakaoMapAdapter();
  }
  return new MockMapAdapter();
}

// lib/map/useMap.ts  (React 훅)
export function useMap(markers: MapMarker[]) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const adapter = createMapAdapter();
    adapter.render(containerRef.current, DEFAULT_CENTER);
    adapter.addMarkers(markers);
    return () => adapter.destroy();
  }, [markers]);

  return containerRef;
}
```

### 4.4 MapPlaceholder → MapView 교체 계획

| 상태 | 컴포넌트 | 동작 |
|------|---------|------|
| 현재 (키 없음) | `MapPlaceholder.tsx` | 회색 박스 표시 |
| 전환 목표 | `MapView.tsx` + `useMap` 훅 | MockAdapter → 회색 박스 / KakaoAdapter → 실제 지도 |

> **전환 시 작업**: `MapPlaceholder` → `MapView`로 교체하고, `VITE_MAP_API_KEY` 설정 시 카카오 지도 즉시 활성화

---

## 5. 지역-DB 매핑 설계 (신규)

### 5.1 매핑 흐름

```
[사용자] 시도/시군구 선택 (드롭다운 — Spring API에서 목록 로드)
    │   예: 시도 = "서울특별시", 시군구 = "강남구"
    ▼
[regionService.getSido()]            → GET /api/regions/sido
[regionService.getSigungu(sido)]     → GET /api/regions/sigungu?sido=서울특별시
    │
    ▼
[feeService.getFees(sido, sigungu, wasteName)]
    │  GET /api/fees?sido=서울특별시&sigungu=강남구&wasteName=책상
    │  MySQL: large_waste_fee WHERE 시도명=? AND 시군구명=? AND 대형폐기물명=?
    ▼
[FeeInfo[]] → wasteStandard별 목록 표시 → 사용자가 규격 선택 → 수수료 확정
```

> **설계 원칙**: `regionCode`(법정동 코드) 없이 **시도명 + 시군구명** 텍스트 조합만으로 지역 식별.
> 실제 DB(`large_waste_fee`)가 이 구조를 사용하므로 별도 변환 없이 직접 매핑.

### 5.2 지역 드롭다운 흐름 (2단계)

| 단계 | 동작 | API |
|------|------|-----|
| 1 | 시도 목록 로드 | `GET /api/regions/sido` → `["서울특별시", "경기도", ...]` |
| 2 | 시군구 목록 로드 (시도 선택 후) | `GET /api/regions/sigungu?sido=서울특별시` → `["강남구", "강동구", ...]` |

### 5.3 Mock → Spring API 교체 전략

```typescript
// services/regionService.ts

// 현재 (Mock)
export async function getSido(): Promise<string[]> {
  const regions = await import('../lib/mock-data/regions.json');
  return [...new Set(regions.default.map((r: any) => r.sido))].sort();
}

// 추후 (Spring API)
export async function getSido(): Promise<string[]> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/regions/sido`);
  return res.ok ? res.json() : [];
}

// services/feeService.ts

// 현재 (Mock)
export async function getFees(sido: string, sigungu: string, wasteName: string): Promise<FeeInfo[]> {
  const fees = await import('../lib/mock-data/fees.json');
  return fees.default.filter(
    (f: any) => f.sido === sido && f.sigungu === sigungu && f.wasteName === wasteName
  );
}

// 추후 (Spring API)
export async function getFees(sido: string, sigungu: string, wasteName: string): Promise<FeeInfo[]> {
  const params = new URLSearchParams({ sido, sigungu, wasteName });
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fees?${params}`);
  return res.ok ? res.json() : [];
}
```

---

## 6. API Specification

### 6.1 프론트엔드 서비스 인터페이스

| Service | Method | Description | Returns |
|---------|--------|-------------|---------|
| **RegionService** | | | |
| | `getSido()` | 시도 목록 | `string[]` |
| | `getSigungu(sido)` | 시도 기준 시군구 목록 | `string[]` |
| **WasteService** | | | |
| | `getCategories(sigungu)` | 카테고리 목록 (해당 지역 기준) | `string[]` |
| | `searchWasteItems(sigungu, category?, keyword?)` | 폐기물 항목 검색 | `WasteItemResult[]` |
| **FeeService** | | | |
| | `getFees(sido, sigungu, wasteName)` | 수수료 목록 (규격별) | `FeeInfo[]` |
| | `calculateTotalFee(items)` | 복수 항목 총 수수료 계산 | `number` |
| **DisposalService** | | | |
| | `createApplication(data)` | 배출 신청 생성 | `DisposalApplication` |
| | `getApplication(id)` | 신청 상세 | `DisposalApplication \| undefined` |
| | `getMyApplications(userId)` | 내 신청 목록 | `DisposalApplication[]` |
| | `cancelApplication(id)` | 신청 취소 | `DisposalApplication` |
| | `processPayment(id, method)` | 결제 처리 (UI용) | `DisposalApplication` |
| **OfflineService** | | | |
| | `getStickerShops(sigungu?)` | 스티커 판매소 목록 | `StickerShop[]` |
| | `getCommunityCenters(sigungu?)` | 주민센터 목록 | `CommunityCenter[]` |
| | `getTransportCompanies(sigungu?)` | 운반 업체 목록 | `TransportCompany[]` |
| **RecycleService** | | | |
| | `registerItem(data)` | 역경매 물품 등록 | `RecycleItem` |
| | `getItems(sigungu?)` | 물품 목록 | `RecycleItem[]` |
| | `updateStatus(id, status)` | 상태 변경 | `RecycleItem` |

> **변경 사항**: `regionCode` 기반 → `sido/sigungu` 텍스트 기반으로 통일 (실제 DB 구조 반영)

### 6.2 Spring Boot REST API (실제 DB 기준)

> `large_waste_fee` 단일 테이블 기반. `regionCode` 대신 **시도명 + 시군구명** 조합으로 지역 식별.

| Endpoint | Method | Description | Params | Response |
|----------|--------|-------------|--------|----------|
| `/api/regions/sido` | GET | 시도 목록 | - | `string[]` |
| `/api/regions/sigungu` | GET | 시군구 목록 | `?sido=서울특별시` | `string[]` |
| `/api/waste/categories` | GET | 폐기물 카테고리 목록 | - | `string[]` |
| `/api/waste/items` | GET | 폐기물 항목 검색 | `?sigungu=강남구&category=가구류&keyword=책상` | `WasteItemDto[]` |
| `/api/fees` | GET | 수수료 조회 | `?sido=서울특별시&sigungu=강남구&wasteName=책상` | `FeeInfoDto[]` |
| `/api/disposals` | POST | 배출 신청 생성 | `DisposalRequest` | `DisposalResponse` |
| `/api/disposals/my` | GET | 내 신청 목록 | `?userId=...` | `DisposalResponse[]` |
| `/api/disposals/{id}` | GET | 신청 상세 | - | `DisposalResponse` |
| `/api/disposals/{id}/cancel` | PATCH | 신청 취소 | - | `DisposalResponse` |
| `/api/disposals/{id}/payment` | POST | 결제 처리 (UI용) | `{ method }` | `DisposalResponse` |
| `/api/recycle/items` | GET | 역경매 목록 | `?sigungu=강남구` | `RecycleItemDto[]` |
| `/api/recycle/items` | POST | 역경매 등록 | `RecycleItemRequest` | `RecycleItemDto` |
| `/api/recycle/items/{id}/status` | PATCH | 상태 변경 | `{ status }` | `RecycleItemDto` |

---

## 7. Database Schema (MySQL)

> **실제 DB 확인 완료** (2026-02-18): `waste_db` 데이터베이스
> - 공공데이터 기반 **단일 비정규화 테이블** 구조 사용
> - `large_waste_fee` 테이블: 22,819행, 전국 17개 시도 / 131개 시군구 포함
> - 설계 문서의 정규화 스키마 대신 실제 DB 구조를 기준으로 Spring Boot 개발

### 7.1 기존 테이블 (공공데이터)

```sql
-- 실제 존재하는 테이블 (수정 없이 사용)
-- waste_db.large_waste_fee

CREATE TABLE large_waste_fee (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  시도명          VARCHAR(50),   -- 예: 서울특별시, 경기도 (17개 시도)
  시군구명        VARCHAR(50),   -- 예: 강남구, 수원시 (131개 시군구)
  대형폐기물명    VARCHAR(100),  -- 예: 책상, 소파
  대형폐기물구분명 VARCHAR(50),  -- 가구류 | 가전제품류 | 기타 | 생활용품류
  대형폐기물규격  VARCHAR(100),  -- 예: "1m 이하", NULL 가능
  유무료여부      VARCHAR(10),   -- 유료 | 무료
  수수료          INT,           -- 수수료 (원), 무료는 0
  관리기관명      VARCHAR(100),
  데이터기준일자  DATE,
  제공기관코드    VARCHAR(20),
  제공기관명      VARCHAR(100),

  INDEX idx_시도명 (시도명),
  INDEX idx_시군구명 (시군구명),
  INDEX idx_대형폐기물명 (대형폐기물명)
);
```

### 7.2 추가 생성 테이블 (서비스 운영용)

```sql
-- 배출 신청 (서비스 핵심 데이터)
CREATE TABLE disposal_applications (
  id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
  application_number VARCHAR(30)  NOT NULL UNIQUE,
  user_id            VARCHAR(50)  NOT NULL,
  sido               VARCHAR(50)  NOT NULL,   -- 시도명 (large_waste_fee 참조)
  sigungu            VARCHAR(50)  NOT NULL,   -- 시군구명
  disposal_address   VARCHAR(255) NOT NULL,
  preferred_date     DATE         NOT NULL,
  total_fee          INT          NOT NULL,
  status             VARCHAR(30)  NOT NULL DEFAULT 'draft',
  payment_method     VARCHAR(20),
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_disposal_user   (user_id),
  INDEX idx_disposal_status (status)
);

-- 배출 품목 (신청 1 → N 품목)
CREATE TABLE disposal_items (
  id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
  disposal_application_id BIGINT       NOT NULL,
  waste_name              VARCHAR(100) NOT NULL,  -- 대형폐기물명
  waste_category          VARCHAR(50),            -- 대형폐기물구분명
  waste_standard          VARCHAR(100),           -- 대형폐기물규격
  quantity                INT          NOT NULL DEFAULT 1,
  fee                     INT          NOT NULL,
  photo_url               VARCHAR(500),

  FOREIGN KEY (disposal_application_id) REFERENCES disposal_applications(id)
);

-- 역경매 물품
CREATE TABLE recycle_items (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     VARCHAR(50)  NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  sido        VARCHAR(50),
  sigungu     VARCHAR(50),
  address     VARCHAR(255),
  lat         DECIMAL(10,7),
  lng         DECIMAL(10,7),
  status      VARCHAR(20)  NOT NULL DEFAULT 'available',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_recycle_region (sido, sigungu, status)
);

-- 역경매 사진
CREATE TABLE recycle_item_photos (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  recycle_item_id BIGINT       NOT NULL,
  photo_url       VARCHAR(500) NOT NULL,
  sort_order      INT DEFAULT 0,

  FOREIGN KEY (recycle_item_id) REFERENCES recycle_items(id)
);
```

### 7.3 핵심 쿼리 패턴

```sql
-- 1. 지역 목록 (시도 → 시군구 드릴다운)
SELECT DISTINCT 시도명 FROM large_waste_fee ORDER BY 시도명;
SELECT DISTINCT 시군구명 FROM large_waste_fee WHERE 시도명 = '서울특별시' ORDER BY 시군구명;

-- 2. 카테고리 목록
SELECT DISTINCT 대형폐기물구분명 FROM large_waste_fee WHERE 대형폐기물구분명 IS NOT NULL;

-- 3. 폐기물 항목 검색 (카테고리 필터 + 키워드)
SELECT DISTINCT 대형폐기물명, 대형폐기물구분명
FROM large_waste_fee
WHERE 시군구명 = '강남구'
  AND 대형폐기물구분명 = '가구류'
  AND 대형폐기물명 LIKE '%책상%';

-- 4. 수수료 조회 (핵심)
SELECT 대형폐기물명, 대형폐기물규격, 수수료, 유무료여부
FROM large_waste_fee
WHERE 시도명 = '서울특별시'
  AND 시군구명 = '강남구'
  AND 대형폐기물명 = '책상';

-- 5. 전체 수수료 목록 (특정 폐기물의 모든 규격별 수수료)
SELECT 대형폐기물규격, 수수료
FROM large_waste_fee
WHERE 시군구명 = '강남구' AND 대형폐기물명 = '책상'
ORDER BY 수수료;
```

---

## 8. Backend Architecture (Spring Boot)

> **실제 DB 기준으로 재설계**: `large_waste_fee` 단일 테이블을 Entity로 매핑하고, 지역/카테고리/수수료를 모두 이 테이블에서 조회.

### 8.1 패키지 구조

```
backend/src/main/java/com/throwit/
├── domain/
│   ├── fee/                          ← large_waste_fee 테이블 (핵심)
│   │   ├── LargeWasteFee.java        (Entity - 기존 테이블 매핑)
│   │   ├── LargeWasteFeeRepository.java
│   │   ├── LargeWasteFeeService.java ← 지역/카테고리/수수료 조회 로직
│   │   └── LargeWasteFeeController.java
│   ├── disposal/
│   │   ├── DisposalApplication.java
│   │   ├── DisposalItem.java
│   │   ├── DisposalStatus.java       (Enum)
│   │   ├── DisposalRepository.java
│   │   ├── DisposalService.java      ← 배출번호 생성 포함
│   │   └── DisposalController.java
│   └── recycle/
│       ├── RecycleItem.java
│       ├── RecycleItemPhoto.java
│       ├── RecycleRepository.java
│       ├── RecycleService.java
│       └── RecycleController.java
├── infrastructure/
│   ├── config/
│   │   └── WebMvcConfig.java         ← CORS 설정
│   └── exception/
│       ├── GlobalExceptionHandler.java
│       └── AppException.java
└── ThrowItApplication.java
```

### 8.2 핵심 Entity

```java
// domain/fee/LargeWasteFee.java
@Entity
@Table(name = "large_waste_fee")
public class LargeWasteFee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "시도명")
    private String sido;

    @Column(name = "시군구명")
    private String sigungu;

    @Column(name = "대형폐기물명")
    private String wasteName;

    @Column(name = "대형폐기물구분명")
    private String wasteCategory;

    @Column(name = "대형폐기물규격")
    private String wasteStandard;

    @Column(name = "유무료여부")
    private String feeType;

    @Column(name = "수수료")
    private Integer fee;

    @Column(name = "관리기관명")
    private String managingOrganization;

    @Column(name = "데이터기준일자")
    private LocalDate dataBaseDate;
}
```

### 8.3 Repository 쿼리

```java
// domain/fee/LargeWasteFeeRepository.java
public interface LargeWasteFeeRepository extends JpaRepository<LargeWasteFee, Long> {

    // 시도 목록
    @Query("SELECT DISTINCT f.sido FROM LargeWasteFee f WHERE f.sido IS NOT NULL ORDER BY f.sido")
    List<String> findDistinctSido();

    // 시군구 목록 (시도 기준)
    @Query("SELECT DISTINCT f.sigungu FROM LargeWasteFee f WHERE f.sido = :sido AND f.sigungu IS NOT NULL ORDER BY f.sigungu")
    List<String> findDistinctSigunguBySido(@Param("sido") String sido);

    // 카테고리 목록
    @Query("SELECT DISTINCT f.wasteCategory FROM LargeWasteFee f WHERE f.wasteCategory IS NOT NULL ORDER BY f.wasteCategory")
    List<String> findDistinctCategories();

    // 폐기물 항목 검색 (지역 + 카테고리 + 키워드)
    @Query("SELECT DISTINCT f.wasteName, f.wasteCategory FROM LargeWasteFee f " +
           "WHERE f.sigungu = :sigungu " +
           "AND (:category IS NULL OR f.wasteCategory = :category) " +
           "AND (:keyword IS NULL OR f.wasteName LIKE %:keyword%) " +
           "ORDER BY f.wasteName")
    List<Object[]> findWasteItems(@Param("sigungu") String sigungu,
                                   @Param("category") String category,
                                   @Param("keyword") String keyword);

    // 수수료 조회
    List<LargeWasteFee> findBySidoAndSigunguAndWasteName(
        String sido, String sigungu, String wasteName
    );
}
```

### 8.4 API 엔드포인트 (실제 DB 기준)

| Endpoint | Method | Description | Params | Response |
|----------|--------|-------------|--------|----------|
| `/api/regions/sido` | GET | 시도 목록 | - | `String[]` |
| `/api/regions/sigungu` | GET | 시군구 목록 | `?sido=서울특별시` | `String[]` |
| `/api/waste/categories` | GET | 카테고리 목록 | - | `String[]` |
| `/api/waste/items` | GET | 폐기물 항목 검색 | `?sigungu=강남구&category=가구류&keyword=책상` | `WasteItemDto[]` |
| `/api/fees` | GET | 수수료 조회 | `?sido=서울특별시&sigungu=강남구&wasteName=책상` | `FeeInfoDto[]` |
| `/api/disposals` | POST | 배출 신청 | `DisposalRequest` | `DisposalResponse` |
| `/api/disposals/my` | GET | 내 신청 목록 | `?userId=...` | `DisposalResponse[]` |
| `/api/disposals/{id}/cancel` | PATCH | 신청 취소 | - | `DisposalResponse` |
| `/api/disposals/{id}/payment` | POST | 결제 처리 (UI) | `{ method }` | `DisposalResponse` |
| `/api/recycle/items` | GET | 역경매 목록 | `?sigungu=강남구` | `RecycleItemDto[]` |
| `/api/recycle/items` | POST | 역경매 등록 | `RecycleItemRequest` | `RecycleItemDto` |

### 8.5 배출번호 생성 규칙

```
형식: {시군구약어2자리}-{YYYYMMDD}-{5자리 일련번호}
예시: GN-20260218-00123

- GN: 강남구 약어
- 날짜: 신청일
- 일련번호: 해당 날짜 신청 순번
```

### 8.6 CORS 설정

```java
// infrastructure/config/WebMvcConfig.java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
        .allowedOrigins("http://localhost:5173")  // Vite 개발 서버
        .allowedMethods("GET", "POST", "PATCH", "DELETE");
}
```

---

## 9. UI/UX Design

### 9.1 화면 목록 (현행 유지)

| # | 화면 | Route | 설명 |
|---|------|-------|------|
| 1 | 홈 | `/` | 메인 진입점, 주요 기능 바로가기 카드 |
| 2 | 수수료 조회 | `/fee-check` | 3단계: 지역 → 폐기물(트리/검색) → 규격 → 수수료 표시 |
| 3 | 오프라인 안내 | `/offline` | 오프라인 배출 안내 + 3개 메뉴 카드 |
| 4 | 스티커 판매소 | `/offline/sticker-shops` | 구 선택 + MapView + 판매소 목록 |
| 5 | 동사무소/주민센터 | `/offline/centers` | 구 선택 + MapView + 주민센터 목록 |
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

> **디자인 원칙**: 현재 프로토타입 UI에서 크게 벗어나지 않음. `MapPlaceholder` → `MapView` 전환 시에도 레이아웃 유지.

### 9.2 화면 상세 설계

(v0.3 설계 유지 — 기존 프로토타입 화면 ASCII 설계와 동일)

#### 9.2.1 홈 화면 (`/`)

```
┌─────────────────────────────┐
│  대형폐기물 배출 도우미       │  ← Header
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │   수수료 조회하기        ││  ← CTA 카드
│  └─────────────────────────┘│
│  ┌────────────┐┌───────────┐│
│  │ 오프라인   ││ 온라인    ││
│  │ 배출 안내  ││ 배출 신청 ││
│  └────────────┘└───────────┘│
│  ┌────────────┐┌───────────┐│
│  │ 운반 대행  ││ 재활용    ││
│  │            ││ 역경매    ││
│  └────────────┘└───────────┘│
├─────────────────────────────┤
│  🏠 홈              👤 MY  │  ← BottomNav
└─────────────────────────────┘
```

#### 9.2.2 수수료 조회 (`/fee-check`)

```
┌─────────────────────────────┐
│  ← 수수료 조회               │
├─────────────────────────────┤
│  Step 1. 지역 선택           │
│  ┌─────────────────────────┐│
│  │ 주소를 입력하세요         ││  ← 자동완성 (전국 자치구)
│  └─────────────────────────┘│
│  서울특별시 강남구 역삼동      │  ← 파싱 결과
│                             │
│  Step 2. 폐기물 선택         │
│  ┌─────────────────────────┐│
│  │ 🔍 폐기물 검색...        ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ ▶ 가구                   ││  ← CategoryTree
│  │   ▶ 책상                 ││
│  │     • 일반 책상           ││
│  └─────────────────────────┘│
│                             │
│  Step 3. 규격 선택           │
│  ● 중형 (1m ~ 1.5m)        │
│                             │
│  ┌─────────────────────────┐│
│  │  수수료: 8,000원         ││  ← FeeResultCard
│  │  강남구 기준 | 책상 중형   ││
│  └─────────────────────────┘│
│  [온라인으로 바로 신청하기 →]  │
├─────────────────────────────┤
│  🏠 홈              👤 MY  │
└─────────────────────────────┘
```

#### 9.2.3 스티커 판매소 (`/offline/sticker-shops`)

```
┌─────────────────────────────┐
│  ← 스티커 판매소             │
├─────────────────────────────┤
│  지역 선택 (구 단위)         │
│  ┌─────────────────────────┐│
│  │ 강남구 ▼                 ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │   [MapView 영역]         ││  ← MapView (MockAdapter 또는 KakaoAdapter)
│  │   (키 주입 시 실제 지도)  ││
│  └─────────────────────────┘│
│  판매소 목록                 │
│  ┌─────────────────────────┐│
│  │ 📍 역삼동 CU 편의점      ││  ← LocationCard
│  │ 강남구 역삼로 123        ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  🏠 홈              👤 MY  │
└─────────────────────────────┘
```

### 9.3 Component List (현행 유지)

(v0.3 컴포넌트 목록 동일 — Layout 4개, UI 8개, Waste 5개, Map 2개)

| 변경 사항 | 내용 |
|----------|------|
| `MapPlaceholder` → `MapView` | MapAdapter 적용 시 교체 (레이아웃 변경 없음) |

### 9.4 Feature Components & Hooks (현행 유지)

(v0.3 Feature Components & Hooks 동일)

---

## 10. State Management

### 10.1 Zustand Stores (현행 유지)

| Store | State | Actions |
|-------|-------|---------|
| `useDisposalStore` | region, disposalAddress, preferredDate, items[], completedApplication | setRegion, setDisposalAddress, setPreferredDate, addItem, removeItem, setCompletedApplication, getTotalFee(), reset() |
| `useRegionStore` | selectedRegion | setSelectedRegion, clearRegion |

---

## 11. Error Handling

### 11.1 Error Code Definition

| Code | Message | Cause | Handling |
|------|---------|-------|----------|
| `REGION_NOT_FOUND` | 해당 지역을 찾을 수 없습니다 | 잘못된 주소 입력 | 재입력 안내 |
| `FEE_NOT_AVAILABLE` | 수수료 정보가 없습니다 | 해당 지역/품목 미지원 | 구청 문의 안내 |
| `INVALID_DATE` | 배출 가능한 날짜를 선택해주세요 | 과거 날짜 | DatePicker min 제한 |
| `PAYMENT_FAILED` | 결제에 실패했습니다 | 결제 오류 | 재시도 안내 |
| `CANCEL_NOT_ALLOWED` | 취소할 수 없는 상태입니다 | 수거 완료 | 상태 안내 |
| `FILE_TOO_LARGE` | 사진 크기가 너무 큽니다 | 5MB 초과 | 크기 제한 안내 |
| `API_ERROR` | 서버 오류가 발생했습니다 | Spring API 장애 | 재시도 / 오류 메시지 |

### 11.2 Error Response Format

```typescript
interface AppError {
  code: string;
  message: string;  // 사용자 친화적 한국어 메시지
  details?: unknown;
}
```

#### Spring Boot 에러 응답 형식
```json
{
  "code": "REGION_NOT_FOUND",
  "message": "해당 지역을 찾을 수 없습니다",
  "timestamp": "2026-02-18T10:00:00Z"
}
```

---

## 12. Security Considerations

- [x] Input validation: 모든 사용자 입력 검증 (XSS 방지)
- [ ] Authentication: 추후 본인 인증 연동 시 구현
- [ ] HTTPS enforcement: 배포 시 적용
- [x] 파일 업로드 제한: 5MB, 이미지 파일만 허용
- [x] 결제 정보 클라이언트 미저장 (UI만 구현)
- [ ] Spring Boot: API 인증 (JWT 또는 Session) — 추후 연동

---

## 13. Test Plan

### 13.1 Test Scope

| Type | Target | Tool |
|------|--------|------|
| 수동 테스트 | 주요 User Flow | 브라우저 (모바일 뷰) |
| Lint | 코드 품질 | ESLint 9 |
| Build | 빌드 성공 | `vite build` |
| API 연동 | Spring API 응답 | React Query + DevTools |

### 13.2 Test Cases (Key)

- [ ] 수수료 조회: 전국 자치구 선택 → 수수료 정상 표시
- [ ] 지역-DB 매핑: regionCode 기반 수수료 조회 정상 동작
- [ ] 온라인 배출: 폼 입력 → 검수 → 결제(UI) → 배출번호
- [ ] 마이페이지: 신청 내역, 취소 동작
- [ ] MapView: MockAdapter (기본) / KakaoAdapter (키 주입 후)
- [ ] 모바일 반응형: 375px~428px 뷰포트 레이아웃 정상

---

## 14. Implementation Guide

### 14.1 파일 구조

```
throw_it/
├── frontend/src/
│   ├── pages/            (15개, 현행 유지)
│   ├── components/       (현행 유지 + MapView 추가 예정)
│   ├── features/         (현행 유지)
│   ├── services/         (Mock → Spring API 교체 준비)
│   ├── types/            (regionCode 필드 추가)
│   ├── stores/           (현행 유지)
│   └── lib/
│       ├── map/          ← (신규) MapAdapter 레이어
│       │   ├── MapAdapter.ts
│       │   ├── MockMapAdapter.ts
│       │   ├── KakaoMapAdapter.ts
│       │   ├── createMapAdapter.ts
│       │   └── useMap.ts
│       └── mock-data/    (regions.json → 전국 자치구로 확장)
│
└── backend/              ← (신규) Spring Boot
    └── src/main/java/com/throwit/
        ├── domain/       (region/waste/fee/disposal/recycle)
        └── infrastructure/ (config, exception)
```

### 14.2 구현 순서 (Phase 6~8 신규)

| 순서 | 작업 | 의존성 | 산출물 | Status |
|------|------|--------|--------|--------|
| 1~13 | 프론트엔드 UI 전체 | - | (기존 완료) | Done |
| 14 | `lib/map/` 구현 | MapAdapter 설계 | MapAdapter, MockMapAdapter, KakaoMapAdapter, useMap | Todo |
| 15 | `MapPlaceholder` → `MapView` 교체 | lib/map | MapView 컴포넌트 | Todo |
| 16 | `regions.json` 전국 자치구 확장 | 법정동 코드 데이터 | 약 250개 자치구 JSON | Todo |
| 17 | Spring Boot 프로젝트 초기화 | Java 17+ | 기본 구조 + 의존성 | Todo |
| 18 | MySQL 스키마 생성 | DB 접근 정보 (요청 예정) | 테이블 DDL | Todo |
| 19 | 백엔드 Region/Waste/Fee API | 스키마 | REST API + 데이터 삽입 | Todo |
| 20 | 프론트엔드 services/ → Spring API 교체 | 백엔드 API | 실서비스 연동 | Todo |
| 21 | 백엔드 Disposal API | 스키마 | 배출 신청 CRUD | Todo |
| 22 | 백엔드 Offline/Recycle API | 스키마 | 나머지 API | Todo |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-12 | Initial draft | User |
| 0.2 | 2026-02-12 | Frontend 기술스택 변경 (Next.js → React+Vite) | User |
| 0.3 | 2026-02-15 | 실제 구현 코드 기준 전체 업데이트 | Auto |
| 0.4 | 2026-02-18 | rule.md v0.4 반영: MapAdapter 추상화, 전국 자치구, regionCode 도입, Spring Boot 패키지 구조, MySQL 스키마, 지역-DB 매핑 흐름, 배출번호 생성 규칙 추가 | Auto |
| 0.5 | 2026-02-18 | 실제 DB 확인 반영: large_waste_fee 단일 테이블 구조, 시도명+시군구명 기반 API 재설계, Spring Boot Entity/Repository 실제 컬럼 기준 업데이트, 추가 테이블(disposal_applications 등) 신규 DDL 추가 | Auto |
| 0.6 | 2026-02-19 | 내부 불일치 해소: Section 3(FeeInfo 타입), Section 5(지역-DB 매핑), Section 6.1(서비스 인터페이스) 전체를 sido/sigungu 방식으로 통일 | Auto |
