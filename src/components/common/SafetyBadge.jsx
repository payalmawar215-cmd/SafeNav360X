import { cn } from '@/lib/utils';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function SafetyBadge({ score, size = 'md' }) {
  const getConfig = () => {
    if (score >= 80) return { color: 'text-safe', bg: 'bg-safe/10', icon: ShieldCheck, label: 'Safe' };
    if (score >= 55) return { color: 'text-caution', bg: 'bg-caution/10', icon: Shield, label: 'Moderate' };
    return { color: 'text-danger', bg: 'bg-danger/10', icon: ShieldAlert, label: 'Risky' };
  };

  const config = getConfig();
  const Icon = config.icon;
  const isSmall = size === 'sm';

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-semibold",
      config.bg, config.color,
      isSmall ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
    )}>
      <Icon className={isSmall ? "w-3 h-3" : "w-4 h-4"} />
      <span>{score}</span>
    </div>
  );
}