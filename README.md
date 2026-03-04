# Throw It - 대형폐기물 배출 도우미

대형폐기물 수수료 조회, 온라인 배출 신청, 오프라인 배출 안내, 나눔 커뮤니티, AI 폐기물 판독, 재활용 역경매를 제공하는 모바일 우선 웹 서비스입니다.

**전국 17개 시도, 131개 시군구, 22,819건 수수료 데이터**를 기반으로 실서비스 수준의 기능을 제공합니다.

---

## 목차

- [기술 스택](#기술-스택)
- [사전 준비](#사전-준비)
- [설치 및 실행 (Quick Start)](#설치-및-실행-quick-start)
- [환경변수](#환경변수)
- [프로젝트 구조](#프로젝트-구조)
- [주요 기능](#주요-기능)
- [기능 테스트 가이드](#기능-테스트-가이드)
- [API 엔드포인트](#api-엔드포인트-34개)
- [백엔드 아키텍처](#백엔드-아키텍처)
- [빌드 및 배포](#빌드-및-배포)
- [트러블슈팅](#트러블슈팅)
- [참고 사항](#참고-사항)

---

## 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| **Backend** | Java + Spring Boot | Java 17 (toolchain), Spring Boot 3.4.5 |
| **Build (Backend)** | Gradle | 8.14 (Wrapper 포함) |
| **ORM** | Spring Data JPA + Hibernate | 6.x |
| **Database** | MySQL | 8.0 |
| **Frontend** | React + TypeScript | React 19.2.0, TS ~5.9.3 |
| **Build (Frontend)** | Vite | 7.3.1 |
| **Styling** | Tailwind CSS | 4.1.18 |
| **State** | Zustand | 5.0.11 |
| **Server State** | TanStack React Query | 5.90.21 |
| **Form** | React Hook Form | 7.71.1 |
| **Routing** | React Router DOM | 7.13.0 |
| **Map** | Kakao Maps SDK | Latest |
| **AI Server** | Python Flask + YOLOv8 | Flask 3.1.0, Ultralytics 8.4+ |
| **AI Framework** | PyTorch + YOLO v8n | - |

---

## 개발 환경 (테스트 검증 완료)

아래는 실제 개발 및 테스트에 사용한 정확한 환경입니다. **동일한 환경에서 테스트하면 문제없이 동작합니다.**

| 도구 | 검증 완료 버전 | 확인 명령어 |
|------|---------------|-------------|
| **OS** | Windows 10/11 (64bit) | - |
| **Node.js** | v22.18.0 | `node -v` |
| **npm** | 10.9.3 | `npm -v` |
| **Java (JDK)** | OpenJDK 24.0.2 | `java -version` |
| **MySQL** | 8.0.43 | `mysql --version` |
| **Python** | 3.13.7 (AI 서버용, 선택) | `python --version` |
| **Git** | 2.45.1 | `git --version` |
| **Gradle** | 8.14 (Wrapper 포함, 별도 설치 불필요) | - |

### 최소 요구 버전

| 도구 | 최소 버전 | 용도 |
|------|-----------|------|
| Node.js | 18+ | 프론트엔드 |
| npm | 9+ | 프론트엔드 패키지 관리 |
| Java (JDK) | 17+ | 백엔드 (build.gradle.kts에서 toolchain 17 지정) |
| MySQL | 8.0+ | 데이터베이스 |
| Python | 3.9+ | AI 서버 (선택) |
| Git | 2.x | 형상관리 |

> **Gradle은 별도 설치 불필요**합니다. 프로젝트에 포함된 Gradle Wrapper(`gradlew.bat`)가 자동으로 8.14 버전을 다운로드합니다.
>
> **AI 서버는 선택사항**입니다. AI 폐기물 판독 기능을 사용하지 않으려면 Python 설치를 건너뛸 수 있습니다.

---

## 설치 및 실행 (Quick Start)

> 아래 가이드는 **Windows 환경** 기준입니다. Mac/Linux 사용자는 `gradlew.bat` → `./gradlew`, `copy` → `cp`로 대체하세요.

### 1. 프로젝트 클론

```bash
git clone https://github.com/csj200111/throw_it.git
cd throw_it
```

### 2. MySQL 데이터베이스 설정

MySQL이 설치되어 있어야 합니다. ([MySQL 8.0 다운로드](https://dev.mysql.com/downloads/mysql/))

```sql
-- MySQL 접속 후 실행 (cmd 또는 MySQL Workbench)
mysql -u root -p

CREATE DATABASE waste_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

공공데이터 초기화 (테이블 생성 및 데이터 로드):

```bash
# 반드시 아래 순서대로 실행
# Git Bash 또는 cmd에서 프로젝트 루트 디렉토리에서 실행

# Windows (cmd / PowerShell)
mysql -u root -p waste_db < backend/src/main/resources/sql/schema.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/large_waste_fee_data.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/waste_facility_data.sql
```

> **실행 순서 중요**: `schema.sql` → `large_waste_fee_data.sql` → `waste_facility_data.sql`
>
> PowerShell에서 `<` 리다이렉션이 안 되면 cmd로 전환하거나 Git Bash를 사용하세요.

### 3. 백엔드 실행

`backend/src/main/resources/application-local.yml` 파일을 **새로 생성**하고 본인의 MySQL 계정 정보를 입력합니다:

```yaml
spring:
  datasource:
    username: root
    password: 본인_MySQL_비밀번호
```

> 이 파일은 `.gitignore`에 등록되어 있어 Git에 올라가지 않습니다.

```bash
# 프로젝트 루트에서 실행
cd backend

# Windows (cmd / PowerShell / Git Bash 모두 가능)
gradlew.bat bootRun

# Mac / Linux
./gradlew bootRun
```

백엔드 서버: `http://localhost:8080`

> **정상 실행 확인**: 브라우저에서 `http://localhost:8080/api/regions/sido` 접속 시 시도 목록 JSON 응답
>
> 첫 실행 시 Gradle이 자동으로 필요한 의존성을 다운로드합니다 (약 2-5분 소요).

### 4. 프론트엔드 실행

```bash
# 프로젝트 루트에서 실행 (백엔드와 별도 터미널)
cd frontend

# .env 파일 생성
copy .env.example .env         # Windows cmd
# cp .env.example .env         # Git Bash / Mac / Linux

# .env 파일을 열어 VITE_MAP_API_KEY에 카카오맵 API 키를 입력
# (카카오맵 키가 없으면 비워두어도 됨 - Placeholder 지도로 대체됨)

npm install
npm run dev
```

프론트엔드: `https://localhost:5173` (HTTPS)

> **HTTPS 인증서 경고**: 자체 서명 SSL 인증서를 사용하므로 브라우저에서 경고가 표시됩니다.
> Chrome: "고급" → "localhost(안전하지 않음)으로 이동" 클릭
>
> **모바일 뷰 권장**: 모바일 UI 기준이므로 브라우저 개발자 도구(F12)에서 **모바일 뷰(428px 이하)**로 전환하면 최적화된 화면을 볼 수 있습니다.

### 5. AI 서버 실행 (선택)

AI 폐기물 판독 기능을 사용하려면 아래 추가 설정이 필요합니다.

```bash
# 프로젝트 루트에서 실행 (백엔드/프론트와 별도 터미널)
cd ai-server

# 가상환경 생성 (권장)
python -m venv venv

# 가상환경 활성화
venv\Scripts\activate           # Windows cmd
# source venv/bin/activate      # Git Bash / Mac / Linux

# 의존성 설치
pip install -r requirements.txt

# YOLO 모델 파일 준비
# model/ 디렉토리에 best.pt 파일이 필요합니다
# (팀 공유 드라이브 또는 담당자에게 요청)
mkdir model
# model/best.pt 파일 배치

# 서버 실행
python app.py
```

AI 서버: `http://localhost:5000`

> **정상 실행 확인**: `http://localhost:5000/health` 접속 시 `{"status": "healthy", ...}` 응답
>
> **참고**: AI 모델 파일(`*.pt`)은 용량 문제로 Git에 포함되지 않습니다. `ai-server/model/best.pt` 파일을 별도로 준비해야 합니다. AI 서버 없이도 나머지 모든 기능은 정상 작동합니다.

### 실행 요약 (총 3개 터미널)

| 터미널 | 디렉토리 | 명령어 | 주소 |
|--------|----------|--------|------|
| 1 (백엔드) | `backend/` | `gradlew.bat bootRun` | http://localhost:8080 |
| 2 (프론트) | `frontend/` | `npm run dev` | https://localhost:5173 |
| 3 (AI, 선택) | `ai-server/` | `python app.py` | http://localhost:5000 |

---

## 환경변수

### Backend (`backend/src/main/resources/application-local.yml`)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `spring.datasource.username` | root | MySQL 사용자명 |
| `spring.datasource.password` | (없음) | MySQL 비밀번호 |

### Frontend (`frontend/.env`)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | 백엔드 API 서버 주소 |
| `VITE_MAP_API_KEY` | (없음) | 카카오맵 JavaScript API 키 |

> 카카오맵 API 키 발급: [Kakao Developers](https://developers.kakao.com/) → 애플리케이션 추가 → JavaScript 키 복사

### Backend 기본 설정 (`application.yml`)

| 항목 | 값 | 설명 |
|------|-----|------|
| 서버 포트 | 8080 | Spring Boot 서버 |
| DB URL | `jdbc:mysql://localhost:3306/waste_db` | MySQL 연결 |
| JPA ddl-auto | update | 엔티티 기반 테이블 자동 업데이트 |
| AI 서버 URL | `http://localhost:5000` | Flask AI 서버 |
| 파일 업로드 제한 | 50MB | multipart 최대 크기 |

---

## 프로젝트 구조

```
throw_it/
├── frontend/                      # 프론트엔드 (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/            # 공통 UI 컴포넌트
│   │   │   ├── layout/            # Header, BottomNav, MobileContainer, ProgressBar
│   │   │   ├── ui/                # Button, Card, Input, Modal, DatePicker, Select, Badge, SearchBar
│   │   │   ├── waste/             # CategoryTree, WasteItemCard, WasteSearchBar, SizeSelector, FeeResultCard
│   │   │   ├── map/               # MapView, MapPlaceholder, LocationCard, MapAdapter
│   │   │   └── sharing/           # SharingPostCard, ChatBubble, PhotoUploader
│   │   ├── features/              # 기능별 컴포넌트 및 훅
│   │   │   ├── auth/              # AuthContext (로그인/회원가입 상태)
│   │   │   ├── disposal/          # DisposalForm, ReviewSummary, PaymentForm, DisposalNumber
│   │   │   ├── fee/               # useFeeCheck
│   │   │   ├── mypage/            # ApplicationList, ApplicationCard, ReceiptView
│   │   │   └── recycle/           # RecycleRegisterForm, RecycleItemCard, PhotoUploader
│   │   ├── pages/                 # 페이지 컴포넌트 (47개)
│   │   │   ├── auth/              # 로그인, 회원가입
│   │   │   ├── onboarding/        # 온보딩 (첫 접속 시 지역 설정)
│   │   │   ├── location/          # 자동/수동 위치 설정
│   │   │   ├── fee-check/         # 수수료 조회 (검색, 확인, 결과)
│   │   │   ├── online/            # 온라인 배출 (신청, 검수, 결제, 완료)
│   │   │   ├── offline/           # 오프라인 안내 (판매소, 주민센터, 처리시설, 지도검색)
│   │   │   ├── sharing/           # 나눔 커뮤니티 (목록, 상세, 등록, 수정, 채팅)
│   │   │   ├── recycle/           # 재활용 역경매 (목록, 등록)
│   │   │   ├── ai/                # AI 판독 (선택, 카메라, 갤러리, 결과)
│   │   │   ├── mypage/            # 마이페이지 (신청내역, 영수증, 나눔이력, 결제수단, 프로필)
│   │   │   ├── notifications/     # 알림
│   │   │   ├── guide/             # 이용 가이드
│   │   │   └── free-collection/   # 무료 수거
│   │   ├── services/              # API 서비스 레이어 (11개)
│   │   ├── stores/                # 상태 관리 - Zustand
│   │   ├── lib/                   # 유틸리티 (apiClient, MapAdapter)
│   │   ├── types/                 # TypeScript 타입 정의
│   │   ├── router/                # 라우터 설정
│   │   ├── App.tsx                # 루트 컴포넌트 (인증/온보딩 가드)
│   │   └── main.tsx               # 엔트리 포인트
│   ├── .env.example               # 환경변수 템플릿
│   ├── package.json               # 프론트엔드 의존성
│   ├── vite.config.ts             # Vite 설정 (프록시, SSL, path alias)
│   └── tsconfig.json              # TypeScript 설정
│
├── backend/                       # 백엔드 (Spring Boot 3.4.5 + Java 17 toolchain)
│   ├── src/main/java/com/throwit/
│   │   ├── domain/
│   │   │   ├── user/              # 사용자 인증 (회원가입/로그인)
│   │   │   ├── fee/               # 수수료/지역/폐기물 조회 (핵심)
│   │   │   ├── disposal/          # 온라인 배출 신청/결제
│   │   │   ├── recycle/           # 재활용 역경매
│   │   │   ├── offline/           # 오프라인 시설 (판매소/주민센터/처리시설)
│   │   │   ├── sharing/           # 나눔 커뮤니티 게시글
│   │   │   │   └── chat/          # 나눔 채팅 메시지
│   │   │   ├── notification/      # 사용자 알림
│   │   │   └── ai/                # AI 폐기물 판독 (Flask 프록시)
│   │   └── global/
│   │       ├── config/            # CORS 설정
│   │       └── exception/         # 전역 예외 처리
│   ├── src/main/resources/
│   │   ├── application.yml        # 메인 설정
│   │   ├── application-local.yml  # 로컬 DB 설정 (직접 생성, Git 미포함)
│   │   └── sql/                   # DB 초기화 스크립트 (3개)
│   ├── build.gradle.kts           # Gradle 빌드 설정
│   └── gradlew / gradlew.bat      # Gradle Wrapper (Mac·Linux / Windows)
│
├── ai-server/                     # AI 서버 (Python Flask + YOLOv8)
│   ├── app.py                     # Flask 서버 (/predict, /health)
│   ├── train.py                   # YOLO 모델 학습 스크립트
│   ├── requirements.txt           # Python 의존성
│   ├── model/                     # YOLO 모델 가중치 (Git 미포함)
│   └── dataset/                   # 학습 데이터셋 (Git 미포함)
│
├── docs/                          # 설계 문서
│   ├── 01-plan/                   # 기획서
│   ├── 02-design/                 # 설계서
│   ├── 03-analysis/               # 분석서
│   └── 04-report/                 # 보고서
│
├── basic/                         # 프로젝트 기획 및 개발 룰
│   └── rule.md
│
└── .gitignore                     # Git 제외 파일 목록
```

---

## 주요 기능

| # | 기능 | 설명 | 인증 필요 |
|---|------|------|:---------:|
| 1 | 수수료 조회 | 시도/시군구 + 카테고리 + 폐기물 + 규격 기반 수수료 조회 (DB 실연동) | - |
| 2 | 오프라인 배출 안내 | 스티커 판매소 / 주민센터 (카카오맵 연동) / 폐기물 처리 시설 | - |
| 3 | 온라인 배출 신청 | 신청서 작성 → 검수 → 결제(UI) → 배출번호 발급 | Yes |
| 4 | 재활용 역경매 | 물품 사진 업로드 + 등록/관리/삭제 | Yes |
| 5 | 나눔 커뮤니티 | 무료 나눔 게시글 CRUD + 1:1 채팅 | Yes |
| 6 | AI 폐기물 판독 | 카메라/갤러리 이미지 → YOLO 기반 폐기물 종류 자동 인식 | - |
| 7 | 알림 | 배출 상태 변경, 나눔 채팅 수신 등 실시간 알림 | Yes |
| 8 | 마이페이지 | 신청 내역, 취소/환불, 전자 영수증, 나눔 이력, 결제수단 관리 | Yes |
| 9 | 사용자 인증 | 이메일/비밀번호 회원가입 및 로그인 (솔트 기반 해싱) | - |

---

## 기능 테스트 가이드

### 온보딩 (첫 접속)

- URL: `/onboarding`
- 첫 접속 시 지역(시도/시군구) 설정 화면 자동 표시
- 자동 위치(`/location/auto`) 또는 수동 선택(`/location/manual`) 가능

### 홈 화면

- URL: `/`
- 수수료 조회, 오프라인 배출, 온라인 배출, 나눔 커뮤니티, AI 판독, 재활용 역경매 메뉴

### 수수료 조회

- `/fee-check` → 시도/시군구 선택 → 카테고리 필터 → 폐기물 검색
- `/fee-check/search` → 폐기물 항목 검색 결과
- `/fee-check/confirm` → 항목 확인
- `/fee-check/result` → 규격별 수수료 결과

### 오프라인 배출 안내

| 기능 | URL | 설명 |
|------|-----|------|
| 오프라인 메인 | `/offline` | 3개 메뉴 카드 (판매소/주민센터/처리시설) |
| 스티커 판매소 | `/offline/sticker-shops` | 시군구 선택 + 카카오맵 + 판매소 목록 |
| 주민센터 | `/offline/centers` | 시군구 선택 + 카카오맵 + 주민센터 목록 |
| 폐기물 처리 시설 | `/offline/transport` | 시도/시군구 선택 + 처리 시설 DB 조회 |
| 지도 검색 | `/offline/map-search` | 통합 지도 검색 |

### 온라인 배출 신청

1. `/online` → 4단계 프로세스 안내
2. `/online/apply` → 배출 신청서 작성 (지역 + 폐기물 + 주소 + 날짜)
3. `/online/review` → 입력 정보 검수
4. `/online/payment` → 수수료 결제 (카드/계좌이체 UI)
5. `/online/complete` → 배출 번호 발급 + 영수증 링크

### 나눔 커뮤니티

| 기능 | URL | 설명 |
|------|-----|------|
| 나눔 목록 | `/sharing` | 나눔 게시글 목록 |
| 나눔 상세 | `/sharing/:id` | 게시글 상세 + 채팅 시작 |
| 나눔 등록 | `/sharing/register` | 게시글 등록 (사진 업로드) |
| 나눔 수정 | `/sharing/:id/edit` | 게시글 수정 |
| 채팅 목록 | `/sharing/:id/chats` | 게시글별 채팅 목록 |
| 1:1 채팅 | `/sharing/:id/chat/:roomId` | 실시간 채팅 |

### AI 폐기물 판독

| 기능 | URL | 설명 |
|------|-----|------|
| AI 메인 | `/ai-predict` | AI 판독 소개 |
| 방식 선택 | `/ai/select` | 카메라 / 갤러리 선택 |
| 카메라 촬영 | `/ai/camera` | 실시간 카메라 촬영 |
| 갤러리 업로드 | `/ai/gallery` | 기존 사진 업로드 |
| 판독 결과 | `/ai/result` | YOLO 분석 결과 (폐기물 종류 + 신뢰도) |

### 인증

| 기능 | URL | 설명 |
|------|-----|------|
| 로그인 | `/login` | 이메일/비밀번호 로그인 |
| 회원가입 | `/signup` | 이메일/비밀번호/닉네임 가입 |

### 마이페이지

| 기능 | URL | 설명 |
|------|-----|------|
| 마이페이지 메인 | `/mypage` | 메뉴 목록 |
| 배출 신청 내역 | `/mypage/disposals` | 신청 목록 |
| 배출 상세 | `/mypage/disposals/:id` | 신청 상세 + 취소 |
| 전자 영수증 | `/mypage/receipt/:id` | 배출 확인증 |
| 나눔 이력 | `/mypage/sharing-history` | 내 나눔 활동 |
| 구매 이력 | `/mypage/purchase-history` | 구매 내역 |
| 결제수단 관리 | `/mypage/payment-methods` | 카드/계좌 관리 |
| 결제수단 추가 | `/mypage/payment-methods/add` | 새 결제수단 등록 |
| 프로필 수정 | `/mypage/profile` | 닉네임 등 수정 |
| 스크랩 | `/mypage/scraps` | 스크랩한 게시글 |
| 설정 | `/mypage/settings` | 앱 설정 |

### 알림

- URL: `/notifications` → 알림 목록 + 읽음 처리

### 이용 가이드

- URL: `/guide` → 서비스 이용 방법 안내

---

## API 엔드포인트 (34개)

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

### 나눔 커뮤니티 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/sharing` | 나눔 게시글 목록 |
| GET | `/api/sharing/{id}` | 게시글 상세 |
| POST | `/api/sharing` | 게시글 등록 |
| PUT | `/api/sharing/{id}` | 게시글 수정 |
| DELETE | `/api/sharing/{id}` | 게시글 삭제 |

### 채팅 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/sharing/{postId}/chat/rooms` | 채팅방 목록 |
| POST | `/api/sharing/{postId}/chat/rooms` | 채팅방 생성 |
| GET | `/api/sharing/{postId}/chat/rooms/{roomId}/messages` | 메시지 목록 |
| POST | `/api/sharing/{postId}/chat/rooms/{roomId}/messages` | 메시지 전송 |
| PATCH | `/api/sharing/{postId}/chat/rooms/{roomId}/read` | 메시지 읽음 처리 |

### 알림 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/notifications` | 알림 목록 (X-User-Id 헤더) |
| GET | `/api/notifications/unread-count` | 읽지 않은 알림 수 |
| PATCH | `/api/notifications/{id}/read` | 알림 읽음 처리 |
| PATCH | `/api/notifications/read-all` | 전체 읽음 처리 |

### AI 판독 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/ai/predict` | 이미지 기반 폐기물 판독 (multipart/form-data) |

---

## 백엔드 아키텍처

### 도메인 구조 (8개 도메인)

| 도메인 | Controller | Service | Entity | 주요 DTO |
|--------|-----------|---------|--------|----------|
| user | AuthController | AuthService | User | LoginRequest, SignupRequest, UserResponse |
| fee | LargeWasteFeeController | LargeWasteFeeService | LargeWasteFee | FeeInfoDto, WasteItemResult |
| disposal | DisposalController | DisposalService | DisposalApplication, DisposalItem | DisposalCreateRequest, DisposalResponse |
| recycle | RecycleController | RecycleService | RecycleItem | RecycleCreateRequest, RecycleItemResponse |
| offline | OfflineController | OfflineService | WasteFacility | StickerShopResponse, CommunityCenterResponse |
| sharing | SharingPostController | SharingPostService | SharingPost | SharingPostRequest, SharingPostResponse |
| sharing.chat | ChatMessageController | ChatMessageService | ChatRoom, ChatMessage | ChatRoomResponse, ChatMessageResponse |
| notification | NotificationController | NotificationService | Notification | NotificationResponse |
| ai | AiPredictionController | - | - | (Flask 서버 프록시) |

### 데이터베이스 (9+ 테이블)

| 테이블 | 건수 | 설명 |
|--------|------|------|
| large_waste_fee | 22,819 | 전국 대형폐기물 수수료 (공공데이터) |
| waste_facility | - | 폐기물 처리 시설 (공공데이터) |
| users | - | 사용자 계정 (솔트 기반 비밀번호 해싱) |
| disposal_applications | - | 배출 신청 |
| disposal_items | - | 배출 품목 (신청 1:N 품목) |
| recycle_items | - | 역경매 물품 |
| sharing_posts | - | 나눔 게시글 |
| chat_rooms | - | 채팅방 |
| chat_messages | - | 채팅 메시지 |
| notifications | - | 사용자 알림 |

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

> **참고**: Vite 개발 서버가 프록시(`/api` → `http://localhost:8080`)를 사용하므로 개발 환경에서는 CORS 이슈가 발생하지 않습니다.

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
| sharingService.ts | SharingPostController | 연동 완료 |
| chatService.ts | ChatMessageController | 연동 완료 |
| notificationService.ts | NotificationController | 연동 완료 |
| aiService.ts | AiPredictionController | 연동 완료 |

---

## 빌드 및 배포

### 프론트엔드

```bash
cd frontend

# 프로덕션 빌드
npm run build        # 결과: frontend/dist/

# 빌드 미리보기
npm run preview

# 린트 검사
npm run lint
```

### 백엔드

```bash
cd backend

# Mac / Linux
./gradlew build

# Windows
gradlew.bat build

# 실행 가능한 JAR 생성
# 결과: backend/build/libs/throwit-*.jar
```

---

## 트러블슈팅

### MySQL 연결 실패

```
Communications link failure
```

- MySQL 서비스가 실행 중인지 확인: `mysql -u root -p` 로 접속 테스트
- `waste_db` 데이터베이스가 생성되어 있는지 확인
- `application-local.yml`의 username/password가 올바른지 확인

### Gradle 빌드 오류 (Windows)

```
'./gradlew' is not recognized
```

- Windows cmd/PowerShell에서는 `./gradlew` 대신 `gradlew.bat` 사용
- PowerShell에서는 `.\gradlew.bat bootRun`
- Git Bash에서는 `./gradlew bootRun` 사용 가능

### Java 버전 관련

```
Unsupported class file major version
```

- JDK 17 이상이 설치되어 있는지 확인
- `build.gradle.kts`에서 `JavaLanguageVersion.of(17)` 지정 → JDK 17 이상이면 자동 호환
- 개발 환경에서는 JDK 24도 정상 동작 확인됨

### 프론트엔드 HTTPS 인증서 경고

- Vite 개발 서버가 자체 서명 SSL 인증서를 사용합니다
- 브라우저에서 "고급" → "안전하지 않은 사이트로 이동" 클릭
- 또는 `vite.config.ts`에서 `basicSsl()` 플러그인을 제거하면 HTTP로 실행

### 카카오맵이 표시되지 않음

- `.env` 파일에 `VITE_MAP_API_KEY`가 설정되어 있는지 확인
- 카카오 개발자 콘솔에서 해당 키의 플랫폼에 `localhost` 도메인이 등록되어 있는지 확인
- API 키 미설정 시 Placeholder 지도가 대신 표시됩니다 (정상 동작)

### AI 서버 모델 파일 누락

```
FileNotFoundError: model/best.pt
```

- `ai-server/model/` 디렉토리에 `best.pt` 파일이 있어야 합니다
- 모델 파일은 Git에 포함되지 않으므로 별도로 준비 필요
- AI 기능 없이도 나머지 기능은 정상 작동합니다

### npm install 시 Python/node-gyp 에러

- Python 3.x가 설치되어 있는지 확인 (일부 native 모듈 빌드에 필요할 수 있음)
- 현재 프로젝트는 native 모듈 의존성이 없으므로 일반적으로 발생하지 않음

### PowerShell에서 SQL 파일 Import 실패

```
The '<' operator is reserved for future use.
```

- PowerShell은 `<` 리다이렉션을 지원하지 않음
- **해결**: cmd로 전환하거나 Git Bash에서 실행
  ```bash
  # cmd에서 실행
  cmd
  mysql -u root -p waste_db < backend/src/main/resources/sql/schema.sql
  ```

### 백엔드 포트 충돌

```
Port 8080 already in use
```

- 기존에 8080 포트를 사용 중인 프로세스 종료
- Mac/Linux: `lsof -i :8080` → `kill -9 <PID>`
- Windows: `netstat -ano | findstr :8080` → `taskkill /PID <PID> /F`

---

## 참고 사항

- 모바일 UI 기준 설계 (428px max-width, 반응형 대응)
- 브라우저 개발자 도구(F12)에서 모바일 뷰로 전환하여 테스트
- 결제는 UI만 구현 (PG 실연동 제외)
- 인증은 이메일/비밀번호 기반 (X-User-Id 헤더 사용, 소유자 권한 검증 적용)
- 카카오맵은 `VITE_MAP_API_KEY` 설정 시 활성화, 미설정 시 Placeholder 표시
- AI 서버는 독립 실행 (미실행 시 AI 판독 기능만 비활성화)
- Vite 개발 서버는 `/api` 요청을 백엔드(8080)로 프록시하므로 CORS 설정 없이 동작

---

## 보안 적용 현황

| 항목 | 상태 | 설명 |
|------|:----:|------|
| 인증 필수화 | 적용 | `defaultValue="anonymous"` 제거, X-User-Id 헤더 필수 |
| 소유자 권한 검증 | 적용 | 수정/삭제/취소/결제 시 본인 확인 (BusinessException) |
| 에러 핸들링 | 적용 | GlobalExceptionHandler + BusinessException 통일 |
| Enum 안전 변환 | 적용 | try-catch로 잘못된 값 처리 |
| @Transactional | 적용 | @Modifying 쿼리에 명시적 트랜잭션 |

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
