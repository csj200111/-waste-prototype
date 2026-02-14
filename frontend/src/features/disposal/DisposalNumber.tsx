import type { DisposalApplication } from '@/types/disposal';

interface DisposalNumberProps {
  application: DisposalApplication;
}

export default function DisposalNumber({ application }: DisposalNumberProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm text-center">
      <p className="text-sm text-gray-500 mb-2">배출 번호</p>
      <div className="inline-block rounded-xl bg-blue-50 px-6 py-4 mb-4">
        <p className="text-2xl font-bold text-blue-700 tracking-wide">
          {application.applicationNumber}
        </p>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        이 번호를 종이에 크게 적어서
        <br />
        폐기물에 붙여주세요!
      </p>

      <div className="mt-5 space-y-2 text-sm text-left">
        <div className="flex justify-between">
          <span className="text-gray-500">배출일</span>
          <span className="font-medium">{application.preferredDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">배출장소</span>
          <span className="font-medium">{application.disposalAddress}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">결제금액</span>
          <span className="font-medium text-blue-600">
            {application.totalFee.toLocaleString('ko-KR')}원
          </span>
        </div>
      </div>
    </div>
  );
}
