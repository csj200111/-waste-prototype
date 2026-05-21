# 얼마게 (Throw It)

대형폐기물 수수료 조회, 온라인/오프라인 배출 신청, 나눔 커뮤니티, AI 폐기물 판독, 재활용 역경매를 제공하는 모바일 우선 웹 서비스입니다.

**전국 17개 시도, 131개 시군구, 22,819건 수수료 데이터** 기반

---

## 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| Frontend | React + TypeScript + Vite | React 19.2.0, TS ~5.9.3, Vite 7.3.1 |
| Styling | Tailwind CSS | 4.1.18 |
| State | Zustand + TanStack React Query | 5.0.11 / 5.90.21 |
| Backend | Java + Spring Boot | Java 17, Spring Boot 3.4.5 |
| Database | MySQL | 8.0 |
| AI Server | Python Flask + YOLOv8 | Flask 3.1.0, Ultralytics 8.4+ |
| Map | Kakao Maps SDK | Latest |

---

## 개발 환경

| 도구 | 검증 버전 | 확인 |
|------|-----------|------|
| Node.js | v22.18.0 | `node -v` |
| Java | OpenJDK 24.0.2 | `java -version` |
| MySQL | 8.0.43 | `mysql --version` |
| Python | 3.13.7 (선택) | `python3 --version` |
| Gradle | 8.14 (Wrapper 포함) | 별도 설치 불필요 |

**최소 요구 버전**: Node.js 18+, Java 17+, MySQL 8.0+, Python 3.9+

---

## 시작하기

```bash
git clone https://github.com/csj200111/-waste-prototype.git
cd -waste-prototype
```

### 1. 데이터베이스 설정

**macOS**
```bash
brew services start mysql@8.0
mysql -u root -p -e "CREATE DATABASE waste_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p waste_db < backend/src/main/resources/sql/schema.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/large_waste_fee_data.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/waste_facility_data.sql
```

**Windows** (cmd 또는 Git Bash — PowerShell 사용 불가)
```bash
mysql -u root -p -e "CREATE DATABASE waste_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p waste_db < backend/src/main/resources/sql/schema.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/large_waste_fee_data.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/waste_facility_data.sql
```

> SQL 파일은 반드시 schema → large_waste_fee_data → waste_facility_data 순서로 실행  
> 데이터 확인: `SELECT COUNT(*) FROM waste_db.large_waste_fee;` → **22819**

### 2. 백엔드

`backend/src/main/resources/application-local.yml` 파일 생성:

```yaml
spring:
  datasource:
    username: root
    password: 본인_MySQL_비밀번호   # macOS Homebrew MySQL 기본 비밀번호 없음 → ""
```

**macOS**
```bash
cd backend
chmod +x ./gradlew    # 최초 1회
./gradlew bootRun
```

**Windows**
```bash
cd backend
gradlew.bat bootRun
```

확인: `http://localhost:8080/api/regions/sido` → 시도 목록 JSON

### 3. 프론트엔드

**macOS**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

**Windows**
```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

> `.env` 파일에서 `VITE_MAP_API_KEY`에 카카오맵 API 키 입력 (없으면 지도 + 위치 기능 비활성화)

프론트엔드: `https://localhost:5173`

> **HTTPS 인증서 경고 반드시 허용** — 허용 안 하면 위치 권한 등 주요 기능 비활성화  
> Chrome: `고급 → 안전하지 않음으로 이동` / Safari: `세부사항 보기 → 이 웹 사이트 방문`  
> **모바일 UI 기준** — 브라우저 개발자 도구(F12)에서 모바일 뷰(428px 이하)로 전환 권장

### 4. AI 서버 (선택)

**macOS**
```bash
cd ai-server
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
python3 app.py
```

**Windows**
```bash
cd ai-server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

확인: `http://localhost:5001/health` → `{"status": "ok", ...}`

> AI 서버 없이도 나머지 모든 기능은 정상 작동합니다.

### 실행 요약

| 터미널 | 디렉토리 | macOS | Windows | 주소 |
|--------|----------|-------|---------|------|
| 1 (백엔드) | `backend/` | `./gradlew bootRun` | `gradlew.bat bootRun` | http://localhost:8080 |
| 2 (프론트) | `frontend/` | `npm run dev` | `npm run dev` | https://localhost:5173 |
| 3 (AI, 선택) | `ai-server/` | `python3 app.py` | `python app.py` | http://localhost:5001 |

---

## 환경변수

### Frontend (`frontend/.env`)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | 백엔드 주소 |
| `VITE_MAP_API_KEY` | (없음) | 카카오맵 JavaScript API 키 |

> 카카오맵 키 없으면 지도 비활성화 + **위치 설정 기능도 사용 불가** (역지오코딩 실패)  
> [Kakao Developers](https://developers.kakao.com/) → 애플리케이션 추가 → JavaScript 키 → 플랫폼에 `https://localhost:5173` 등록

### AI Server (환경변수)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `BROKEN_THRESHOLD` | `0.25` | broken 판정 임계값 |
| `DAMAGE_THRESHOLD` | `0.35` | 손상 판정 임계값 |
| `ALLOWED_ORIGINS` | `*` | CORS 허용 도메인 (배포 시 실제 도메인 설정) |

---

## 주요 기능

| # | 기능 | 설명 | 인증 |
|---|------|------|:----:|
| 1 | 수수료 조회 | 시도/시군구 + 카테고리 기반 수수료 조회 | - |
| 2 | 온라인 배출 | 신청 → 검수 → 결제(UI) → 배출번호 발급 | ✓ |
| 3 | 오프라인 안내 | 스티커 판매소 / 주민센터 카카오맵 연동 | - |
| 4 | AI 폐기물 판독 | 카메라/갤러리 → 물품 종류 + 손상 단계 자동 인식 | - |
| 5 | 나눔 커뮤니티 | 무료 나눔 게시글 CRUD + 1:1 채팅 | ✓ |
| 6 | 재활용 역경매 | 물품 사진 업로드 + 등록/관리/삭제 | ✓ |
| 7 | 알림 | 배출 상태 변경, 나눔 채팅 수신 알림 | ✓ |
| 8 | 마이페이지 | 신청 내역, 전자 영수증, 나눔 이력 | ✓ |

---

## 프로젝트 구조

```
-waste-prototype/
├── frontend/                  # React + Vite + TypeScript
│   └── src/
│       ├── components/        # 공통 UI 컴포넌트
│       ├── features/          # 기능별 컴포넌트 및 훅
│       ├── pages/             # 페이지 컴포넌트
│       ├── services/          # API 서비스 레이어
│       └── stores/            # Zustand 상태 관리
│
├── backend/                   # Spring Boot + JPA
│   └── src/main/java/com/eolmage/
│       └── domain/
│           ├── user/          # 사용자 인증
│           ├── fee/           # 수수료/지역 조회
│           ├── disposal/      # 온라인 배출 신청
│           ├── sharing/       # 나눔 커뮤니티 + 채팅
│           ├── recycle/       # 재활용 역경매
│           ├── offline/       # 오프라인 시설
│           ├── notification/  # 알림
│           └── ai/            # AI 판독 (Flask 프록시)
│
└── ai-server/                 # Python Flask + YOLOv8
    ├── app.py
    ├── requirements.txt
    └── model/
        ├── best.pt            # YOLOv8n 탐지 모델 (68클래스)
        └── damage.pt          # YOLOv8s-cls 손상 분류 모델
```

---

## API 주요 엔드포인트

| 그룹 | 엔드포인트 | 설명 |
|------|-----------|------|
| 인증 | `POST /api/auth/signup`, `POST /api/auth/login` | 회원가입 / 로그인 |
| 지역 | `GET /api/regions/sido`, `GET /api/regions/sigungu` | 시도 / 시군구 목록 |
| 수수료 | `GET /api/fees` | 수수료 조회 |
| 배출 | `POST /api/disposals`, `GET /api/disposals/my` | 신청 생성 / 내 신청 목록 |
| 나눔 | `GET/POST /api/sharing`, `POST /api/sharing/{id}/chat/rooms` | 게시글 / 채팅 |
| 역경매 | `GET/POST /api/recycle/items` | 물품 목록 / 등록 |
| AI | `POST /api/ai/predict` | 이미지 폐기물 판독 |

> 전체 49개 엔드포인트 / 인증 필요 API는 `X-User-Id` 헤더 사용

---

## 트러블슈팅

**MySQL 연결 실패**  
→ `application-local.yml` username/password 확인  
→ macOS Homebrew MySQL은 기본 비밀번호 없음 → `password: ""`로 설정

**HTTPS 인증서 경고**  
→ 반드시 허용해야 위치 권한, Geolocation API 작동  
→ `vite.config.ts`에서 `basicSsl()` 제거 시 HTTP로 실행 가능 (위치 기능 비활성화)

**위치 설정 불가**  
→ `VITE_MAP_API_KEY` 미설정 시 역지오코딩 실패 → 카카오 키 발급 필요

**macOS Gradle 권한 오류** (`Permission denied`)  
→ `chmod +x ./gradlew`

**AI 서버 설치 오류 (Apple Silicon)**  
→ `pip3 install --upgrade pip setuptools wheel` 후 재시도

**PowerShell에서 SQL Import 실패** (`<` 연산자 오류)  
→ cmd 또는 Git Bash에서 실행

**포트 충돌**  
→ macOS: `lsof -i :8080` → `kill -9 <PID>`  
→ Windows: `netstat -ano | findstr :8080` → `taskkill /PID <PID> /F`
