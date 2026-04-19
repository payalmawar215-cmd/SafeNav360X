import { useAppContext } from '@/lib/AppContext.jsx';
import { useLanguage } from '@/lib/i18n.jsx';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineBanner() {
  const { isOnline } = useAppContext();
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-caution/10 border-b border-caution/20 px-4 py-2.5 flex items-center gap-2"
        >
          <WifiOff className="w-4 h-4 text-caution shrink-0" />
          <div>
            <p className="text-xs font-semibold text-caution">{t('offlineMode')}</p>
            <p className="text-[10px] text-muted-foreground">{t('offlineDesc')}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}