# 얼마게 (Throw It) — 프로젝트 발표자료

> 작성일: 2026-05-08  |  기준 커밋: `22fc92e` (master 최신)

---

## 1. 서비스 개요

**얼마게**는 대형폐기물 배출 비용 조회부터 온라인 신청, 나눔, AI 판독까지
모든 과정을 하나의 앱에서 처리하는 **모바일 우선 웹 서비스**입니다.

| 항목 | 내용 |
|---|---|
| 서비스명 | 얼마게 (Throw It) |
| 타깃 | 대형폐기물 배출이 필요한 개인 사용자 |
| 핵심 가치 | 복잡한 배출 절차를 한 앱으로 간소화 |
| 데이터 규모 | 전국 17개 시도, 131개 시군구, **22,819건** 수수료 공공데이터 |

---

## 2. 주요 기능 (9가지)

| # | 기능 | 인증 필요 | 핵심 설명 |
|---|---|:---:|---|
| 1 | 수수료 조회 | - | 시도/시군구/카테고리/규격 기반 수수료 즉시 조회 |
| 2 | 오프라인 배출 안내 | - | 스티커 판매소·주민센터 카카오맵 연동 |
| 3 | 온라인 배출 신청 | ✅ | 신청서 작성 → 검수 → 결제(UI) → 배출번호 발급 |
| 4 | 재활용 역경매 | ✅ | 물품 사진 업로드 + 등록/관리/삭제 |
| 5 | 나눔 커뮤니티 | ✅ | 무료 나눔 게시글 CRUD + 1:1 채팅 |
| 6 | AI 폐기물 판독 | - | 카메라/갤러리 → 물품 종류 + 손상 단계 자동 인식 |
| 7 | 알림 | ✅ | 배출 상태 변경, 나눔 채팅 수신 알림 |
| 8 | 마이페이지 | ✅ | 신청 내역, 취소/환불, 영수증, 결제수단 관리 |
| 9 | 사용자 인증 | - | 이메일/비밀번호 회원가입·로그인 (솔트 기반 해싱) |

---

## 3. 기술 스택

### 3-1. 프론트엔드

| 기술 | 버전 | 역할 |
|---|---|---|
| React + TypeScript | 19.2.0 / ~5.9.3 | UI 프레임워크 |
| Vite | 7.3.1 | 번들러 + 개발 서버 (HTTPS 자체 서명 인증서) |
| Tailwind CSS | 4.1.18 | 스타일링 |
| Zustand | 5.0.11 | 전역 상태 관리 |
| TanStack React Query | 5.90.21 | 서버 상태 & 캐싱 |
| React Hook Form | 7.71.1 | 폼 관리 |
| React Router DOM | 7.13.0 | 라우팅 |
| Kakao Maps SDK | Latest | 지도 (스티커 판매소·주민센터) |

### 3-2. 백엔드

| 기술 | 버전 | 역할 |
|---|---|---|
| Java + Spring Boot | 17 / 3.4.5 | REST API 서버 |
| Gradle | 8.14 (Wrapper 포함) | 빌드 도구 |
| Spring Data JPA / Hibernate | 6.x | ORM |
| MySQL | 8.0 | 데이터베이스 |

### 3-3. AI 서버

| 기술 | 버전 | 역할 |
|---|---|---|
| Python Flask | 3.1.0 | AI API 서버 (포트 5001) |
| YOLOv8n | Ultralytics 8.4+ | 물품 탐지 모델 (68클래스) |
| YOLOv8s-cls | Ultralytics 8.4+ | 손상 분류 모델 (normal / scratch / broken) |
| Pillow | - | 이미지 전처리 (RGB 변환, 리사이즈) |

---

## 4. 시스템 아키텍처

```
[모바일 브라우저]
      │ HTTPS (:5173)
      ▼
[프론트엔드 — React + Vite]
      │ /api 프록시               │ POST /api/ai/predict
      ▼                            ▼
[백엔드 — Spring Boot :8080]  →  [AI 서버 — Flask :5001]
      │                                    │
      ▼                            [YOLOv8n 탐지]
[MySQL 8.0 (waste_db)]          + [YOLOv8s-cls 손상 분류]
```

- Vite 개발 서버가 `/api` → `8080`으로 프록시 (CORS 이슈 없음)
- AI 서버는 독립 실행 — 미실행 시 AI 판독 기능만 비활성화, 나머지 정상 동작

---

## 5. 프로젝트 규모

| 항목 | 수치 |
|---|---|
| 프론트엔드 페이지 | **41개** |
| API 엔드포인트 | **49개** |
| 백엔드 도메인 | **8개** |
| 서비스 레이어 (프론트) | **11개** |
| DB 테이블 | **9개 이상** |
| 수수료 데이터 | **22,819건** (17개 시도, 131개 시군구) |
| AI 탐지 클래스 | **68개** (66개 폐기물 + broken/scratch) |
| AI 결과 최대 반환 수 | **상위 3개** |

---

## 6. AI 기능 진화 타임라인

```
2026-02  ── 초기 구축 ──────────────────────────────────────────
             단일 YOLOv8n 모델로 물품 탐지만 수행
             손상 개념 없음

2026-03-16 ── 1-Stage 손상 분류 도입 ────────────────────────────
             탐지 모델 안에 broken/scratch 클래스 추가 (68클래스)
             DamageLevel enum, DamageInfo DTO 백엔드에 추가
             → 물품 탐지와 손상 탐지가 한 모델에 혼재 → 정확도 낮음

2026-04-05 ── 2-Stage 파이프라인 코드 작성 ───────────────────────
             app.py 신방식으로 전면 재작성 (탐지 → 크롭 → 분류)
             split_damage_dataset.py / train_damage_cls.py 추가
             damage.pt 학습 미완료 → 손상 정보 사실상 비활성

2026-04-15 ── 2-Stage 신방식 완전 활성 ───────────────────────────
             damage.pt (YOLOv8s-cls) 학습 완료 후 배치
             손상 판정 임계값: 0.7 → 0.5
             패키지명 throwit → eolmage 통일

2026-04-29 ── 손상 분류 고도화 (PR #16) ─────────────────────────
             합산 확률 판정: broken + scratch ≥ 0.4 이면 손상
             이미지 정규화: RGB JPEG 1280px 통일 (포맷 호환성)
             damage 최상위 필드: 여러 예측 중 가장 심한 손상 집계

2026-05-06 ── YOLOv8m-cls 학습 스크립트 고도화 ──────────────────
             train_damage_cls.py 재작성
             (benchmark / train / resume / extend 4가지 모드)
             현재 배포 모델은 YOLOv8n (탐지) + YOLOv8s-cls (손상) 유지
```

---

## 7. AI 파이프라인 상세 (현재 버전)

### 2-Stage 처리 흐름

```
[사용자 이미지]
      │
      ▼
[이미지 정규화]
  · RGB 변환 (RGBA / PNG / HEIC 호환)
  · 1280px 초과 시 리사이즈 (LANCZOS)
  · JPEG 95% 품질 저장 (포맷 일관성)
      │
      ▼
[Stage 1: YOLOv8n 물품 탐지]  (best.pt, 68클래스)
  · broken / scratch 박스는 응답에서 제외
  · 물품 bbox 좌표 추출
      │ (bbox 크롭)
      ▼
[Stage 2: YOLOv8s-cls 손상 분류]  (damage.pt, 3클래스)
  · broken / scratch / normal 확률 계산
      │
      ▼
[합산 확률 판정]
  broken_prob + scratch_prob ≥ 0.4
    → YES: 더 높은 확률의 클래스로 손상 판정
    → NO:  top1 클래스 사용
      │
      ▼
[Flask API 응답]
  predictions[]: 물품별 {className, confidence, bbox, damageClass, damageConfidence}
  damage:        {type, confidence, level}  ← 전체 중 가장 심한 손상
      │
      ▼
[Spring Backend 처리]
  · WasteNameMapper: 영문 클래스명 → 한국어 폐기물명 변환 (66개 매핑)
  · DamageLevel.determine(type, confidence): 손상 4단계 결정
  · 최대 3개 결과만 프론트엔드에 전달
```

### 손상 레벨 4단계 (DamageLevel.java)

| 분류 결과 | 신뢰도 | 레벨 | 의미 |
|---|---|---|---|
| null / normal | - | NONE | 손상 없음 |
| scratch | < 0.5 | MINOR | 경미한 스크래치 |
| scratch / broken | ≥ 0.5 (scratch) 또는 < 0.5 (broken) | MODERATE | 보통 손상 |
| broken | ≥ 0.5 | SEVERE | 심한 파손 |

> NONE, MINOR → `isShareable() = true` (나눔 가능)  
> MODERATE, SEVERE → `isShareable() = false` (나눔 불가, 배출 권장)

---

## 8. 백엔드 아키텍처

### 도메인 구조 (8개)

| 도메인 | 역할 |
|---|---|
| user | 회원가입, 로그인, 프로필 수정, 탈퇴 |
| fee | 시도/시군구 목록, 폐기물 카테고리/검색, 수수료 조회 |
| disposal | 배출 신청 생성, 결제(UI), 취소, 배출번호 자동발급 |
| recycle | 역경매 물품 등록/조회/상태변경/삭제 |
| offline | 스티커 판매소, 주민센터, 운반업체, 폐기물 처리시설 |
| sharing | 나눔 게시글 CRUD, 스크랩, 나눔완료/취소 |
| sharing.chat | 채팅방 생성, 메시지 전송/조회, 읽음 처리 |
| notification | 알림 목록, 읽음 처리, 미읽음 수 조회 |
| ai | Flask AI 서버 프록시, WasteNameMapper, DamageLevel 판정 |

### 핵심 DB 테이블

| 테이블 | 규모 | 설명 |
|---|---|---|
| large_waste_fee | **22,819건** | 전국 수수료 공공데이터 |
| waste_facility | - | 폐기물 처리 시설 |
| users | - | 솔트 기반 비밀번호 해싱 |
| disposal_applications | - | 배출 신청 (배출번호: `지역-날짜-일련번호`) |
| disposal_items | - | 배출 품목 (신청:품목 = 1:N) |
| recycle_items | - | 역경매 물품 |
| sharing_posts | - | 나눔 게시글 |
| chat_rooms / chat_messages | - | 1:1 채팅 |
| notifications | - | 사용자 알림 |

---

## 9. 보안 적용 현황

| 항목 | 상태 |
|---|:---:|
| 이메일/비밀번호 인증 (솔트 기반 해싱) | ✅ |
| X-User-Id 헤더 기반 인증 필수화 | ✅ |
| 소유자 권한 검증 (수정/삭제/취소/결제) | ✅ |
| GlobalExceptionHandler 통일 에러 처리 | ✅ |
| @Transactional 명시 (@Modifying 쿼리) | ✅ |
| Enum 안전 변환 (try-catch) | ✅ |

---

## 10. 개발 이정표

| 기간 | 주요 작업 |
|---|---|
| 2026-02 | 프로젝트 초기 구축, 기본 YOLO 탐지 |
| 2026-03 초 | 버그 수정, UI 애니메이션, Docker 파일 추가 |
| 2026-03-16~17 | AI 1-Stage 손상 분류 도입, best.pt git 등록 |
| 2026-04-02~05 | 포트 수정, 2-Stage AI 파이프라인 코드 작성 |
| 2026-04-12~15 | damage.pt 학습 완료·배치, 2-Stage 완전 활성, 패키지명 통일 |
| 2026-04-19 | 프론트엔드 AI 결과 화면 개선, 버그 수정 |
| 2026-04-25 | AI 업그레이드 보고서 작성 |
| 2026-04-29 | 손상 판별 고도화 (합산 확률, 이미지 정규화, damage 최상위 필드) |
| 2026-05-06~08 | 학습 스크립트 고도화(YOLOv8m-cls 모드), 충돌 수정 및 병합 |

---

## 11. 실행 방법

| 서버 | 디렉토리 | 명령어 (macOS) | 주소 |
|---|---|---|---|
| 백엔드 | `backend/` | `./gradlew bootRun` | http://localhost:8080 |
| 프론트엔드 | `frontend/` | `npm run dev` | https://localhost:5173 |
| AI 서버 (선택) | `ai-server/` | `python3 app.py` | http://localhost:5001 |

> 사전 필요: MySQL `waste_db` 생성 + SQL 3개 파일 Import (22,819건)

---

## 12. 향후 개선 검토 항목

| 항목 | 설명 |
|---|---|
| YOLOv8n → YOLOv8m 탐지 모델 업그레이드 | 학습 스크립트는 준비됨, 배포 검증 필요 |
| 손상 임계값 모니터링 | 합산 0.4 기준 오탐율 측정 |
| DamageLevel 판정 임계값 외부화 | 코드 재배포 없이 조정 가능하도록 |
| 1-Stage 호환 코드 제거 | AiPredictionService 내 broken/scratch bbox 처리 분기 |
| WebSocket 기반 실시간 채팅 | 현재 폴링 방식 |
| 결제 PG 실연동 | 현재 UI만 구현됨 |

---

*얼마게(Throw It) — 대형폐기물 배출의 모든 과정을 한 번에*
