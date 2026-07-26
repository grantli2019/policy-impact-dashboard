// Remove inline Dashboard from App.jsx, replace with import
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'App.jsx');
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Find start: "/* ═══════ B3: 个人仪表盘 ═══════ */"
const startIdx = lines.findIndex(l => l.includes('B3: 个人仪表盘'));
// Find end: "/* ═══════ B4: 智能推荐 ═══════ */"
const endIdx = lines.findIndex(l => l.includes('B4: 智能推荐'));

if (startIdx === -1 || endIdx === -1) {
  console.log('Could not find boundaries. start:', startIdx, 'end:', endIdx);
  process.exit(1);
}

console.log(`Removing lines ${startIdx + 1} to ${endIdx} (${endIdx - startIdx} lines)`);

// Replace the block with import + comment
const replacement = [
  "/* [已提取到独立模块] Dashboard → components/Dashboard.jsx (220行) */",
  "import Dashboard from './components/Dashboard'",
  "",
];

const newLines = [...lines.slice(0, startIdx), ...replacement, ...lines.slice(endIdx)];
fs.writeFileSync(file, newLines.join('\n'), 'utf8');
console.log(`Done. File now has ${newLines.length} lines (was ${lines.length}, removed ${lines.length - newLines.length})`);
