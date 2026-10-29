/**
 * inline.js — Injects updated db.js and css into all HTML files.
 * Handles both external <script src="db.js"> and already-inlined blocks.
 */
const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\sopor\\Documents\\githubdesarrollo\\DEMO';
const dbContent = fs.readFileSync(path.join(dir, 'db.js'), 'utf8');
const cssContent = fs.readFileSync(path.join(dir, 'styles.css'), 'utf8');

const htmlFiles = ['index.html', 'devolucion.html', 'localizador.html', 'login.html'];

htmlFiles.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Replace inlined CSS block (first <style> tag)
  content = content.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/, `$1\n${cssContent}\n$3`);

  // 2a. Replace external db.js script tag: <script src="db.js..."></script>
  if (/<script[^>]+src=["'][^"']*db\.js[^"']*["'][^>]*><\/script>/.test(content)) {
    content = content.replace(/<script[^>]+src=["'][^"']*db\.js[^"']*["'][^>]*><\/script>/, `<script>\n${dbContent}\n</script>`);
    console.log(`  Replaced external db.js src tag in: ${file}`);
  }
  // 2b. Replace already-inlined db.js block (contains DB_KEY_ASIGNACIONES marker)
  else {
    const scriptTagRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
    let match;
    let replaced = false;
    const originalContent = content;
    while ((match = scriptTagRegex.exec(originalContent)) !== null) {
      if (match[1].includes('DB_KEY_ASIGNACIONES')) {
        content = content.replace(match[0], `<script>\n${dbContent}\n</script>`);
        console.log(`  Replaced inline db.js block in: ${file}`);
        replaced = true;
        break;
      }
    }
    if (!replaced) {
      console.log(`  WARNING: No db.js block found in: ${file}`);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Done:', file, '(' + Math.round(content.length / 1024) + ' KB)');
});

console.log('\nAll done.');
