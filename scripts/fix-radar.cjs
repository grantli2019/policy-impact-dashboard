// Remove inline runRadarScan + RadarChart + LifeRadar from App.jsx, replace with import
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'App.jsx');
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Find start: "function runRadarScan(stageKey, currentDims) {"
const startIdx = lines.findIndex(l => l.startsWith('function runRadarScan(stageKey, currentDims)'));
// Find end: the line before "/* ═══════ SmartRecommendations"
const endIdx = lines.findIndex(l => l.includes('SmartRecommendations: 首页智能推荐区'));

if (startIdx === -1 || endIdx === -1) {
  console.log('Could not find boundaries. start:', startIdx, 'end:', endIdx);
  process.exit(1);
}

console.log(`Removing lines ${startIdx + 1} to ${endIdx} (${endIdx - startIdx} lines)`);

// Replace the block with import + comment
const replacement = [
  "/* [已提取到独立模块] runRadarScan + RadarChart + LifeRadar → components/LifeRadar.jsx (480行) */",
  "import LifeRadar from './components/LifeRadar'",
  "",
];

const newLines = [...lines.slice(0, startIdx), ...replacement, ...lines.slice(endIdx)];
fs.writeFileSync(file, newLines.join('\n'), 'utf8');
console.log(`Done. File now has ${newLines.length} lines (was ${lines.length}, removed ${lines.length - newLines.length})`);
