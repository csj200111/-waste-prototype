# Throw It - 대형폐기물 배출 도우미

대형폐기물 수수료 조회, 온라인 배출 신청, 오프라인 배출 안내, 재활용 역경매를 제공하는 모바일 우선 웹 서비스입니다.

**전국 17개 시도, 131개 시군구, 22,819건 수수료 데이터**를 기반으로 실서비스 수준의 기능을 제공합니다.

---

## 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| Backend | Java + Spring Boot | Java 17, Spring Boot 3.4.5 |
| ORM | Spring Data JPA + Hibernate | - |
| Database | MySQL | 8+ |
| Frontend | React + TypeScript | React 19.2.0 |
| Build Tool | Vite | 7.3.1 |
| Styling | Tailwind CSS | 4.1.18 |
| State | Zustand | 5.0.11 |
| Server State | TanStack React Query | 5.90.21 |
| Form | React Hook Form | 7.71.1 |
| Routing | React Router DOM | 7.13.0 |
| Map | Kakao Maps SDK | - |

---

## 사전 준비

| 도구 | 최소 버전 | 확인 명령어 |
|------|-----------|-------------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Java (JDK) | 17+ | `java -version` |
| MySQL | 8+ | `mysql --version` |
| Git | - | `git --version` |

---

## 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone <저장소 URL>
cd throw_it
```

### 2. MySQL 데이터베이스 설정

```sql
CREATE DATABASE waste_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

공공데이터 초기화 (테이블 생성 및 데이터 로드):

```bash
mysql -u root -p waste_db < backend/src/main/resources/sql/schema.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/large_waste_fee_data.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/waste_facility_data.sql
```

### 3. 백엔드 실행

`backend/src/main/resources/application-local.yml` 파일을 생성하고 본인의 MySQL 계정 정보를 입력합니다:

```yaml
spring:
  datasource:
    username: root
    password: 본인_MySQL_비밀번호
```

> 이 파일은 `.gitignore`에 등록되어 있어 Git에 올라가지 않습니다.

```bash
cd backend
./gradlew bootRun
```

백엔드: `http://localhost:8080`

### 4. 프론트엔드 실행

```bash
cd frontend

# .env 파일 생성
cp .env.example .env
# .env 파일을 열어 VITE_MAP_API_KEY에 카카오맵 API 키를 입력

npm install
npm run dev
```

프론트엔드: `http://localhost:5173`

> 모바일 UI 기준이므로 브라우저 개발자 도구(F12)에서 모바일 뷰로 전환하면 최적화된 화면을 볼 수 있습니다.

### 환경변수

| 변수 | 위치 | 설명 |
|------|------|------|
| `DB_USERNAME` | Backend (application-local.yml) | MySQL 사용자명 (기본: root) |
| `DB_PASSWORD` | Backend (application-local.yml) | MySQL 비밀번호 |
| `VITE_API_BASE_URL` | Frontend .env | API 서버 주소 (기본: http://localhost:8080) |
| `VITE_MAP_API_KEY` | Frontend .env | 카카오맵 JavaScript API 키 |

---

## 프로젝트 구조

```
throw_it/
├── basic/                      # 프로젝트 기획 및 개발 룰
│   └── rule.md
├── backend/                    # 백엔드 (Spring Boot + Java 17)
│   └── src/main/
│       ├── java/com/throwit/
│       │   ├── domain/
│       │   │   ├── user/       # 사용자 인증 (회원가입/로그인)
│       │   │   ├── fee/        # 수수료/지역/폐기물 조회 (핵심)
│       │   │   ├── disposal/   # 온라인 배출 신청/결제
│       │   │   ├── recycle/    # 재활용 역경매
│       │   │   └── offline/    # 오프라인 시설 (판매소/주민센터/처리시설)
│       │   └── global/
│       │       ├── config/     # CORS 설정
│       │       └── exception/  # 전역 예외 처리
│       └── resources/
│           ├── application.yml
│           ├── application-local.yml  # 로컬 DB 설정 (직접 생성, Git 미포함)
│           └── sql/            # DB 초기화 스크립트
├── frontend/                   # 프론트엔드 (React + Vite + TypeScript)
│   └── src/
│       ├── components/         # 공통 UI 컴포넌트 (20개)
│       │   ├── layout/         # Header, BottomNav, MobileContainer, ProgressBar
│       │   ├── ui/             # Button, Card, Input, Modal, DatePicker, Select, Badge, SearchBar
│       │   ├── waste/          # CategoryTree, WasteItemCard, WasteSearchBar, SizeSelector, FeeResultCard
│       │   └── map/            # MapView, MapPlaceholder, LocationCard
│       ├── features/           # 기능별 컴포넌트 및 훅 (16개)
│       │   ├── auth/           # AuthContext (로그인/회원가입 상태)
│       │   ├── disposal/       # DisposalForm, ReviewSummary, PaymentForm, DisposalNumber
│       │   ├── fee/            # useFeeCheck
│       │   ├── mypage/         # ApplicationList, ApplicationCard, ReceiptView
│       │   └── recycle/        # RecycleRegisterForm, RecycleItemCard, PhotoUploader
│       ├── lib/
│       │   ├── apiClient.ts    # API 통신 유틸리티 (apiFetch)
│       │   └── map/            # MapAdapter, MockMapAdapter, KakaoMapAdapter
│       ├── pages/              # 페이지 컴포넌트 (17개)
│       ├── router/             # 라우터 설정 (17개 라우트)
│       ├── services/           # API 서비스 레이어 (7개)
│       ├── stores/             # 상태 관리 - Zustand (2개)
│       └── types/              # TypeScript 타입 정의 (7개)
└── docs/                       # PDCA 설계 문서
    ├── 01-plan/                # 기획서
    ├── 02-design/              # 설계서
    ├── 03-analysis/            # 분석서
    └── 04-report/              # 보고서
```

---

## 주요 기능

| 기능 | 설명 | 인증 필요 |
|------|------|:---------:|
| 수수료 조회 | 시도/시군구 + 카테고리 + 폐기물 + 규격 기반 수수료 조회 (DB 실연동) | - |
| 오프라인 배출 안내 | 스티커 판매소 / 주민센터 (카카오맵 연동) / 폐기물 처리 시설 | - |
| 온라인 배출 신청 | 신청서 작성 → 검수 → 결제(UI) → 배출번호 발급 | Yes |
| 재활용 역경매 | 물품 사진 업로드 + 등록/관리/삭제 | Yes |
| 마이페이지 | 신청 내역 조회, 취소/환불, 전자 영수증 조회 | Yes |
| 사용자 인증 | 이메일/비밀번호 회원가입 및 로그인 (솔트 기반 해싱) | - |

---

## 기능 테스트 가이드

### 홈 화면

- URL: `/`
- 수수료 조회, 오프라인 배출, 온라인 배출, 운반 대행, 재활용 역경매 메뉴

### 수수료 조회

- URL: `/fee-check`
- 시도 선택 → 시군구 선택 → 카테고리 필터 → 폐기물 검색 → 규격 선택 → 수수료 확인

### 오프라인 배출 안내

| 기능 | URL | 설명 |
|------|-----|------|
| 오프라인 메인 | `/offline` | 3개 메뉴 카드 (판매소/주민센터/처리시설) |
| 스티커 판매소 | `/offline/sticker-shops` | 시군구 선택 + 카카오맵 + 판매소 목록 |
| 주민센터 | `/offline/centers` | 시군구 선택 + 카카오맵 + 주민센터 목록 |
| 폐기물 처리 시설 | `/offline/transport` | 시도/시군구 선택 + 처리 시설 DB 조회 |

### 온라인 배출 신청

1. `/online` - 4단계 프로세스 안내
2. `/online/apply` - 배출 신청서 작성 (지역 + 폐기물 + 주소 + 날짜)
3. `/online/review` - 입력 정보 검수
4. `/online/payment` - 수수료 결제 (카드/계좌이체 UI)
5. `/online/complete` - 배출 번호 발급 + 영수증 링크

### 인증

| 기능 | URL | 설명 |
|------|-----|------|
| 로그인 | `/login` | 이메일/비밀번호 로그인 |
| 회원가입 | `/signup` | 이메일/비밀번호/닉네임 가입 |

### 마이페이지

- URL: `/mypage` - 신청 내역 목록 확인
- `/mypage/receipt/:id` - 배출 확인증(영수증) 조회

### 재활용 역경매

- URL: `/recycle` - 물품 목록 + 내 물품 관리
- `/recycle/register` - 물품 등록 (사진 최대 5장, 5MB 제한)

---

## API 엔드포인트 (19개)

### 인증 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| GET | `/api/auth/me` | 내 정보 조회 (X-User-Id 헤더) |

### 지역/폐기물/수수료 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/regions/sido` | 시도 목록 |
| GET | `/api/regions/sigungu?sido=서울특별시` | 시군구 목록 |
| GET | `/api/waste/categories` | 폐기물 카테고리 목록 |
| GET | `/api/waste/items?sigungu=강남구&category=가구류&keyword=책상` | 폐기물 항목 검색 |
| GET | `/api/fees?sido=서울특별시&sigungu=강남구&wasteName=책상` | 수수료 조회 |

### 배출 신청 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/disposals` | 배출 신청 생성 |
| GET | `/api/disposals/my` | 내 신청 목록 (X-User-Id 헤더) |
| GET | `/api/disposals/{id}` | 신청 상세 조회 |
| PATCH | `/api/disposals/{id}/cancel` | 신청 취소 |
| POST | `/api/disposals/{id}/payment` | 결제 처리 (UI) |

### 역경매 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/recycle/items?sigungu=강남구` | 역경매 물품 목록 |
| GET | `/api/recycle/items/my` | 내 물품 목록 (X-User-Id 헤더) |
| POST | `/api/recycle/items` | 물품 등록 |
| PATCH | `/api/recycle/items/{id}/status?status=reserved` | 상태 변경 |
| DELETE | `/api/recycle/items/{id}` | 물품 삭제 |

### 오프라인 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/offline/sticker-shops?sigungu=강남구` | 스티커 판매소 |
| GET | `/api/offline/centers?sigungu=강남구` | 주민센터 |
| GET | `/api/offline/transport?sigungu=강남구` | 운반 업체 |
| GET | `/api/offline/waste-facilities?sido=서울특별시&sigungu=강남구` | 폐기물 처리 시설 |

---

## 백엔드 아키텍처

### 도메인 구조 (5개 도메인)

| 도메인 | Controller | Service | Entity | DTO |
|--------|-----------|---------|--------|-----|
| user | AuthController | AuthService | User | LoginRequest, SignupRequest, UserResponse |
| fee | LargeWasteFeeController | LargeWasteFeeService | LargeWasteFee | FeeInfoDto, WasteItemResult |
| disposal | DisposalController | DisposalService | DisposalApplication, DisposalItem | DisposalCreateRequest, DisposalResponse 등 |
| recycle | RecycleController | RecycleService | RecycleItem | RecycleCreateRequest, RecycleItemResponse |
| offline | OfflineController | OfflineService | WasteFacility | StickerShopResponse, CommunityCenterResponse 등 |

### 데이터베이스 (6개 테이블)

| 테이블 | 건수 | 설명 |
|--------|------|------|
| large_waste_fee | 22,819 | 전국 대형폐기물 수수료 (공공데이터) |
| waste_facility | - | 폐기물 처리 시설 (공공데이터) |
| users | - | 사용자 계정 (솔트 기반 비밀번호 해싱) |
| disposal_applications | - | 배출 신청 |
| disposal_items | - | 배출 품목 (신청 1:N 품목) |
| recycle_items | - | 역경매 물품 |

### 핵심 쿼리 방식

- **지역 식별**: `시도명 + 시군구명` 텍스트 조합 (regionCode 미사용)
- **수수료 조회**: `large_waste_fee WHERE 시도명=? AND 시군구명=? AND 대형폐기물명=?`
- **배출번호 자동생성**: `{시군구약어2자리}-{YYYYMMDD}-{5자리 일련번호}` (예: GN-20260218-00123)

### 에러 핸들링

- `GlobalExceptionHandler`: BusinessException, MethodArgumentNotValidException 처리
- `BusinessException`: notFound, badRequest, conflict 팩토리 메서드
- `ErrorResponse`: `{ code, message }` 통일 포맷

### CORS 설정

- 허용 오리진: `http://localhost:5173`, `http://localhost:5174`, `http://localhost:3000`
- 허용 메서드: GET, POST, PUT, PATCH, DELETE, OPTIONS
- 경로: `/api/**`

---

## 프론트엔드-백엔드 연동 상태

| 프론트엔드 Service | 백엔드 Controller | 상태 |
|-------------------|-------------------|:----:|
| authService.ts | AuthController | 연동 완료 |
| regionService.ts | LargeWasteFeeController (지역) | 연동 완료 |
| wasteService.ts | LargeWasteFeeController (폐기물) | 연동 완료 |
| feeService.ts | LargeWasteFeeController (수수료) | 연동 완료 |
| disposalService.ts | DisposalController | 연동 완료 |
| offlineService.ts | OfflineController | 연동 완료 |
| recycleService.ts | RecycleController | 연동 완료 |

---

## 빌드 및 린트

```bash
# 프론트엔드 프로덕션 빌드
cd frontend
npm run build        # 결과: frontend/dist/

# 빌드 미리보기
npm run preview

# 린트 검사
npm run lint

# 백엔드 빌드
cd backend
./gradlew build
```

---

## 개발 진행률

```
프로젝트 초기화       [##########] 100%
프론트엔드 UI (17p)  [##########] 100%
백엔드 API (19개)    [##########] 100%
DB 연동 (6 테이블)   [##########] 100%
프론트엔드-백엔드 연동 [##########] 100%
사용자 인증           [##########] 100%
카카오맵 연동         [##########] 100%
```

**전체: ~95%** (핵심 기능 구현 완료, 아래 항목은 추후 확장)

---

## 남은 작업 (추후 확장)

| # | 작업 | 설명 |
|---|------|------|
| 1 | JWT 인증 전환 | 현재 X-User-Id 헤더 → JWT Access/Refresh Token |
| 2 | 결제 PG사 연동 | 토스페이먼츠 등 실결제 연동 (현재 UI만 구현) |
| 3 | 파일 업로드 | URL 문자열 → 실제 파일 업로드 (S3 등) |
| 4 | 오프라인 데이터 확장 | 스티커 판매소/주민센터 실제 전국 데이터 |
| 5 | 배포 | 프론트엔드(Vercel) + 백엔드(AWS/GCP) + DB(RDS) |
| 6 | API 문서 | Swagger/SpringDoc OpenAPI |

---

## 참고 사항

- 모바일 UI 기준 설계 (428px max-width, 반응형 대응)
- 브라우저 개발자 도구(F12)에서 모바일 뷰로 전환하여 테스트
- 결제는 UI만 구현 (PG 실연동 제외)
- 인증은 이메일/비밀번호 기반 (JWT 미적용, X-User-Id 헤더 사용)
- 카카오맵은 `VITE_MAP_API_KEY` 설정 시 활성화, 미설정 시 Placeholder 표시
