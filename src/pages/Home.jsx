import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n.jsx';
import { useAppContext } from '@/lib/AppContext.jsx';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, AlertTriangle, ChevronRight, Shield, Users, BarChart2, ThumbsUp } from 'lucide-react';
import MapView from '@/components/map/MapView';
import SafetyBadge from '@/components/common/SafetyBadge';
import AppLogo from '@/components/common/AppLogo';
import { calculateSafetyScore } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const TYPE_ICONS = { harassment: '🚫', unsafe_street: '🛣️', suspicious: '👁️', poor_lighting: '💡', other: '📋' };

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { userLocation } = useAppContext();
  const currentHour = new Date().getHours();
  const isNight = currentHour >= 19 || currentHour < 6;
  const areaSafetyScore = calculateSafetyScore(isNight ? 'night' : 'day', 72, 65, 58);

  const { data: reports = [] } = useQuery({
    queryKey: ['home-reports'],
    queryFn: () => base44.entities.IncidentReport.list('-created_date', 5),
    refetchInterval: 20000,
  });

  return (
    <div className="flex flex-col">
      {/* Header with logo */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <AppLogo size="md" />
          <SafetyBadge score={areaSafetyScore} />
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
          <MapPin className="w-3 h-3" />
          {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
        </p>
      </div>

      {/* Search bar */}
      <div className="px-4 mb-3">
        <button onClick={() => navigate('/navigate')}
          className="w-full flex items-center gap-3 bg-card rounded-2xl px-4 py-3.5 border border-border shadow-sm hover:shadow-md transition-shadow text-left">
          <Search className="w-5 h-5 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">{t('searchPlaces')}</span>
        </button>
      </div>

      {/* Map */}
      <div className="px-4 mb-4">
        <MapView height="220px" />
      </div>

      {/* Night warning */}
      {isNight && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="mx-4 mb-4 bg-danger/5 border border-danger/20 rounded-2xl p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-danger">{t('nightWarning')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Stay on well-lit roads. Share location with trusted contacts.</p>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          <QuickAction icon={<Shield className="w-5 h-5" />} label={t('liveTracking')} color="bg-primary/10 text-primary" onClick={() => navigate('/navigate')} />
          <QuickAction icon={<AlertTriangle className="w-5 h-5" />} label={t('reportIncident')} color="bg-caution/10 text-caution" onClick={() => navigate('/report')} />
          <QuickAction icon={<Users className="w-5 h-5" />} label={t('trustedContacts')} color="bg-safe/10 text-safe" onClick={() => navigate('/settings')} />
        </div>
      </div>

      {/* Recent Reports from backend */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">{t('recentReports')} {t('nearYou')}</h2>
          <button onClick={() => navigate('/report')} className="text-xs text-primary font-medium flex items-center gap-0.5">
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {reports.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4 bg-card rounded-xl border border-border">No community reports yet.</p>
        ) : (
          <div className="space-y-2">
            {reports.map(report => (
              <div key={report.id} className="bg-card rounded-xl border border-border p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-caution/10 flex items-center justify-center text-base shrink-0">
                  {TYPE_ICONS[report.type] || '📋'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{report.description || report.type?.replace('_', ' ')}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> {timeAgo(report.created_date)}
                    </span>
                    {report.trust_score && (
                      <span className={cn("text-[10px] font-medium",
                        report.trust_score >= 80 ? "text-safe" : report.trust_score >= 60 ? "text-caution" : "text-danger")}>
                        Trust: {report.trust_score}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency numbers */}
      <div className="px-4 mb-6">
        <div className="bg-danger/5 rounded-2xl p-4 border border-danger/10">
          <p className="text-xs font-semibold text-danger mb-2">Emergency Numbers</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[{ num: '112', label: 'Emergency' }, { num: '181', label: 'Women' }, { num: '100', label: 'Police' }].map(e => (
              <a key={e.num} href={`tel:${e.num}`} className="bg-white dark:bg-card rounded-xl py-2 border border-danger/10">
                <p className="text-sm font-bold text-danger">{e.num}</p>
                <p className="text-[10px] text-muted-foreground">{e.label}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, color, onClick }) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${color} transition-all`}>
      {icon}
      <span className="text-[11px] font-semibold leading-tight text-center">{label}</span>
    </motion.button>
  );
}