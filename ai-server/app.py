from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import os
import re
import base64
import tempfile
import requests as http_requests

app = Flask(__name__)
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', '*').split(',')
CORS(app, origins=ALLOWED_ORIGINS)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')
DETECT_MODEL_PATH = os.path.join(MODEL_DIR, 'best.pt')
DAMAGE_MODEL_PATH = os.path.join(MODEL_DIR, 'damage.pt')

BROKEN_THRESHOLD = float(os.environ.get('BROKEN_THRESHOLD', 0.25))
DAMAGE_THRESHOLD = float(os.environ.get('DAMAGE_THRESHOLD', 0.35))

# M1 — YOLO 신뢰 판단 상수 및 Ollama 설정
# Design Ref: §2.1 — TRUSTED_CLASSES 10개, confidence 0.5 이상인 경우만 YOLO 결과 신뢰
TRUSTED_CLASSES = {
    "의자",     # 84.7%  360장
    "자전거",   # 83.3%    6장
    "냉장고",   # 80.0%   65장
    "세탁기",   # 69.6%   23장
    "선풍기",   # 66.7%   30장
    "청소기",   # 64.3%   28장
    "서랍장",   # 61.5%  148장
    "텔레비젼", # 60.0%   10장
    "밥상",     # 57.7%  104장
    "소파류",   # 53.5%   99장
}
YOLO_CONFIDENCE_THRESHOLD = float(os.environ.get('YOLO_CONFIDENCE_THRESHOLD', 0.35))

OLLAMA_URL   = os.environ.get('OLLAMA_URL',   'http://localhost:11434')
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'qwen2.5vl:7b')
OLLAMA_TIMEOUT = int(os.environ.get('OLLAMA_TIMEOUT', 55))  # 백엔드 timeout(60s)보다 약간 작게

# Ollama가 반환할 품목 목록 (선택지 강제 프롬프트용)
OLLAMA_ITEM_LIST = (
    "가방류, 가스오븐레인지, 개수대류, 거울, 긴막대류, 김치냉장고, 난로, 냉장고, 다리미판, "
    "도마, 바닥깔개류, 밥상, 벽걸이시계, 변기통, 병풍, 보행기, 복사기, 블라인드, 비데, "
    "빨래건조대, 서랍장, 선풍기, 세탁기, 소파류, 스피커, 식기건조기, 식탁, 신발장, 액자, "
    "에어콘, 옥매트, 완구류, 운동기구류, 욕조, 유모차, 의자, 입간판, 자전거, 장롱, 장식장류, "
    "전축(오디오), 정수기, 조명기구, 차탁자, 책상, 책장류, 청소기, 침구류, 침대, 캐비닛류, "
    "커튼, 타이어, 텐트, 텔레비전대, 텔레비젼, 통류, 파티션, 프린트기, 피아노, 항아리류, "
    "문짝, 협탁, 화장대, 화장품함, 히터류, 전자레인지"
)

# 물품 탐지 모델 (필수)
try:
    detect_model = YOLO(DETECT_MODEL_PATH)
    print(f"[INFO] 물품 탐지 모델 로드됨: {DETECT_MODEL_PATH}")
except Exception as e:
    print(f"[ERROR] 물품 탐지 모델 로드 실패: {e}")
    detect_model = None

# 손상 분류 모델 (선택 - 없으면 기존 방식으로 동작)
damage_model = None
if os.path.exists(DAMAGE_MODEL_PATH):
    damage_model = YOLO(DAMAGE_MODEL_PATH)
    print(f"[INFO] 손상 분류 모델 로드됨: {DAMAGE_MODEL_PATH}")
    print(f"[INFO] 손상 클래스: {damage_model.names}")
else:
    print(f"[WARN] 손상 분류 모델 없음: {DAMAGE_MODEL_PATH}")
    print(f"[WARN] 손상 분류 없이 물품 탐지만 동작합니다.")

# 탐지 모델에서 제외할 손상 클래스 (broken=0, scratch=1)
DAMAGE_CLASS_NAMES = {'broken', 'scratch'}

DAMAGE_LEVEL_MAP = {"normal": "NONE", "scratch": "MINOR", "broken": "SEVERE"}
DAMAGE_PRIORITY  = {"NONE": 0, "MINOR": 1, "SEVERE": 2}


def classify_damage(image_path, bbox):
    """탐지된 물품 bbox를 크롭하여 손상 분류 모델로 분류"""
    if damage_model is None:
        return None, None

    try:
        img = Image.open(image_path)
        x1, y1, x2, y2 = bbox
        cropped = img.crop((x1, y1, x2, y2))

        # RGBA(투명 배경) → RGB 변환
        if cropped.mode == 'RGBA':
            cropped = cropped.convert('RGB')

        results = damage_model.predict(cropped, verbose=False)

        if results and results[0].probs is not None:
            probs = results[0].probs
            all_probs = probs.data.tolist()
            names = damage_model.names  # {0: 'broken', 1: 'normal', 2: 'scratch'}

            prob_by_name = {names[i]: all_probs[i] for i in range(len(all_probs))}
            broken_p = prob_by_name.get('broken', 0)
            scratch_p = prob_by_name.get('scratch', 0)
            damage_prob = broken_p + scratch_p

            # broken 단독 확률이 임계값 이상이면 scratch보다 낮아도 SEVERE로 직접 판정
            if broken_p >= BROKEN_THRESHOLD:
                damage_class = 'broken'
                conf = broken_p
            elif damage_prob >= DAMAGE_THRESHOLD:
                damage_class = 'scratch'
                conf = scratch_p
            else:
                top1_idx = int(probs.top1)
                damage_class = names[top1_idx]
                conf = float(probs.top1conf)

            print(f"[DAMAGE] {damage_class} ({conf:.4f}) | broken={prob_by_name.get('broken', 0):.3f} scratch={prob_by_name.get('scratch', 0):.3f} normal={prob_by_name.get('normal', 0):.3f}")
            return damage_class, round(conf, 4)
    except Exception as e:
        print(f"[WARN] 손상 분류 실패: {e}")

    return None, None


# M2 — YOLO 신뢰 여부 판단
# Design Ref: §2.2 — confidence ≥ THRESHOLD AND className ∈ TRUSTED_CLASSES
def is_yolo_confident(predictions: list) -> bool:
    """YOLO predictions 리스트에서 신뢰할 수 있는 결과가 있는지 확인."""
    if not predictions:
        return False
    top = max(predictions, key=lambda x: x["confidence"])
    return (
        top["confidence"] >= YOLO_CONFIDENCE_THRESHOLD
        and top["className"] in TRUSTED_CLASSES
    )


# M3 — Ollama fallback 호출 (품목 + 손상 통합)
# Design Ref: §2.3 — base64 이미지 전달, JSON 응답 강제, 파싱 실패 시 정규식 fallback
def ollama_predict(image_path: str):
    """이미지를 Ollama에게 전달해 품목명과 손상등급을 한 번에 반환.

    Returns:
        {"item": "품목명", "damage": "NONE|MINOR|SEVERE"} 또는 None(실패)
    """
    try:
        with open(image_path, "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode("utf-8")

        prompt = (
            "You must respond in Korean only. No English allowed.\n\n"
            "다음 이미지에서 아래 두 가지를 JSON으로만 응답하세요. "
            "설명, 마크다운, 영어 사용 절대 금지. 반드시 한국어 JSON만.\n\n"
            f"품목: 아래 목록에서 정확히 하나만 선택 (목록에 없는 단어 사용 금지)\n[{OLLAMA_ITEM_LIST}]\n\n"
            "손상: NONE(정상), MINOR(경미한 흠집/오염), SEVERE(파손/심한 손상) 중 하나\n\n"
            '응답 형식 예시: {"item": "의자", "damage": "MINOR"}'
        )

        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "images": [img_b64],
            "stream": False,
        }

        resp = http_requests.post(
            f"{OLLAMA_URL}/api/generate",
            json=payload,
            timeout=OLLAMA_TIMEOUT,
        )
        resp.raise_for_status()
        raw = resp.json().get("response", "")
        print(f"[OLLAMA] raw response: {raw[:200]}")

        # JSON 직접 파싱 시도
        try:
            result = __import__('json').loads(raw)
            if "item" in result and "damage" in result:
                return result
        except Exception:
            pass

        # 정규식 fallback
        match = re.search(r'\{[^{}]*"item"\s*:\s*"([^"]+)"[^{}]*"damage"\s*:\s*"([^"]+)"[^{}]*\}', raw)
        if not match:
            match = re.search(r'\{[^{}]*"damage"\s*:\s*"([^"]+)"[^{}]*"item"\s*:\s*"([^"]+)"[^{}]*\}', raw)
            if match:
                return {"item": match.group(2), "damage": match.group(1)}
        if match:
            return {"item": match.group(1), "damage": match.group(2)}

        print(f"[OLLAMA] 파싱 실패 — 응답을 JSON으로 추출할 수 없습니다.")
        return None

    except http_requests.exceptions.Timeout:
        print(f"[OLLAMA] 타임아웃 ({OLLAMA_TIMEOUT}s 초과)")
        return None
    except Exception as e:
        print(f"[OLLAMA] 호출 실패: {e}")
        return None


@app.route('/predict', methods=['POST'])
def predict():
    if detect_model is None:
        return jsonify({"success": False, "error": "Detection model not loaded"}), 503

    if 'image' not in request.files:
        return jsonify({"success": False, "error": "No image file provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"success": False, "error": "Empty filename"}), 400

    temp_path = None
    try:
        # 포맷/해상도에 무관한 결과를 위해 RGB JPEG 1280px로 정규화
        img = Image.open(file.stream)
        if img.mode != 'RGB':
            img = img.convert('RGB')

        MAX_SIZE = 1280
        if max(img.size) > MAX_SIZE:
            img.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)

        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            img.save(tmp, format='JPEG', quality=95)
            temp_path = tmp.name

        results = detect_model.predict(temp_path, conf=0.1, save=False)
        predictions = []

        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])
                class_name = detect_model.names[cls_id]

                if class_name.lower() in DAMAGE_CLASS_NAMES:
                    continue

                pred = {
                    "classId":    cls_id,
                    "className":  class_name,
                    "confidence": round(confidence, 4),
                    "bbox": {
                        "x1": round(x1, 1), "y1": round(y1, 1),
                        "x2": round(x2, 1), "y2": round(y2, 1),
                    },
                }

                damage_class, damage_conf = classify_damage(temp_path, (x1, y1, x2, y2))
                if damage_class is not None:
                    pred["damageClass"]      = damage_class
                    pred["damageConfidence"] = damage_conf

                predictions.append(pred)

        predictions.sort(key=lambda x: x["confidence"], reverse=True)

        # M4 — YOLO / Ollama 분기
        # Design Ref: §2.4 — is_yolo_confident() 결과로 경로 결정
        if is_yolo_confident(predictions):
            # ── YOLO 성공 경로 (기존 로직 보존 + source 필드 추가)
            print(f"[PREDICT] source=yolo (top: {predictions[0]['className']} {predictions[0]['confidence']:.2f})")
            damage = None
            for pred in predictions:
                if "damageClass" in pred:
                    level = DAMAGE_LEVEL_MAP.get(pred["damageClass"], "NONE")
                    if damage is None or DAMAGE_PRIORITY[level] > DAMAGE_PRIORITY[damage["level"]]:
                        damage = {
                            "type":       pred["damageClass"],
                            "confidence": pred["damageConfidence"],
                            "level":      level,
                        }
            return jsonify({"success": True, "source": "yolo", "predictions": predictions, "damage": damage})

        else:
            # ── Ollama fallback 경로
            # Design Ref: §2.4 — YOLO 실패 시 Ollama에 품목+손상 통합 요청
            top_label = predictions[0]["className"] if predictions else "없음"
            top_conf  = predictions[0]["confidence"] if predictions else 0
            print(f"[PREDICT] source=ollama (YOLO 실패 — top: {top_label} {top_conf:.2f})")

            ollama_result = ollama_predict(temp_path)

            if ollama_result is None:
                # Ollama 자체 실패 (미실행 / 타임아웃 / 파싱 불가)
                error_type = "ollama_unavailable"
                return jsonify({"success": False, "error": error_type}), 503

            item_name   = ollama_result.get("item", "알 수 없음")
            damage_str  = ollama_result.get("damage", "NONE")

            # damage_str → damageClass 역매핑
            DAMAGE_REVERSE = {"NONE": "normal", "MINOR": "scratch", "SEVERE": "broken"}
            damage_class = DAMAGE_REVERSE.get(damage_str, "normal")

            ollama_pred = {
                "className":        item_name,
                "confidence":       None,
                "bbox":             None,
                "damageClass":      damage_class,
                "damageConfidence": None,
            }
            damage = {
                "type":       damage_class,
                "confidence": None,
                "level":      damage_str,
            }
            return jsonify({
                "success":     True,
                "source":      "ollama",
                "predictions": [ollama_pred],
                "damage":      damage,
            })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


# M5 — /health에 Ollama 상태 추가
# Design Ref: §2.6 — GET /api/tags 로 Ollama ping
@app.route('/health', methods=['GET'])
def health():
    ollama_available = False
    try:
        r = http_requests.get(f"{OLLAMA_URL}/api/tags", timeout=3)
        ollama_available = r.status_code == 200
    except Exception:
        pass

    return jsonify({
        "status":       "ok" if detect_model else "degraded",
        "detectModel":  os.path.basename(DETECT_MODEL_PATH) if detect_model else "not loaded",
        "detectClasses": len(detect_model.names) if detect_model else 0,
        "damageModel":  os.path.basename(DAMAGE_MODEL_PATH) if damage_model else "not loaded",
        "damageClasses": list(damage_model.names.values()) if damage_model else [],
        "ollama": {
            "url":       OLLAMA_URL,
            "model":     OLLAMA_MODEL,
            "available": ollama_available,
        },
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
