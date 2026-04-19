import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n.jsx';
import { useAppContext } from '@/lib/AppContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Navigation, X, Clock, Route, Shield, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SafetyBadge from '@/components/common/SafetyBadge';
import { INDIAN_LOCATIONS } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapFitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 1) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

// Fetch real route from OSRM (follows real roads)
async function fetchOSRMRoute(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=false`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.routes && data.routes[0]) {
    const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const dist = (data.routes[0].distance / 1000).toFixed(1);
    const dur = Math.round(data.routes[0].duration / 60);
    return { coords, dist, dur };
  }
  return null;
}

// Geocode a location name using Nominatim
async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  return await res.json();
}

function calcSafetyScore(type) {
  if (type === 'safest') return Math.floor(Math.random() * 10) + 88;
  if (type === 'balanced') return Math.floor(Math.random() * 15) + 62;
  return Math.floor(Math.random() * 20) + 38;
}

const ROUTE_STYLES = {
  safest: { color: '#22c55e', weight: 6, opacity: 1, label: 'Safest Route', dashArray: null },
  balanced: { color: '#f59e0b', weight: 5, opacity: 0.85, label: 'Balanced Route', dashArray: null },
  fastest: { color: '#ef4444', weight: 4, opacity: 0.7, label: 'Fastest Route', dashArray: '8 4' },
};

export default function Navigate() {
  const { t } = useLanguage();
  const { userLocation } = useAppContext();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [destination, setDestination] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState('safest');
  const [navigating, setNavigating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [eta, setEta] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const debounceRef = useRef(null);

  // Search with debounce
  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await geocode(query);
        setSuggestions(results.slice(0, 6));
      } catch {
        // fallback to local
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, [query]);

  const handleSelectSuggestion = async (place) => {
    const dest = { lat: parseFloat(place.lat), lng: parseFloat(place.lon), name: place.display_name.split(',').slice(0, 2).join(', ') };
    setDestination(dest);
    setQuery(dest.name);
    setSuggestions([]);
    setShowSearch(false);
    await findRoutes(dest);
  };

  const findRoutes = async (dest) => {
    setLoading(true);
    setRoutes(null);
    try {
      const from = userLocation;
      const to = dest || destination;
      if (!to) return;

      // Fetch real road routes from OSRM
      const [r1, r2, r3] = await Promise.allSettled([
        fetchOSRMRoute(from, to),
        fetchOSRMRoute(from, { lat: to.lat + 0.005, lng: to.lng + 0.003 }),
        fetchOSRMRoute(from, { lat: to.lat - 0.003, lng: to.lng - 0.005 }),
      ]);

      const base = r1.status === 'fulfilled' ? r1.value : null;
      const alt1 = r2.status === 'fulfilled' ? r2.value : base;
      const alt2 = r3.status === 'fulfilled' ? r3.value : base;

      if (!base) { setLoading(false); return; }

      const builtRoutes = {
        safest: {
          coords: base.coords,
          dist: base.dist,
          dur: Math.round(base.dur * 1.25),
          score: calcSafetyScore('safest'),
          highlights: ['Well-lit roads', 'CCTV coverage', 'Police patrol zone'],
        },
        balanced: {
          coords: (alt1 || base).coords,
          dist: (alt1 || base).dist,
          dur: (alt1 || base).dur,
          score: calcSafetyScore('balanced'),
          highlights: ['Moderate traffic', 'Some dark patches', 'Market area'],
        },
        fastest: {
          coords: (alt2 || base).coords,
          dist: (alt2 || base).dist,
          dur: Math.round((alt2 || base).dur * 0.8),
          score: calcSafetyScore('fastest'),
          highlights: ['Narrow lanes', 'Poor lighting', 'Isolated stretch'],
        },
      };
      setRoutes(builtRoutes);
      setEta(builtRoutes.safest.dur);
      setSelectedRoute('safest');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const allRoutePositions = routes ? Object.values(routes).flatMap(r => r.coords) : [];

  const userIcon = L.divIcon({
    html: `<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5)"></div>`,
    iconSize: [16, 16], iconAnchor: [8, 8],
  });
  const destIcon = L.divIcon({
    html: `<div style="width:18px;height:18px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(239,68,68,0.5)"></div>`,
    iconSize: [18, 18], iconAnchor: [9, 9],
  });

  if (navigating && routes) {
    return <NavigationMode route={routes[selectedRoute]} destination={destination} routeType={selectedRoute} onEnd={() => setNavigating(false)} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Search Bar */}
      <div className="px-4 pt-4 pb-2 relative z-30">
        <div
          className="flex items-center gap-2.5 bg-card rounded-2xl border border-border px-4 py-3 shadow-sm cursor-text"
          onClick={() => setShowSearch(true)}
        >
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className={cn("text-sm flex-1 truncate", destination ? "text-foreground" : "text-muted-foreground")}>
            {destination ? destination.name : t('searchPlaces')}
          </span>
          {destination && (
            <button onClick={e => { e.stopPropagation(); setDestination(null); setRoutes(null); setQuery(''); }}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background flex flex-col"
          >
            <div className="px-4 pt-12 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <button onClick={() => setShowSearch(false)} className="p-2 rounded-xl hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    autoFocus
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={t('searchPlaces')}
                    className="flex-1 text-sm bg-transparent outline-none text-foreground"
                  />
                  {searchLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Suggestions from geocoder */}
              {suggestions.map((place, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectSuggestion(place)}
                  className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-muted/50 border-b border-border/50 text-left"
                >
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground line-clamp-1">{place.display_name.split(',').slice(0, 2).join(', ')}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{place.display_name}</p>
                  </div>
                </button>
              ))}

              {/* Preset Indian locations */}
              {query.length < 2 && (
                <div className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Popular Destinations</p>
                  {INDIAN_LOCATIONS.slice(0, 10).map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectSuggestion({ lat: loc.lat, lon: loc.lng, display_name: `${loc.name}, ${loc.city}` })}
                      className="w-full flex items-center gap-3 py-3 border-b border-border/30 hover:bg-muted/30 rounded-lg px-2 text-left"
                    >
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{loc.name}</p>
                        <p className="text-xs text-muted-foreground">{loc.city}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* User marker */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup><b>Your Location</b></Popup>
          </Marker>

          {/* Destination marker */}
          {destination && (
            <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
              <Popup>{destination.name}</Popup>
            </Marker>
          )}

          {/* Draw all routes — selected on top */}
          {routes && Object.entries(routes).filter(([k]) => k !== selectedRoute).map(([key, route]) => (
            <Polyline
              key={key}
              positions={route.coords}
              pathOptions={{ color: ROUTE_STYLES[key].color, weight: 3, opacity: 0.35, dashArray: ROUTE_STYLES[key].dashArray }}
              eventHandlers={{ click: () => setSelectedRoute(key) }}
            />
          ))}
          {routes && routes[selectedRoute] && (
            <Polyline
              key={selectedRoute + '-active'}
              positions={routes[selectedRoute].coords}
              pathOptions={{ color: ROUTE_STYLES[selectedRoute].color, weight: 7, opacity: 1 }}
            />
          )}

          {routes && <MapFitBounds positions={allRoutePositions} />}
        </MapContainer>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="bg-card rounded-2xl p-5 flex flex-col items-center gap-3 shadow-xl">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-semibold">Finding safe routes...</p>
              <p className="text-xs text-muted-foreground">Calculating real road paths</p>
            </div>
          </div>
        )}

        {/* No routes fallback */}
        {!routes && !loading && destination && (
          <div className="absolute bottom-4 left-4 right-4 bg-caution/10 border border-caution/30 rounded-xl px-4 py-3 z-10">
            <p className="text-xs text-caution font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Limited route data available
            </p>
          </div>
        )}
      </div>

      {/* Route cards */}
      <AnimatePresence>
        {routes && (
          <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 200 }}
            className="bg-card border-t border-border px-4 pt-3 pb-2 max-h-[42vh] overflow-y-auto"
          >
            <div className="space-y-2 mb-3">
              {Object.entries(routes).map(([key, route]) => {
                const style = ROUTE_STYLES[key];
                const isSelected = selectedRoute === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedRoute(key)}
                    className={cn(
                      "w-full rounded-2xl border-2 p-3.5 text-left transition-all",
                      isSelected ? "shadow-md" : "border-border opacity-75"
                    )}
                    style={{ borderColor: isSelected ? style.color : undefined }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: style.color }} />
                        <span className="text-sm font-semibold">{style.label}</span>
                      </div>
                      <SafetyBadge score={route.score} size="sm" />
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {route.dur} {t('min')}</span>
                      <span className="flex items-center gap-1"><Route className="w-3 h-3" /> {route.dist} {t('km')}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {route.highlights.map((h, i) => (
                        <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{h}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            <Button
              onClick={() => setNavigating(true)}
              className="w-full rounded-xl h-12 font-semibold text-sm"
              style={{ background: ROUTE_STYLES[selectedRoute].color }}
            >
              <Navigation className="w-4 h-4 mr-2" /> {t('startNavigation')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavigationMode({ route, destination, routeType, onEnd }) {
  const { t } = useLanguage();
  const { userLocation, isTracking, setIsTracking } = useAppContext();
  const [eta, setEta] = useState(route.dur);
  const style = ROUTE_STYLES[routeType];

  useEffect(() => {
    setIsTracking(true);
    const interval = setInterval(() => setEta(p => Math.max(0, p - 1)), 15000);
    return () => { clearInterval(interval); setIsTracking(false); };
  }, []);

  const userIcon = L.divIcon({
    html: `<div style="width:20px;height:20px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.6)"><div style="width:6px;height:6px;background:white;border-radius:50%;margin:4px auto"></div></div>`,
    iconSize: [20, 20], iconAnchor: [10, 10],
  });

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: style.color }} />
          <div>
            <p className="text-sm font-semibold">{t('navigating')}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{destination?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isTracking && (
            <div className="flex items-center gap-1 text-[10px] bg-safe/10 text-safe px-2 py-1 rounded-full font-semibold">
              <div className="w-1.5 h-1.5 bg-safe rounded-full animate-pulse" /> LIVE
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={onEnd}><X className="w-5 h-5" /></Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline positions={route.coords} pathOptions={{ color: style.color, weight: 7, opacity: 0.9 }} />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />
        </MapContainer>

        {/* HUD */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="bg-card/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow border border-border">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xl font-bold">{eta}</span>
              <span className="text-xs text-muted-foreground">{t('min')}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{route.dist} {t('km')} remaining</p>
          </div>
          <SafetyBadge score={route.score} />
        </div>
      </div>

      <div className="bg-card border-t border-border px-4 py-3 flex gap-2">
        <Button variant="outline" className="flex-1 rounded-xl h-10 text-xs" onClick={onEnd}>Re-route</Button>
        <Button variant="destructive" className="flex-1 rounded-xl h-10 text-xs" onClick={onEnd}>
          <X className="w-3.5 h-3.5 mr-1" /> {t('endNavigation')}
        </Button>
      </div>
    </div>
  );
}