import { useState, useEffect } from 'react';

export default function useGlitchText(text, delay = 0) {
  const [displayText, setDisplayText] = useState(text);
  
  useEffect(() => {
    let timeout;
    const chars = '!<>-_\\\\/[]{}—=+*^?#________';
    
    timeout = setTimeout(() => {
      let iteration = 0;
      const interval = setInterval(() => {
        setDisplayText(
          text.split('')
            .map((letter, index) => {
              if (index < iteration) {
                return text[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );
        
        if (iteration >= text.length) {
          clearInterval(interval);
        }
        
        iteration += 1 / 3;
      }, 30);
      
      return () => clearInterval(interval);
    }, delay);
    
    return () => clearTimeout(timeout);
  }, [text, delay]);
  
  return displayText;
}
