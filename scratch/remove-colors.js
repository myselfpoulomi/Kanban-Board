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

const replaceRules = [
  // Buttons / Loaders / Rings
  { from: /bg-violet-400/g, to: 'bg-white' },
  { from: /border-t-violet-400/g, to: 'border-t-white' },
  { from: /bg-violet-500/g, to: 'bg-white text-black' },
  { from: /text-white shadow-sm transition hover:bg-violet-600/g, to: 'shadow-sm transition hover:bg-gray-200' }, // fix for button text color
  { from: /ring-violet-500\/30/g, to: 'ring-white/30' },
  { from: /ring-violet-500/g, to: 'ring-white' },
  { from: /border-violet-500\/40/g, to: 'border-white/40' },
  
  // Text colors
  { from: /text-violet-400/g, to: 'text-gray-300' },
  { from: /text-violet-300/g, to: 'text-white' },
  { from: /text-red-400/g, to: 'text-white' }, // delete modal headers / errors
  { from: /border-red-400/g, to: 'border-white' }, 
  { from: /bg-red-500\/10/g, to: 'bg-white/10' },
  { from: /bg-red-500\/20/g, to: 'bg-white/20' },
  { from: /border-red-500\/20/g, to: 'border-white/20' },
  
  { from: /text-amber-300/g, to: 'text-gray-300' },
  { from: /text-amber-400/g, to: 'text-gray-300' },
  { from: /bg-amber-500\/5/g, to: 'bg-white/5' },
  { from: /bg-amber-500\/10/g, to: 'bg-white/10' },
  { from: /border-amber-500\/20/g, to: 'border-white/20' },
  { from: /accent-amber-500/g, to: 'accent-white' },

  { from: /bg-blue-500\/10/g, to: 'bg-white/10' },
  { from: /text-blue-400/g, to: 'text-gray-300' },
  { from: /border-blue-500\/20/g, to: 'border-white/20' },

  { from: /bg-emerald-500\/90/g, to: 'bg-white' },
  { from: /text-black/g, to: 'text-black' }, // Emerald badge text
  { from: /bg-violet-500\/20/g, to: 'bg-white/20' },

  // Hex colors in Label.js
  { from: /bg-\[#f87171\]/g, to: 'bg-gray-200 text-black' },
  { from: /bg-\[#f4a3b5\]/g, to: 'bg-gray-300 text-black' },
  { from: /bg-\[#fb923c\]/g, to: 'bg-gray-400 text-black' },
  { from: /bg-\[#4ade80\]/g, to: 'bg-gray-500 text-white' },
  { from: /bg-\[#38bdf8\]/g, to: 'bg-gray-600 text-white' },
];

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content;
    
    replaceRules.forEach(rule => {
      newContent = newContent.replace(rule.from, rule.to);
    });

    // special fix for the kanbanboard button text-white being overridden
    newContent = newContent.replace(/bg-white text-black px-3 py-1.5 text-xs font-medium text-white/g, 'bg-white text-black px-3 py-1.5 text-xs font-medium');
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`Removed colors in ${filePath}`);
    }
  }
});
