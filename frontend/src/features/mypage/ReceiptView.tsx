import type { DisposalApplication } from '@/types/disposal';

interface ReceiptViewProps {
  application: DisposalApplication;
}

export default function ReceiptView({ application }: ReceiptViewProps) {
  const paymentLabel =
    application.paymentMethod === 'card'
      ? '카드 결제'
      : application.paymentMethod === 'transfer'
        ? '계좌 이체'
        : '-';

  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="bg-blue-600 p-5 text-center text-white">
        <p className="text-sm opacity-80">전자 영수증</p>
        <p className="text-lg font-bold mt-1">{application.applicationNumber}</p>
      </div>

      {/* 상세 */}
      <div className="p-5 space-y-4">
        {/* 품목 */}
        <section>
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">배출 품목</h4>
          {application.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5">
              <span className="text-gray-700">
                {item.wasteItemName} ({item.sizeLabel}) x{item.quantity}
              </span>
              <span className="font-medium">
                {(item.fee * item.quantity).toLocaleString('ko-KR')}원
              </span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2 mt-2">
            <span>합계</span>
            <span className="text-blue-600">
              {application.totalFee.toLocaleString('ko-KR')}원
            </span>
          </div>
        </section>

        {/* 정보 */}
        <section className="space-y-2 border-t border-gray-100 pt-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">배출 정보</h4>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">배출 장소</span>
            <span className="font-medium text-right max-w-[60%]">
              {application.disposalAddress}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">희망 배출일</span>
            <span className="font-medium">{application.preferredDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">결제 방법</span>
            <span className="font-medium">{paymentLabel}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">신청일</span>
            <span className="font-medium">{application.createdAt.split('T')[0]}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
