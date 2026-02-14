interface FeeResultCardProps {
  fee: number;
  itemName: string;
  sizeName: string;
  regionName: string;
}

export default function FeeResultCard({
  fee,
  itemName,
  sizeName,
  regionName,
}: FeeResultCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      {/* 수수료 금액 */}
      <div className="mb-4 text-center">
        <p className="mb-1 text-sm text-gray-500">예상 수수료</p>
        <p className="text-3xl font-bold text-blue-600">
          {fee.toLocaleString('ko-KR')}
          <span className="ml-1 text-lg font-semibold">원</span>
        </p>
      </div>

      {/* 상세 정보 */}
      <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">품목</span>
          <span className="font-medium text-gray-900">{itemName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">규격</span>
          <span className="font-medium text-gray-900">{sizeName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">지역</span>
          <span className="font-medium text-gray-900">{regionName}</span>
        </div>
      </div>
    </div>
  );
}
