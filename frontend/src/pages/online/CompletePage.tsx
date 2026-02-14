import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import ProgressBar from '@/components/layout/ProgressBar';
import DisposalNumber from '@/features/disposal/DisposalNumber';
import Button from '@/components/ui/Button';
import { useDisposalStore } from '@/stores/useDisposalStore';

const STEPS = ['입력', '검수', '결제', '완료'];

export default function CompletePage() {
  const navigate = useNavigate();
  const store = useDisposalStore();

  const handleGoHome = () => {
    store.reset();
    navigate('/');
  };

  const handleReceipt = () => {
    if (store.completedApplication) {
      navigate(`/mypage/receipt/${store.completedApplication.id}`);
    }
  };

  if (!store.completedApplication) {
    return (
      <div>
        <Header title="배출 신청 완료" showBack={false} />
        <div className="p-4 pt-18 text-center">
          <p className="text-gray-500">신청 정보를 찾을 수 없습니다.</p>
          <div className="mt-4">
            <Button onClick={handleGoHome}>홈으로 돌아가기</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="배출 신청 완료 ✅" showBack={false} />
      <div className="pt-14">
        <ProgressBar steps={STEPS} currentStep={3} />
        <div className="p-4 space-y-4">
          <DisposalNumber application={store.completedApplication} />

          <div className="space-y-2">
            <Button variant="secondary" fullWidth onClick={handleReceipt}>
              영수증 보기
            </Button>
            <Button fullWidth onClick={handleGoHome}>
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
