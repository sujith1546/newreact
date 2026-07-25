const fs = require('fs');

const panelName = process.argv[2];
if (!panelName) {
  console.error("Please provide a panel name");
  process.exit(1);
}

const lines = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8').split('\n');
const startIdx = lines.findIndex(l => l.startsWith(`function ${panelName}() {`));

if (startIdx === -1) {
  console.error(`Could not find function ${panelName}() { in AdminDashboard.jsx`);
  process.exit(1);
}

let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) {
  if (lines[i].startsWith('function ') || lines[i].startsWith('const ') && lines[i].includes('=')) {
     let commentStart = i;
     while (commentStart > startIdx && !lines[commentStart].startsWith('/* -')) {
       commentStart--;
     }
     if (commentStart > startIdx) {
       endIdx = commentStart - 1;
       break;
     } else {
       endIdx = i - 1;
       break;
     }
  }
}

if (endIdx === -1) endIdx = lines.length - 1;

// Remove the lines
lines.splice(startIdx, endIdx - startIdx + 1);

// Find the last import line
let lastImportIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('import ')) {
    lastImportIdx = i;
  } else if (lastImportIdx !== -1 && lines[i].trim() !== '') {
    break;
  }
}

// Add the import
const importStr = `import ${panelName} from '../components/admin/panels/${panelName}';`;
lines.splice(lastImportIdx + 1, 0, importStr);

fs.writeFileSync('src/pages/AdminDashboard.jsx', lines.join('\n'));
console.log(`Removed ${panelName} and added import.`);
