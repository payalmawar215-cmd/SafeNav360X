import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Splash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1300);
    const t3 = setTimeout(() => {
      const lang = localStorage.getItem('safenav_lang');
      navigate(lang ? '/' : '/language');
    }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0f4c81] via-[#1a6eb5] to-[#2dd4bf] flex flex-col items-center justify-center overflow-hidden">
      {/* Animated ring */}
      <motion.div className="absolute w-72 h-72 rounded-full border-2 border-white/10"
        animate={{ scale: 3, opacity: 0 }} transition={{ duration: 2.5, repeat: Infinity }} />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.9, bounce: 0.4 }}
        className="z-10"
      >
        <img
          src="https://media.base44.com/images/public/69e449b5017790d72143e6e1/d2ca05de1_logosafenav.jpeg"
          alt="SafeNav360X"
          className="w-28 h-28 rounded-3xl shadow-2xl border-4 border-white/30 object-cover"
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
        transition={{ duration: 0.5 }} className="text-center mt-6 z-10">
        <h1 className="text-3xl font-black text-white tracking-tight">
          SafeNav<span className="text-[#a3f7ef]">360X</span>
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: phase >= 2 ? 1 : 0 }}
          className="text-white/70 text-sm mt-2 font-medium">
          Smart Safety Navigation
        </motion.p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: phase >= 2 ? 1 : 0 }} className="absolute bottom-14 z-10">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-2 h-2 bg-white/60 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
          ))}
        </div>
      </motion.div>
      <p className="absolute bottom-6 text-white/40 text-xs z-10">Made for India 🇮🇳</p>
    </div>
  );
}