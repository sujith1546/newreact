import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ScrollReveal from '../components/ScrollReveal';
import { 
  ExternalLink, Code2, X, ChevronRight, ChevronDown, Star,
  MessageSquare, Database, ShieldCheck, TrendingUp,
  Newspaper, Brain, Eye, Smile, Receipt, Sliders, Layers,
  Sparkles, Layout, Cpu, Trees, ArrowRight, ChevronLeft
} from 'lucide-react';
import { FaGithub, FaPython, FaReact } from 'react-icons/fa';
import { projectsData } from '../data/projectsData';
import { motion, AnimatePresence } from 'framer-motion';
import { useLongPress } from '../hooks/useLongPress';

const pipelineIconMap = {
  MessageSquare: MessageSquare,
  Database: Database,
  ShieldCheck: ShieldCheck,
  TrendingUp: TrendingUp,
  Newspaper: Newspaper,
  Brain: Brain,
  Eye: Eye,
  Smile: Smile,
  Receipt: Receipt,
  Sliders: Sliders,
  Layers: Layers
};

const tagIconMap = {
  "Python": FaPython,
  "TensorFlow": Cpu,
  "Scikit-learn": Sliders,
  "React": FaReact,
  "FastAPI": Cpu,
  "Streamlit": Layout,
  "ChromaDB": Database,
  "Gemini API": Sparkles,
  "RAG": Database,
  "NLP": Brain,
  "Machine Learning": Brain,
  "LightGBM": Sliders,
  "XGBoost": Sliders,
  "Random Forest": Trees
};

/* ─── Count-up hook ──────────────────────────────────────────── */
function useCountUp(target, decimals = 0, active = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf;
    const duration = 900;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);
  return value.toFixed(decimals);
}

function StatCard({ stat, active }) {
  const display = useCountUp(stat.value, stat.decimals ?? 0, active);
  return (
    <div className="ps-stat">
      <p className="ps-stat-label">{stat.label}</p>
      <p className="ps-stat-value">{stat.prefix}{display}{stat.suffix}</p>
    </div>
  );
}

/* ─── Desktop ProjectCard (unchanged behaviour) ─────────────── */
function ProjectCard({ project, onCardClick }) {
  const cardRef = useRef(null);
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };
  return (
    <div className="project-card" ref={cardRef} onMouseMove={handleMouseMove} onClick={() => onCardClick?.(project)}>
      <div className="project-image-area">
        <div className="mesh-gradient" />
        {project.image
          ? <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, position: 'relative' }} />
          : <Code2 size={40} className="project-image-icon" />}
      </div>
      <div className="project-content">
        <div className="project-title-row">
          <h3 className="project-title">{project.title}</h3>
          {project.liveUrl && (
            <div className="live-badge">
              <span className="live-dot"><span className="live-ping" /><span className="live-dot-core" /></span>
              <span className="live-text">Live</span>
            </div>
          )}
        </div>
        <p className="project-desc">{project.description}</p>
        <div className="project-tags">
          {project.tags.slice(0, 3).map(tag => <span key={tag} className="project-tag">{tag}</span>)}
          {project.tags.length > 3 && <span className="project-tag">+{project.tags.length - 3}</span>}
        </div>
        <div className="project-links" onClick={e => e.stopPropagation()}>
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="project-link">
              <FaGithub size={14} /> Code
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="project-link project-link--live">
              <ExternalLink size={14} /> Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile Project Row card ────────────────────────────────── */
const projectAccents = ['#007bff', '#8b5cf6', '#16a34a'];

function MobileProjectRow({ project, index, onTap, onLongPress }) {
  const accent = projectAccents[index % projectAccents.length];
  const initials = project.title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  
  const longPressProps = useLongPress({
    onLongPress: () => onLongPress(project),
    onClick: () => onTap(project)
  });

  return (
    <motion.button
      className="mpj-row"
      {...longPressProps}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.97 }}
    >
      {/* left accent stripe */}
      <div className="mpj-stripe" style={{ background: accent }} />

      {/* icon badge */}
      <div className="mpj-icon" style={{ background: accent + '18', color: accent, borderColor: accent + '30' }}>
        {initials}
      </div>

      {/* text body */}
      <div className="mpj-body">
        <div className="mpj-title-row">
          <h3 className="mpj-title">{project.title}</h3>
          {project.liveUrl && (
            <div className="live-badge">
              <span className="live-dot"><span className="live-ping" /><span className="live-dot-core" /></span>
              <span className="live-text">Live</span>
            </div>
          )}
        </div>
        <p className="mpj-desc">{project.description.slice(0, 88)}…</p>
        <div className="mpj-tags">
          {project.tags.slice(0, 3).map(t => (
            <span key={t} className="mpj-tag" style={{ color: accent, borderColor: accent + '28', background: accent + '10' }}>{t}</span>
          ))}
          {project.tags.length > 3 && <span className="mpj-tag" style={{ color: accent, borderColor: accent + '28', background: accent + '10' }}>+{project.tags.length - 3}</span>}
        </div>
      </div>

      {/* right chevron */}
      <ChevronRight size={15} className="mpj-chevron" />
    </motion.button>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function Projects() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tab, setTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [sheetScrolled, setSheetScrolled] = useState(false);
  const [sheetScrollable, setSheetScrollable] = useState(false);
  const [contextMenuProject, setContextMenuProject] = useState(null);
  const detailsSheetRef = useRef(null);
  const sheetContentRef = useRef(null);

  const accent = selectedProject 
    ? (projectAccents[projectsData.indexOf(selectedProject) % projectAccents.length] || '#3b82f6')
    : '#3b82f6';

  useEffect(() => {
    if (selectedProject) {
      setTab('overview');
      setSheetScrolled(false);
      setSheetScrollable(false);
      setTimeout(() => {
        if (sheetContentRef.current) {
          const { scrollHeight, clientHeight } = sheetContentRef.current;
          setSheetScrollable(scrollHeight > clientHeight + 5);
        }
      }, 200);
    }
  }, [selectedProject]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedProject(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject]);

  const copyCode = () => {
    if (!selectedProject?.code) return;
    navigator.clipboard.writeText(selectedProject.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ScrollReveal className="wide-content">
      <style>{`
        /* ========== LIVE BADGE ========== */
        .live-badge {
          display: flex; align-items: center; gap: 6px;
          padding: 4px 8px;
          background: rgba(16,185,129,.08);
          border: 1px solid rgba(16,185,129,.2);
          border-radius: 20px; font-size: 9.5px; font-weight: 800;
          letter-spacing: .08em; text-transform: uppercase; color: #10b981;
          flex-shrink: 0;
        }
        [data-theme="dark"] .live-badge { background: rgba(16,185,129,.15); }
        .live-dot { position: relative; display: flex; width: 5px; height: 5px; }
        .live-dot-core { position: relative; display: inline-flex; border-radius: 50%; height: 5px; width: 5px; background: #10b981; z-index: 2; }
        .live-ping { position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 50%; background: #10b981; opacity: .8; animation: radarPing 2s cubic-bezier(0,0,.2,1) infinite; z-index: 1; }
        @keyframes radarPing { 75%, 100% { transform: scale(2.8); opacity: 0; } }

        /* ========== MESH GRADIENT (shared) ========== */
        .mesh-gradient {
          position: absolute; width: 200%; height: 200%;
          background: radial-gradient(circle at 50% 50%, rgba(59,130,246,.15), transparent 60%),
                      radial-gradient(circle at 80% 20%, rgba(16,185,129,.15), transparent 50%);
          animation: meshFlow 10s ease infinite alternate;
        }
        @keyframes meshFlow {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(-20%,-20%) scale(1.1); }
        }

        /* ========== DESKTOP GRID ========== */
        .projects-header { margin-bottom: 32px; text-align: left; }
        .projects-header h1 { font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px; }
        .projects-header p { font-size: 14.5px; color: var(--text-secondary); max-width: 600px; line-height: 1.5; margin: 0; }
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .project-card {
          background: rgba(255,255,255,.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0,0,0,.06); border-radius: 20px; overflow: hidden;
          display: flex; flex-direction: column; position: relative;
          transition: transform .3s ease, border-color .3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,.02); cursor: pointer;
        }
        .project-card::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          border-radius: inherit;
          background: radial-gradient(400px circle at var(--mouse-x,-500px) var(--mouse-y,-500px), rgba(255,255,255,.8), transparent 40%);
          opacity: 0; transition: opacity .3s; pointer-events: none; z-index: 0;
        }
        [data-theme="dark"] .project-card { background: rgba(30,30,30,.4); border-color: rgba(255,255,255,.08); }
        [data-theme="dark"] .project-card::before { background: radial-gradient(400px circle at var(--mouse-x,-500px) var(--mouse-y,-500px), rgba(255,255,255,.08), transparent 40%); }
        .project-card:hover { transform: translateY(-2px); border-color: rgba(0,0,0,.15); box-shadow: 0 12px 30px -10px rgba(0,0,0,.08); }
        [data-theme="dark"] .project-card:hover { border-color: rgba(255,255,255,.2); box-shadow: 0 12px 30px -10px rgba(0,0,0,.3); }
        .project-card:hover::before { opacity: 1; }
        .project-image-area {
          width: 100%; height: 140px;
          background: linear-gradient(120deg, #e0e7ff 0%, #dcfce7 100%);
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          border-bottom: 1px solid rgba(0,0,0,.03); z-index: 1;
        }
        [data-theme="dark"] .project-image-area { background: linear-gradient(120deg,#1e1b4b 0%,#064e3b 100%); border-bottom-color: rgba(255,255,255,.05); }
        .project-image-icon { color: rgba(0,0,0,.15); }
        [data-theme="dark"] .project-image-icon { color: rgba(255,255,255,.08); }
        .project-content { padding: 20px; display: flex; flex-direction: column; flex-grow: 1; z-index: 1; }
        .project-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .project-title { font-size: 17px; font-weight: 700; color: var(--text-primary); margin: 0; letter-spacing: -.01em; }
        .project-desc { font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 16px; flex-grow: 1; }
        .project-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
        .project-tag { font-size: 11px; font-weight: 600; padding: 3px 8px; background: rgba(59,130,246,.06); color: var(--primary-blue); border-radius: 4px; border: 1px solid rgba(59,130,246,.12); }
        [data-theme="dark"] .project-tag { background: rgba(59,130,246,.1); border-color: rgba(59,130,246,.25); }
        .project-links {
          display: flex; gap: 16px;
          border-top: 1px solid rgba(0,0,0,.06);
          padding-top: 14px; margin-top: auto;
        }
        [data-theme="dark"] .project-links { border-top-color: rgba(255,255,255,.08); }
        .project-link {
          display: flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 600;
          color: var(--text-secondary); text-decoration: none;
          transition: color .2s ease;
        }
        .project-link:hover { color: var(--primary-blue); }
        .project-link--live { color: var(--primary-blue); }
        .project-link--live:hover { opacity: 0.8; }

        /* ========== MOBILE — project row cards ========== */
        @media (max-width: 900px) {
          .projects-header { margin-bottom: 16px; }
          .projects-header h1 { font-size: 18px; margin-bottom: 4px; }
          .projects-header p { font-size: 11.5px; line-height: 1.4; }

          .mpj-list { display: flex; flex-direction: column; gap: 12px; }

          .mpj-row {
            position: relative; overflow: hidden;
            display: flex; align-items: flex-start; gap: 13px;
            padding: 14px 14px 14px 18px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 18px;
            width: 100%; text-align: left; cursor: pointer;
            transition: background .15s;
          }
          .mpj-row:active { background: var(--bg-primary); }

          .mpj-stripe {
            position: absolute; left: 0; top: 0; bottom: 0;
            width: 3px; border-radius: 18px 0 0 18px;
          }

          .mpj-icon {
            width: 42px; height: 42px; flex-shrink: 0;
            border-radius: 12px; border: 1px solid;
            display: flex; align-items: center; justify-content: center;
            font-size: 12px; font-weight: 800; letter-spacing: -.5px;
            font-family: inherit;
          }

          .mpj-body { flex: 1; min-width: 0; }

          .mpj-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; flex-wrap: wrap; }
          .mpj-title {
            font-size: 14.5px; font-weight: 700;
            color: var(--text-primary); margin: 0; line-height: 1.2;
          }

          .mpj-desc {
            font-size: 11.5px; color: var(--text-secondary);
            line-height: 1.45; margin: 0 0 9px;
          }

          .mpj-tags { display: flex; flex-wrap: wrap; gap: 5px; }
          .mpj-tag {
            font-size: 10px; font-weight: 700;
            padding: 3px 8px; border-radius: 20px;
            border: 1px solid;
          }

          .mpj-chevron { color: var(--text-muted); flex-shrink: 0; margin-top: 2px; }

          /* ========== PREMIUM DETAIL BOTTOM SHEET ========== */
          .dsheet-backdrop {
            position: fixed; inset: 0;
            background: rgba(0,0,0,.65);
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
            will-change: opacity, backdrop-filter; transform: translateZ(0);
            z-index: 1000;
          }
          @media (max-width: 900px) {
            .dsheet-backdrop {
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
              background: rgba(0,0,0,.75) !important;
            }
          }
          .dsheet {
            position: fixed; bottom: 0; left: 0; right: 0;
            background: var(--bg-secondary);
            border-top-left-radius: 28px; border-top-right-radius: 28px;
            z-index: 1001; height: 86vh; height: 86dvh;
            display: flex; flex-direction: column;
            will-change: transform; transform: translateZ(0); backface-visibility: hidden;
            box-shadow: 0 -20px 60px rgba(0,0,0,.25), 0 -1px 0 rgba(255,255,255,.06);
          }
          .dsheet-handle {
            width: 36px; height: 4px;
            background: var(--border-color);
            border-radius: 2px; margin: 12px auto 0; flex-shrink: 0;
          }
          .dsheet-header {
            display: flex; align-items: flex-start; justify-content: space-between;
            padding: 16px 18px 14px; border-bottom: 1px solid var(--border-color); flex-shrink: 0;
          }
          .dsheet-header-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
          .dsheet-header-icon {
            width: 44px; height: 44px; border-radius: 14px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0; font-size: 14px; font-weight: 900; letter-spacing: -.5px;
            font-family: inherit;
          }
          .dsheet-title h3 { font-size: 17px; font-weight: 800; color: var(--text-primary); margin: 0 0 3px; letter-spacing: -.02em; line-height: 1.2; }
          .dsheet-title p { font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: .05em; margin: 0; }
          .dsheet-close {
            width: 30px; height: 30px; border-radius: 15px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            display: flex; align-items: center; justify-content: center;
            color: var(--text-secondary); cursor: pointer; flex-shrink: 0; margin-left: 10px;
          }
          .dsheet-body {
            flex: 1; overflow-y: auto; display: flex; flex-direction: column; position: relative;
          }
          .dsheet-body::-webkit-scrollbar { display: none; }
          .dsheet-content {
            padding: 18px; display: flex; flex-direction: column; gap: 16px;
            padding-bottom: 32px;
          }
          .dsheet-image {
            width: 100%; height: 150px; border-radius: 18px; overflow: hidden;
            background: linear-gradient(135deg, #1e1b4b 0%, #064e3b 50%, #1e3a5f 100%);
            position: relative; display: flex; align-items: center; justify-content: center;
            border: 1px solid rgba(255,255,255,.06);
          }
          [data-theme="light"] .dsheet-image { background: linear-gradient(135deg, #e0e7ff 0%, #dcfce7 50%, #dbeafe 100%); border-color: rgba(0,0,0,.04); }
          .dsheet-desc { font-size: 13.5px; line-height: 1.65; color: var(--text-secondary); margin: 0; }
          .dsheet-section-label {
            font-size: 10px; font-weight: 800; color: var(--text-muted);
            text-transform: uppercase; letter-spacing: .1em; margin: 0 0 8px;
          }

          .ps-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .ps-stat {
            background: var(--bg-primary); border: 1px solid var(--border-color);
            border-radius: 14px; padding: 12px 14px;
            display: flex; flex-direction: column; gap: 3px;
          }
          .ps-stat-label { font-size: 10px; color: var(--text-muted); margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
          .ps-stat-value { font-size: 22px; font-weight: 900; color: var(--text-primary); margin: 0; letter-spacing: -.03em; line-height: 1.1; }

          .ps-tabs {
            display: flex; gap: 0; border-bottom: 1px solid var(--border-color);
            background: var(--bg-primary); border-radius: 12px 12px 0 0; overflow: hidden;
          }
          .ps-tab {
            border: none; background: none; font-size: 12.5px; font-weight: 700;
            padding: 10px 14px; color: var(--text-muted);
            border-bottom: 2px solid transparent; cursor: pointer;
            transition: all .2s; flex: 1; text-align: center;
            letter-spacing: .02em;
          }
          .ps-tab-active { color: var(--text-primary); border-bottom-color: var(--primary-blue); background: var(--bg-secondary); }

          .ps-tags { display: flex; flex-wrap: wrap; gap: 6px; }
          .ps-tag {
            font-size: 11px; font-weight: 700;
            padding: 5px 11px; border-radius: 20px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            color: var(--text-secondary);
          }

          .ps-arch { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; font-size: 12px; color: var(--text-primary); }
          .ps-arch-step {
            background: var(--bg-primary); border: 1px solid var(--border-color);
            padding: 6px 10px; border-radius: 8px;
            display: inline-flex; align-items: center; gap: 4px; font-weight: 600;
          }
          .ps-arch-arrow { color: var(--text-muted); opacity: .7; }

          .ps-code-block {
            position: relative; background: var(--bg-primary);
            border: 1px solid var(--border-color); border-radius: 14px;
            padding: 16px; overflow-x: auto;
          }
          .ps-code-block pre { margin: 0; font-family: monospace; font-size: 12px; color: var(--text-primary); white-space: pre-wrap; }
          .ps-copy {
            position: absolute; top: 10px; right: 10px;
            font-size: 11px; font-weight: 700;
            border: 1px solid var(--border-color);
            background: var(--bg-secondary); color: var(--text-primary);
            border-radius: 8px; padding: 4px 10px; cursor: pointer; z-index: 2;
          }

          .dsheet-actions { display: flex; gap: 10px; margin-top: 4px; }
          .dsheet-action-pill {
            flex: 1; height: 48px; border-radius: 16px;
            border: 1px solid var(--border-color);
            background: var(--bg-primary); color: var(--text-primary);
            display: flex; align-items: center; justify-content: center;
            gap: 8px; font-size: 13px; font-weight: 700;
            text-decoration: none; transition: all .2s; outline: none;
          }
          .dsheet-action-pill:hover, .dsheet-action-pill:focus { border-color: var(--primary-blue); }
          .dsheet-action-pill--primary {
            background: linear-gradient(135deg, var(--primary-blue) 0%, #0056b3 100%);
            color: #fff; border-color: transparent;
            box-shadow: 0 4px 15px rgba(0,123,255,.25);
          }

          .dsheet-scroll-hint {
            position: absolute; bottom: 0; left: 0; right: 0; height: 70px;
            background: linear-gradient(to top, var(--bg-secondary) 30%, transparent);
            display: flex; justify-content: center; align-items: flex-end; padding-bottom: 12px;
            pointer-events: none; color: var(--text-secondary); z-index: 100;
          }

          /* Pipeline Visual Styles */
          .ps-pipeline {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 18px;
            padding: 16px 12px;
            margin-bottom: 8px;
          }
          .ps-pipeline-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            text-align: center;
            min-width: 0;
          }
          .ps-pipeline-icon-box {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-primary);
            margin-bottom: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          }
          .ps-pipeline-label {
            font-size: 10px;
            font-weight: 700;
            color: var(--text-secondary);
            text-transform: lowercase;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
          }
          .ps-pipeline-arrow {
            color: var(--text-muted);
            font-size: 14px;
            font-weight: bold;
            margin: 0 4px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            opacity: 0.7;
          }

          /* Hairline Stats Styles */
          .ps-stats-new {
            display: flex;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 18px;
            padding: 16px;
            margin-bottom: 8px;
          }
          .ps-stat-new {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 0 12px;
          }
          .ps-stat-new:not(:first-child) {
            border-left: 1px solid var(--border-color);
          }
          .ps-stat-new-label {
            font-size: 10px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: .05em;
            margin: 0;
          }
          .ps-stat-new-value {
            font-size: 20px;
            font-weight: 900;
            color: var(--text-primary);
            margin: 0;
            letter-spacing: -.03em;
            line-height: 1.1;
          }

          /* Segmented Tabs Styles */
          .ps-tabs-segmented {
            display: inline-flex;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 3px;
            margin-bottom: 12px;
            width: fit-content;
          }
          .ps-tab-segmented {
            border: none;
            background: transparent;
            font-size: 12px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            color: var(--text-secondary);
          }
          .ps-tab-segmented-active {
            background: var(--bg-secondary);
            box-shadow: 0 0 0 0.5px var(--border-color), 0 2px 4px rgba(0,0,0,0.04);
            color: var(--text-primary);
            font-weight: 700;
          }
        }
      `}</style>

      {/* ── DETAIL SHEET (portalled) ────────────────────────────────── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedProject && (
            <div style={{ position: 'relative', zIndex: 9999 }}>
              <motion.div
                className="dsheet-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedProject(null)}
              />
              <motion.div
                ref={detailsSheetRef}
                className="dsheet"
                role="dialog" aria-modal="true"
                aria-label={`Project details: ${selectedProject.title}`}
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={isMobile ? { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.38 } : { type: 'spring', damping: 32, stiffness: 350, mass: 0.9 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={(_, info) => { if (info.offset.y > 120 || info.velocity.y > 600) setSelectedProject(null); }}
              >
                <div className="dsheet-handle" />

                {/* Header */}
                {(() => {
                  const initials = selectedProject.title.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
                  return (
                    <div className="dsheet-header">
                      <div className="dsheet-header-left">
                        <div className="dsheet-header-icon" style={{ background: accent+'18', color: accent, border: `1px solid ${accent}30` }}>
                          {initials}
                        </div>
                        <div className="dsheet-title">
                          <h3>{selectedProject.title}</h3>
                          {selectedProject.liveUrl ? (
                            <div className="live-badge" style={{ width: 'fit-content', marginTop: 2 }}>
                              <span className="live-dot"><span className="live-ping" /><span className="live-dot-core" /></span>
                              <span className="live-text">Live</span>
                            </div>
                          ) : <p>Personal Project</p>}
                        </div>
                      </div>
                      <button className="dsheet-close" onClick={() => setSelectedProject(null)} aria-label="Close">
                        <X size={16} />
                      </button>
                    </div>
                  );
                })()}

                {/* Scrollable body */}
                <div
                  className="dsheet-body"
                  ref={sheetContentRef}
                  onScroll={e => { if (e.target.scrollTop > 10 && !sheetScrolled) setSheetScrolled(true); }}
                >
                  <div className="dsheet-content">
                    {/* Pipeline visual */}
                    {selectedProject.pipeline && (
                      <div className="ps-pipeline">
                        {selectedProject.pipeline.map((step, i) => {
                          const StepIcon = pipelineIconMap[step.iconName] || Code2;
                          return (
                            <React.Fragment key={step.label}>
                              <div className="ps-pipeline-step">
                                <div className="ps-pipeline-icon-box" style={{ borderColor: accent+'30', color: accent }}>
                                  <StepIcon size={16} />
                                </div>
                                <div className="ps-pipeline-label">{step.label}</div>
                              </div>
                              {i < selectedProject.pipeline.length - 1 && (
                                <span className="ps-pipeline-arrow">&rarr;</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}

                    {/* Stats */}
                    {selectedProject.stats && (
                      <div className="ps-stats-new">
                        {selectedProject.stats.map(s => (
                          <div key={s.label} className="ps-stat-new">
                            <p className="ps-stat-new-value">
                              {s.prefix}
                              {s.value}
                              {s.suffix}
                            </p>
                            <p className="ps-stat-new-label">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tabs */}
                    {(() => {
                      const tabs = ['overview'];
                      if (selectedProject.architecture) tabs.push('architecture');
                      if (selectedProject.code) tabs.push('code');
                      return tabs.length > 1 && (
                        <div className="ps-tabs-segmented">
                          {tabs.map(t => (
                            <button 
                              key={t} 
                              className={`ps-tab-segmented${tab === t ? ' ps-tab-segmented-active' : ''}`} 
                              onClick={() => setTab(t)}
                            >
                              {t[0].toUpperCase() + t.slice(1)}
                            </button>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Tab content */}
                    {tab === 'overview' && (
                      <>
                        <p className="dsheet-desc">{selectedProject.description}</p>
                        <div>
                          <p className="dsheet-section-label">Stack</p>
                          <div className="ps-tags">
                            {selectedProject.tags.map(tag => {
                              const TagIcon = tagIconMap[tag];
                              return (
                                <span key={tag} className="ps-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                  {TagIcon && <TagIcon size={12} style={{ opacity: 0.8 }} />}
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                    {tab === 'architecture' && selectedProject.architecture && (
                      <div>
                        <p className="dsheet-section-label">Pipeline</p>
                        <div className="ps-arch">
                          {selectedProject.architecture.map((step, i) => (
                            <span key={step} className="ps-arch-step">
                              {step}
                              {i < selectedProject.architecture.length - 1 && <span className="ps-arch-arrow">&rarr;</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {tab === 'code' && selectedProject.code && (
                      <div>
                        <p className="dsheet-section-label">Code Snippet</p>
                        <div className="ps-code-block">
                          <button className="ps-copy" onClick={copyCode}>{copied ? 'Copied!' : 'Copy'}</button>
                          <pre>{selectedProject.code}</pre>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="dsheet-actions">
                      {selectedProject.githubUrl && (
                        <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer" className="dsheet-action-pill">
                          <FaGithub size={16} /> Code
                        </a>
                      )}
                      {selectedProject.liveUrl && (
                        <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer"
                          className="dsheet-action-pill dsheet-action-pill--primary"
                        >
                          <ExternalLink size={16} /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scroll hint */}
                <AnimatePresence>
                  {sheetScrollable && !sheetScrolled && (
                    <motion.div className="dsheet-scroll-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                      <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '2px' }}>Scroll</span>
                        <ChevronDown size={16} />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Context Menu Overlay */}
      <AnimatePresence>
        {contextMenuProject && (
          <motion.div 
            className="context-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setContextMenuProject(null)}
          >
            <motion.div 
              className="context-menu-sheet"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={isMobile ? { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.25 } : { type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                className="context-menu-btn" 
                onClick={() => {
                  setSelectedProject(contextMenuProject);
                  setContextMenuProject(null);
                }}
              >
                <FileText size={18} /> View Details
              </button>
              {contextMenuProject.liveUrl && (
                <button 
                  className="context-menu-btn" 
                  onClick={() => {
                    window.open(contextMenuProject.liveUrl, '_blank');
                    setContextMenuProject(null);
                  }}
                >
                  <ExternalLink size={18} /> Open Live Demo
                </button>
              )}
              {contextMenuProject.githubUrl && (
                <button 
                  className="context-menu-btn" 
                  onClick={() => {
                    window.open(contextMenuProject.githubUrl, '_blank');
                    setContextMenuProject(null);
                  }}
                >
                  <FaGithub size={18} /> View Source Code
                </button>
              )}
              <button 
                className="context-menu-btn" 
                onClick={() => setContextMenuProject(null)}
                style={{ color: '#ef4444' }}
              >
                <X size={18} /> Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PAGE CONTENT ─────────────────────────────────────────────── */}
      <div className="projects-header">
        <h1>Featured Projects</h1>
        <p>
          {isMobile
            ? 'Tap any project to explore the details.'
            : 'A showcase of my recent work in data science, machine learning & full-stack development.'}
        </p>
      </div>

      {!isMobile ? (
        <div className="projects-grid">
          {projectsData.map(project => (
            <ProjectCard key={project.id} project={project} onCardClick={() => {}} />
          ))}
        </div>
      ) : (
        <div className="mpj-list">
          {projectsData.map((project, i) => (
            <MobileProjectRow 
              key={project.id} 
              project={project} 
              index={i} 
              onTap={setSelectedProject} 
              onLongPress={setContextMenuProject}
            />
          ))}
        </div>
      )}

      {/* Swipe Hint */}
      {isMobile && (
        <motion.div
          className="swipe-hint"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="swipe-hint-icon">
            <motion.div animate={{ x: [-3, 2, -3] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
              <ChevronLeft size={16} />
            </motion.div>
            <motion.div animate={{ x: [3, -2, 3] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
              <ChevronRight size={16} />
            </motion.div>
          </div>
          <span>Swipe or use nav to explore</span>
        </motion.div>
      )}
    </ScrollReveal>
  );
}
