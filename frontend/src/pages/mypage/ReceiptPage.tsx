import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import ReceiptView from '@/features/mypage/ReceiptView';
import Button from '@/components/ui/Button';
import { useMyApplications } from '@/features/mypage/useMyApplications';

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getApplication } = useMyApplications();

  const application = id ? getApplication(id) : undefined;

  if (!application) {
    return (
      <div>
        <Header title="영수증" showBack />
        <div className="p-4 pt-18 text-center">
          <p className="text-gray-500 text-sm">신청 내역을 찾을 수 없습니다.</p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => navigate('/mypage')}>
              마이페이지로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="영수증 조회" showBack />
      <div className="p-4 pt-18">
        <ReceiptView application={application} />
        <div className="mt-4">
          <Button variant="secondary" fullWidth onClick={() => navigate('/mypage')}>
            ← 마이페이지로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
