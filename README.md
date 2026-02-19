# Throw It - 대형폐기물 배출 도우미

대형폐기물 배출 수수료 조회, 온라인 배출 신청, 재활용 역경매 등을 지원하는 웹 서비스입니다.

## 기술 스택

- **Backend**: Java 17, Spring Boot 3.4.5, JPA, MySQL 8
- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS 4, Zustand

## 사전 준비

- Java 17+
- Node.js 18+
- MySQL 8.0+

## 설치 및 실행

### 1. MySQL 데이터베이스 설정

```sql
CREATE DATABASE waste_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 공공데이터 초기화

테이블 생성 및 데이터를 로드합니다:

```bash
mysql -u root -p waste_db < backend/src/main/resources/sql/schema.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/large_waste_fee_data.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/waste_facility_data.sql
```

### 3. 백엔드 실행

```bash
cd backend

# 환경변수 설정
export DB_USERNAME=root
export DB_PASSWORD=your_mysql_password

# 실행
./gradlew bootRun
```

백엔드가 `http://localhost:8080`에서 시작됩니다.

### 4. 프론트엔드 실행

```bash
cd frontend

# .env 파일 생성 (.env.example 참고)
cp .env.example .env
# .env 파일을 열어 VITE_MAP_API_KEY에 카카오맵 API 키를 입력

# 의존성 설치
npm install

# 실행
npm run dev
```

프론트엔드가 `http://localhost:5173`에서 시작됩니다.

### 환경변수

| 변수 | 위치 | 설명 |
|------|------|------|
| `DB_USERNAME` | Backend | MySQL 사용자명 (기본: root) |
| `DB_PASSWORD` | Backend | MySQL 비밀번호 |
| `VITE_API_BASE_URL` | Frontend .env | API 서버 주소 (기본: http://localhost:8080) |
| `VITE_MAP_API_KEY` | Frontend .env | 카카오맵 JavaScript API 키 |

## 주요 기능

- 대형폐기물 수수료 조회 (지역/품목별)
- 온라인 배출 신청
- 재활용 역경매 (물품 등록/관리)
- 오프라인 수거 정보 (스티커판매소, 주민센터, 운반업체)
