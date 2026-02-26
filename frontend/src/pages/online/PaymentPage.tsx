import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import ProgressBar from '@/components/layout/ProgressBar';
import PaymentForm from '@/features/disposal/PaymentForm';
import { useDisposalStore } from '@/stores/useDisposalStore';
import { disposalService } from '@/services/disposalService';
import type { PaymentMethod } from '@/types/disposal';

const STEPS = ['입력', '검수', '결제', '완료'];

export default function PaymentPage() {
  const navigate = useNavigate();
  const store = useDisposalStore();

  const handlePay = async (method: PaymentMethod) => {
    const app = store.completedApplication;
    if (!app) return;

    const updated = await disposalService.processPayment(app.id, method);
    store.setCompletedApplication(updated);
    navigate('/online/complete');
  };

  return (
    <div>
      <Header title="결제" showBack />
      <div className="pt-14">
        <ProgressBar steps={STEPS} currentStep={2} />
        <div className="p-4">
          <PaymentForm onPay={handlePay} />
        </div>
      </div>
    </div>
  );
}
