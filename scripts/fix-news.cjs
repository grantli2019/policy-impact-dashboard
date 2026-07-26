// Remove inline NewsLianboPanel + PolicyCalendar from App.jsx, replace with import
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'App.jsx');
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Find start: "function NewsLianboPanel"
const startIdx = lines.findIndex(l => l.startsWith('function NewsLianboPanel'));
// Find end: "/* ═══════ 人生雷达 — 扫描算法 ═══════ */"
const endIdx = lines.findIndex(l => l.includes('人生雷达 — 扫描算法'));

if (startIdx === -1 || endIdx === -1) {
  console.log('Could not find boundaries. start:', startIdx, 'end:', endIdx);
  process.exit(1);
}

console.log(`Removing lines ${startIdx + 1} to ${endIdx} (${endIdx - startIdx} lines)`);

const replacement = [
  "/* [已提取到独立模块] NewsLianboPanel + PolicyCalendar → components/NewsPanel.jsx (217行) */",
  "import NewsLianboPanel, { PolicyCalendar } from './components/NewsPanel'",
  "",
];

const newLines = [...lines.slice(0, startIdx), ...replacement, ...lines.slice(endIdx)];
fs.writeFileSync(file, newLines.join('\n'), 'utf8');
console.log(`Done. File now has ${newLines.length} lines (was ${lines.length}, removed ${lines.length - newLines.length})`);
