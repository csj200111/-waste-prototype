<p align="center">
  <img src="screen%20images/UI.png" width="400" alt="얼마게 로고"/>
</p>

<h1 align="center">얼마게 (Throw It)</h1>
<h3 align="center">대형폐기물 처리의 모든 과정을 하나의 앱에서</h3>

<br/>

<p align="center">
  <b>팀명</b> &nbsp;오편한세상 &nbsp;&nbsp;|&nbsp;&nbsp; <b>작성자</b> &nbsp;20231395 최세진
</p>

<br/>

---

## 목차

1. [개발 배경 및 목적](#1-개발-배경-및-목적)
2. [서비스 개요](#2-서비스-개요)
3. [주요 기능](#3-주요-기능)
   - [수수료 조회](#31-수수료-조회)
   - [온라인 배출 신청](#32-온라인-배출-신청)
   - [오프라인 배출 안내](#33-오프라인-배출-안내)
   - [AI 폐기물 판독](#34-ai-폐기물-판독)
   - [나눔 커뮤니티](#35-나눔-커뮤니티)
   - [마이페이지](#36-마이페이지)
4. [기술 스택](#4-기술-스택)
5. [AI 이중 판독 구조](#5-ai-이중-판독-구조)
6. [프로젝트 구조](#6-프로젝트-구조)
7. [개발 환경 설정](#7-개발-환경-설정)
8. [API 명세](#8-api-명세)

---

## 1. 개발 배경 및 목적

대형폐기물을 버리려면 지자체마다 다른 수수료를 직접 조회하고, 스티커를 구매하거나 온라인으로 신청하는 복잡한 절차를 거쳐야 합니다. 그러나 이 정보는 지자체 홈페이지마다 흩어져 있어 일반 사용자가 한 번에 파악하기 어렵습니다.

**얼마게**는 이 문제를 해결하기 위해 기획된 서비스입니다.

- 전국 수수료 데이터를 한 곳에 통합하여 지역별 즉시 조회
- 온라인 배출 신청부터 배출번호 발급까지 앱 내에서 완결
- AI 카메라 판독으로 물품 이름을 몰라도 수수료 확인 가능
- 아직 쓸 수 있는 물품은 나눔 커뮤니티로 폐기물 발생 자체를 줄임

---

## 2. 서비스 개요

<table>
  <tr>
    <td><b>서비스 형태</b></td>
    <td>모바일 우선 웹 앱</td>
  </tr>
  <tr>
    <td><b>대상 사용자</b></td>
    <td>대형폐기물 배출이 필요한 전국 시민</td>
  </tr>
  <tr>
    <td><b>핵심 데이터</b></td>
    <td>전국 17개 시도 · 131개 시군구 · 22,819건 수수료 DB</td>
  </tr>
  <tr>
    <td><b>AI 판독</b></td>
    <td>YOLOv8 1차 판독 + Ollama(qwen2.5vl:7b) 2차 판독</td>
  </tr>
</table>

<br/>

<table>
  <tr>
    <td align="center">
      <img src="screen%20images/온보딩.png" width="220" alt="온보딩"/>
      <br/><sub>온보딩</sub>
    </td>
    <td align="center">
      <img src="screen%20images/로그인%20화면.png" width="220" alt="로그인"/>
      <br/><sub>로그인</sub>
    </td>
    <td align="center">
      <img src="screen%20images/메인화면.png" width="220" alt="메인화면"/>
      <br/><sub>메인 화면</sub>
    </td>
  </tr>
</table>

---

## 3. 주요 기능

### 3.1 수수료 조회

시도 → 시군구 → 품목 → 규격 단계로 선택하면 해당 지역의 정확한 배출 수수료를 즉시 확인할 수 있습니다. 품목명 키워드 검색도 지원합니다.

<table>
  <tr>
    <td align="center">
      <img src="screen%20images/수수료_조회-수수료%20조회.png" width="200" alt="지역 선택"/>
      <br/><sub>① 지역 선택</sub>
    </td>
    <td align="center">
      <img src="screen%20images/수수료_조회-수수료%20조회%20품목%20목록.png" width="200" alt="품목 목록"/>
      <br/><sub>② 품목 목록</sub>
    </td>
    <td align="center">
      <img src="screen%20images/수수료_조회-수수료%20조회%20규격%20선택.png" width="200" alt="규격 선택"/>
      <br/><sub>③ 규격 선택</sub>
    </td>
    <td align="center">
      <img src="screen%20images/수수료_조회-수수료%20계산%20결과.png" width="200" alt="수수료 확인"/>
      <br/><sub>④ 수수료 확인</sub>
    </td>
  </tr>
</table>

---

### 3.2 온라인 배출 신청

로그인 후 품목·수량·배출 날짜를 선택하고 온라인으로 배출을 신청합니다. 신청 완료 시 고유 배출번호가 발급되며, 배출 내역에서 처리 상태를 실시간으로 확인할 수 있습니다.

<table>
  <tr>
    <td align="center">
      <img src="screen%20images/온라인_배출_신청-온라인%20신고.png" width="180" alt="신청 홈"/>
      <br/><sub>① 신청 홈</sub>
    </td>
    <td align="center">
      <img src="screen%20images/온라인_배출_신청-온라인%20신고%20품목%20검색.png" width="180" alt="품목 검색"/>
      <br/><sub>② 품목 검색</sub>
    </td>
    <td align="center">
      <img src="screen%20images/온라인_배출_신청-온라인%20신고%20결제.png" width="180" alt="결제"/>
      <br/><sub>③ 결제</sub>
    </td>
    <td align="center">
      <img src="screen%20images/온라인_배출_신청-온라인%20신고%20결재%20완료.png" width="180" alt="신청 완료"/>
      <br/><sub>④ 신청 완료</sub>
    </td>
    <td align="center">
      <img src="screen%20images/온라인_배출_신청-온라인%20신고%20배출%20내역.png" width="180" alt="배출 내역"/>
      <br/><sub>⑤ 배출 내역</sub>
    </td>
  </tr>
</table>

---

### 3.3 오프라인 배출 안내

스티커 구매 방식의 오프라인 배출 절차를 안내합니다. 현재 위치를 기반으로 주변 스티커 판매소·주민센터·운반 업체·폐기물 처리 시설을 카카오맵에서 바로 확인할 수 있습니다.

<table>
  <tr>
    <td align="center">
      <img src="screen%20images/오프라인_배출_안내-오프라인%20안내.png" width="250" alt="안내 화면"/>
      <br/><sub>① 안내 화면</sub>
    </td>
    <td align="center">
      <img src="screen%20images/오프라인_배출_안내-오프라인%20안내%20수수료%20조회.png" width="250" alt="수수료 조회"/>
      <br/><sub>② 수수료 조회</sub>
    </td>
    <td align="center">
      <img src="screen%20images/오프라인_배출_안내-오프라인%20안내%20주변%20시설%20찾기.png" width="250" alt="주변 시설"/>
      <br/><sub>③ 주변 시설 찾기</sub>
    </td>
  </tr>
</table>

---

### 3.4 AI 폐기물 판독

카메라 또는 갤러리 사진을 업로드하면 물품 종류와 손상 단계를 자동으로 인식합니다. 손상 단계는 **양호 / 경미한 손상 / 심한 손상** 세 단계로 분류됩니다. 상세 동작 방식은 [5. AI 이중 판독 구조](#5-ai-이중-판독-구조)를 참고하세요.

<table>
  <tr>
    <td align="center">
      <img src="screen%20images/AI_폐기물_판독-ai%20판독.png" width="210" alt="사진 업로드"/>
      <br/><sub>① 사진 업로드</sub>
    </td>
    <td align="center">
      <img src="screen%20images/AI_폐기물_판독-ai%20판독%20상태%20양호.png" width="210" alt="양호"/>
      <br/><sub>② 양호</sub>
    </td>
    <td align="center">
      <img src="screen%20images/AI_폐기물_판독-ai%20판독%20상태%20경미한%20손상.png" width="210" alt="경미한 손상"/>
      <br/><sub>③ 경미한 손상</sub>
    </td>
    <td align="center">
      <img src="screen%20images/AI_폐기물_판독-ai%20판독%20상태%20심한%20손상.png" width="210" alt="심한 손상"/>
      <br/><sub>④ 심한 손상</sub>
    </td>
  </tr>
</table>

---

### 3.5 나눔 커뮤니티

버리기 전에 나눌 수 있는 물품을 무료로 공유하는 게시판입니다. 게시글 등록·수정·삭제, 관심 스크랩, 나눔 완료 처리를 지원하며 1:1 채팅으로 수령을 협의할 수 있습니다.

<table>
  <tr>
    <td align="center">
      <img src="screen%20images/나눔_커뮤니티-무료%20나눔%20페이지.png" width="210" alt="나눔 목록"/>
      <br/><sub>① 나눔 목록</sub>
    </td>
    <td align="center">
      <img src="screen%20images/나눔_커뮤니티-무료%20나눔%20게시글.png" width="210" alt="게시글 상세"/>
      <br/><sub>② 게시글 상세</sub>
    </td>
    <td align="center">
      <img src="screen%20images/나눔_커뮤니티-무료%20나눔%20게시글%20등록.png" width="210" alt="게시글 등록"/>
      <br/><sub>③ 게시글 등록</sub>
    </td>
    <td align="center">
      <img src="screen%20images/나눔_커뮤니티-무료%20나눔%20채팅.png" width="210" alt="1:1 채팅"/>
      <br/><sub>④ 1:1 채팅</sub>
    </td>
  </tr>
</table>

---

### 3.6 마이페이지

내 배출 신청 내역, 전자 영수증, 나눔 이력, 받은 나눔 내역을 한 곳에서 확인합니다.

<p align="center">
  <img src="screen%20images/마이페이지-마이%20페이지.png" width="280" alt="마이페이지"/>
</p>

---

## 4. 기술 스택

### Frontend

| 구분 | 기술 | 버전 |
|------|------|------|
| Framework | React + TypeScript | 19.2.0 / ~5.9.3 |
| Build Tool | Vite | 7.3.1 |
| Styling | Tailwind CSS | 4.1.18 |
| 상태 관리 | Zustand | 5.0.11 |
| 서버 상태 | TanStack React Query | 5.90.21 |
| Routing | React Router | 7.13.0 |
| Form | React Hook Form | 7.71.1 |
| Map | Kakao Maps SDK | Latest |

### Backend

| 구분 | 기술 | 버전 |
|------|------|------|
| Language | Java | 17 |
| Framework | Spring Boot + JPA | 3.4.5 |
| Database | MySQL | 8.0 |
| Build | Gradle | 8.14 |

### AI Server

| 구분 | 기술 | 버전 |
|------|------|------|
| Language | Python | 3.9+ |
| Framework | Flask + Flask-CORS | 3.1.0 / 5.0.1 |
| 탐지 모델 | YOLOv8n (best.pt, 66클래스) | Ultralytics 8.4+ |
| 손상 분류 | YOLOv8s-cls (damage.pt) | Ultralytics 8.4+ |
| 2차 판독 | Ollama qwen2.5vl:7b | — |

---

## 5. AI 이중 판독 구조

신뢰도가 높은 물품은 YOLO만으로 빠르게 처리하고, 인식이 불확실한 경우 멀티모달 LLM인 Ollama로 2차 판독을 수행합니다.

```
사용자 이미지 업로드
         │
         ▼
   YOLOv8 1차 판독
   ├─ best.pt    : 66클래스 물품 탐지
   └─ damage.pt  : 손상 3단계 분류 (양호 / 경미 / 심함)
         │
    신뢰도 판단
    confidence ≥ 0.35  AND  신뢰 클래스 10종 중 하나
         │
    ┌────┴────┐
   YES        NO
    │          │
    ▼          ▼
 YOLO 결과   Ollama 2차 판독
 즉시 반환   (qwen2.5vl:7b)
             물품명 + 손상등급 통합 판단 후 반환
```

**신뢰 클래스 10종** (AI 판독 시 정확도가 높은 클래스)

의자, 자전거, 냉장고, 세탁기, 선풍기, 청소기, 서랍장, 텔레비젼, 밥상, 소파류

**주요 환경변수**

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `YOLO_CONFIDENCE_THRESHOLD` | `0.35` | YOLO 신뢰 여부 판단 임계값 |
| `BROKEN_THRESHOLD` | `0.25` | broken 직접 판정 임계값 |
| `DAMAGE_THRESHOLD` | `0.35` | 손상 합산 판정 임계값 |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama 서버 주소 |
| `OLLAMA_MODEL` | `qwen2.5vl:7b` | 사용 모델 |
| `OLLAMA_TIMEOUT` | `55` | 요청 타임아웃(초) |

---

## 6. 프로젝트 구조

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
│       ├── fee/               # 수수료 · 지역 조회
│       ├── disposal/          # 온라인 배출 신청
│       ├── sharing/           # 나눔 커뮤니티 + 채팅
│       ├── recycle/           # 재활용 물품 게시판
│       ├── offline/           # 오프라인 시설 안내
│       ├── notification/      # 알림
│       └── ai/                # AI 판독 프록시
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

## 7. 개발 환경 설정

### 요구 사항

| 도구 | 최소 버전 | 검증 버전 |
|------|-----------|-----------|
| Node.js | 22+ | v25.9.0 |
| Java | 17+ | OpenJDK 17.0.18 |
| MySQL | 8.0+ | 8.0.43 |
| Python | 3.9+ (선택) | 3.14.5 |
| Gradle | — (Wrapper 포함) | 8.14 |

### 1단계 — 데이터베이스

**cmd 또는 Git Bash에서 실행** (PowerShell 사용 불가 — `<` 연산자 미지원)

```cmd
mysql -u root -p -e "CREATE DATABASE waste_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p waste_db < backend/src/main/resources/sql/schema.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/large_waste_fee_data.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/waste_facility_data.sql
```

> SQL 파일은 반드시 `schema` → `large_waste_fee_data` → `waste_facility_data` 순서로 실행  
> 데이터 확인: `SELECT COUNT(*) FROM waste_db.large_waste_fee;` → **22819**

<details>
<summary>macOS</summary>

```bash
brew services start mysql@8.0
mysql -u root -p -e "CREATE DATABASE waste_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p waste_db < backend/src/main/resources/sql/schema.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/large_waste_fee_data.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/waste_facility_data.sql
```

</details>

### 2단계 — 백엔드

`backend/src/main/resources/application-local.yml` 생성:

```yaml
spring:
  datasource:
    username: root
    password: "본인_MySQL_비밀번호"
```

```cmd
cd backend
gradlew.bat bootRun
```

> 확인: `http://localhost:8080/api/regions/sido` → 시도 목록 JSON 반환

<details>
<summary>macOS</summary>

```bash
cd backend
chmod +x ./gradlew    # 최초 1회
./gradlew bootRun
```

macOS Homebrew로 설치한 MySQL은 기본 비밀번호가 없으므로 `password: ""`로 설정

</details>

### 3단계 — 프론트엔드

```cmd
cd frontend
copy .env.example .env
```

`.env` 파일을 열어 카카오맵 API 키를 입력합니다.

```cmd
npm install
npm run dev
```

> 접속: `https://localhost:5173`  
> **HTTPS 인증서 경고 반드시 허용** — 위치 권한(Geolocation)이 HTTPS 환경에서만 작동  
> 모바일 UI 기준으로 제작 — 브라우저 개발자 도구(F12)에서 **428px 이하** 모바일 뷰로 확인 권장  
> 카카오맵 키: [Kakao Developers](https://developers.kakao.com/) → 앱 생성 → JavaScript 키 → 플랫폼에 `https://localhost:5173` 등록

#### HTTPS 인증서 경고 무시하고 접속하는 방법

`https://localhost:5173` 접속 시 브라우저가 "위험한 사이트" 또는 "연결이 비공개로 설정되어 있지 않습니다" 경고를 표시합니다.  
이는 로컬 개발용 자체 서명 인증서로 인한 것으로, 아래 방법으로 무시하고 접속할 수 있습니다.

**Chrome / Edge**

1. 경고 화면 하단의 **고급** 클릭
2. **`localhost`(으)로 이동(안전하지 않음)** 클릭

또는 경고 화면이 열린 상태에서 키보드로 `thisisunsafe` 를 그대로 타이핑하면 바로 접속됩니다.

**Firefox**

1. 경고 화면 하단의 **고급** 클릭
2. **위험을 감수하고 계속** 클릭

**Safari**

1. **세부 정보 보기** 클릭
2. **이 웹 사이트 방문** 클릭
3. 확인 대화상자에서 **방문** 클릭

<details>
<summary>macOS</summary>

```bash
cd frontend
cp .env.example .env
npm install && npm run dev
```

</details>

### 4단계 — AI 서버 (선택)

```cmd
cd ai-server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

> 확인: `http://localhost:5001/health`  
> AI 서버 없이도 수수료 조회 · 배출 신청 · 나눔 등 모든 기능은 정상 동작

<details>
<summary>macOS</summary>

```bash
cd ai-server
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
python3 app.py
```

Apple Silicon(M1/M2/M3) 환경에서 설치 오류 발생 시: `pip3 install --upgrade pip setuptools wheel` 후 재시도

</details>

**Ollama 설정 (선택 — 2차 판독 활성화)**

[ollama.com](https://ollama.com) 에서 Windows 설치 파일을 받아 설치한 뒤 실행합니다.

```cmd
ollama pull qwen2.5vl:7b
ollama serve
```

### 실행 요약

| 터미널 | 디렉토리 | Windows 명령어 | macOS 명령어 | 주소 |
|--------|----------|----------------|-------------|------|
| 1 (백엔드) | `backend/` | `gradlew.bat bootRun` | `./gradlew bootRun` | http://localhost:8080 |
| 2 (프론트) | `frontend/` | `npm run dev` | `npm run dev` | https://localhost:5173 |
| 3 (AI, 선택) | `ai-server/` | `python app.py` | `python3 app.py` | http://localhost:5001 |

---

## 8. API 명세

> 전체 **49개** 엔드포인트

| 그룹 | 메서드 | 엔드포인트 | 설명 |
|------|--------|-----------|------|
| 인증 | POST | `/api/auth/signup` | 회원가입 |
| 인증 | POST | `/api/auth/login` | 로그인 |
| 사용자 | GET | `/api/auth/me` | 내 정보 조회 |
| 사용자 | GET | `/api/auth/check-nickname` | 닉네임 중복 확인 |
| 사용자 | PUT | `/api/auth/profile` | 프로필 수정 |
| 사용자 | DELETE | `/api/auth/account` | 회원 탈퇴 |
| 지역 | GET | `/api/regions/sido` | 시도 목록 |
| 지역 | GET | `/api/regions/sigungu` | 시군구 목록 |
| 폐기물 | GET | `/api/waste/categories` | 카테고리 목록 |
| 폐기물 | GET | `/api/waste/items` | 품목 검색 |
| 수수료 | GET | `/api/fees` | 수수료 조회 |
| 수수료 | GET | `/api/fees/by-waste-name` | 품목명 기반 수수료 조회 |
| 배출 | POST | `/api/disposals` | 배출 신청 생성 |
| 배출 | GET | `/api/disposals/my` | 내 신청 목록 |
| 배출 | GET | `/api/disposals/{id}` | 신청 상세 |
| 배출 | PATCH | `/api/disposals/{id}/cancel` | 신청 취소 |
| 배출 | POST | `/api/disposals/{id}/payment` | 결제 처리 |
| 배출 | DELETE | `/api/disposals/{id}` | 신청 삭제 |
| 나눔 | GET | `/api/sharing` | 게시글 목록 |
| 나눔 | GET | `/api/sharing/{id}` | 게시글 상세 |
| 나눔 | POST | `/api/sharing` | 게시글 등록 |
| 나눔 | PUT | `/api/sharing/{id}` | 게시글 수정 |
| 나눔 | DELETE | `/api/sharing/{id}` | 게시글 삭제 |
| 나눔 | POST | `/api/sharing/{id}/scrap` | 스크랩 토글 |
| 나눔 | GET | `/api/sharing/{id}/scrap` | 스크랩 여부 조회 |
| 나눔 | GET | `/api/sharing/scraps` | 내 스크랩 목록 |
| 나눔 | GET | `/api/sharing/chatted` | 채팅 중인 나눔 목록 |
| 나눔 | GET | `/api/sharing/received` | 받은 나눔 목록 |
| 나눔 | PATCH | `/api/sharing/{id}/complete` | 나눔 완료 처리 |
| 나눔 | PATCH | `/api/sharing/{id}/cancel` | 나눔 취소 |
| 나눔 채팅 | GET | `/api/sharing/{postId}/chat/rooms` | 채팅방 목록 |
| 나눔 채팅 | POST | `/api/sharing/{postId}/chat/rooms` | 채팅방 생성 |
| 나눔 채팅 | GET | `/api/sharing/{postId}/chat/rooms/{roomId}/messages` | 메시지 목록 |
| 나눔 채팅 | POST | `/api/sharing/{postId}/chat/rooms/{roomId}/messages` | 메시지 전송 |
| 나눔 채팅 | PATCH | `/api/sharing/{postId}/chat/rooms/{roomId}/read` | 채팅 읽음 처리 |
| 재활용 | GET | `/api/recycle/items` | 물품 목록 |
| 재활용 | GET | `/api/recycle/items/my` | 내 물품 목록 |
| 재활용 | POST | `/api/recycle/items` | 물품 등록 |
| 재활용 | PATCH | `/api/recycle/items/{id}/status` | 상태 변경 |
| 재활용 | DELETE | `/api/recycle/items/{id}` | 물품 삭제 |
| 오프라인 | GET | `/api/offline/sticker-shops` | 스티커 판매소 |
| 오프라인 | GET | `/api/offline/centers` | 주민센터 |
| 오프라인 | GET | `/api/offline/transport` | 운반 업체 |
| 오프라인 | GET | `/api/offline/waste-facilities` | 폐기물 처리 시설 |
| 알림 | GET | `/api/notifications` | 알림 목록 |
| 알림 | GET | `/api/notifications/unread-count` | 미읽음 알림 수 |
| 알림 | PATCH | `/api/notifications/{id}/read` | 알림 읽음 처리 |
| 알림 | PATCH | `/api/notifications/read-all` | 전체 읽음 처리 |
| AI | POST | `/api/ai/predict` | 이미지 폐기물 판독 |

---

## 트러블슈팅

| 증상 | 해결 방법 |
|------|-----------|
| MySQL 연결 실패 | `application-local.yml` 비밀번호 확인. macOS Homebrew 기본값은 빈 문자열 (`password: ""`) |
| HTTPS 인증서 경고 | Chrome/Edge: **고급 → localhost로 이동(안전하지 않음)** 또는 경고 화면에서 `thisisunsafe` 타이핑. Firefox: **고급 → 위험을 감수하고 계속**. Safari: **세부 정보 보기 → 이 웹 사이트 방문**. `vite.config.ts`의 `basicSsl()` 제거 시 HTTP로 실행 가능 (위치 기능 비활성화) |
| 위치 설정 불가 | `VITE_MAP_API_KEY` 미설정 시 역지오코딩 실패 → 카카오 키 발급 필요 |
| Gradle 권한 오류 (macOS) | `chmod +x ./gradlew` |
| AI 서버 설치 오류 (Apple Silicon) | `pip3 install --upgrade pip setuptools wheel` 후 재시도 |
| AI 판독 503 응답 | YOLO 신뢰도 낮고 Ollama 미실행 상태 → `ollama serve` 실행 후 재시도 |
| SQL Import 실패 (Windows) | PowerShell 대신 **cmd 또는 Git Bash** 사용 (`<` 연산자 미지원) |
| 포트 충돌 | macOS: `lsof -i :8080` → `kill -9 <PID>` / Windows: `netstat -ano \| findstr :8080` → `taskkill /PID <PID> /F` |
