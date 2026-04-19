import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import StatusBar from './StatusBar';
import SOSButton from '@/components/sos/SOSButton';
import OfflineBanner from '@/components/common/OfflineBanner';

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto relative bg-background">
      <StatusBar />
      <OfflineBanner />
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>
      <SOSButton />
      <BottomNav />
    </div>
  );
}