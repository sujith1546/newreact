import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./CategorySheet.css";

const levelOf = (p) => (p >= 85 ? "Expert" : p >= 70 ? "Advanced" : p >= 50 ? "Intermediate" : "Learning");
const LEVELS = [["Expert", 1], ["Advanced", 0.68], ["Intermediate", 0.42], ["Learning", 0.24]];

// 36 fine tick marks around the gauge (68 x 68 box)
const TICKS = Array.from({ length: 36 }, (_, t) => {
  const a = (t * 10 * Math.PI) / 180;
  return { x1: 34 + 31 * Math.cos(a), y1: 34 + 31 * Math.sin(a), x2: 34 + 33.5 * Math.cos(a), y2: 34 + 33.5 * Math.sin(a) };
});
const R = 29;
const C = 2 * Math.PI * R;

export default function CategorySheet({ category, open, onClose, onSelectSkill, onPrev, onNext }) {
  const [shown, setShown] = useState(category);   // keeps content while the sheet slides out
  const [ready, setReady] = useState(false);      // triggers the fill animations
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const ref = useRef(null);
  const y0 = useRef(null);

  useEffect(() => { if (category) setShown(category); }, [category]);

  // Replay animations whenever the sheet opens or the category changes
  useEffect(() => {
    setReady(false);
    if (!open) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(id);
  }, [open, shown?.key]);

  useEffect(() => { if (open) ref.current?.focus({ preventScroll: true }); }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") onNext?.();
      if (e.key === "ArrowLeft") onPrev?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, onNext, onPrev]);

  const stats = useMemo(() => {
    if (!shown) return null;
    const skills = [...shown.skills].sort((a, b) => b.level - a.level);
    const n = skills.length;
    const avg = Math.round(skills.reduce((a, s) => a + s.level, 0) / (n || 1));
    const projects = skills.reduce((a, s) => a + (s.projects || 0), 0);
    const withExp = skills.filter((s) => s.exp > 0);
    const avgExp = withExp.length ? (withExp.reduce((a, s) => a + s.exp, 0) / withExp.length).toFixed(1) : "—";
    const counts = {};
    skills.forEach((s) => { const l = levelOf(s.level); counts[l] = (counts[l] || 0) + 1; });
    return { skills, n, avg, projects: projects || "—", avgExp, counts };
  }, [shown]);

  // drag-to-close on the handle + header
  const start = (e) => {
    if (e.target.closest(".cs-cb")) return;
    y0.current = e.clientY; setDragging(true); e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => { if (y0.current !== null) setDy(Math.max(0, e.clientY - y0.current)); };
  const end = () => {
    if (y0.current === null) return;
    y0.current = null; setDragging(false);
    if (dy > 100) onClose?.();
    setDy(0);
  };

  if (!shown || !stats) return null;
  const { Icon } = shown;
  const showPager = !!(onPrev || onNext);

  const sheetElement = (
    <>
      <div className={`cs-scrim${open ? " on" : ""}`} onClick={onClose} aria-hidden="true" />
      <section
        ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${shown.name} skills`}
        className="cs-sheet"
        style={{
          "--c": shown.color,
          transform: open ? `translateY(${dy}px)` : "translateY(105%)",
          transition: dragging ? "none" : undefined,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div className="cs-dz" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
          <div className="cs-grab"><div className="cs-pill" /></div>
          <div className="cs-head">
            <span className="cs-ico" aria-hidden="true">
              {Icon ? <Icon size={18} /> : shown.mark || shown.name[0]}
            </span>
            <div className="cs-tt">
              <h2>{shown.name}</h2>
              <p>{stats.n} {stats.n === 1 ? "skill" : "skills"} · <b>{stats.avg}%</b> avg proficiency</p>
            </div>
            {showPager && (
              <>
                <button type="button" className="cs-cb" aria-label="Previous category" onClick={onPrev}>‹</button>
                <button type="button" className="cs-cb" aria-label="Next category" onClick={onNext}>›</button>
              </>
            )}
            <button type="button" className="cs-cb" aria-label="Close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="cs-body" key={shown.key}>
          {/* Summary card */}
          <div className="cs-hero">
            <div className="cs-hr">
              <div className="cs-g">
                <svg viewBox="0 0 68 68" aria-hidden="true">
                  {TICKS.map((t, i) => <line key={i} className="cs-k" {...t} />)}
                  <circle className="cs-t" cx="34" cy="34" r={R} strokeWidth="5" />
                  <circle className="cs-a" cx="34" cy="34" r={R} strokeWidth="5"
                    strokeDasharray={C} strokeDashoffset={ready ? C * (1 - stats.avg / 100) : C} />
                </svg>
                <b>{stats.avg}<small>%</small></b>
              </div>
              <div className="cs-hs">
                <div><b>{stats.n}</b><span>Skills</span></div>
                <div><b>{stats.projects}</b><span>Projects</span></div>
                <div><b>{stats.avgExp}</b><span>Avg exp</span></div>
              </div>
            </div>
            <div className="cs-dist">
              <div className="cs-db" aria-hidden="true">
                {LEVELS.map(([l, op]) => stats.counts[l] ? <i key={l} style={{ flex: stats.counts[l], opacity: op }} /> : null)}
              </div>
              <div className="cs-dl">
                {LEVELS.map(([l, op]) => stats.counts[l] ? (
                  <span key={l}><i style={{ opacity: op }} />{stats.counts[l]} {l}</span>
                ) : null)}
              </div>
            </div>
          </div>

          <div className="cs-lh"><span>All {shown.short || shown.name} skills</span><span>Ranked</span></div>

          <div className="cs-list">
            {stats.skills.map((s, k) => {
              const meta = [];
              if (s.exp) meta.push(`${s.exp} exp`);
              if (s.projects) meta.push(`${s.projects} ${s.projects === 1 ? "project" : "projects"}`);
              return (
                <button
                  key={s.name} type="button" className="cs-row"
                  aria-label={`${s.name}, ${s.level} percent, ${levelOf(s.level)}`}
                  onClick={() => onSelectSkill?.(s, shown)}
                >
                  <span className="cs-rl"><b>{s.name}</b><span>{meta.join(" · ") || "Skill"}</span></span>
                  <span className="cs-rr"><b>{s.level}%</b><em>{levelOf(s.level)}</em></span>
                  <span className="cs-chev" aria-hidden="true">›</span>
                  <span className="cs-bar">
                    <i style={{ width: ready ? `${s.level}%` : 0, transitionDelay: `${250 + k * 70}ms` }} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="cs-ft"><b>✦</b> Tap a skill for deep-dive projects &amp; tools</p>
      </section>
    </>
  );

  return typeof document !== "undefined" ? createPortal(sheetElement, document.body) : null;
}
