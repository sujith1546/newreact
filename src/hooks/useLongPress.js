import { useCallback, useRef } from 'react';

export function useLongPress({ onLongPress, onClick, ms = 500 }) {
  const timerRef = useRef();
  const isLongPress = useRef(false);

  const start = useCallback((e) => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      if (navigator.vibrate) navigator.vibrate(50);
      onLongPress(e);
    }, ms);
  }, [onLongPress, ms]);

  const clear = useCallback((e) => {
    clearTimeout(timerRef.current);
  }, []);

  const click = useCallback((e) => {
    if (isLongPress.current) return;
    if (onClick) onClick(e);
  }, [onClick]);

  return {
    onPointerDown: start,
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    onClick: click
  };
}
