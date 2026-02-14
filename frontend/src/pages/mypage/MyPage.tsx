import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import ApplicationList from '@/features/mypage/ApplicationList';
import { useMyApplications } from '@/features/mypage/useMyApplications';

export default function MyPage() {
  const navigate = useNavigate();
  const { applications, cancelApplication } = useMyApplications();

  return (
    <div>
      <Header title="마이페이지" showBack={false} />
      <div className="p-4 pt-18">
        <h2 className="text-sm font-bold text-gray-700 mb-3">신청 내역</h2>
        <ApplicationList
          applications={applications}
          onDetail={(id) => navigate(`/mypage/receipt/${id}`)}
          onCancel={(id) => {
            if (window.confirm('정말 취소하시겠습니까?')) {
              cancelApplication(id);
            }
          }}
          onReceipt={(id) => navigate(`/mypage/receipt/${id}`)}
        />
      </div>
    </div>
  );
}
