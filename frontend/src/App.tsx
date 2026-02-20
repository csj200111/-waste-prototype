import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import MobileContainer from '@/components/layout/MobileContainer'
import BottomNav from '@/components/layout/BottomNav'
import { AuthProvider } from '@/features/auth/AuthContext'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <AuthProvider>
      <MobileContainer>
        <ScrollToTop />
        <div className="pb-16">
          <Outlet />
        </div>
        <BottomNav />
      </MobileContainer>
    </AuthProvider>
  )
}
