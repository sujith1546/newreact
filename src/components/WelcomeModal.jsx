import { useEffect, useRef, useState } from "react";
import { X, Lightbulb } from "lucide-react";
import { FaEnvelope, FaLinkedin, FaInstagram } from "react-icons/fa";

const PRO_TIPS = [
  "Double-click my profile photo to view it large.",
  "Try asking the Atom AI chatbot in the bottom right!",
  "Press Cmd+K or click the ⌘K pill to open Command Search.",
  "Hit the moon icon up top to switch to dark mode.",
];

const LOADING_PHRASES = [
  "Loading portfolio...",
  "Initializing RAG AI...",
  "Fetching projects...",
  "Welcome visitor!"
];

const SOCIAL_LINKS = [
  { label: "Email", href: "mailto:sujithreddy1546@gmail.com", icon: "mail" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/thota-sujith-reddy-88a650275/", icon: "linkedin" },
  { label: "Instagram", href: "https://www.instagram.com/sujith_1546/", icon: "instagram" },
];

const SHORTCUTS_HINT = "Esc to close • Enter to view projects";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "GOOD MORNING";
  if (hour < 17) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

function useVisitInfo() {
  const [visitCount, setVisitCount] = useState(1);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const key = "portfolio_visit_count";
    const prev = parseInt(localStorage.getItem(key) || "0", 10);
    const next = prev + 1;
    localStorage.setItem(key, String(next));
    setVisitCount(next);
    setIsFirstVisit(prev === 0);
  }, []);

  return { visitCount, isFirstVisit };
}

export default function WelcomeModal({ onNavClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [typed, setTyped] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [tipsPaused, setTipsPaused] = useState(false);
  const cardRef = useRef(null);
  const { visitCount, isFirstVisit } = useVisitInfo();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("welcome_dismissed_forever") === "true") return;
    setIsOpen(true);
  }, []);

  // Typewriter typing & erasing effect (matches home page logic)
  useEffect(() => {
    if (!isOpen) return;
    const currentPhrase = LOADING_PHRASES[phraseIndex];
    let timer;

    if (isDeleting) {
      // Fast, mechanical delete speed
      timer = setTimeout(() => {
        setTyped(currentPhrase.substring(0, typed.length - 1));
        if (typed.length === 0) {
          setIsDeleting(false);
          setPhraseIndex((phraseIndex + 1) % LOADING_PHRASES.length);
        }
      }, 30);
    } else {
      // Variable typing speed simulating a human (between 40ms and 110ms)
      const humanize = Math.random() * 70 + 40;
      timer = setTimeout(() => {
        setTyped(currentPhrase.substring(0, typed.length + 1));
        if (typed.length === currentPhrase.length) {
          timer = setTimeout(() => setIsDeleting(true), 2000); // Pause for 2s before erasing
        }
      }, humanize);
    }
    return () => clearTimeout(timer);
  }, [isOpen, typed, isDeleting, phraseIndex]);

  // Rotate pro tips every 3.5s, paused while the user is hovering the tip box
  useEffect(() => {
    if (!isOpen || tipsPaused) return;
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % PRO_TIPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen, tipsPaused]);

  // Escape to close, lock scroll, basic focus trap
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    cardRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "Enter" && document.activeElement === cardRef.current) {
        handleClose();
        onNavClick?.("projects");
      }
      if (e.key === "Tab" && cardRef.current) {
        const focusables = cardRef.current.querySelectorAll(
          "button, input, [tabindex], a"
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("welcome_dismissed_forever", "true");
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      role="presentation"
      className="welcome-overlay"
    >
      {isMobile ? (
        <div
          ref={cardRef}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
          onClick={(e) => e.stopPropagation()}
          className="mc-welcome-card"
        >
          {/* Header */}
          <div className="mc-welcome-header">
            <div className="mc-welcome-top-row">
              <div className="mc-welcome-avatar">TS</div>
              <button className="mc-welcome-close" onClick={handleClose}><X size={16} /></button>
            </div>
            
            <div className="mc-welcome-greeting">{getGreeting()}</div>
            <h2 id="welcome-title" className="mc-welcome-name">Hey, I'm Sujith.</h2>
            <p className="mc-welcome-intro">CS undergrad building ML pipelines and full-stack apps. Welcome to my portfolio.</p>

            <div className="mc-welcome-status">
              <span className="mc-welcome-status-dot" />
              <span className="mc-welcome-status-text">available for opportunities</span>
              {visitCount > 0 && (
                <>
                  <span className="mc-welcome-status-muted">·</span>
                  <span className="mc-welcome-status-muted">visit #{visitCount}</span>
                </>
              )}
            </div>
          </div>

          <div className="mc-welcome-divider" />

          {/* Stats */}
          <div className="mc-welcome-stats">
            <div className="mc-welcome-stat-col">
              <div className="mc-welcome-stat-val">6+</div>
              <div className="mc-welcome-stat-lbl">projects</div>
            </div>
            <div className="mc-welcome-stat-col">
              <div className="mc-welcome-stat-val">2y</div>
              <div className="mc-welcome-stat-lbl">experience</div>
            </div>
            <div className="mc-welcome-stat-col">
              <div className="mc-welcome-stat-val">5</div>
              <div className="mc-welcome-stat-lbl">languages</div>
            </div>
          </div>

          <div className="mc-welcome-divider" />

          {/* Pro tip */}
          <div className="mc-welcome-tip">
            <Lightbulb size={16} className="mc-welcome-tip-icon" />
            <div className="mc-welcome-tip-content">
              <div className="mc-welcome-tip-text">Double-click my profile photo to view it large.</div>
              <div className="mc-welcome-tip-bar-bg">
                <div className="mc-welcome-tip-bar-fill" style={{ width: '38%' }} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mc-welcome-actions">
            <div className="mc-welcome-btn-row">
              <button className="mc-welcome-btn-pri" onClick={() => { handleClose(); onNavClick?.("projects"); }}>
                View projects
              </button>
              <button className="mc-welcome-btn-sec" onClick={handleClose}>
                Explore freely
              </button>
            </div>

            <div className="mc-welcome-footer-row">
              <label className="mc-welcome-checkbox-lbl">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  style={{ width: 13, height: 13, accentColor: 'var(--text-primary)' }}
                />
                Don't show again
              </label>
              <div className="mc-welcome-socials">
                {SOCIAL_LINKS.map(link => (
                  <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="mc-welcome-social" aria-label={link.label}>
                    {link.icon === "mail" ? <FaEnvelope size={14} /> : link.icon === "linkedin" ? <FaLinkedin size={14} /> : <FaInstagram size={14} />}
                  </a>
                ))}
              </div>
            </div>
            <div className="mc-welcome-hint">
              esc to close &nbsp;·&nbsp; enter to view projects
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={cardRef}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
          onClick={(e) => e.stopPropagation()}
          className="welcome-card"
        >
        {/* First-visit confetti dots */}
        {isFirstVisit && (
          <div className="welcome-confetti-container">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className="welcome-confetti-dot"
                style={{
                  left: `${8 + i * 9}%`,
                  top: "-6px",
                  animationDelay: `${i * 60}ms`,
                  background: ["#3b82f6", "#22c55e", "#f59e0b"][i % 3],
                }}
              />
            ))}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close welcome dialog"
          className="welcome-close-x"
        >
          <X size={16} />
        </button>

        {/* Status pill */}
        <div className="welcome-status-badge">
          <div className="welcome-status-dot-wrap">
            <div className="welcome-status-dot" />
          </div>
          <span>
            {isFirstVisit ? "Available for Opportunities" : `Available for Opportunities • Visit #${visitCount}`}
          </span>
        </div>

        {/* Eyebrow + headline */}
        <p className="welcome-eyebrow">
          {getGreeting()}
        </p>
        <h2 id="welcome-title" className="welcome-headline">
          Hey, I'm Sujith
        </h2>

        {/* Terminal-style typed badge */}
        <div className="welcome-terminal-badge">
          <span>&gt;_</span>
          <span>{typed}</span>
          <span className="welcome-terminal-cursor" />
        </div>

        {/* Pro tips, auto-rotating, pausable, manually navigable */}
        <div
          onMouseEnter={() => setTipsPaused(true)}
          onMouseLeave={() => setTipsPaused(false)}
          className="welcome-tip-card"
        >
          <div className="welcome-tip-header">
            <p className="welcome-tip-title">💡 Pro tip</p>
            <div className="welcome-tip-nav">
              <button
                onClick={() =>
                  setTipIndex((i) => (i - 1 + PRO_TIPS.length) % PRO_TIPS.length)
                }
                aria-label="Previous tip"
                className="welcome-tip-nav-btn"
              >
                ‹
              </button>
              <button
                onClick={() => setTipIndex((i) => (i + 1) % PRO_TIPS.length)}
                aria-label="Next tip"
                className="welcome-tip-nav-btn"
              >
                ›
              </button>
            </div>
          </div>
          <p className="welcome-tip-text">
            {PRO_TIPS[tipIndex]}
          </p>
          <div className="welcome-tip-dots">
            {PRO_TIPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setTipIndex(i)}
                aria-label={`Go to tip ${i + 1}`}
                className={`welcome-tip-dot ${i === tipIndex ? "active" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="welcome-cta-row">
          <button
            onClick={() => {
              handleClose();
              onNavClick?.("projects");
            }}
            className="welcome-btn-primary"
          >
            View projects
          </button>
          <button
            onClick={handleClose}
            className="welcome-btn-secondary"
          >
            Explore freely
          </button>
        </div>

        {/* Don't show again + quick social links */}
        <div className="welcome-footer">
          <label className="welcome-checkbox-label">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="welcome-checkbox"
            />
            Don't show this again
          </label>

          <div className="welcome-socials">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                className="welcome-social-link"
              >
                {link.icon === "mail" ? (
                  <FaEnvelope size={14} />
                ) : link.icon === "linkedin" ? (
                  <FaLinkedin size={14} />
                ) : (
                  <FaInstagram size={14} />
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Keyboard shortcut hint */}
        <p className="welcome-shortcut-hint">{SHORTCUTS_HINT}</p>
      </div>
      )}

      <style>{`
        .welcome-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 16px;
          animation: fadeIn 0.25s ease-out forwards;
        }

        .welcome-card {
          position: relative;
          width: 92%;
          max-width: 460px;
          border-radius: 20px;
          background: var(--bg-secondary, #ffffff);
          color: var(--text-primary);
          border: 1px solid rgba(128, 128, 128, 0.2);
          padding: 32px 28px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
          outline: none;
          animation: scaleIn 0.3s ease-out forwards;
        }

        [data-theme="dark"] .welcome-card {
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .welcome-confetti-container {
          pointer-events: none;
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: 20px;
        }

        .welcome-confetti-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: confetti 1.2s ease-out forwards;
        }

        .welcome-close-x {
          position: absolute;
          right: 16px;
          top: 16px;
          display: flex;
          width: 32px;
          height: 32px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .welcome-close-x:hover {
          background: rgba(128, 128, 128, 0.1);
          color: var(--text-primary);
        }

        .welcome-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
          width: fit-content;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          cursor: default;
        }

        .welcome-status-badge:hover {
          border-color: #10b981;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.12);
          transform: translateY(-1px);
        }

        /* Premium Shine Sweep Effect */
        .welcome-status-badge::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          transform: skewX(-20deg);
          animation: welcomeShine 5s infinite;
          pointer-events: none;
        }
        [data-theme="dark"] .welcome-status-badge::before {
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
        }
        @keyframes welcomeShine {
          0% { left: -100%; }
          15% { left: 200%; }
          100% { left: 200%; }
        }

        /* Advanced Radar Ripple */
        .welcome-status-dot-wrap {
          position: relative;
          width: 8px;
          height: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .welcome-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981; 
          z-index: 2;
        }
        .welcome-status-dot-wrap::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #10b981;
          animation: welcomeRipple 2s infinite cubic-bezier(0.19, 1, 0.22, 1);
          z-index: 1;
        }
        @keyframes welcomeRipple {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(3.5); opacity: 0; }
        }

        .welcome-eyebrow {
          margin-bottom: 4px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          opacity: 0.8;
        }

        .welcome-headline {
          margin-bottom: 12px;
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.5px;
        }

        .welcome-terminal-badge {
          margin-bottom: 16px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 6px;
          background: rgba(59, 130, 246, 0.08);
          padding: 6px 12px;
          font-family: monospace;
          font-size: 13.5px;
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.15);
        }

        .welcome-terminal-cursor {
          display: inline-block;
          height: 14px;
          width: 2px;
          background-color: #3b82f6;
          animation: blink 1s step-end infinite;
        }

        .welcome-tip-card {
          margin-bottom: 24px;
          border-radius: 12px;
          border: 1px solid rgba(245, 158, 11, 0.2);
          background: rgba(245, 158, 11, 0.06);
          padding: 14px 18px;
          text-align: left;
        }

        .welcome-tip-header {
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .welcome-tip-title {
          font-size: 12px;
          font-weight: 600;
          color: #d97706;
        }

        .welcome-tip-nav {
          display: flex;
          gap: 4px;
        }

        .welcome-tip-nav-btn {
          border-radius: 4px;
          border: none;
          background: transparent;
          padding: 0 4px;
          color: #d97706;
          cursor: pointer;
          font-weight: 700;
          transition: background 0.2s;
        }

        .welcome-tip-nav-btn:hover {
          background: rgba(245, 158, 11, 0.15);
        }

        .welcome-tip-text {
          font-size: 13px;
          color: var(--text-primary);
          line-height: 1.4;
          white-space: nowrap;
        }

        @media (max-width: 480px) {
          .welcome-tip-text {
            white-space: normal;
          }
        }

        .welcome-tip-dots {
          margin-top: 10px;
          display: flex;
          gap: 4px;
        }

        .welcome-tip-dot {
          height: 4px;
          flex: 1;
          border-radius: 9999px;
          border: none;
          background-color: rgba(245, 158, 11, 0.2);
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .welcome-tip-dot.active {
          background-color: #d97706;
        }

        .welcome-cta-row {
          margin-bottom: 16px;
          display: flex;
          gap: 12px;
        }

        .welcome-btn-primary {
          flex: 1;
          border-radius: 10px;
          background: var(--text-primary);
          color: var(--bg-primary);
          border: none;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .welcome-btn-primary:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .welcome-btn-secondary {
          flex: 1;
          border-radius: 10px;
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .welcome-btn-secondary:hover {
          background: rgba(128, 128, 128, 0.08);
          transform: translateY(-1px);
        }

        .welcome-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .welcome-checkbox-label {
          display: flex;
          cursor: pointer;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .welcome-checkbox {
          width: 14px;
          height: 14px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background: transparent;
          cursor: pointer;
        }

        .welcome-socials {
          display: flex;
          gap: 8px;
        }

        .welcome-social-link {
          display: flex;
          width: 28px;
          height: 28px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .welcome-social-link:hover {
          border-color: var(--text-primary);
          color: var(--text-primary);
          transform: scale(1.05);
        }

        .welcome-shortcut-hint {
          text-align: center;
          font-size: 11px;
          color: var(--text-muted);
          opacity: 0.7;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes confetti {
          from { transform: translateY(0) rotate(0deg); opacity: 1; }
          to { transform: translateY(260px) rotate(180deg); opacity: 0; }
        }

        @keyframes blink {
          50% { opacity: 0; }
        }

        /* ── MOBILE EDITORIAL REDESIGN ── */
        @media (max-width: 900px) {
          .mc-welcome-card {
            width: 100%; max-width: 380px;
            background: var(--bg-secondary);
            border-radius: 24px;
            border: 0.5px solid var(--border-color);
            overflow: hidden;
            display: flex; flex-direction: column;
            animation: scaleIn 0.3s ease-out forwards;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
          }
          [data-theme="dark"] .mc-welcome-card {
            background: var(--bg-primary); /* surface-2 equivalent */
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
          }
          
          .mc-welcome-header { padding: 22px 22px 0; }
          .mc-welcome-top-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
          .mc-welcome-avatar {
            width: 56px; height: 56px; border-radius: 16px;
            background: var(--bg-primary); /* surface-1 equivalent */
            border: 1px solid var(--border-color);
            display: flex; align-items: center; justify-content: center;
            font-size: 18px; font-weight: 600; color: var(--text-primary);
          }
          [data-theme="dark"] .mc-welcome-avatar { background: var(--bg-secondary); }
          
          .mc-welcome-close {
            background: none; border: none; cursor: pointer; color: var(--text-muted);
            padding: 4px; display: flex; align-items: center; justify-content: center;
          }
          .mc-welcome-greeting { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; text-transform: lowercase; }
          .mc-welcome-name {
            font-family: var(--font-voice, 'Playfair Display', serif);
            font-size: 30px; font-weight: 400; line-height: 1.15; margin: 0 0 6px;
            color: var(--text-primary);
          }
          .mc-welcome-intro { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 18px; }
          .mc-welcome-status { display: flex; align-items: center; gap: 6px; margin-bottom: 18px; }
          .mc-welcome-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #1D9E75; }
          .mc-welcome-status-text { font-size: 12px; color: var(--text-secondary); }
          .mc-welcome-status-muted { font-size: 12px; color: var(--text-muted); }

          .mc-welcome-divider { height: 0.5px; background: var(--border-color); margin: 0 22px; }
          
          .mc-welcome-stats { padding: 16px 22px; display: flex; }
          .mc-welcome-stat-col { flex: 1; text-align: left; }
          .mc-welcome-stat-col:not(:first-child) { border-left: 0.5px solid var(--border-color); padding-left: 16px; }
          .mc-welcome-stat-val { font-size: 18px; font-weight: 600; color: var(--text-primary); line-height: 1.2; }
          .mc-welcome-stat-lbl { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }

          .mc-welcome-tip { padding: 16px 22px; display: flex; gap: 10px; align-items: flex-start; }
          .mc-welcome-tip-icon { color: var(--text-muted); margin-top: 2px; }
          .mc-welcome-tip-content { flex: 1; }
          .mc-welcome-tip-text { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
          .mc-welcome-tip-bar-bg { height: 2px; background: var(--border-color); border-radius: 2px; margin-top: 8px; overflow: hidden; }
          .mc-welcome-tip-bar-fill { height: 100%; background: var(--text-primary); border-radius: 2px; transition: width 0.3s ease; }

          .mc-welcome-actions { padding: 4px 22px 22px; }
          .mc-welcome-btn-row { display: flex; gap: 8px; margin-bottom: 16px; }
          .mc-welcome-btn-pri {
            flex: 1; background: var(--primary-blue, #3b82f6); color: #fff; border: none;
            font-size: 13.5px; font-weight: 600; padding: 12px; border-radius: 12px; cursor: pointer; outline: none;
          }
          .mc-welcome-btn-sec {
            flex: 1; background: transparent; color: var(--text-primary); border: 0.5px solid var(--border-color);
            font-size: 13.5px; font-weight: 600; padding: 12px; border-radius: 12px; cursor: pointer; outline: none;
          }
          .mc-welcome-footer-row { display: flex; align-items: center; justify-content: space-between; }
          .mc-welcome-checkbox-lbl { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted); cursor: pointer; }
          .mc-welcome-socials { display: flex; gap: 14px; }
          .mc-welcome-social { color: var(--text-secondary); }
          .mc-welcome-hint { text-align: center; font-size: 10px; color: var(--text-muted); margin-top: 14px; }
        }
      `}</style>
    </div>
  );
}
