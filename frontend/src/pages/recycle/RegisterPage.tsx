import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import RecycleRegisterForm from '@/features/recycle/RecycleRegisterForm';
import { useRecycle } from '@/features/recycle/useRecycle';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerItem } = useRecycle();

  const handleSubmit = (data: {
    title: string;
    description: string;
    photos: string[];
    categoryId: string;
    regionId: string;
    address: string;
  }) => {
    registerItem(data);
    navigate('/recycle');
  };

  return (
    <div>
      <Header title="역경매 물품 등록" showBack />
      <div className="p-4 pt-18">
        <RecycleRegisterForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
