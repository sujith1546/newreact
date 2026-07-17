import { useState, useEffect } from "react";

export function useLocalTime() {
  const [time, setTime] = useState(() => formatTime());

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  return time;
}

function formatTime() {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}
