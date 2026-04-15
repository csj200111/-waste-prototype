# Throw It - 대형폐기물 배출 도우미

대형폐기물 수수료 조회, 온라인 배출 신청, 오프라인 배출 안내,
나눔 커뮤니티, AI 폐기물 판독, 재활용 역경매를 제공하는
모바일 우선 웹 서비스입니다.

**전국 17개 시도, 131개 시군구, 22,819건 수수료 데이터**를
기반으로 실서비스 수준의 기능을 제공합니다.

---

## 3분 빠른 시작 (TL;DR)

> 상세 설명 없이 바로 실행하고 싶은 분을 위한 요약입니다.
> 문제가 생기면 아래 [트러블슈팅](#트러블슈팅) 섹션을 확인하세요.

```bash
# 1. 클론
git clone https://github.com/csj200111/throw_it.git
cd throw_it

# 2. MySQL DB 생성 + 데이터 Import (mysql 접속 후)
#    mysql -u root -p
#    CREATE DATABASE waste_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
#    exit;
mysql -u root -p waste_db < backend/src/main/resources/sql/schema.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/large_waste_fee_data.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/waste_facility_data.sql

# 3. 백엔드 설정 + 실행
#    backend/src/main/resources/application-local.yml 파일 생성:
#    spring:
#      datasource:
#        username: root
#        password: 본인_MySQL_비밀번호
cd backend
gradlew.bat bootRun          # Windows
# ./gradlew bootRun          # macOS (최초: chmod +x ./gradlew)

# 4. 프론트엔드 실행 (새 터미널)
cd ../frontend
cp .env.example .env         # Windows cmd: copy .env.example .env
# .env 파일에서 VITE_MAP_API_KEY에 카카오맵 키 입력 (아래 주의사항 참고)

.env 파일을 만들어서 .env.example 에 있는 내용처럼 작성하면 됨.

npm ci
npm run dev
```

> **카카오맵 API 키 관련 주의사항**
>
> 카카오맵 키가 없으면 지도가 Placeholder로 대체되는 것 외에,
> **"현재 위치로 설정" 기능도 정상 작동하지 않습니다.**
> GPS 좌표는 잡히지만 카카오 역지오코딩(좌표 -> 주소 변환)이 실패하여
> 주소가 표시되지 않고, "위치 정보를 가져올 수 없습니다" 알림이 뜹니다.
>
> 위치 기능을 포함한 전체 테스트가 필요하면
> [Kakao Developers](https://developers.kakao.com/)에서 키를 발급받으세요.
> (무료, 1분 소요: 애플리케이션 추가 -> 플랫폼에 `http://localhost:5173` 등록 -> JavaScript 키 복사)
> 모바일 환경으로도 테스트 하고 싶다면 자신의 컴퓨터 ip 주소를 ipconfig 명령으로 "IPv4 Address" (또는 "IPv4 주소") 항목 확인 -> https://ip주소:5173 를 카카오 플랫폼에 등록 후 해당 주소로 모바일 접속.

> 주의! 서버를 연 컴퓨터와 모바일이 같은 인터넷에 연결이 되어있다는 가정하에 진행할 것.

> 주의! kakao Developers 앱 설정에서 카카오맵 -> 사용설정 -> 상태 ON 설정을 해줘야함.
> URL 입력은 키 설정에서 하는것임. 앱 대표 도메인 설정에서 하는 것이 아니다.

**실행 확인 체크리스트:**

| 단계 | 확인 방법 | 기대 결과 |
|------|-----------|-----------|
| DB | `mysql -u root -p -e "SELECT COUNT(*) FROM waste_db.large_waste_fee"` | 22819 |
| 백엔드 | 브라우저에서 `http://localhost:8080/api/regions/sido` | 시도 목록 JSON |
| 프론트엔드 | 브라우저에서 `https://localhost:5173` | 온보딩 화면 (HTTPS 경고 허용 필요) |

---

## 목차

- [기술 스택](#기술-스택)
- [개발 환경](#개발-환경-테스트-검증-완료)
- [macOS 기초 세팅](#macos-기초-세팅-처음부터-끝까지)
- [설치 및 실행 (Quick Start)](#설치-및-실행-quick-start)
- [환경변수](#환경변수)
- [프로젝트 구조](#프로젝트-구조)
- [주요 기능](#주요-기능)
- [기능 테스트 가이드](#기능-테스트-가이드)
- [API 엔드포인트](#api-엔드포인트-49개)
- [백엔드 아키텍처](#백엔드-아키텍처)
- [빌드 및 배포](#빌드-및-배포)
- [트러블슈팅](#트러블슈팅)
- [참고 사항](#참고-사항)

---

## 기술 스택

| 구분               | 기술                     | 버전                                     |
| ------------------ | ------------------------ | ---------------------------------------- |
| **Backend**        | Java + Spring Boot       | Java 17 (toolchain), Spring Boot 3.4.5   |
| **Build (BE)**     | Gradle                   | 8.14 (Wrapper 포함)                      |
| **ORM**            | Spring Data JPA          | Hibernate 6.x                            |
| **Database**       | MySQL                    | 8.0                                      |
| **Frontend**       | React + TypeScript       | React 19.2.0, TS ~5.9.3                  |
| **Build (FE)**     | Vite                     | 7.3.1                                    |
| **Styling**        | Tailwind CSS             | 4.1.18                                   |
| **State**          | Zustand                  | 5.0.11                                   |
| **Server State**   | TanStack React Query     | 5.90.21                                  |
| **Form**           | React Hook Form          | 7.71.1                                   |
| **Routing**        | React Router DOM         | 7.13.0                                   |
| **Map**            | Kakao Maps SDK           | Latest                                   |
| **AI Server**      | Python Flask + YOLOv8    | Flask 3.1.0, Ultralytics 8.4+            |
| **AI Model**       | YOLOv8n (68클래스)       | best.pt (Git 포함)                       |
| **AI 파손판별**    | YOLOv8s-cls              | damage.pt (선택, 파손/스크래치 분류)     |

---

## 개발 환경 (테스트 검증 완료)

아래는 실제 개발 및 테스트에 사용한 정확한 환경입니다.
**동일한 환경에서 테스트하면 문제없이 동작합니다.**

| 도구         | 검증 완료 버전                         | 확인 명령어         |
| ------------ | -------------------------------------- | ------------------- |
| **OS**       | Windows 10/11 (64bit)                  | -                   |
| **Node.js**  | v22.18.0                               | `node -v`           |
| **npm**      | 10.9.3                                 | `npm -v`            |
| **Java**     | OpenJDK 24.0.2                         | `java -version`     |
| **MySQL**    | 8.0.43                                 | `mysql --version`   |
| **Python**   | 3.13.7 (AI 서버용, 선택)              | `python --version`  |
| **Git**      | 2.45.1                                 | `git --version`     |
| **Gradle**   | 8.14 (Wrapper 포함, 별도 설치 불필요)  | -                   |

### 최소 요구 버전

| 도구      | 최소 버전 | 용도                                        |
| --------- | --------- | ------------------------------------------- |
| Node.js   | 18+       | 프론트엔드                                  |
| npm       | 9+        | 프론트엔드 패키지 관리                      |
| Java      | 17+       | 백엔드 (build.gradle.kts에서 toolchain 지정)|
| MySQL     | 8.0+      | 데이터베이스                                |
| Python    | 3.9+      | AI 서버 (선택)                              |
| Git       | 2.x       | 형상관리                                    |

> **Gradle은 별도 설치 불필요**합니다.
> 프로젝트에 포함된 Gradle Wrapper(`gradlew.bat`)가
> 자동으로 8.14 버전을 다운로드합니다.
>
> **AI 서버는 선택사항**입니다.
> AI 폐기물 판독 기능을 사용하지 않으려면
> Python 설치를 건너뛸 수 있습니다.

---

### macOS 기초 세팅 (처음부터 끝까지)

macOS에서 이 프로젝트를 실행하기 위한 전체 세팅 가이드입니다.
Windows 개발 환경과 **동일한 결과**를 얻을 수 있도록 단계별로 안내합니다.

#### 1. Xcode Command Line Tools 설치

macOS에서 개발 도구를 사용하려면 먼저 Command Line Tools가 필요합니다.

```bash
xcode-select --install
```

> 팝업이 나타나면 "설치"를 클릭합니다.
> 이미 설치되어 있으면 무시해도 됩니다.

#### 2. Homebrew 설치

macOS의 패키지 관리자인 [Homebrew](https://brew.sh/)를 설치합니다.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Apple Silicon (M1/M2/M3/M4) Mac인 경우**
설치 후 아래 명령어를 추가로 실행합니다:

```bash
# Homebrew PATH 등록 (설치 완료 후 터미널에 안내 메시지가 나옵니다)
echo >> ~/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

> Intel Mac은 Homebrew가 `/usr/local`에 설치되므로
> 별도 PATH 설정이 필요 없습니다.

설치 확인:

```bash
brew --version   # Homebrew 4.x 이상
```

#### 3. Node.js 설치 (프론트엔드용)

```bash
brew install node
```

확인:

```bash
node -v   # v18+ (권장: v22.x)
npm -v    # 9+  (권장: 10.x)
```

#### 4. JDK 설치 (백엔드용)

프로젝트의 `build.gradle.kts`에서 Java toolchain 17을 지정하고 있으므로
**JDK 17 이상**이면 됩니다.

```bash
# OpenJDK 17 설치 (안정적인 LTS 버전)
brew install openjdk@17
```

**Java 환경변수 설정** (필수):

```bash
# 시스템에서 Java를 인식하도록 심볼릭 링크 생성
sudo ln -sfn $(brew --prefix openjdk@17)/libexec/openjdk.jdk \
  /Library/Java/JavaVirtualMachines/openjdk-17.jdk

# PATH에 Java 추가
echo '' >> ~/.zshrc
echo '# Java (OpenJDK 17)' >> ~/.zshrc
echo 'export PATH="$(brew --prefix openjdk@17)/bin:$PATH"' >> ~/.zshrc
echo 'export JAVA_HOME="$(brew --prefix openjdk@17)/libexec/openjdk.jdk/Contents/Home"' >> ~/.zshrc

# 현재 터미널에 즉시 적용
source ~/.zshrc
```

확인:

```bash
java -version    # openjdk version "17.x.x" 이상
javac -version   # 17.x.x 이상
echo $JAVA_HOME  # /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
```

> **JDK 17 대신 최신 버전(21, 24 등)을 설치해도 됩니다.**
> `brew install openjdk` 명령으로 최신 버전을 설치할 수 있으며,
> 위 경로에서 `openjdk@17`을 `openjdk`로 변경하면 됩니다.
> 개발 환경에서는 JDK 24도 정상 동작 확인됨.

#### 5. MySQL 8.0 설치 및 설정

```bash
brew install mysql@8.0
```

**MySQL 서비스 시작**:

```bash
brew services start mysql@8.0
```

**MySQL PATH 설정** (mysql 명령어가 안 되는 경우):

```bash
echo 'export PATH="$(brew --prefix mysql@8.0)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**root 비밀번호 설정**:

```bash
# 초기 보안 설정 (root 비밀번호 설정 포함)
mysql_secure_installation
```

> `mysql_secure_installation` 실행 시 안내에 따라:
>
> 1. VALIDATE PASSWORD 컴포넌트 → `N` (개발 환경에서는 불필요)
> 2. root 비밀번호 설정 → **원하는 비밀번호 입력**
>    (이후 `application-local.yml`에 사용)
> 3. 나머지 질문 → 모두 `Y`

**MySQL 접속 테스트**:

```bash
mysql -u root -p
# 설정한 비밀번호 입력 후 mysql> 프롬프트가 나타나면 성공
exit;
```

> **Homebrew MySQL은 기본적으로 root 비밀번호가 빈 문자열**입니다.
> `mysql_secure_installation`을 실행하지 않으면
> `mysql -u root`로 비밀번호 없이 접속됩니다.
> 프로젝트 실행 시 `application-local.yml`의 password를
> 비워두거나 빈 문자열(`""`)로 설정하면 됩니다.

#### 6. Python 설치 (AI 서버용 - 선택)

AI 폐기물 판독 기능을 사용하지 않으면 이 단계를 건너뛰세요.

```bash
brew install python@3.13
```

확인:

```bash
python3 --version   # 3.9+ (권장: 3.13.x)
pip3 --version      # pip 24+
```

> macOS에서는 `python` 대신 **`python3`**,
> `pip` 대신 **`pip3`**를 사용합니다.

#### 7. Git 확인

macOS는 Xcode Command Line Tools에 Git이 포함되어 있습니다.

```bash
git --version   # 2.x 이상
```

#### 8. 전체 설치 확인 (체크리스트)

모든 설치가 완료되면 아래 명령어로 한 번에 확인합니다:

```bash
echo "=== 개발 환경 확인 ==="
echo "Node.js: $(node -v)"
echo "npm:     $(npm -v)"
echo "Java:    $(java -version 2>&1 | head -1)"
echo "MySQL:   $(mysql --version)"
echo "Git:     $(git --version)"
echo "Python:  $(python3 --version 2>/dev/null || echo '미설치 (선택사항)')"
echo "Homebrew: $(brew --version | head -1)"
```

예상 출력:

```
=== 개발 환경 확인 ===
Node.js: v22.x.x
npm:     10.x.x
Java:    openjdk version "17.x.x" ...
MySQL:   mysql  Ver 8.0.x ...
Git:     git version 2.x.x
Python:  Python 3.13.x
Homebrew: Homebrew 4.x.x
```

#### 9. Windows → macOS 명령어 대응표

| 작업                   | Windows                              | macOS                              |
| ---------------------- | ------------------------------------ | ---------------------------------- |
| Gradle 실행            | `gradlew.bat bootRun`                | `./gradlew bootRun`               |
| Gradle 권한 부여       | (불필요)                             | `chmod +x ./gradlew`              |
| 파일 복사              | `copy .env.example .env`             | `cp .env.example .env`            |
| Python 가상환경 활성화 | `venv\Scripts\activate`              | `source venv/bin/activate`         |
| Python 실행            | `python app.py`                      | `python3 app.py`                  |
| pip 실행               | `pip install -r requirements.txt`    | `pip3 install -r requirements.txt` |
| MySQL 서비스 시작      | 서비스 관리자 / `net start mysql`    | `brew services start mysql@8.0`   |
| MySQL 서비스 중지      | `net stop mysql`                     | `brew services stop mysql@8.0`    |
| 포트 사용 확인         | `netstat -ano \| findstr :8080`      | `lsof -i :8080`                   |
| 프로세스 종료          | `taskkill /PID <PID> /F`             | `kill -9 <PID>`                   |
| 디렉토리 생성          | `mkdir model`                        | `mkdir -p model`                  |

---

## 설치 및 실행 (Quick Start)

> Windows와 macOS 명령어를 모두 표기합니다.
> 본인 OS에 맞는 명령어를 사용하세요.
>
> macOS 사용자는 먼저 위의
> [macOS 기초 세팅](#macos-기초-세팅-처음부터-끝까지)을 완료해 주세요.

### 1. 프로젝트 클론

```bash
git clone https://github.com/csj200111/throw_it.git
cd throw_it
```

### 2. MySQL 데이터베이스 설정

MySQL이 설치되어 있어야 합니다.

- Windows: [MySQL 8.0 다운로드](https://dev.mysql.com/downloads/mysql/)
- macOS: `brew install mysql@8.0 && brew services start mysql@8.0`
  (위 세팅 가이드 참고)

```sql
-- MySQL 접속
mysql -u root -p
-- macOS에서 비밀번호 설정 안 했으면: mysql -u root

CREATE DATABASE waste_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
exit;
```

공공데이터 초기화 (테이블 생성 및 데이터 로드):

```bash
# 반드시 아래 순서대로 실행
# 프로젝트 루트 디렉토리에서 실행

# Windows (cmd 또는 Git Bash)
mysql -u root -p waste_db < backend/src/main/resources/sql/schema.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/large_waste_fee_data.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/waste_facility_data.sql

# macOS (터미널)
mysql -u root -p waste_db < backend/src/main/resources/sql/schema.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/large_waste_fee_data.sql
mysql -u root -p waste_db < backend/src/main/resources/sql/waste_facility_data.sql
```

> **실행 순서 중요**:
> `schema.sql` → `large_waste_fee_data.sql` → `waste_facility_data.sql`
>
> Windows PowerShell에서 `<` 리다이렉션이 안 되면
> cmd로 전환하거나 Git Bash를 사용하세요.
>
> macOS에서 `mysql` 명령어가 안 되면:
> `echo 'export PATH="$(brew --prefix mysql@8.0)/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc`

**[체크포인트] 데이터 Import 확인**:

```sql
mysql -u root -p

USE waste_db;

SELECT COUNT(*) FROM large_waste_fee;
-- 결과: 22819 (정상) ← 이 숫자가 나오면 성공!

SELECT COUNT(DISTINCT 시도명) FROM large_waste_fee;
-- 결과: 18 (전국 17개 시도 + 세종특별자치시)

exit;
```

> 22819가 아닌 다른 숫자가 나오거나 에러가 발생하면
> SQL 파일 실행 순서(schema -> fee_data -> facility_data)를 다시 확인하세요.

### 3. 백엔드 실행

`backend/src/main/resources/application-local.yml` 파일을
**새로 생성**하고 본인의 MySQL 계정 정보를 입력합니다:

```yaml
spring:
  datasource:
    username: root
    password: 본인_MySQL_비밀번호
```

> 이 파일은 `.gitignore`에 등록되어 있어 Git에 올라가지 않습니다.
>
> macOS에서 Homebrew MySQL을 비밀번호 없이 사용 중이면
> password를 빈 문자열(`""`)로 설정하세요.

```bash
# 프로젝트 루트에서 실행
cd backend

# Windows (cmd / PowerShell / Git Bash 모두 가능)
gradlew.bat bootRun

# macOS / Linux
chmod +x ./gradlew    # 최초 1회: 실행 권한 부여
./gradlew bootRun
```

백엔드 서버: `http://localhost:8080`

> **[체크포인트] 정상 실행 확인**:
> 브라우저에서 `http://localhost:8080/api/regions/sido` 접속 시
> 시도 목록 JSON 응답이 나오면 성공!
>
> 첫 실행 시 Gradle이 자동으로 필요한 의존성을
> 다운로드합니다 (약 2-5분 소요).
>
> **macOS 참고**: `Permission denied` 에러가 나면
> `chmod +x ./gradlew`를 실행했는지 확인하세요.

### 4. 프론트엔드 실행

```bash
# 프로젝트 루트에서 실행 (백엔드와 별도 터미널)
cd frontend

# .env 파일 생성
# Windows cmd
copy .env.example .env

# macOS / Git Bash / Linux
cp .env.example .env

# .env 파일을 열어 VITE_MAP_API_KEY에 카카오맵 API 키를 입력
# (카카오맵 키가 없으면 비워두어도 됨 - 단, 지도와 위치 설정 기능 제한됨)

npm install
npm run dev
```

프론트엔드: `https://localhost:5173` (HTTPS)

> **[체크포인트] HTTPS 인증서 경고 처리**:
> 자체 서명 SSL 인증서를 사용하므로 브라우저에서 경고가 표시됩니다.
> **이 경고를 허용하지 않으면 위치 권한 등 주요 기능이 작동하지 않습니다.**
>
> - Chrome: "고급" -> "localhost(안전하지 않음)으로 이동" 클릭
> - Safari (macOS): "세부사항 보기" -> "이 웹 사이트 방문" 클릭
> - Edge: "세부 정보" -> "웹 페이지로 이동" 클릭
>
> 경고를 허용한 후 온보딩 화면(지역 설정)이 나타나면 성공!
>
> **모바일 뷰 권장**:
> 모바일 UI 기준이므로 브라우저 개발자 도구(F12)에서
> **모바일 뷰(428px 이하)**로 전환하면 최적화된 화면을 볼 수 있습니다.

### 5. AI 서버 실행 (선택)

AI 폐기물 판독 기능을 사용하려면 아래 추가 설정이 필요합니다.

```bash

# 프로젝트 루트에서 실행 (백엔드/프론트와 별도 터미널)
cd ai-server

# --- Windows ---
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py

# --- macOS ---
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
python3 app.py
```

AI 서버: `http://localhost:5001`

> **정상 실행 확인**:
> `http://localhost:5001/health` 접속 시
> `{"status": "healthy", ...}` 응답
>
> **참고**: AI 모델 파일(`best.pt`)은 Git에 포함되어 있으므로
> 클론 후 별도 준비 없이 바로 실행할 수 있습니다.
> AI 서버 없이도 나머지 모든 기능은 정상 작동합니다.
>
> **macOS Apple Silicon (M1/M2/M3/M4) 참고**:
> PyTorch/YOLO 설치 시 ARM 호환 버전이 자동으로 설치됩니다.
> `pip3 install` 과정에서 빌드 오류가 발생하면
> `pip3 install --upgrade pip setuptools wheel`을 먼저 실행하세요.

### 실행 요약 (총 3개 터미널)

**Windows:**

| 터미널          | 디렉토리     | 명령어               | 주소                   |
| --------------- | ------------ | -------------------- | ---------------------- |
| 1 (백엔드)      | `backend/`   | `gradlew.bat bootRun`| http://localhost:8080  |
| 2 (프론트)      | `frontend/`  | `npm run dev`        | https://localhost:5173 |
| 3 (AI, 선택)    | `ai-server/` | `python app.py`      | http://localhost:5001  |

**macOS:**

| 터미널          | 디렉토리     | 명령어               | 주소                   |
| --------------- | ------------ | -------------------- | ---------------------- |
| 1 (백엔드)      | `backend/`   | `./gradlew bootRun`  | http://localhost:8080  |
| 2 (프론트)      | `frontend/`  | `npm run dev`        | https://localhost:5173 |
| 3 (AI, 선택)    | `ai-server/` | `python3 app.py`     | http://localhost:5001  |

---

## 환경변수

### Backend (`backend/src/main/resources/application-local.yml`)

| 변수                          | 기본값 | 설명            |
| ----------------------------- | ------ | --------------- |
| `spring.datasource.username`  | root   | MySQL 사용자명  |
| `spring.datasource.password`  | (없음) | MySQL 비밀번호  |

### Frontend (`frontend/.env`)

| 변수                 | 기본값                  | 설명                      |
| -------------------- | ----------------------- | ------------------------- |
| `VITE_API_BASE_URL`  | `http://localhost:8080` | 백엔드 API 서버 주소      |
| `VITE_MAP_API_KEY`   | (없음)                  | 카카오맵 JavaScript API 키|

> 카카오맵 API 키 발급:
> [Kakao Developers](https://developers.kakao.com/)
> → 애플리케이션 추가 → JavaScript 키 복사

### Backend 기본 설정 (`application.yml`)

| 항목             | 값                                     | 설명                   |
| ---------------- | -------------------------------------- | ---------------------- |
| 서버 포트        | 8080                                   | Spring Boot 서버       |
| DB URL           | `jdbc:mysql://localhost:3306/waste_db`  | MySQL 연결             |
| JPA ddl-auto     | update                                 | 엔티티 기반 자동 업데이트 |
| AI 서버 URL      | `http://localhost:5001`                | Flask AI 서버          |
| 파일 업로드 제한 | 50MB                                   | multipart 최대 크기    |

---

## 프로젝트 구조

```
throw_it/
│
├── frontend/                      # 프론트엔드 (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/            # 공통 UI 컴포넌트
│   │   │   ├── layout/            #   Header, BottomNav, MobileContainer, ProgressBar
│   │   │   ├── ui/                #   Button, Card, Input, Modal, DatePicker 등
│   │   │   ├── waste/             #   CategoryTree, WasteItemCard, FeeResultCard 등
│   │   │   ├── map/               #   MapView, MapPlaceholder, LocationCard 등
│   │   │   └── sharing/           #   SharingPostCard, ChatBubble, PhotoUploader
│   │   │
│   │   ├── features/              # 기능별 컴포넌트 및 훅
│   │   │   ├── auth/              #   AuthContext (로그인/회원가입 상태)
│   │   │   ├── disposal/          #   DisposalForm, ReviewSummary, PaymentForm
│   │   │   ├── fee/               #   useFeeCheck
│   │   │   ├── mypage/            #   ApplicationList, ApplicationCard, ReceiptView
│   │   │   └── recycle/           #   RecycleRegisterForm, RecycleItemCard
│   │   │
│   │   ├── pages/                 # 페이지 컴포넌트 (41개)
│   │   │   ├── auth/              #   로그인, 회원가입
│   │   │   ├── onboarding/        #   온보딩 (첫 접속 시 지역 설정)
│   │   │   ├── location/          #   자동/수동 위치 설정
│   │   │   ├── fee-check/         #   수수료 조회 (검색, 확인, 결과)
│   │   │   ├── online/            #   온라인 배출 (신청, 검수, 결제, 완료)
│   │   │   ├── offline/           #   오프라인 안내 (판매소, 주민센터 등)
│   │   │   ├── sharing/           #   나눔 커뮤니티 (목록, 상세, 등록, 채팅)
│   │   │   ├── recycle/           #   재활용 역경매 (목록, 등록)
│   │   │   ├── ai/                #   AI 판독 (선택, 카메라, 갤러리, 결과)
│   │   │   ├── mypage/            #   마이페이지 (신청내역, 영수증 등)
│   │   │   ├── notifications/     #   알림
│   │   │   ├── guide/             #   이용 가이드
│   │   │   └── free-collection/   #   무료 수거
│   │   │
│   │   ├── services/              # API 서비스 레이어 (11개)
│   │   ├── stores/                # 상태 관리 - Zustand
│   │   ├── lib/                   # 유틸리티 (apiClient, MapAdapter)
│   │   ├── types/                 # TypeScript 타입 정의
│   │   ├── router/                # 라우터 설정
│   │   ├── App.tsx                # 루트 컴포넌트 (인증/온보딩 가드)
│   │   └── main.tsx               # 엔트리 포인트
│   │
│   ├── .env.example               # 환경변수 템플릿
│   ├── package.json               # 프론트엔드 의존성
│   ├── vite.config.ts             # Vite 설정 (프록시, SSL, path alias)
│   └── tsconfig.json              # TypeScript 설정
│
├── backend/                       # 백엔드 (Spring Boot 3.4.5 + Java 17)
│   ├── src/main/java/com/throwit/
│   │   ├── domain/
│   │   │   ├── user/              #   사용자 인증 (회원가입/로그인)
│   │   │   ├── fee/               #   수수료/지역/폐기물 조회 (핵심)
│   │   │   ├── disposal/          #   온라인 배출 신청/결제
│   │   │   ├── recycle/           #   재활용 역경매
│   │   │   ├── offline/           #   오프라인 시설 (판매소/주민센터)
│   │   │   ├── sharing/           #   나눔 커뮤니티 게시글
│   │   │   │   └── chat/          #     나눔 채팅 메시지
│   │   │   ├── notification/      #   사용자 알림
│   │   │   └── ai/                #   AI 폐기물 판독 (Flask 프록시)
│   │   └── global/
│   │       ├── config/            #   CORS 설정
│   │       └── exception/         #   전역 예외 처리
│   │
│   ├── src/main/resources/
│   │   ├── application.yml        # 메인 설정
│   │   ├── application-local.yml  # 로컬 DB 설정 (직접 생성, Git 미포함)
│   │   └── sql/                   # DB 초기화 스크립트 (3개)
│   │
│   ├── build.gradle.kts           # Gradle 빌드 설정
│   └── gradlew / gradlew.bat      # Gradle Wrapper
│
├── ai-server/                     # AI 서버 (Python Flask + YOLOv8)
│   ├── app.py                     #   Flask 서버 (/predict, /health)
│   ├── requirements.txt           #   Python 의존성
│   └── model/
│       ├── best.pt                #   YOLOv8n 탐지 모델 (68클래스, Git 포함)
│       └── damage.pt              #   YOLOv8s-cls 파손 분류 모델 (선택)
│
└── .gitignore                     # Git 제외 파일 목록
```

---

## 주요 기능

| #   | 기능           | 설명                                                       | 인증 |
| --- | -------------- | ---------------------------------------------------------- | :--: |
| 1   | 수수료 조회    | 시도/시군구 + 카테고리 + 폐기물 + 규격 기반 수수료 조회    |  -   |
| 2   | 오프라인 안내  | 스티커 판매소 / 주민센터 (카카오맵) / 처리 시설             |  -   |
| 3   | 온라인 배출    | 신청서 작성 → 검수 → 결제(UI) → 배출번호 발급              | Yes  |
| 4   | 재활용 역경매  | 물품 사진 업로드 + 등록/관리/삭제                           | Yes  |
| 5   | 나눔 커뮤니티  | 무료 나눔 게시글 CRUD + 1:1 채팅                           | Yes  |
| 6   | AI 폐기물 판독 | 카메라/갤러리 → YOLO 기반 폐기물 종류 + 파손 여부 자동 인식|  -   |
| 7   | 알림           | 배출 상태 변경, 나눔 채팅 수신 등 실시간 알림              | Yes  |
| 8   | 마이페이지     | 신청 내역, 취소/환불, 전자 영수증, 나눔 이력, 결제수단     | Yes  |
| 9   | 사용자 인증    | 이메일/비밀번호 회원가입 및 로그인 (솔트 기반 해싱)        |  -   |

---

## 기능 테스트 가이드

### 온보딩 (첫 접속)

- URL: `/onboarding`
- 첫 접속 시 지역(시도/시군구) 설정 화면 자동 표시
- 자동 위치(`/location/auto`) 또는 수동 선택(`/location/manual`) 가능

### 홈 화면

- URL: `/`
- 수수료 조회, 오프라인 배출, 온라인 배출,
  나눔 커뮤니티, AI 판독, 재활용 역경매 메뉴

### 수수료 조회

- `/fee-check`         → 시도/시군구 선택 → 카테고리 필터 → 폐기물 검색
- `/fee-check/search`  → 폐기물 항목 검색 결과
- `/fee-check/confirm` → 항목 확인
- `/fee-check/result`  → 규격별 수수료 결과

### 오프라인 배출 안내

| 기능             | URL                        | 설명                              |
| ---------------- | -------------------------- | --------------------------------- |
| 오프라인 메인    | `/offline`                 | 메뉴 카드 (판매소/주민센터 등)    |
| 통합 지도 검색   | `/offline/map`             | 스티커 판매소 / 주민센터 카카오맵 |

### 온라인 배출 신청

1. `/online`          → 4단계 프로세스 안내
2. `/online/search`   → 폐기물 항목 검색 (지역 + 카테고리 + 키워드)
3. `/online/confirm`  → 선택 항목 확인
4. `/online/payment`  → 수수료 결제 (카드/계좌이체 UI)
5. `/online/complete` → 배출 번호 발급 + 영수증 링크

### 나눔 커뮤니티

| 기능       | URL                            | 설명                   |
| ---------- | ------------------------------ | ---------------------- |
| 나눔 목록  | `/sharing`                     | 나눔 게시글 목록       |
| 나눔 상세  | `/sharing/:id`                 | 게시글 상세 + 채팅     |
| 나눔 등록  | `/sharing/register`            | 게시글 등록 (사진)     |
| 나눔 수정  | `/sharing/:id/edit`            | 게시글 수정            |
| 채팅 목록  | `/sharing/:id/chatters`        | 게시글별 채팅 목록     |
| 1:1 채팅   | `/sharing/:id/chat`            | 실시간 채팅            |

### AI 폐기물 판독

| 기능         | URL            | 설명                                |
| ------------ | -------------- | ----------------------------------- |
| AI 메인      | `/ai-predict`  | AI 판독 소개                        |
| 방식 선택    | `/ai/predict`  | 카메라 / 갤러리 선택                |
| 카메라 촬영  | `/ai/camera`   | 실시간 카메라 촬영                  |
| 갤러리 업로드| `/ai/gallery`  | 기존 사진 업로드                    |
| 판독 결과    | `/ai/result`   | YOLO 분석 결과 (종류 + 파손 + 신뢰도)|

### 인증

| 기능     | URL       | 설명                       |
| -------- | --------- | -------------------------- |
| 로그인   | `/login`  | 이메일/비밀번호 로그인     |
| 회원가입 | `/signup` | 이메일/비밀번호/닉네임 가입|

### 마이페이지

| 기능           | URL                           | 설명              |
| -------------- | ----------------------------- | ----------------- |
| 마이페이지     | `/mypage`                     | 메뉴 목록         |
| 배출 신청 내역 | `/mypage/disposal`            | 신청 목록         |
| 배출 상세      | `/mypage/disposal/:id`        | 신청 상세 + 취소  |
| 나눔 이력      | `/mypage/sharing`             | 내 나눔 활동      |
| 구매 이력      | `/mypage/purchases`           | 구매 내역         |
| 결제수단 관리  | `/mypage/payment-methods`     | 카드/계좌 관리    |
| 결제수단 추가  | `/mypage/payment-methods/add` | 새 결제수단 등록  |
| 스크랩         | `/mypage/scraps`              | 스크랩한 게시글   |
| 설정           | `/mypage/settings`            | 앱 설정           |
| 프로필 수정    | `/mypage/settings/profile`    | 닉네임 등 수정    |

### 알림

- URL: `/notifications` → 알림 목록 + 읽음 처리

### 무료 수거

- URL: `/free-collection` → 무상수거 안내

### 이용 가이드

- URL: `/guide` → 서비스 이용 방법 안내

---

## API 엔드포인트 (49개)

### 인증 API

| Method | Endpoint                    | 설명                         |
| ------ | --------------------------- | ---------------------------- |
| POST   | `/api/auth/signup`          | 회원가입                     |
| POST   | `/api/auth/login`           | 로그인                       |
| GET    | `/api/auth/me`              | 내 정보 조회 (X-User-Id 헤더)|
| GET    | `/api/auth/check-nickname`  | 닉네임 중복 확인             |
| PUT    | `/api/auth/profile`         | 프로필 수정 (X-User-Id)      |
| DELETE | `/api/auth/account`         | 회원 탈퇴 (X-User-Id)        |

### 지역/폐기물/수수료 API

| Method | Endpoint                            | 설명               |
| ------ | ----------------------------------- | ------------------ |
| GET    | `/api/regions/sido`                 | 시도 목록          |
| GET    | `/api/regions/sigungu?sido=...`     | 시군구 목록        |
| GET    | `/api/waste/categories`             | 폐기물 카테고리    |
| GET    | `/api/waste/items?sigungu=&category=&keyword=` | 폐기물 항목 검색 |
| GET    | `/api/fees?sido=&sigungu=&wasteName=`          | 수수료 조회       |
| GET    | `/api/fees/by-waste-name?sido=&sigungu=&wasteName=` | 폐기물명 기반 수수료 조회 |

### 배출 신청 API

| Method | Endpoint                        | 설명                         |
| ------ | ------------------------------- | ---------------------------- |
| POST   | `/api/disposals`                | 배출 신청 생성               |
| GET    | `/api/disposals/my`             | 내 신청 목록 (X-User-Id)     |
| GET    | `/api/disposals/{id}`           | 신청 상세 조회               |
| PATCH  | `/api/disposals/{id}/cancel`    | 신청 취소                    |
| DELETE | `/api/disposals/{id}`           | 신청 삭제                    |
| POST   | `/api/disposals/{id}/payment`   | 결제 처리 (UI)               |

### 역경매 API

| Method | Endpoint                                  | 설명                     |
| ------ | ----------------------------------------- | ------------------------ |
| GET    | `/api/recycle/items?sigungu=...`          | 역경매 물품 목록         |
| GET    | `/api/recycle/items/my`                   | 내 물품 목록 (X-User-Id) |
| POST   | `/api/recycle/items`                      | 물품 등록                |
| PATCH  | `/api/recycle/items/{id}/status?status=...`| 상태 변경               |
| DELETE | `/api/recycle/items/{id}`                 | 물품 삭제                |

### 오프라인 API

| Method | Endpoint                                   | 설명              |
| ------ | ------------------------------------------ | ----------------- |
| GET    | `/api/offline/sticker-shops?sigungu=...`   | 스티커 판매소     |
| GET    | `/api/offline/centers?sigungu=...`         | 주민센터          |
| GET    | `/api/offline/transport?sigungu=...`       | 운반 업체         |
| GET    | `/api/offline/waste-facilities?sido=&sigungu=` | 폐기물 처리 시설 |

### 나눔 커뮤니티 API

| Method | Endpoint                      | 설명                         |
| ------ | ----------------------------- | ---------------------------- |
| GET    | `/api/sharing`                | 게시글 목록                  |
| GET    | `/api/sharing/{id}`           | 게시글 상세                  |
| POST   | `/api/sharing`                | 게시글 등록                  |
| PUT    | `/api/sharing/{id}`           | 게시글 수정                  |
| DELETE | `/api/sharing/{id}`           | 게시글 삭제                  |
| POST   | `/api/sharing/{id}/scrap`     | 스크랩 토글 (X-User-Id)      |
| GET    | `/api/sharing/{id}/scrap`     | 스크랩 여부 확인 (X-User-Id) |
| GET    | `/api/sharing/scraps`         | 내 스크랩 목록 (X-User-Id)   |
| GET    | `/api/sharing/chatted`        | 채팅한 게시글 목록 (X-User-Id)|
| PATCH  | `/api/sharing/{id}/complete`  | 나눔 완료 처리 (X-User-Id)   |
| PATCH  | `/api/sharing/{id}/cancel`    | 나눔 취소 처리 (X-User-Id)   |
| GET    | `/api/sharing/received`       | 받은 나눔 목록 (X-User-Id)   |

### 채팅 API

| Method | Endpoint                                          | 설명           |
| ------ | ------------------------------------------------- | -------------- |
| GET    | `/api/sharing/{postId}/chat/rooms`                | 채팅방 목록    |
| POST   | `/api/sharing/{postId}/chat/rooms`                | 채팅방 생성    |
| GET    | `/api/sharing/{postId}/chat/rooms/{roomId}/messages`  | 메시지 목록 |
| POST   | `/api/sharing/{postId}/chat/rooms/{roomId}/messages`  | 메시지 전송 |
| PATCH  | `/api/sharing/{postId}/chat/rooms/{roomId}/read`      | 읽음 처리   |

### 알림 API

| Method | Endpoint                          | 설명                |
| ------ | --------------------------------- | ------------------- |
| GET    | `/api/notifications`              | 알림 목록 (X-User-Id)|
| GET    | `/api/notifications/unread-count` | 읽지 않은 알림 수   |
| PATCH  | `/api/notifications/{id}/read`    | 알림 읽음 처리      |
| PATCH  | `/api/notifications/read-all`     | 전체 읽음 처리      |

### AI 판독 API

| Method | Endpoint          | 설명                                    |
| ------ | ----------------- | --------------------------------------- |
| POST   | `/api/ai/predict` | 이미지 기반 폐기물 판독 (multipart)     |

---

## 백엔드 아키텍처

### 도메인 구조 (8개 도메인)

| 도메인        | Controller              | Service              | Entity                      |
| ------------- | ----------------------- | -------------------- | --------------------------- |
| user          | AuthController          | AuthService          | User                        |
| fee           | LargeWasteFeeController | LargeWasteFeeService | LargeWasteFee               |
| disposal      | DisposalController      | DisposalService      | DisposalApplication/Item    |
| recycle       | RecycleController       | RecycleService       | RecycleItem                 |
| offline       | OfflineController       | OfflineService       | WasteFacility               |
| sharing       | SharingPostController   | SharingPostService   | SharingPost                 |
| sharing.chat  | ChatMessageController   | ChatMessageService   | ChatRoom, ChatMessage       |
| notification  | NotificationController  | NotificationService  | Notification                |
| ai            | AiPredictionController  | -                    | - (Flask 서버 프록시)       |

### 데이터베이스 (9+ 테이블)

| 테이블                 | 건수   | 설명                                  |
| ---------------------- | ------ | ------------------------------------- |
| large_waste_fee        | 22,819 | 전국 대형폐기물 수수료 (공공데이터)   |
| waste_facility         | -      | 폐기물 처리 시설 (공공데이터)         |
| users                  | -      | 사용자 계정 (솔트 기반 비밀번호 해싱) |
| disposal_applications  | -      | 배출 신청                             |
| disposal_items         | -      | 배출 품목 (신청 1:N 품목)             |
| recycle_items          | -      | 역경매 물품                           |
| sharing_posts          | -      | 나눔 게시글                           |
| chat_rooms             | -      | 채팅방                                |
| chat_messages          | -      | 채팅 메시지                           |
| notifications          | -      | 사용자 알림                           |

### 핵심 쿼리 방식

- **지역 식별**:
  `시도명 + 시군구명` 텍스트 조합 (regionCode 미사용)
- **수수료 조회**:
  `large_waste_fee WHERE 시도명=? AND 시군구명=? AND 대형폐기물명=?`
- **배출번호 자동생성**:
  `{시군구약어2자리}-{YYYYMMDD}-{5자리 일련번호}`
  (예: GN-20260218-00123)

### 에러 핸들링

- `GlobalExceptionHandler`:
  BusinessException, MethodArgumentNotValidException 처리
- `BusinessException`:
  notFound, badRequest, conflict 팩토리 메서드
- `ErrorResponse`:
  `{ code, message }` 통일 포맷

### CORS 설정

- 허용 오리진: `http://localhost:5173`, `https://localhost:5173`,
  `http://localhost:5174`, `https://localhost:5174`,
  `http://localhost:3000`
- 허용 메서드: GET, POST, PUT, PATCH, DELETE, OPTIONS
- 경로: `/api/**`

> **참고**: Vite 개발 서버가 프록시(`/api` → `http://localhost:8080`)를
> 사용하므로 개발 환경에서는 CORS 이슈가 발생하지 않습니다.

---

## 프론트엔드-백엔드 연동 상태

| 프론트엔드 Service      | 백엔드 Controller          | 상태      |
| ----------------------- | -------------------------- | :-------: |
| authService.ts          | AuthController             | 연동 완료 |
| regionService.ts        | LargeWasteFeeController    | 연동 완료 |
| wasteService.ts         | LargeWasteFeeController    | 연동 완료 |
| feeService.ts           | LargeWasteFeeController    | 연동 완료 |
| disposalService.ts      | DisposalController         | 연동 완료 |
| offlineService.ts       | OfflineController          | 연동 완료 |
| recycleService.ts       | RecycleController          | 연동 완료 |
| sharingService.ts       | SharingPostController      | 연동 완료 |
| chatService.ts          | ChatMessageController      | 연동 완료 |
| notificationService.ts  | NotificationController     | 연동 완료 |
| aiService.ts            | AiPredictionController     | 연동 완료 |

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

- MySQL 서비스가 실행 중인지 확인:
  `mysql -u root -p` 로 접속 테스트
- `waste_db` 데이터베이스가 생성되어 있는지 확인
- `application-local.yml`의 username/password가 올바른지 확인
- **macOS**: `brew services list`로 mysql@8.0 상태가 `started`인지 확인.
  아니면 `brew services start mysql@8.0`
- **macOS**: Homebrew MySQL은 기본 root 비밀번호가 비어있으므로
  `application-local.yml`의 password를 `""`로 설정

### Gradle 빌드 오류 (Windows)

```
'./gradlew' is not recognized
```

- Windows cmd/PowerShell에서는 `./gradlew` 대신 `gradlew.bat` 사용
- PowerShell에서는 `.\gradlew.bat bootRun`
- Git Bash에서는 `./gradlew bootRun` 사용 가능

### Gradle 실행 권한 오류 (macOS)

```
Permission denied: ./gradlew
```

- **해결**: `chmod +x ./gradlew` 실행 후 다시 시도
- Git에서 클론 시 실행 권한이 사라질 수 있음

### Java 버전 관련

```
Unsupported class file major version
```

- JDK 17 이상이 설치되어 있는지 확인: `java -version`
- `build.gradle.kts`에서 `JavaLanguageVersion.of(17)` 지정
  → JDK 17 이상이면 자동 호환
- 개발 환경에서는 JDK 24도 정상 동작 확인됨
- **macOS**: `echo $JAVA_HOME` 출력이 비어있으면
  위 macOS 세팅 가이드의 Java 환경변수 설정을 다시 진행

### macOS에서 Java를 못 찾는 경우

```
No matching toolchains found for requested specification
```

- `java -version`이 정상인데도 Gradle에서 못 찾는 경우:

  ```bash
  # JAVA_HOME 확인
  echo $JAVA_HOME

  # 비어있으면 설정
  echo 'export JAVA_HOME="$(brew --prefix openjdk@17)/libexec/openjdk.jdk/Contents/Home"' >> ~/.zshrc
  source ~/.zshrc
  ```

### 프론트엔드 HTTPS 인증서 경고

- Vite 개발 서버가 자체 서명 SSL 인증서를 사용합니다
- Chrome: "고급" → "안전하지 않은 사이트로 이동" 클릭
- **Safari (macOS)**: "세부사항 보기" → "이 웹 사이트 방문" 클릭
- 또는 `vite.config.ts`에서 `basicSsl()` 플러그인을 제거하면 HTTP로 실행

### 위치 권한은 허용했는데 "위치 정보를 가져올 수 없습니다" 표시

- **원인**: 카카오맵 API 키(`VITE_MAP_API_KEY`)가 없으면
  GPS 좌표는 잡히지만 역지오코딩(좌표 -> 주소 변환)이 실패합니다.
  주소 변환이 안 되면 위치 설정을 완료할 수 없습니다.
- **해결**: `.env` 파일에 카카오맵 JavaScript 키를 입력하세요.
  [Kakao Developers](https://developers.kakao.com/)에서 무료 발급 가능합니다.
  (애플리케이션 추가 -> 앱 키 -> JavaScript 키 복사 -> 플랫폼에 `localhost` 등록)
- 키 입력 후 프론트엔드 서버를 재시작해야 적용됩니다 (`npm run dev`).

### 위치 권한 팝업이 아예 나타나지 않음

- **원인**: `navigator.geolocation` API는 **HTTPS** 환경에서만 작동합니다.
  HTTP로 접속하면 브라우저가 위치 API 자체를 차단합니다.
- **해결**: 반드시 `https://localhost:5173`으로 접속하세요 (`http`가 아닌 `https`).
  자체 서명 인증서 경고가 나타나면 "고급" -> "안전하지 않음으로 이동"을 클릭합니다.
- **모바일(같은 네트워크)**: `https://PC의_IP:5173`으로 접속 시
  자체 서명 인증서를 수동으로 허용해야 위치 권한이 작동합니다.

### 카카오맵이 표시되지 않음

- `.env` 파일에 `VITE_MAP_API_KEY`가 설정되어 있는지 확인
- 카카오 개발자 콘솔에서 해당 키의 플랫폼에
  `localhost` 도메인이 등록되어 있는지 확인
- API 키 미설정 시 Placeholder 지도가 대신 표시됩니다 (지도 외 위치 설정 기능도 제한됨)

### AI 서버 모델 파일 관련

- `ai-server/model/best.pt` (탐지 모델)는 Git에 포함되어 있습니다
- `ai-server/model/damage.pt` (파손 분류 모델)는 선택사항이며, 없어도 탐지 기능은 정상 작동합니다
- 클론 후 별도 준비 없이 AI 서버 실행 가능
- AI 기능 없이도 나머지 기능은 정상 작동합니다

### macOS Apple Silicon에서 AI 서버 설치 오류

```
ERROR: Failed building wheel for ...
```

- Apple Silicon (M1/M2/M3/M4)에서 일부 Python 패키지 빌드 실패 시:

  ```bash
  pip3 install --upgrade pip setuptools wheel
  pip3 install -r requirements.txt
  ```

- 그래도 안 되면 Rosetta 모드로 실행:

  ```bash
  arch -x86_64 pip3 install -r requirements.txt
  ```

### npm install 시 Python/node-gyp 에러

- Python 3.x가 설치되어 있는지 확인
  (일부 native 모듈 빌드에 필요할 수 있음)
- 현재 프로젝트는 native 모듈 의존성이 없으므로
  일반적으로 발생하지 않음

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

### macOS에서 mysql 명령어를 못 찾는 경우

```
zsh: command not found: mysql
```

- Homebrew로 설치한 mysql@8.0은 기본 PATH에 포함되지 않을 수 있음
- **해결**:

  ```bash
  echo 'export PATH="$(brew --prefix mysql@8.0)/bin:$PATH"' >> ~/.zshrc
  source ~/.zshrc
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
- 인증은 이메일/비밀번호 기반
  (X-User-Id 헤더 사용, 소유자 권한 검증 적용)
- 카카오맵은 `VITE_MAP_API_KEY` 설정 시 활성화,
  미설정 시 Placeholder 표시 (위치 설정 기능도 주소 변환 불가로 제한됨)
- AI 서버는 독립 실행 (미실행 시 AI 판독 기능만 비활성화)
- AI 탐지 모델(`best.pt`)은 Git에 포함되어 있어 클론 후 바로 사용 가능
- AI 파손 분류 모델(`damage.pt`)은 선택사항 (없으면 파손 판별만 비활성화)
- Vite 개발 서버는 `/api` 요청을 백엔드(8080)로 프록시하므로
  CORS 설정 없이 동작

---

## 보안 적용 현황

| 항목               | 상태 | 설명                                               |
| ------------------ | :--: | -------------------------------------------------- |
| 인증 필수화        | 적용 | `defaultValue="anonymous"` 제거, X-User-Id 필수    |
| 소유자 권한 검증   | 적용 | 수정/삭제/취소/결제 시 본인 확인 (BusinessException)|
| 에러 핸들링        | 적용 | GlobalExceptionHandler + BusinessException 통일    |
| Enum 안전 변환     | 적용 | try-catch로 잘못된 값 처리                         |
| @Transactional     | 적용 | @Modifying 쿼리에 명시적 트랜잭션                  |

