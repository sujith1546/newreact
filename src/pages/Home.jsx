import React, { useState, useEffect } from 'react';
import DesktopHome from './desktop/DesktopHome';
import MobileHome from './mobile/MobileHome';

export default function Home(props) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileHome {...props} /> : <DesktopHome {...props} />;
}
