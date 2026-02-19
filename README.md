# Throw It - 대형폐기물 배출 도우미

대형폐기물 수수료 조회, 온라인 배출 신청, 재활용 역경매 등을 지원하는 모바일 웹 서비스입니다.

---

## 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| Backend | Java + Spring Boot | Java 17, Spring Boot 3.4.5 |
| ORM | Spring Data JPA + Hibernate | - |
| Database | MySQL | 8+ |
| Frontend | React + TypeScript | React 19 |
| Build Tool | Vite | 7 |
| Styling | Tailwind CSS | 4 |
| State | Zustand | - |
| Server State | TanStack React Query | - |
| Form | React Hook Form | - |
| Routing | React Router DOM | 7 |

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
| `DB_USERNAME` | Backend | MySQL 사용자명 (기본: root) |
| `DB_PASSWORD` | Backend | MySQL 비밀번호 |
| `VITE_API_BASE_URL` | Frontend .env | API 서버 주소 (기본: http://localhost:8080) |
| `VITE_MAP_API_KEY` | Frontend .env | 카카오맵 JavaScript API 키 |

---

## 프로젝트 구조

```
throw_it/
├── basic/                  # 프로젝트 기획 및 개발 룰
│   └── rule.md
├── backend/                # 백엔드 (Spring Boot + Java)
│   └── src/main/
│       ├── java/com/throwit/
│       │   ├── domain/
│       │   │   ├── region/        # 지역 (시/구/동)
│       │   │   ├── waste/         # 폐기물 카테고리/항목/규격
│       │   │   ├── fee/           # 수수료
│       │   │   ├── disposal/      # 온라인 배출 신청
│       │   │   ├── offline/       # 오프라인 (판매소/주민센터/운반업체)
│       │   │   └── recycle/       # 역경매
│       │   └── global/
│       │       ├── config/        # CORS 등 설정
│       │       └── exception/     # 전역 예외 처리
│       └── resources/
│           ├── application.yml
│           └── application-local.yml  # 로컬 DB 설정 (직접 생성, Git 미포함)
├── frontend/               # 프론트엔드 (React + Vite + TypeScript)
│   └── src/
│       ├── components/     # 공통 UI 컴포넌트
│       ├── features/       # 기능별 컴포넌트 및 훅
│       │   ├── disposal/   # 배출 신청
│       │   ├── fee/        # 수수료 조회
│       │   ├── mypage/     # 마이페이지
│       │   └── recycle/    # 재활용 역경매
│       ├── lib/mock-data/  # Mock 데이터 (JSON)
│       ├── pages/          # 페이지 컴포넌트
│       ├── router/         # 라우터 설정
│       ├── services/       # 서비스 레이어
│       ├── stores/         # 상태 관리 (Zustand)
│       └── types/          # TypeScript 타입 정의
└── docs/                   # 설계 문서
```

---

## 주요 기능

- 대형폐기물 수수료 조회 (지역/품목별)
- 온라인 배출 신청 (신청서 작성 → 검수 → 결제 → 배출번호 발급)
- 오프라인 배출 안내 (스티커 판매소, 주민센터, 운반업체)
- 재활용 역경매 (물품 등록/관리)
- 마이페이지 (신청 내역, 배출 확인증 조회)

---

## 기능 테스트 가이드

### 홈 화면

- URL: `/`
- 수수료 조회, 오프라인 배출, 온라인 배출, 운반 대행, 재활용 역경매 메뉴

### 수수료 조회

- URL: `/fee-check`
- 지역 선택 → 카테고리 선택 → 규격 선택 → 수수료 확인

### 오프라인 배출 안내

| 기능 | URL | 설명 |
|------|-----|------|
| 스티커 판매소 | `/offline/sticker-shops` | 근처 스티커 판매 매장 목록 |
| 주민센터/동사무소 | `/offline/centers` | 직접 방문 신청 가능 시설 |
| 운반 대행 업체 | `/offline/transport` | 운반 대행 업체 연락처 |

### 온라인 배출 신청

1. `/online/apply` - 배출 신청서 작성
2. `/online/review` - 입력 정보 검수
3. `/online/payment` - 수수료 결제 (Mock)
4. `/online/complete` - 배출 번호 발급

### 마이페이지

- URL: `/mypage`
- 신청 내역 목록 확인
- `/mypage/receipt/:id` - 배출 확인증(영수증) 조회

### 재활용 역경매

- URL: `/recycle`
- `/recycle/register` - 물품 등록

---

## API 엔드포인트

### 조회 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/regions` | 전체 지역 목록 |
| GET | `/api/regions/search?q=` | 지역 검색 |
| GET | `/api/waste/categories` | 폐기물 카테고리 (트리) |
| GET | `/api/waste/items?q=` | 폐기물 키워드 검색 |
| GET | `/api/waste/items/{id}` | 폐기물 단건 조회 |
| GET | `/api/fees?region=&item=&size=` | 수수료 조회 |
| GET | `/api/offline/sticker-shops?region=` | 스티커 판매소 |
| GET | `/api/offline/centers?region=` | 주민센터 |
| GET | `/api/offline/transport?region=` | 운반업체 |
| GET | `/api/recycle/items?region=` | 재활용 물품 목록 |

### 쓰기 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/disposals` | 배출 신청 생성 |
| GET | `/api/disposals/my` | 내 신청 목록 (X-User-Id 헤더) |
| GET | `/api/disposals/{id}` | 신청 단건 조회 |
| PATCH | `/api/disposals/{id}/cancel` | 신청 취소 |
| POST | `/api/disposals/{id}/payment` | 결제 처리 (Mock) |
| POST | `/api/recycle/items` | 재활용 물품 등록 |
| PATCH | `/api/recycle/items/{id}/status` | 물품 상태 변경 |

---

## 백엔드 아키텍처

### Service 레이어 (6개)

| Service | 메서드 수 | 주요 기능 |
|---------|-----------|-----------|
| RegionService | 3 | 전체 조회, 검색, ID 조회 |
| WasteService | 4 | 카테고리 트리, 아이템 검색, ID 조회 |
| FeeService | 1 | 수수료 조회 + fallback(강남구) |
| DisposalService | 5 | 신청 생성, 조회, 목록, 취소, 결제 |
| RecycleService | 3 | 목록 조회, 등록, 상태 변경 |
| OfflineService | 3 | 판매소, 주민센터, 운반업체 조회 |

### Entity-Table 매핑

| Entity | Table | 관계 |
|--------|-------|------|
| Region | regions | 1:N → Fee, StickerShop, CommunityCenter, TransportCompany |
| WasteCategory | waste_categories | Self-referencing (parent_id) |
| WasteItem | waste_items | N:1 → WasteCategory, 1:N → WasteSize |
| WasteSize | waste_sizes | N:1 → WasteItem |
| FeeInfo | fees | N:1 → Region, WasteItem, WasteSize |
| DisposalApplication | disposal_applications | N:1 → Region, 1:N → DisposalItem |
| DisposalItem | disposal_items | N:1 → DisposalApplication |
| StickerShop | sticker_shops | N:1 → Region |
| CommunityCenter | community_centers | N:1 → Region |
| TransportCompany | transport_companies | N:1 → Region |
| RecycleItem | recycle_items | N:1 → Region, WasteCategory |

### 초기 데이터

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

### 에러 핸들링

- `GlobalExceptionHandler`: BusinessException, MethodArgumentNotValidException, IllegalStateException 처리
- `BusinessException`: notFound, badRequest, conflict 팩토리 메서드
- `ErrorResponse`: code + message 통일 포맷

### 비즈니스 로직

- 배출번호 자동생성: `{구약칭}-{날짜}-{시퀀스}`
- 수수료 fallback: 해당 지역 수수료 없으면 강남구(ID=1)로 대체
- 카테고리 트리: 재귀적 DTO 변환
- 입력값 검증: `@Valid` + `@NotBlank`, `@NotNull`, `@Min` 등

---

## 프론트엔드 ↔ 백엔드 연동 상태

| 프론트엔드 Service | 백엔드 Controller | 상태 |
|-------------------|-------------------|------|
| regionService.ts | RegionController | 미연동 (Mock) |
| wasteService.ts | WasteController | 미연동 |
| feeService.ts | FeeController | 미연동 |
| disposalService.ts | DisposalController | 미연동 |
| offlineService.ts | OfflineController | 미연동 |
| recycleService.ts | RecycleController | 미연동 |

---

## 빌드 및 린트

```bash
# 프로덕션 빌드
cd frontend
npm run build        # 결과: frontend/dist/

# 빌드 미리보기
npm run preview

# 린트 검사
npm run lint
```

---

## 개발 진행률

```
프로젝트 초기화  [##########] 100%
Entity / Enum    [##########] 100%
Repository       [##########] 100%
Controller       [##########] 100%
Service 레이어   [##########] 100%
DTO              [##########] 100%
에러 핸들링      [##########] 100%
프론트엔드 연동  [----------]   0%
```

**전체: ~85%** (백엔드 완성, 프론트엔드 연동 미완)

---

## 남은 작업

| # | 작업 | 설명 |
|---|------|------|
| 1 | 프론트엔드 연동 | Mock 데이터 → API 호출로 교체 |
| 2 | 인증/인가 | Spring Security, JWT (현재 X-User-Id 헤더) |
| 3 | 파일 업로드 | 사진 업로드 (S3 또는 로컬) |
| 4 | API 문서 | Swagger/SpringDoc OpenAPI |

---

## 참고 사항

- 모바일 UI 기준 설계 (화면 너비 390px~430px 최적화)
- 실제 결제, 본인 인증, 지도 API 등은 아직 미연동
