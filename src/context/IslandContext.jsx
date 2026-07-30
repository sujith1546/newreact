import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useSupabasePresence } from '../hooks/useSupabasePresence';

const IslandContext = createContext();

export function IslandProvider({ children }) {
  const { visitorCount: realtimeVisitorCount } = useSupabasePresence();

  const [islandState, setIslandState] = useState({
    isOpen: false,
    title: '',
    subtitle: '',
    icon: null,
    color: '#10b981',
    progress: null, // null or 0..100
  });

  const [isHudOpen, setIsHudOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState(1);
  const [isEqualizerActive, setIsEqualizerActive] = useState(false);

  const queueRef = useRef([]);
  const isProcessingRef = useRef(false);
  const timerRef = useRef(null);

  // Sync real-time Supabase presence viewer count
  useEffect(() => {
    if (realtimeVisitorCount && realtimeVisitorCount > 0) {
      setVisitorCount(realtimeVisitorCount);
    }
  }, [realtimeVisitorCount]);

  // BroadcastChannel for Live Visitor Counting fallback across tabs
  useEffect(() => {
    let bc;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('portfolio_live_visitors');
        bc.postMessage({ type: 'VISITOR_PING', timestamp: Date.now() });

        bc.onmessage = (e) => {
          if (e.data?.type === 'VISITOR_PING') {
            setVisitorCount((prev) => Math.max(prev, 1));
          }
        };
      }
    } catch (err) {
      console.log('BroadcastChannel fallback:', err);
    }

    return () => {
      try { bc?.close(); } catch (e) {}
    };
  }, []);

  const processNextInQueue = useCallback(() => {
    if (queueRef.current.length === 0) {
      isProcessingRef.current = false;
      setIslandState((prev) => ({ ...prev, isOpen: false, progress: null }));
      return;
    }

    isProcessingRef.current = true;
    const current = queueRef.current.shift();

    setIslandState({
      isOpen: true,
      title: current.title,
      subtitle: current.subtitle || '',
      icon: current.icon || null,
      color: current.color || '#10b981',
      progress: current.progress ?? null,
    });

    if (timerRef.current) clearTimeout(timerRef.current);

    const duration = current.duration ?? 3200;
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        processNextInQueue();
      }, duration);
    }
  }, []);

  const triggerIsland = useCallback(({ title, subtitle, icon, color = '#10b981', duration = 3200, progress = null }) => {
    // Deduplicate if identical toast is currently displayed or queued at back of queue
    const lastItem = queueRef.current[queueRef.current.length - 1];
    if (lastItem && lastItem.title === title && lastItem.subtitle === subtitle) {
      return;
    }
    queueRef.current.push({ title, subtitle, icon, color, duration, progress });
    if (!isProcessingRef.current) {
      processNextInQueue();
    }
  }, [processNextInQueue]);

  // Multi-step progress sequences (e.g. Submitting -> Encrypting -> Sent)
  const triggerStepProgress = useCallback((steps) => {
    if (!steps || steps.length === 0) return;
    steps.forEach((step) => {
      queueRef.current.push({
        title: step.title,
        subtitle: step.subtitle || '',
        icon: step.icon || null,
        color: step.color || '#10b981',
        duration: step.duration || 1800,
        progress: step.progress ?? null,
      });
    });
    if (!isProcessingRef.current) {
      processNextInQueue();
    }
  }, [processNextInQueue]);

  const closeIsland = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    queueRef.current = [];
    isProcessingRef.current = false;
    setIslandState((prev) => ({ ...prev, isOpen: false, progress: null }));
  }, []);

  const toggleHud = useCallback(() => {
    setIsHudOpen((prev) => !prev);
  }, []);

  const closeHud = useCallback(() => {
    setIsHudOpen(false);
  }, []);

  return (
    <IslandContext.Provider value={{
      islandState,
      triggerIsland,
      triggerStepProgress,
      closeIsland,
      isHudOpen,
      toggleHud,
      closeHud,
      visitorCount,
      isEqualizerActive,
      setIsEqualizerActive
    }}>
      {children}
    </IslandContext.Provider>
  );
}

export const useIsland = () => useContext(IslandContext);
