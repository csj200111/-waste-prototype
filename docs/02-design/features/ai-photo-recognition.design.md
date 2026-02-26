# Design: AI 사진 인식 대형폐기물 자동 식별 기능

> **Feature**: ai-photo-recognition
> **Version**: v1.0
> **Date**: 2026-02-21
> **Status**: Draft
> **Plan Reference**: `docs/01-plan/features/ai-photo-recognition.plan.md`

---

## 1. 시스템 아키텍처

### 1.1 전체 구조

```
┌────────────────────┐     ┌──────────────────────┐     ┌────────────────────┐
│  Frontend (React)  │     │  Backend (Spring Boot)│     │  AI Server (Flask) │
│  :5173             │────▶│  :8080               │────▶│  :5000             │
│                    │     │                      │     │                    │
│  AiPredictPage     │     │  AiPredictionCtrl    │     │  POST /predict     │
│  PhotoCapture      │     │  AiPredictionSvc     │     │  YOLOv8 best.pt    │
│  PredictionResult  │     │  WasteNameMapper     │     │  81 classes        │
└────────────────────┘     └──────────────────────┘     └────────────────────┘
```

### 1.2 요청 흐름

```
1. [사용자] 사진 촬영/업로드
2. [Frontend] FormData로 이미지 → POST /api/ai/predict
3. [Spring Boot] MultipartFile 수신 → AI 서버로 전달
4. [Flask] YOLOv8 추론 → JSON 결과 반환
5. [Spring Boot] AI 클래스명 → DB 품목명 매핑 → 응답 반환
6. [Frontend] 식별 결과 표시 → 수수료 조회 연결
```

---

## 2. AI 서버 설계 (Python Flask)

### 2.1 디렉토리 구조

```
ai-server/
├── app.py                    # Flask 메인 + /predict 엔드포인트
├── requirements.txt          # Python 의존성
└── model/
    └── best.pt               # YOLOv8 학습 모델 (6.3MB)
```

### 2.2 API 명세

#### `POST /predict`

**Request**:
```
Content-Type: multipart/form-data

field: image (File) — 이미지 파일 (jpg, png 등)
```

**Response** (200 OK):
```json
{
  "success": true,
  "predictions": [
    {
      "classId": 30,
      "className": "소파류",
      "confidence": 0.72,
      "bbox": {
        "x1": 120.5,
        "y1": 80.3,
        "x2": 450.2,
        "y2": 380.7
      }
    },
    {
      "classId": 47,
      "className": "의자",
      "confidence": 0.45,
      "bbox": {
        "x1": 200.1,
        "y1": 150.0,
        "x2": 350.8,
        "y2": 400.2
      }
    }
  ]
}
```

**Response** (에러):
```json
{
  "success": false,
  "error": "No image file provided"
}
```

### 2.3 app.py 설계

```python
from flask import Flask, request, jsonify
from ultralytics import YOLO
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# 서버 시작 시 모델 1회 로드 (메모리 상주)
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'best.pt')
model = YOLO(MODEL_PATH)

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"success": False, "error": "No image file provided"}), 400

    file = request.files['image']

    # 임시 파일 저장 → 추론 → 삭제
    temp_path = os.path.join('/tmp', file.filename)
    file.save(temp_path)

    try:
        results = model.predict(temp_path, conf=0.1, save=False)
        predictions = []

        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])
                class_name = model.names[cls_id]

                predictions.append({
                    "classId": cls_id,
                    "className": class_name,
                    "confidence": round(confidence, 4),
                    "bbox": {
                        "x1": round(x1, 1),
                        "y1": round(y1, 1),
                        "x2": round(x2, 1),
                        "y2": round(y2, 1)
                    }
                })

        # 신뢰도 순 정렬
        predictions.sort(key=lambda x: x["confidence"], reverse=True)

        return jsonify({"success": True, "predictions": predictions})
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
```

### 2.4 requirements.txt

```
flask==3.1.0
flask-cors==5.0.1
ultralytics==8.3.0
torch
torchvision
opencv-python-headless
```

---

## 3. 백엔드 설계 (Spring Boot)

### 3.1 디렉토리 구조

```
backend/src/main/java/com/throwit/domain/ai/
├── AiPredictionController.java
├── AiPredictionService.java
├── dto/
│   └── AiPredictionResponse.java
└── mapper/
    └── WasteNameMapper.java
```

### 3.2 API 명세

#### `POST /api/ai/predict`

**Request**:
```
Content-Type: multipart/form-data

field: image (MultipartFile) — 이미지 파일
```

**Response** (200 OK):
```json
{
  "predictions": [
    {
      "className": "소파류",
      "confidence": 0.72,
      "wasteName": "소파",
      "wasteCategory": "가구류"
    },
    {
      "className": "의자",
      "confidence": 0.45,
      "wasteName": "의자",
      "wasteCategory": "가구류"
    }
  ],
  "totalCount": 2
}
```

Spring Boot는 AI 서버 응답의 `className`을 기존 DB의 `wasteName` / `wasteCategory`로 매핑하여 수수료 조회에 바로 사용 가능한 형태로 반환한다.

### 3.3 AiPredictionController.java

```java
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiPredictionController {

    private final AiPredictionService aiPredictionService;

    @PostMapping("/predict")
    public ResponseEntity<AiPredictionResponse> predict(
            @RequestParam("image") MultipartFile image) {
        return ResponseEntity.ok(aiPredictionService.predict(image));
    }
}
```

**설계 포인트**:
- 인증 불필요 (비로그인 사용자도 AI 식별 가능)
- `@RequestParam("image")` + `MultipartFile`로 이미지 수신
- 기존 Controller 패턴 준수 (`ResponseEntity<T>` 반환)

### 3.4 AiPredictionService.java

```java
@Service
@RequiredArgsConstructor
public class AiPredictionService {

    private final WasteNameMapper wasteNameMapper;

    @Value("${ai.server.url:http://localhost:5000}")
    private String aiServerUrl;

    public AiPredictionResponse predict(MultipartFile image) {
        // 1. AI 서버에 이미지 전송 (RestTemplate + MultipartFile)
        // 2. 응답 JSON 파싱
        // 3. 각 prediction의 className → wasteName 매핑
        // 4. 상위 3개만 반환
        // 5. AiPredictionResponse 생성 반환
    }
}
```

**설계 포인트**:
- `RestTemplate`으로 AI 서버 `POST /predict` 호출
- `MultipartFile` → `HttpEntity<MultiValueMap>` 변환하여 전송
- AI 서버 URL은 `application.yml`에서 설정 가능
- 타임아웃: 10초 (AI 추론 시간 고려)
- AI 서버 연결 실패 시 `BusinessException` throw

### 3.5 AiPredictionResponse.java

```java
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiPredictionResponse {

    private List<PredictionItem> predictions;
    private int totalCount;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PredictionItem {
        private String className;      // AI 모델 원본 클래스명
        private double confidence;     // 신뢰도 (0~1)
        private String wasteName;      // DB 매핑된 품목명
        private String wasteCategory;  // DB 매핑된 카테고리
    }
}
```

### 3.6 WasteNameMapper.java

AI 모델의 81개 클래스명을 기존 `large_waste_fee` 테이블의 `waste_name` / `waste_category`에 매핑한다.

```java
@Component
public class WasteNameMapper {

    // AI 클래스명 → { wasteName, wasteCategory } 매핑
    private static final Map<String, MappedWaste> CLASS_MAP = Map.ofEntries(
        Map.entry("소파류", new MappedWaste("소파", "가구류")),
        Map.entry("침대", new MappedWaste("침대", "가구류")),
        Map.entry("냉장고", new MappedWaste("냉장고", "가전류")),
        Map.entry("세탁기", new MappedWaste("세탁기", "가전류")),
        Map.entry("에어콘", new MappedWaste("에어컨", "가전류")),
        Map.entry("의자", new MappedWaste("의자", "가구류")),
        // ... 81개 전체 매핑
    );

    public MappedWaste map(String aiClassName) {
        return CLASS_MAP.getOrDefault(aiClassName,
            new MappedWaste(aiClassName, "기타"));
    }

    @Getter
    @AllArgsConstructor
    public static class MappedWaste {
        private final String wasteName;
        private final String wasteCategory;
    }
}
```

**매핑 전략**:
1. 정확한 매핑이 있으면 사용 (81개 클래스 → DB 품목명)
2. 매핑이 없으면 AI 클래스명을 그대로 반환 + 카테고리 "기타"
3. `broken`, `scratch`는 상태 태그이므로 품목명 매핑에서 제외

### 3.7 AI 클래스 81개 전체 매핑표

| ID | AI 클래스명 | 매핑 wasteName | wasteCategory |
|----|-------------|----------------|---------------|
| 0 | broken | (제외 - 상태태그) | - |
| 1 | scratch | (제외 - 상태태그) | - |
| 2 | 가방 | 가방 | 기타 |
| 3 | 가스오븐레인지 | 가스오븐레인지 | 가전류 |
| 4 | 개수대류 | 개수대 | 주방용품 |
| 5 | 거울 | 거울 | 생활용품 |
| 6 | 고무통 | 고무통 | 기타 |
| 7 | 골프가방 | 골프가방 | 기타 |
| 8 | 김치냉장고 | 김치냉장고 | 가전류 |
| 9 | 난로 | 난로 | 가전류 |
| 10 | 냉장고 | 냉장고 | 가전류 |
| 11 | 다리미판 | 다리미판 | 생활용품 |
| 12 | 도마 | 도마 | 주방용품 |
| 13 | 돗자리 | 돗자리 | 생활용품 |
| 14 | 러닝머신 | 러닝머신 | 운동기구 |
| 15 | 문짝 | 문짝 | 기타 |
| 16 | 밥상 | 밥상 | 가구류 |
| 17 | 방석 | 방석 | 생활용품 |
| 18 | 베개 | 베개 | 생활용품 |
| 19 | 벽걸이시계 | 벽걸이시계 | 생활용품 |
| 20 | 변기통 | 변기 | 기타 |
| 21 | 병풍 | 병풍 | 생활용품 |
| 22 | 보행기 | 보행기 | 기타 |
| 23 | 복사기 | 복사기 | 가전류 |
| 24 | 블라인드 | 블라인드 | 생활용품 |
| 25 | 비데 | 비데 | 가전류 |
| 26 | 빨래건조대 | 빨래건조대 | 생활용품 |
| 27 | 서랍장 | 서랍장 | 가구류 |
| 28 | 선풍기 | 선풍기 | 가전류 |
| 29 | 세탁기 | 세탁기 | 가전류 |
| 30 | 소파류 | 소파 | 가구류 |
| 31 | 스피커 | 스피커 | 가전류 |
| 32 | 식기건조기 | 식기건조기 | 가전류 |
| 33 | 식탁 | 식탁 | 가구류 |
| 34 | 신발장 | 신발장 | 가구류 |
| 35 | 쌀통 | 쌀통 | 주방용품 |
| 36 | 쓰레기통 | 쓰레기통 | 기타 |
| 37 | 아이스박스 | 아이스박스 | 기타 |
| 38 | 액자 | 액자 | 생활용품 |
| 39 | 에어콘 | 에어컨 | 가전류 |
| 40 | 오디오장식장 | 오디오장식장 | 가구류 |
| 41 | 옥매트 | 옥매트 | 생활용품 |
| 42 | 옷걸이류 | 옷걸이 | 생활용품 |
| 43 | 완구류 | 완구 | 기타 |
| 44 | 욕조 | 욕조 | 기타 |
| 45 | 유모차 | 유모차 | 기타 |
| 46 | 의자 | 의자 | 가구류 |
| 47 | 이불등 | 이불 | 생활용품 |
| 48 | 입간판 | 입간판 | 기타 |
| 49 | 자전거 | 자전거 | 기타 |
| 50 | 장롱 | 장롱 | 가구류 |
| 51 | 장식장 | 장식장 | 가구류 |
| 52 | 장우산류 | 우산 | 생활용품 |
| 53 | 장판 | 장판 | 생활용품 |
| 54 | 전기담요 | 전기담요 | 생활용품 |
| 55 | 전축(오디오) | 오디오 | 가전류 |
| 56 | 정수기 | 정수기 | 가전류 |
| 57 | 조명기구 | 조명기구 | 생활용품 |
| 58 | 진열장(장식장 책장 찬장) | 진열장 | 가구류 |
| 59 | 차탁자 | 차탁자 | 가구류 |
| 60 | 책꽂이 | 책꽂이 | 가구류 |
| 61 | 책상 | 책상 | 가구류 |
| 62 | 책장 | 책장 | 가구류 |
| 63 | 청소기 | 청소기 | 가전류 |
| 64 | 침대 | 침대 | 가구류 |
| 65 | 카펫 | 카펫 | 생활용품 |
| 66 | 캐비닛류 | 캐비닛 | 가구류 |
| 67 | 커튼 | 커튼 | 생활용품 |
| 68 | 타이어 | 타이어 | 기타 |
| 69 | 텐트 | 텐트 | 기타 |
| 70 | 텔레비전대 | TV대 | 가구류 |
| 71 | 텔레비젼 | 텔레비전 | 가전류 |
| 72 | 파티션 | 파티션 | 가구류 |
| 73 | 프린트기 | 프린터 | 가전류 |
| 74 | 피아노 | 피아노 | 기타 |
| 75 | 항아리류 | 항아리 | 기타 |
| 76 | 헬스자전거 | 헬스자전거 | 운동기구 |
| 77 | 협탁 | 협탁 | 가구류 |
| 78 | 화장대 | 화장대 | 가구류 |
| 79 | 화장품함 | 화장품함 | 생활용품 |
| 80 | 히터류 | 히터 | 가전류 |

---

## 4. 프론트엔드 설계

### 4.1 디렉토리 구조

```
frontend/src/
├── pages/
│   └── AiPredictPage.tsx
├── features/
│   └── ai/
│       ├── PhotoCapture.tsx
│       └── PredictionResult.tsx
├── services/
│   └── aiService.ts
└── types/
    └── ai.ts
```

### 4.2 타입 정의 — `types/ai.ts`

```typescript
export interface PredictionItem {
  className: string;      // AI 모델 원본 클래스명
  confidence: number;     // 신뢰도 (0~1)
  wasteName: string;      // DB 매핑된 품목명
  wasteCategory: string;  // DB 매핑된 카테고리
}

export interface AiPredictionResponse {
  predictions: PredictionItem[];
  totalCount: number;
}
```

### 4.3 서비스 — `services/aiService.ts`

```typescript
import type { AiPredictionResponse } from '../types/ai';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const aiService = {
  async predict(imageFile: File): Promise<AiPredictionResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const res = await fetch(`${BASE_URL}/api/ai/predict`, {
      method: 'POST',
      body: formData,
      // Content-Type 헤더 미설정 (브라우저가 boundary 자동 생성)
    });

    if (!res.ok) {
      const text = await res.text();
      let message = `HTTP ${res.status}`;
      try {
        const json = JSON.parse(text);
        message = json.message || message;
      } catch {
        message = text || message;
      }
      throw new Error(message);
    }

    return res.json() as Promise<AiPredictionResponse>;
  },
};
```

**설계 포인트**:
- `apiFetch`를 사용하지 않음 — `apiFetch`는 기본 `Content-Type: application/json`을 설정하므로, `multipart/form-data` 전송 시 `boundary`가 누락됨
- `FormData` 사용 시 `Content-Type` 헤더를 명시하지 않아야 브라우저가 자동으로 `multipart/form-data; boundary=...`를 설정
- 에러 처리 패턴은 기존 `apiFetch`와 동일하게 유지

### 4.4 PhotoCapture 컴포넌트

```typescript
// features/ai/PhotoCapture.tsx

interface PhotoCaptureProps {
  onImageSelect: (file: File, previewUrl: string) => void;
}
```

**상태 관리**: 없음 (stateless) — 이미지 선택 시 부모에 콜백

**UI 구조**:
```
┌─────────────────────────────────────┐
│                                     │
│  ┌───────────────┐ ┌─────────────┐  │
│  │               │ │             │  │
│  │   카메라로     │ │  사진       │  │
│  │   촬영        │ │  업로드     │  │
│  │               │ │             │  │
│  └───────────────┘ └─────────────┘  │
│                                     │
│  <input type="file"                 │
│    accept="image/*"                 │
│    capture="environment"            │
│    hidden />  ← 카메라용            │
│                                     │
│  <input type="file"                 │
│    accept="image/*"                 │
│    hidden />  ← 업로드용            │
│                                     │
└─────────────────────────────────────┘
```

**동작**:
1. "카메라로 촬영" 버튼 클릭 → `cameraInputRef.current.click()`
2. "사진 업로드" 버튼 클릭 → `uploadInputRef.current.click()`
3. 파일 선택 시 `onChange` → `URL.createObjectURL(file)` 미리보기 생성
4. `onImageSelect(file, previewUrl)` 콜백 호출
5. 이미지 리사이즈: max 640px (가로/세로 중 큰 쪽 기준)

**이미지 리사이즈 로직**:
```typescript
function resizeImage(file: File, maxSize: number = 640): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      if (width <= maxSize && height <= maxSize) {
        resolve(file);
        return;
      }
      const ratio = Math.min(maxSize / width, maxSize / height);
      const canvas = document.createElement('canvas');
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.85);
    };
    img.src = URL.createObjectURL(file);
  });
}
```

### 4.5 PredictionResult 컴포넌트

```typescript
// features/ai/PredictionResult.tsx

interface PredictionResultProps {
  predictions: PredictionItem[];
  onFeeCheck: (wasteName: string) => void;
  onRetry: () => void;
}
```

**UI 구조 — 식별 성공 시**:
```
┌─────────────────────────────────────┐
│  AI 식별 결과                        │
│                                     │
│  ⚠️ 결과가 정확하지 않을 수 있습니다   │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 1. 소파류         72% ■■■■■■■░ ││
│  │    → 소파 (가구류)              ││
│  │    [수수료 조회]                 ││
│  ├─────────────────────────────────┤│
│  │ 2. 의자           45% ■■■■░░░░ ││
│  │    → 의자 (가구류)              ││
│  │    [수수료 조회]                 ││
│  ├─────────────────────────────────┤│
│  │ 3. 책상           23% ■■░░░░░░ ││
│  │    → 책상 (가구류)              ││
│  │    [수수료 조회]                 ││
│  └─────────────────────────────────┘│
│                                     │
│  [다시 촬영/업로드]                   │
│                                     │
└─────────────────────────────────────┘
```

**UI 구조 — 식별 실패 시 (predictions.length === 0)**:
```
┌─────────────────────────────────────┐
│  AI 식별 결과                        │
│                                     │
│  식별된 품목이 없습니다.              │
│  다른 각도에서 다시 촬영하거나          │
│  직접 검색해보세요.                    │
│                                     │
│  [다시 촬영/업로드]  [직접 검색하기]    │
│                                     │
└─────────────────────────────────────┘
```

**동작**:
- "수수료 조회" 클릭 → `onFeeCheck(wasteName)` → `/fee-check` 페이지로 이동 (품목명 쿼리파라미터 전달)
- "다시 촬영/업로드" 클릭 → `onRetry()` → 초기 상태로 리셋
- "직접 검색하기" 클릭 → `/fee-check` 페이지로 이동 (파라미터 없이)

### 4.6 AiPredictPage 페이지

```typescript
// pages/AiPredictPage.tsx

type PageState = 'capture' | 'loading' | 'result';
```

**상태 관리**:
```typescript
const [pageState, setPageState] = useState<PageState>('capture');
const [selectedImage, setSelectedImage] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [predictions, setPredictions] = useState<PredictionItem[]>([]);
const [error, setError] = useState<string | null>(null);
```

**화면 전환 흐름**:
```
[capture] ─ 이미지 선택 + 분석하기 클릭 ─▶ [loading] ─ 응답 수신 ─▶ [result]
    ▲                                                                    │
    └──────────────── "다시 촬영/업로드" 클릭 ◀──────────────────────────┘
```

**페이지 레이아웃**:
```
┌─ Header: "AI 사진 식별" (뒤로가기) ──┐
│                                      │
│  [pageState === 'capture']           │
│    PhotoCapture 컴포넌트              │
│    + 이미지 미리보기                   │
│    + [분석하기] 버튼                   │
│                                      │
│  [pageState === 'loading']           │
│    이미지 미리보기                     │
│    + 스피너 + "AI가 분석하고 있습니다" │
│                                      │
│  [pageState === 'result']            │
│    이미지 미리보기                     │
│    + PredictionResult 컴포넌트        │
│                                      │
├─ BottomNav ──────────────────────────┤
```

### 4.7 수수료 조회 연결

식별 결과에서 "수수료 조회" 클릭 시 `/fee-check` 페이지로 이동하며, 품목명을 쿼리 파라미터로 전달:

```typescript
const navigate = useNavigate();

const handleFeeCheck = (wasteName: string) => {
  navigate(`/fee-check?wasteName=${encodeURIComponent(wasteName)}`);
};
```

`FeeCheckPage`에서는 `useSearchParams`로 초기 검색어를 받아 자동 검색을 수행한다. (기존 FeeCheckPage에 미미한 수정 필요)

---

## 5. 라우터 변경

### 5.1 router/index.tsx 수정

```typescript
// 추가할 import
import AiPredictPage from '../pages/AiPredictPage';

// children 배열에 추가
{ path: 'ai-predict', element: <AiPredictPage /> },
```

---

## 6. 홈 화면 변경

### 6.1 HomePage.tsx 수정

기존 메뉴 카드 그리드에 "AI 사진 식별" 카드 1개 추가:

```typescript
// 기존 메뉴 카드들 사이에 추가
<button
  onClick={() => navigate('/ai-predict')}
  className="rounded-2xl bg-white p-5 text-left shadow-sm border border-gray-100 active:bg-gray-50"
>
  <div className="mb-2 text-2xl">📸</div>
  <div className="font-semibold text-gray-900">AI 사진 식별</div>
  <div className="mt-1 text-sm text-gray-500">
    사진으로 폐기물 품목을<br />자동 식별합니다
  </div>
</button>
```

**위치**: 기존 메뉴 카드들 중 상단에 배치 (수수료 조회 다음)

---

## 7. 백엔드 설정 변경

### 7.1 application.yml 추가

```yaml
# AI Server 설정
ai:
  server:
    url: http://localhost:5000
    timeout: 10000  # 10초
```

### 7.2 build.gradle.kts 확인

`spring-boot-starter-web`에 `RestTemplate`이 포함되어 있으므로 추가 의존성 불필요. 파일 업로드 크기 제한만 확인:

```yaml
# application.yml에 추가
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
```

---

## 8. 에러 처리 설계

### 8.1 에러 시나리오

| 시나리오 | 발생 위치 | 처리 방법 |
|----------|----------|----------|
| AI 서버 미실행 | Spring Boot → Flask 호출 실패 | `BusinessException("AI_SERVER_UNAVAILABLE", "AI 서버에 연결할 수 없습니다")` |
| AI 서버 타임아웃 | Flask 응답 10초 초과 | `BusinessException("AI_SERVER_TIMEOUT", "분석 시간이 초과되었습니다")` |
| 이미지 파일 아님 | Controller 검증 | `BusinessException("INVALID_IMAGE", "이미지 파일만 업로드 가능합니다")` |
| 파일 크기 초과 | Spring multipart 제한 | Spring 기본 에러 → Global Exception Handler |
| 식별 결과 없음 | AI 추론 결과 0건 | 정상 응답 (`predictions: []`, `totalCount: 0`) |
| 프론트 네트워크 에러 | fetch 실패 | catch → 에러 메시지 표시 + 재시도 버튼 |

### 8.2 프론트엔드 에러 표시

```
┌─────────────────────────────────────┐
│                                     │
│  ⚠️ AI 서버에 연결할 수 없습니다.     │
│  잠시 후 다시 시도해주세요.            │
│                                     │
│  [다시 시도]                         │
│                                     │
└─────────────────────────────────────┘
```

---

## 9. 구현 순서 (Implementation Order)

```
Step 1: AI 서버 (ai-server/)
  ├── 1-1. ai-server/ 디렉토리 + requirements.txt
  ├── 1-2. model/best.pt 복사
  └── 1-3. app.py 작성 + 단독 테스트

Step 2: 백엔드 (backend/)
  ├── 2-1. application.yml AI 설정 + multipart 설정 추가
  ├── 2-2. AiPredictionResponse DTO
  ├── 2-3. WasteNameMapper (81개 매핑)
  ├── 2-4. AiPredictionService
  └── 2-5. AiPredictionController

Step 3: 프론트엔드 (frontend/)
  ├── 3-1. types/ai.ts
  ├── 3-2. services/aiService.ts
  ├── 3-3. features/ai/PhotoCapture.tsx
  ├── 3-4. features/ai/PredictionResult.tsx
  ├── 3-5. pages/AiPredictPage.tsx
  ├── 3-6. router/index.tsx 수정
  └── 3-7. pages/HomePage.tsx 수정
```

---

## 10. 파일 변경 총정리

### 10.1 신규 생성 파일 (10개)

| # | 파일 경로 | 설명 |
|---|----------|------|
| 1 | `ai-server/app.py` | Flask AI 추론 서버 |
| 2 | `ai-server/requirements.txt` | Python 의존성 |
| 3 | `ai-server/model/best.pt` | YOLOv8 학습 모델 복사 |
| 4 | `backend/.../domain/ai/AiPredictionController.java` | REST API 컨트롤러 |
| 5 | `backend/.../domain/ai/AiPredictionService.java` | 비즈니스 로직 서비스 |
| 6 | `backend/.../domain/ai/dto/AiPredictionResponse.java` | 응답 DTO |
| 7 | `backend/.../domain/ai/mapper/WasteNameMapper.java` | 클래스명 매핑 |
| 8 | `frontend/src/types/ai.ts` | TypeScript 타입 정의 |
| 9 | `frontend/src/services/aiService.ts` | AI API 서비스 |
| 10 | `frontend/src/pages/AiPredictPage.tsx` | AI 식별 페이지 |

### 10.2 기존 내부에 신규 생성 (2개)

| # | 파일 경로 | 설명 |
|---|----------|------|
| 11 | `frontend/src/features/ai/PhotoCapture.tsx` | 사진 촬영/업로드 컴포넌트 |
| 12 | `frontend/src/features/ai/PredictionResult.tsx` | 식별 결과 컴포넌트 |

### 10.3 수정 파일 (3개)

| # | 파일 경로 | 변경 내용 |
|---|----------|----------|
| 13 | `frontend/src/router/index.tsx` | `ai-predict` 라우트 추가 (1줄) |
| 14 | `frontend/src/pages/HomePage.tsx` | AI 사진 식별 메뉴 카드 추가 (~8줄) |
| 15 | `backend/src/main/resources/application.yml` | AI 서버 URL + multipart 설정 추가 (~6줄) |
