import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import RecycleItemCard from '@/features/recycle/RecycleItemCard';
import { useRecycle } from '@/features/recycle/useRecycle';

export default function RecyclePage() {
  const navigate = useNavigate();
  const { items } = useRecycle();

  return (
    <div>
      <Header title="재활용 역경매" showBack />
      <div className="p-4 pt-18 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {items.length > 0
              ? `등록된 물품 ${items.length}건`
              : '아직 등록된 물품이 없습니다.'}
          </p>
          <Button size="sm" onClick={() => navigate('/recycle/register')}>
            + 물품 등록
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">♻️</div>
            <p className="text-gray-500 text-sm mb-1">
              아직 등록된 물품이 없습니다.
            </p>
            <p className="text-gray-400 text-xs">
              쓸만한 물건을 등록하면 필요한 사람이 가져갈 수 있어요.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <RecycleItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
