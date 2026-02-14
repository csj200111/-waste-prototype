import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import { offlineService } from '@/services/offlineService'

export default function TransportPage() {
  const navigate = useNavigate()
  const companies = offlineService.getTransportCompanies()

  return (
    <div>
      <Header title="운반 대행" showBack onBack={() => navigate(-1)} />
      <div className="p-4 pt-18 space-y-4">
        <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-bold mb-1">🚛 운반 대행 안내</p>
          <p className="text-xs">너무 무거운 대형폐기물은 아래 업체에 연락하여 운반을 의뢰할 수 있습니다.</p>
        </div>

        <div className="space-y-3">
          {companies.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{c.description}</div>
                </div>
                <a
                  href={`tel:${c.phone}`}
                  className="flex-shrink-0 bg-primary text-white text-xs px-3 py-2 rounded-lg font-medium"
                >
                  📞 {c.phone}
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
