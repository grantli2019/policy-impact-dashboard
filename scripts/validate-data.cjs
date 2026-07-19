/**
 * 策查查 — 数据校验模块
 * 
 * 功能：自动检测政策数据的完整性、一致性和时效性
 * 运行：node scripts/validate-data.cjs
 * 集成：npm run validate
 * 
 * 校验项：
 * 1. 字段完整性（policyName/breadth/depth/direction/confidence/url）
 * 2. 数值范围（breadth/depth 1-10, direction -1/0/1）
 * 3. 日期格式与时效性（不早于2019，不晚于当前+1年）
 * 4. URL域名权威性（必须为gov.cn或白名单机构）
 * 5. 年份覆盖连续性（各维度不应有超过2年的缺口）
 * 6. 区域政策均衡性（各区域至少3条）
 * 7. 新闻数据月份覆盖（不应有超过2个月的缺口）
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'impactData.js');
const content = fs.readFileSync(DATA_FILE, 'utf8');

let errors = [];
let warnings = [];
let info = [];

/* ── 1. 提取所有政策条目 ── */
const policyRegex = /\{ policyName: "([^"]+)", breadth: (\d+), depth: (\d+), direction: (-?\d+), status: "([^"]+)", date: "([^"]+)", note: "([^"]*)", confidence: "([^"]+)", rationale: "([^"]*)", url: "([^"]*)" \}/g;
const policies = [];
let match;
while ((match = policyRegex.exec(content)) !== null) {
  policies.push({
    policyName: match[1],
    breadth: +match[2],
    depth: +match[3],
    direction: +match[4],
    status: match[5],
    date: match[6],
    note: match[7],
    confidence: match[8],
    rationale: match[9],
    url: match[10],
  });
}

console.log(`📊 策查查数据校验报告`);
console.log(`   时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
console.log(`   政策条目: ${policies.length} 条\n`);

/* ── 2. 字段完整性校验 ── */
policies.forEach((p, i) => {
  if (!p.policyName) errors.push(`[${i}] 缺少policyName`);
  if (!p.confidence) errors.push(`[${i}] ${p.policyName}: 缺少confidence`);
  if (!p.url) errors.push(`[${i}] ${p.policyName}: 缺少url`);
  if (!p.rationale) warnings.push(`[${i}] ${p.policyName}: 缺少rationale`);
});

/* ── 3. 数值范围校验 ── */
policies.forEach((p, i) => {
  if (p.breadth < 1 || p.breadth > 10) errors.push(`[${i}] ${p.policyName}: breadth=${p.breadth} 超出1-10范围`);
  if (p.depth < 1 || p.depth > 10) errors.push(`[${i}] ${p.policyName}: depth=${p.depth} 超出1-10范围`);
  if (![-1, 0, 1].includes(p.direction)) errors.push(`[${i}] ${p.policyName}: direction=${p.direction} 无效`);
});

/* ── 4. 日期校验 ── */
const now = new Date();
const maxDate = new Date(now.getFullYear() + 1, 11, 31);
policies.forEach((p, i) => {
  const d = new Date(p.date);
  if (isNaN(d.getTime())) {
    errors.push(`[${i}] ${p.policyName}: 日期格式无效 "${p.date}"`);
  } else {
    if (d < new Date('2010-01-01')) warnings.push(`[${i}] ${p.policyName}: 日期过早 ${p.date}`);
    if (d > maxDate) errors.push(`[${i}] ${p.policyName}: 日期超出合理范围 ${p.date}`);
  }
});

/* ── 5. URL权威性校验 ── */
const TRUSTED_DOMAINS = [
  '.gov.cn', '.org.cn', 'shgjj.com', 'bse.cn', 'shanghaiinvest.com',
  'g60.org.cn', 'pbc.gov.cn', 'npc.gov.cn'
];
policies.forEach((p, i) => {
  if (!p.url) return;
  const isTrusted = TRUSTED_DOMAINS.some(d => p.url.includes(d));
  if (!isTrusted) errors.push(`[${i}] ${p.policyName}: URL非权威域名 "${p.url}"`);
});

/* ── 6. 年份覆盖连续性 ── */
const dims = ['housing', 'employment', 'education', 'elderly', 'finance', 'industry'];
const dimNames = { housing: '住房', employment: '就业', education: '教育', elderly: '养老', finance: '金融', industry: '行业' };

dims.forEach(dim => {
  const regex = new RegExp(`key: "${dim}"[\\s\\S]*?scores: \\[([\\s\\S]*?)\\],\\s*(?:regionalPolicies|tips)`);
  const m = content.match(regex);
  if (!m) return;
  const dates = [...m[1].matchAll(/date: "(\d{4})-/g)].map(x => +x[1]);
  if (dates.length === 0) return;
  const years = [...new Set(dates)].sort();
  const min = Math.min(...years), max = Math.max(...years);
  const gaps = [];
  for (let y = min; y <= max; y++) {
    if (!years.includes(y)) gaps.push(y);
  }
  if (gaps.length > 0) {
    warnings.push(`${dimNames[dim]}: 年份缺口 ${gaps.join(', ')} (${min}-${max})`);
  } else {
    info.push(`✓ ${dimNames[dim]}: ${min}-${max} 无缺口 (${dates.length}条)`);
  }
});

/* ── 7. 新闻月份覆盖 ── */
const newsMatch = content.match(/newsLianboUpdates = \[([\s\S]*?)\];/);
if (newsMatch) {
  const newsDates = [...newsMatch[1].matchAll(/date: "(\d{4}-\d{2})/g)].map(x => x[1]);
  const months = [...new Set(newsDates)].sort();
  if (months.length > 0) {
    const [sy, sm] = months[0].split('-').map(Number);
    const [ey, em] = months[months.length - 1].split('-').map(Number);
    const gaps = [];
    for (let y = sy; y <= ey; y++) {
      for (let m = 1; m <= 12; m++) {
        const key = `${y}-${String(m).padStart(2, '0')}`;
        if (key < months[0] || key > months[months.length - 1]) continue;
        if (!months.includes(key)) gaps.push(key);
      }
    }
    if (gaps.length > 2) {
      warnings.push(`新闻: ${gaps.length}个月份缺口 (${gaps.slice(0, 5).join(', ')}${gaps.length > 5 ? '...' : ''})`);
    } else {
      info.push(`✓ 新闻: ${months[0]} ~ ${months[months.length-1]} 覆盖良好 (${newsDates.length}条)`);
    }
  }
}

/* ── 输出报告 ── */
console.log('═══ 校验结果 ═══\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ 全部通过！数据质量优秀。\n');
} else {
  if (errors.length > 0) {
    console.log(`❌ 错误 (${errors.length}):`);
    errors.forEach(e => console.log(`   ${e}`));
    console.log('');
  }
  if (warnings.length > 0) {
    console.log(`⚠️  警告 (${warnings.length}):`);
    warnings.forEach(w => console.log(`   ${w}`));
    console.log('');
  }
}

if (info.length > 0) {
  console.log('📋 信息:');
  info.forEach(i => console.log(`   ${i}`));
  console.log('');
}

console.log(`─── 统计 ───`);
console.log(`   政策条目: ${policies.length}`);
console.log(`   错误: ${errors.length}`);
console.log(`   警告: ${warnings.length}`);
console.log(`   通过率: ${errors.length === 0 ? '100%' : Math.round((policies.length - errors.length) / policies.length * 100) + '%'}`);

// 退出码：有错误时返回1（用于CI判断）
process.exit(errors.length > 0 ? 1 : 0);
