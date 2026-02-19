import ApplicationCard from './ApplicationCard';
import type { DisposalApplication } from '@/types/disposal';

interface ApplicationListProps {
  applications: DisposalApplication[];
  onDetail: (id: string) => void;
  onCancel: (id: string) => void;
  onReceipt: (id: string) => void;
}

export default function ApplicationList({
  applications,
  onDetail,
  onCancel,
  onReceipt,
}: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-400 text-sm">신청 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => {
        const canCancel = app.status === 'pending_payment' || app.status === 'paid';
        const canReceipt = app.status === 'paid' || app.status === 'collected';

        return (
          <ApplicationCard
            key={app.id}
            application={app}
            onDetail={() => onDetail(String(app.id))}
            onCancel={canCancel ? () => onCancel(String(app.id)) : undefined}
            onReceipt={canReceipt ? () => onReceipt(String(app.id)) : undefined}
          />
        );
      })}
    </div>
  );
}
