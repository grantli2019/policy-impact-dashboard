// Remove inline SelfTestQuiz + DailyChallengeModal from App.jsx, replace with import
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'App.jsx');
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Find DailyChallengeModal start
const dcmStart = lines.findIndex(l => l.includes('每日洞察挑战弹窗 v2'));
// Find SelfTestQuiz end (next function after SelfTestQuiz)
const stqEnd = lines.findIndex(l => l.includes('P2: 政策订阅弹窗'));

if (dcmStart === -1 || stqEnd === -1) {
  console.log('Could not find boundaries. dcmStart:', dcmStart, 'stqEnd:', stqEnd);
  process.exit(1);
}

console.log(`Removing lines ${dcmStart + 1} to ${stqEnd} (${stqEnd - dcmStart} lines)`);

const replacement = [
  "/* [已提取到独立模块] DailyChallengeModal + SelfTestQuiz → components/QuizModals.jsx (360行) */",
  "import { DailyChallengeModal, SelfTestQuiz } from './components/QuizModals'",
  "",
];

const newLines = [...lines.slice(0, dcmStart), ...replacement, ...lines.slice(stqEnd)];
fs.writeFileSync(file, newLines.join('\n'), 'utf8');
console.log(`Done. File now has ${newLines.length} lines (was ${lines.length}, removed ${lines.length - newLines.length})`);
