import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n.jsx';
import { useAppContext } from '@/lib/AppContext.jsx';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, MapPin, CheckCircle2, Share2, Camera, Mic, X, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SOS() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { contacts, userLocation, sosCapture, setSosActive } = useAppContext();
  const [phase, setPhase] = useState('sending');
  const [notified, setNotified] = useState([]);
  const [sosEventId, setSosEventId] = useState(null);
  const locationUrl = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
  const whatsappMsg = encodeURIComponent(
    `🚨 EMERGENCY SOS!\nI need immediate help!\n📍 Live Location: ${locationUrl}\n⏰ ${new Date().toLocaleTimeString()}\n— Sent via SafeNav360X`
  );

  useEffect(() => {
    setSosActive(true);

    // Save SOS event to backend
    base44.entities.SOSEvent.create({
      lat: userLocation.lat,
      lng: userLocation.lng,
      status: 'active',
      contacts_notified: contacts.map(c => c.phone),
    }).then(ev => setSosEventId(ev.id)).catch(() => {});

    const timer = setTimeout(() => {
      setPhase('sent');
      setNotified(contacts.map(c => c.id));
    }, 2000);

    // Auto-WhatsApp first contact
    const waTimer = setTimeout(() => {
      if (contacts[0]) {
        const ph = contacts[0].phone.replace(/\D/g, '');
        if (ph) window.open(`https://wa.me/${ph}?text=${whatsappMsg}`, '_blank');
      }
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(waTimer);
    };
  }, []);

  const handleResolve = async () => {
    if (sosEventId) {
      await base44.entities.SOSEvent.update(sosEventId, { status: 'resolved', resolved_at: new Date().toISOString() });
    }
    setSosActive(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Red header */}
      <div className="bg-danger px-4 pt-12 pb-6 flex flex-col items-center relative">
        <AnimatePresence mode="wait">
          {phase === 'sending' ? (
            <motion.div key="sending" className="flex flex-col items-center">
              <motion.div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center"
                animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                <motion.div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center"
                  animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}>
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                    <span className="text-danger font-black text-xl">SOS</span>
                  </div>
                </motion.div>
              </motion.div>
              <p className="text-white font-bold text-xl mt-4">{t('sendingAlert')}</p>
              <p className="text-white/70 text-sm mt-1">Sharing location with trusted contacts...</p>
            </motion.div>
          ) : (
            <motion.div key="sent" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mt-3">{t('alertSent')}</h2>
              <p className="text-white/80 text-sm mt-1 max-w-xs">{t('alertSentDesc')}</p>
              <div className="flex items-center gap-1.5 mt-3 text-xs text-white/70 bg-white/10 rounded-full px-3 py-1.5">
                <MapPin className="w-3 h-3" /> {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Capture mode badge */}
      <div className="mx-4 -mt-4 bg-card rounded-2xl border border-border shadow-lg p-3 flex items-center gap-2">
        {(sosCapture === 'camera' || sosCapture === 'both') && (
          <div className="flex items-center gap-1 text-xs bg-danger/10 text-danger px-2.5 py-1 rounded-full font-medium">
            <Camera className="w-3 h-3" /> Recording
          </div>
        )}
        {(sosCapture === 'audio' || sosCapture === 'both') && (
          <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
            <Mic className="w-3 h-3" /> Audio
          </div>
        )}
        <p className="text-xs text-muted-foreground ml-auto">Evidence active</p>
      </div>

      <div className="px-4 pt-4 pb-8 space-y-3 flex-1">
        <a href="tel:112" className="block">
          <Button className="w-full h-14 rounded-2xl bg-danger hover:bg-danger/90 text-base font-bold gap-3">
            <Phone className="w-5 h-5" /> {t('call112')}
          </Button>
        </a>
        <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="outline" className="w-full h-14 rounded-2xl text-safe border-safe/30 hover:bg-safe/5 font-semibold gap-3">
            <MessageCircle className="w-5 h-5" /> {t('shareWhatsApp')}
          </Button>
        </a>
        <Button variant="outline" className="w-full h-11 rounded-2xl text-sm gap-2"
          onClick={() => navigator.share ? navigator.share({ title: 'SOS Location', url: locationUrl }) : navigator.clipboard.writeText(locationUrl)}>
          <Share2 className="w-4 h-4" /> {t('shareLiveLocation')}
        </Button>

        {/* Contacts notified list */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3">📲 Contacts Notified</p>
          <div className="space-y-2">
            {contacts.map(contact => (
              <div key={contact.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {contact.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.phone}</p>
                  </div>
                </div>
                {notified.includes(contact.id)
                  ? <CheckCircle2 className="w-4 h-4 text-safe" />
                  : <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                }
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full border-safe/30 text-safe hover:bg-safe/5" onClick={handleResolve}>
          <CheckCircle2 className="w-4 h-4 mr-2" /> I'm Safe — Cancel SOS
        </Button>
      </div>
    </div>
  );
}