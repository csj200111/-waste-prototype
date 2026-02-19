# Throw It - 대형폐기물 배출 도우미 테스트 튜토리얼

대형폐기물 수수료 조회부터 배출 신청까지 한번에 처리할 수 있는 모바일 웹 프로토타입입니다.

---

## 1. 사전 준비

아래 도구가 설치되어 있어야 합니다.

| 도구 | 최소 버전 | 확인 명령어 |
|------|-----------|-------------|
| Node.js | 18 이상 | `node -v` |
| npm | 9 이상 | `npm -v` |
| Java (JDK) | 17 이상 | `java -version` |
| MySQL | 8 이상 | `mysql --version` |
| Git | - | `git --version` |

---

## 2. 프로젝트 클론 및 설치

```bash
# 저장소 클론
git clone <저장소 URL>
cd throw_it

# 프론트엔드 의존성 설치
cd frontend
npm install
```

---

## 3. 백엔드 설정

### 3-1. MySQL 데이터베이스 생성

MySQL에 접속하여 데이터베이스를 생성합니다.

```sql
CREATE DATABASE waste_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3-2. application-local.yml 생성

`backend/src/main/resources/application-local.yml` 파일을 직접 생성하고, 본인의 MySQL 계정 정보를 입력합니다.

```yaml
spring:
  datasource:
    username: root
    password: 본인_MySQL_비밀번호
```

> 이 파일은 `.gitignore`에 등록되어 있어 Git에 올라가지 않습니다. 절대 비밀번호를 커밋하지 마세요.

### 3-3. 백엔드 서버 실행

```bash
# backend 폴더에서 실행
cd backend
./gradlew bootRun
```

서버가 정상 실행되면 `http://localhost:8080`에서 API를 사용할 수 있습니다.

---

## 4. 프론트엔드 개발 서버 실행

```bash
# frontend 폴더 안에서 실행
npm run dev
```

터미널에 표시되는 URL(기본: `http://localhost:5173`)을 브라우저에서 열면 됩니다.

> 모바일 UI 기준으로 만들어져 있으므로, 브라우저 개발자 도구(F12)에서 **모바일 뷰(반응형 디자인 모드)** 로 전환하면 더 잘 보입니다.

---

## 5. 주요 기능 테스트 가이드

현재 Mock 데이터 기반의 프로토타입이므로 별도의 백엔드 서버 없이 모든 기능을 테스트할 수 있습니다.

### 5-1. 홈 화면

- URL: `/`
- 수수료 조회, 오프라인 배출, 온라인 배출, 운반 대행, 재활용 역경매 메뉴가 표시됩니다.
- 각 카드를 클릭하여 해당 기능 페이지로 이동합니다.

### 5-2. 수수료 조회

- URL: `/fee-check`
- **테스트 순서:**
  1. 지역(구/동)을 선택합니다.
  2. 폐기물 카테고리를 선택합니다 (예: 가구 > 책상).
  3. 규격(크기)을 선택합니다.
  4. 해당 폐기물의 수수료가 표시되는지 확인합니다.

### 5-3. 오프라인 배출 안내

- URL: `/offline`
- 세 가지 하위 기능을 테스트할 수 있습니다:

| 기능 | URL | 설명 |
|------|-----|------|
| 스티커 판매소 | `/offline/sticker-shops` | 근처 스티커 판매 매장 목록 |
| 주민센터/동사무소 | `/offline/centers` | 직접 방문 신청 가능한 시설 |
| 운반 대행 업체 | `/offline/transport` | 대형폐기물 운반 대행 업체 연락처 |

### 5-4. 온라인 배출 신청

- URL: `/online`
- **테스트 순서:**
  1. `/online/apply` - 배출 신청서 작성 (지역, 품목, 규격, 수량, 배출 희망일 입력)
  2. `/online/review` - 입력한 정보 검수 및 확인
  3. `/online/payment` - 수수료 결제 (Mock 결제)
  4. `/online/complete` - 배출 번호 발급 확인

### 5-5. 마이페이지

- URL: `/mypage`
- 신청 내역 목록을 확인합니다.
- 각 신청 건을 클릭하면 배출 확인증(영수증)을 조회할 수 있습니다.
  - URL: `/mypage/receipt/:id`

### 5-6. 재활용 역경매

- URL: `/recycle`
- 대형폐기물 사진을 등록하여 필요한 사람/업체가 가져갈 수 있도록 하는 기능입니다.
- `/recycle/register` 에서 물품 등록 폼을 테스트합니다.

---

## 6. 빌드 테스트

프로덕션 빌드가 정상적으로 되는지 확인합니다.

```bash
# frontend 폴더에서 실행
npm run build
```

빌드 결과물은 `frontend/dist` 폴더에 생성됩니다.

빌드된 결과물을 로컬에서 미리보기:

```bash
npm run preview
```

---

## 7. 린트 검사

코드 품질 검사를 실행합니다.

```bash
npm run lint
```

---

## 8. 프로젝트 구조

```
throw_it/
├── basic/                  # 프로젝트 기획 및 개발 룰
│   └── rule.md
├── backend/                # 백엔드 (Spring Boot + Java)
│   └── src/main/resources/
│       ├── application.yml          # 공통 설정
│       └── application-local.yml    # 로컬 DB 설정 (직접 생성, Git 미포함)
├── docs/                   # 설계 문서
├── frontend/               # 프론트엔드 (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/     # 공통 UI 컴포넌트 (Button, Card, Input 등)
│   │   ├── features/       # 기능별 컴포넌트 및 훅
│   │   │   ├── disposal/   # 배출 신청 관련
│   │   │   ├── fee/        # 수수료 조회 관련
│   │   │   ├── mypage/     # 마이페이지 관련
│   │   │   └── recycle/    # 재활용 역경매 관련
│   │   ├── lib/mock-data/  # Mock 데이터 (JSON)
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── router/         # 라우터 설정
│   │   ├── services/       # 서비스 레이어 (데이터 처리)
│   │   ├── stores/         # 상태 관리 (Zustand)
│   │   └── types/          # TypeScript 타입 정의
│   └── package.json
└── TUTORIAL.md             # 이 문서
```

---

## 9. 기술 스택

| 구분 | 기술 |
|------|------|
| 백엔드 프레임워크 | Spring Boot + Java 17 |
| 데이터베이스 | MySQL 8 |
| ORM | JPA / Hibernate |
| 프론트엔드 프레임워크 | React 19 + TypeScript |
| 빌드 도구 | Vite 7 |
| 스타일링 | Tailwind CSS 4 |
| 상태 관리 | Zustand |
| 서버 상태 | TanStack React Query |
| 폼 관리 | React Hook Form |
| 라우팅 | React Router DOM 7 |

---

## 10. 참고 사항

- 현재 **프로토타입** 단계로, 모든 데이터는 `frontend/src/lib/mock-data/` 의 JSON 파일을 사용합니다.
- 실제 결제, 본인 인증, 지도 API 등은 아직 연동되어 있지 않습니다.
- 모바일 UI 기준으로 설계되었으므로 화면 너비 390px~430px에서 최적화되어 있습니다.
