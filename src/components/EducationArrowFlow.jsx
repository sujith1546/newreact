import React from 'react';
import { School, Trophy, BookOpen, Laptop, ChevronRight } from 'lucide-react';

const defaultIcons = [School, Trophy, BookOpen, Laptop];

export function EducationArrowFlow({ stages = [], activeIndex = 0, onSelectStage }) {
  const items = stages.length > 0 ? stages.map((item, index) => ({
    id: item.id || index,
    label: item.shortLabel || item.short_label || item.title || `Stage ${index + 1}`,
    institution: item.institution,
    active: activeIndex === index
  })) : [
    { label: "Primary", active: activeIndex === 0 },
    { label: "Secondary", active: activeIndex === 1 },
    { label: "Intermediate", active: activeIndex === 2 },
    { label: "B.Tech (CSE)", active: activeIndex === 3 },
  ];

  return (
    <div className="education-arrow-flow">
      <style>{`
        .education-arrow-flow {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          background: var(--bg-secondary, rgba(255, 255, 255, 0.8));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          border-radius: 16px;
          padding: 10px 20px;
          width: fit-content;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }

        .arrow-flow-item-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .arrow-flow-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          padding: 6px 14px;
          border-radius: 10px;
          cursor: pointer;
          color: var(--text-secondary, #6b7280);
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          outline: none;
          user-select: none;
        }

        .arrow-flow-item:hover {
          background: rgba(59, 130, 246, 0.08);
          color: var(--primary-blue, #3b82f6);
          transform: translateY(-1px);
        }

        .arrow-flow-item.active {
          background: rgba(59, 130, 246, 0.12);
          color: var(--primary-blue, #3b82f6);
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
        }

        .arrow-flow-item.active svg {
          color: var(--primary-blue, #3b82f6);
          transform: scale(1.1);
        }

        .arrow-flow-connector {
          color: var(--border-color, #d1d5db);
          flex-shrink: 0;
          opacity: 0.6;
        }

        [data-theme="dark"] .education-arrow-flow {
          background: rgba(30, 30, 30, 0.5);
          border-color: rgba(255, 255, 255, 0.08);
        }

        [data-theme="dark"] .arrow-flow-item.active {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        [data-theme="dark"] .arrow-flow-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #60a5fa;
        }
      `}</style>

      {items.map((stage, index) => {
        const Icon = defaultIcons[index % defaultIcons.length] || School;
        return (
          <div key={stage.id || stage.label} className="arrow-flow-item-wrapper">
            <button
              type="button"
              className={`arrow-flow-item ${stage.active ? "active" : ""}`}
              onClick={() => onSelectStage?.(index)}
            >
              <Icon size={16} />
              <span>{stage.label}</span>
            </button>
            {index < items.length - 1 && (
              <ChevronRight size={14} className="arrow-flow-connector" />
            )}
          </div>
        );
      })}
    </div>
  );
}
