# 대형폐기물 배출 도우미 서비스 Design Document

> **Summary**: 대형폐기물 수수료 조회, 오프라인/온라인 배출, 운반 대행, 역경매를 제공하는 모바일 우선 웹 서비스 (실제 서비스 수준)
>
> **Project**: throw_it
> **Version**: 0.7.0
> **Author**: User
> **Date**: 2026-02-12
> **Last Updated**: 2026-02-20
> **Status**: Implementation Complete (Frontend + Backend + DB 연동 완료)
> **Planning Doc**: [bulk-waste-disposal.plan.md](../../01-plan/features/bulk-waste-disposal.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 모바일 UI 기준으로 모든 화면 설계 (428px max-width, 반응형 대응)
- **대한민국 전국 모든 자치구**를 대상으로 지역별 수수료 데이터 제공
- **지도 API 플러그인 구조**: `MapAdapter` 인터페이스로 추상화하여 키 입력만으로 즉시 연동
- **Spring Boot + MySQL 백엔드** 연동을 위한 서비스 레이어 분리
- **지역-DB 매핑**: 시도/시군구 선택 → DB 수수료 테이블 자동 매핑
- 결제는 "결제 가능하다"는 가정 하에 UI만 구현 (PG 실연동 제외)
- 디자인은 현재 프로토타입에서 크게 벗어나지 않도록 유지

### 1.2 Design Principles

- **모바일 우선**: 모든 컴포넌트를 모바일 뷰포트 기준으로 설계 (max-width: 428px)
- **Feature-based 모듈화**: 기능별 독립 모듈로 유지보수 용이
- **Data Layer 분리**: apiFetch 유틸리티를 통해 Spring Boot API와 통신
- **Custom Hook 패턴**: 비즈니스 로직을 Hook으로 캡슐화하여 UI와 분리
- **MapAdapter 추상화**: 지도 공급자를 인터페이스로 분리하여 키 주입만으로 교체 가능
- **Domain-based 백엔드**: Spring Boot에서 도메인별 패키지 분리 (user, fee, disposal, recycle, offline)

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
│  │         │ │Map)      │ │recycle/  │ │ useRegionStore  │  │
│  │         │ │          │ │auth/     │ │ useDisposalStore│  │
│  │         │ │          │ │mypage)   │ │                 │  │
│  └─────────┘ └──────────┘ └──────────┘ └─────────────────┘  │
│       │                         │                            │
│  ┌────▼─────────────────────────▼──────────────────────────┐ │
│  │              Services Layer (7 services)                 │ │
│  │  apiFetch() → Spring Boot REST API (http://localhost:8080)│ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              lib/map/ (MapAdapter Layer)                  │ │
│  │  MapAdapter (Interface)                                  │ │
│  │  ├── MockMapAdapter      ← 기본값 (키 없을 때)           │ │
│  │  └── KakaoMapAdapter     ← VITE_MAP_API_KEY 주입 시      │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
           │ REST API (19 endpoints)
┌──────────▼──────────────────────────────────────────────────┐
│              Backend (Java 17 + Spring Boot 3.4.5)           │
│  Controller → Service → Repository → MySQL 8.x              │
│                                                             │
│  도메인: user / fee / disposal / recycle / offline           │
│  테이블: users, large_waste_fee, waste_facility,            │
│          disposal_applications, disposal_items, recycle_items │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
사용자 시도/시군구 선택 (드롭다운)
  → regionService.getSido()         → GET /api/regions/sido
  → regionService.getSigungu(sido)  → GET /api/regions/sigungu?sido=서울특별시
  → feeService.getFees(...)         → GET /api/fees?sido=서울특별시&sigungu=강남구&wasteName=책상
                                    → MySQL: large_waste_fee WHERE 시도명=? AND 시군구명=? AND 대형폐기물명=?
  → FeeInfo[] → 규격별 수수료 UI 표시
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| Pages | Components, Features, Stores | 화면 렌더링 |
| Features | Services, Types, Stores | 비즈니스 로직 |
| Services | Types, lib/apiClient | 데이터 접근 (Spring API) |
| Components | Types, lib/map (MapAdapter) | UI 표현 |
| Stores | Types | 전역 상태 관리 |
| lib/map | - | 지도 공급자 추상화 |
| lib/apiClient | - | HTTP 통신 유틸리티 |

### 2.4 Tech Stack

#### Frontend

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

#### Backend

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Spring Boot | 3.4.5 |
| Language | Java | 17 |
| Database | MySQL | 8.x |
| ORM | Spring Data JPA | (Spring Boot 포함) |
| Validation | Spring Validation | (Spring Boot 포함) |
| Build | Gradle (Kotlin DSL) | - |
| Dependency Mgmt | io.spring.dependency-management | 1.1.7 |

---

## 3. Data Model

### 3.1 Frontend Types (TypeScript)

```typescript
// types/region.ts
interface Region {
  sido: string;       // 시/도 (예: "서울특별시")
  sigungu: string;    // 구/군 (예: "강남구")
}
```

```typescript
// types/waste.ts
interface WasteItem {
  wasteName: string;       // 대형폐기물명 (예: "책상")
  wasteCategory: string;   // 대형폐기물구분명 (예: "가구류")
}
```

```typescript
// types/fee.ts
interface FeeInfo {
  sido: string;                  // 시도명
  sigungu: string;               // 시군구명
  wasteName: string;             // 대형폐기물명
  wasteCategory: string;         // 대형폐기물구분명
  wasteStandard: string | null;  // 대형폐기물규격 (예: "1m 이하", null 가능)
  feeType: string | null;        // 유무료여부 ("유료" | "무료")
  fee: number | null;            // 수수료 (원)
}
```

```typescript
// types/disposal.ts
type DisposalStatus = 'pending_payment' | 'paid' | 'scheduled' | 'collected' | 'cancelled' | 'refunded';
type PaymentMethod = 'card' | 'transfer';

interface DisposalItem {
  id?: number;
  wasteItemName: string;
  sizeLabel: string;
  quantity: number;
  fee: number;
  photoUrl?: string;
}

interface DisposalApplication {
  id: number;
  applicationNumber: string;
  userId: string;
  sido: string;
  sigungu: string;
  items: DisposalItem[];
  disposalAddress: string;
  preferredDate: string;
  totalFee: number;
  status: DisposalStatus;
  paymentMethod: PaymentMethod | null;
  createdAt: string;
  updatedAt: string;
}

interface DisposalCreateRequest {
  sido: string;
  sigungu: string;
  disposalAddress: string;
  preferredDate: string;
  items: DisposalItem[];
}
```

```typescript
// types/offline.ts
interface StickerShop {
  id: number;
  name: string;
  address: string;
  phone?: string;
  sigungu: string;
  lat?: number;
  lng?: number;
}

interface CommunityCenter {
  id: number;
  name: string;
  address: string;
  phone: string;
  sigungu: string;
  lat?: number;
  lng?: number;
}

interface TransportCompany {
  id: number;
  name: string;
  phone: string;
  sigungu: string;
  description?: string;
}

interface WasteFacility {
  id: number;
  name: string;
  roadAddress: string;
  lat?: number;
  lng?: number;
  businessType: string;
  specialtyArea?: string;
  wasteInfo?: string;
  serviceArea?: string;
  phone?: string;
  managingOrganization?: string;
}
```

```typescript
// types/recycle.ts
type RecycleStatus = 'available' | 'reserved' | 'collected';

interface RecycleItem {
  id: number;
  userId: string;
  title: string;
  description: string;
  photos: string[];
  sido: string;
  sigungu: string;
  address: string;
  lat?: number;
  lng?: number;
  status: RecycleStatus;
  createdAt: string;
}
```

```typescript
// types/auth.ts
interface User {
  id: number;
  email: string;
  nickname: string;
  createdAt: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}
```

### 3.2 Entity Relationships

```
[Region] (sido + sigungu)
   │
   ├── 1 ──── N [LargeWasteFee]     (시도명 + 시군구명 매핑)
   └── 1 ──── N [WasteFacility]      (도로명주소 기반 매핑)

[DisposalApplication] 1 ──── N [DisposalItem]

[User] 1 ──── N [DisposalApplication]  (userId 기반)
[User] 1 ──── N [RecycleItem]          (userId 기반)

[RecycleItem] (독립, photos는 LONGTEXT JSON)
```

---

## 4. MapAdapter 설계 (구현 완료)

### 4.1 인터페이스 정의

```typescript
// lib/map/MapAdapter.ts
interface MapMarker {
  lat: number;
  lng: number;
  title: string;
}

interface PlaceResult {
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
}

interface MapAdapter {
  render(container: HTMLElement, center: { lat: number; lng: number }, zoom?: number): Promise<void>;
  addMarkers(markers: MapMarker[]): void;
  searchPlaces(keyword: string, region: string): Promise<PlaceResult[]>;
  panTo(lat: number, lng: number): void;
  destroy(): void;
}
```

### 4.2 구현체

| 파일 | 설명 | 상태 |
|------|------|:----:|
| `lib/map/MapAdapter.ts` | 인터페이스 + MapMarker, PlaceResult 타입 | Done |
| `lib/map/MockMapAdapter.ts` | API 키 없을 때 Placeholder 표시 | Done |
| `lib/map/KakaoMapAdapter.ts` | 카카오맵 SDK 동적 로딩, 마커+인포윈도우, 장소 검색, 중복 제거 | Done |
| `lib/map/createMapAdapter.ts` | 팩토리 함수 (VITE_MAP_API_KEY 유무 판별) | Done |
| `lib/map/useMap.ts` | React 훅 (containerRef + panTo 반환) | Done |

### 4.3 카카오맵 연동 상세

- SDK 동적 로딩 (`//dapi.kakao.com/v2/maps/sdk.js`)
- 서비스 라이브러리 포함 (장소 검색 `kakao.maps.services.Places`)
- 마커 클릭 시 인포윈도우 (이름, 주소, 전화번호)
- 중복 검색 결과 제거 (name + address 기준)
- 기본 중심: 서울 시청 (37.5665, 126.978)

---

## 5. 지역-DB 매핑 설계 (구현 완료)

### 5.1 매핑 흐름

```
[사용자] 시도/시군구 선택 (드롭다운)
    │   예: 시도 = "서울특별시", 시군구 = "강남구"
    ▼
[regionService.getSido()]            → GET /api/regions/sido
[regionService.getSigungu(sido)]     → GET /api/regions/sigungu?sido=서울특별시
    │
    ▼
[feeService.getFees({ sido, sigungu, wasteName })]
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

---

## 6. API Specification

### 6.1 프론트엔드 서비스 인터페이스

| Service | Method | Signature | Returns |
|---------|--------|-----------|---------|
| **authService** | | | |
| | `signup` | `(data: SignupRequest)` | `Promise<User>` |
| | `login` | `(data: LoginRequest)` | `Promise<User>` |
| | `getMe` | `(userId: number)` | `Promise<User>` |
| **regionService** | | | |
| | `getSido` | `()` | `Promise<string[]>` |
| | `getSigungu` | `(sido: string)` | `Promise<string[]>` |
| **wasteService** | | | |
| | `getCategories` | `()` | `Promise<string[]>` |
| | `getItems` | `(params: { sigungu, category?, keyword? })` | `Promise<WasteItem[]>` |
| **feeService** | | | |
| | `getFees` | `(params: { sido, sigungu, wasteName })` | `Promise<FeeInfo[]>` |
| **disposalService** | | | |
| | `createApplication` | `(data: DisposalCreateRequest, userId?)` | `Promise<DisposalApplication>` |
| | `getApplication` | `(id: number)` | `Promise<DisposalApplication>` |
| | `getMyApplications` | `(userId?)` | `Promise<DisposalApplication[]>` |
| | `cancelApplication` | `(id: number)` | `Promise<DisposalApplication>` |
| | `processPayment` | `(id: number, paymentMethod: string)` | `Promise<DisposalApplication>` |
| **offlineService** | | | |
| | `getStickerShops` | `(sigungu?)` | `Promise<StickerShop[]>` |
| | `getCenters` | `(sigungu?)` | `Promise<CommunityCenter[]>` |
| | `getTransportCompanies` | `(sigungu?)` | `Promise<TransportCompany[]>` |
| | `getWasteFacilities` | `(sido, sigungu?)` | `Promise<WasteFacility[]>` |
| **recycleService** | | | |
| | `getItems` | `(sigungu?)` | `Promise<RecycleItem[]>` |
| | `getMyItems` | `(userId: string)` | `Promise<RecycleItem[]>` |
| | `registerItem` | `(data, userId?)` | `Promise<RecycleItem>` |
| | `updateStatus` | `(id: number, status: RecycleStatus)` | `Promise<RecycleItem>` |
| | `deleteItem` | `(id: number)` | `Promise<void>` |

### 6.2 Spring Boot REST API (19 endpoints)

| Endpoint | Method | Description | Params/Body | Response |
|----------|--------|-------------|-------------|----------|
| **인증** | | | | |
| `/api/auth/signup` | POST | 회원가입 | `SignupRequest` body | `UserResponse` |
| `/api/auth/login` | POST | 로그인 | `LoginRequest` body | `UserResponse` |
| `/api/auth/me` | GET | 내 정보 | `X-User-Id` header | `UserResponse` |
| **지역/폐기물/수수료** | | | | |
| `/api/regions/sido` | GET | 시도 목록 | - | `String[]` |
| `/api/regions/sigungu` | GET | 시군구 목록 | `?sido=서울특별시` | `String[]` |
| `/api/waste/categories` | GET | 카테고리 목록 | - | `String[]` |
| `/api/waste/items` | GET | 폐기물 항목 검색 | `?sigungu=강남구&category=가구류&keyword=책상` | `WasteItemResult[]` |
| `/api/fees` | GET | 수수료 조회 | `?sido=서울특별시&sigungu=강남구&wasteName=책상` | `FeeInfoDto[]` |
| **배출 신청** | | | | |
| `/api/disposals` | POST | 배출 신청 생성 | `DisposalCreateRequest` body + `X-User-Id` header | `DisposalResponse` |
| `/api/disposals/my` | GET | 내 신청 목록 | `X-User-Id` header | `DisposalResponse[]` |
| `/api/disposals/{id}` | GET | 신청 상세 | - | `DisposalResponse` |
| `/api/disposals/{id}/cancel` | PATCH | 신청 취소 | - | `DisposalResponse` |
| `/api/disposals/{id}/payment` | POST | 결제 처리 (UI) | `PaymentRequest` body | `DisposalResponse` |
| **역경매** | | | | |
| `/api/recycle/items` | GET | 역경매 목록 | `?sigungu=강남구` (optional) | `RecycleItemResponse[]` |
| `/api/recycle/items/my` | GET | 내 물품 목록 | `X-User-Id` header | `RecycleItemResponse[]` |
| `/api/recycle/items` | POST | 역경매 등록 | `RecycleCreateRequest` body + `X-User-Id` header | `RecycleItemResponse` |
| `/api/recycle/items/{id}/status` | PATCH | 상태 변경 | `?status=reserved` | `RecycleItemResponse` |
| `/api/recycle/items/{id}` | DELETE | 물품 삭제 | - | `void` |
| **오프라인** | | | | |
| `/api/offline/sticker-shops` | GET | 스티커 판매소 | `?sigungu=강남구` | `StickerShopResponse[]` |
| `/api/offline/centers` | GET | 주민센터 | `?sigungu=강남구` | `CommunityCenterResponse[]` |
| `/api/offline/transport` | GET | 운반 업체 | `?sigungu=강남구` | `TransportCompanyResponse[]` |
| `/api/offline/waste-facilities` | GET | 폐기물 처리 시설 | `?sido=서울특별시&sigungu=강남구` | `WasteFacilityResponse[]` |

---

## 7. Database Schema (MySQL)

> **waste_db 데이터베이스** — 6개 테이블

### 7.1 공공데이터 테이블 (기존)

```sql
-- large_waste_fee: 전국 대형폐기물 수수료 (22,819행)
CREATE TABLE large_waste_fee (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  시도명          VARCHAR(255),    -- 예: 서울특별시 (17개 시도)
  시군구명        VARCHAR(255),    -- 예: 강남구 (131개 시군구)
  대형폐기물명    VARCHAR(255),    -- 예: 책상, 소파
  대형폐기물구분명 VARCHAR(255),   -- 가구류 | 가전제품류 | 기타 | 생활용품류
  대형폐기물규격  VARCHAR(255),    -- 예: "1m 이하", NULL 가능
  유무료여부      VARCHAR(255),    -- 유료 | 무료
  수수료          INT,             -- 수수료 (원)
  관리기관명      VARCHAR(255),
  데이터기준일자  DATE,
  제공기관코드    VARCHAR(20),
  제공기관명      VARCHAR(100),

  INDEX idx_시도명 (시도명),
  INDEX idx_시군구명 (시군구명),
  INDEX idx_대형폐기물명 (대형폐기물명)
);

-- waste_facility: 폐기물 처리 시설 (공공데이터)
CREATE TABLE waste_facility (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  시설명          VARCHAR(255),
  소재지도로명주소 VARCHAR(255),
  소재지지번주소  VARCHAR(255),
  위도            DECIMAL(38,2),
  경도            DECIMAL(38,2),
  업종명          VARCHAR(255),
  전문처리분야명  VARCHAR(255),
  처리폐기물정보  VARCHAR(255),
  영업구역        VARCHAR(255),
  시설장비명      VARCHAR(255),
  허가일자        DATE,
  전화번호        VARCHAR(255),
  관리기관명      VARCHAR(255),
  데이터기준일자  DATE,
  제공기관코드    VARCHAR(255),
  제공기관명      VARCHAR(255),

  INDEX idx_시설명 (시설명),
  INDEX idx_업종명 (업종명),
  INDEX idx_소재지도로명주소 (소재지도로명주소)
);
```

### 7.2 서비스 운영 테이블 (JPA ddl-auto: update)

```sql
-- users: 사용자 계정
CREATE TABLE users (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  salt        VARCHAR(255) NOT NULL,
  nickname    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP NOT NULL
);

-- disposal_applications: 배출 신청
CREATE TABLE disposal_applications (
  id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
  application_number VARCHAR(255) NOT NULL UNIQUE,
  user_id            VARCHAR(255) NOT NULL,
  sido               VARCHAR(255) NOT NULL,
  sigungu            VARCHAR(255) NOT NULL,
  disposal_address   VARCHAR(255) NOT NULL,
  preferred_date     DATE NOT NULL,
  total_fee          INT NOT NULL,
  status             VARCHAR(255) NOT NULL,   -- PENDING_PAYMENT, PAID, SCHEDULED, COLLECTED, CANCELLED, REFUNDED
  payment_method     VARCHAR(255),            -- CARD, TRANSFER
  created_at         TIMESTAMP NOT NULL,
  updated_at         TIMESTAMP NOT NULL
);

-- disposal_items: 배출 품목 (신청 1 → N 품목)
CREATE TABLE disposal_items (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  application_id  BIGINT NOT NULL,
  waste_item_name VARCHAR(255) NOT NULL,
  size_label      VARCHAR(255) NOT NULL,
  quantity        INT NOT NULL,
  fee             INT NOT NULL,
  photo_url       VARCHAR(255),

  FOREIGN KEY (application_id) REFERENCES disposal_applications(id)
);

-- recycle_items: 역경매 물품
CREATE TABLE recycle_items (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     VARCHAR(255) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  photos      LONGTEXT,             -- JSON 배열 (["url1", "url2"])
  sido        VARCHAR(255),
  sigungu     VARCHAR(255),
  address     VARCHAR(255) NOT NULL,
  lat         DOUBLE,
  lng         DOUBLE,
  status      VARCHAR(255) NOT NULL,  -- AVAILABLE, RESERVED, COLLECTED
  created_at  TIMESTAMP NOT NULL,

  INDEX idx_recycle_region (sido, sigungu, status)
);
```

### 7.3 핵심 쿼리 패턴

```sql
-- 1. 지역 목록 (시도 → 시군구 드릴다운)
SELECT DISTINCT 시도명 FROM large_waste_fee
  WHERE 시도명 IS NOT NULL AND 시도명 <> '시도명' ORDER BY 시도명;
SELECT DISTINCT 시군구명 FROM large_waste_fee
  WHERE 시도명 = '서울특별시' AND 시군구명 IS NOT NULL AND 시군구명 <> '시군구명' ORDER BY 시군구명;

-- 2. 카테고리 목록
SELECT DISTINCT 대형폐기물구분명 FROM large_waste_fee
  WHERE 대형폐기물구분명 IS NOT NULL AND 대형폐기물구분명 <> '대형폐기물구분명';

-- 3. 폐기물 항목 검색
SELECT DISTINCT 대형폐기물명, 대형폐기물구분명 FROM large_waste_fee
  WHERE 시군구명 = :sigungu
  AND (:category IS NULL OR 대형폐기물구분명 = :category)
  AND (:keyword IS NULL OR 대형폐기물명 LIKE %:keyword%);

-- 4. 수수료 조회 (핵심)
SELECT * FROM large_waste_fee
  WHERE 시도명 = :sido AND 시군구명 = :sigungu AND 대형폐기물명 = :wasteName;

-- 5. 폐기물 처리 시설 조회
SELECT * FROM waste_facility
  WHERE 소재지도로명주소 LIKE CONCAT(:sido, ' ', :sigungu, '%')
  AND 시설명 <> '시설명';
```

---

## 8. Backend Architecture (Spring Boot)

### 8.1 패키지 구조

```
backend/src/main/java/com/throwit/
├── domain/
│   ├── user/                           ← 사용자 인증
│   │   ├── User.java                   (Entity)
│   │   ├── UserRepository.java
│   │   ├── AuthService.java
│   │   ├── AuthController.java
│   │   └── dto/
│   │       ├── LoginRequest.java
│   │       ├── SignupRequest.java
│   │       └── UserResponse.java
│   ├── fee/                            ← 수수료/지역/폐기물 (핵심)
│   │   ├── LargeWasteFee.java          (Entity - 기존 테이블 매핑)
│   │   ├── LargeWasteFeeRepository.java
│   │   ├── LargeWasteFeeService.java
│   │   ├── LargeWasteFeeController.java
│   │   └── dto/
│   │       ├── FeeInfoDto.java
│   │       └── WasteItemResult.java
│   ├── disposal/                       ← 배출 신청
│   │   ├── DisposalApplication.java    (Entity)
│   │   ├── DisposalItem.java           (Entity)
│   │   ├── DisposalStatus.java         (Enum)
│   │   ├── PaymentMethod.java          (Enum)
│   │   ├── DisposalRepository.java
│   │   ├── DisposalService.java
│   │   ├── DisposalController.java
│   │   └── dto/
│   │       ├── DisposalCreateRequest.java
│   │       ├── DisposalItemRequest.java
│   │       ├── DisposalItemResponse.java
│   │       ├── DisposalResponse.java
│   │       └── PaymentRequest.java
│   ├── recycle/                        ← 역경매
│   │   ├── RecycleItem.java            (Entity)
│   │   ├── RecycleStatus.java          (Enum)
│   │   ├── RecycleRepository.java
│   │   ├── RecycleService.java
│   │   ├── RecycleController.java
│   │   └── dto/
│   │       ├── RecycleCreateRequest.java
│   │       └── RecycleItemResponse.java
│   └── offline/                        ← 오프라인 시설
│       ├── WasteFacility.java          (Entity)
│       ├── WasteFacilityRepository.java
│       ├── OfflineService.java
│       ├── OfflineController.java
│       └── dto/
│           ├── StickerShopResponse.java
│           ├── CommunityCenterResponse.java
│           ├── TransportCompanyResponse.java
│           └── WasteFacilityResponse.java
├── global/
│   ├── config/
│   │   └── CorsConfig.java            ← CORS 설정
│   └── exception/
│       ├── BusinessException.java      ← 커스텀 예외
│       ├── ErrorResponse.java
│       └── GlobalExceptionHandler.java
└── ThrowItApplication.java
```

### 8.2 핵심 Entity 매핑

```java
// LargeWasteFee.java — 한글 컬럼명 매핑
@Entity @Table(name = "large_waste_fee")
public class LargeWasteFee {
    @Column(name = "시도명")      private String sido;
    @Column(name = "시군구명")    private String sigungu;
    @Column(name = "대형폐기물명") private String wasteName;
    @Column(name = "대형폐기물구분명") private String wasteCategory;
    @Column(name = "대형폐기물규격") private String wasteStandard;
    @Column(name = "유무료여부")  private String feeType;
    @Column(name = "수수료")      private Integer fee;
    // ...
}

// User.java — 솔트 기반 비밀번호 해싱
@Entity @Table(name = "users")
public class User {
    private String email;       // UNIQUE
    private String password;    // SHA-256(raw + salt)
    private String salt;        // 랜덤 16바이트 hex
    private String nickname;
    // checkPassword(rawPassword) 메서드
}
```

### 8.3 배출번호 생성 규칙

```
형식: {시군구약어2자리}-{YYYYMMDD}-{5자리 일련번호}
예시: GN-20260218-00123

- GN: 강남구 약어 (첫 두 글자 초성)
- 날짜: 신청일
- 일련번호: 해당 날짜 신청 순번
```

### 8.4 CORS 설정

```java
// CorsConfig.java — CorsFilter Bean
allowedOrigins: "http://localhost:5173", "http://localhost:5174", "http://localhost:3000"
allowedMethods: GET, POST, PUT, PATCH, DELETE, OPTIONS
allowedHeaders: *
allowCredentials: true
path: /api/**
```

### 8.5 에러 처리

```java
// BusinessException — 정적 팩토리
BusinessException.notFound("USER_NOT_FOUND", "사용자를 찾을 수 없습니다")
BusinessException.badRequest("VALIDATION_ERROR", "입력값이 올바르지 않습니다")
BusinessException.conflict("DUPLICATE_EMAIL", "이미 사용 중인 이메일입니다")

// GlobalExceptionHandler
BusinessException       → ErrorResponse { code, message }
MethodArgumentNotValid  → 400 BAD_REQUEST
IllegalStateException   → 409 CONFLICT
```

---

## 9. UI/UX Design

### 9.1 화면 목록

| # | 화면 | Route | 설명 | 인증 필요 |
|---|------|-------|------|:---------:|
| 1 | 홈 | `/` | 메인 진입점, 주요 기능 바로가기 카드 | - |
| 2 | 수수료 조회 | `/fee-check` | 시도/시군구 → 카테고리 → 폐기물 → 규격 → 수수료 | - |
| 3 | 오프라인 안내 | `/offline` | 오프라인 배출 안내 + 3개 메뉴 카드 | - |
| 4 | 스티커 판매소 | `/offline/sticker-shops` | 시군구 선택 + 카카오맵 + 판매소 목록 | - |
| 5 | 주민센터 | `/offline/centers` | 시군구 선택 + 카카오맵 + 주민센터 목록 | - |
| 6 | 폐기물 처리 시설 | `/offline/transport` | 시도/시군구 선택 + 처리 시설 DB 조회 | - |
| 7 | 온라인 배출 안내 | `/online` | 4단계 프로세스 안내 + 시작 버튼 | Yes |
| 8 | 배출 신청 폼 | `/online/apply` | ProgressBar(1/4) + DisposalForm | Yes |
| 9 | 검수 화면 | `/online/review` | ProgressBar(2/4) + ReviewSummary | Yes |
| 10 | 결제 화면 | `/online/payment` | ProgressBar(3/4) + PaymentForm | Yes |
| 11 | 완료 화면 | `/online/complete` | ProgressBar(4/4) + DisposalNumber + 영수증 링크 | Yes |
| 12 | 역경매 목록 | `/recycle` | 물품 카드 목록 + 등록/삭제 | Yes |
| 13 | 역경매 등록 | `/recycle/register` | RecycleRegisterForm | Yes |
| 14 | 로그인 | `/login` | 이메일/비밀번호 로그인 폼 | - |
| 15 | 회원가입 | `/signup` | 이메일/비밀번호/닉네임 가입 폼 | - |
| 16 | 마이페이지 | `/mypage` | 사용자 정보 + ApplicationList | Yes |
| 17 | 영수증 조회 | `/mypage/receipt/:id` | ReceiptView | Yes |

### 9.2 Component List

#### Layout Components (4)
| Component | 파일 | 설명 |
|-----------|------|------|
| Header | `components/layout/Header.tsx` | 고정 헤더, 뒤로가기 지원 |
| BottomNav | `components/layout/BottomNav.tsx` | 하단 탭 (홈/MY) |
| MobileContainer | `components/layout/MobileContainer.tsx` | 428px 모바일 컨테이너 |
| ProgressBar | `components/layout/ProgressBar.tsx` | 온라인 배출 단계 표시 |

#### UI Components (8)
| Component | 파일 | 설명 |
|-----------|------|------|
| Button | `components/ui/Button.tsx` | primary/secondary/danger/ghost, sm/md/lg |
| Card | `components/ui/Card.tsx` | 재사용 카드, onClick 지원 |
| Input | `components/ui/Input.tsx` | 라벨 + 에러 메시지 |
| Modal | `components/ui/Modal.tsx` | 바텀시트 모달 |
| DatePicker | `components/ui/DatePicker.tsx` | 날짜 선택 (min 제한) |
| Select | `components/ui/Select.tsx` | 드롭다운 |
| Badge | `components/ui/Badge.tsx` | 상태 뱃지 (success/warning/danger/info) |
| SearchBar | `components/ui/SearchBar.tsx` | 검색 입력 + 클리어 버튼 |

#### Waste Components (5)
| Component | 파일 | 설명 |
|-----------|------|------|
| CategoryTree | `components/waste/CategoryTree.tsx` | 카테고리 필 선택기 |
| WasteItemCard | `components/waste/WasteItemCard.tsx` | 폐기물 품목 표시 카드 |
| WasteSearchBar | `components/waste/WasteSearchBar.tsx` | 폐기물 검색 드롭다운 |
| SizeSelector | `components/waste/SizeSelector.tsx` | 규격/수수료 라디오 선택 |
| FeeResultCard | `components/waste/FeeResultCard.tsx` | 수수료 결과 카드 |

#### Map Components (3)
| Component | 파일 | 설명 |
|-----------|------|------|
| MapView | `components/map/MapView.tsx` | 지도 컨테이너 (panTo 지원) |
| MapPlaceholder | `components/map/MapPlaceholder.tsx` | 지도 미사용 시 Placeholder |
| LocationCard | `components/map/LocationCard.tsx` | 위치 정보 카드 |

### 9.3 Feature Components & Hooks

#### Auth (1 file)
| 파일 | 설명 |
|------|------|
| `features/auth/AuthContext.tsx` | AuthProvider (Context), useAuth 훅, localStorage 영속화 |

#### Disposal (5 files)
| 파일 | 설명 |
|------|------|
| `features/disposal/DisposalForm.tsx` | 배출 신청 폼 (지역→주소→날짜→품목 추가) |
| `features/disposal/ReviewSummary.tsx` | 검수 화면 (수정/확인) |
| `features/disposal/PaymentForm.tsx` | 결제 방법 선택 (카드/계좌이체) |
| `features/disposal/DisposalNumber.tsx` | 배출번호 표시 카드 |
| `features/disposal/useDisposalForm.ts` | 배출 워크플로우 훅 (submitApplication, processPayment) |

#### Fee (1 file)
| 파일 | 설명 |
|------|------|
| `features/fee/useFeeCheck.ts` | 수수료 조회 상태 관리 훅 |

#### MyPage (5 files)
| 파일 | 설명 |
|------|------|
| `features/mypage/ApplicationList.tsx` | 신청 내역 목록 |
| `features/mypage/ApplicationCard.tsx` | 개별 신청 카드 |
| `features/mypage/StatusBadge.tsx` | 상태 뱃지 매핑 |
| `features/mypage/ReceiptView.tsx` | 전자 영수증 표시 |
| `features/mypage/useMyApplications.ts` | 신청 내역 조회/취소 훅 |

#### Recycle (4 files)
| 파일 | 설명 |
|------|------|
| `features/recycle/RecycleRegisterForm.tsx` | 물품 등록 폼 |
| `features/recycle/RecycleItemCard.tsx` | 물품 카드 (삭제 확인) |
| `features/recycle/PhotoUploader.tsx` | 이미지 업로드 (최대 5장, 5MB) |
| `features/recycle/useRecycle.ts` | 물품 목록/등록/삭제 훅 |

---

## 10. State Management

### 10.1 Zustand Stores

| Store | State | Actions |
|-------|-------|---------|
| `useDisposalStore` | region: Region \| null, disposalAddress: string, preferredDate: string, items: DisposalItem[], completedApplication: DisposalApplication \| null | setRegion, setDisposalAddress, setPreferredDate, addItem, removeItem, setCompletedApplication, getTotalFee(), reset() |
| `useRegionStore` | selectedRegion: Region \| null | setSelectedRegion, clearRegion |

### 10.2 Auth State (Context API)

| Provider | State | Actions |
|----------|-------|---------|
| `AuthProvider` | user: User \| null, isLoading: boolean | login(data), signup(data), logout() |
| Persistence | `localStorage('throwit_user')` | 페이지 새로고침 시 자동 복원 |

---

## 11. Error Handling

### 11.1 Error Code Definition

| Code | Message | Cause | Handling |
|------|---------|-------|----------|
| `USER_NOT_FOUND` | 사용자를 찾을 수 없습니다 | 잘못된 userId | 로그인 안내 |
| `DUPLICATE_EMAIL` | 이미 사용 중인 이메일입니다 | 가입 시 중복 | 다른 이메일 안내 |
| `INVALID_PASSWORD` | 비밀번호가 일치하지 않습니다 | 로그인 실패 | 재입력 안내 |
| `VALIDATION_ERROR` | 입력값이 올바르지 않습니다 | DTO 검증 실패 | 필드별 에러 표시 |
| `INVALID_STATE` | 해당 작업을 수행할 수 없는 상태입니다 | 상태 전이 오류 | 상태 안내 |
| `FEE_NOT_AVAILABLE` | 수수료 정보가 없습니다 | 해당 지역/품목 미지원 | 구청 문의 안내 |
| `API_ERROR` | 서버 오류가 발생했습니다 | Spring API 장애 | 재시도 안내 |

### 11.2 Error Response Format

```json
{
  "code": "USER_NOT_FOUND",
  "message": "사용자를 찾을 수 없습니다"
}
```

---

## 12. Security Considerations

- [x] Input validation: Spring Validation (@Valid, @NotBlank 등)
- [x] 비밀번호 해싱: SHA-256 + 랜덤 솔트
- [x] CORS: 허용 오리진 제한 (localhost 개발 환경)
- [x] 파일 업로드 제한: 5MB, 이미지 파일만 허용 (프론트엔드)
- [x] 결제 정보 클라이언트 미저장 (UI만 구현)
- [ ] HTTPS enforcement: 배포 시 적용
- [ ] JWT 인증: 현재 X-User-Id 헤더 → 추후 JWT 전환

---

## 13. Implementation Guide

### 13.1 파일 구조

```
throw_it/
├── frontend/src/
│   ├── pages/            (17개)
│   ├── components/       (20개: layout 4, ui 8, waste 5, map 3)
│   ├── features/         (12개: auth 1, disposal 5, fee 1, mypage 5, recycle 4)
│   ├── services/         (7개: auth, disposal, fee, offline, recycle, region, waste)
│   ├── types/            (7개: auth, disposal, fee, offline, recycle, region, waste)
│   ├── stores/           (2개: useDisposalStore, useRegionStore)
│   ├── router/           (index.tsx)
│   └── lib/
│       ├── apiClient.ts
│       └── map/          (5개: MapAdapter, MockMapAdapter, KakaoMapAdapter, createMapAdapter, useMap)
│
└── backend/
    ├── src/main/java/com/throwit/
    │   ├── domain/       (user, fee, disposal, recycle, offline — 총 40개 파일)
    │   ├── global/       (config, exception — 4개 파일)
    │   └── ThrowItApplication.java
    └── src/main/resources/
        ├── application.yml
        ├── application-local.yml
        └── sql/          (schema.sql, large_waste_fee_data.sql, waste_facility_data.sql)
```

### 13.2 구현 순서 (전체 완료)

| 순서 | 작업 | Status |
|------|------|--------|
| 1~13 | 프론트엔드 UI 전체 (17페이지, 20컴포넌트) | Done |
| 14 | `lib/map/` 구현 (MapAdapter + Kakao + Mock) | Done |
| 15 | `MapPlaceholder` + `MapView` 공존 | Done |
| 16 | Spring Boot 프로젝트 초기화 (Gradle, 의존성) | Done |
| 17 | MySQL 스키마 생성 + 공공데이터 적재 (22,819건) | Done |
| 18 | 백엔드 User/Auth API | Done |
| 19 | 백엔드 Region/Waste/Fee API (LargeWasteFee 엔티티) | Done |
| 20 | 백엔드 Disposal API (신청/취소/결제) | Done |
| 21 | 백엔드 Recycle API (등록/삭제/상태변경) | Done |
| 22 | 백엔드 Offline API (스티커/주민센터/운반/폐기물시설) | Done |
| 23 | 프론트엔드 services/ → Spring API 연동 (apiFetch) | Done |
| 24 | 프론트엔드 인증 시스템 (AuthContext, 로그인/가입 페이지) | Done |
| 25 | ScrollToTop 기능 (페이지 전환 시 스크롤 초기화) | Done |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-12 | Initial draft | User |
| 0.2 | 2026-02-12 | Frontend 기술스택 변경 (Next.js → React+Vite) | User |
| 0.3 | 2026-02-15 | 실제 구현 코드 기준 전체 업데이트 | Auto |
| 0.4 | 2026-02-18 | MapAdapter 추상화, 전국 자치구, Spring Boot 패키지 구조, MySQL 스키마 추가 | Auto |
| 0.5 | 2026-02-18 | 실제 DB 확인: large_waste_fee 단일 테이블, 시도명+시군구명 기반 재설계 | Auto |
| 0.6 | 2026-02-19 | sido/sigungu 방식 통일 (Section 3, 5, 6.1 정합성 해소) | Auto |
| 0.7 | 2026-02-20 | 전체 구현 완료 기준 최신화: 실제 타입/서비스/API/DB/백엔드 구조 100% 반영, 인증 시스템 추가, WasteFacility 추가, 19개 API 엔드포인트 명세 완료 | Auto |
