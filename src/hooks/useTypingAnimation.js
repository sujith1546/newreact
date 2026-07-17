import { useEffect, useRef, useState } from 'react';

const TEXTS = ['Student in VIT', 'Data Science Enthusiast', 'Web Developer', 'Tech Explorer'];

export function useTypingAnimation() {
  const [display, setDisplay] = useState('');
  const state = useRef({ count: 0, index: 0, deleting: false });

  useEffect(() => {
    let timeout;

    function tick() {
      const { count, index, deleting } = state.current;
      const currentText = TEXTS[count];

      if (!deleting) {
        const next = currentText.slice(0, index + 1);
        setDisplay(next);
        if (next.length === currentText.length) {
          state.current.deleting = true;
          timeout = setTimeout(tick, 2000);
        } else {
          state.current.index += 1;
          timeout = setTimeout(tick, 100);
        }
      } else {
        const next = currentText.slice(0, index - 1);
        setDisplay(next);
        if (next.length === 0) {
          state.current.count = (count + 1) % TEXTS.length;
          state.current.index = 0;
          state.current.deleting = false;
          timeout = setTimeout(tick, 200);
        } else {
          state.current.index -= 1;
          timeout = setTimeout(tick, 50);
        }
      }
    }

    timeout = setTimeout(tick, 500);
    return () => clearTimeout(timeout);
  }, []);

  return display;
}
