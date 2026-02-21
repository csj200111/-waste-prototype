"""
YOLOv8 학습 스크립트
- traindata/ 폴더의 이미지 + JSON 어노테이션 → YOLO 형식 변환
- train/val 분할 (80/20)
- YOLOv8n 모델 학습
"""

import json
import os
import shutil
import random
from pathlib import Path
from PIL import Image
from ultralytics import YOLO

# ── 경로 설정 ──
BASE_DIR = Path(__file__).resolve().parent.parent
TRAINDATA_DIR = BASE_DIR / "traindata"
ANNOTATION_FILE = TRAINDATA_DIR / "이미지_대형폐기물.json"
DATASET_DIR = BASE_DIR / "ai-server" / "dataset"
MODEL_OUTPUT_DIR = BASE_DIR / "ai-server" / "model"

# ── 학습 설정 ──
TRAIN_RATIO = 0.8
RANDOM_SEED = 42
EPOCHS = 50
IMG_SIZE = 640
BATCH_SIZE = 16


def load_annotations():
    """JSON 어노테이션 파일 로드"""
    with open(ANNOTATION_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def build_class_list(annotations):
    """파일명에서 클래스 추출 → 정렬된 리스트 반환"""
    classes = set()
    for fname in annotations.keys():
        cls_name = fname.rsplit("_", 1)[0]
        classes.add(cls_name)
    return sorted(classes)


def setup_dataset_dirs():
    """YOLO 데이터셋 디렉토리 구조 생성"""
    for split in ["train", "val"]:
        (DATASET_DIR / split / "images").mkdir(parents=True, exist_ok=True)
        (DATASET_DIR / split / "labels").mkdir(parents=True, exist_ok=True)


def convert_bbox_to_yolo(bbox, img_width, img_height):
    """
    픽셀 좌표 [[x1,y1],[x2,y2]] → YOLO 정규화 좌표 (cx, cy, w, h)
    """
    x1, y1 = bbox[0]
    x2, y2 = bbox[1]

    # 좌표 정리 (min/max)
    x1, x2 = min(x1, x2), max(x1, x2)
    y1, y2 = min(y1, y2), max(y1, y2)

    # 이미지 범위 클램핑
    x1 = max(0, min(x1, img_width))
    x2 = max(0, min(x2, img_width))
    y1 = max(0, min(y1, img_height))
    y2 = max(0, min(y2, img_height))

    # YOLO 정규화 좌표
    cx = ((x1 + x2) / 2) / img_width
    cy = ((y1 + y2) / 2) / img_height
    w = (x2 - x1) / img_width
    h = (y2 - y1) / img_height

    return cx, cy, w, h


def prepare_dataset():
    """데이터셋 준비: 어노테이션 변환 + train/val 분할"""
    print("=" * 50)
    print("1단계: 어노테이션 로드")
    print("=" * 50)

    annotations = load_annotations()
    class_list = build_class_list(annotations)
    class_to_id = {name: idx for idx, name in enumerate(class_list)}

    print(f"  총 어노테이션: {len(annotations)}개")
    print(f"  총 클래스: {len(class_list)}개")

    # 클래스 목록 출력
    for idx, name in enumerate(class_list):
        print(f"    [{idx:2d}] {name}")

    print()
    print("=" * 50)
    print("2단계: 데이터셋 디렉토리 구조 생성")
    print("=" * 50)

    # 기존 데이터셋 폴더 정리
    if DATASET_DIR.exists():
        shutil.rmtree(DATASET_DIR)
    setup_dataset_dirs()
    print(f"  디렉토리 생성 완료: {DATASET_DIR}")

    print()
    print("=" * 50)
    print("3단계: 이미지 + 라벨 변환 및 분할")
    print("=" * 50)

    # 파일명 리스트를 셔플하여 train/val 분할
    filenames = list(annotations.keys())
    random.seed(RANDOM_SEED)
    random.shuffle(filenames)

    split_idx = int(len(filenames) * TRAIN_RATIO)
    train_files = filenames[:split_idx]
    val_files = filenames[split_idx:]

    print(f"  Train: {len(train_files)}개, Val: {len(val_files)}개")

    stats = {"success": 0, "skipped": 0, "errors": []}

    for split_name, file_list in [("train", train_files), ("val", val_files)]:
        for fname in file_list:
            img_path = TRAINDATA_DIR / fname
            if not img_path.exists():
                stats["skipped"] += 1
                stats["errors"].append(f"파일 없음: {fname}")
                continue

            # 클래스 추출
            cls_name = fname.rsplit("_", 1)[0]
            if cls_name not in class_to_id:
                stats["skipped"] += 1
                continue
            cls_id = class_to_id[cls_name]

            # 이미지 크기 읽기
            try:
                with Image.open(img_path) as img:
                    img_width, img_height = img.size
            except Exception as e:
                stats["skipped"] += 1
                stats["errors"].append(f"이미지 읽기 실패: {fname} - {e}")
                continue

            # bbox 변환
            bbox = annotations[fname]
            cx, cy, w, h = convert_bbox_to_yolo(bbox, img_width, img_height)

            # 너비/높이가 0인 경우 스킵
            if w <= 0 or h <= 0:
                stats["skipped"] += 1
                stats["errors"].append(f"유효하지 않은 bbox: {fname}")
                continue

            # 이미지 복사
            dest_img = DATASET_DIR / split_name / "images" / fname
            shutil.copy2(img_path, dest_img)

            # 라벨 파일 작성 (YOLO 형식: class_id cx cy w h)
            label_fname = Path(fname).stem + ".txt"
            dest_label = DATASET_DIR / split_name / "labels" / label_fname
            with open(dest_label, "w") as lf:
                lf.write(f"{cls_id} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}\n")

            stats["success"] += 1

    print(f"  변환 성공: {stats['success']}개")
    print(f"  스킵: {stats['skipped']}개")
    if stats["errors"]:
        print(f"  에러 목록 (최대 10개):")
        for err in stats["errors"][:10]:
            print(f"    - {err}")

    # data.yaml 생성
    print()
    print("=" * 50)
    print("4단계: data.yaml 생성")
    print("=" * 50)

    data_yaml_path = DATASET_DIR / "data.yaml"
    yaml_content = f"path: {DATASET_DIR.as_posix()}\n"
    yaml_content += "train: train/images\n"
    yaml_content += "val: val/images\n"
    yaml_content += f"\nnc: {len(class_list)}\n"
    yaml_content += "names:\n"
    for idx, name in enumerate(class_list):
        yaml_content += f"  {idx}: {name}\n"

    with open(data_yaml_path, "w", encoding="utf-8") as f:
        f.write(yaml_content)

    print(f"  저장 완료: {data_yaml_path}")
    print(f"  클래스 수: {len(class_list)}")

    return data_yaml_path, class_list


def train_model(data_yaml_path):
    """YOLOv8n 모델 학습"""
    print()
    print("=" * 50)
    print("5단계: YOLOv8n 모델 학습 시작")
    print("=" * 50)
    print(f"  Epochs: {EPOCHS}")
    print(f"  Image Size: {IMG_SIZE}")
    print(f"  Batch Size: {BATCH_SIZE}")
    print(f"  Data: {data_yaml_path}")
    print()

    # 기존 best.pt를 기반으로 전이 학습 (있으면), 없으면 pretrained 사용
    existing_model = MODEL_OUTPUT_DIR / "best.pt"
    if existing_model.exists():
        print(f"  기존 모델 기반 전이 학습: {existing_model}")
        model = YOLO(str(existing_model))
    else:
        print("  사전 훈련된 yolov8n.pt 사용")
        model = YOLO("yolov8n.pt")

    # 학습 실행
    results = model.train(
        data=str(data_yaml_path),
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        name="throw_it_train",
        project=str(BASE_DIR / "ai-server" / "runs"),
        exist_ok=True,
        patience=10,       # 10 epoch 동안 개선 없으면 조기 종료
        save=True,
        plots=True,
        verbose=True,
    )

    return results


def deploy_model():
    """학습된 best.pt를 model/ 폴더로 복사"""
    print()
    print("=" * 50)
    print("6단계: 학습된 모델 배포")
    print("=" * 50)

    trained_best = BASE_DIR / "ai-server" / "runs" / "throw_it_train" / "weights" / "best.pt"
    if trained_best.exists():
        # 기존 모델 백업
        dest = MODEL_OUTPUT_DIR / "best.pt"
        backup = MODEL_OUTPUT_DIR / "best_backup.pt"
        if dest.exists():
            shutil.copy2(dest, backup)
            print(f"  기존 모델 백업: {backup}")

        shutil.copy2(trained_best, dest)
        print(f"  새 모델 배포 완료: {dest}")
        print(f"  모델 크기: {dest.stat().st_size / 1024 / 1024:.1f} MB")
    else:
        print(f"  학습된 모델을 찾을 수 없음: {trained_best}")
        # last.pt라도 확인
        trained_last = trained_best.parent / "last.pt"
        if trained_last.exists():
            dest = MODEL_OUTPUT_DIR / "best.pt"
            shutil.copy2(trained_last, dest)
            print(f"  last.pt로 대체 배포: {dest}")


if __name__ == "__main__":
    print()
    print("╔══════════════════════════════════════════════╗")
    print("║   YOLOv8 대형폐기물 인식 모델 학습 스크립트      ║")
    print("╚══════════════════════════════════════════════╝")
    print()

    # 1~4: 데이터 준비
    data_yaml_path, class_list = prepare_dataset()

    # 5: 학습
    train_model(data_yaml_path)

    # 6: 배포
    deploy_model()

    print()
    print("=" * 50)
    print("모든 작업 완료!")
    print("=" * 50)
    print("  새 모델 경로: ai-server/model/best.pt")
    print("  서버 재시작: python ai-server/app.py")
    print()
