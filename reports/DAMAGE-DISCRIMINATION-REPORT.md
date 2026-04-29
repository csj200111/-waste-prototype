# 손상 판별 고도화 작업 보고서

> 작성일: 2026-04-29
> 브랜치: `damage-Discrimination`
> 수정 파일: `ai-server/app.py`, `frontend/src/pages/ai/AiResultPage.tsx`

---

## 0. 3줄 요약

1. **손상 분류 로직 개선**: `broken` + `scratch` 확률을 합산하여 0.4 이상이면 더 심한 클래스로 판정하는 방식으로 변경 → 모델이 확신하지 못하는 경계 케이스에서 손상을 놓치는 문제 해결.
2. **이미지 정규화 추가**: 업로드된 이미지를 RGB JPEG 1280px로 통일하여 포맷·해상도 차이로 인한 추론 불일치 제거.
3. **API 응답에 `damage` 최상위 필드 추가**: 여러 감지 결과 중 가장 심한 손상 하나를 프론트엔드가 바로 사용할 수 있도록 집계.

---

## 1. 변경 상세

### 1-1. 상수 추가 (`ai-server/app.py`)

```python
DAMAGE_LEVEL_MAP = {"normal": "NONE", "scratch": "MINOR", "broken": "SEVERE"}
DAMAGE_PRIORITY  = {"NONE": 0, "MINOR": 1, "SEVERE": 2}
```

- 손상 클래스 이름을 UI 레벨(`NONE / MINOR / SEVERE`)로 변환하는 매핑 테이블을 코드 최상단에 정의.
- 여러 예측 결과 중 우선순위 비교에 `DAMAGE_PRIORITY` 딕셔너리를 사용하여 if-else 없이 처리.

---

### 1-2. `classify_damage()` 판정 로직 변경 (`ai-server/app.py`)

#### 변경 전 (단순 top1 사용)

```python
top1_idx  = int(probs.top1)
top1_conf = float(probs.top1conf)
damage_class = damage_model.names[top1_idx]
return damage_class, round(top1_conf, 4)
```

#### 변경 후 (합산 확률 기반 판정)

```python
all_probs    = probs.data.tolist()
prob_by_name = {names[i]: all_probs[i] for i in range(len(all_probs))}
damage_prob  = prob_by_name.get('broken', 0) + prob_by_name.get('scratch', 0)

if damage_prob >= 0.4:
    if prob_by_name['broken'] >= prob_by_name['scratch']:
        damage_class, conf = 'broken', prob_by_name['broken']
    else:
        damage_class, conf = 'scratch', prob_by_name['scratch']
else:
    top1_idx     = int(probs.top1)
    damage_class = names[top1_idx]
    conf         = float(probs.top1conf)
```

| 항목 | 이전 방식 | 새 방식 |
|---|---|---|
| 판정 기준 | 가장 확률 높은 클래스 1개 | broken + scratch 합산 확률 |
| 임계값 | 없음 (항상 top1) | 합산 0.4 이상 시 손상 판정 |
| 경계 케이스 | normal 0.55 / broken 0.35 → "정상" 판정 | normal 0.55 / broken 0.35 → broken+scratch > 0.4 이면 "broken" 판정 |
| 로그 | `[DAMAGE] broken (0.3500)` | 3개 클래스 확률 모두 출력 |

**변경 이유**: 모델이 한 클래스에 높은 확신을 갖지 못하는 애매한 이미지에서, 손상 신호가 두 클래스로 분산되어 `normal`이 top1이 되는 오분류가 발생했기 때문.

---

### 1-3. 이미지 정규화 (`ai-server/app.py`)

#### 변경 전

```python
suffix = os.path.splitext(file.filename)[1] or '.jpg'
with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
    file.save(tmp)
```

#### 변경 후

```python
img = Image.open(file.stream)
if img.mode != 'RGB':
    img = img.convert('RGB')

MAX_SIZE = 1280
if max(img.size) > MAX_SIZE:
    img.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)

with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
    img.save(tmp, format='JPEG', quality=95)
```

- **RGB 변환**: RGBA·PNG·HEIC 등 4채널 이미지가 들어왔을 때 YOLO 추론 오류 방지.
- **1280px 리사이즈**: 고해상도 이미지(예: 4K 스마트폰 사진) 처리 속도 정상화.
- **JPEG 고정 저장**: 확장자 의존성 제거, 추론 입력 포맷 일관성 확보.

---

### 1-4. API 응답에 `damage` 최상위 필드 추가 (`ai-server/app.py`)

#### 변경 전 응답

```json
{
  "success": true,
  "predictions": [ ... ]
}
```

#### 변경 후 응답

```json
{
  "success": true,
  "predictions": [ ... ],
  "damage": {
    "type": "broken",
    "confidence": 0.812,
    "level": "SEVERE"
  }
}
```

- 여러 `predictions` 중 `DAMAGE_PRIORITY` 기준으로 **가장 심한 손상 1건**을 선택하여 최상위에 노출.
- 손상이 없는 경우 `"damage": null` 반환.
- 프론트엔드가 배열을 순회할 필요 없이 `damage.level` 하나로 분기 처리 가능.

---

### 1-5. 프론트엔드 정렬 수정 (`frontend/src/pages/ai/AiResultPage.tsx`)

```typescript
// 변경 전
NONE:  { type: 'share', msg: '...' },
MINOR: { type: 'share', msg: '...' },

// 변경 후 (공백 정렬)
NONE:  { type: 'share',   msg: '...' },
MINOR: { type: 'share',   msg: '...' },
```

- `RECOMMEND` 객체의 `type` 값 뒤 공백 정렬. 기능 변경 없음.

---

## 2. 영향 범위

| 영역 | 변경 여부 | 비고 |
|---|---|---|
| AI 추론 결과 | **변경됨** | 경계 케이스에서 손상 탐지율 증가 |
| API 응답 스키마 | **변경됨** | `damage` 필드 추가 (하위 호환 유지) |
| 이미지 처리 파이프라인 | **변경됨** | 포맷 불일치 오류 제거 |
| 프론트엔드 렌더링 | 미변경 | 정렬만 수정 |
| DB / 백엔드 서버 | 미변경 | |

---

## 3. 테스트 포인트

- [ ] PNG / HEIC / RGBA 이미지 업로드 시 오류 없이 처리되는지 확인
- [ ] 고해상도(4K 이상) 이미지 업로드 속도 정상화 확인
- [ ] 경계 케이스(broken 0.3 + scratch 0.15 = 0.45) → "broken" 판정 확인
- [ ] 정상 물품(normal 0.7+) → `"damage": null` 반환 확인
- [ ] 여러 물품 감지 시 가장 심한 손상이 `damage.level`에 반영되는지 확인
