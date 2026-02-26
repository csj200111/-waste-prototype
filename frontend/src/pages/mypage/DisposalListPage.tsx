import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'

const FILTERS = ['전체', '진행중', '완료', '취소']

const MOCK_DISPOSALS = [
  { id: 1, status: '진행중', date: '2023.10.24', name: '의자 (일반/등받이 부착) 외 1건', number: '20231024-1234', fee: '5,000' },
  { id: 2, status: '수거완료', date: '2023.10.18', name: '서랍장 (3단 이하)', number: '20231018-0056', fee: '3,000' },
  { id: 3, status: '수거완료', date: '2023.09.05', name: '전자레인지', number: '20230905-4321', fee: '무상수거' },
]

export default function DisposalListPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('전체')

  return (
    <div>
      <Header title="배출 내역" showBack showNotification />
      <div className="pt-14">
        {/* 필터 탭 */}
        <div className="flex gap-2 px-4 py-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                activeFilter === f ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 목록 */}
        <div className="px-4 space-y-3">
          {MOCK_DISPOSALS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/mypage/disposal/${item.id}`)}
              className="w-full rounded-2xl border border-gray-100 p-4 text-left active:bg-gray-50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  item.status === '진행중' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {item.status}
                </span>
                <span className="text-xs text-gray-400">{item.date}</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-gray-400">{item.number}</p>
                <p className="text-base font-bold text-gray-900">{item.fee}{item.fee !== '무상수거' ? '원' : ''}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
