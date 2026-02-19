import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import PhotoUploader from './PhotoUploader';
import { wasteService } from '@/services/wasteService';
import { regionService } from '@/services/regionService';

interface RecycleRegisterFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    photos: string[];
    sido: string;
    sigungu: string;
    address: string;
  }) => void;
  loading?: boolean;
}

export default function RecycleRegisterForm({ onSubmit, loading }: RecycleRegisterFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [address, setAddress] = useState('');

  // Region
  const [sidoList, setSidoList] = useState<string[]>([]);
  const [sigunguList, setSigunguList] = useState<string[]>([]);
  const [selectedSido, setSelectedSido] = useState('');
  const [selectedSigungu, setSelectedSigungu] = useState('');

  // Categories
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    regionService.getSido().then(setSidoList);
    wasteService.getCategories().then(setCategories);
  }, []);

  const handleSidoChange = (sido: string) => {
    setSelectedSido(sido);
    setSelectedSigungu('');
    if (sido) {
      regionService.getSigungu(sido).then(setSigunguList);
    } else {
      setSigunguList([]);
    }
  };

  const [submitted, setSubmitted] = useState(false);

  const isFormFilled =
    title.trim() && description.trim() && selectedSido && selectedSigungu && address.trim();

  const handleSubmit = () => {
    setSubmitted(true);
    if (!isFormFilled || photos.length === 0) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      photos,
      sido: selectedSido,
      sigungu: selectedSigungu,
      address: address.trim(),
    });
  };

  return (
    <div className="space-y-5">
      <Input
        label="물품명"
        placeholder="예: 2인용 소파, 사무용 책상"
        value={title}
        onChange={setTitle}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">물품 설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="상태, 크기, 특이사항 등을 적어주세요"
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base outline-none transition-colors duration-150 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">사진 첨부</label>
        <PhotoUploader photos={photos} onChange={setPhotos} />
        {submitted && photos.length === 0 && (
          <p className="mt-1.5 text-xs text-red-500">사진을 1장 이상 업로드해주세요</p>
        )}
      </div>

      {categories.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors duration-150 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">지역</label>
        <div className="flex gap-2">
          <select
            className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-sm bg-white"
            value={selectedSido}
            onChange={(e) => handleSidoChange(e.target.value)}
          >
            <option value="">시/도 선택</option>
            {sidoList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-sm bg-white"
            value={selectedSigungu}
            onChange={(e) => setSelectedSigungu(e.target.value)}
            disabled={!selectedSido}
          >
            <option value="">시/군/구 선택</option>
            {sigunguList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {selectedSigungu && (
          <p className="mt-2 text-sm text-blue-600 font-medium">
            ✓ {selectedSido} {selectedSigungu}
          </p>
        )}
      </div>

      <Input
        label="수거 가능 위치"
        placeholder="예: 역삼동 123-45 1층 현관 앞"
        value={address}
        onChange={setAddress}
      />

      <Button fullWidth disabled={!isFormFilled || loading} onClick={handleSubmit}>
        {loading ? '등록 중...' : '등록하기'}
      </Button>
    </div>
  );
}
