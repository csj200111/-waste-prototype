import Badge from '@/components/ui/Badge';
import type { DisposalStatus } from '@/types/disposal';

interface StatusBadgeProps {
  status: DisposalStatus;
}

const statusConfig: Record<
  DisposalStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }
> = {
  draft: { label: '작성중', variant: 'default' },
  pending_payment: { label: '결제대기', variant: 'warning' },
  paid: { label: '결제완료', variant: 'success' },
  scheduled: { label: '수거예정', variant: 'info' },
  collected: { label: '수거완료', variant: 'success' },
  cancelled: { label: '취소됨', variant: 'danger' },
  refunded: { label: '환불됨', variant: 'warning' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
