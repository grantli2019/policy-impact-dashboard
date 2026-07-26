/**
 * 将 src/data/impactData.js 按功能域拆分为多个模块
 * 实现首屏按需加载，减少初始 bundle 体积
 * 
 * 拆分方案：
 *   core.js    — 首屏必需（评分引擎+维度数据+区域+画像）~870行
 *   content.js — 静态内容（关键发现+立法展望+行动计划等）~427行
 *   topics.js  — 专题+推荐引擎 ~1369行
 *   news.js    — 新闻数据+函数 ~231行
 *   life.js    — 人生雷达+城市安家 ~631行
 *   quiz.js    — 题库+案例 ~147行
 *   gamification.js — 游戏化+用户状态 ~898行
 *   signals.js — 政策风向标+体检+周报 ~313行
 * 
 * 用法: node scripts/split-policy-data.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src/data/impactData.js');
const OUT_DIR = path.join(ROOT, 'src/data');

const content = fs.readFileSync(SRC, 'utf-8');
const lines = content.split('\n');
console.log(`[split] 源文件 ${lines.length} 行, ${(content.length / 1024).toFixed(1)} KB`);

// 按行范围定义模块（1-based → 0-based）
const modules = [
  {
    name: 'core',
    desc: '核心评分引擎 + 维度数据 + 区域 + 画像（首屏必需）',
    start: 1, end: 870,
    imports: [], // 自包含
  },
  {
    name: 'content',
    desc: '静态内容数据（关键发现/立法展望/方法论/行动计划/术语/里程碑）',
    start: 871, end: 1297,
    imports: [], // 纯数据
  },
  {
    name: 'topics',
    desc: '专题视图 + 决策场景 + 推荐引擎',
    start: 1298, end: 2666,
    imports: [{ from: './core', names: ['personas', 'dimensions', 'calcDimensionScore', 'getIndexLevel'] }],
  },
  {
    name: 'news',
    desc: '新闻联播/30分政策速递 + 个性化过滤',
    start: 2667, end: 2898,
    imports: [{ from: './signals', names: ['getPolicyCompass'] }],
  },
  {
    name: 'life',
    desc: '人生雷达 + 城市安家 + 统一行动',
    start: 2899, end: 3530,
    imports: [{ from: './core', names: ['personas', 'dimensions', 'calcDimensionScore', 'getIndexLevel'] }],
  },
  {
    name: 'quiz',
    desc: '政策盲区自测题库 + 案例墙 + 场景组',
    start: 3531, end: 3679,
    imports: [],
  },
  {
    name: 'gamification',
    desc: '游戏化系统 + 用户状态 + 成就 + 每日挑战',
    start: 3680, end: 4577,
    imports: [
      { from: './core', names: ['personas', 'dimensions'] },
      { from: './content', names: ['deadlines', 'legislativeOutlook'] },
      { from: './life', names: ['lifeRadar'] },
      { from: './quiz', names: ['enhancedTestimonials', 'selfTestQuestions', 'getQuizHistory', 'scenarioGroups'] },
    ],
  },
  {
    name: 'signals',
    desc: '政策风向标 + 体检诊断 + 个性化周报',
    start: 4578, end: 4890,
    imports: [
      { from: './core', names: ['personas'] },
      { from: './life', names: ['lifeRadar'] },
    ],
  },
];

// 生成每个模块文件
for (const mod of modules) {
  const sectionLines = lines.slice(mod.start - 1, mod.end);
  const header = [
    `/**`,
    ` * ${mod.desc}`,
    ` * 由 scripts/split-policy-data.mjs 从 impactData.js 拆分生成`,
    ` * 行范围: ${mod.start}-${mod.end} (${mod.end - mod.start + 1} 行)`,
    ` */`,
  ];

  const importLines = mod.imports.map(imp => {
    return `import { ${imp.names.join(', ')} } from '${imp.from}';`;
  });

  const fileContent = [...header, '', ...importLines, '', ...sectionLines, ''].join('\n');
  const filePath = path.join(OUT_DIR, `${mod.name}.js`);
  fs.writeFileSync(filePath, fileContent, 'utf-8');
  console.log(`  ✓ ${mod.name}.js (${(fileContent.length / 1024).toFixed(1)} KB, ${sectionLines.length} 行)`);
}

// 生成 barrel 文件 impactData.js（重新导出所有模块）
const barrelLines = [
  `/**`,
  ` * 策查查 — 政策影响力评估引擎 v3.0`,
  ` * Barrel 文件：统一导出所有模块（向后兼容）`,
  ` * 由 scripts/split-policy-data.mjs 生成`,
  ` *`,
  ` * ⚠️ 性能提示：直接导入具体模块（如 ./core, ./news）可获得更好的 code-splitting`,
  ` */`,
  ``,
  `export * from './core';`,
  `export * from './content';`,
  `export * from './topics';`,
  `export * from './news';`,
  `export * from './life';`,
  `export * from './quiz';`,
  `export * from './gamification';`,
  `export * from './signals';`,
  ``,
];
fs.writeFileSync(SRC, barrelLines.join('\n'), 'utf-8');
console.log(`  ✓ impactData.js (barrel, ${barrelLines.length} 行)`);

console.log(`\n[split] 完成！共生成 ${modules.length + 1} 个文件`);
console.log(`[split] 下一步：更新 vite.config.js 移除 impactData manualChunks`);
