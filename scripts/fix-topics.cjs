// Remove inline SpecialTopicView + GenericTopicView from App.jsx, replace with import
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'App.jsx');
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Find start: "/* ═══════ 场景化专题（Special Topic） ═══════ */"
const startIdx = lines.findIndex(l => l.includes('场景化专题（Special Topic）'));
// Find end: "/* ═══════ 行动中枢（Action Hub） ═══════ */"
const endIdx = lines.findIndex(l => l.includes('行动中枢（Action Hub）'));

if (startIdx === -1 || endIdx === -1) {
  console.log('Could not find boundaries. start:', startIdx, 'end:', endIdx);
  process.exit(1);
}

console.log(`Removing lines ${startIdx + 1} to ${endIdx} (${endIdx - startIdx} lines)`);

// Replace the block with import + comment
const replacement = [
  "/* [已提取到独立模块] SpecialTopicView + GenericTopicView → components/TopicViews.jsx (482行) */",
  "import { SpecialTopicView, GenericTopicView } from './components/TopicViews'",
  "",
];

const newLines = [...lines.slice(0, startIdx), ...replacement, ...lines.slice(endIdx)];
fs.writeFileSync(file, newLines.join('\n'), 'utf8');
console.log(`Done. File now has ${newLines.length} lines (was ${lines.length}, removed ${lines.length - newLines.length})`);
