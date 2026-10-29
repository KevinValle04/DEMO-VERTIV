const fs = require('fs');
const files = ['index.html','devolucion.html','localizador.html','login.html'];
files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const v = c.includes('DB_VERSION_ACTUAL');
  const r = c.includes('RESP-2026-007');
  const d = c.includes('Daniel Soto Espinoza');
  const ext = c.includes('src="db.js');
  console.log(f + ': v2=' + v + ' resp007=' + r + ' daniel=' + d + ' extSrc=' + ext + ' size=' + Math.round(c.length/1024) + 'KB');
});
