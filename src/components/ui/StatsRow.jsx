import { useEffect, useRef, useState } from "react";

const STATS = [
  { label: "Years coding", value: 3.5, decimals: 1 },
  { label: "Projects", value: 10, decimals: 0 },
  { label: "DSA solved", value: 200, decimals: 0 },
  { label: "CGPA", value: 8.7, decimals: 1 },
];

function AnimatedStat({ value, decimals, label, isLast }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const duration = 1200;
          const start = performance.now();
          const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(value * eased);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div
      ref={ref}
      style={{
        flex: 1,
        textAlign: "center",
        padding: "10px 8px",
        borderRight: isLast ? "none" : "0.5px solid var(--border-color)",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
        {decimals ? display.toFixed(decimals) : Math.round(display)}
      </div>
      <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {label}
      </div>
    </div>
  );
}

export default function StatsRow() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        maxWidth: "440px",
        background: "var(--bg-secondary)",
        border: "0.5px solid var(--border-color)",
        borderRadius: "12px",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {STATS.map((stat, i) => (
        <AnimatedStat key={stat.label} {...stat} isLast={i === STATS.length - 1} />
      ))}
    </div>
  );
}
