import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function OnlinePage() {
  const navigate = useNavigate();

  return (
    <div>
      <Header title="온라인 배출 신청" showBack />
      <div className="p-4 pt-18 space-y-5">
        <Card>
          <div className="text-center py-4">
            <div className="text-4xl mb-3">💻</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              온라인으로 간편하게 신청하세요
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              지역 선택 → 품목 선택 → 결제까지
              <br />
              한 번에 처리할 수 있습니다.
            </p>
          </div>
        </Card>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700">신청 절차</h3>
          {[
            { step: 1, title: '정보 입력', desc: '지역, 품목, 배출 장소 입력' },
            { step: 2, title: '검수 확인', desc: '입력 내용 최종 확인' },
            { step: 3, title: '결제', desc: '카드 또는 계좌이체 결제' },
            { step: 4, title: '배출번호 발급', desc: '번호를 폐기물에 부착' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3 px-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                {item.step}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Button fullWidth size="lg" onClick={() => navigate('/online/apply')}>
          신청 시작하기
        </Button>
      </div>
    </div>
  );
}
