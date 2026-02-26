import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import MobileContainer from '@/components/layout/MobileContainer'
import BottomNav from '@/components/layout/BottomNav'
import { AuthProvider } from '@/features/auth/AuthContext'
import { useLocationStore } from '@/stores/useLocationStore'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

const NO_BOTTOMNAV_PATHS = [
  '/onboarding',
  '/location',
  '/login',
  '/signup',
]

const ONBOARDING_SKIP_PATHS = [
  '/onboarding',
  '/location/auto',
  '/location/manual',
  '/login',
  '/signup',
]

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isOnboarded = useLocationStore((s) => s.isOnboarded)

  useEffect(() => {
    if (!isOnboarded && !ONBOARDING_SKIP_PATHS.some((p) => pathname.startsWith(p))) {
      navigate('/onboarding', { replace: true })
    }
  }, [isOnboarded, pathname, navigate])

  return <>{children}</>
}

function shouldShowBottomNav(pathname: string): boolean {
  return !NO_BOTTOMNAV_PATHS.some((p) => pathname.startsWith(p))
}

export default function App() {
  const { pathname } = useLocation()
  const showNav = shouldShowBottomNav(pathname)

  return (
    <AuthProvider>
      <MobileContainer>
        <ScrollToTop />
        <OnboardingGuard>
          <div className={showNav ? 'pb-16' : ''}>
            <Outlet />
          </div>
          {showNav && <BottomNav />}
        </OnboardingGuard>
      </MobileContainer>
    </AuthProvider>
  )
}
