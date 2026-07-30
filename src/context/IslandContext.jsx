import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const IslandContext = createContext();

export function IslandProvider({ children }) {
  const [islandState, setIslandState] = useState({
    isOpen: false,
    title: '',
    subtitle: '',
    icon: null,
    color: '#10b981',
  });

  const [isHudOpen, setIsHudOpen] = useState(false);
  const queueRef = useRef([]);
  const isProcessingRef = useRef(false);
  const timerRef = useRef(null);

  const processNextInQueue = useCallback(() => {
    if (queueRef.current.length === 0) {
      isProcessingRef.current = false;
      setIslandState((prev) => ({ ...prev, isOpen: false }));
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
    });

    if (timerRef.current) clearTimeout(timerRef.current);

    const duration = current.duration ?? 3200;
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        processNextInQueue();
      }, duration);
    }
  }, []);

  const triggerIsland = useCallback(({ title, subtitle, icon, color = '#10b981', duration = 3200 }) => {
    queueRef.current.push({ title, subtitle, icon, color, duration });
    if (!isProcessingRef.current) {
      processNextInQueue();
    }
  }, [processNextInQueue]);

  const closeIsland = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    queueRef.current = [];
    isProcessingRef.current = false;
    setIslandState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const toggleHud = useCallback(() => {
    setIsHudOpen((prev) => !prev);
  }, []);

  const closeHud = useCallback(() => {
    setIsHudOpen(false);
  }, []);

  return (
    <IslandContext.Provider value={{ islandState, triggerIsland, closeIsland, isHudOpen, toggleHud, closeHud }}>
      {children}
    </IslandContext.Provider>
  );
}

export const useIsland = () => useContext(IslandContext);
