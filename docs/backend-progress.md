# Backend 개발 진행 상황

> **Last Updated**: 2026-02-15
> **Branch**: backend-A
> **Build Status**: BUILD SUCCESSFUL

---

## 1. 전체 진행률

```
프로젝트 초기화  [##########] 100%
Entity / Enum    [##########] 100%
Repository       [##########] 100%
Controller       [#####-----]  50%  ← 골격만 완성 (TODO 남음)
Service 레이어   [----------]   0%
DTO              [----------]   0%
프론트엔드 연동  [----------]   0%
```

**전체 진행률: ~30%** (골격 완성, 비즈니스 로직 미구현)

---

## 2. Tech Stack

| 항목 | 선택 | 버전 |
|------|------|------|
| Language | Java | 17 (런타임: 24) |
| Framework | Spring Boot | 3.4.5 |
| Build | Gradle (Kotlin DSL) | 8.14 |
| DB | MySQL | - |
| ORM | Spring Data JPA + Hibernate | - |
| Utility | Lombok | - |

---

## 3. 프로젝트 구조

```
backend/src/main/java/com/throwit/
├── ThrowItApplication.java
├── domain/
│   ├── region/          ← 지역 (시/구/동)
│   │   ├── Region.java              ✅ Entity
│   │   ├── RegionRepository.java    ✅ Repository
│   │   └── RegionController.java    🔶 Controller (직접 Repository 호출)
│   ├── waste/           ← 폐기물 카테고리/항목/규격
│   │   ├── WasteCategory.java       ✅ Entity (self-referencing 트리)
│   │   ├── WasteItem.java           ✅ Entity
│   │   ├── WasteSize.java           ✅ Entity
│   │   ├── WasteCategoryRepository  ✅ Repository
│   │   ├── WasteItemRepository      ✅ Repository
│   │   └── WasteController.java     🔶 Controller (직접 Repository 호출)
│   ├── fee/             ← 수수료
│   │   ├── FeeInfo.java             ✅ Entity
│   │   ├── FeeRepository.java       ✅ Repository
│   │   └── FeeController.java       🔶 Controller (직접 Repository 호출)
│   ├── disposal/        ← 온라인 배출 신청
│   │   ├── DisposalApplication.java ✅ Entity
│   │   ├── DisposalItem.java        ✅ Entity
│   │   ├── DisposalStatus.java      ✅ Enum (7개 상태)
│   │   ├── PaymentMethod.java       ✅ Enum
│   │   ├── DisposalRepository.java  ✅ Repository
│   │   └── DisposalController.java  ❌ Controller (TODO 반환)
│   ├── offline/         ← 오프라인 (판매소/주민센터/운반업체)
│   │   ├── StickerShop.java         ✅ Entity
│   │   ├── CommunityCenter.java     ✅ Entity
│   │   ├── TransportCompany.java    ✅ Entity
│   │   ├── *Repository.java (3개)   ✅ Repository
│   │   └── OfflineController.java   🔶 Controller (직접 Repository 호출)
│   └── recycle/         ← 역경매
│       ├── RecycleItem.java         ✅ Entity
│       ├── RecycleStatus.java       ✅ Enum
│       ├── RecycleRepository.java   ✅ Repository
│       └── RecycleController.java   ❌ Controller (TODO 반환)
└── global/
    └── config/
        └── CorsConfig.java          ✅ CORS (localhost:5173, 3000)
```

**범례**: ✅ 완성 | 🔶 동작하지만 개선 필요 | ❌ 미구현 (TODO)

---

## 4. API 엔드포인트 상태

### 4.1 조회 API (읽기 전용) - 동작함

| Method | Endpoint | 상태 | 비고 |
|--------|----------|------|------|
| GET | `/api/regions` | 🔶 | Repository 직접 호출, Service 분리 필요 |
| GET | `/api/regions/search?q=` | 🔶 | JPQL 검색 구현됨 |
| GET | `/api/waste/categories` | 🔶 | 최상위 카테고리만 반환, DTO 변환 필요 |
| GET | `/api/waste/items?q=` | 🔶 | 키워드 검색 구현됨 |
| GET | `/api/waste/items/{id}` | 🔶 | 단건 조회 |
| GET | `/api/fees?region=&item=&size=` | 🔶 | 수수료 조회, fallback 미구현 |
| GET | `/api/offline/sticker-shops?region=` | 🔶 | regionId 필터 지원 |
| GET | `/api/offline/centers?region=` | 🔶 | regionId 필터 지원 |
| GET | `/api/offline/transport?region=` | 🔶 | regionId 필터 지원 |
| GET | `/api/recycle/items?region=` | 🔶 | regionId 필터 지원 |

### 4.2 쓰기 API (생성/수정) - 미구현

| Method | Endpoint | 상태 | 필요 작업 |
|--------|----------|------|-----------|
| POST | `/api/disposals` | ❌ | DTO, 배출번호 생성, Service 구현 |
| GET | `/api/disposals/my` | ❌ | 인증 + 사용자별 조회 |
| PATCH | `/api/disposals/{id}/cancel` | ❌ | 상태 변경 로직 |
| POST | `/api/disposals/{id}/payment` | ❌ | 결제 처리 (Mock) |
| POST | `/api/recycle/items` | ❌ | DTO, 물품 등록 Service |

---

## 5. Entity-Table 매핑

| Entity | Table | 컬럼 수 | 관계 |
|--------|-------|---------|------|
| Region | regions | 4 | 1:N → Fee, StickerShop, CommunityCenter, TransportCompany |
| WasteCategory | waste_categories | 3 | Self-referencing (parent_id), 1:N → children |
| WasteItem | waste_items | 3 | N:1 → WasteCategory, 1:N → WasteSize |
| WasteSize | waste_sizes | 4 | N:1 → WasteItem |
| FeeInfo | fees | 5 | N:1 → Region, WasteItem, WasteSize |
| DisposalApplication | disposal_applications | 11 | N:1 → Region, 1:N → DisposalItem |
| DisposalItem | disposal_items | 7 | N:1 → DisposalApplication |
| StickerShop | sticker_shops | 7 | N:1 → Region |
| CommunityCenter | community_centers | 7 | N:1 → Region |
| TransportCompany | transport_companies | 5 | N:1 → Region |
| RecycleItem | recycle_items | 11 | N:1 → Region, WasteCategory |

---

## 6. 초기 데이터 (data.sql)

| 테이블 | 건수 | 설명 |
|--------|------|------|
| regions | 10 | 서울 주요 행정구역 |
| waste_categories | 37 | 5개 최상위 + 32개 하위 카테고리 |
| waste_items | 17 | 가구/가전/침구/운동 폐기물 |
| waste_sizes | 35 | 항목별 규격 (소/중/대) |
| fees | 35 | 강남구(region=1) 기준 수수료 |
| sticker_shops | 5 | 스티커 판매소 |
| community_centers | 4 | 주민센터 |
| transport_companies | 5 | 운반 대행 업체 |

---

## 7. 남은 작업 (TODO)

### 우선순위 높음
| # | 작업 | 설명 |
|---|------|------|
| 1 | **Service 레이어** | Controller에서 비즈니스 로직 분리 (6개 Service 클래스) |
| 2 | **DTO** | Entity 직접 노출 방지, Request/Response DTO 작성 |
| 3 | **Disposal 비즈니스 로직** | 배출 신청 생성, 배출번호 자동 생성, 상태 변경, 결제 처리 |
| 4 | **Recycle 비즈니스 로직** | 역경매 물품 등록, 상태 변경 |

### 우선순위 중간
| # | 작업 | 설명 |
|---|------|------|
| 5 | **Fee fallback 로직** | 해당 지역 수수료 없으면 기본 지역(강남구)으로 fallback |
| 6 | **WasteCategory 트리 DTO** | 재귀적 트리 구조를 JSON으로 변환하는 DTO |
| 7 | **에러 핸들링** | GlobalExceptionHandler, 통일된 에러 응답 포맷 |
| 8 | **Validation** | 입력값 검증 (@Valid, ConstraintValidator) |

### 우선순위 낮음 (추후)
| # | 작업 | 설명 |
|---|------|------|
| 9 | 인증/인가 | Spring Security, JWT 또는 세션 기반 |
| 10 | 파일 업로드 | 사진 업로드 (S3 또는 로컬 스토리지) |
| 11 | 프론트엔드 연동 | Mock 데이터 → API 호출로 교체 |
| 12 | API 문서 | Swagger/SpringDoc OpenAPI |

---

## 8. 실행 방법

```bash
# 1. MySQL 데이터베이스 생성
mysql -u root -p
CREATE DATABASE throwit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 2. application.yml에 MySQL 비밀번호 설정
# backend/src/main/resources/application.yml → password 항목

# 3. 빌드 & 실행
cd backend
./gradlew bootRun

# 4. 확인
# http://localhost:8080/api/regions
# http://localhost:8080/api/waste/categories
```

---

## 9. 프론트엔드 ↔ 백엔드 매핑

| 프론트엔드 Service | 백엔드 Controller | 연동 상태 |
|-------------------|-------------------|-----------|
| regionService.ts | RegionController | ⬜ 미연동 (Mock 사용 중) |
| wasteService.ts | WasteController | ⬜ 미연동 |
| feeService.ts | FeeController | ⬜ 미연동 |
| disposalService.ts | DisposalController | ⬜ 미연동 |
| offlineService.ts | OfflineController | ⬜ 미연동 |
| recycleService.ts | RecycleController | ⬜ 미연동 |
