import { Outlet } from 'react-router-dom'
import MobileContainer from '@/components/layout/MobileContainer'
import BottomNav from '@/components/layout/BottomNav'

export default function App() {
  return (
    <MobileContainer>
      <div className="pb-16">
        <Outlet />
      </div>
      <BottomNav />
    </MobileContainer>
  )
}
