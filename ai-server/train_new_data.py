"""
새 Training 데이터로 YOLOv8 학습 스크립트
- C:/yolo_training 의 YOLO 형식 데이터로 학습
- 82 → 68 클래스 (유사 클래스 병합)
- GPU 사용 (RTX 3080)
- benchmark 모드: 1 epoch만 실행하여 시간 측정
"""

import json
import os
import sys
import shutil
import random
import time
from pathlib import Path
from PIL import Image
from ultralytics import YOLO

# ── 경로 설정 ──
BASE_DIR = Path(__file__).resolve().parent
TRAINING_DIR = Path("D:/생활 폐기물 이미지/Training")
DATA_ROOT = Path("D:/생활 폐기물 이미지")
DATASET_DIR = Path("C:/yolo_training")           # SSD에서 데이터 로딩 (빠름)
RUNS_DIR = DATASET_DIR / "runs"                   # 학습 결과도 C드라이브(SSD)에
MODEL_OUTPUT_DIR = BASE_DIR / "model"

# ── 학습 설정 ──
TRAIN_RATIO = 0.8
RANDOM_SEED = 42
EPOCHS = 20
IMG_SIZE = 640
BATCH_SIZE = 16

# ── 68 클래스 (유사 클래스 병합: 82 → 68) ──
CLASS_NAMES = [
    "broken", "scratch",                              # 0-1: 상태 표시
    "가방류", "가스오븐레인지", "개수대류",              # 2-4
    "거울", "긴막대류", "김치냉장고", "난로",            # 5-8
    "냉장고", "다리미판", "도마", "바닥깔개류",          # 9-12
    "밥상", "벽걸이시계", "변기통", "병풍",              # 13-16
    "보행기", "복사기", "블라인드", "비데",              # 17-20
    "빨래건조대", "서랍장", "선풍기", "세탁기",          # 21-24
    "소파류", "스피커", "식기건조기", "식탁",            # 25-28
    "신발장", "액자", "에어콘", "옥매트",                # 29-32
    "완구류", "운동기구류", "욕조", "유모차",            # 33-36
    "의자", "입간판", "자전거", "장롱",                  # 37-40
    "장식장류", "전축(오디오)", "정수기", "조명기구",    # 41-44
    "차탁자", "책상", "책장류", "청소기",                # 45-48
    "침구류", "침대", "캐비닛류", "커튼",                # 49-52
    "타이어", "텐트", "텔레비전대", "텔레비젼",          # 53-56
    "통류", "파티션", "프린트기", "피아노",              # 57-60
    "항아리류", "문짝", "협탁", "화장대",                # 61-64
    "화장품함", "히터류", "전자레인지",                  # 65-67
]

CLASS_TO_ID = {name: idx for idx, name in enumerate(CLASS_NAMES)}

# ── DAMAGE 필드 → broken/scratch 매핑 ──
DAMAGE_MAP = {
    "일부훼손": "scratch",
    "상당훼손": "broken",
    "심한훼손": "broken",
    # "원형" → 손상 없음, 매핑 안 함
}

# ── 새 데이터 DETAILS → 병합 클래스명 매핑 ──
DETAILS_MAP = {
    # 가구류
    "밥상": "밥상",
    "서랍장": "서랍장",
    "소파": "소파류",
    "의자": "의자",
    "장롱": "장롱",
    "책상": "책상",
    "침대": "침대",
    "협탁": "협탁",
    "화장대": "화장대",
    # 자전거 (세부 종류 → 자전거로 통합)
    "네발자전거": "자전거",
    "두발자전거": "자전거",
    "세발자전거": "자전거",
    "자전거": "자전거",
    # 전자제품
    "TV": "텔레비젼",
    "냉장고": "냉장고",
    "복사기": "복사기",
    "선풍기": "선풍기",
    "세탁기": "세탁기",
    "식기건조기": "식기건조기",
    "에어컨": "에어콘",
    "오디오": "전축(오디오)",
    "전기정수기": "정수기",
    "전기히터": "히터류",
    "전자레인지": "전자레인지",
    "청소기": "청소기",
    "프린터": "프린트기",
    # 기존 클래스명 호환
    "텔레비젼": "텔레비젼",
    "텔레비전": "텔레비젼",
    "소파류": "소파류",
    "에어콘": "에어콘",
    "정수기": "정수기",
    "히터류": "히터류",
    "프린트기": "프린트기",
    "전축(오디오)": "전축(오디오)",
    "김치냉장고": "김치냉장고",
    "가스오븐레인지": "가스오븐레인지",
    "식탁": "식탁",
    "신발장": "신발장",
    "스피커": "스피커",
    "비데": "비데",
    # ── 병합 매핑 (유사 클래스 통합) ──
    # 책장류 (책꽂이 + 책장)
    "책장": "책장류",
    "책꽂이": "책장류",
    # 장식장류 (장식장 + 오디오장식장 + 진열장)
    "장식장": "장식장류",
    "오디오장식장": "장식장류",
    "진열장": "장식장류",
}


def find_image_label_pairs():
    """이미지와 라벨 JSON 파일 쌍을 찾아서 반환"""
    pairs = []
    skipped_labels = set()

    # 이미지 폴더 순회 (Training_라벨링데이터 제외)
    for img_category_dir in sorted(TRAINING_DIR.iterdir()):
        if not img_category_dir.is_dir():
            continue
        if "라벨링" in img_category_dir.name:
            continue

        # 폴더명 파싱: [T원천]카테고리_품목_품목
        dir_name = img_category_dir.name
        # [T원천]가구류_밥상_밥상 → 카테고리=가구류, 품목=밥상
        parts = dir_name.replace("[T원천]", "").split("_")
        if len(parts) < 3:
            continue
        category = parts[0]  # 가구류, 전자제품, 자전거
        item = parts[1]      # 밥상, 소파, TV 등

        # 대응하는 라벨 폴더
        # 자전거의 경우: 자전거_네발자전거 → Training_라벨링데이터/자전거/네발자전거
        label_base = TRAINING_DIR / "Training_라벨링데이터" / category / item

        if not label_base.exists():
            print(f"  [경고] 라벨 폴더 없음: {label_base}")
            continue

        # 세션 폴더 순회
        for session_dir in sorted(img_category_dir.iterdir()):
            if not session_dir.is_dir():
                continue

            session_name = session_dir.name
            label_session_dir = label_base / session_name

            if not label_session_dir.exists():
                continue

            # 이미지 파일 순회
            for img_file in sorted(session_dir.iterdir()):
                if not img_file.suffix.lower() in [".jpg", ".jpeg", ".png"]:
                    continue

                # 대응 JSON 파일
                json_name = img_file.stem + ".Json"
                json_path = label_session_dir / json_name
                if not json_path.exists():
                    # 대소문자 변형 시도
                    json_name_lower = img_file.stem + ".json"
                    json_path = label_session_dir / json_name_lower
                    if not json_path.exists():
                        continue

                pairs.append((img_file, json_path, category, item))

    return pairs


def parse_label(json_path):
    """JSON 라벨 파일에서 바운딩 박스 정보 추출"""
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    bboxes = []
    for bbox in data.get("Bounding", []):
        details = bbox.get("DETAILS", "")
        class_name = DETAILS_MAP.get(details)

        if class_name is None:
            continue  # 매핑 불가 → 스킵

        if class_name not in CLASS_TO_ID:
            continue

        class_id = CLASS_TO_ID[class_name]

        try:
            x1 = int(bbox["x1"])
            y1 = int(bbox["y1"])
            x2 = int(bbox["x2"])
            y2 = int(bbox["y2"])
        except (ValueError, KeyError):
            continue

        bboxes.append((class_id, x1, y1, x2, y2))

        # DAMAGE 필드 → broken/scratch 바운딩 박스 추가
        damage = bbox.get("DAMAGE", "")
        damage_class = DAMAGE_MAP.get(damage)
        if damage_class and damage_class in CLASS_TO_ID:
            bboxes.append((CLASS_TO_ID[damage_class], x1, y1, x2, y2))

    # 이미지 해상도
    resolution = data.get("RESOLUTION", "0*0")
    try:
        w_str, h_str = resolution.split("*")
        img_w, img_h = int(w_str), int(h_str)
    except ValueError:
        img_w, img_h = 0, 0

    return bboxes, img_w, img_h


def convert_bbox_to_yolo(x1, y1, x2, y2, img_w, img_h):
    """픽셀 좌표 → YOLO 정규화 좌표 (cx, cy, w, h)"""
    x1, x2 = min(x1, x2), max(x1, x2)
    y1, y2 = min(y1, y2), max(y1, y2)

    x1 = max(0, min(x1, img_w))
    x2 = max(0, min(x2, img_w))
    y1 = max(0, min(y1, img_h))
    y2 = max(0, min(y2, img_h))

    cx = ((x1 + x2) / 2) / img_w
    cy = ((y1 + y2) / 2) / img_h
    w = (x2 - x1) / img_w
    h = (y2 - y1) / img_h

    if w <= 0 or h <= 0:
        return None

    return cx, cy, w, h


def prepare_dataset(pairs):
    """데이터셋 준비: 이미지 + 라벨 → YOLO 형식으로 변환 + train/val 분할"""
    print("=" * 60)
    print("1단계: 데이터셋 디렉토리 생성")
    print("=" * 60)

    if DATASET_DIR.exists():
        shutil.rmtree(DATASET_DIR)

    for split in ["train", "val"]:
        (DATASET_DIR / split / "images").mkdir(parents=True, exist_ok=True)
        (DATASET_DIR / split / "labels").mkdir(parents=True, exist_ok=True)

    print(f"  디렉토리 생성: {DATASET_DIR}")

    print()
    print("=" * 60)
    print("2단계: 이미지 + 라벨 변환 (YOLO 형식)")
    print("=" * 60)

    random.seed(RANDOM_SEED)
    random.shuffle(pairs)

    split_idx = int(len(pairs) * TRAIN_RATIO)
    train_pairs = pairs[:split_idx]
    val_pairs = pairs[split_idx:]

    print(f"  전체: {len(pairs)}개 → Train: {len(train_pairs)}, Val: {len(val_pairs)}")

    stats = {"success": 0, "skipped": 0, "no_bbox": 0, "class_count": {}}

    for split_name, pair_list in [("train", train_pairs), ("val", val_pairs)]:
        for i, (img_path, json_path, category, item) in enumerate(pair_list):
            if (i + 1) % 5000 == 0:
                print(f"    [{split_name}] {i + 1}/{len(pair_list)} 처리 중...")

            # JSON 라벨 파싱
            bboxes, img_w, img_h = parse_label(json_path)

            if not bboxes:
                stats["no_bbox"] += 1
                continue

            # 이미지 해상도 확인 (JSON에서 가져왔지만 0이면 실제 이미지에서 읽기)
            if img_w <= 0 or img_h <= 0:
                try:
                    with Image.open(img_path) as img:
                        img_w, img_h = img.size
                except Exception:
                    stats["skipped"] += 1
                    continue

            # YOLO 라벨 생성
            yolo_lines = []
            for class_id, x1, y1, x2, y2 in bboxes:
                result = convert_bbox_to_yolo(x1, y1, x2, y2, img_w, img_h)
                if result is None:
                    continue
                cx, cy, w, h = result
                yolo_lines.append(f"{class_id} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}")

                # 통계
                cls_name = CLASS_NAMES[class_id]
                stats["class_count"][cls_name] = stats["class_count"].get(cls_name, 0) + 1

            if not yolo_lines:
                stats["no_bbox"] += 1
                continue

            # 고유 파일명 생성 (충돌 방지)
            unique_name = f"{category}_{item}_{img_path.parent.name}_{img_path.stem}"

            # 이미지 복사
            dest_img = DATASET_DIR / split_name / "images" / f"{unique_name}.jpg"
            shutil.copy2(img_path, dest_img)

            # 라벨 저장
            dest_label = DATASET_DIR / split_name / "labels" / f"{unique_name}.txt"
            with open(dest_label, "w") as f:
                f.write("\n".join(yolo_lines) + "\n")

            stats["success"] += 1

    print(f"\n  변환 성공: {stats['success']}개")
    print(f"  bbox 없음: {stats['no_bbox']}개")
    print(f"  스킵: {stats['skipped']}개")

    print("\n  클래스별 bbox 수:")
    for cls_name, count in sorted(stats["class_count"].items(), key=lambda x: -x[1]):
        cls_id = CLASS_TO_ID[cls_name]
        print(f"    [{cls_id:2d}] {cls_name}: {count}개")

    # data.yaml 생성
    print()
    print("=" * 60)
    print("3단계: data.yaml 생성")
    print("=" * 60)

    data_yaml_path = DATASET_DIR / "data.yaml"
    yaml_content = f"path: {DATASET_DIR.as_posix()}\n"
    yaml_content += "train: train/images\n"
    yaml_content += "val: val/images\n"
    yaml_content += f"\nnc: {len(CLASS_NAMES)}\n"
    yaml_content += "names:\n"
    for idx, name in enumerate(CLASS_NAMES):
        yaml_content += f"  {idx}: {name}\n"

    with open(data_yaml_path, "w", encoding="utf-8") as f:
        f.write(yaml_content)

    print(f"  저장: {data_yaml_path}")
    print(f"  클래스 수: {len(CLASS_NAMES)}")

    return data_yaml_path, stats


def benchmark_epoch(data_yaml_path):
    """1 에포크만 실행하여 소요 시간 측정"""
    print()
    print("=" * 60)
    print("벤치마크: 1 에포크 소요 시간 측정")
    print("=" * 60)

    import torch
    print(f"  GPU: {torch.cuda.get_device_name(0)}")
    print(f"  VRAM: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
    print(f"  Batch Size: {BATCH_SIZE}")
    print(f"  Image Size: {IMG_SIZE}")
    print()

    existing_model = MODEL_OUTPUT_DIR / "best.pt"
    if existing_model.exists():
        print(f"  기존 모델 기반 전이 학습: {existing_model}")
        model = YOLO(str(existing_model))
    else:
        print("  사전 훈련된 yolov8n.pt 사용")
        model = YOLO("yolov8n.pt")

    start_time = time.time()

    model.train(
        data=str(data_yaml_path),
        epochs=1,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        name="throw_it_benchmark",
        project=str(RUNS_DIR),
        exist_ok=True,
        patience=0,
        save=False,
        plots=False,
        verbose=True,
        device=0,  # GPU 0
        workers=2,  # Windows pin_memory 오류 방지 (0은 너무 느림)
    )

    elapsed = time.time() - start_time

    print()
    print("=" * 60)
    print(f"  1 에포크 소요 시간: {elapsed:.1f}초 ({elapsed/60:.1f}분)")
    print(f"  50 에포크 예상 시간: {elapsed * 50 / 60:.1f}분 ({elapsed * 50 / 3600:.1f}시간)")
    print(f"  (조기 종료 시 더 빨리 끝날 수 있음, patience=10)")
    print("=" * 60)

    return elapsed


def train_full(data_yaml_path):
    """전체 학습 실행"""
    print()
    print("=" * 60)
    print("전체 학습 시작")
    print("=" * 60)
    print(f"  Epochs: {EPOCHS}")
    print(f"  Image Size: {IMG_SIZE}")
    print(f"  Batch Size: {BATCH_SIZE}")
    print()

    existing_model = MODEL_OUTPUT_DIR / "best.pt"
    if existing_model.exists():
        print(f"  기존 모델 기반 전이 학습: {existing_model}")
        model = YOLO(str(existing_model))
    else:
        print("  사전 훈련된 yolov8n.pt 사용")
        model = YOLO("yolov8n.pt")

    results = model.train(
        data=str(data_yaml_path),
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        name="throw_it_train_new",
        project=str(RUNS_DIR),
        exist_ok=True,
        patience=10,
        save=True,
        plots=True,
        verbose=True,
        device=0,  # GPU 0
        workers=2,  # Windows pin_memory 오류 방지 (0은 너무 느림)
    )

    return results


def deploy_model():
    """학습된 best.pt를 model/ 폴더로 배포"""
    print()
    print("=" * 60)
    print("학습된 모델 배포")
    print("=" * 60)

    trained_best = RUNS_DIR / "throw_it_train_new" / "weights" / "best.pt"
    if not trained_best.exists():
        trained_best = RUNS_DIR / "throw_it_train_new" / "weights" / "last.pt"

    if trained_best.exists():
        dest = MODEL_OUTPUT_DIR / "best.pt"
        backup = MODEL_OUTPUT_DIR / "best_backup.pt"
        if dest.exists():
            shutil.copy2(dest, backup)
            print(f"  기존 모델 백업: {backup}")

        shutil.copy2(trained_best, dest)
        print(f"  새 모델 배포: {dest}")
        print(f"  모델 크기: {dest.stat().st_size / 1024 / 1024:.1f} MB")
    else:
        print("  학습된 모델을 찾을 수 없습니다!")


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "benchmark"

    print()
    print("╔════════════════════════════════════════════════════╗")
    print("║  YOLOv8 대형폐기물 인식 - 새 데이터 학습 스크립트  ║")
    print("╚════════════════════════════════════════════════════╝")
    print(f"  모드: {mode}")
    print()

    # 1. 기존 변환 데이터 확인
    data_yaml_path = DATASET_DIR / "data.yaml"
    train_images_dir = DATASET_DIR / "train" / "images"

    if data_yaml_path.exists() and train_images_dir.exists() and any(train_images_dir.iterdir()):
        train_count = len(list(train_images_dir.glob("*")))
        val_count = len(list((DATASET_DIR / "val" / "images").glob("*")))
        print("=" * 60)
        print("기존 변환 데이터 발견 → 데이터 변환 건너뜀")
        print("=" * 60)
        print(f"  Train: {train_count}개, Val: {val_count}개")
        print(f"  data.yaml: {data_yaml_path}")
    else:
        # 이미지-라벨 쌍 수집
        print("=" * 60)
        print("0단계: 이미지-라벨 쌍 탐색")
        print("=" * 60)

        pairs = find_image_label_pairs()
        print(f"  발견된 이미지-라벨 쌍: {len(pairs)}개")

        if not pairs:
            print("  데이터를 찾을 수 없습니다!")
            sys.exit(1)

        # 데이터셋 준비
        data_yaml_path, stats = prepare_dataset(pairs)

    if mode == "benchmark":
        # 3a. 벤치마크 (1 에포크)
        elapsed = benchmark_epoch(data_yaml_path)
        print()
        print("벤치마크 완료! 전체 학습을 시작하려면:")
        print(f"  python ai-server/train_new_data.py train")

    elif mode == "train":
        # 3b. 전체 학습
        train_full(data_yaml_path)
        deploy_model()

        print()
        print("=" * 60)
        print("모든 작업 완료!")
        print("=" * 60)
        print("  새 모델: ai-server/model/best.pt")
        print("  클래스 수: 68 (유사 클래스 병합: 82 → 68)")
        print("  서버 재시작: python ai-server/app.py")
