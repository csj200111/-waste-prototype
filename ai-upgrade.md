  ---
  손상 분류 모델 분리 학습 가이드                                                                                       
                                                                                                                        
  현재 문제                                                                                                             
                                                                                                                        
  - YOLO 모델 하나가 물품 종류(의자, TV 등) + 손상(broken, scratch)을 동시에 탐지                                       
  - 손상 탐지 정확도가 낮음                                                                                             
                                                                                                                        
  목표            
                                                                                                                        
  - 모델 A (기존): 물품 종류만 탐지 (YOLO detection)                                                                    
  - 모델 B (새로 학습): 손상도만 분류 (YOLOv8-cls classification)
                                                                                                                        
  ---                                                                                                                   
  1단계: 기존 데이터에서 손상 분류용 데이터셋 만들기                                                                    
                                                                                                                        
  기존 YOLO 학습 데이터에서 broken, scratch 라벨이 붙은 이미지를 분류용 폴더 구조로 재구성합니다.
                                                                                                                        
  damage-dataset/ 
  ├── train/                                                                                                            
  │   ├── normal/       ← broken/scratch 라벨이 없는 이미지
  │   ├── scratch/      ← scratch 라벨이 있는 이미지                                                                    
  │   └── broken/       ← broken 라벨이 있는 이미지
  └── val/                                                                                                              
      ├── normal/ 
      ├── scratch/                                                                                                      
      └── broken/ 

  아래 스크립트로 자동 분류할 수 있습니다:                                                                              
   
  # split_damage_dataset.py                                                                                             
  import os       
  import shutil                                                                                                         
  import random
                                                                                                                        
  # ===== 여기만 수정 =====                                                                                             
  YOLO_IMAGES_DIR = "기존데이터셋/images/train"   # 기존 학습 이미지 폴더
  YOLO_LABELS_DIR = "기존데이터셋/labels/train"   # 기존 라벨 폴더                                                      
  DATA_YAML_PATH  = "기존데이터셋/data.yaml"       # data.yaml 경로                                                     
  OUTPUT_DIR      = "damage-dataset"                                                                                    
  VAL_RATIO       = 0.2                                                                                                 
  # ======================                                                                                              
                  
  # data.yaml에서 클래스 이름 읽기                                                                                      
  import yaml     
  with open(DATA_YAML_PATH) as f:                                                                                       
      data = yaml.safe_load(f)
  class_names = data['names']  # {0: 'broken', 1: 'chair', ...} 또는 리스트
                                                                                                                        
  if isinstance(class_names, list):                                                                                     
      class_names = {i: name for i, name in enumerate(class_names)}                                                     
                                                                                                                        
  # broken/scratch 클래스 ID 찾기                                                                                       
  damage_classes = {}
  for cls_id, name in class_names.items():                                                                              
      if name.lower() in ('broken', 'scratch'):
          damage_classes[cls_id] = name.lower()                                                                         
        
  print(f"손상 클래스: {damage_classes}")                                                                               
                                                                                                                        
  # 이미지 분류                                                                                                         
  categorized = {'normal': [], 'scratch': [], 'broken': []}
                                                                                                                        
  for label_file in os.listdir(YOLO_LABELS_DIR):
      if not label_file.endswith('.txt'):                                                                               
          continue                                                                                                      
        
      img_name = os.path.splitext(label_file)[0]                                                                        
      img_path = None
      for ext in ['.jpg', '.jpeg', '.png', '.bmp']:                                                                     
          candidate = os.path.join(YOLO_IMAGES_DIR, img_name + ext)
          if os.path.exists(candidate):                                                                                 
              img_path = candidate
              break                                                                                                     

      if not img_path:
          continue

      with open(os.path.join(YOLO_LABELS_DIR, label_file)) as f:                                                        
          lines = f.readlines()
                                                                                                                        
      found_damage = None
      for line in lines:
          cls_id = int(line.strip().split()[0])
          if cls_id in damage_classes:                                                                                  
              found_damage = damage_classes[cls_id]
              if found_damage == 'broken':                                                                              
                  break  # broken 우선                                                                                  
       
      category = found_damage if found_damage else 'normal'                                                             
      categorized[category].append(img_path)
                                                                                                                        
  # train/val 분할 후 복사
  for category, paths in categorized.items():                                                                           
      random.shuffle(paths)                                                                                             
      split = int(len(paths) * (1 - VAL_RATIO))
      splits = {'train': paths[:split], 'val': paths[split:]}                                                           
                                                                                                                        
      for split_name, split_paths in splits.items():
          out_dir = os.path.join(OUTPUT_DIR, split_name, category)                                                      
          os.makedirs(out_dir, exist_ok=True)                                                                           
          for p in split_paths:
              shutil.copy2(p, out_dir)                                                                                  
                                                                                                                        
      print(f"{category}: {len(paths)}장 (train: {split}, val: {len(paths)-split})")                                    
                                                                                                                        
  print(f"\n완료! {OUTPUT_DIR}/ 에 저장됨")                                                                             
                  
  ---                                                                                                                   
  2단계: 손상 분류 모델 학습
                                                                                                                        
  # train_damage_cls.py
  from ultralytics import YOLO                                                                                          
                  
  model = YOLO('yolov8s-cls.pt')  # classification 사전학습 모델                                                        
   
  model.train(                                                                                                          
      data='damage-dataset',  # 1단계에서 만든 폴더
      epochs=50,
      imgsz=224,                                                                                                        
      batch=32,
      project='damage-cls',                                                                                             
      name='train',
  )

  학습 완료 후 damage-cls/train/weights/best.pt가 생성됩니다.                                                           
   
  ---                                                                                                                   
  3단계: 기존 YOLO 모델 재학습 (broken/scratch 제거)
                                                                                                                        
  기존 data.yaml에서 broken, scratch 클래스를 제거하고 물품만 남겨서 재학습합니다.
                                                                                                                        
  # retrain_detection.py
  from ultralytics import YOLO                                                                                          
                                                                                                                        
  model = YOLO('yolov8n.pt')  # 또는 yolov8s.pt (정확도 더 높음)                                                        
                                                                                                                        
  model.train(                                                                                                          
      data='수정된_data.yaml',  # broken/scratch 제거한 버전
      epochs=100,                                                                                                       
      imgsz=640,
      batch=16,                                                                                                         
      project='waste-detect',
      name='train',
  )                                                                                                                     
   
  ---                                                                                                                   
  4단계: 완성된 모델 2개를 이 프로젝트에 적용
                                                                                                                        
  학습이 끝나면 아래 2개 파일을 이 프로젝트의 ai-server/model/에 복사:
  - waste-detect/train/weights/best.pt → ai-server/model/detect.pt (물품 탐지)                                          
  - damage-cls/train/weights/best.pt → ai-server/model/damage.pt (손상 분류)   