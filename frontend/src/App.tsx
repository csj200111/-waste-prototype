import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import MobileContainer from '@/components/layout/MobileContainer'
import BottomNav from '@/components/layout/BottomNav'
import { AuthProvider, useAuth } from '@/features/auth/AuthContext'
import { useLocationStore } from '@/stores/useLocationStore'
import { notificationService } from '@/services/notificationService'
import { useNotificationStore } from '@/stores/useNotificationStore'

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

function NotificationPoller() {
  const { user } = useAuth()
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount)

  useEffect(() => {
    if (!user) return
    const fetchCount = () => {
      notificationService.getUnreadCount(user.id)
        .then((r) => setUnreadCount(r.count))
        .catch(() => {})
    }
    fetchCount()
    const interval = setInterval(fetchCount, 5000)
    return () => clearInterval(interval)
  }, [user, setUnreadCount])

  return null
}

function shouldShowBottomNav(pathname: string): boolean {
  if (NO_BOTTOMNAV_PATHS.some((p) => pathname.startsWith(p))) return false
  if (pathname.endsWith('/chat')) return false
  return true
}

export default function App() {
  const { pathname } = useLocation()
  const showNav = shouldShowBottomNav(pathname)

  return (
    <AuthProvider>
      <MobileContainer>
        <ScrollToTop />
        <NotificationPoller />
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
