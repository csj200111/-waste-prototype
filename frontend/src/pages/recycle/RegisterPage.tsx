import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import RecycleRegisterForm from '@/features/recycle/RecycleRegisterForm';
import { useRecycle } from '@/features/recycle/useRecycle';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerItem } = useRecycle();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: {
    title: string;
    description: string;
    photos: string[];
    sido: string;
    sigungu: string;
    address: string;
  }) => {
    setError('');
    setLoading(true);
    try {
      await registerItem(data);
      navigate('/recycle');
    } catch (e) {
      setError('등록에 실패했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  return (
    <div>
      <Header title="역경매 물품 등록" showBack />
      <div className="p-4 pt-18">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <RecycleRegisterForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
