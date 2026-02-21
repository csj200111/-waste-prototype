# Plan: AI 사진 인식 대형폐기물 자동 식별 기능

> **Feature**: ai-photo-recognition
> **Version**: v1.0
> **Date**: 2026-02-21
> **Status**: Draft

---

## 1. 개요 (Overview)

사용자가 대형폐기물 사진을 촬영하면, 학습된 YOLOv8 AI 모델이 해당 사진을 분석하여 폐기물 품목을 자동으로 식별하는 기능을 추가한다. 기존의 수동 카테고리 선택 → 품목 검색 흐름을 대체하는 것이 아니라, **사진으로 간편하게 품목을 식별하는 새로운 진입 경로**를 추가하여 사용자 편의성을 높인다.

### 핵심 가치
- 사용자가 폐기물 이름을 모를 때, 사진 한 장으로 품목을 식별할 수 있음
- 식별 결과를 기반으로 기존 수수료 조회 흐름에 자연스럽게 연결
- 기존 모든 기능(수수료 조회, 온라인 신청, 오프라인 안내, 재활용 마켓)은 100% 유지

---

## 2. AI 모델 현황 분석

### 2.1 모델 정보
| 항목 | 내용 |
|------|------|
| 프레임워크 | YOLOv8 (ultralytics) |
| 모델 | yolov8n (Nano) |
| 학습 데이터 | 2,303장 (train 1,843 / val 460) |
| 클래스 수 | 81개 (한국어 대형폐기물 품목) |
| 모델 파일 | `runs/detect/train3/weights/best.pt` (6.3MB) |
| 성능 | Precision 57.2% / Recall 20.9% / mAP50 22.7% |

### 2.2 인식 가능 품목 (81개 클래스 중 주요 항목)
- 가구류: 소파, 침대, 장롱, 책상, 의자, 서랍장, 화장대, 식탁, TV장 등
- 가전류: 냉장고, 세탁기, 에어컨, 가스오븐레인지, 전자레인지 등
- 생활용품: 매트리스, 거울, 카펫, 자전거, 유모차, 사무용의자 등
- 기타: 변기, 개수대류, 고무통, 여행가방 등

### 2.3 모델 위치
```
C:\Users\csj20\Desktop\photo_ai\ai\
├── runs/detect/train3/weights/best.pt  ← 사용할 모델
├── data.yaml                           ← 81개 클래스 정의
└── predict.py                          ← 추론 코드 참고
```

---

## 3. 기능 요구사항 (Requirements)

### 3.1 사용자 스토리

**US-01**: 모바일 사용자로서, 대형폐기물을 카메라로 촬영하면 AI가 무슨 품목인지 알려주어, 수수료를 빠르게 조회하고 싶다.

**US-02**: PC/노트북 사용자로서, 미리 찍어둔 대형폐기물 사진 파일을 업로드하면 AI가 품목을 식별해주어, 수수료를 빠르게 조회하고 싶다.

### 3.2 이미지 입력 방식

PC/노트북에는 카메라가 없거나 접근이 어려우므로, **두 가지 입력 방식을 모두 제공**한다.

| 입력 방식 | 설명 | 대상 디바이스 |
|-----------|------|---------------|
| 카메라 촬영 | `<input type="file" accept="image/*" capture="environment">` | 모바일 (스마트폰/태블릿) |
| 파일 업로드 | `<input type="file" accept="image/*">` (capture 속성 없음) | PC/노트북/모바일 모두 |

**UI 동작 방식**:
- 페이지 진입 시 두 버튼을 동시 표시: **"카메라로 촬영"** + **"사진 업로드"**
- 카메라 촬영: 모바일에서 후면 카메라를 바로 실행
- 사진 업로드: 기기의 파일 선택 대화상자를 열어 이미지 파일 선택
- 어떤 방식이든 이미지가 선택되면 동일한 분석 흐름으로 진행

### 3.3 기능 흐름

```
[홈] → [AI 사진 식별] → ┌─ [카메라로 촬영] (모바일) ─┐
                         │                            │→ [미리보기] → [AI 분석 중...] → [식별 결과]
                         └─ [사진 업로드] (PC/모바일) ─┘                                     ↓
                                                                                   [수수료 조회로 이동]
                                                                                   (식별된 품목명 자동 입력)
```

### 3.4 상세 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-01 | 홈 화면에 "AI 사진 식별" 메뉴 추가 | 필수 |
| FR-02 | **카메라 촬영** 버튼: 모바일에서 후면 카메라로 즉시 촬영 | 필수 |
| FR-03 | **사진 업로드** 버튼: 파일 탐색기에서 이미지 파일 선택 | 필수 |
| FR-04 | 업로드된 사진을 백엔드 API로 전송 | 필수 |
| FR-05 | 백엔드에서 YOLOv8 모델로 추론 실행 | 필수 |
| FR-06 | 식별 결과(품목명, 신뢰도) 화면 표시 | 필수 |
| FR-07 | 식별 결과에서 "수수료 조회" 버튼으로 연결 | 필수 |
| FR-08 | 식별 실패 시 안내 메시지 및 수동 검색 유도 | 필수 |
| FR-09 | 이미지 미리보기 표시 | 필수 |
| FR-10 | 상위 3개 후보 결과 표시 (신뢰도 순) | 필수 |
| FR-11 | 분석 중 로딩 애니메이션 | 필수 |
| FR-12 | "다시 촬영/업로드" 버튼으로 재시도 가능 | 필수 |

---

## 4. 기술 구현 계획

### 4.1 아키텍처 개요

```
[Frontend (React)]                      [Backend (Spring Boot)]           [AI Model]
     │                                         │                              │
     │  POST /api/ai/predict                   │                              │
     │  (multipart/form-data: image)           │                              │
     │ ──────────────────────────────────────▶  │                              │
     │                                         │  Python subprocess           │
     │                                         │  or HTTP call                │
     │                                         │ ────────────────────────────▶ │
     │                                         │                              │
     │                                         │  ◀─ JSON 결과 반환 ─────────  │
     │                                         │                              │
     │  ◀── { predictions: [{name, conf}] } ── │                              │
     │                                         │                              │
```

### 4.2 백엔드 구현 방식: Python Flask 마이크로서비스

Spring Boot에서 직접 Python/PyTorch를 실행하는 것은 비효율적이므로, **별도의 Python Flask(또는 FastAPI) 서버**를 AI 추론 전용으로 띄우고, Spring Boot에서 HTTP로 호출하는 방식을 채택한다.

#### AI 서버 (Python)
| 항목 | 내용 |
|------|------|
| 프레임워크 | Flask (경량) |
| 포트 | 5000 |
| 엔드포인트 | `POST /predict` |
| 입력 | multipart/form-data (image file) |
| 출력 | JSON `{ predictions: [{ name, confidence, bbox }] }` |
| 모델 로드 | 서버 시작 시 1회 로드 (메모리 상주) |

#### Spring Boot (기존 백엔드)
| 항목 | 내용 |
|------|------|
| 새 도메인 | `domain/ai/` |
| 컨트롤러 | `AiPredictionController` |
| 서비스 | `AiPredictionService` |
| 엔드포인트 | `POST /api/ai/predict` |
| 역할 | 프론트엔드 ↔ AI 서버 프록시 + 클래스명 매핑 |

### 4.3 프론트엔드 구현

| 항목 | 내용 |
|------|------|
| 새 페이지 | `AiPredictPage.tsx` |
| 새 라우트 | `/ai-predict` |
| 새 서비스 | `aiService.ts` |
| 새 컴포넌트 | `PhotoCapture.tsx`, `PredictionResult.tsx` |
| 홈 메뉴 추가 | HomePage.tsx에 "AI 사진 식별" 카드 추가 |

#### PhotoCapture 컴포넌트 상세

두 가지 이미지 입력 방식을 모두 지원:

```
┌─────────────────────────────────┐
│        AI 사진 식별              │
│                                 │
│  ┌─────────────┐ ┌────────────┐ │
│  │  📷 카메라   │ │  📁 사진   │ │
│  │  로 촬영     │ │  업로드    │ │
│  └─────────────┘ └────────────┘ │
│                                 │
│  (이미지 선택 후 미리보기 표시)    │
│                                 │
│  ┌─────────────────────────────┐│
│  │                             ││
│  │      [이미지 미리보기]        ││
│  │                             ││
│  └─────────────────────────────┘│
│                                 │
│       [ 분석하기 ]               │
│                                 │
└─────────────────────────────────┘
```

- **카메라로 촬영**: `<input type="file" accept="image/*" capture="environment">` — 모바일에서 후면 카메라 실행
- **사진 업로드**: `<input type="file" accept="image/*">` — PC/노트북에서 파일 탐색기 열기
- 두 input 모두 숨김 처리 후 버튼 클릭으로 트리거
- 이미지 선택 시 `URL.createObjectURL()`로 미리보기 표시

### 4.4 AI 클래스명 → 기존 DB 매핑

AI 모델의 81개 클래스명과 기존 `large_waste_fee` 테이블의 `waste_name`을 매핑해야 한다.

**매핑 전략**:
1. AI 클래스명 → DB waste_name 매핑 테이블 생성 (JSON 또는 DB)
2. 정확히 매칭되지 않는 경우, 키워드 기반 유사 검색 (LIKE 쿼리)
3. 매핑 실패 시 사용자에게 수동 검색 유도

---

## 5. 파일 변경 계획

### 5.1 새로 생성할 파일

#### AI 서버 (새 디렉토리: `ai-server/`)
```
ai-server/
├── app.py                    # Flask 서버 메인
├── requirements.txt          # Python 의존성
└── model/
    └── best.pt              # 학습된 모델 복사 (또는 심볼릭 링크)
```

#### Backend (Spring Boot)
```
backend/src/main/java/com/throwit/domain/ai/
├── AiPredictionController.java    # POST /api/ai/predict
├── AiPredictionService.java       # AI 서버 호출 + 결과 매핑
├── dto/
│   ├── AiPredictionRequest.java   # 요청 DTO (MultipartFile)
│   └── AiPredictionResponse.java  # 응답 DTO (predictions 리스트)
└── mapper/
    └── WasteNameMapper.java       # AI 클래스명 → DB waste_name 매핑
```

#### Frontend (React)
```
frontend/src/
├── pages/
│   └── AiPredictPage.tsx          # AI 사진 식별 페이지
├── features/
│   └── ai/
│       ├── PhotoCapture.tsx        # 사진 촬영(카메라) + 파일 업로드 컴포넌트
│       └── PredictionResult.tsx    # 식별 결과 표시 컴포넌트
├── services/
│   └── aiService.ts               # AI API 호출 서비스
└── types/
    └── ai.ts                      # AI 관련 타입 정의
```

### 5.2 수정할 기존 파일

| 파일 | 변경 내용 |
|------|----------|
| `frontend/src/router/index.tsx` | `/ai-predict` 라우트 추가 |
| `frontend/src/pages/HomePage.tsx` | "AI 사진 식별" 메뉴 카드 추가 |
| `frontend/src/components/layout/BottomNav.tsx` | 필요 시 네비게이션 항목 조정 (선택) |
| `backend/build.gradle.kts` | Spring WebClient 의존성 추가 (AI 서버 HTTP 호출용) |
| `backend/.../global/config/CorsConfig.java` | AI 서버 관련 CORS 설정 확인 |

---

## 6. 구현 순서

```
Phase 1: AI 추론 서버 구축
  ├── 1-1. ai-server/ 디렉토리 생성
  ├── 1-2. Flask 앱 작성 (모델 로드 + /predict 엔드포인트)
  ├── 1-3. requirements.txt 작성
  └── 1-4. 단독 테스트 (curl로 이미지 전송 → 결과 확인)

Phase 2: Spring Boot 백엔드 확장
  ├── 2-1. ai 도메인 패키지 생성
  ├── 2-2. DTO 클래스 작성
  ├── 2-3. WasteNameMapper 작성 (AI 클래스 → DB 매핑)
  ├── 2-4. AiPredictionService 작성 (AI 서버 HTTP 호출)
  └── 2-5. AiPredictionController 작성 (REST API)

Phase 3: 프론트엔드 UI 구현
  ├── 3-1. 타입 정의 (ai.ts)
  ├── 3-2. API 서비스 (aiService.ts)
  ├── 3-3. PhotoCapture 컴포넌트
  ├── 3-4. PredictionResult 컴포넌트
  ├── 3-5. AiPredictPage 페이지
  ├── 3-6. 라우터 등록
  └── 3-7. 홈페이지 메뉴 추가

Phase 4: 통합 테스트
  ├── 4-1. 프론트 → 백엔드 → AI 서버 E2E 흐름 확인
  ├── 4-2. 식별 결과 → 수수료 조회 연결 확인
  └── 4-3. 에러 케이스 처리 확인
```

---

## 7. 기존 기능 영향도 분석

| 기존 기능 | 영향 | 비고 |
|-----------|------|------|
| 수수료 조회 | **없음** | 기존 흐름 그대로 유지, AI 식별은 별도 진입점 |
| 온라인 신청 | **없음** | 변경 없음 |
| 오프라인 안내 | **없음** | 변경 없음 |
| 재활용 마켓 | **없음** | 변경 없음 |
| 인증/마이페이지 | **없음** | 변경 없음 |
| 홈 화면 | **경미** | 메뉴 카드 1개 추가만 |

**원칙**: 기존 코드는 수정 최소화, 새 파일 추가 위주로 진행

---

## 8. 리스크 및 대응 방안

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|----------|
| AI 모델 정확도 낮음 (mAP 22.7%) | 중 | 상위 3개 후보 표시 + "결과가 정확하지 않을 수 있습니다" 안내 |
| Python 서버 별도 실행 필요 | 중 | 실행 스크립트 제공, README 문서화 |
| AI 클래스명 ↔ DB 품목명 불일치 | 중 | 매핑 테이블 + 키워드 유사 검색 fallback |
| 이미지 용량이 큰 경우 | 저 | 프론트에서 리사이즈 (max 640px) 후 전송 |
| AI 서버 응답 지연 | 저 | 타임아웃 설정 + 로딩 UI |

---

## 9. 성공 기준

- [ ] 모바일에서 카메라 촬영으로 사진을 찍으면 AI가 품목을 식별한다
- [ ] PC/노트북에서 파일 업로드로 사진을 선택하면 AI가 품목을 식별한다
- [ ] 식별 결과에서 "수수료 조회"로 자연스럽게 이동할 수 있다
- [ ] 기존 모든 기능(수수료 조회, 온라인 신청, 오프라인, 재활용)이 정상 동작한다
- [ ] AI 서버가 3초 이내에 응답한다
- [ ] 식별 실패 시 사용자에게 명확한 안내를 제공한다
- [ ] "다시 촬영/업로드" 버튼으로 재시도가 가능하다

---

## 10. 기술 스택 요약

| 계층 | 기술 | 역할 |
|------|------|------|
| AI 서버 | Python + Flask + ultralytics | YOLOv8 모델 추론 |
| 백엔드 | Java + Spring Boot | API 프록시 + 클래스명 매핑 |
| 프론트엔드 | React + TypeScript + Vite | UI + 사진 촬영/업로드 |
| 모델 | YOLOv8n best.pt (6.3MB) | 81개 클래스 객체 탐지 |
