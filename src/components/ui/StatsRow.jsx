import { useEffect, useRef, useState } from "react";

const STATS = [
  { label: "YEARS CODING", value: 3.5, decimals: 1, suffix: "yrs" },
  { label: "PROJECTS SHIPPED", value: 10, decimals: 0 },
  { label: "DSA SOLVED", value: 200, decimals: 0 },
  { label: "CGPA", value: 8.7, decimals: 1, suffix: "/10" },
];

function AnimatedStat({ value, decimals, suffix, label, isLast }) {
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
      className={`stats-card-item ${isLast ? 'last-item' : ''}`}
      style={{
        flex: "1 1 0px",
        padding: "10px 16px",
        borderRight: isLast ? "none" : "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "4px",
          lineHeight: 1.1,
          marginBottom: "3px",
        }}
      >
        <span
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            fontFamily: "var(--app-font, system-ui, sans-serif)",
          }}
        >
          {decimals ? display.toFixed(decimals) : Math.round(display)}
        </span>
        {suffix && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#0f766e",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}
          >
            {suffix}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: "10px",
          fontWeight: 600,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
          color: "var(--text-muted)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function StatsRow() {
  return (
    <div
      className="stats-row-container"
      style={{
        display: "flex",
        flexWrap: "nowrap",
        width: "100%",
        maxWidth: "600px",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        overflow: "hidden",
        boxSizing: "border-box",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      }}
    >
      <style>{`
        @media (max-width: 600px) {
          .stats-row-container {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
          }
          .stats-card-item {
            border-right: 1px solid var(--border-color) !important;
            border-bottom: 1px solid var(--border-color) !important;
            padding: 10px 14px !important;
          }
          .stats-card-item:nth-child(2n) {
            border-right: none !important;
          }
          .stats-card-item:nth-child(3), .stats-card-item:nth-child(4) {
            border-bottom: none !important;
          }
        }
      `}</style>
      {STATS.map((stat, i) => (
        <AnimatedStat key={stat.label} {...stat} isLast={i === STATS.length - 1} />
      ))}
    </div>
  );
}


