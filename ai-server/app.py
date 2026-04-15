from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import os
import tempfile

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')
DETECT_MODEL_PATH = os.path.join(MODEL_DIR, 'best.pt')
DAMAGE_MODEL_PATH = os.path.join(MODEL_DIR, 'damage.pt')

# 물품 탐지 모델 (필수)
detect_model = YOLO(DETECT_MODEL_PATH)

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

        # 크롭 이미지를 임시 파일로 저장 후 분류
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            cropped.save(tmp, format='JPEG')
            crop_path = tmp.name

        results = damage_model.predict(crop_path, verbose=False)
        os.remove(crop_path)

        if results and results[0].probs is not None:
            probs = results[0].probs
            top1_idx = int(probs.top1)
            top1_conf = float(probs.top1conf)
            damage_class = damage_model.names[top1_idx]
            print(f"[DAMAGE] {damage_class} ({top1_conf:.4f})")
            return damage_class, round(top1_conf, 4)
    except Exception as e:
        print(f"[WARN] 손상 분류 실패: {e}")

    return None, None


@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"success": False, "error": "No image file provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"success": False, "error": "Empty filename"}), 400

    temp_path = None
    try:
        suffix = os.path.splitext(file.filename)[1] or '.jpg'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            file.save(tmp)
            temp_path = tmp.name

        results = detect_model.predict(temp_path, conf=0.1, save=False)
        predictions = []

        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])
                class_name = detect_model.names[cls_id]

                # 탐지 모델의 broken/scratch 결과는 무시
                if class_name.lower() in DAMAGE_CLASS_NAMES:
                    continue

                pred = {
                    "classId": cls_id,
                    "className": class_name,
                    "confidence": round(confidence, 4),
                    "bbox": {
                        "x1": round(x1, 1),
                        "y1": round(y1, 1),
                        "x2": round(x2, 1),
                        "y2": round(y2, 1)
                    }
                }

                # 손상 분류 모델이 있으면 크롭 후 분류
                damage_class, damage_conf = classify_damage(
                    temp_path, (x1, y1, x2, y2)
                )
                if damage_class is not None:
                    pred["damageClass"] = damage_class
                    pred["damageConfidence"] = damage_conf

                predictions.append(pred)

        predictions.sort(key=lambda x: x["confidence"], reverse=True)

        return jsonify({"success": True, "predictions": predictions})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "detectModel": "YOLOv8n",
        "detectClasses": len(detect_model.names),
        "damageModel": "YOLOv8s-cls" if damage_model else "not loaded",
        "damageClasses": list(damage_model.names.values()) if damage_model else []
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
