import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers } from 'lucide-react';

export default function SplashScreen({ isReady, onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isReady) {
      // Ensure the splash screen is visible for at least a premium 1.8 seconds
      // so it doesn't just flash quickly on fast connections
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 800); // Wait for exit animation to finish before unmounting
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [isReady, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            filter: 'blur(10px)',
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'var(--text-primary)'
          }}
        >
          {/* Minimalist Apple-style Logo Animation */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
          >
            {/* Glowing Logo Icon */}
            <motion.div
              animate={{
                boxShadow: [
                  "0px 0px 0px rgba(11,136,255,0)",
                  "0px 0px 40px rgba(11,136,255,0.4)",
                  "0px 0px 0px rgba(11,136,255,0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, var(--primary-blue), #8a2be2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <Layers size={36} strokeWidth={1.5} />
            </motion.div>
            
            {/* Minimalist Loading Bar */}
            <div style={{
              width: '120px',
              height: '3px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '2px',
              overflow: 'hidden',
              marginTop: '10px'
            }}>
              <motion.div
                initial={{ width: '0%', x: '-100%' }}
                animate={{ width: '50%', x: '200%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  height: '100%',
                  backgroundColor: 'var(--primary-blue)',
                  borderRadius: '2px'
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
