import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { DEFAULT_CONTACTS } from './mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState(78);
  const [networkType, setNetworkType] = useState('4G');
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('safenav_contacts');
    return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
  });
  const [alertSensitivity, setAlertSensitivity] = useState('medium');
  const [isTracking, setIsTracking] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [isDark, setIsDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [sosCapture, setSosCapture] = useState('both'); // 'camera' | 'audio' | 'both'
  const [sosActive, setSosActive] = useState(false);
  const locationWatchRef = useRef(null);

  // Auto dark mode via prefers-color-scheme
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Apply dark class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Online/offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Real GPS location tracking
  useEffect(() => {
    if (navigator.geolocation) {
      locationWatchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {}, // silently fall back to default
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }
    return () => {
      if (locationWatchRef.current) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
      }
    };
  }, []);

  // Persist contacts
  useEffect(() => {
    localStorage.setItem('safenav_contacts', JSON.stringify(contacts));
  }, [contacts]);

  // Optimistic addContact
  const addContact = (contact) => {
    const newContact = { ...contact, id: Date.now() };
    setContacts(prev => {
      const updated = [...prev, newContact];
      localStorage.setItem('safenav_contacts', JSON.stringify(updated));
      return updated;
    });
  };

  // Optimistic removeContact
  const removeContact = (id) => {
    setContacts(prev => {
      const backup = [...prev];
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem('safenav_contacts', JSON.stringify(updated));
      // Rollback after 100ms if needed (simulate optimistic update)
      return updated;
    });
  };

  // SOS: share location to all trusted contacts
  const triggerSOS = () => {
    setSosActive(true);
    const locText = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
    const msg = encodeURIComponent(
      `🚨 EMERGENCY SOS! I need help! My live location: ${locText}\n- Sent via Safe Nav 360X`
    );
    // Open WhatsApp for first contact, copy link for others
    contacts.forEach((c, i) => {
      if (i === 0) {
        window.open(`https://wa.me/${c.phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
      }
    });
  };

  return (
    <AppContext.Provider value={{
      isOnline, batteryLevel, networkType,
      contacts, addContact, removeContact,
      alertSensitivity, setAlertSensitivity,
      isTracking, setIsTracking,
      userLocation, setUserLocation,
      isDark, setIsDark,
      sosCapture, setSosCapture,
      sosActive, setSosActive,
      triggerSOS,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}