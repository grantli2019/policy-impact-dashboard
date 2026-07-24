/**
 * 策查查 — App.jsx 组件迁移脚本
 * 功能：移除已提取到独立模块的内联组件定义，启用模块导入
 * 运行：node scripts/migrate-app.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APP_FILE = join(__dirname, '..', 'src', 'App.jsx')

let content = readFileSync(APP_FILE, 'utf8')
const lines = content.split('\n')

console.log(`📄 App.jsx: ${lines.length} 行`)

// 1. 启用被注释的导入
content = content.replace(
  `/* ═══ 重构模块（待完全迁移后启用） ═══ */
// import { useToast } from './hooks/useToast'
// import { useScrollReveal } from './hooks/useScrollReveal'
// import { timeAgo, safeSetItem, migrateDataVersion, DATA_VERSION } from './utils/helpers'
import { useUIStore, useUserStore } from './stores'
// import { BackToTop, Collapsible, AnimatedCounter, RatingBar, BeforeAfterCompare } from './components/widgets'
// import { PersonaModal, RegionSelector, PolicyCards, WeeklyUpdateBar } from './components/shared'
// import { Timeline, LegislativeOutlook, PolicyRadar, PolicyCrossLinks, DecisionSimulator } from './components/features'`,
  `/* ═══ 重构模块导入 ═══ */
import { useToast } from './hooks/useToast'
import { useScrollReveal } from './hooks/useScrollReveal'
import { timeAgo, safeSetItem, migrateDataVersion, DATA_VERSION } from './utils/helpers'
import { useUIStore, useUserStore } from './stores'
import { BackToTop, Collapsible, AnimatedCounter, RatingBar, BeforeAfterCompare } from './components/widgets'
import { PersonaModal, RegionSelector, PolicyCards, WeeklyUpdateBar } from './components/shared'
import { Timeline, LegislativeOutlook, PolicyRadar, PolicyCrossLinks, DecisionSimulator } from './components/features'`
)

// 2. 移除已提取的内联组件定义
// 找到要移除的区块：从 "/* ═══════ 画像选择器 ═══════ */" 到 "/* ═══════ 场景化专题（Special Topic） ═══════ */" 之前
const startMarker = '/* ═══════ 画像选择器 ═══════ */'
const endMarker = '/* ═══════ 场景化专题（Special Topic） ═══════ */'

const startIdx = content.indexOf(startMarker)
const endIdx = content.indexOf(endMarker)

if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
  const removedBlock = content.slice(startIdx, endIdx)
  const removedLines = removedBlock.split('\n').length
  content = content.slice(0, startIdx) + content.slice(endIdx)
  console.log(`✅ 移除内联组件区块: ${removedLines} 行 (PersonaModal → PolicyCards)`)
} else {
  console.log('⚠️ 未找到画像选择器到场景化专题的区块，跳过')
}

// 3. 移除内联 DecisionSimulator（如果在 App 函数之前）
const dsStart = content.indexOf('/* ═══════ 决策模拟器 ═══════ */')
const dsEnd = content.indexOf('/* ═══════ 行动中枢（Action Hub） ═══════ */')
if (dsStart !== -1 && dsEnd !== -1 && dsEnd > dsStart) {
  const removedBlock = content.slice(dsStart, dsEnd)
  const removedLines = removedBlock.split('\n').length
  content = content.slice(0, dsStart) + content.slice(dsEnd)
  console.log(`✅ 移除内联 DecisionSimulator: ${removedLines} 行`)
}

// 4. 移除内联 AnimatedCounter（在 App 函数之前的定义）
const acStart = content.indexOf('/* ═══════ 动画计数器 ═══════ */')
const acEnd = content.indexOf('/* ═══════ 资格自测 Quiz ═══════ */')
if (acStart !== -1 && acEnd !== -1 && acEnd > acStart) {
  const removedBlock = content.slice(acStart, acEnd)
  const removedLines = removedBlock.split('\n').length
  content = content.slice(0, acStart) + content.slice(acEnd)
  console.log(`✅ 移除内联 AnimatedCounter: ${removedLines} 行`)
}

// 5. 移除末尾的 useToast, useScrollReveal, safeSetItem, migrateDataVersion, RatingBar
// 这些在文件末尾（App 函数之后）
const patterns = [
  { start: '/* ═══════ Toast 通知系统 ═══════ */', end: '/* ═══════ 滚动入场动画 Hook ═══════ */' },
  { start: '/* ═══════ 滚动入场动画 Hook ═══════ */', end: '/* ═══════ localStorage 安全工具 ═══════ */' },
  { start: '/* ═══════ localStorage 安全工具 ═══════ */', end: '/* 数据版本迁移 */' },
  { start: '/* 数据版本迁移 */', end: 'export default App' },
]

for (const { start, end } of patterns) {
  const sIdx = content.indexOf(start)
  const eIdx = content.indexOf(end)
  if (sIdx !== -1 && eIdx !== -1 && eIdx > sIdx) {
    const removedBlock = content.slice(sIdx, eIdx)
    const removedLines = removedBlock.split('\n').length
    content = content.slice(0, sIdx) + content.slice(eIdx)
    console.log(`✅ 移除末尾工具函数: ${removedLines} 行 (${start.slice(3, 20)}...)`)
  }
}

// 6. 移除内联 RatingBar（在文件末尾附近）
const rbPattern = 'const RatingBar = memo(function RatingBar'
const rbIdx = content.indexOf(rbPattern)
if (rbIdx !== -1) {
  // 找到这个 const 声明的结尾（下一个 /* 注释或 export）
  const afterRb = content.indexOf('/* ═══════', rbIdx + 10)
  const exportIdx = content.indexOf('export default App', rbIdx)
  const endPos = Math.min(
    afterRb !== -1 ? afterRb : Infinity,
    exportIdx !== -1 ? exportIdx : Infinity
  )
  if (endPos !== Infinity) {
    const removedBlock = content.slice(rbIdx, endPos)
    const removedLines = removedBlock.split('\n').length
    content = content.slice(0, rbIdx) + content.slice(endPos)
    console.log(`✅ 移除内联 RatingBar: ${removedLines} 行`)
  }
}

// 7. 移除 DATA_VERSION 常量（现在从 utils/helpers 导入）
content = content.replace("const DATA_VERSION = '3.1.0'\n", '')

// 写回文件
writeFileSync(APP_FILE, content, 'utf8')
const newLines = content.split('\n').length
console.log(`\n📄 App.jsx 迁移完成: ${lines.length} → ${newLines} 行 (减少 ${lines.length - newLines} 行)`)
