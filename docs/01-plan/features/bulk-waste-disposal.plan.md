# 대형폐기물 배출 도우미 서비스 Planning Document

> **Summary**: 대형폐기물 수수료 조회, 배출 신청, 운반 대행, 재활용 역경매를 제공하는 모바일 우선 웹 서비스 (실제 서비스 수준)
>
> **Project**: throw_it
> **Version**: 0.5.0
> **Author**: User
> **Date**: 2026-02-12
> **Last Updated**: 2026-02-20
> **Status**: Implementation Complete (Frontend + Backend + DB 연동)

---

## 1. Overview

### 1.1 Purpose

대형폐기물을 버리려는 사용자가 수수료 확인부터 배출 완료까지의 과정을 하나의 서비스에서 쉽고 편리하게 처리할 수 있도록 돕는다.
**실제 서비스 가능한 수준**으로 개발하며, 데이터베이스 연동·지도 API·결제 연동을 위한 확장이 용이한 구조를 갖춘다.

### 1.2 Background

현재 대형폐기물 배출은 오프라인(스티커 구매 → 부착 → 배출)과 온라인(구청 홈페이지 → 결제 → 인쇄 → 배출) 두 가지 방식이 있다. 두 방식 모두 수수료 조회가 번거롭고, 지역마다 기준이 달라 사용자 혼란이 크다.
본 서비스는 **대한민국 전국 모든 자치구**를 대상으로 이 과정을 통합하여 모바일 환경에서 간편하게 이용할 수 있도록 한다.

### 1.3 Related Documents

- 기획서: `basic/rule.md`
- 설계서: `docs/02-design/features/bulk-waste-disposal.design.md`
- 분석서: `docs/03-analysis/bulk-waste-disposal.analysis.md`

---

## 2. Scope

### 2.1 In Scope

**[완료 - 프론트엔드 UI]**
- [x] 수수료 조회 (지역 + 폐기물 종류/규격 입력 → 수수료 안내)
- [x] 오프라인 배출 가이드 (스티커 판매소 안내, 배출 절차 안내)
- [x] 온라인 배출 신청 흐름 UI (입력 → 검수 → 결제 → 배출번호)
- [x] 운반 대행 업체 안내 (업체명 + 전화번호 목록)
- [x] 재활용 역경매 UI (사진 업로드 → 목록 표시)
- [x] 마이페이지 (신청 내역 조회, 취소/환불 신청 UI)
- [x] 배출 확인증(전자 영수증) 조회 화면
- [x] 지도 UI 구현 (MapAdapter 패턴 + 카카오맵 연동)

**[완료 - 백엔드 + DB]**
- [x] **전국 모든 자치구 지역 데이터** (17개 시도, 131개 시군구 — 22,819건 수수료 데이터)
- [x] **지역-DB 매핑**: 시도/시군구 드롭다운 선택 → DB 수수료 자동 매핑
- [x] **Spring Boot 백엔드 API 구현** (지역, 폐기물, 수수료, 배출 신청, 역경매, 오프라인, 인증)
- [x] **MySQL 데이터베이스 연동** (large_waste_fee + waste_facility 공공데이터 + 서비스 테이블)
- [x] **지도 API 플러그인 구조**: MapAdapter 인터페이스로 카카오맵 즉시 연동 완료
- [x] **결제 UI 완성** (카드/계좌이체 선택 UI, PG 실연동은 Out of Scope)
- [x] **사용자 인증** (이메일 회원가입/로그인, 솔트 기반 비밀번호 해싱, 헤더 기반 인증)

### 2.2 Out of Scope (추후 확장)

- 실제 결제 PG사 연동 (토스페이먼츠 등)
- 본인 인증 연동 (PASS, 공동인증서 등)
- 실시간 푸시 알림
- 수거 업체 위치 공유 실시간 연동
- JWT/Session 기반 인증 (현재 X-User-Id 헤더 방식)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| **공통** | | | |
| FR-01 | 시도/시군구 드롭다운으로 지역 선택 (전국 17개 시도, 131개 시군구) | High | Done |
| FR-02 | 폐기물 종류를 카테고리별 필터로 선택 (가구류/가전제품류/기타/생활용품류) | High | Done |
| FR-03 | 폐기물 키워드 검색 기능 | High | Done |
| FR-04 | 지역 + 종류 + 규격 기반 수수료 조회 (DB 실연동) | High | Done |
| FR-04-EXT | 지역-DB 매핑: 시도+시군구 → large_waste_fee 테이블 자동 매핑 | High | Done |
| **오프라인 배출** | | | |
| FR-05 | 스티커 판매소 안내 (지도 연동 완료 — 카카오맵) | Medium | Done |
| FR-06 | 동사무소/주민센터 위치 안내 (지도 연동 완료) | Medium | Done |
| FR-07 | 운반 대행 업체 / 폐기물 처리 시설 목록 (waste_facility DB 연동) | Medium | Done |
| **온라인 배출** | | | |
| FR-08 | 온라인 배출 신청 폼 (지역, 폐기물, 규격, 수량, 배출 장소, 희망 날짜) | High | Done |
| FR-09 | 마지막 검수 화면 (입력 정보 최종 확인) | High | Done |
| FR-10 | 결제 UI (카드/계좌이체 선택, PG 미연동) | Medium | Done |
| FR-11 | 배출 번호 발급 (시군구약어-YYYYMMDD-일련번호 형식) | High | Done |
| FR-12 | 배출 확인증(전자 영수증) 조회 | Medium | Done |
| **인증** | | | |
| FR-18 | 이메일/비밀번호 회원가입 (솔트 기반 해싱) | High | Done |
| FR-19 | 이메일/비밀번호 로그인 | High | Done |
| FR-20 | 로그인 가드 (온라인 배출, 역경매, 마이페이지) | Medium | Done |
| **마이페이지** | | | |
| FR-13 | 신청 내역 목록 조회 (상태 표시: 결제대기/결제완료/수거예정/수거완료/취소/환불) | Medium | Done |
| FR-14 | 결제 취소 및 환불 신청 | Medium | Done |
| **역경매/재활용** | | | |
| FR-15 | 대형폐기물 사진 업로드 + 설명 등록 (최대 5장, 5MB 제한) | Low | Done |
| FR-16 | 등록된 폐기물 목록 열람 + 내 물품 조회/삭제 | Low | Done |
| FR-17 | 수거 희망 시 위치 지정 기능 UI | Low | Done |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 페이지 로딩 < 3초 (모바일 환경) | Lighthouse |
| Responsive | 모바일 UI 기준 (428px max), 태블릿/데스크탑 대응 | 수동 검증 |
| Accessibility | 기본 접근성 준수 (대비, 폰트 크기) | Lighthouse |
| Extensibility | DB 연동, 지도 API, 결제 API 확장 용이한 구조 | 코드 리뷰 |
| Data Coverage | 전국 17개 시도, 131개 시군구 (22,819건 수수료 데이터) | DB 검증 완료 |

---

## 4. Success Criteria

### 4.1 Definition of Done (프로토타입 - 완료)

- [x] 모든 High 우선순위 요구사항 UI 구현 완료
- [x] 모바일 기준 반응형 레이아웃 동작 (428px max-width)
- [x] 수수료 조회 흐름 (지역 선택 → 폐기물 선택 → 수수료 표시) 완성
- [x] 온라인 배출 신청 흐름 (입력 → 검수 → 결제UI → 배출번호) 완성
- [x] 마이페이지 신청 내역 조회 동작

### 4.2 Definition of Done (실서비스 목표 - 완료)

- [x] 전국 모든 자치구 데이터 DB 구축 (22,819건)
- [x] Spring Boot API 서버 기동 및 프론트엔드 연동 (19개 엔드포인트)
- [x] 지역 선택 → DB 매핑 → 수수료 조회 실연동
- [x] 지도 API 키 입력 시 즉시 연동 가능한 구조 검증 (카카오맵 연동 완료)
- [x] 배출 신청 데이터 DB 저장/조회 실동작
- [x] 사용자 인증 (회원가입/로그인) 동작

### 4.3 Quality Criteria

- [ ] Lint 에러 없음
- [ ] 빌드 성공 (프론트엔드 + 백엔드)
- [ ] 모바일 브라우저에서 주요 흐름 동작 확인

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation | Status |
|------|--------|------------|------------|--------|
| 전국 자치구 수수료 데이터 수집 어려움 | High | High | 공공데이터포털 데이터 MySQL에 적재 완료 (22,819건) | Resolved |
| 자치구별 폐기물 분류 기준 상이 | Medium | High | large_waste_fee 단일 테이블로 통합 관리 | Resolved |
| 결제/인증 미연동으로 실사용 제한 | Medium | Low | 결제 UI 구현 완료, 인증은 이메일 기반 구현 완료 | Mitigated |
| 지도 API 연동 지연 | Medium | Medium | MapAdapter 패턴으로 카카오맵 연동 완료 | Resolved |
| Spring Boot 개발 범위 확대 | High | Medium | 19개 API 엔드포인트 전체 구현 완료 | Resolved |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites, portfolios | |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend, SaaS MVPs | v |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic, complex architectures | |

> Dynamic 선택 이유: 백엔드(Spring Boot) + 프론트엔드(React) 풀스택 구조. DB, 결제, 지도 API 연동이 필수이며 feature 단위 모듈화가 유지보수에 유리함.

### 6.2 기술 스택 (확정)

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Frontend | TypeScript + React | React 19.2.0 + Vite 7.3.1 | 모바일 우선 SPA |
| Backend | Java 17 + Spring Boot | Spring Boot 3.4.5 | REST API 서버 |
| Database | MySQL | 8.x | waste_db (6개 테이블) |
| Styling | Tailwind CSS | 4.1.18 | 모바일 우선 반응형 |
| State | Zustand | 5.0.11 | 클라이언트 상태 |
| Routing | react-router-dom | 7.13.0 | SPA 라우팅 |
| Server State | TanStack React Query | 5.90.21 | Spring API 연동 |
| Form | react-hook-form | 7.71.1 | 배출 신청 폼 |
| Map | Kakao Maps SDK | - | MapAdapter 패턴 |
| Build (BE) | Gradle (Kotlin DSL) | - | Spring Boot 빌드 |
| ORM | Spring Data JPA | - | MySQL 연동 |
| Validation | Spring Validation | - | DTO 검증 |

### 6.3 핵심 아키텍처 결정

#### 지도 API 플러그인 구조 (구현 완료)
```
MapAdapter (Interface)
├── KakaoMapAdapter (implements MapAdapter)  ← VITE_MAP_API_KEY 주입 시 활성화
└── MockMapAdapter                           ← 키 없을 때 기본값

환경변수 VITE_MAP_API_KEY 가 있으면 → 카카오맵 렌더링
없으면 → MockMapAdapter (Placeholder)
```

#### 지역-DB 매핑 구조 (구현 완료)
```
사용자 시도/시군구 선택 (드롭다운)
  → regionService.getSido()            → GET /api/regions/sido
  → regionService.getSigungu(sido)     → GET /api/regions/sigungu?sido=서울특별시
  → feeService.getFees(sido, sigungu, wasteName)
     → GET /api/fees?sido=서울특별시&sigungu=강남구&wasteName=책상
     → MySQL: large_waste_fee WHERE 시도명=? AND 시군구명=? AND 대형폐기물명=?
  → FeeInfo[] → 규격별 수수료 표시
```

#### 전국 자치구 데이터 (DB 확인 완료)
```
대한민국 (large_waste_fee 테이블 기준)
├── 17개 시도 (특별시, 광역시, 도, 특별자치시/도)
├── 131개 시군구
└── 22,819건 수수료 데이터
```

### 6.4 폴더 구조 (현행)

```
throw_it/
├── frontend/
│   └── src/
│       ├── pages/            (17개 페이지)
│       ├── components/       (20개: layout 4, ui 8, waste 5, map 3)
│       ├── features/         (12개: auth, disposal, fee, mypage, recycle)
│       ├── services/         (7개: auth, disposal, fee, offline, recycle, region, waste)
│       ├── types/            (7개: auth, disposal, fee, offline, recycle, region, waste)
│       ├── stores/           (2개: useDisposalStore, useRegionStore)
│       ├── router/           (index.tsx — 17개 라우트)
│       └── lib/
│           ├── apiClient.ts  (API 통신 유틸리티)
│           └── map/          (MapAdapter, MockMapAdapter, KakaoMapAdapter, createMapAdapter, useMap)
│
└── backend/
    └── src/main/java/com/throwit/
        ├── domain/
        │   ├── user/         (User 엔티티, AuthService, AuthController, DTOs)
        │   ├── fee/          (LargeWasteFee 엔티티, Service, Controller, DTOs)
        │   ├── disposal/     (DisposalApplication/Item 엔티티, Service, Controller, DTOs)
        │   ├── recycle/      (RecycleItem 엔티티, Service, Controller, DTOs)
        │   └── offline/      (WasteFacility 엔티티, OfflineService, Controller, DTOs)
        └── global/
            ├── config/       (CorsConfig)
            └── exception/    (BusinessException, ErrorResponse, GlobalExceptionHandler)
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [ ] `CLAUDE.md` has coding conventions section
- [x] `basic/rule.md` 기획 문서 존재
- [x] ESLint configuration (eslint 9)
- [ ] Prettier configuration
- [x] TypeScript configuration (`tsconfig.json`)

### 7.2 Conventions to Define/Verify

| Category | Applied Convention | Priority |
|----------|-----------|:--------:|
| **Naming (FE)** | 컴포넌트: PascalCase, 훅: camelCase (use* prefix), 파일: PascalCase(컴포넌트), camelCase(훅/서비스) | High |
| **Naming (BE)** | Entity: PascalCase, Service/Controller: PascalCase, DTO: PascalCase, 패키지: lowercase | High |
| **Folder structure** | Feature-based 구조 (FE), Domain-based 구조 (BE) | High |
| **API 통신** | services/ 레이어 → apiFetch() → Spring Boot REST API | High |
| **지역 식별** | 시도명 + 시군구명 텍스트 조합 (regionCode 미사용) | High |
| **인증** | X-User-Id 헤더 방식 (추후 JWT 전환 예정) | Medium |

### 7.3 Environment Variables

| Variable | Purpose | Status |
|----------|---------|:------:|
| `VITE_API_BASE_URL` | Spring Boot API 엔드포인트 (기본: http://localhost:8080) | Active |
| `VITE_MAP_API_KEY` | 카카오맵 API 키 | Active |
| `DB_USERNAME` | MySQL 사용자명 (기본: root) | Active |
| `DB_PASSWORD` | MySQL 비밀번호 | Active |

---

## 8. 화면 흐름 (User Flow)

### 8.1 메인 화면

```
┌─────────────────────────────┐
│    대형폐기물 배출 도우미    │
│                             │
│  ┌─────────────────────────┐│
│  │   수수료 조회하기       ││
│  └─────────────────────────┘│
│                             │
│  ┌──────────┐ ┌────────────┐│
│  │ 오프라인 │ │ 온라인     ││
│  │ 배출 안내│ │ 배출 신청  ││
│  └──────────┘ └────────────┘│
│  ┌──────────┐ ┌────────────┐│
│  │ 운반대행 │ │ 재활용     ││
│  │          │ │ 역경매     ││
│  └──────────┘ └────────────┘│
│                             │
│  ═══════════════════════════│
│  🏠 홈              👤 MY  │
└─────────────────────────────┘
```

### 8.2 주요 흐름

1. **수수료 조회**: 홈 → 시도/시군구 선택 → 카테고리 필터 → 폐기물 검색 → 규격 선택 → 수수료 표시 (DB 실연동)
2. **오프라인 배출**: 홈 → 오프라인 → 스티커 판매소(지도) / 주민센터(지도) / 폐기물 처리 시설
3. **온라인 배출**: 홈 → 로그인 → 온라인 → 지역+폐기물 입력 → 검수 → 결제(UI) → 배출번호 발급
4. **역경매**: 홈 → 로그인 → 재활용 → 사진 업로드 → 등록 → 목록 열람/삭제
5. **마이페이지**: 하단탭 → 로그인 → 신청 내역 → 상태 확인 / 취소 / 영수증 조회
6. **인증**: 회원가입 → 이메일/비밀번호/닉네임 → 로그인 → 세션 유지 (localStorage)

---

## 9. 구현 우선순위 (Phase)

| Phase | 기능 | 설명 | Status |
|-------|------|------|--------|
| **Phase 1** | 수수료 조회 | 핵심 기능. 지역 선택 + 카테고리 + 수수료 표시 | Done |
| **Phase 2** | 온라인 배출 신청 | 신청 폼 → 검수 → 결제 UI → 배출번호 발급 | Done |
| **Phase 3** | 오프라인 안내 + 운반 대행 | 스티커 판매소, 주민센터, 폐기물 처리 시설 | Done |
| **Phase 4** | 마이페이지 | 신청 내역, 상태 표시, 취소/환불, 전자 영수증 | Done |
| **Phase 5** | 역경매/재활용 | 사진 업로드, 목록, 삭제, 위치 지정 | Done |
| **Phase 6** | 백엔드 API (Spring Boot) | 19개 REST API 엔드포인트 | Done |
| **Phase 7** | DB 연동 (MySQL) | 6개 테이블 (22,819건 수수료 + 폐기물 시설) | Done |
| **Phase 8** | 지도 API 연동 | MapAdapter + 카카오맵 SDK 연동 | Done |
| **Phase 9** | 사용자 인증 | 회원가입/로그인, 솔트 해싱, 로그인 가드 | Done |

---

## 10. Implementation Statistics (현행)

### Frontend

| Category | Count |
|----------|-------|
| Pages | 17 |
| Components | 20 (Layout 4, UI 8, Waste 5, Map 3) |
| Features (hooks + domain components) | 12 |
| Services | 7 |
| Types | 7 files |
| Stores (Zustand) | 2 |
| Routes | 17 |
| Map Adapters | 3 (Interface + Mock + Kakao) |

### Backend

| Category | Count |
|----------|-------|
| Java Source Files | 45 |
| REST API Endpoints | 19 |
| Entity Classes | 6 (User, DisposalApplication, DisposalItem, RecycleItem, LargeWasteFee, WasteFacility) |
| Service Classes | 5 (Auth, Disposal, Recycle, LargeWasteFee, Offline) |
| Controller Classes | 5 (Auth, Disposal, Recycle, LargeWasteFee, Offline) |
| DTO Classes | 15 |
| Database Tables | 6 |
| DB Records (large_waste_fee) | 22,819 |

---

## 11. Next Steps

1. [ ] **JWT 인증 전환** — 현재 X-User-Id 헤더 → JWT Access/Refresh Token
2. [ ] **결제 PG사 연동** — 토스페이먼츠 등 실결제 연동
3. [ ] **오프라인 데이터 확장** — 스티커 판매소/주민센터 실제 데이터 (현재 하드코딩 3건씩)
4. [ ] **이미지 업로드** — 현재 URL 문자열 저장 → 실제 파일 업로드 (S3 등)
5. [ ] **배포** — 프론트엔드(Vercel/Netlify) + 백엔드(AWS/GCP) + DB(RDS)
6. [ ] **Lint/Build 검증** — CI/CD 파이프라인 구축

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-12 | Initial draft based on rule.md | User |
| 0.2 | 2026-02-12 | Frontend 기술스택 Next.js → React + Vite 변경 | User |
| 0.3 | 2026-02-15 | 실제 구현 코드 기준으로 전체 문서 업데이트 | Auto |
| 0.4 | 2026-02-18 | rule.md 변경 반영: 전국 자치구 확장, 실서비스 수준 목표, 지도 MapAdapter 구조, 지역-DB 매핑, Spring Boot + MySQL 백엔드 추가 | Auto |
| 0.5 | 2026-02-20 | 전체 구현 완료 기준 최신화: Phase 6~9 Done, 백엔드 45개 파일/19 API/6 테이블, 인증 시스템 추가, 통계 업데이트, Next Steps 재정리 | Auto |
