import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import RecycleItemCard from '@/features/recycle/RecycleItemCard';
import { useRecycle } from '@/features/recycle/useRecycle';
import { useAuth } from '@/features/auth/AuthContext';

export default function RecyclePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, deleteItem } = useRecycle();

  if (!user) {
    return (
      <div>
        <Header title="재활용 물품 게시판" showBack />
        <div className="p-4 pt-18">
          <div className="py-20 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <p className="text-gray-700 font-medium mb-1">로그인이 필요합니다</p>
            <p className="text-sm text-gray-400 mb-6">
              재활용 물품 게시판은 로그인 후 이용할 수 있습니다
            </p>
            <Button onClick={() => navigate('/login')}>
              로그인하기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="재활용 물품 게시판" showBack />
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
              <RecycleItemCard key={item.id} item={item} onDelete={deleteItem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
