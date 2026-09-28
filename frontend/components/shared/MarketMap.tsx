'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Store, Calendar, Clock, ExternalLink, Locate } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface MarketLocationPin {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  operatingDays?: string[];
  operatingHours?: string;
  vendorsCount?: number;
  image?: string;
}

export interface MarketMapProps {
  markets: MarketLocationPin[];
  selectedMarketId?: string;
  onSelectMarket?: (market: MarketLocationPin) => void;
  className?: string;
}

const DEFAULT_LAT = 37.8044;
const DEFAULT_LNG = -122.2712;

export const MarketMap: React.FC<MarketMapProps> = ({
  markets,
  selectedMarketId,
  onSelectMarket,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle'|'detecting'|'found'|'denied'>('idle');
  const [activeMarket, setActiveMarket] = useState<MarketLocationPin | null>(
    markets.find(m => m.id === selectedMarketId) || markets[0] || null
  );

  const requestLocation = () => {
    if (!('geolocation' in navigator)) return;
    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setLocationStatus('found');
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([coords.lat, coords.lng], { animate: true, duration: 1 });
        }
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    // If map is already initialized (e.g., React Fast Refresh), destroy and reinitialize
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const centerLat = markets[0]?.latitude ?? DEFAULT_LAT;
      const centerLng = markets[0]?.longitude ?? DEFAULT_LNG;

      const map = L.map(mapContainerRef.current!, {
        center: [centerLat, centerLng],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true,
      });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marketIcon = L.divIcon({
        className: '',
        html: `<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#16a34a,#15803d);transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 12px rgba(22,163,74,0.5);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:14px;margin-top:-2px;">ðŸª</div></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -40],
      });

      markets.forEach(market => {
        const lat = market.latitude || DEFAULT_LAT;
        const lng = market.longitude || DEFAULT_LNG;
        const days = Array.isArray(market.operatingDays) ? market.operatingDays.join(', ') : 'Weekends';
        const hours = market.operatingHours || '8:00 AM - 2:00 PM';
        const directionsUrl = `https://www.openstreetmap.org/directions?to=${lat},${lng}`;

        const popupHtml = `<div style="min-width:220px;font-family:inherit;"><div style="background:linear-gradient(135deg,#14532d,#16a34a);padding:12px 14px;border-radius:12px 12px 0 0;margin:-12px -16px 10px;"><p style="color:#86efac;font-size:10px;font-weight:700;letter-spacing:.05em;margin:0 0 2px;">FARMERS MARKET</p><h4 style="color:white;font-size:14px;font-weight:800;margin:0;line-height:1.3;">${market.name}</h4></div><p style="font-size:11px;color:#71717a;margin:0 0 8px;">ðŸ“ ${market.address}, ${market.city}</p><div style="background:#f4f4f5;border-radius:8px;padding:8px 10px;margin-bottom:10px;"><div style="font-size:11px;font-weight:600;color:#18181b;margin-bottom:4px;">ðŸ“… ${days}</div><div style="font-size:11px;font-weight:600;color:#18181b;margin-bottom:4px;">ðŸ• ${hours}</div>${market.vendorsCount ? `<div style="font-size:11px;font-weight:600;color:#18181b;">ðŸª ${market.vendorsCount}+ Active Vendors</div>` : ''}</div><a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;gap:6px;background:#16a34a;color:white;text-decoration:none;font-size:12px;font-weight:700;padding:8px 12px;border-radius:10px;width:100%;box-sizing:border-box;">ðŸ—ºï¸ Get Directions &rarr;</a></div>`;

        const marker = L.marker([lat, lng], { icon: marketIcon })
          .addTo(map)
          .bindPopup(popupHtml, { maxWidth: 280, minWidth: 240 });

        marker.on('click', () => {
          setActiveMarket(market);
          if (onSelectMarket) onSelectMarket(market);
        });
      });

      requestLocation();
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userCoords || !mapInstanceRef.current) return;
    import('leaflet').then(L => {
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:20px;height:20px;"><div class="location-pin-pulse" style="position:absolute;inset:0;border-radius:50%;"></div><div style="position:absolute;inset:3px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 2px 8px rgba(59,130,246,0.6);"></div></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -15],
      });
      L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('<div style="font-size:12px;font-weight:700;color:#1d4ed8;">ðŸ“ Your Current Location</div>');
    });
  }, [userCoords]);

  useEffect(() => {
    if (!activeMarket || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(
      [activeMarket.latitude || DEFAULT_LAT, activeMarket.longitude || DEFAULT_LNG],
      14,
      { animate: true, duration: 0.8 }
    );
  }, [activeMarket]);

  return (
    <div className={`relative w-full rounded-md overflow-hidden border border-[#C9A45C]/25 shadow-xl bg-slate-900 ${className}`}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />

      <div ref={mapContainerRef} className="w-full h-[400px] sm:h-[460px]" style={{ zIndex: 0 }} />

      {/* Status bar */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2">
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border shadow-md backdrop-blur-md text-xs font-bold transition-all ${
          locationStatus === 'found' ? 'bg-blue-600 text-[#F5F0E6] border-blue-400'
          : locationStatus === 'denied' ? 'bg-amber-50 text-amber-800 border-amber-200'
          : 'bg-[#F5F0E6]/95 text-[#10251D] border-[#C9A45C]/25'
        }`}>
          {locationStatus === 'detecting' && <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />}
          {locationStatus === 'found' && <span className="w-2 h-2 rounded-full bg-blue-200 animate-pulse shrink-0" />}
          {(locationStatus === 'denied' || locationStatus === 'idle') && <MapPin className="w-3.5 h-3.5 text-[#263A2E] shrink-0" />}
          <span>
            {locationStatus === 'found' && 'ðŸ“ Live Location Active'}
            {locationStatus === 'detecting' && 'Detecting location...'}
            {locationStatus === 'denied' && 'Showing Farmers Markets'}
            {locationStatus === 'idle' && 'MarketLink â€” OpenStreetMap'}
          </span>
        </div>
      </div>

      {/* Relocate button */}
      <button onClick={requestLocation}
        className="absolute top-3 right-3 z-[400] flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F5F0E6]/95 border border-[#C9A45C]/25 shadow-md text-xs font-bold text-[#10251D] hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all backdrop-blur-md">
        <Locate className="w-3.5 h-3.5" />
        {locationStatus === 'detecting' ? 'Locating...' : 'My Location'}
      </button>

      {/* Market pills */}
      <div className="absolute bottom-0 left-0 right-0 z-[400] p-3 bg-gradient-to-t from-black/50 via-black/10 to-transparent">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {markets.map((m, i) => {
            const isActive = activeMarket?.id === m.id;
            return (
              <button key={m.id}
                onClick={() => { setActiveMarket(m); if (onSelectMarket) onSelectMarket(m); }}
                className={`filter-tab-enter flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold border transition-all duration-200 shadow-md ${
                  isActive ? 'bg-[#10251D] text-[#F5F0E6] border-[#263A2E] scale-105 ring-2 ring-[#C9A45C]'
                  : 'bg-[#F5F0E6]/95 text-[#10251D] border-white/80 hover:bg-[#F5F0E6]'
                }`}
                style={{ animationDelay: `${i * 80}ms` }}>
                <Store className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-300' : 'text-[#263A2E]'}`} />
                <span className="truncate max-w-[140px]">{m.name}</span>
                {m.vendorsCount && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${isActive ? 'bg-[#263A2E]/10 text-[#263A2E]' : 'bg-[#263A2E]/10 text-[#263A2E]'}`}>
                    {m.vendorsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active market detail bar */}
      {activeMarket && (
        <div className="relative bg-[#F5F0E6] border-t border-[#C9A45C]/25 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#263A2E]/10 text-[#263A2E] flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <Badge variant="emerald" className="text-[10px]">{activeMarket.city}</Badge>
                {activeMarket.vendorsCount && <span className="text-[10px] font-bold text-[#263A2E]">{activeMarket.vendorsCount}+ vendors</span>}
              </div>
              <h4 className="font-extrabold text-[#10251D] text-sm truncate">{activeMarket.name}</h4>
              <p className="text-xs text-[#263A2E] truncate">{activeMarket.address}</p>
              {activeMarket.operatingDays && (
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  <Calendar className="w-3 h-3 text-[#263A2E] shrink-0" />
                  <span className="text-[11px] text-[#263A2E] font-semibold">{activeMarket.operatingDays.join(', ')}</span>
                  {activeMarket.operatingHours && <>
                    <Clock className="w-3 h-3 text-[#263A2E] ml-2 shrink-0" />
                    <span className="text-[11px] text-[#263A2E] font-semibold">{activeMarket.operatingHours}</span>
                  </>}
                </div>
              )}
            </div>
          </div>
          <a href={`https://www.openstreetmap.org/directions?to=${activeMarket.latitude},${activeMarket.longitude}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#263A2E] bg-[#263A2E]/10 hover:bg-[#263A2E]/10 border border-emerald-200 px-4 py-2.5 rounded-md transition-all shrink-0 whitespace-nowrap">
            <Navigation className="w-3.5 h-3.5" />
            Get Directions
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};
