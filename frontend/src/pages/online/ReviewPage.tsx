import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import ProgressBar from '@/components/layout/ProgressBar';
import ReviewSummary from '@/features/disposal/ReviewSummary';
import { useDisposalStore } from '@/stores/useDisposalStore';
import { disposalService } from '@/services/disposalService';
import { useAuth } from '@/features/auth/AuthContext';

const STEPS = ['입력', '검수', '결제', '완료'];

export default function ReviewPage() {
  const navigate = useNavigate();
  const store = useDisposalStore();
  const { user } = useAuth();

  const handleConfirm = async () => {
    if (!store.region) return;

    const app = await disposalService.createApplication(
      {
        sido: store.region.sido,
        sigungu: store.region.sigungu,
        items: store.items,
        disposalAddress: store.disposalAddress,
        preferredDate: store.preferredDate,
      },
      user ? String(user.id) : 'anonymous',
    );

    store.setCompletedApplication(app);
    navigate('/online/payment');
  };

  return (
    <div>
      <Header title="신청 내용 확인" showBack />
      <div className="pt-14">
        <ProgressBar steps={STEPS} currentStep={1} />
        <div className="p-4">
          <ReviewSummary
            onBack={() => navigate('/online/apply')}
            onConfirm={handleConfirm}
          />
        </div>
      </div>
    </div>
  );
}
