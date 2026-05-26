# split_damage_dataset.py
# 원본 JSON 라벨의 DAMAGE 필드를 기반으로 손상 분류용 데이터셋 생성
# DAMAGE: "원형" → normal, "일부훼손" → scratch, "완전훼손"/"상당훼손"/"심한훼손" → broken
import os
import json
import shutil
import random
import multiprocessing

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TRAINING_DIR = "C:/생활 폐기물 이미지/Training"
LABEL_DIR = os.path.join(TRAINING_DIR, "Training_라벨링데이터")
OUTPUT_DIR = os.path.join(BASE_DIR, "damage-dataset")
VAL_RATIO = 0.2
SEED = 42
MAX_PER_CLASS = 30000  # normal 비율 확대 (오분류 감소 목적)

# DAMAGE 값 → 카테고리 매핑
DAMAGE_MAP = {
    "원형": "normal",
    "일부훼손": "scratch",
    "상당훼손": "broken",
    "심한훼손": "broken",
    "완전훼손": "broken",
}


def find_image_for_json(json_path):
    """JSON 라벨 파일에 대응하는 이미지 파일 경로를 찾는다"""
    # JSON 경로: Training_라벨링데이터/카테고리/품목/세션/파일.Json
    # 이미지 경로: [T원천]카테고리_품목_품목/세션/파일.jpg
    try:
        with open(json_path, encoding='utf-8') as f:
            data = json.load(f)
        img_name = data.get("FILE NAME", "")
        if not img_name:
            return None, None

        # JSON이 있는 세션 폴더
        session_dir = os.path.basename(os.path.dirname(json_path))

        # 이미지 폴더에서 세션 폴더 찾기
        for entry in os.listdir(TRAINING_DIR):
            if "라벨링" in entry:
                continue
            candidate = os.path.join(TRAINING_DIR, entry, session_dir, img_name)
            if os.path.exists(candidate):
                return candidate, data
    except Exception:
        pass
    return None, None


def main():
    random.seed(SEED)

    categorized = {'normal': [], 'scratch': [], 'broken': []}
    unknown_damage = set()
    no_image = 0
    total_json = 0

    print("원본 JSON 라벨에서 DAMAGE 필드 스캔 중...")
    print(f"라벨 경로: {LABEL_DIR}")

    for root, dirs, files in os.walk(LABEL_DIR):
        for fname in files:
            if not fname.lower().endswith('.json'):
                continue
            total_json += 1

            json_path = os.path.join(root, fname)
            img_path, data = find_image_for_json(json_path)

            if img_path is None:
                no_image += 1
                continue

            # Bounding에서 가장 심각한 DAMAGE 기준으로 분류
            worst_damage = "normal"
            for b in data.get("Bounding", []):
                dmg_raw = b.get("DAMAGE", "")
                dmg_mapped = DAMAGE_MAP.get(dmg_raw)
                if dmg_mapped is None:
                    if dmg_raw:
                        unknown_damage.add(dmg_raw)
                    continue
                # broken > scratch > normal 우선순위
                if dmg_mapped == "broken":
                    worst_damage = "broken"
                    break
                elif dmg_mapped == "scratch" and worst_damage == "normal":
                    worst_damage = "scratch"

            categorized[worst_damage].append(img_path)

            if total_json % 1000 == 0:
                print(f"  {total_json}개 처리됨...")

    # 통계 출력
    print(f"\n========== 데이터셋 통계 ==========")
    print(f"  총 JSON 파일: {total_json}")
    print(f"  이미지 매칭 실패: {no_image}")
    total = 0
    for category, paths in categorized.items():
        count = len(paths)
        total += count
        print(f"  {category}: {count}장")
    print(f"  총합: {total}장")
    print(f"====================================")

    if unknown_damage:
        print(f"\n알 수 없는 DAMAGE 값: {unknown_damage}")

    for category, paths in categorized.items():
        if len(paths) < 20:
            print(f"\n⚠️  WARNING: '{category}' 카테고리가 {len(paths)}장으로 매우 적습니다!")

    # 클래스 균형 맞추기 (다운샘플링)
    for category, paths in categorized.items():
        random.shuffle(paths)
        if len(paths) > MAX_PER_CLASS:
            print(f"\n  {category}: {len(paths)}장 → {MAX_PER_CLASS}장으로 다운샘플링")
            categorized[category] = paths[:MAX_PER_CLASS]

    # train/val 분할 후 복사
    print(f"\n{OUTPUT_DIR}/ 에 데이터셋 생성 중...")

    # 기존 출력 폴더 정리
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)

    for category, paths in categorized.items():
        random.shuffle(paths)
        split = int(len(paths) * (1 - VAL_RATIO))
        splits = {'train': paths[:split], 'val': paths[split:]}

        for split_name, split_paths in splits.items():
            out_dir = os.path.join(OUTPUT_DIR, split_name, category)
            os.makedirs(out_dir, exist_ok=True)
            for p in split_paths:
                shutil.copy2(p, out_dir)

        print(f"  {category}: {len(paths)}장 (train: {split}, val: {len(paths)-split})")

    print(f"\n✅ 완료! {OUTPUT_DIR}/ 에 저장됨")
    print(f"\n다음 단계: python train_damage_cls.py")


if __name__ == '__main__':
    multiprocessing.freeze_support()
    main()
