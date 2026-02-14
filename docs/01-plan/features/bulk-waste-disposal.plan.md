# 대형폐기물 배출 도우미 서비스 Planning Document

> **Summary**: 대형폐기물 수수료 조회, 배출 신청, 운반 대행, 재활용 역경매를 제공하는 모바일 우선 웹 서비스
>
> **Project**: throw_it
> **Version**: 0.1.0
> **Author**: User
> **Date**: 2026-02-12
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

대형폐기물을 버리려는 사용자가 수수료 확인부터 배출 완료까지의 과정을 하나의 서비스에서 쉽고 편리하게 처리할 수 있도록 돕는다.

### 1.2 Background

현재 대형폐기물 배출은 오프라인(스티커 구매 → 부착 → 배출)과 온라인(구청 홈페이지 → 결제 → 인쇄 → 배출) 두 가지 방식이 있다. 두 방식 모두 수수료 조회가 번거롭고, 지역마다 기준이 달라 사용자 혼란이 크다. 본 서비스는 이 과정을 통합하여 모바일 환경에서 간편하게 이용할 수 있도록 한다.

### 1.3 Related Documents

- 기획서: `basic/rule.md`

---

## 2. Scope

### 2.1 In Scope (프로토타입 범위)

- [ ] 수수료 조회 (지역 + 폐기물 종류/규격 입력 → 수수료 안내)
- [ ] 오프라인 배출 가이드 (스티커 판매소 안내, 배출 절차 안내)
- [ ] 온라인 배출 신청 흐름 UI (결제 전까지의 입력/검수 화면)
- [ ] 운반 대행 업체 안내 (업체명 + 전화번호 목록)
- [ ] 재활용 역경매 UI (사진 업로드 → 목록 표시)
- [ ] 마이페이지 (신청 내역 조회, 취소/환불 신청 UI)
- [ ] 배출 확인증(전자 영수증) 조회 화면
- [ ] 지도 UI 구현 (API는 나중에 입력, 지도가 들어갈 위치를 구현)


### 2.2 Out of Scope (추후 확장)

- 실제 결제 연동 (PG사 연동)
- 본인 인증 연동 (PASS, 공동인증서 등)
- 지도 API 연동 (카카오맵/네이버 지도)
- 데이터베이스 연동 (실제 수수료 테이블 DB화)
- 수거 업체 위치 공유 실시간 연동
- 푸시 알림

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| **공통** | | | |
| FR-01 | 지역(주소) 입력 시 자동으로 구/동 파악 | High | Pending |
| FR-02 | 폐기물 종류를 트리 구조 카테고리로 선택 (가구 → 책상 → 편수) | High | Pending |
| FR-03 | 폐기물 키워드 검색 기능 | High | Pending |
| FR-04 | 지역 + 종류 + 규격 기반 수수료 자동 계산/조회 | High | Pending |
| **오프라인 배출** | | | |
| FR-05 | 현재 위치 기준 스티커 판매소 안내 (목록 형태, 추후 지도 연동) | Medium | Pending |
| FR-06 | 동사무소/주민센터 위치 안내 | Medium | Pending |
| FR-07 | 운반 대행 업체 목록 표시 (업체명, 전화번호) | Medium | Pending |
| **온라인 배출** | | | |
| FR-08 | 온라인 배출 신청 폼 (지역, 폐기물 종류, 규격, 수량, 배출 장소, 희망 날짜) | High | Pending |
| FR-09 | 마지막 검수 화면 (입력 정보 + 사진 최종 확인) | High | Pending |
| FR-10 | 결제 UI (프로토타입: 결제 버튼만, 실제 PG 미연동) | Medium | Pending |
| FR-11 | 배출 번호 발급 화면 ("이 번호를 종이에 크게 적어 붙이세요" 안내) | High | Pending |
| FR-12 | 배출 확인증(전자 영수증) 조회 | Medium | Pending |
| **마이페이지** | | | |
| FR-13 | 신청 내역 목록 조회 (상태 표시: 신청/결제완료/수거완료/취소) | Medium | Pending |
| FR-14 | 결제 취소 및 환불 신청 (배출 전 직접 취소 가능) | Medium | Pending |
| **역경매/재활용** | | | |
| FR-15 | 대형폐기물 사진 업로드 + 설명 등록 | Low | Pending |
| FR-16 | 등록된 폐기물 목록 열람 (업체/개인) | Low | Pending |
| FR-17 | 수거 희망 시 위치 지정 기능 UI (추후 지도 연동) | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 페이지 로딩 < 3초 (모바일 환경) | Lighthouse |
| Responsive | 모바일 UI 기준, 태블릿/데스크탑 대응 | 수동 검증 |
| Accessibility | 기본 접근성 준수 (대비, 폰트 크기) | Lighthouse |
| Extensibility | DB 연동, 지도 API, 결제 API 확장 용이한 구조 | 코드 리뷰 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 모든 High 우선순위 요구사항 UI 구현 완료
- [ ] 모바일 기준 반응형 레이아웃 동작
- [ ] 수수료 조회 흐름 (지역 선택 → 폐기물 선택 → 수수료 표시) 완성
- [ ] 온라인 배출 신청 흐름 (입력 → 검수 → 결제UI → 배출번호) 완성
- [ ] 마이페이지 신청 내역 조회 동작

### 4.2 Quality Criteria

- [ ] Lint 에러 없음
- [ ] 빌드 성공
- [ ] 모바일 브라우저에서 주요 흐름 동작 확인

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 지역별 수수료 데이터 수집 어려움 | High | High | 프로토타입에서는 샘플 데이터(서울 주요 구 기준) 사용, 추후 공공데이터 API 활용 |
| 폐기물 카테고리 분류 기준 상이 | Medium | High | 환경부 표준 분류체계 참고, 주요 항목 우선 구현 |
| 결제/인증 미연동으로 실사용 불가 | Medium | Low | 프로토타입 단계임을 명시, 결제 흐름은 Mock UI로 구현 |
| 지도 API 없이 위치 기반 기능 제한적 | Medium | Medium | 텍스트 기반 주소 목록으로 대체, 추후 지도 API 연동 설계 반영 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure (`components/`, `lib/`, `types/`) | Static sites, portfolios, landing pages | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend, SaaS MVPs, fullstack apps | ☑ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems, complex architectures | ☐ |

> Dynamic 선택 이유: 프로토타입이지만 추후 DB, 결제, 지도 API 등 백엔드 연동이 필수이며, feature 단위 모듈화가 유지보수에 유리함.

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Frontend Framework | React (Vite) | React + Vite | 모바일 우선 SPA, 빠른 개발 환경, 추후 SSR 필요 시 프레임워크 전환 용이 |
| Language | TypeScript | TypeScript | rule.md 명시, 타입 안전성 |
| Backend | Java + Spring | Spring Boot | rule.md 명시, 추후 API 서버 역할 |
| Styling | Tailwind CSS | Tailwind CSS | 모바일 우선 반응형 구현에 적합 |
| State Management | Zustand | Zustand | 가볍고 프로토타입에 적합, 확장 용이 |
| Routing | react-router-dom | react-router-dom | SPA 클라이언트 사이드 라우팅 |
| API Client | fetch (+ react-query) | fetch + react-query | Spring API 연동 시 캐싱/상태 관리에 유리 |
| Form Handling | react-hook-form | react-hook-form | 배출 신청 폼이 복잡, 유효성 검증 필요 |

### 6.3 Clean Architecture Approach

```
Selected Level: Dynamic

Frontend (React + Vite) 폴더 구조:
src/
├── pages/                   # 페이지 컴포넌트
│   ├── HomePage.tsx         # 홈 (오프라인/온라인 선택)
│   ├── FeeCheckPage.tsx     # 수수료 조회
│   ├── offline/             # 오프라인 배출 가이드
│   │   ├── OfflinePage.tsx
│   │   ├── StickerShopsPage.tsx
│   │   └── TransportPage.tsx
│   ├── online/              # 온라인 배출 신청
│   │   ├── OnlinePage.tsx
│   │   ├── ApplyPage.tsx
│   │   ├── ReviewPage.tsx
│   │   ├── PaymentPage.tsx
│   │   └── CompletePage.tsx
│   ├── recycle/             # 역경매/재활용
│   │   ├── RecyclePage.tsx
│   │   └── RegisterPage.tsx
│   └── mypage/              # 마이페이지
│       ├── MyPage.tsx
│       └── ReceiptPage.tsx
├── router/                  # React Router 설정
│   └── index.tsx            # 라우트 정의
├── components/              # 공통 UI 컴포넌트
│   ├── ui/                  # 기본 UI (Button, Input, Card 등)
│   ├── waste/               # 폐기물 관련 (CategoryTree, SearchBar)
│   └── layout/              # 레이아웃 (Header, BottomNav, MobileContainer)
├── features/                # 도메인별 로직
│   ├── fee/                 # 수수료 조회 로직
│   ├── disposal/            # 배출 신청 로직
│   ├── recycle/             # 역경매 로직
│   └── mypage/              # 마이페이지 로직
├── services/                # API 통신 레이어
│   └── api/                 # Spring 백엔드 API 클라이언트
├── types/                   # 타입 정의
│   ├── waste.ts             # 폐기물 타입
│   ├── fee.ts               # 수수료 타입
│   └── disposal.ts          # 배출 신청 타입
├── lib/                     # 유틸리티
│   └── mock-data/           # 프로토타입용 샘플 데이터
└── stores/                  # Zustand 상태 관리
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [ ] `CLAUDE.md` has coding conventions section
- [x] `basic/rule.md` 기획 문서 존재
- [ ] ESLint configuration
- [ ] Prettier configuration
- [ ] TypeScript configuration (`tsconfig.json`)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | Missing | 컴포넌트: PascalCase, 함수: camelCase, 파일: kebab-case | High |
| **Folder structure** | Missing | Feature-based 구조 (위 6.3 참조) | High |
| **Import order** | Missing | React → 외부 라이브러리 → 내부 → types → styles | Medium |
| **Error handling** | Missing | try-catch 패턴, 사용자 친화적 에러 메시지 | Medium |
| **API 통신** | Missing | services/ 레이어 통해서만 API 호출 | High |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `VITE_API_URL` | Spring API 엔드포인트 | Client | ☐ |
| `VITE_MAP_API_KEY` | 지도 API 키 (추후) | Client | ☐ |

---

## 8. 화면 흐름 (User Flow)

### 8.1 메인 화면

```
┌─────────────────────────┐
│    대형폐기물 배출 도우미    │
│                         │
│  ┌─────────────────────┐│
│  │   수수료 조회하기     ││
│  └─────────────────────┘│
│                         │
│  ┌──────────┐ ┌────────┐│
│  │ 오프라인  │ │ 온라인  ││
│  │ 배출 안내 │ │ 배출   ││
│  └──────────┘ └────────┘│
│                         │
│  ┌──────────┐ ┌────────┐│
│  │ 운반대행  │ │ 재활용  ││
│  │          │ │ 역경매  ││
│  └──────────┘ └────────┘│
│                         │
│  ═══════════════════════│
│  🏠  📋  👤              │
│  홈  내역  마이           │
└─────────────────────────┘
```

### 8.2 주요 흐름

1. **수수료 조회**: 홈 → 지역 입력 → 폐기물 카테고리 선택(트리/검색) → 규격 선택 → 수수료 표시
2. **오프라인 배출**: 홈 → 오프라인 → 스티커 판매소 목록 / 동사무소 위치 / 배출 절차 안내
3. **온라인 배출**: 홈 → 온라인 → 지역+폐기물 입력 → 수수료 확인 → 검수 → 결제 → 배출번호 발급
4. **운반 대행**: 홈 → 운반대행 → 업체 목록 (이름, 전화번호)
5. **역경매**: 홈 → 재활용 → 사진 업로드 → 등록 → 업체/개인 열람
6. **마이페이지**: 하단탭 → 신청 내역 → 상태 확인 / 취소 / 영수증 조회

---

## 9. 구현 우선순위 (Phase)

| Phase | 기능 | 설명 |
|-------|------|------|
| **Phase 1** | 수수료 조회 | 핵심 기능. 지역 선택 + 카테고리 트리 + 수수료 표시 |
| **Phase 2** | 온라인 배출 신청 | 신청 폼 → 검수 → 결제 UI → 배출번호 발급 |
| **Phase 3** | 오프라인 안내 + 운반 대행 | 스티커 판매소, 동사무소 안내, 운반 업체 목록 |
| **Phase 4** | 마이페이지 | 신청 내역, 상태 표시, 취소/환불, 전자 영수증 |
| **Phase 5** | 역경매/재활용 | 사진 업로드, 목록, 위치 지정 UI |

---

## 10. Next Steps

1. [ ] Design 문서 작성 (`/pdca design bulk-waste-disposal`)
2. [ ] 폐기물 카테고리 및 수수료 샘플 데이터 구조 설계
3. [ ] 컴포넌트 설계 및 화면 상세 설계
4. [ ] 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-12 | Initial draft based on rule.md | User |
| 0.2 | 2026-02-12 | Frontend 기술스택 Next.js → React + Vite 변경 | User |
