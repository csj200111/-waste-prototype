import { Outlet } from 'react-router-dom'
import MobileContainer from '@/components/layout/MobileContainer'
import BottomNav from '@/components/layout/BottomNav'
import { AuthProvider } from '@/features/auth/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <MobileContainer>
        <div className="pb-16">
          <Outlet />
        </div>
        <BottomNav />
      </MobileContainer>
    </AuthProvider>
  )
}
