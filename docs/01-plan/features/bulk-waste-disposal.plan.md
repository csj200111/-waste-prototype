# 대형폐기물 배출 도우미 서비스 Planning Document

> **Summary**: 대형폐기물 수수료 조회, 배출 신청, 운반 대행, 재활용 역경매를 제공하는 모바일 우선 웹 서비스 (실제 서비스 수준)
>
> **Project**: throw_it
> **Version**: 0.4.0
> **Author**: User
> **Date**: 2026-02-12
> **Last Updated**: 2026-02-18
> **Status**: Plan Updated (Production-Level Target)

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

---

## 2. Scope

### 2.1 In Scope

**[완료 - 프로토타입]**
- [x] 수수료 조회 (지역 + 폐기물 종류/규격 입력 → 수수료 안내)
- [x] 오프라인 배출 가이드 (스티커 판매소 안내, 배출 절차 안내)
- [x] 온라인 배출 신청 흐름 UI (결제 전까지의 입력/검수 화면)
- [x] 운반 대행 업체 안내 (업체명 + 전화번호 목록)
- [x] 재활용 역경매 UI (사진 업로드 → 목록 표시)
- [x] 마이페이지 (신청 내역 조회, 취소/환불 신청 UI)
- [x] 배출 확인증(전자 영수증) 조회 화면
- [x] 지도 UI 구현 (MapPlaceholder 컴포넌트로 위치 확보)

**[신규 - 실서비스 목표]**
- [ ] **전국 모든 자치구 지역 데이터** (기존 서울 일부 → 전국 확장)
- [ ] **지역-DB 매핑**: 주소 입력 시 자동으로 해당 자치구 파악 후 수수료 테이블 매핑
- [ ] **Spring Boot 백엔드 API 구현** (지역, 폐기물, 수수료, 배출 신청, 마이페이지)
- [ ] **MySQL 데이터베이스 연동** (Mock Data → 실제 DB)
- [ ] **지도 API 플러그인 구조**: API 키 입력만으로 즉시 연동 가능한 MapAdapter 구조
- [ ] **결제 UI 완성** (결제 가능하다는 가정 하에 겉모습 구현, PG 실연동은 Out of Scope)
- [ ] **사용자 인증 기반 마이페이지** (로그인 세션 관리)

### 2.2 Out of Scope (추후 확장)

- 실제 결제 PG사 연동 (토스페이먼츠 등)
- 본인 인증 연동 (PASS, 공동인증서 등)
- 실시간 푸시 알림
- 수거 업체 위치 공유 실시간 연동

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| **공통** | | | |
| FR-01 | 주소 입력 시 자동으로 구/동 파악 (전국 모든 자치구 대상) | High | Done (일부) |
| FR-02 | 폐기물 종류를 트리 구조 카테고리로 선택 (가구 → 책상 → 편수) | High | Done |
| FR-03 | 폐기물 키워드 검색 기능 | High | Done |
| FR-04 | 지역 + 종류 + 규격 기반 수수료 자동 계산/조회 | High | Done |
| FR-04-EXT | **지역-DB 매핑**: 지역 선택 시 DB의 해당 지역 수수료 테이블 자동 연결 | High | Todo |
| **오프라인 배출** | | | |
| FR-05 | 현재 위치 기준 스티커 판매소 안내 (지도 연동 준비 완료) | Medium | Done |
| FR-06 | 동사무소/주민센터 위치 안내 | Medium | Done |
| FR-07 | 운반 대행 업체 목록 표시 (업체명, 전화번호) | Medium | Done |
| **온라인 배출** | | | |
| FR-08 | 온라인 배출 신청 폼 (지역, 폐기물 종류, 규격, 수량, 배출 장소, 희망 날짜) | High | Done |
| FR-09 | 마지막 검수 화면 (입력 정보 + 사진 최종 확인) | High | Done |
| FR-10 | 결제 UI (결제 가능하다는 가정 하에 카드/계좌이체 선택, PG 미연동) | Medium | Done |
| FR-11 | 배출 번호 발급 화면 ("이 번호를 종이에 크게 적어 붙이세요" 안내) | High | Done |
| FR-12 | 배출 확인증(전자 영수증) 조회 | Medium | Done |
| **마이페이지** | | | |
| FR-13 | 신청 내역 목록 조회 (상태 표시: 신청/결제완료/수거완료/취소) | Medium | Done |
| FR-14 | 결제 취소 및 환불 신청 (배출 전 직접 취소 가능) | Medium | Done |
| **역경매/재활용** | | | |
| FR-15 | 대형폐기물 사진 업로드 + 설명 등록 | Low | Done |
| FR-16 | 등록된 폐기물 목록 열람 (업체/개인) | Low | Done |
| FR-17 | 수거 희망 시 위치 지정 기능 UI (지도 연동 준비 완료) | Low | Done |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 페이지 로딩 < 3초 (모바일 환경) | Lighthouse |
| Responsive | 모바일 UI 기준 (428px max), 태블릿/데스크탑 대응 | 수동 검증 |
| Accessibility | 기본 접근성 준수 (대비, 폰트 크기) | Lighthouse |
| Extensibility | DB 연동, 지도 API, 결제 API 확장 용이한 구조 | 코드 리뷰 |
| Data Coverage | 대한민국 전국 모든 자치구 (특별시·광역시·도 산하 자치구) | 데이터 검증 |

---

## 4. Success Criteria

### 4.1 Definition of Done (프로토타입 - 완료)

- [x] 모든 High 우선순위 요구사항 UI 구현 완료
- [x] 모바일 기준 반응형 레이아웃 동작 (428px max-width)
- [x] 수수료 조회 흐름 (지역 선택 → 폐기물 선택 → 수수료 표시) 완성
- [x] 온라인 배출 신청 흐름 (입력 → 검수 → 결제UI → 배출번호) 완성
- [x] 마이페이지 신청 내역 조회 동작

### 4.2 Definition of Done (실서비스 목표 - 신규)

- [ ] 전국 모든 자치구 데이터 DB 구축
- [ ] Spring Boot API 서버 기동 및 프론트엔드 연동
- [ ] 지역 선택 → DB 매핑 → 수수료 조회 실연동
- [ ] 지도 API 키 입력 시 즉시 연동 가능한 구조 검증
- [ ] 배출 신청 데이터 DB 저장/조회 실동작

### 4.3 Quality Criteria

- [ ] Lint 에러 없음
- [ ] 빌드 성공 (프론트엔드 + 백엔드)
- [ ] 모바일 브라우저에서 주요 흐름 동작 확인

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 전국 자치구 수수료 데이터 수집 어려움 | High | High | 공공데이터포털 API 활용 (환경부/지자체 공개 데이터), 크롤링 병행 검토 |
| 자치구별 폐기물 분류 기준 상이 | Medium | High | 환경부 표준 분류체계 참고, 공통 카테고리 우선 구축 후 지역별 예외 처리 |
| 결제/인증 미연동으로 실사용 제한 | Medium | Low | 결제 UI만 구현(가정 하에), 실연동은 Out of Scope 명시 |
| 지도 API 연동 지연 | Medium | Medium | MapAdapter 인터페이스로 추상화, 키 주입만으로 즉시 활성화 가능한 구조 유지 |
| Spring Boot 개발 범위 확대 | High | Medium | API 우선순위 지정 (수수료 조회 > 배출 신청 > 마이페이지 > 역경매) |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites, portfolios | |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend, SaaS MVPs | v |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic, complex architectures | |

> Dynamic 선택 이유: 백엔드(Spring Boot) + 프론트엔드(React) 풀스택 구조. 추후 DB, 결제, 지도 API 연동이 필수이며 feature 단위 모듈화가 유지보수에 유리함.

### 6.2 기술 스택 (확정)

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Frontend | TypeScript + React | React 19 + Vite 7 | 모바일 우선 SPA |
| Backend | Java + Spring Boot | Spring Boot 3.x | REST API 서버 |
| Database | MySQL | 8.x | 자치구별 수수료 테이블, 배출 신청 내역 |
| Styling | Tailwind CSS | 4.x | 모바일 우선 반응형 |
| State | Zustand | 5.x | 클라이언트 상태 |
| Routing | react-router-dom | 7.x | SPA 라우팅 |
| Server State | TanStack React Query | 5.x | Spring API 연동 |
| Form | react-hook-form | 7.x | 배출 신청 폼 |

### 6.3 핵심 아키텍처 결정

#### 지도 API 플러그인 구조
```
MapAdapter (Interface)
├── KakaoMapAdapter (implements MapAdapter)  ← KAKAO_MAP_KEY 주입 시 활성화
├── NaverMapAdapter (implements MapAdapter)  ← 추후 확장
└── MockMapAdapter                           ← 키 없을 때 기본값 (현 상태)

환경변수 VITE_MAP_API_KEY 가 있으면 → 실제 지도 렌더링
없으면 → MockMapAdapter (현재 MapPlaceholder)
```

#### 지역-DB 매핑 구조
```
사용자 주소 입력
  → regionService.detectRegion(address)
  → 자치구 코드(regionCode) 반환
  → Spring API: GET /api/fees?regionCode=11010&wasteId=1&size=MEDIUM
  → MySQL: fees 테이블에서 해당 regionCode 수수료 조회
  → 프론트엔드 수수료 표시
```

#### 전국 자치구 데이터 구조
```
대한민국 자치구 (약 250개)
├── 특별시 (서울)      25개 자치구
├── 광역시 (6개)       약 69개 자치구/군
├── 특별자치시 (세종)   1개
├── 특별자치도 (제주)   2개 시
└── 도 (8개)           나머지 시/군/구
```

### 6.4 폴더 구조 (현행 유지 + 백엔드 추가)

```
throw_it/
├── frontend/  (현행 React + Vite 코드)
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── features/
│       ├── services/          ← API 통신 레이어 (Mock → Spring API 교체)
│       ├── types/
│       ├── stores/
│       └── lib/
│           ├── map/           ← MapAdapter 추상화 레이어 (신규)
│           └── mock-data/
└── backend/   (Spring Boot - 신규)
    └── src/main/java/
        ├── domain/
        │   ├── region/        ← 자치구 관리
        │   ├── waste/         ← 폐기물 카테고리
        │   ├── fee/           ← 수수료 테이블
        │   ├── disposal/      ← 배출 신청
        │   └── recycle/       ← 역경매
        └── infrastructure/
            └── mysql/         ← Repository 구현체
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
| **Naming** | 컴포넌트: PascalCase, 훅: camelCase (use* prefix), 파일: PascalCase(컴포넌트), camelCase(훅/서비스) | High |
| **Folder structure** | Feature-based 구조 | High |
| **Import order** | React → 외부 라이브러리 → 내부 → types → styles | Medium |
| **API 통신** | services/ 레이어 통해서만 API 호출, Mock → Spring API 교체 | High |
| **지역 코드** | 행정구역 코드 기준 (법정동 코드 체계 준용) | High |

### 7.3 Environment Variables

| Variable | Purpose | Status |
|----------|---------|:------:|
| `VITE_API_URL` | Spring Boot API 엔드포인트 | 추후 필요 시 요청 |
| `VITE_MAP_API_KEY` | 지도 API 키 (카카오맵 등) | 추후 필요 시 요청 |
| `DB_URL` | MySQL 연결 URL | 추후 필요 시 요청 |
| `DB_USER` / `DB_PASSWORD` | MySQL 인증 | 추후 필요 시 요청 |

> **개발 중 API 키, DB 연동 등이 필요한 경우 필요한 요구사항을 명시하여 요청할 것.**

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

1. **수수료 조회**: 홈 → 지역 입력 → 폐기물 카테고리 선택(트리/검색) → 규격 선택 → 수수료 표시 (→ DB 매핑)
2. **오프라인 배출**: 홈 → 오프라인 → 스티커 판매소 목록 / 동사무소 위치 / 배출 절차 안내
3. **온라인 배출**: 홈 → 온라인 → 지역+폐기물 입력 → 수수료 확인 → 검수 → 결제(UI) → 배출번호 발급
4. **운반 대행**: 홈 → 운반대행 → 업체 목록 (이름, 전화번호)
5. **역경매**: 홈 → 재활용 → 사진 업로드 → 등록 → 업체/개인 열람
6. **마이페이지**: 하단탭 → 신청 내역 → 상태 확인 / 취소 / 영수증 조회

---

## 9. 구현 우선순위 (Phase)

| Phase | 기능 | 설명 | Status |
|-------|------|------|--------|
| **Phase 1** | 수수료 조회 | 핵심 기능. 지역 선택 + 카테고리 트리 + 수수료 표시 | Done (UI) |
| **Phase 2** | 온라인 배출 신청 | 신청 폼 → 검수 → 결제 UI → 배출번호 발급 | Done (UI) |
| **Phase 3** | 오프라인 안내 + 운반 대행 | 스티커 판매소, 동사무소 안내, 운반 업체 목록 | Done (UI) |
| **Phase 4** | 마이페이지 | 신청 내역, 상태 표시, 취소/환불, 전자 영수증 | Done (UI) |
| **Phase 5** | 역경매/재활용 | 사진 업로드, 목록, 위치 지정 UI | Done (UI) |
| **Phase 6** | 백엔드 API (Spring Boot) | 수수료/지역/배출 신청 API 구현 | Todo |
| **Phase 7** | DB 연동 (MySQL) | 전국 자치구 데이터 + 수수료 테이블 | Todo |
| **Phase 8** | 지도 API 연동 | MapAdapter 구현, 키 입력만으로 즉시 활성화 | Todo |

---

## 10. Implementation Statistics (현행)

| Category | Count |
|----------|-------|
| Pages | 15 |
| Components | 26 |
| Features (hooks + domain components) | 19 |
| Services | 6 |
| Types | 6 files |
| Stores (Zustand) | 2 |
| Mock Data | 8 JSON files |
| Routes | 15 |

---

## 11. Next Steps

1. [ ] **디자인 문서 업데이트** (`/pdca design bulk-waste-disposal`) - 지도 MapAdapter, 지역-DB 매핑 구조 반영
2. [ ] **Spring Boot 백엔드 프로젝트 초기화** - 디렉터리 구조, 의존성 설정
3. [ ] **전국 자치구 데이터 구축** - 공공데이터 수집 또는 수동 입력
4. [ ] **MySQL 스키마 설계** - 지역, 폐기물, 수수료, 배출 신청 테이블
5. [ ] **MapAdapter 추상화 레이어 구현** - 키 입력만으로 지도 활성화
6. [ ] **프론트엔드 services/ → Spring API 교체**

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-12 | Initial draft based on rule.md | User |
| 0.2 | 2026-02-12 | Frontend 기술스택 Next.js → React + Vite 변경 | User |
| 0.3 | 2026-02-15 | 실제 구현 코드 기준으로 전체 문서 업데이트 | Auto |
| 0.4 | 2026-02-18 | rule.md 변경 반영: 전국 자치구 확장, 실서비스 수준 목표, 지도 MapAdapter 구조, 지역-DB 매핑, Spring Boot + MySQL 백엔드 추가 | Auto |
