import Card from '@/components/ui/Card';
import StatusBadge from './StatusBadge';
import type { DisposalApplication } from '@/types/disposal';

interface ApplicationCardProps {
  application: DisposalApplication;
  onDetail: () => void;
  onCancel?: () => void;
  onReceipt?: () => void;
}

export default function ApplicationCard({
  application,
  onDetail,
  onCancel,
  onReceipt,
}: ApplicationCardProps) {
  const itemsSummary = application.items
    .map((item) => `${item.wasteItemName}${item.quantity > 1 ? ` x${item.quantity}` : ''}`)
    .join(', ');

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between">
        <span className="text-sm font-bold text-gray-900">
          {application.applicationNumber}
        </span>
        <StatusBadge status={application.status} />
      </div>

      <p className="text-sm text-gray-600">{itemsSummary}</p>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>신청일: {application.createdAt.split('T')[0]}</span>
        <span className="font-medium text-blue-600">
          {application.totalFee.toLocaleString('ko-KR')}원
        </span>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onDetail}
          className="text-xs text-blue-600 font-medium hover:underline"
        >
          상세보기
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-red-500 font-medium hover:underline"
          >
            취소하기
          </button>
        )}
        {onReceipt && (
          <button
            type="button"
            onClick={onReceipt}
            className="text-xs text-gray-500 font-medium hover:underline"
          >
            영수증
          </button>
        )}
      </div>
    </Card>
  );
}
