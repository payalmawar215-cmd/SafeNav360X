import { useState } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/lib/i18n.jsx';
import { useAppContext } from '@/lib/AppContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Shield, Phone, Users, Moon, Bell, ChevronRight,
  Plus, Trash2, Camera, Mic, AlertOctagon, PhoneCall
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import FakeCallModal from '@/components/settings/FakeCallModal';

export default function Settings() {
  const { t, lang, setLanguage } = useLanguage();
  const {
    contacts, addContact, removeContact,
    alertSensitivity, setAlertSensitivity,
    isDark, setIsDark,
    sosCapture, setSosCapture,
  } = useAppContext();

  const [showAddContact, setShowAddContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [showFakeCall, setShowFakeCall] = useState(false);

  const handleAddContact = () => {
    if (newName && newPhone) {
      addContact({ name: newName, phone: newPhone, relation: 'Other' });
      setNewName('');
      setNewPhone('');
      setShowAddContact(false);
    }
  };

  return (
    <div className="flex flex-col px-4 pt-4 pb-8">
      <div className="flex items-center gap-3 mb-4">
        <img src="https://media.base44.com/images/public/69e449b5017790d72143e6e1/d2ca05de1_logosafenav.jpeg"
          alt="Logo" className="w-8 h-8 rounded-xl object-cover" />
        <h2 className="text-lg font-bold text-foreground">{t('settings')}</h2>
      </div>

      {/* Language */}
      <SettingsSection title={t('language')} icon={<Globe className="w-4 h-4" />}>
        <div className="grid grid-cols-2 gap-2">
          {SUPPORTED_LANGUAGES.map(l => (
            <button key={l.code} onClick={() => setLanguage(l.code)}
              className={cn("flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border-2",
                lang === l.code ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground")}>
              <span>{l.flag}</span>
              <span className="text-xs truncate">{l.native}</span>
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* Alert Sensitivity */}
      <SettingsSection title={t('sensitivity')} icon={<Bell className="w-4 h-4" />}>
        <div className="flex gap-2">
          {['low', 'medium', 'high'].map(level => (
            <button
              key={level}
              onClick={() => setAlertSensitivity(level)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border-2",
                alertSensitivity === level
                  ? level === 'low' ? "border-safe bg-safe/5 text-safe"
                    : level === 'medium' ? "border-caution bg-caution/5 text-caution"
                    : "border-danger bg-danger/5 text-danger"
                  : "border-border bg-card text-muted-foreground"
              )}
            >
              {t(level)}
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* Trusted Contacts */}
      <SettingsSection title={t('trustedContacts')} icon={<Users className="w-4 h-4" />}>
        <div className="space-y-2">
          {contacts.map(contact => (
            <div key={contact.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {contact.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.phone}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeContact(contact.id)} className="h-8 w-8">
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </div>
          ))}

          <AnimatePresence>
            {showAddContact && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-card border border-border rounded-xl p-3 space-y-2">
                  <Input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder={t('name')}
                    className="rounded-lg h-10"
                  />
                  <Input
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder={t('phone')}
                    className="rounded-lg h-10"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 rounded-lg" onClick={handleAddContact}>
                      {t('save')}
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setShowAddContact(false)}>
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl gap-1.5"
            onClick={() => setShowAddContact(true)}
          >
            <Plus className="w-3.5 h-3.5" /> {t('addContact')}
          </Button>
        </div>
      </SettingsSection>

      {/* Dark Mode */}
      <SettingsSection title={t('darkMode')} icon={<Moon className="w-4 h-4" />}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t('darkMode')}</span>
          <Switch checked={isDark} onCheckedChange={setIsDark} />
        </div>
      </SettingsSection>

      {/* Safety Tools */}
      <SettingsSection title="Safety Tools" icon={<Shield className="w-4 h-4" />}>
        <button
          onClick={() => setShowFakeCall(true)}
          className="w-full flex items-center justify-between bg-muted/30 rounded-xl px-3 py-3"
        >
          <div className="flex items-center gap-2.5">
            <PhoneCall className="w-4 h-4 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium">{t('fakeCall')}</p>
              <p className="text-xs text-muted-foreground">{t('fakeCallDesc')}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </SettingsSection>

      {/* Emergency numbers */}
      <SettingsSection title="Emergency Numbers" icon={<Phone className="w-4 h-4" />}>
        <div className="space-y-2 text-sm">
          <EmergencyRow number="112" label="India Emergency" />
          <EmergencyRow number="181" label={t('helpLine').replace('Women Helpline: 181', 'Women Helpline')} />
          <EmergencyRow number="100" label="Police" />
          <EmergencyRow number="102" label="Ambulance" />
        </div>
      </SettingsSection>

      {/* SOS Capture Preferences */}
      <SettingsSection title="SOS Capture Mode" icon={<Camera className="w-4 h-4" />}>
        <div className="flex gap-2">
          {[
            { key: 'camera', icon: <Camera className="w-3.5 h-3.5 mr-1" />, label: 'Camera' },
            { key: 'audio', icon: <Mic className="w-3.5 h-3.5 mr-1" />, label: 'Audio' },
            { key: 'both', icon: null, label: 'Both' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setSosCapture(opt.key)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 flex items-center justify-center",
                sosCapture === opt.key ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground"
              )}
            >
              {opt.icon}{opt.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Evidence will be captured automatically when SOS is triggered.</p>
      </SettingsSection>

      {/* Delete Account */}
      <SettingsSection title="Account" icon={<AlertOctagon className="w-4 h-4" />}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full flex items-center justify-between bg-danger/5 border border-danger/20 rounded-xl px-3 py-3">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-danger" />
                <div className="text-left">
                  <p className="text-sm font-medium text-danger">Delete Account</p>
                  <p className="text-xs text-muted-foreground">Permanently remove all your data</p>
                </div>
              </div>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account?</AlertDialogTitle>
              <AlertDialogDescription>
                This action is permanent and cannot be undone. All your data, contacts, and reports will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-danger hover:bg-danger/90"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/language';
                }}
              >
                Yes, Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SettingsSection>

      {/* About */}
      <div className="mt-2 mb-4 text-center">
        <p className="text-xs text-muted-foreground">{t('appName')}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{t('version')}</p>
      </div>

      {showFakeCall && <FakeCallModal onClose={() => setShowFakeCall(false)} />}
    </div>
  );
}

function SettingsSection({ title, icon, children }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="bg-card rounded-2xl border border-border p-3">
        {children}
      </div>
    </div>
  );
}

function EmergencyRow({ number, label }) {
  return (
    <a href={`tel:${number}`} className="flex items-center justify-between py-1.5 hover:bg-muted/30 rounded-lg px-2 -mx-2 transition-colors">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-danger">{number}</span>
    </a>
  );
}