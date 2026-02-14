import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import HomePage from '@/pages/HomePage';
import FeeCheckPage from '@/pages/FeeCheckPage';
import OfflinePage from '@/pages/offline/OfflinePage';
import StickerShopsPage from '@/pages/offline/StickerShopsPage';
import CentersPage from '@/pages/offline/CentersPage';
import TransportPage from '@/pages/offline/TransportPage';
import OnlinePage from '@/pages/online/OnlinePage';
import ApplyPage from '@/pages/online/ApplyPage';
import ReviewPage from '@/pages/online/ReviewPage';
import PaymentPage from '@/pages/online/PaymentPage';
import CompletePage from '@/pages/online/CompletePage';
import RecyclePage from '@/pages/recycle/RecyclePage';
import RegisterPage from '@/pages/recycle/RegisterPage';
import MyPage from '@/pages/mypage/MyPage';
import ReceiptPage from '@/pages/mypage/ReceiptPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'fee-check', element: <FeeCheckPage /> },
      { path: 'offline', element: <OfflinePage /> },
      { path: 'offline/sticker-shops', element: <StickerShopsPage /> },
      { path: 'offline/centers', element: <CentersPage /> },
      { path: 'offline/transport', element: <TransportPage /> },
      { path: 'online', element: <OnlinePage /> },
      { path: 'online/apply', element: <ApplyPage /> },
      { path: 'online/review', element: <ReviewPage /> },
      { path: 'online/payment', element: <PaymentPage /> },
      { path: 'online/complete', element: <CompletePage /> },
      { path: 'recycle', element: <RecyclePage /> },
      { path: 'recycle/register', element: <RegisterPage /> },
      { path: 'mypage', element: <MyPage /> },
      { path: 'mypage/receipt/:id', element: <ReceiptPage /> },
    ],
  },
]);
