// Remove inline PolicyMonitor from App.jsx, replace with import
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'App.jsx');
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Find start: "function PolicyMonitor()"
const startIdx = lines.findIndex(l => l.startsWith('function PolicyMonitor()'));
// Find end: "/* ═══════ P4: 政策关系图谱 ═══════ */"
const endIdx = lines.findIndex(l => l.includes('P4: 政策关系图谱'));

if (startIdx === -1 || endIdx === -1) {
  console.log('Could not find boundaries. start:', startIdx, 'end:', endIdx);
  process.exit(1);
}

console.log(`Removing lines ${startIdx + 1} to ${endIdx} (${endIdx - startIdx} lines)`);

const replacement = [
  "/* [已提取到独立模块] PolicyMonitor → components/PolicyMonitor.jsx (101行) */",
  "import PolicyMonitor from './components/PolicyMonitor'",
  "",
];

const newLines = [...lines.slice(0, startIdx), ...replacement, ...lines.slice(endIdx)];
fs.writeFileSync(file, newLines.join('\n'), 'utf8');
console.log(`Done. File now has ${newLines.length} lines (was ${lines.length}, removed ${lines.length - newLines.length})`);
