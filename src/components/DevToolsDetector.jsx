import React, { useEffect, useRef } from 'react';
import { useIsland } from '../context/IslandContext';
import { AlertOctagon } from 'lucide-react';

export default function DevToolsDetector() {
  const { triggerIsland } = useIsland();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    let devtoolsOpen = false;

    // Method 1: Dimension Check
    const checkDimensions = () => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        if (!devtoolsOpen && !hasTriggeredRef.current) {
          devtoolsOpen = true;
          hasTriggeredRef.current = true;
          fireVibeAlert();
        }
      } else {
        devtoolsOpen = false;
      }
    };

    const fireVibeAlert = () => {
      console.log(
        "%c \n\nLooking under the hood? 👀\n\nI built this with React, Framer Motion, and lots of ☕.\nLet's connect: sujithreddy1546@gmail.com\n\n",
        "color: #10b981; font-size: 20px; font-weight: bold; background: #111; padding: 20px; border-radius: 10px;"
      );
      
      triggerIsland({
        title: 'Developer Detected',
        subtitle: 'Looking under the hood? Hire me!',
        icon: <AlertOctagon size={18} strokeWidth={2.5} />,
        color: '#8b5cf6', // A cool purple vibe
        duration: 5000
      });
    };

    window.addEventListener('resize', checkDimensions);
    
    // Initial check in case it's already open
    setTimeout(checkDimensions, 1000);

    return () => {
      window.removeEventListener('resize', checkDimensions);
    };
  }, [triggerIsland]);

  return null;
}
