import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n.jsx';
import { useAppContext } from '@/lib/AppContext.jsx';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Camera, Mic, MapPin, CheckCircle2, Clock, Shield, Send, Loader2, ThumbsUp, RefreshCw, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const INCIDENT_TYPES = [
  { id: 'harassment', icon: '🚫', colorClass: 'border-danger bg-danger/5 text-danger' },
  { id: 'unsafe_street', icon: '🛣️', colorClass: 'border-caution bg-caution/5 text-caution' },
  { id: 'suspicious', icon: '👁️', colorClass: 'border-primary bg-primary/5 text-primary' },
  { id: 'poor_lighting', icon: '💡', colorClass: 'border-caution bg-caution/5 text-caution' },
  { id: 'other', icon: '📋', colorClass: 'border-border bg-muted text-foreground' },
];

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const typeIcons = { harassment: '🚫', unsafe_street: '🛣️', suspicious: '👁️', poor_lighting: '💡', other: '📋' };

export default function Report() {
  const { t } = useLanguage();
  const { userLocation } = useAppContext();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const labelMap = {
    harassment: t('harassment'), unsafe_street: t('unsafeStreet'),
    suspicious: t('suspiciousActivity'), poor_lighting: t('poorLighting'), other: t('other'),
  };

  // Fetch reports from backend
  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.IncidentReport.list('-created_date', 20),
    refetchInterval: 15000, // real-time-ish polling
  });

  // Subscribe for real-time updates
  useEffect(() => {
    const unsub = base44.entities.IncidentReport.subscribe((event) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    });
    return unsub;
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let media_url = null;
      if (mediaFile) {
        setUploadingMedia(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: mediaFile });
        media_url = file_url;
        setUploadingMedia(false);
      }
      return base44.entities.IncidentReport.create({ ...data, media_url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setSubmitted(true);
      setSelectedType(null);
      setDescription('');
      setMediaFile(null);
      setTimeout(() => setSubmitted(false), 3000);
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: ({ id, upvotes }) => base44.entities.IncidentReport.update(id, { upvotes: upvotes + 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
  });

  const handleSubmit = () => {
    if (!selectedType) return;
    if (!userLocation.lat || !userLocation.lng) {
      alert(t('locationRequired'));
      return;
    }
    createMutation.mutate({
      type: selectedType,
      description,
      lat: userLocation.lat,
      lng: userLocation.lng,
      location_name: `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`,
      trust_score: Math.floor(Math.random() * 25) + 70,
      anonymous,
      upvotes: 0,
    });
  };

  return (
    <div className="flex flex-col px-4 pt-4 pb-8">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-foreground">{t('reportIncident')}</h2>
        <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-muted">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Help keep your community safe</p>

      {/* Success banner */}
      <AnimatePresence>
        {submitted && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 bg-safe/10 border border-safe/20 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-safe" />
            <div>
              <p className="text-sm font-semibold text-safe">{t('reportSubmitted')}</p>
              <p className="text-xs text-muted-foreground">Added to community feed instantly.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incident types */}
      <p className="text-sm font-semibold mb-2">Type of Incident</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {INCIDENT_TYPES.map(type => (
          <motion.button key={type.id} whileTap={{ scale: 0.95 }} onClick={() => setSelectedType(type.id)}
            className={cn("flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all",
              selectedType === type.id ? type.colorClass : "border-border bg-card")}>
            <span className="text-xl">{type.icon}</span>
            <span className="text-[10px] font-semibold leading-tight text-center">{labelMap[type.id]}</span>
          </motion.button>
        ))}
      </div>

      {/* Description */}
      <Textarea value={description} onChange={e => setDescription(e.target.value)}
        placeholder={t('addDescription')} className="rounded-xl mb-3 min-h-[80px] resize-none" />

      {/* Media upload */}
      <div className="flex gap-2 mb-3">
        <label className="flex-1">
          <div className="flex items-center justify-center gap-1.5 border border-border rounded-xl py-2 text-xs text-muted-foreground cursor-pointer hover:bg-muted/30 transition">
            <ImagePlus className="w-3.5 h-3.5" />
            {mediaFile ? mediaFile.name.slice(0, 18) + '…' : 'Add Photo'}
          </div>
          <input type="file" accept="image/*,audio/*" className="hidden" onChange={e => setMediaFile(e.target.files[0])} />
        </label>
      </div>

      {/* Anonymous toggle */}
      <div className="flex items-center justify-between mb-4 bg-card border border-border rounded-xl px-3 py-2.5">
        <span className="text-sm text-muted-foreground">{t('anonymousReport')}</span>
        <Switch checked={anonymous} onCheckedChange={setAnonymous} />
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-muted/50 rounded-xl px-3 py-2">
        <MapPin className="w-3.5 h-3.5 text-primary" />
        <span>GPS: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}</span>
      </div>

      {/* Submit */}
      <Button onClick={handleSubmit} disabled={!selectedType || createMutation.isPending || uploadingMedia}
        className="w-full rounded-xl h-12 font-semibold gap-2 mb-6">
        {createMutation.isPending || uploadingMedia
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
          : <><Send className="w-4 h-4" /> {t('submitReport')}</>}
      </Button>

      {/* Community feed */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{t('reportFeed')}</h3>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      <div className="space-y-2">
        {reports.length === 0 && !isLoading && (
          <p className="text-xs text-muted-foreground text-center py-6">No reports yet. Be the first!</p>
        )}
        {reports.map(report => (
          <motion.div key={report.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-caution/10 flex items-center justify-center text-lg shrink-0">
                {typeIcons[report.type] || '📋'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{report.description || labelMap[report.type]}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> {timeAgo(report.created_date)}
                  </span>
                  {report.trust_score && (
                    <span className={cn("text-[10px] font-semibold flex items-center gap-0.5",
                      report.trust_score >= 80 ? "text-safe" : report.trust_score >= 60 ? "text-caution" : "text-danger")}>
                      <Shield className="w-3 h-3" /> Trust: {report.trust_score}%
                    </span>
                  )}
                  {report.status === 'approved' && (
                    <span className="text-[10px] bg-safe/10 text-safe px-1.5 py-0.5 rounded-full font-semibold">✓ Approved</span>
                  )}
                  {report.anonymous && <span className="text-[10px] text-muted-foreground">Anonymous</span>}
                </div>
              </div>
              <button
                onClick={() => upvoteMutation.mutate({ id: report.id, upvotes: report.upvotes || 0 })}
                className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span className="text-[10px]">{report.upvotes || 0}</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}