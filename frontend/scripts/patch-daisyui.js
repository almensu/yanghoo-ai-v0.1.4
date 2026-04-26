const fs = require('fs');
const path = require('path');

const daisyuiDir = path.join(__dirname, '../node_modules/daisyui');

if (!fs.existsSync(daisyuiDir)) {
  console.log('daisyUI not found in node_modules, skipping patch.');
  process.exit(0);
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

console.log('🚀 Patching daisyUI 5 literal "infinity" tokens for CRA compatibility...');

let patchedCount = 0;

walkDir(daisyuiDir, (filePath) => {
  if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('infinity * 1px')) {
      const newContent = content.replace(/infinity \* 1px/g, '9999px');
      fs.writeFileSync(filePath, newContent, 'utf8');
      patchedCount++;
      console.log(`✅ Patched: ${path.relative(daisyuiDir, filePath)}`);
    }
  }
});

console.log(`✨ Successfully patched ${patchedCount} files in daisyUI.`);
