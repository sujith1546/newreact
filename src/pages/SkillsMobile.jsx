import { useEffect, useMemo, useState } from "react";
import "./SkillsMobile.css";
import { categoryIconMap } from "../components/ui/skillIcons";

export const CATEGORY_STYLES = {
  languages: { name: "Languages", short: "Languages", color: "#3b82f6", mark: "</>" },
  database:  { name: "Database & Tools", short: "Database", color: "#06b6d4", mark: "DB" },
  ml:        { name: "ML & Data Science", short: "ML & Data", color: "#8b5cf6", mark: "ML" },
  soft:      { name: "Soft Skills", short: "Soft Skills", color: "#10b981", mark: "♥" },
  exploring: { name: "Exploring & Learning", short: "Exploring", color: "#f59e0b", mark: "↗" },
};
const FALLBACK_COLORS = ["#ec4899", "#ef4444", "#14b8a6", "#a855f7"];

// Default categories and skills (level = 0 to 100)
export const CATEGORIES = [
  { key: "languages", name: "Languages", short: "Languages", color: "#3b82f6", mark: "</>",
    skills: [{ name: "Python", level: 92, exp: 3, projects: 14 }, { name: "Java", level: 75, exp: 2, projects: 6 }] },
  { key: "database", name: "Database & Tools", short: "Database", color: "#06b6d4", mark: "DB",
    skills: [{ name: "Git", level: 88, exp: 3, projects: 25 }, { name: "GitHub", level: 88, exp: 3, projects: 25 },
             { name: "SQL", level: 75, exp: 2, projects: 7 }] },
  { key: "ml", name: "ML & Data Science", short: "ML & Data", color: "#8b5cf6", mark: "ML",
    skills: [{ name: "Pandas", level: 95, exp: 3, projects: 15 }, { name: "TensorFlow", level: 90, exp: 2, projects: 5 },
             { name: "NumPy", level: 90, exp: 3, projects: 10 }, { name: "Scikit-learn", level: 85, exp: 3, projects: 8 },
             { name: "PyTorch", level: 86, exp: 2, projects: 6 }] },
  { key: "soft", name: "Soft Skills", short: "Soft Skills", color: "#10b981", mark: "♥",
    skills: [{ name: "Problem Solving", level: 90, exp: 3 }, { name: "Communication", level: 88, exp: 3 }, { name: "Team Collaboration", level: 85, exp: 3 }] },
  { key: "exploring", name: "Exploring & Learning", short: "Exploring", color: "#f59e0b", mark: "↗",
    skills: [{ name: "LangChain", level: 45, projects: 1 }, { name: "Rust", level: 68, projects: 1 }] },
];

/** Convert the live database category shape to the mobile format */
export function toMobileCategories(skillCategories = []) {
  if (!skillCategories || skillCategories.length === 0) return CATEGORIES;
  return skillCategories
    .filter((c) => c.skills && c.skills.length > 0)
    .map((c, i) => {
      const style = CATEGORY_STYLES[c.id] || {
        name: c.title,
        short: c.title,
        color: FALLBACK_COLORS[i % FALLBACK_COLORS.length],
        mark: c.title ? c.title.slice(0, 2) : "*",
      };
      const Icon = categoryIconMap[c.id] || null;
      return {
        key: c.id,
        ...style,
        Icon,
        source: c,
        skills: c.skills.map((s) => {
          const expNum = typeof s.years === 'number'
            ? s.years
            : parseFloat(String(s.years || '').replace(/[^0-9.]/g, '')) || 0;
          const projNum = typeof s.projectCount === 'number'
            ? s.projectCount
            : (Array.isArray(s.projects) ? s.projects.length : (parseInt(s.projectCount, 10) || 0));

          return {
            name: s.name,
            level: Math.min(Math.max(Number(s.percent) || 0, 0), 100),
            exp: expNum,
            projects: projNum,
            raw: s,
          };
        }),
      };
    });
}

/* ---------- helpers ---------- */
const avg = (c) => Math.round(c.skills.reduce((a, s) => a + s.level, 0) / c.skills.length);
export const levelOf = (p) => (p >= 85 ? "Expert" : p >= 70 ? "Advanced" : p >= 50 ? "Intermediate" : "Learning");

const pt = (a, r) => {
  const t = (a * Math.PI) / 180;
  return { x: 180 + r * Math.cos(t), y: 180 + r * Math.sin(t) };
};
const arcPath = (a0, a1, r) => {
  const p = pt(a0, r), q = pt(a1, r);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${p.x} ${p.y}A${r} ${r} 0 ${large} 1 ${q.x} ${q.y}`;
};

// 60 fine tick marks on the inner edge of the ring (every 5th is a major tick)
const TICKS = Array.from({ length: 60 }, (_, t) => {
  const a = t * 6 - 90, major = t % 5 === 0;
  return { p: pt(a, major ? 113 : 117), q: pt(a, 122), major };
});

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function SkillsMobile({ categories = CATEGORIES, selectedKey = null, onSelectCategory, showIntro = true }) {
  const [hover, setHover] = useState(null);
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState(0);

  const { avgs, raw, total, overall, best } = useMemo(() => {
    const avgs = categories.map(avg);
    const sum = avgs.reduce((a, b) => a + b, 0) || 1;
    return {
      avgs,
      raw: avgs.map((a) => (a / sum) * 100), // slice size = share of the circle
      total: categories.reduce((a, c) => a + c.skills.length, 0),
      overall: Math.round(sum / categories.length),
      best: avgs.indexOf(Math.max(...avgs)),
    };
  }, [categories]);

  // Sweep-in trigger
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  // Count the overall number up from 0
  useEffect(() => {
    if (prefersReducedMotion()) { setCount(overall); return; }
    let raf, t0 = null;
    const tick = (t) => {
      if (t0 === null) t0 = t;
      const p = Math.min(1, (t - t0) / 1200);
      setCount(Math.round(overall * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [overall]);

  const slices = useMemo(() => {
    let cur = -90;
    return categories.map((c, i) => {
      const a0 = cur, a1 = cur + raw[i] * 3.6, mid = (a0 + a1) / 2, m = (mid * Math.PI) / 180;
      cur = a1;
      return { c, i, d: arcPath(a0, a1, 140), s0: pt(a0, 128), s1: pt(a0, 152), tx: Math.cos(m) * 6, ty: Math.sin(m) * 6 };
    });
  }, [categories, raw]);

  const selectedIndex = categories.findIndex((c) => c.key === selectedKey);
  const selected = selectedIndex >= 0 ? selectedIndex : null;
  const active = selected ?? hover;
  const ac = active !== null ? categories[active] : null;

  const pick = (i) => onSelectCategory?.(categories[i], i);
  const onKey = (i) => (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(i); }
  };

  return (
    <main className="sp">
      {showIntro && (
        <header className="sp-intro">
          <h1>Tech Stack &amp; Proficiencies</h1>
          <p>{total} skills across {categories.length} areas. Tap a slice to explore.</p>
        </header>
      )}

      <div className="sp-wrap">
        <div className={`sp-chart${selected !== null ? " dim" : ""}`}>
          <svg viewBox="0 0 360 360" role="group" aria-label="Skill areas">
            <circle className="sp-disc" cx="180" cy="180" r="128" />
            {TICKS.map((t, k) => (
              <line key={k} className="sp-tk" x1={t.p.x} y1={t.p.y} x2={t.q.x} y2={t.q.y} style={{ opacity: t.major ? 1 : 0.55 }} />
            ))}
            {slices.map(({ c, i, d, s0, s1, tx, ty }) => (
              <g
                key={c.key}
                className={`sp-seg${selected === i ? " sel" : ""}`}
                tabIndex={0} role="button"
                aria-label={`${c.short}, average proficiency ${avgs[i]} percent`}
                style={{ "--c": c.color, "--tx": `${tx}px`, "--ty": `${ty}px` }}
                onClick={() => pick(i)} onKeyDown={onKey(i)}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              >
                <path className="sp-f" d={d} pathLength="100"
                  style={{ strokeDashoffset: ready ? 0 : 100, transitionDelay: `${i * 140}ms` }} />
                <line className="sp-sep" x1={s0.x} y1={s0.y} x2={s1.x} y2={s1.y} />
                <path className="sp-hit" d={d} />
              </g>
            ))}
          </svg>

          <div className="sp-center">
            <span className="sp-cn" style={ac ? { color: ac.color } : undefined}>{ac ? ac.short : "Overall"}</span>
            <span className="sp-cp">{ac ? avgs[active] : count}<small>%</small></span>
            <span className="sp-cs">
              {ac ? `${ac.skills.length} skills · ${levelOf(avgs[active])}` : `${total} skills · ${categories.length} areas`}
            </span>
          </div>
        </div>
      </div>

      <div className="sp-insight" style={{ "--ic": categories[best]?.color }}>
        <i />Strongest area <b>{categories[best]?.short}</b> · <b>{avgs[best]}%</b>
      </div>

      <div className="sp-pills">
        {categories.map((c, i) => (
          <button
            key={c.key} type="button" className={`sp-p${selected === i ? " sel" : ""}`}
            style={{ "--c": c.color }} onClick={() => pick(i)}
            aria-label={`${c.short}, average ${avgs[i]} percent, ${c.skills.length} skills`}
          >
            <span className="sp-pt"><i />{c.short}<em>{c.skills.length}</em></span>
            <span className="sp-pb">
              <b>{avgs[i]}%</b>
              <span className="sp-bar"><i style={{ width: ready ? `${avgs[i]}%` : 0 }} /></span>
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
