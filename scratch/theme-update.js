const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../client/src');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const colorMap = {
  '#0f0f10': '#000000', // main bg
  '#111112': '#000000', // sidebar bg
  '#121214': '#050505', // filter bar bg
  '#141416': '#0a0a0a', // kanban col
  '#1a1a1c': '#0a0a0a',
  '#1b1b1d': '#0a0a0a',
  '#1c1c1f': '#0a0a0a',
  '#1f1f24': '#0f0f0f',
  '#202024': '#111111',
  '#242426': '#1a1a1a', // borders
  '#252528': '#111111',
  '#28282c': '#1a1a1a', // dashed border
  '#29292c': '#141414', // sidebar active
  '#2c2c2f': '#222222', // scrollbar
  '#2f3032': '#222222',
  '#303033': '#222222', // inputs/cards border
  '#35353a': '#2a2a2a', // hover bg
  '#3b3b3f': '#333333',
  '#404048': '#333333',
};

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content;
    
    for (const [oldColor, newColor] of Object.entries(colorMap)) {
      const regex = new RegExp(oldColor, 'g');
      newContent = newContent.replace(regex, newColor);
    }
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`Updated ${filePath}`);
    }
  }
});
