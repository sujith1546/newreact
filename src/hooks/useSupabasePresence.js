import { useState, useEffect } from 'react';
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

// ── Global Singleton State for Instant Multi-Component Sync ──
let globalPresenceState = {
  visitorCount: 1,
  isConnected: false,
  presenceMarkers: [],
  aggregatedByCountry: {},
  isAggregatedOnly: false,
};

const listeners = new Set();
let globalChannel = null;
let syncTimeout = null;

function notifyListeners() {
  listeners.forEach((listener) => listener(globalPresenceState));
}

function processGlobalPresenceState() {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    try {
      if (!globalChannel) return;
      const state = globalChannel.presenceState();
      const uniqueKeys = Object.keys(state);
      const rawCount = uniqueKeys.length;
      const count = Math.max(1, rawCount);

      const isHighTraffic = rawCount > 150;
      const markers = [];
      const countryAgg = {};

      Object.entries(state).forEach(([key, presences]) => {
        if (!presences || presences.length === 0) return;
        const latest = presences[presences.length - 1];
        const country = latest.country || 'Global';

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

      globalPresenceState = {
        visitorCount: count,
        isConnected: true,
        presenceMarkers: markers,
        aggregatedByCountry: countryAgg,
        isAggregatedOnly: isHighTraffic,
      };

      notifyListeners();
    } catch (err) {
      console.warn('Error processing global presence state:', err);
    }
  }, 30); // 30ms ultra-fast sync
}

function initGlobalPresenceChannel() {
  if (globalChannel || typeof window === 'undefined') return;
  if (BOT_REGEX.test(navigator.userAgent || '')) return;
  if (!supabase || !supabase.channel) return;

  const deviceId = getDeviceSessionId();

  try {
    globalChannel = supabase.channel('portfolio_presence', {
      config: {
        presence: { key: deviceId },
      },
    });

    globalChannel
      .on('presence', { event: 'sync' }, processGlobalPresenceState)
      .on('presence', { event: 'join' }, processGlobalPresenceState)
      .on('presence', { event: 'leave' }, processGlobalPresenceState);

    globalChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        globalPresenceState.isConnected = true;
        notifyListeners();

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

        try {
          await globalChannel.track({
            lat: geo.lat,
            lng: geo.lng,
            country: geo.country || 'India',
            deviceType: geo.deviceType || 'desktop',
            last_seen: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Track failed:', e);
        }
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        globalPresenceState.isConnected = false;
        notifyListeners();
      }
    });

    window.addEventListener('beforeunload', () => {
      if (globalChannel) {
        try { globalChannel.untrack(); } catch {}
      }
    });
  } catch (err) {
    console.warn('Global presence init error:', err);
  }
}

export function useSupabasePresence() {
  const [state, setState] = useState(globalPresenceState);

  useEffect(() => {
    initGlobalPresenceChannel();
    listeners.add(setState);

    // Initial state sync
    setState(globalPresenceState);

    return () => {
      listeners.delete(setState);
    };
  }, []);

  return state;
}
