import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n.jsx';
import { Home, Navigation, AlertTriangle, Settings, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, labelKey: 'home' },
  { path: '/navigate', icon: Navigation, labelKey: 'navigate' },
  { path: '/report', icon: AlertTriangle, labelKey: 'report' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/settings', icon: Settings, labelKey: 'settings' },
];

export default function BottomNav() {
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto px-1 py-1.5">
        {navItems.map(({ path, icon: Icon, labelKey, label }) => {
          const isActive = location.pathname === path;
          const displayLabel = label || t(labelKey);
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-[52px] select-none",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                {displayLabel}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}