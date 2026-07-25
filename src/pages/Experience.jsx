import React, { useState, useEffect } from 'react';
import DesktopExperience from './desktop/DesktopExperience';
import MobileExperience from './mobile/MobileExperience';

export default function Experience(props) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileExperience {...props} /> : <DesktopExperience {...props} />;
}
