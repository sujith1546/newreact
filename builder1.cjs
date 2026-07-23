const fs = require('fs');

let fileContent = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

// Global components
const globals = `
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 16, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
          </div>
          <div style={{ padding: 24 }}>{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const FormField = ({ label, icon: Icon, type = "text", value, onChange, placeholder, multiline = false, required = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label} {required && '*'}</label>
    <div style={{ display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: 12, padding: multiline ? '12px 16px' : '0 16px', minHeight: 48, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
      {Icon && <Icon size={18} style={{ color: 'var(--text-muted)', marginTop: multiline ? 2 : 0 }} />}
      {multiline ? (
        <textarea value={value} onChange={onChange} placeholder={placeholder} required={required} style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 15, outline: 'none', minHeight: 80, resize: 'vertical' }} />
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 15, outline: 'none', width: '100%' }} />
      )}
    </div>
  </div>
);

const KPICard = ({ label, value, trend, icon: Icon, color }) => (
  <div style={{ background: 'var(--bg-primary)', border: \`1px solid var(--border-color)\`, borderTop: \`3px solid \${color}\`, borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)' }}>{label}</p>
      {Icon && <div style={{ width: 32, height: 32, borderRadius: 8, background: \`\${color}18\`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} color={color} /></div>}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -1 }}>{value}</p>
      {trend && <span style={{ fontSize: 12, fontWeight: 600, color: trend > 0 ? '#10b981' : '#ef4444' }}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>}
    </div>
  </div>
);
`;

fileContent = fileContent.replace("export default function AdminDashboard", globals + "\nexport default function AdminDashboard");

// Write it back
fs.writeFileSync('src/pages/AdminDashboard.jsx', fileContent);
