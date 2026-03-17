import { useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { RecycleItem, RecycleStatus } from '@/types/recycle';

interface RecycleItemCardProps {
  item: RecycleItem;
  onDelete?: (id: number) => Promise<void>;
}

const statusConfig: Record<
  RecycleStatus,
  { label: string; variant: 'success' | 'warning' | 'info' }
> = {
  available: { label: '수거 가능', variant: 'success' },
  reserved: { label: '예약됨', variant: 'warning' },
  collected: { label: '수거 완료', variant: 'info' },
};

export default function RecycleItemCard({ item, onDelete }: RecycleItemCardProps) {
  const config = statusConfig[item.status];
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(item.id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Card className="space-y-2">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>

      {item.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {item.photos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`사진 ${i + 1}`}
              className="h-16 w-16 shrink-0 rounded-lg bg-gray-100 object-cover"
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{item.address}</span>
        <span>{item.createdAt.split('T')[0]}</span>
      </div>

      {onDelete && (
        <div className="pt-1">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-500">삭제하시겠습니까?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-white bg-red-500 rounded px-2 py-1 hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? '삭제 중...' : '확인'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-1 hover:bg-gray-200"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-red-400 hover:text-red-600"
            >
              삭제
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
