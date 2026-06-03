<p align="center">
  <img src="screen%20images/UI.png" width="180" alt="얼마게 아이콘"/>
</p>

<br/>

<h1 align="center">얼마게 (Throw It)</h1>
<p align="center">대형폐기물 처리의 모든 과정을 하나의 앱에서</p>

<p align="center"><b>작성자: 20231395 최세진</b></p>

<br/>

> 대형폐기물 수수료 조회, 온라인/오프라인 배출 신청, AI 폐기물 판독, 나눔 커뮤니티를 제공하는 **모바일 우선 웹 서비스**  
> 전국 **17개 시도 · 131개 시군구 · 22,819건** 수수료 데이터 기반

---

## 목차

1. [프로젝트 소개](#1-프로젝트-소개)
2. [주요 기능](#2-주요-기능)
   - [수수료 조회](#21-수수료-조회)
   - [온라인 배출 신청](#22-온라인-배출-신청)
   - [오프라인 배출 안내](#23-오프라인-배출-안내)
   - [AI 폐기물 판독](#24-ai-폐기물-판독)
   - [나눔 커뮤니티](#25-나눔-커뮤니티)
   - [마이페이지](#26-마이페이지)
3. [기술 스택](#3-기술-스택)
4. [AI 이중 판독 구조](#4-ai-이중-판독-구조)
5. [프로젝트 구조](#5-프로젝트-구조)
6. [개발 환경 설정](#6-개발-환경-설정)
7. [API 명세](#7-api-명세)

---

## 1. 프로젝트 소개

대형폐기물 배출은 지자체마다 수수료·신청 방식이 달라 일반 사용자가 직접 찾기 어렵습니다.  
**얼마게**는 이 과정 전체를 단일 앱에서 해결할 수 있도록 만든 모바일 웹 서비스입니다.

| 구분 | 내용 |
|------|------|
| 서비스 형태 | 모바일 우선 웹 앱 (PWA 미적용) |
| 대상 사용자 | 대형폐기물 배출이 필요한 전국 시민 |
| 핵심 데이터 | 22,819건 전국 수수료 DB |
| 인증 방식 | 커스텀 JWT (`X-User-Id` 헤더) |

### 로그인

<p align="center">
  <img src="screen%20images/로그인%20화면.png" width="280" alt="로그인 화면"/>
</p>

---

## 2. 주요 기능

### 2.1 수수료 조회

시도 → 시군구 → 품목 → 규격 순서로 선택하면 해당 지역의 정확한 수수료를 즉시 확인할 수 있습니다.  
키워드 검색으로 품목명을 직접 입력하는 것도 가능합니다.

<table>
  <tr>
    <td align="center">
      <img src="screen%20images/수수료_조회-수수료%20조회.png" width="200" alt="지역 선택"/>
      <br/><sub>지역 선택</sub>
    </td>
    <td align="center">
      <img src="screen%20images/수수료_조회-수수료%20조회%20품목%20목록.png" width="200" alt="품목 목록"/>
      <br/><sub>품목 목록</sub>
    </td>
    <td align="center">
      <img src="screen%20images/수수료_조회-수수료%20조회%20규격%20선택.png" width="200" alt="규격 선택"/>
      <br/><sub>규격 선택</sub>
    </td>
    <td align="center">
      <img src="screen%20images/수수료_조회-수수료%20계산%20결과.png" width="200" alt="계산 결과"/>
      <br/><sub>수수료 확인</sub>
    </td>
  </tr>
</table>

---

### 2.2 온라인 배출 신청

로그인 후 품목·수량·배출 날짜를 선택하고 온라인으로 신청합니다.  
신청 완료 시 고유 배출번호가 발급되며, 이후 배출 내역에서 진행 상태를 확인할 수 있습니다.

<table>
  <tr>
    <td align="center">
      <img src="screen%20images/온라인_배출_신청-온라인%20신고.png" width="190" alt="신청 홈"/>
      <br/><sub>신청 홈</sub>
    </td>
    <td align="center">
      <img src="screen%20images/온라인_배출_신청-온라인%20신고%20품목%20검색.png" width="190" alt="품목 검색"/>
      <br/><sub>품목 검색</sub>
    </td>
    <td align="center">
      <img src="screen%20images/온라인_배출_신청-온라인%20신고%20결제.png" width="190" alt="결제"/>
      <br/><sub>결제</sub>
    </td>
    <td align="center">
      <img src="screen%20images/온라인_배출_신청-온라인%20신고%20결재%20완료.png" width="190" alt="신청 완료"/>
      <br/><sub>신청 완료</sub>
    </td>
    <td align="center">
      <img src="screen%20images/온라인_배출_신청-온라인%20신고%20배출%20내역.png" width="190" alt="배출 내역"/>
      <br/><sub>배출 내역</sub>
    </td>
  </tr>
</table>

---

### 2.3 오프라인 배출 안내

스티커 구매가 필요한 오프라인 배출 방식을 안내합니다.  
현재 위치를 기반으로 주변 스티커 판매소·주민센터를 카카오맵에서 바로 확인할 수 있습니다.

<table>
  <tr>
    <td align="center">
      <img src="screen%20images/오프라인_배출_안내-오프라인%20안내.png" width="250" alt="오프라인 안내"/>
      <br/><sub>안내 화면</sub>
    </td>
    <td align="center">
      <img src="screen%20images/오프라인_배출_안내-오프라인%20안내%20수수료%20조회.png" width="250" alt="수수료 조회"/>
      <br/><sub>수수료 조회</sub>
    </td>
    <td align="center">
      <img src="screen%20images/오프라인_배출_안내-오프라인%20안내%20주변%20시설%20찾기.png" width="250" alt="주변 시설"/>
      <br/><sub>주변 시설 찾기</sub>
    </td>
  </tr>
</table>

---

### 2.4 AI 폐기물 판독

카메라 또는 갤러리에서 사진을 업로드하면 품목명과 손상 단계를 자동으로 인식합니다.  
**YOLOv8 1차 판독** 후 신뢰도가 낮으면 **Ollama(qwen2.5vl:7b) 2차 판독**으로 정확도를 보완합니다.  
손상 단계는 **양호 / 경미한 손상 / 심한 손상** 세 단계로 분류됩니다.

<table>
  <tr>
    <td align="center">
      <img src="screen%20images/AI_폐기물_판독-ai%20판독.png" width="210" alt="AI 판독"/>
      <br/><sub>사진 업로드</sub>
    </td>
    <td align="center">
      <img src="screen%20images/AI_폐기물_판독-ai%20판독%20상태%20양호.png" width="210" alt="양호"/>
      <br/><sub>양호</sub>
    </td>
    <td align="center">
      <img src="screen%20images/AI_폐기물_판독-ai%20판독%20상태%20경미한%20손상.png" width="210" alt="경미한 손상"/>
      <br/><sub>경미한 손상</sub>
    </td>
    <td align="center">
      <img src="screen%20images/AI_폐기물_판독-ai%20판독%20상태%20심한%20손상.png" width="210" alt="심한 손상"/>
      <br/><sub>심한 손상</sub>
    </td>
  </tr>
</table>

---

### 2.5 나눔 커뮤니티

버리기엔 아까운 물품을 무료로 나눌 수 있는 게시판입니다.  
게시글 등록·수정·삭제와 관심 스크랩, 나눔 완료 처리를 지원하며 1:1 채팅으로 수령 협의를 할 수 있습니다.

<table>
  <tr>
    <td align="center">
      <img src="screen%20images/나눔_커뮤니티-무료%20나눔%20페이지.png" width="210" alt="나눔 목록"/>
      <br/><sub>나눔 목록</sub>
    </td>
    <td align="center">
      <img src="screen%20images/나눔_커뮤니티-무료%20나눔%20게시글.png" width="210" alt="게시글 상세"/>
      <br/><sub>게시글 상세</sub>
    </td>
    <td align="center">
      <img src="screen%20images/나눔_커뮤니티-무료%20나눔%20게시글%20등록.png" width="210" alt="게시글 등록"/>
      <br/><sub>게시글 등록</sub>
    </td>
    <td align="center">
      <img src="screen%20images/나눔_커뮤니티-무료%20나눔%20채팅.png" width="210" alt="1:1 채팅"/>
      <br/><sub>1:1 채팅</sub>
    </td>
  </tr>
</table>

---

### 2.6 마이페이지

내 배출 신청 내역, 전자 영수증, 나눔 이력, 받은 나눔 내역을 한 곳에서 확인합니다.

<p align="center">
  <img src="screen%20images/마이페이지-마이%20페이지.png" width="280" alt="마이페이지"/>
</p>

---

## 3. 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| Frontend | React + TypeScript + Vite | React 19.2.0, TS ~5.9.3, Vite 7.3.1 |
| Styling | Tailwind CSS | 4.1.18 |
| State | Zustand + TanStack React Query | 5.0.11 / 5.90.21 |
| Routing | React Router | 7.13.0 |
| Form | React Hook Form | 7.71.1 |
| Backend | Java + Spring Boot + JPA | Java 17, Spring Boot 3.4.5 |
| Database | MySQL | 8.0 |
| AI Server | Python Flask + YOLOv8 + Ollama | Flask 3.1.0, Ultralytics 8.4+, qwen2.5vl:7b |
| Map | Kakao Maps SDK | Latest |

---

## 4. AI 이중 판독 구조

신뢰도가 높은 물품은 YOLO만으로 빠르게 처리하고, 인식이 불확실한 경우 멀티모달 LLM인 Ollama로 2차 판독을 수행합니다.

```
사용자 이미지 업로드
        │
        ▼
  YOLOv8 1차 판독
  (best.pt — 66 클래스 탐지)
  (damage.pt — 손상 3단계 분류)
        │
   신뢰도 판단
  (confidence ≥ 0.35 AND 신뢰 클래스 10종 중 하나)
        │
   ┌────┴────┐
  YES        NO
   │          │
   ▼          ▼
YOLO 결과  Ollama 2차 판독
반환       (qwen2.5vl:7b)
           품목 + 손상 통합 판단
```

**신뢰 클래스 10종:** 의자, 자전거, 냉장고, 세탁기, 선풍기, 청소기, 서랍장, 텔레비젼, 밥상, 소파류

| 환경변수 | 기본값 | 설명 |
|----------|--------|------|
| `YOLO_CONFIDENCE_THRESHOLD` | `0.35` | YOLO 신뢰 여부 판단 임계값 |
| `BROKEN_THRESHOLD` | `0.25` | broken 직접 판정 임계값 |
| `DAMAGE_THRESHOLD` | `0.35` | 손상 합산 판정 임계값 |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama 서버 주소 |
| `OLLAMA_MODEL` | `qwen2.5vl:7b` | 사용 모델 |
| `OLLAMA_TIMEOUT` | `55` | 요청 타임아웃(초) |

---

## 5. 프로젝트 구조

```
throwit/
├── frontend/                  # React + Vite + TypeScript
│   └── src/
│       ├── components/        # 공통 UI 컴포넌트
│       ├── features/          # 기능별 컴포넌트 및 훅
│       ├── pages/             # 페이지 컴포넌트
│       ├── services/          # API 서비스 레이어
│       └── stores/            # Zustand 상태 관리
│
├── backend/                   # Spring Boot + JPA
│   └── src/main/java/com/eolmage/domain/
│       ├── user/              # 사용자 인증
│       ├── fee/               # 수수료/지역 조회
│       ├── disposal/          # 온라인 배출 신청
│       ├── sharing/           # 나눔 커뮤니티 + 채팅
│       ├── recycle/           # 재활용 물품 게시판
│       ├── offline/           # 오프라인 시설
│       ├── notification/      # 알림
│       └── ai/                # AI 판독 (Flask 프록시)
│
├── ai-server/                 # Python Flask + YOLOv8 + Ollama
│   ├── app.py
│   ├── requirements.txt
│   └── model/
│       ├── best.pt            # YOLOv8n 탐지 모델 (66클래스)
│       └── damage.pt          # YOLOv8s-cls 손상 분류 모델
│
└── screen images/             # 서비스 스크린샷
```

---

## 6. 개발 환경 설정

### 요구 사항

| 도구 | 최소 버전 | 검증 버전 |
|------|-----------|-----------|
| Node.js | 22+ | v25.9.0 |
| Java | 17+ | OpenJDK 17.0.18 |
| MySQL | 8.0+ | 8.0.43 |
| Python | 3.9+ (선택) | 3.14.5 |
| Gradle | — (Wrapper 포함) | 8.14 |

### 1단계 — 데이터베이스

```bash
# macOS
brew services start mysql@8.0
mysql -u root -p -e "CREATE DATABASE waste_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p waste_db < backend/src/main/resources/sql/schema.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/large_waste_fee_data.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/waste_facility_data.sql
```

> SQL 파일은 반드시 `schema` → `large_waste_fee_data` → `waste_facility_data` 순으로 실행  
> Windows PowerShell 사용 불가 — cmd 또는 Git Bash 사용

### 2단계 — 백엔드

`backend/src/main/resources/application-local.yml` 생성:

```yaml
spring:
  datasource:
    username: root
    password: ""   # macOS Homebrew 기본값: 비밀번호 없음
```

```bash
# macOS
cd backend && chmod +x ./gradlew && ./gradlew bootRun

# Windows
cd backend && gradlew.bat bootRun
```

확인: `http://localhost:8080/api/regions/sido`

### 3단계 — 프론트엔드

```bash
cd frontend
cp .env.example .env   # Windows: copy .env.example .env
# .env 파일에 카카오맵 API 키 입력
npm install && npm run dev
```

접속: `https://localhost:5173`  
> **HTTPS 인증서 경고 반드시 허용** — 위치 권한(Geolocation)이 HTTPS에서만 작동

### 4단계 — AI 서버 (선택)

```bash
cd ai-server
python3 -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip3 install -r requirements.txt
python3 app.py
```

확인: `http://localhost:5001/health`

**Ollama 설정 (선택 — 2차 판독 활성화)**

```bash
# https://ollama.com 에서 설치 후
ollama pull qwen2.5vl:7b
ollama serve
```

### 실행 요약

| 터미널 | 디렉토리 | 명령어 | 주소 |
|--------|----------|--------|------|
| 1 (백엔드) | `backend/` | `./gradlew bootRun` | http://localhost:8080 |
| 2 (프론트) | `frontend/` | `npm run dev` | https://localhost:5173 |
| 3 (AI, 선택) | `ai-server/` | `python3 app.py` | http://localhost:5001 |

### 환경변수

**`frontend/.env`**

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `VITE_MAP_API_KEY` | (필수) | 카카오맵 JavaScript API 키 |
| `VITE_API_BASE_URL` | `''` | 백엔드 주소 (로컬 개발 시 설정 불필요 — Vite 프록시 사용) |

> [Kakao Developers](https://developers.kakao.com/) → 애플리케이션 추가 → JavaScript 키 → 플랫폼에 `https://localhost:5173` 등록

---

## 7. API 명세

> 전체 49개 엔드포인트 / 인증 필요 API는 `X-User-Id` 헤더 사용

| 그룹 | 엔드포인트 | 설명 |
|------|-----------|------|
| 인증 | `POST /api/auth/signup` `POST /api/auth/login` | 회원가입 / 로그인 |
| 사용자 | `GET /api/auth/me` `PUT /api/auth/profile` `DELETE /api/auth/account` | 내 정보 / 수정 / 탈퇴 |
| 지역 | `GET /api/regions/sido` `GET /api/regions/sigungu` | 시도 / 시군구 목록 |
| 폐기물 | `GET /api/waste/categories` `GET /api/waste/items` | 카테고리 목록 / 항목 검색 |
| 수수료 | `GET /api/fees` `GET /api/fees/by-waste-name` | 수수료 조회 |
| 배출 | `POST /api/disposals` `GET /api/disposals/my` `GET /api/disposals/{id}` | 신청 생성 / 목록 / 상세 |
| 나눔 | `GET/POST /api/sharing` `PUT/DELETE /api/sharing/{id}` | 게시글 목록 / 등록 / 수정 / 삭제 |
| 나눔 채팅 | `GET/POST /api/sharing/{postId}/chat/rooms` `GET/POST .../rooms/{roomId}/messages` | 채팅방 / 메시지 |
| 재활용 물품 | `GET/POST /api/recycle/items` `PATCH /api/recycle/items/{id}/status` | 물품 목록 / 등록 / 상태 변경 |
| 오프라인 | `GET /api/offline/sticker-shops` `GET /api/offline/centers` `GET /api/offline/waste-facilities` | 시설 정보 |
| 알림 | `GET /api/notifications` `PATCH /api/notifications/{id}/read` `PATCH /api/notifications/read-all` | 알림 목록 / 읽음 처리 |
| AI | `POST /api/ai/predict` | 이미지 폐기물 판독 |

---

## 트러블슈팅

**MySQL 연결 실패** → `application-local.yml` username/password 확인. macOS Homebrew 기본값은 비밀번호 없음 → `password: ""`

**HTTPS 인증서 경고** → 반드시 허용 필요. `vite.config.ts`에서 `basicSsl()` 제거 시 HTTP 실행 가능 (위치 기능 비활성화)

**위치 설정 불가** → `VITE_MAP_API_KEY` 미설정 시 역지오코딩 실패

**macOS Gradle 권한 오류** → `chmod +x ./gradlew`

**AI 서버 설치 오류 (Apple Silicon)** → `pip3 install --upgrade pip setuptools wheel` 후 재시도

**AI 판독 503 (ollama_unavailable)** → YOLO 신뢰도가 낮고 Ollama가 미실행 상태. `ollama serve` 실행 후 재시도

**PowerShell SQL Import 실패** → cmd 또는 Git Bash 사용 (`<` 연산자 미지원)

**포트 충돌** → macOS: `lsof -i :8080 | kill -9 <PID>` / Windows: `netstat -ano | findstr :8080` → `taskkill /PID <PID> /F`
