// Remove inline ReportExport + RegionCompare + EligibilityQuiz + PolicyGraph + SmartRecommendations from App.jsx
// These are between "/* ═══════ A2: PDF 报告导出 ═══════ */" and "function App() {"
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'App.jsx');
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Find start: "/* ═══════ A2: PDF 报告导出 ═══════ */"
const startIdx = lines.findIndex(l => l.includes('A2: PDF 报告导出'));
// Find end: "function App() {"
const endIdx = lines.findIndex(l => l.startsWith('function App() {'));

if (startIdx === -1 || endIdx === -1) {
  console.log('Could not find boundaries. start:', startIdx, 'end:', endIdx);
  process.exit(1);
}

console.log(`Removing lines ${startIdx + 1} to ${endIdx} (${endIdx - startIdx} lines)`);

const replacement = [
  "/* [已提取到独立模块] ReportExport, RegionCompare, EligibilityQuiz, PolicyGraph, SmartRecommendations → components/Panels.jsx */",
  "import { ReportExport, RegionCompare, EligibilityQuiz, PolicyGraph, SmartRecommendations } from './components/Panels'",
  "",
];

const newLines = [...lines.slice(0, startIdx), ...replacement, ...lines.slice(endIdx)];
fs.writeFileSync(file, newLines.join('\n'), 'utf8');
console.log(`Done. File now has ${newLines.length} lines (was ${lines.length}, removed ${lines.length - newLines.length})`);
