# train_damage_cls.py
# 손상 분류 모델 학습 (YOLOv8-cls: normal/scratch/broken 3클래스)
import os
import sys
import multiprocessing
from ultralytics import YOLO

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "damage-dataset")
OUTPUT_PROJECT = "C:/yolo_training/damage-cls"  # SSD 경로 (학습 속도)


def main():
    # 데이터셋 존재 확인
    if not os.path.exists(os.path.join(DATASET_DIR, "train")):
        print("ERROR: damage-dataset/train 폴더가 없습니다!")
        print("먼저 python split_damage_dataset.py 를 실행하세요.")
        sys.exit(1)

    # 각 카테고리 수량 확인
    for split in ['train', 'val']:
        split_dir = os.path.join(DATASET_DIR, split)
        if not os.path.exists(split_dir):
            continue
        print(f"\n[{split}]")
        for cat in sorted(os.listdir(split_dir)):
            cat_dir = os.path.join(split_dir, cat)
            if os.path.isdir(cat_dir):
                count = len([f for f in os.listdir(cat_dir) if not f.startswith('.')])
                print(f"  {cat}: {count}장")

    # YOLOv8s-cls 사전학습 모델 로드
    model = YOLO('yolov8s-cls.pt')

    # 학습 시작
    print("\n========== 손상 분류 모델 학습 시작 ==========")
    model.train(
        data=DATASET_DIR,
        epochs=30,
        imgsz=640,
        batch=32,
        project=OUTPUT_PROJECT,
        name='train',
        workers=4,
        device=0,        # GPU 0 (RTX 3080)
        patience=10,     # early stopping
        pretrained=True,
    )

    print(f"\n✅ 학습 완료!")
    print(f"모델 위치: {OUTPUT_PROJECT}/train/weights/best.pt")
    print(f"\n배포 명령어:")
    print(f"  copy {OUTPUT_PROJECT}\\train\\weights\\best.pt {os.path.join(BASE_DIR, 'model', 'damage.pt')}")


if __name__ == '__main__':
    multiprocessing.freeze_support()
    main()
