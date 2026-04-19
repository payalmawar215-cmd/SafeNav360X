import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '@/lib/AppContext.jsx';

export default function SOSButton() {
  const navigate = useNavigate();
  const { triggerSOS } = useAppContext();
  const [pressing, setPressing] = useState(false);
  const timerRef = useRef(null);

  const startPress = () => {
    setPressing(true);
    timerRef.current = setTimeout(() => {
      triggerSOS();
      navigate('/sos');
    }, 1500);
  };

  const endPress = () => {
    setPressing(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
      <motion.button
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onTouchStart={startPress}
        onTouchEnd={endPress}
        whileTap={{ scale: 0.9 }}
        className="relative"
      >
        {/* Pulse rings */}
        <div className="absolute inset-0 -m-2">
          <div className="w-full h-full rounded-full bg-danger/20 animate-ping" />
        </div>
        <div className="w-16 h-16 bg-danger rounded-full flex items-center justify-center shadow-lg shadow-danger/30 relative">
          <span className="text-white font-black text-sm tracking-wider">SOS</span>
          {pressing && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-white"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 1.5 }}
            />
          )}
        </div>
      </motion.button>
    </div>
  );
}