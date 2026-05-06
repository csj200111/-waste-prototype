# train_damage_cls.py
# 손상 분류 모델 학습 (YOLOv8-cls: normal/scratch/broken 3클래스)
#
# 모드:
#   benchmark : 1 epoch만 실행하여 VRAM/시간 측정
#   train     : 전체 학습 (EPOCHS 만큼)
#   resume    : 중단된 학습을 이어서 재개 (Ctrl+C / 재부팅 후)
#   extend N  : 완료된 학습에 N epoch 추가 (기본 10)
#
# 사용 예:
#   python ai-server/train_damage_cls.py benchmark
#   python ai-server/train_damage_cls.py train
#   python ai-server/train_damage_cls.py resume
#   python ai-server/train_damage_cls.py extend 10

import os
import sys
import shutil
import multiprocessing
from pathlib import Path
from ultralytics import YOLO

# ── 경로 설정 ──
BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "damage-dataset"
SPLIT_SCRIPT = BASE_DIR / "split_damage_dataset.py"
OUTPUT_PROJECT = Path("C:/yolo_training/damage-cls")  # SSD 경로 (학습 속도)
MODEL_DIR = BASE_DIR / "model"
DEPLOY_PATH = MODEL_DIR / "damage.pt"
DEPLOY_BACKUP = MODEL_DIR / "damage_backup.pt"

# ── 학습 설정 (옵션 B: yolov8m-cls + imgsz=768 + batch=24) ──
# 이전 (s-cls): yolov8s-cls.pt, imgsz=640, batch=32 → top1 acc 0.826
# RTX 3080 10GB 안전 설정:
#   m-cls + imgsz=768 + batch=24 → 예상 VRAM ~6.5~7 GB
#   OOM 발생 시 batch=16으로 강등
MODEL_NAME = "yolov8m-cls.pt"
EPOCHS = 30
IMG_SIZE = 768
BATCH_SIZE = 24

# 학습 결과 폴더 (기존 train1~7 보존)
RUN_NAME_TRAIN = "train_v8m"
RUN_NAME_BENCHMARK = "benchmark_v8m"


def ensure_dataset():
    """데이터셋 폴더 존재 확인. 없으면 split 스크립트 안내 후 종료."""
    train_dir = DATASET_DIR / "train"
    val_dir = DATASET_DIR / "val"

    if train_dir.exists() and val_dir.exists():
        # 카테고리 수량 출력
        for split in ["train", "val"]:
            split_path = DATASET_DIR / split
            print(f"\n[{split}]")
            for cat in sorted(os.listdir(split_path)):
                cat_dir = split_path / cat
                if cat_dir.is_dir():
                    count = len([f for f in os.listdir(cat_dir) if not f.startswith(".")])
                    print(f"  {cat}: {count}장")
        return True

    print("=" * 60)
    print("ERROR: 손상 분류 데이터셋이 없습니다.")
    print("=" * 60)
    print(f"  필요한 위치: {DATASET_DIR}")
    print(f"  존재 여부: train={train_dir.exists()}, val={val_dir.exists()}")
    print()
    print("  데이터셋을 먼저 생성하세요 (D드라이브 원본에서 추출, 약 30~60분):")
    print(f"    python {SPLIT_SCRIPT.relative_to(BASE_DIR.parent)}")
    print()
    print("  생성이 끝나면 다시 실행하세요:")
    print(f"    python ai-server/train_damage_cls.py {sys.argv[1] if len(sys.argv) > 1 else 'train'}")
    return False


def _print_gpu_info():
    """GPU 환경 정보 출력"""
    import torch
    if torch.cuda.is_available():
        print(f"  GPU: {torch.cuda.get_device_name(0)}")
        print(f"  VRAM: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
    else:
        print("  ⚠️ CUDA 미사용 - CPU 모드 (매우 느림)")
    print(f"  Model: {MODEL_NAME}")
    print(f"  Image Size: {IMG_SIZE}")
    print(f"  Batch Size: {BATCH_SIZE}")


def benchmark_one_epoch():
    """1 epoch 벤치마크: VRAM 사용량과 1 epoch 소요 시간 측정"""
    import time
    import torch

    print("\n" + "=" * 60)
    print("벤치마크 (1 epoch)")
    print("=" * 60)
    _print_gpu_info()
    print()

    print(f"  사전 훈련 모델 로드: {MODEL_NAME}")
    model = YOLO(MODEL_NAME)

    torch.cuda.empty_cache()
    start_time = time.time()

    model.train(
        data=str(DATASET_DIR),
        epochs=1,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        project=str(OUTPUT_PROJECT),
        name=RUN_NAME_BENCHMARK,
        exist_ok=True,
        workers=4,
        device=0,
        patience=0,
        save=False,
        plots=False,
        verbose=True,
        amp=True,
        pretrained=True,
    )

    elapsed = time.time() - start_time
    peak_mem = torch.cuda.max_memory_allocated(0) / 1024**3 if torch.cuda.is_available() else 0

    print()
    print("=" * 60)
    print(f"  1 epoch 소요 시간: {elapsed:.1f}초 ({elapsed/60:.1f}분)")
    print(f"  {EPOCHS} epoch 예상 시간: {elapsed * EPOCHS / 60:.1f}분 ({elapsed * EPOCHS / 3600:.1f}시간)")
    print(f"  벤치마크 VRAM 피크: {peak_mem:.2f} GB / 10.0 GB")
    print(f"  (조기 종료 시 patience=10으로 더 빨리 끝날 수 있음)")
    print("=" * 60)

    if peak_mem > 9.0:
        print("\n⚠️  VRAM 피크가 9 GB 초과. validation 단계에서 OOM 위험.")
        print("    BATCH_SIZE=16으로 낮추고 재시도 권장.")
    elif peak_mem > 0:
        print("\n✅ VRAM 안전. 본 학습으로 진행 가능:")
        print("    python ai-server/train_damage_cls.py train")


def train_full():
    """전체 학습 실행 (처음부터). last.pt 저장으로 도중 중단 가능."""
    import torch

    print("\n" + "=" * 60)
    print("전체 학습 시작")
    print("=" * 60)
    _print_gpu_info()
    print(f"  Epochs: {EPOCHS}")
    print(f"  결과 폴더: {OUTPUT_PROJECT / RUN_NAME_TRAIN}")
    print()

    print(f"  사전 훈련 모델 로드: {MODEL_NAME}")
    model = YOLO(MODEL_NAME)

    torch.cuda.empty_cache()

    model.train(
        data=str(DATASET_DIR),
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        project=str(OUTPUT_PROJECT),
        name=RUN_NAME_TRAIN,
        exist_ok=True,
        workers=4,
        device=0,
        patience=10,        # early stopping
        save=True,
        save_period=10,     # 10 epoch마다 체크포인트 (재부팅/크래시 대비)
        plots=True,
        verbose=True,
        amp=True,           # 자동 혼합 정밀도 (VRAM 절약)
        pretrained=True,
    )


def resume_train():
    """중단된 학습을 이어서 재개 (Ctrl+C / 재부팅 후)"""
    import torch

    last_pt = OUTPUT_PROJECT / RUN_NAME_TRAIN / "weights" / "last.pt"

    print("\n" + "=" * 60)
    print("학습 재개 (resume)")
    print("=" * 60)

    if not last_pt.exists():
        print(f"  ❌ last.pt 파일 없음: {last_pt}")
        print(f"  먼저 'python ai-server/train_damage_cls.py train' 으로 학습을 시작하세요.")
        return False

    print(f"  체크포인트: {last_pt}")
    print(f"  결과 폴더: {OUTPUT_PROJECT / RUN_NAME_TRAIN}")
    print()

    model = YOLO(str(last_pt))
    torch.cuda.empty_cache()

    model.train(resume=True)
    return True


def extend_train(additional_epochs=10):
    """완료된 학습에 N epoch 추가 (fine-tuning, 결과는 _ext 폴더에 저장)"""
    import torch

    src_last = OUTPUT_PROJECT / RUN_NAME_TRAIN / "weights" / "last.pt"
    src_best = OUTPUT_PROJECT / RUN_NAME_TRAIN / "weights" / "best.pt"

    print("\n" + "=" * 60)
    print(f"추가 학습 (extend, +{additional_epochs} epoch)")
    print("=" * 60)

    src_pt = src_last if src_last.exists() else src_best
    if not src_pt.exists():
        print(f"  ❌ 기존 학습 결과 없음: {OUTPUT_PROJECT / RUN_NAME_TRAIN}")
        print(f"  먼저 'python ai-server/train_damage_cls.py train' 으로 학습을 완료하세요.")
        return None

    print(f"  시작 가중치: {src_pt.name}")
    print(f"  추가 epoch: {additional_epochs}")
    print(f"  새 결과 폴더: {RUN_NAME_TRAIN}_ext")
    print(f"  주의: lr scheduler는 처음부터 재시작 (warmup → decay)")
    print()

    model = YOLO(str(src_pt))
    torch.cuda.empty_cache()

    model.train(
        data=str(DATASET_DIR),
        epochs=additional_epochs,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        project=str(OUTPUT_PROJECT),
        name=RUN_NAME_TRAIN + "_ext",
        exist_ok=True,
        workers=4,
        device=0,
        patience=10,
        save=True,
        save_period=10,
        plots=True,
        verbose=True,
        amp=True,
        pretrained=False,
    )
    return RUN_NAME_TRAIN + "_ext"


def deploy_model(run_name=None):
    """학습된 best.pt를 ai-server/model/damage.pt로 자동 복사 + 백업"""
    if run_name is None:
        run_name = RUN_NAME_TRAIN

    print("\n" + "=" * 60)
    print(f"모델 배포 (출처: {run_name})")
    print("=" * 60)

    src = OUTPUT_PROJECT / run_name / "weights" / "best.pt"
    if not src.exists():
        src = OUTPUT_PROJECT / run_name / "weights" / "last.pt"

    if not src.exists():
        print(f"  ❌ 학습된 모델을 찾을 수 없음: {OUTPUT_PROJECT / run_name / 'weights'}")
        return False

    # 기존 damage.pt 백업
    if DEPLOY_PATH.exists():
        shutil.copy2(DEPLOY_PATH, DEPLOY_BACKUP)
        print(f"  기존 모델 백업: {DEPLOY_BACKUP}")

    shutil.copy2(src, DEPLOY_PATH)
    size_mb = DEPLOY_PATH.stat().st_size / 1024 / 1024
    print(f"  새 모델 배포: {DEPLOY_PATH}")
    print(f"  모델 크기: {size_mb:.1f} MB")
    print(f"  AI 서버 재시작: python ai-server/app.py")
    return True


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "benchmark"

    print()
    print("╔════════════════════════════════════════════════════╗")
    print("║  손상 분류 모델 학습 (yolov8m-cls)                ║")
    print("╚════════════════════════════════════════════════════╝")
    print(f"  모드: {mode}")

    # extend 모드만 데이터셋 검증을 학습 직전으로 미룸 (data=path만 필요)
    # benchmark/train/resume은 데이터셋 필수
    if mode in ("benchmark", "train", "resume", "extend"):
        if not ensure_dataset():
            sys.exit(1)

    if mode == "benchmark":
        benchmark_one_epoch()

    elif mode == "train":
        train_full()
        deploy_model(RUN_NAME_TRAIN)
        print("\n" + "=" * 60)
        print("✅ 모든 작업 완료!")
        print("=" * 60)

    elif mode == "resume":
        if resume_train():
            deploy_model(RUN_NAME_TRAIN)
            print("\n" + "=" * 60)
            print("✅ 학습 재개 완료!")
            print("=" * 60)

    elif mode == "extend":
        try:
            additional = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        except ValueError:
            print(f"  추가 epoch 인자가 정수가 아님: {sys.argv[2]}")
            sys.exit(1)
        ext_run = extend_train(additional_epochs=additional)
        if ext_run:
            deploy_model(ext_run)
            print("\n" + "=" * 60)
            print(f"✅ 추가 학습 완료 (+{additional} epoch)!")
            print("=" * 60)

    else:
        print(f"\n❌ 알 수 없는 모드: {mode}")
        print("\n사용법:")
        print("  python ai-server/train_damage_cls.py benchmark    # 1 epoch 벤치마크")
        print("  python ai-server/train_damage_cls.py train        # 전체 학습 (30 epoch)")
        print("  python ai-server/train_damage_cls.py resume       # 중단된 학습 재개")
        print("  python ai-server/train_damage_cls.py extend [N]   # 완료 후 N epoch 추가")
        sys.exit(1)


if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()
