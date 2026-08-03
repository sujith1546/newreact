// =================================================================
// CENTRAL COMPONENT RE-EXPORT INDEX
// Provides 100% backward compatibility & clean domain imports
// =================================================================

// 1. Layout & Shell Components
export { default as Sidebar } from './layout/Sidebar';
export { default as MobileBottomNav } from './layout/MobileBottomNav';
export { default as AnnouncementBanner } from './layout/AnnouncementBanner';
export { default as ParticleCanvas } from './layout/ParticleCanvas';
export { default as SplashScreen } from './layout/SplashScreen';
export { default as SEOHelmet } from './layout/SEOHelmet';
export { default as DynamicIsland } from './layout/DynamicIsland';
export { default as StatsRow } from './ui/StatsRow';

// 2. Interactive Widgets & Overlays
export { default as ChatBot } from './widgets/ChatBot';
export { default as CommandPalette } from './widgets/CommandPalette';
export { default as SectionSpotlight } from './widgets/SectionSpotlight';
export { default as TimezoneStatus } from './widgets/TimezoneStatus';
export { default as GetInTouchDropdown } from './widgets/GetInTouchDropdown';
export { default as WelcomeModal } from './widgets/WelcomeModal';
export { default as QRModal } from './widgets/QRModal';
export { default as ResumeQuickLook } from './widgets/ResumeQuickLook';
export { default as MobileStatusPanel } from './widgets/MobileStatusPanel';
export { default as MobileDashboard } from './widgets/MobileDashboard';
export { default as ScheduleUpcomingModal } from './widgets/ScheduleUpcomingModal';
export { default as GitHubCommitsModal } from './widgets/GitHubCommitsModal';
export { default as UpdatesModal } from './widgets/UpdatesModal';
export { default as AiLiveUsageModal } from './widgets/AiLiveUsageModal';
export { default as MobilePreviewModal } from './widgets/MobilePreviewModal';
export { default as CraftedWithLoveModal } from './widgets/CraftedWithLoveModal';
export { default as NetworkSignalWidget } from './widgets/NetworkSignalWidget';

// 3. Developer & Diagnostic Tools
export { default as SystemDiagnostics } from './dev/SystemDiagnostics';
export { default as DevToolsDetector } from './dev/DevToolsDetector';
export { default as DiagnosticsToggle } from './dev/DiagnosticsToggle';

// 4. Micro UI Controls & Cards
export { default as DarkModeToggle } from './ui/DarkModeToggle';
export { default as SettingsDropdown } from './ui/SettingsDropdown';
export { default as SettingsSidebar } from './ui/SettingsSidebar';
export { EducationArrowFlow } from './ui/EducationArrowFlow';
export { default as TechStackTicker } from './ui/TechStackTicker';
export { default as ScrollReveal } from './ui/ScrollReveal';
export { default as SkillTooltip } from './ui/SkillTooltip';
export { default as FAB } from './ui/FAB';
export { default as EmailDomainSuggest } from './ui/EmailDomainSuggest';
export { default as CharacterCounter } from './ui/CharacterCounter';
export { default as InquiryTypeSelector } from './ui/InquiryTypeSelector';
export { default as CopyButton } from './ui/CopyButton';

// 5. Guards & Security
export * from './MaintenanceGate';
