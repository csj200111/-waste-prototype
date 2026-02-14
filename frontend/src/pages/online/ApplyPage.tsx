import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import ProgressBar from '@/components/layout/ProgressBar';
import DisposalForm from '@/features/disposal/DisposalForm';

const STEPS = ['입력', '검수', '결제', '완료'];

export default function ApplyPage() {
  const navigate = useNavigate();

  return (
    <div>
      <Header title="온라인 배출 신청" showBack />
      <div className="pt-14">
        <ProgressBar steps={STEPS} currentStep={0} />
        <div className="p-4">
          <DisposalForm onNext={() => navigate('/online/review')} />
        </div>
      </div>
    </div>
  );
}
