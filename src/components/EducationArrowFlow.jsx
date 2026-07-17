import { School, Trophy, BookOpen, Laptop, ChevronRight } from 'lucide-react';

export function EducationArrowFlow({ activeIndex = 0 }) {
  // TIMELINE is chronological (Primary is index 0)
  const STAGES = [
    { icon: School, label: "Primary", active: activeIndex === 0 },
    { icon: Trophy, label: "Secondary", active: activeIndex === 1 },
    { icon: BookOpen, label: "Inter", active: activeIndex === 2 },
    { icon: Laptop, label: "University", active: activeIndex === 3 },
  ];

  return (
    <div className="education-arrow-flow">
      {STAGES.map((stage, index) => {
        const Icon = stage.icon;
        return (
          <div key={stage.label} className="arrow-flow-item-wrapper">
            <div className={`arrow-flow-item ${stage.active ? "active" : ""}`}>
              <Icon size={18} />
              <span>{stage.label}</span>
            </div>
            {index < STAGES.length - 1 && (
              <ChevronRight size={14} className="arrow-flow-connector" />
            )}
          </div>
        );
      })}
    </div>
  );
}
