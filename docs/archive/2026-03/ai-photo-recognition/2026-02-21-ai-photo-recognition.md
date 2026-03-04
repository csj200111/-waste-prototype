# 작업 기록: AI 사진 인식 대형폐기물 자동 식별 기능

- 날짜: 2026-02-21
- Feature: ai-photo-recognition
- PDCA Phase: Plan -> Design -> Do (완료)

---

## 1. 개요

기존 대형폐기물 배출 도우미 앱에 AI 사진 인식 기능을 추가.
사용자가 사진을 촬영하거나 업로드하면 AI가 폐기물 품목을 자동 식별하고, 수수료 조회로 연결.

## 2. 아키텍처

```
[React Frontend :5173] → [Spring Boot Backend :8080] → [Flask AI Server :5000]
         |                        |                           |
   PhotoCapture.tsx        AiPredictionController     app.py + best.pt
   PredictionResult.tsx    AiPredictionService        YOLOv8n (81 classes)
   AiPredictPage.tsx       WasteNameMapper
```

## 3. 신규 생성 파일

### AI Server (ai-server/)
| 파일 | 설명 |
|------|------|
| `app.py` | Flask 서버 - /predict, /health 엔드포인트 |
| `requirements.txt` | Python 의존성 (flask, ultralytics, torch 등) |
| `train.py` | YOLOv8 학습 스크립트 (traindata/ 어노테이션 변환 + 학습 + 배포) |
| `model/best.pt` | 학습된 YOLOv8n 모델 (81 클래스, 6.2MB) |

### Backend (backend/)
| 파일 | 설명 |
|------|------|
| `domain/ai/AiPredictionController.java` | POST /api/ai/predict 엔드포인트 |
| `domain/ai/AiPredictionService.java` | Flask 서버 통신 + 클래스 매핑 |
| `domain/ai/dto/AiPredictionResponse.java` | 응답 DTO (predictions 리스트) |
| `domain/ai/WasteNameMapper.java` | AI 클래스명 -> DB 폐기물명 매핑 (79개) |

### Frontend (frontend/)
| 파일 | 설명 |
|------|------|
| `src/types/ai.ts` | PredictionItem, AiPredictionResponse 타입 |
| `src/services/aiService.ts` | AI 예측 API 호출 (FormData) |
| `src/features/ai/PhotoCapture.tsx` | 카메라 촬영 + 파일 업로드 컴포넌트 |
| `src/features/ai/PredictionResult.tsx` | 예측 결과 표시 + 수수료 조회 연결 |
| `src/pages/AiPredictPage.tsx` | AI 사진 식별 페이지 (상태 머신: capture/loading/result) |

## 4. 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `frontend/src/router/index.tsx` | `/ai-predict` 라우트 추가 |
| `frontend/src/pages/HomePage.tsx` | AI 사진 식별 카드 추가 (메인 메뉴) |
| `frontend/src/pages/FeeCheckPage.tsx` | `?wasteName=` 쿼리 파라미터로 자동 검색 지원 |
| `backend/src/main/resources/application.yml` | multipart 설정 + ai.server.url 추가 |
| `.gitignore` | traindata, AI 학습 산출물, .pt 파일 추가 |

## 5. AI 모델 학습

### 학습 데이터
- 총 이미지: 2,304장
- 클래스: 81개 (broken, scratch 포함)
- 어노테이션: 바운딩 박스 (이미지_대형폐기물.json)
- 분할: Train 80% / Val 20%

### 학습 결과
- Model: YOLOv8n (Nano)
- Best Epoch: 1 (mAP50: 40.8%)
- Precision: 78.7%
- Recall: 28.6%

### 정확도 한계 원인
- 클래스당 평균 28장 (권장: 500~1,000장 이상)
- 10장 이하 클래스가 30개 이상
- 데이터 추가 수집 필요

### 재학습 방법
1. `traindata/` 폴더에 새 이미지 + JSON 어노테이션 추가
2. `python ai-server/train.py` 실행
3. `python ai-server/app.py` 서버 재시작

## 6. 실행 방법

### AI Server
```bash
cd ai-server
pip install -r requirements.txt
python app.py
# http://localhost:5000
```

### Backend
```bash
cd backend
./gradlew bootRun
# http://localhost:8080
```

### Frontend
```bash
cd frontend
npm run dev
# http://localhost:5173
```

## 7. 해결한 이슈

### numpy Segmentation Fault
- 원인: numpy 1.26.4 (MINGW-W64) + Python 3.13 호환성 문제
- 해결: numpy >= 2.0.0, ultralytics >= 8.4.0 으로 업그레이드

### GPU 학습 미사용
- 원인: torch CPU 전용 버전 설치됨 (torch 2.10.0+cpu)
- 해결: `pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124`

## 8. 다음 작업 (TODO)

- [ ] 학습 데이터 추가 수집 (클래스당 500장 목표)
- [ ] 데이터 수집 후 모델 재학습
- [ ] PDCA Check 단계 진행 (`/pdca analyze ai-photo-recognition`)
- [ ] 프론트엔드에 바운딩 박스 시각화 기능 추가 (선택)

## 9. PDCA 문서

- Plan: `docs/01-plan/features/ai-photo-recognition.plan.md`
- Design: `docs/02-design/features/ai-photo-recognition.design.md`
