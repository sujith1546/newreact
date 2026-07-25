import React, { useState, useEffect } from 'react';
import DesktopProjects from './desktop/DesktopProjects';
import MobileProjects from './mobile/MobileProjects';

export default function Projects(props) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileProjects {...props} /> : <DesktopProjects {...props} />;
}
