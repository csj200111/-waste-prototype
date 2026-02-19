import { useRef } from 'react';

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
}

export default function PhotoUploader({
  photos,
  onChange,
  max = 5,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (photos.length >= max) return;
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = max - photos.length;
    const selected = Array.from(files).slice(0, remaining);

    selected.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) return; // 5MB limit
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onChange([...photos, dataUrl]);
      };
      reader.readAsDataURL(file);
    });

    // Reset so the same file can be selected again
    e.target.value = '';
  };

  const handleRemove = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex gap-2 flex-wrap">
        {photos.map((photo, i) => (
          <div
            key={i}
            className="relative h-20 w-20 rounded-lg bg-gray-100 overflow-hidden"
          >
            <img
              src={photo}
              alt={`사진 ${i + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs"
            >
              ×
            </button>
          </div>
        ))}

        {photos.length < max && (
          <button
            type="button"
            onClick={handleAdd}
            className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors duration-150"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
      <p className="mt-1.5 text-xs text-gray-400">
        {photos.length}/{max}장 (5MB 이하, 이미지 파일만)
      </p>
    </div>
  );
}
