# AI Server 개선사항

> 분석일: 2026-05-21

---

## 1. 성능 - classify_damage 임시 파일 제거

**현재:** crop 이미지를 임시 파일로 저장 → 읽기 → 삭제 (불필요한 디스크 I/O)

**개선:** YOLO는 PIL Image 객체를 직접 받을 수 있으므로 임시 파일 단계 제거

```python
# 개선 전 (app.py:50-55)
with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
    cropped.save(tmp, format='JPEG')
    crop_path = tmp.name
results = damage_model.predict(crop_path, verbose=False)
os.remove(crop_path)

# 개선 후
results = damage_model.predict(cropped, verbose=False)
```

---

## 2. 손상 판정 임계값 하드코딩

**현재:** `broken_p >= 0.25`, `damage_prob >= 0.35` 가 코드에 직접 박혀 있어 튜닝 어려움

**개선:** 환경변수 또는 상수로 분리

```python
BROKEN_THRESHOLD = float(os.environ.get('BROKEN_THRESHOLD', 0.25))
DAMAGE_THRESHOLD = float(os.environ.get('DAMAGE_THRESHOLD', 0.35))
```

---

## 3. detect 모델 로드 실패 시 서버 크래시

**현재:** `detect_model = YOLO(DETECT_MODEL_PATH)` 에서 파일이 없으면 서버 시작 불가

**개선:** `damage_model` 처럼 예외 처리 추가

```python
try:
    detect_model = YOLO(DETECT_MODEL_PATH)
except Exception as e:
    print(f"[ERROR] 물품 탐지 모델 로드 실패: {e}")
    detect_model = None
```

---

## 4. /health 응답 모델명 하드코딩

**현재:** `"detectModel": "YOLOv8n"` 이 고정값이라 실제 모델과 불일치 가능

**개선:** 모델 파일명에서 동적으로 읽기

```python
"detectModel": os.path.basename(DETECT_MODEL_PATH)
```

---

## 5. CORS 전체 허용

**현재:** `CORS(app)` 으로 모든 도메인 허용 — 프로덕션에서 보안 위험

**개선:** 허용 도메인 명시

```python
CORS(app, origins=["https://your-frontend.com"])
```

---

## 우선순위

| 순위 | 항목 | 이유 |
|------|------|------|
| 1 | 임시 파일 제거 | 성능 직접 영향, 수정 간단 |
| 2 | detect 모델 예외처리 | 서버 안정성 |
| 3 | 임계값 분리 | 모델 튜닝 편의성 |
| 4 | CORS 제한 | 프로덕션 배포 전 필수 |
| 5 | health 모델명 | 운영 편의성 |
