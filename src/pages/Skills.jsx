import React, { useState, useEffect } from 'react';
import DesktopSkills from './desktop/DesktopSkills';
import MobileSkills from './mobile/MobileSkills';

export default function Skills(props) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileSkills {...props} /> : <DesktopSkills {...props} />;
}
