# Backend 개발 진행 상황

> **Last Updated**: 2026-02-17
> **Branch**: backend-A
> **Build Status**: BUILD SUCCESSFUL

---

## 1. 전체 진행률

```
프로젝트 초기화  [##########] 100%
Entity / Enum    [##########] 100%
Repository       [##########] 100%
Controller       [##########] 100%  ← Service+DTO 연동 완료
Service 레이어   [##########] 100%  ← 6개 Service 완성
DTO              [##########] 100%  ← Request/Response DTO 완성
에러 핸들링      [##########] 100%  ← GlobalExceptionHandler
프론트엔드 연동  [----------]   0%
```

**전체 진행률: ~85%** (Service/DTO/에러핸들링 완성, 프론트엔드 연동 미완)

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
| Validation | Spring Boot Starter Validation | - |

---

## 3. 프로젝트 구조

```
backend/src/main/java/com/throwit/
├── ThrowItApplication.java
├── domain/
│   ├── region/          ← 지역 (시/구/동)
│   │   ├── Region.java              ✅ Entity
│   │   ├── RegionRepository.java    ✅ Repository
│   │   ├── RegionService.java       ✅ Service
│   │   ├── RegionController.java    ✅ Controller (Service 사용)
│   │   └── dto/
│   │       └── RegionResponse.java  ✅ DTO
│   ├── waste/           ← 폐기물 카테고리/항목/규격
│   │   ├── WasteCategory.java       ✅ Entity (self-referencing 트리)
│   │   ├── WasteItem.java           ✅ Entity
│   │   ├── WasteSize.java           ✅ Entity
│   │   ├── WasteCategoryRepository  ✅ Repository
│   │   ├── WasteItemRepository      ✅ Repository
│   │   ├── WasteService.java        ✅ Service (트리 DTO 변환 포함)
│   │   ├── WasteController.java     ✅ Controller (Service 사용)
│   │   └── dto/
│   │       ├── WasteCategoryResponse ✅ DTO (재귀적 트리)
│   │       ├── WasteItemResponse     ✅ DTO
│   │       └── WasteSizeResponse     ✅ DTO
│   ├── fee/             ← 수수료
│   │   ├── FeeInfo.java             ✅ Entity
│   │   ├── FeeRepository.java       ✅ Repository
│   │   ├── FeeService.java          ✅ Service (fallback 로직 포함)
│   │   ├── FeeController.java       ✅ Controller (Service 사용)
│   │   └── dto/
│   │       └── FeeResponse.java     ✅ DTO
│   ├── disposal/        ← 온라인 배출 신청
│   │   ├── DisposalApplication.java ✅ Entity (비즈니스 메서드 추가)
│   │   ├── DisposalItem.java        ✅ Entity
│   │   ├── DisposalStatus.java      ✅ Enum (7개 상태)
│   │   ├── PaymentMethod.java       ✅ Enum
│   │   ├── DisposalRepository.java  ✅ Repository
│   │   ├── DisposalService.java     ✅ Service (생성/취소/결제)
│   │   ├── DisposalController.java  ✅ Controller (Service 사용)
│   │   └── dto/
│   │       ├── DisposalCreateRequest ✅ DTO (@Valid)
│   │       ├── DisposalItemRequest   ✅ DTO (@Valid)
│   │       ├── DisposalResponse      ✅ DTO
│   │       ├── DisposalItemResponse  ✅ DTO
│   │       └── PaymentRequest        ✅ DTO (@Valid)
│   ├── offline/         ← 오프라인 (판매소/주민센터/운반업체)
│   │   ├── StickerShop.java         ✅ Entity
│   │   ├── CommunityCenter.java     ✅ Entity
│   │   ├── TransportCompany.java    ✅ Entity
│   │   ├── *Repository.java (3개)   ✅ Repository
│   │   ├── OfflineService.java      ✅ Service
│   │   ├── OfflineController.java   ✅ Controller (Service 사용)
│   │   └── dto/
│   │       ├── StickerShopResponse   ✅ DTO
│   │       ├── CommunityCenterResponse ✅ DTO
│   │       └── TransportCompanyResponse ✅ DTO
│   └── recycle/         ← 역경매
│       ├── RecycleItem.java         ✅ Entity (상태 변경 메서드 추가)
│       ├── RecycleStatus.java       ✅ Enum
│       ├── RecycleRepository.java   ✅ Repository
│       ├── RecycleService.java      ✅ Service (등록/상태변경)
│       ├── RecycleController.java   ✅ Controller (Service 사용)
│       └── dto/
│           ├── RecycleCreateRequest  ✅ DTO (@Valid)
│           └── RecycleItemResponse   ✅ DTO
└── global/
    ├── config/
    │   └── CorsConfig.java          ✅ CORS (localhost:5173, 3000)
    └── exception/
        ├── BusinessException.java   ✅ 커스텀 예외
        ├── ErrorResponse.java       ✅ 에러 응답 DTO
        └── GlobalExceptionHandler.java ✅ 전역 예외 처리
```

**범례**: ✅ 완성

---

## 4. API 엔드포인트 상태

### 4.1 조회 API (읽기 전용) - 완성

| Method | Endpoint | 상태 | 비고 |
|--------|----------|------|------|
| GET | `/api/regions` | ✅ | Service + DTO |
| GET | `/api/regions/search?q=` | ✅ | JPQL 검색, DTO 변환 |
| GET | `/api/waste/categories` | ✅ | 재귀적 트리 DTO 변환 |
| GET | `/api/waste/items?q=` | ✅ | 키워드 검색, DTO 변환 |
| GET | `/api/waste/items/{id}` | ✅ | 단건 조회, 404 에러 처리 |
| GET | `/api/fees?region=&item=&size=` | ✅ | fallback 로직 포함 |
| GET | `/api/offline/sticker-shops?region=` | ✅ | DTO 변환 |
| GET | `/api/offline/centers?region=` | ✅ | DTO 변환 |
| GET | `/api/offline/transport?region=` | ✅ | DTO 변환 |
| GET | `/api/recycle/items?region=` | ✅ | DTO 변환 |

### 4.2 쓰기 API (생성/수정) - 완성

| Method | Endpoint | 상태 | 비고 |
|--------|----------|------|------|
| POST | `/api/disposals` | ✅ | DTO 검증, 배출번호 자동생성, Service 구현 |
| GET | `/api/disposals/my` | ✅ | X-User-Id 헤더로 사용자 식별 |
| GET | `/api/disposals/{id}` | ✅ | 단건 조회 |
| PATCH | `/api/disposals/{id}/cancel` | ✅ | 상태 변경 로직 (비즈니스 규칙 적용) |
| POST | `/api/disposals/{id}/payment` | ✅ | 결제 처리 (Mock, CARD/TRANSFER) |
| POST | `/api/recycle/items` | ✅ | DTO 검증, 물품 등록 Service |
| PATCH | `/api/recycle/items/{id}/status` | ✅ | 상태 변경 |

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

## 7. 구현 완료 사항

### Service 레이어 (6개)
| Service | 메서드 수 | 주요 기능 |
|---------|-----------|-----------|
| RegionService | 3 | 전체 조회, 검색, ID 조회 |
| WasteService | 4 | 카테고리 트리, 아이템 검색, ID 조회 |
| FeeService | 1 | 수수료 조회 + fallback(강남구) |
| DisposalService | 5 | 신청 생성, 조회, 목록, 취소, 결제 |
| RecycleService | 3 | 목록 조회, 등록, 상태 변경 |
| OfflineService | 3 | 판매소, 주민센터, 운반업체 조회 |

### DTO 클래스 (15개)
- **Request**: DisposalCreateRequest, DisposalItemRequest, PaymentRequest, RecycleCreateRequest
- **Response**: RegionResponse, WasteCategoryResponse, WasteItemResponse, WasteSizeResponse, FeeResponse, DisposalResponse, DisposalItemResponse, RecycleItemResponse, StickerShopResponse, CommunityCenterResponse, TransportCompanyResponse

### 에러 핸들링
- GlobalExceptionHandler: BusinessException, MethodArgumentNotValidException, IllegalStateException 처리
- BusinessException: notFound, badRequest, conflict 팩토리 메서드
- ErrorResponse: code + message 통일 포맷

### 비즈니스 로직
- **배출 신청**: 배출번호 자동생성 ({구약칭}-{날짜}-{시퀀스}), 상태 관리, 결제 Mock
- **수수료 fallback**: 해당 지역 수수료 없으면 강남구(ID=1)로 fallback
- **카테고리 트리 DTO**: 재귀적 WasteCategoryResponse 변환
- **입력값 검증**: @Valid + @NotBlank/@NotNull/@Min 등

---

## 8. 남은 작업 (TODO)

### 우선순위 낮음 (추후)
| # | 작업 | 설명 |
|---|------|------|
| 1 | 인증/인가 | Spring Security, JWT 또는 세션 기반 (현재 X-User-Id 헤더) |
| 2 | 파일 업로드 | 사진 업로드 (S3 또는 로컬 스토리지) |
| 3 | 프론트엔드 연동 | Mock 데이터 → API 호출로 교체 |
| 4 | API 문서 | Swagger/SpringDoc OpenAPI |

---

## 9. 실행 방법

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

## 10. 프론트엔드 ↔ 백엔드 매핑

| 프론트엔드 Service | 백엔드 Controller | 연동 상태 |
|-------------------|-------------------|-----------|
| regionService.ts | RegionController | ⬜ 미연동 (Mock 사용 중) |
| wasteService.ts | WasteController | ⬜ 미연동 |
| feeService.ts | FeeController | ⬜ 미연동 |
| disposalService.ts | DisposalController | ⬜ 미연동 |
| offlineService.ts | OfflineController | ⬜ 미연동 |
| recycleService.ts | RecycleController | ⬜ 미연동 |
