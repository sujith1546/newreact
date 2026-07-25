import { School, Trophy, BookOpen, Laptop, ChevronRight } from 'lucide-react';

const defaultIcons = [School, Trophy, BookOpen, Laptop];

export function EducationArrowFlow({ stages = [], activeIndex = 0, onSelectStage }) {
  const items = stages.length > 0 ? stages.map((item, index) => ({
    id: item.id || index,
    label: item.shortLabel || item.short_label || item.title || `Stage ${index + 1}`,
    institution: item.institution,
    active: activeIndex === index
  })) : [
    { label: "Primary (Grade 1-5)", active: activeIndex === 0 },
    { label: "High School (Grade 6-10)", active: activeIndex === 1 },
    { label: "Intermediate (PCM)", active: activeIndex === 2 },
    { label: "University (B.Tech CSE)", active: activeIndex === 3 },
  ];

  return (
    <div className="education-arrow-flow">
      {items.map((stage, index) => {
        const Icon = defaultIcons[index % defaultIcons.length] || School;
        return (
          <div key={stage.id || stage.label} className="arrow-flow-item-wrapper">
            <button
              type="button"
              className={`arrow-flow-item ${stage.active ? "active" : ""}`}
              onClick={() => onSelectStage?.(index)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none', padding: 0 }}
            >
              <Icon size={18} />
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
