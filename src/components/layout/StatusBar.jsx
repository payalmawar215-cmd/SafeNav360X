import { useAppContext } from '@/lib/AppContext.jsx';
import { useLanguage } from '@/lib/i18n.jsx';
import { Battery, Wifi, WifiOff, Signal } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatusBar() {
  const { isOnline, batteryLevel, networkType } = useAppContext();
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-card/80 backdrop-blur-sm border-b border-border text-xs">
      <div className="flex items-center gap-3">
        {isOnline ? (
          <div className="flex items-center gap-1 text-safe">
            <Signal className="w-3.5 h-3.5" />
            <span className="font-medium">{networkType}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-danger">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="font-medium">Offline</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Battery className={cn(
          "w-4 h-4",
          batteryLevel > 50 ? "text-safe" : batteryLevel > 20 ? "text-caution" : "text-danger"
        )} />
        <span className="font-medium text-muted-foreground">{batteryLevel}%</span>
      </div>
    </div>
  );
}
