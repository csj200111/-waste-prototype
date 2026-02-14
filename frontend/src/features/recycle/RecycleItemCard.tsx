import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { RecycleItem, RecycleStatus } from '@/types/recycle';

interface RecycleItemCardProps {
  item: RecycleItem;
}

const statusConfig: Record<
  RecycleStatus,
  { label: string; variant: 'success' | 'warning' | 'info' }
> = {
  available: { label: '수거 가능', variant: 'success' },
  reserved: { label: '예약됨', variant: 'warning' },
  collected: { label: '수거 완료', variant: 'info' },
};

export default function RecycleItemCard({ item }: RecycleItemCardProps) {
  const config = statusConfig[item.status];

  return (
    <Card className="space-y-2">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>

      {item.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {item.photos.map((_url, i) => (
            <div
              key={i}
              className="h-16 w-16 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400"
            >
              IMG
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{item.address}</span>
        <span>{item.createdAt.split('T')[0]}</span>
      </div>
    </Card>
  );
}
