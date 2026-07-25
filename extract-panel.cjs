const fs = require('fs');

const panelName = process.argv[2];
if (!panelName) {
  console.error("Please provide a panel name");
  process.exit(1);
}

const lines = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8').split('\n');
const startIdx = lines.findIndex(l => l.startsWith(`function ${panelName}() {`));

if (startIdx === -1) {
  console.error(`Could not find function ${panelName}() {`);
  process.exit(1);
}

let endIdx = -1;
// Find the next function definition or the end of the file
for (let i = startIdx + 1; i < lines.length; i++) {
  if (lines[i].startsWith('function ') || lines[i].startsWith('const ') && lines[i].includes('=')) {
     // A new panel or top-level const might start here, let's look for the preceding '/*' comment line
     let commentStart = i;
     while (commentStart > startIdx && !lines[commentStart].startsWith('/* -')) {
       commentStart--;
     }
     if (commentStart > startIdx) {
       endIdx = commentStart - 1;
       break;
     } else {
       // if no comment, just stop before the function
       endIdx = i - 1;
       break;
     }
  }
}

if (endIdx === -1) endIdx = lines.length - 1;

const panelCode = lines.slice(startIdx, endIdx + 1).join('\n');

const imports = `import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { styles, MODAL_STYLES } from '../shared/constants';
import { PanelCard, EmptyState, StatCard } from '../shared/components';

`;

// Add export default
const finalCode = imports + panelCode.replace(`function ${panelName}()`, `export default function ${panelName}()`) + '\n';

fs.mkdirSync('src/components/admin/panels', {recursive:true});
fs.writeFileSync(`src/components/admin/panels/${panelName}.jsx`, finalCode);

console.log(`Extracted ${panelName}.jsx (lines ${startIdx} to ${endIdx})`);
