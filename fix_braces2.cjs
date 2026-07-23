const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

code = code.replace(/\n\}\n\}\n\n\/\*/g, '\n}\n\n/*');

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
