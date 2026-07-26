// Remove orphaned PolicySearch function body from App.jsx
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'App.jsx');
const lines = fs.readFileSync(file, 'utf8').split('\n');

// Find the orphaned block: starts with "/* ═══════ P2: 付费墙" followed by indented "const [query"
// Ends just before the SECOND "/* ═══════ P2: 付费墙"
let startIdx = -1;
let endIdx = -1;
let foundFirst = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('P2: 付费墙')) {
    if (!foundFirst) {
      // Check if next line is indented "const [query" (orphaned body)
      if (i + 1 < lines.length && lines[i + 1].trimStart().startsWith('const [query')) {
        startIdx = i;
        foundFirst = true;
      }
    } else {
      // This is the real P2 section
      endIdx = i;
      break;
    }
  }
}

if (startIdx === -1 || endIdx === -1) {
  console.log('Could not find orphaned block boundaries');
  console.log('startIdx:', startIdx, 'endIdx:', endIdx);
  process.exit(1);
}

console.log(`Removing lines ${startIdx + 1} to ${endIdx} (${endIdx - startIdx} lines)`);
const newLines = [...lines.slice(0, startIdx), '', ...lines.slice(endIdx)];
fs.writeFileSync(file, newLines.join('\n'), 'utf8');
console.log(`Done. File now has ${newLines.length} lines (was ${lines.length})`);
