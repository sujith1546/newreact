const fs = require('fs');
const lines = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8').split('\n');

// Find the line index of "function SettingsPanel()"
const startIndex = lines.findIndex(l => l.includes('function SettingsPanel('));
if (startIndex !== -1) {
    // Find the end of SettingsPanel, which is just before "function SkillsPanel()"
    const endIndex = lines.findIndex((l, i) => i > startIndex && l.includes('function SkillsPanel()'));
    
    // Actually SettingsPanel ends where "/* Skills Panel */" starts or similar. 
    // Let's just use the exact line numbers we found earlier: 1436 (0-indexed) to 1712.
    // Wait, the file might change slightly. Let's find exactly `function SettingsPanel()`
    // and remove up to `/* -------------------------------------------------------------------- */` before Skills Panel.
    const startIdx = lines.findIndex(l => l.startsWith('function SettingsPanel()'));
    let endIdx = -1;
    for (let i = startIdx + 1; i < lines.length; i++) {
        if (lines[i].includes('/* Skills Panel')) {
            endIdx = i - 3; // Remove up to the comment block
            break;
        }
    }
    
    if (startIdx !== -1 && endIdx !== -1) {
        lines.splice(startIdx, endIdx - startIdx + 1);
        
        // Add import at the top
        lines.splice(15, 0, "import SettingsPanel from '../components/admin/panels/SettingsPanel';");
        
        fs.writeFileSync('src/pages/AdminDashboard.jsx', lines.join('\n'));
        console.log("Removed SettingsPanel and added import.");
    } else {
        console.log("Could not find start or end index.");
    }
}
