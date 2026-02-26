import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'

// 홈
import HomePage from '@/pages/HomePage'

// 온보딩 / 위치
import OnboardingPage from '@/pages/onboarding/OnboardingPage'
import AutoLocationPage from '@/pages/location/AutoLocationPage'
import ManualLocationPage from '@/pages/location/ManualLocationPage'

// 인증
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'

// 수수료 조회
import FeeCheckPage from '@/pages/FeeCheckPage'
import ItemSearchPage from '@/pages/fee-check/ItemSearchPage'
import ItemConfirmPage from '@/pages/fee-check/ItemConfirmPage'
import FeeResultPage from '@/pages/fee-check/FeeResultPage'

// 온라인 신고
import OnlinePage from '@/pages/online/OnlinePage'
import PaymentPage from '@/pages/online/PaymentPage'
import CompletePage from '@/pages/online/CompletePage'

// 무상수거
import FreeCollectionPage from '@/pages/free-collection/FreeCollectionPage'

// 오프라인 안내
import OfflinePage from '@/pages/offline/OfflinePage'
import MapSearchPage from '@/pages/offline/MapSearchPage'

// 무료 나눔
import SharingListPage from '@/pages/sharing/SharingListPage'
import SharingDetailPage from '@/pages/sharing/SharingDetailPage'
import SharingChatPage from '@/pages/sharing/SharingChatPage'
import SharingRegisterPage from '@/pages/sharing/SharingRegisterPage'
import SharingEditPage from '@/pages/sharing/SharingEditPage'

// 마이페이지
import MyPage from '@/pages/mypage/MyPage'
import DisposalListPage from '@/pages/mypage/DisposalListPage'
import DisposalDetailPage from '@/pages/mypage/DisposalDetailPage'
import SharingHistoryPage from '@/pages/mypage/SharingHistoryPage'
import PurchaseHistoryPage from '@/pages/mypage/PurchaseHistoryPage'
import PaymentMethodsPage from '@/pages/mypage/PaymentMethodsPage'
import AddPaymentMethodPage from '@/pages/mypage/AddPaymentMethodPage'
import ScrapsPage from '@/pages/mypage/ScrapsPage'
import SettingsPage from '@/pages/mypage/SettingsPage'
import ProfileEditPage from '@/pages/mypage/ProfileEditPage'

// 알림
import NotificationsPage from '@/pages/notifications/NotificationsPage'

// AI (유지)
import AiPredictPage from '@/pages/AiPredictPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // 홈
      { index: true, element: <HomePage /> },

      // 온보딩 / 위치
      { path: 'onboarding', element: <OnboardingPage /> },
      { path: 'location/auto', element: <AutoLocationPage /> },
      { path: 'location/manual', element: <ManualLocationPage /> },

      // 인증
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },

      // 수수료 조회
      { path: 'fee-check', element: <FeeCheckPage /> },
      { path: 'fee-check/search', element: <ItemSearchPage /> },
      { path: 'fee-check/confirm', element: <ItemConfirmPage /> },
      { path: 'fee-check/result', element: <FeeResultPage /> },

      // 온라인 신고
      { path: 'online', element: <OnlinePage /> },
      { path: 'online/search', element: <ItemSearchPage /> },
      { path: 'online/confirm', element: <ItemConfirmPage /> },
      { path: 'online/payment', element: <PaymentPage /> },
      { path: 'online/complete', element: <CompletePage /> },

      // 무상수거
      { path: 'free-collection', element: <FreeCollectionPage /> },

      // 오프라인 안내
      { path: 'offline', element: <OfflinePage /> },
      { path: 'offline/map', element: <MapSearchPage /> },

      // 무료 나눔
      { path: 'sharing', element: <SharingListPage /> },
      { path: 'sharing/register', element: <SharingRegisterPage /> },
      { path: 'sharing/:id', element: <SharingDetailPage /> },
      { path: 'sharing/:id/chat', element: <SharingChatPage /> },
      { path: 'sharing/:id/edit', element: <SharingEditPage /> },

      // 마이페이지
      { path: 'mypage', element: <MyPage /> },
      { path: 'mypage/disposal', element: <DisposalListPage /> },
      { path: 'mypage/disposal/:id', element: <DisposalDetailPage /> },
      { path: 'mypage/sharing', element: <SharingHistoryPage /> },
      { path: 'mypage/purchases', element: <PurchaseHistoryPage /> },
      { path: 'mypage/payment-methods', element: <PaymentMethodsPage /> },
      { path: 'mypage/payment-methods/add', element: <AddPaymentMethodPage /> },
      { path: 'mypage/scraps', element: <ScrapsPage /> },
      { path: 'mypage/settings', element: <SettingsPage /> },
      { path: 'mypage/settings/profile', element: <ProfileEditPage /> },

      // 알림
      { path: 'notifications', element: <NotificationsPage /> },

      // AI (유지)
      { path: 'ai-predict', element: <AiPredictPage /> },
    ],
  },
])
