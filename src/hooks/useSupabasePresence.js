import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const BOT_REGEX = /bot|crawler|spider|lighthouse|bytespider|googlebot|bingbot|yandex/i;

function getDeviceSessionId() {
  if (typeof window === 'undefined') return 'device_ssr';
  let did = localStorage.getItem('x-visitor-device-id');
  if (!did) {
    did = `dev_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    localStorage.setItem('x-visitor-device-id', did);
  }
  return did;
}

export function useSupabasePresence() {
  const [visitorCount, setVisitorCount] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [presenceMarkers, setPresenceMarkers] = useState([]);
  const [aggregatedByCountry, setAggregatedByCountry] = useState({});
  const [isAggregatedOnly, setIsAggregatedOnly] = useState(false);
  const syncTimeoutRef = useRef(null);

  useEffect(() => {
    // Client-side Bot Filter
    if (typeof navigator !== 'undefined' && BOT_REGEX.test(navigator.userAgent || '')) {
      setIsConnected(false);
      setVisitorCount(1);
      return;
    }

    if (!supabase || !supabase.channel) {
      setVisitorCount(1);
      return;
    }

    const deviceId = getDeviceSessionId();
    let channel;

    const processPresenceState = () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        try {
          if (!channel) return;
          const state = channel.presenceState();
          const uniqueKeys = Object.keys(state);
          const rawCount = uniqueKeys.length;
          const count = Math.max(1, rawCount);
          setVisitorCount(count);
          setIsConnected(true);

          // Marker Cap & Degrade Path (> 150 fallback)
          const isHighTraffic = rawCount > 150;
          setIsAggregatedOnly(isHighTraffic);

          const markers = [];
          const countryAgg = {};

          Object.entries(state).forEach(([key, presences]) => {
            if (!presences || presences.length === 0) return;
            const latest = presences[presences.length - 1];
            const country = latest.country || 'Global';

            // Country-level aggregation
            countryAgg[country] = (countryAgg[country] || 0) + 1;

            if (latest.lat && latest.lng && !isHighTraffic) {
              markers.push({
                key,
                lat: latest.lat,
                lng: latest.lng,
                country,
                deviceType: latest.deviceType || 'desktop',
                last_seen: latest.last_seen || new Date().toISOString(),
              });
            }
          });

          setPresenceMarkers(markers);
          setAggregatedByCountry(countryAgg);
        } catch (err) {
          console.warn('Error processing presence state:', err);
        }
      }, 50); // 50ms fast response
    };

    try {
      // Clear any pre-existing channel for this topic
      const existing = supabase.getChannels().find(
        (c) => c.topic === 'realtime:portfolio_presence' || c.topic === 'portfolio_presence'
      );
      if (existing) {
        supabase.removeChannel(existing);
      }

      channel = supabase.channel('portfolio_presence', {
        config: {
          presence: {
            key: deviceId,
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, processPresenceState)
        .on('presence', { event: 'join' }, processPresenceState)
        .on('presence', { event: 'leave' }, processPresenceState);

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          try {
            // Read coarse location once from sessionStorage or fetch /api/geo
            let geo = { lat: 20.5937, lng: 78.9629, country: 'India', deviceType: 'desktop' };
            const cached = sessionStorage.getItem('visitor_location');
            if (cached) {
              try { geo = JSON.parse(cached); } catch { /* fallback */ }
            } else {
              try {
                const res = await fetch('/api/geo');
                if (res.ok) {
                  const data = await res.json();
                  if (data && data.lat && data.lng) {
                    geo = { lat: data.lat, lng: data.lng, country: data.country || 'India', deviceType: data.deviceType || 'desktop' };
                    sessionStorage.setItem('visitor_location', JSON.stringify(geo));
                  }
                }
              } catch { /* fallback */ }
            }

            // Single track call on join to prevent fan-out storms
            await channel.track({
              lat: geo.lat,
              lng: geo.lng,
              country: geo.country || 'India',
              deviceType: geo.deviceType || 'desktop',
              last_seen: new Date().toISOString(),
            });
          } catch (trackErr) {
            console.warn('Presence track warning:', trackErr);
          }
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });

      const handleBeforeUnload = () => {
        if (channel) {
          try { channel.untrack(); } catch { /* ignore */ }
        }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        if (channel) {
          try {
            channel.untrack();
            supabase.removeChannel(channel);
          } catch { /* ignore */ }
        }
      };
    } catch (err) {
      console.warn('Presence initialization error:', err);
    }
  }, []);

  return {
    visitorCount,
    isConnected,
    presenceMarkers,
    aggregatedByCountry,
    isAggregatedOnly,
  };
}
