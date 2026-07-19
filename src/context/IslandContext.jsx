import React, { createContext, useContext, useState, useCallback } from 'react';

const IslandContext = createContext();

export function IslandProvider({ children }) {
  const [islandState, setIslandState] = useState({
    isOpen: false,
    title: '',
    subtitle: '',
    icon: null,
    color: '#fff',
  });

  const triggerIsland = useCallback(({ title, subtitle, icon, color = '#10b981', duration = 3000 }) => {
    setIslandState({ isOpen: true, title, subtitle, icon, color });

    if (duration > 0) {
      setTimeout(() => {
        setIslandState((prev) => ({ ...prev, isOpen: false }));
      }, duration);
    }
  }, []);

  const closeIsland = useCallback(() => {
    setIslandState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <IslandContext.Provider value={{ islandState, triggerIsland, closeIsland }}>
      {children}
    </IslandContext.Provider>
  );
}

export const useIsland = () => useContext(IslandContext);
