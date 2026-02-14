import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import PhotoUploader from './PhotoUploader';
import { wasteService } from '@/services/wasteService';
import { regionService } from '@/services/regionService';
import SearchBar from '@/components/ui/SearchBar';
import type { Region } from '@/types/region';

interface RecycleRegisterFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    photos: string[];
    categoryId: string;
    regionId: string;
    address: string;
  }) => void;
}

export default function RecycleRegisterForm({ onSubmit }: RecycleRegisterFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [regionQuery, setRegionQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [regionResults, setRegionResults] = useState<Region[]>([]);
  const [address, setAddress] = useState('');

  const categories = wasteService.getCategories();

  const handleRegionSearch = (query: string) => {
    setRegionQuery(query);
    if (query.length >= 1) {
      setRegionResults(regionService.searchRegion(query).slice(0, 5));
    } else {
      setRegionResults([]);
    }
  };

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region);
    setRegionQuery(regionService.getRegionLabel(region));
    setRegionResults([]);
  };

  const isValid =
    title.trim() &&
    description.trim() &&
    selectedCategoryId &&
    selectedRegion &&
    address.trim();

  const handleSubmit = () => {
    if (!isValid || !selectedRegion) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      photos,
      categoryId: selectedCategoryId,
      regionId: selectedRegion.id,
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
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">카테고리</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors duration-150 ${
                selectedCategoryId === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">지역</label>
        <SearchBar
          value={regionQuery}
          onChange={handleRegionSearch}
          placeholder="주소를 입력하세요"
        />
        {regionResults.length > 0 && !selectedRegion && (
          <div className="mt-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
            {regionResults.map((r) => (
              <button
                key={r.id}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-sm"
                onClick={() => handleRegionSelect(r)}
              >
                {regionService.getRegionLabel(r)}
              </button>
            ))}
          </div>
        )}
        {selectedRegion && (
          <p className="mt-2 text-sm text-blue-600 font-medium">
            ✓ {regionService.getRegionLabel(selectedRegion)}
          </p>
        )}
      </div>

      <Input
        label="수거 가능 위치"
        placeholder="예: 역삼동 123-45 1층 현관 앞"
        value={address}
        onChange={setAddress}
      />

      <Button fullWidth disabled={!isValid} onClick={handleSubmit}>
        등록하기
      </Button>
    </div>
  );
}
