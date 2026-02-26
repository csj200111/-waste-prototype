import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import ApplicationList from '@/features/mypage/ApplicationList';
import { useMyApplications } from '@/features/mypage/useMyApplications';
import { useAuth } from '@/features/auth/AuthContext';

export default function MyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { applications, cancelApplication } = useMyApplications();

  if (!user) {
    return (
      <div>
        <Header title="마이페이지" showBack={false} />
        <div className="p-4 pt-18">
          <div className="py-20 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <p className="text-gray-700 font-medium mb-1">로그인이 필요합니다</p>
            <p className="text-sm text-gray-400 mb-6">
              마이페이지는 로그인 후 이용할 수 있습니다
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
      <Header title="마이페이지" showBack={false} />
      <div className="p-4 pt-18">
        <div className="mb-5 rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-900">{user.nickname}</p>
          <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
        </div>
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
