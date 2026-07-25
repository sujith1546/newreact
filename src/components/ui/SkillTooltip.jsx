import { useState, useRef, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TbFolder } from "react-icons/tb";
import { getSkillIcon } from "./skillIcons";

const RING_RADIUS = 18;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ percent }) {
  const offset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;
  return (
    <div className="tooltip-ring-wrapper">
      <svg width="44" height="44" viewBox="0 0 44 44" className="tooltip-ring-svg">
        <circle
          cx="22" cy="22" r={RING_RADIUS}
          fill="none" stroke="currentColor" strokeWidth="4"
          className="tooltip-ring-bg"
        />
        <circle
          cx="22" cy="22" r={RING_RADIUS}
          fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE} strokeDashoffset={offset}
          className="tooltip-ring-fill"
        />
      </svg>
      <span className="tooltip-ring-text">{percent}%</span>
    </div>
  );
}

function SkillTooltipCard({ skill }) {
  const Icon = getSkillIcon(skill.id);

  return (
    <div className="skill-card-body" role="tooltip">
      <div className="skill-card-header">
        <div className="skill-card-icon">
          <Icon className="icon-svg" />
        </div>
        <div className="skill-card-title-area">
          <div className="title-row">
            <span className="skill-card-name">{skill.name}</span>
            <span className="skill-card-level">{skill.level.toUpperCase()}</span>
          </div>
          {(skill.years > 0 || skill.projectCount > 0) && (
            <span className="skill-card-meta">
              {skill.years > 0 && `${skill.years}+ years`}
              {skill.years > 0 && skill.projectCount > 0 && " · "}
              {skill.projectCount > 0 && `${skill.projectCount} projects`}
            </span>
          )}
        </div>
        <ProgressRing percent={skill.percent} />
      </div>

      <p className="skill-card-desc">{skill.description}</p>

      {skill.relatedTools?.length > 0 && (
        <div className="skill-card-tools">
          {skill.relatedTools.map((tool) => (
            <span key={tool} className="skill-card-tool">{tool}</span>
          ))}
        </div>
      )}

      {skill.projects?.length > 0 && (
        <div className="skill-card-projects">
          <TbFolder className="projects-icon" />
          <span className="projects-text">
            Used in {skill.projects.slice(0, 2).join(", ")}
            {skill.projects.length > 2 && ` and ${skill.projects.length - 2} more`}
          </span>
        </div>
      )}
    </div>
  );
}

const HOVER_DELAY_MS = 150;

export default function SkillTooltip({ skill, children }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const tooltipId = useId();

  const show = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(true), HOVER_DELAY_MS);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setOpen(false);
  };

  return (
    <>
      <style>{`
        .skill-tooltip-trigger { position: relative; display: inline-flex; }
        .skill-tooltip-dropdown { position: absolute; left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%); z-index: 50; }

        .skill-card-body {
          width: 320px;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          padding: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          text-align: left;
        }
        .skill-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        
        .skill-card-icon {
          display: flex; height: 36px; width: 36px; flex-shrink: 0; align-items: center; justify-content: center;
          border-radius: 8px; background: #111827;
        }
        .skill-card-icon .icon-svg { height: 20px; width: 20px; color: #ffffff; }
        
        .skill-card-title-area { min-width: 0; flex: 1; }
        .title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .skill-card-name { font-size: 15px; font-weight: 500; color: #111827; }
        
        .skill-card-level {
          border-radius: 9999px; background: #111827; padding: 2px 8px; font-size: 10px; font-weight: 500;
          letter-spacing: 0.025em; color: #ffffff;
        }
        .skill-card-meta { font-size: 12px; color: #9ca3af; display: block; margin-top: 2px; }

        .tooltip-ring-wrapper { position: relative; height: 44px; width: 44px; flex-shrink: 0; }
        .tooltip-ring-svg { transform: rotate(-90deg); }
        .tooltip-ring-bg { color: #e5e7eb; }
        .tooltip-ring-fill { color: #111827; transition: stroke-dashoffset 500ms ease-out; }
        .tooltip-ring-text {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 500; color: #111827;
        }

        .skill-card-desc { margin-bottom: 12px; font-size: 13px; line-height: 1.625; color: #4b5563; }
        .skill-card-tools { margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-card-tool {
          border-radius: 9999px; border: 1px solid #e5e7eb; background: #f9fafb; padding: 4px 10px;
          font-size: 11px; color: #4b5563;
        }

        .skill-card-projects { display: flex; align-items: center; gap: 6px; border-top: 1px solid #f3f4f6; padding-top: 10px; }
        .projects-icon { height: 14px; width: 14px; flex-shrink: 0; color: #9ca3af; }
        .projects-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: #9ca3af; }

        /* Dark Mode Overrides */
        [data-theme="dark"] .skill-card-body { border-color: #262626; background: #171717; }
        [data-theme="dark"] .skill-card-icon { background: #ffffff; }
        [data-theme="dark"] .skill-card-icon .icon-svg { color: #171717; }
        [data-theme="dark"] .skill-card-name { color: #ffffff; }
        [data-theme="dark"] .skill-card-level { background: #374151; color: #ffffff; border: 1px solid #4b5563; }
        [data-theme="dark"] .tooltip-ring-bg { color: #404040; }
        [data-theme="dark"] .tooltip-ring-fill { color: #ffffff; }
        [data-theme="dark"] .tooltip-ring-text { color: #ffffff; }
        [data-theme="dark"] .skill-card-desc { color: #d4d4d8; }
        [data-theme="dark"] .skill-card-tool { border-color: #404040; background: #262626; color: #d4d4d8; }
        [data-theme="dark"] .skill-card-projects { border-color: #262626; }
      `}</style>
      
      <span
        className="skill-tooltip-trigger"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <span aria-describedby={open ? tooltipId : undefined}>{children}</span>

        <AnimatePresence>
          {open && (
            <motion.div
              id={tooltipId}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="skill-tooltip-dropdown"
              onMouseEnter={show}
              onMouseLeave={hide}
            >
              <SkillTooltipCard skill={skill} />
            </motion.div>
          )}
        </AnimatePresence>
      </span>
    </>
  );
}
