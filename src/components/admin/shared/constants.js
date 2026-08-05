export const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { key: "home", label: "Home", icon: "ti-home", color: "#6366F1" },
    ]
  },
  {
    label: "Preview",
    items: [
      { key: "preview", label: "Portfolio Preview", icon: "ti-eye", color: "#8B5CF6" },
    ]
  },
  {
    label: "Inbox",
    items: [
      { key: "messages", label: "Messages", icon: "ti-message-circle", color: "#6366F1" },
      { key: "chats", label: "AI Chats", icon: "ti-messages", color: "#8B5CF6" },
    ]
  },
  {
    label: "Content",
    items: [
      { key: "projects", label: "Projects", icon: "ti-briefcase", color: "#10B981" },
      { key: "testimonials", label: "Testimonials", icon: "ti-quote", color: "#8B5CF6" },
      { key: "updates", label: "Updates", icon: "ti-bolt", color: "#F59E0B" },
      { key: "skills", label: "Skills", icon: "ti-star", color: "#06B6D4" },
      { key: "experience", label: "Experience", icon: "ti-id-badge", color: "#6366F1" },
      { key: "education", label: "Education", icon: "ti-book", color: "#EC4899" },
      { key: "certifications", label: "Certifications", icon: "ti-certificate", color: "#F97316" },
    ]
  },
  {
    label: "System",
    items: [
      { key: "settings", label: "Settings", icon: "ti-settings", color: "#8B5CF6" },
    ]
  },
];

export const ALL_NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);


export const SKILL_CATEGORIES = [
  'languages',
  'frameworks',
  'developer_tools',
  'libraries_ml',
  'cloud_databases',
  'other'
];

export const SKILL_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
  'Master'
];

export const styles = {
  btn: {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    border: '1px solid var(--pcms-line, #E7E9EE)',
    background: 'var(--pcms-panel, #FFFFFF)',
    color: 'var(--pcms-text, #0F1626)',
    transition: 'all 0.2s ease',
  },
  btnPrimary: {
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: 'var(--pcms-text, #0F1626)',
    color: '#ffffff',
    transition: 'all 0.2s ease',
  },
  shell: {
    display: "grid",
    gridTemplateColumns: "210px 1fr",
    gridTemplateRows: "1fr",
    position: "fixed",
    inset: 0,
    background: "var(--pcms-bg, #FFFFFF)",
    fontFamily: "Inter, sans-serif"
  },
  sidebar: {
    background: "var(--pcms-sidebar, #FBFBFC)",
    borderRight: "1px solid var(--pcms-line, #E7E9EE)",
    padding: "16px 12px",
    boxSizing: "border-box"
  },
  sidebarLabel: {
    fontSize: 10,
    color: "var(--pcms-muted-2, #AEB4BF)",
    letterSpacing: 0.5,
    fontWeight: 600,
    margin: "0 0 8px",
    padding: "0 8px",
    textTransform: "uppercase",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 10px",
    borderRadius: "6px",
    fontSize: 12,
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s ease",
    position: "relative"
  },
  navBadge: {
    marginLeft: "auto",
    background: "var(--pcms-danger, #C4432F)",
    color: "white",
    fontSize: 9,
    fontWeight: 700,
    borderRadius: "10px",
    padding: "1px 6px",
  },
  main: {
    padding: "16px 24px",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid var(--pcms-line, #E7E9EE)",
    paddingBottom: "12px",
    marginBottom: "16px"
  },
  headerLabel: {
    fontSize: 11,
    color: "var(--pcms-muted, #7C8494)",
    margin: "0 0 2px"
  },
  headerEmail: {
    fontSize: 13,
    color: "var(--pcms-text, #0F1626)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    borderBottom: "1px solid var(--pcms-line, #E7E9EE)",
    background: "var(--pcms-panel, #FFFFFF)",
    flexShrink: 0,
    gap: 12,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--pcms-text, #0F1626)",
    margin: 0,
    fontFamily: "Space Grotesk, sans-serif",
  },
  topBarSub: {
    fontSize: 11,
    color: "var(--pcms-muted, #7C8494)",
    margin: "2px 0 0",
  },
  iconAction: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: "var(--pcms-panel, #FFFFFF)",
    border: "1px solid var(--pcms-line, #E7E9EE)",
    color: "var(--pcms-text, #0F1626)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s",
    flexShrink: 0,
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 20px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  statCard: {
    background: "var(--pcms-panel, #FFFFFF)",
    border: "1px solid var(--pcms-line, #E7E9EE)",
    borderRadius: "8px",
    padding: "12px 14px",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "var(--pcms-muted, #7C8494)",
    margin: "0",
  },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
    margin: "2px 0 0",
    lineHeight: 1.1,
    display: "flex",
    alignItems: "center",
    color: "var(--pcms-text, #0F1626)",
  },
  panelContainer: {
    flex: 1,
  },
  panelCard: {
    background: "var(--pcms-panel, #FFFFFF)",
    border: "1px solid var(--pcms-line, #E7E9EE)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid var(--pcms-line, #E7E9EE)",
    background: "var(--pcms-panel, #FFFFFF)",
    gap: 10,
    flexWrap: "wrap",
  },
  panelTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--pcms-text, #0F1626)",
    margin: 0,
    fontFamily: "Space Grotesk, sans-serif",
  },
  panelAction: {
    background: "var(--pcms-text, #0F1626)",
    color: "#fff",
    border: "none",
    fontSize: 11,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 5,
    cursor: "pointer",
    padding: "6px 12px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
  },
  emptyState: {
    padding: "40px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--pcms-text, #0F1626)",
    margin: "12px 0 4px",
  },
  emptyDescription: {
    fontSize: 12,
    color: "var(--pcms-muted, #7C8494)",
    margin: 0,
    maxWidth: 280,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "var(--pcms-muted, #7C8494)",
    fontWeight: 600,
    padding: "8px 14px",
    borderBottom: "1px solid var(--pcms-line, #E7E9EE)",
    background: "var(--pcms-panel-2, #F7F8FA)",
    whiteSpace: "nowrap",
  },
  td: {
    fontSize: 12,
    color: "var(--pcms-text, #0F1626)",
    padding: "10px 14px",
    borderBottom: "1px solid var(--pcms-line-soft, #F0F1F4)",
    verticalAlign: "middle",
  },
  badge: {
    padding: "2px 7px",
    borderRadius: "20px",
    fontSize: 10,
    fontWeight: 500,
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px",
    color: "var(--pcms-muted-2, #AEB4BF)",
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid var(--pcms-line, #E7E9EE)",
    background: "var(--pcms-panel, #FFFFFF)",
    color: "var(--pcms-text, #0F1626)",
    fontSize: 12,
    boxSizing: "border-box",
    outline: "none",
  },
  settingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 12,
  },
  settingGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  settingLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "var(--pcms-muted, #7C8494)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};

export const MODAL_STYLES = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15, 22, 38, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 },
  content: { background: 'var(--pcms-panel, #FFFFFF)', borderRadius: '10px', width: '100%', maxWidth: 620, maxHeight: '88vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--pcms-line, #E7E9EE)', overflow: 'hidden' },
  header: { padding: '14px 18px', borderBottom: '1px solid var(--pcms-line, #E7E9EE)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--pcms-panel-2, #F7F8FA)', flexShrink: 0 },
  title: { margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--pcms-text, #0F1626)', fontFamily: 'Space Grotesk, sans-serif' },
  body: { padding: '18px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' },
  footer: { padding: '12px 18px', borderTop: '1px solid var(--pcms-line, #E7E9EE)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--pcms-muted, #7C8494)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 4 },
  input: { width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--pcms-line, #E7E9EE)", background: "var(--pcms-panel, #FFFFFF)", color: "var(--pcms-text, #0F1626)", fontSize: 12, boxSizing: "border-box", outline: "none" },
  sectionLabel: { fontSize: 12, fontWeight: 600, color: 'var(--pcms-text, #0F1626)', margin: 0 }
};
