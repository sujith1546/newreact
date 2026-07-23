const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

code = code.replace(/\n\}\n\}\n\nconst styles =/g, '\n}\n\nconst styles =');

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
