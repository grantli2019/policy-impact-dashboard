/**
 * 政策信源审查脚本
 * 检查所有政策URL的质量：精确文档链接 vs 仅域名链接
 */
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'impactData.js'), 'utf8');

// 提取所有 url 字段
const urlRegex = /url: "([^"]+)"/g;
const urls = [];
let match;
while ((match = urlRegex.exec(content)) !== null) {
  urls.push(match[1]);
}

// 提取所有 policyName
const nameRegex = /policyName: "([^"]+)"/g;
const names = [];
while ((match = nameRegex.exec(content)) !== null) {
  names.push(match[1]);
}

console.log(`=== 政策信源审查报告 ===`);
console.log(`政策条目总数: ${names.length}`);
console.log(`URL 总数: ${urls.length}`);
console.log('');

// 分类URL
const domainOnly = [];
const specific = [];
const invalid = [];

urls.forEach((u, i) => {
  try {
    const parsed = new URL(u);
    const p = parsed.pathname;
    if (p === '/' || p === '' || p === '/index.html' || p === '/index.htm') {
      domainOnly.push({ name: names[i] || `#${i}`, url: u });
    } else {
      specific.push({ name: names[i] || `#${i}`, url: u });
    }
  } catch (e) {
    invalid.push({ name: names[i] || `#${i}`, url: u });
  }
});

console.log(`精确文档链接: ${specific.length} (${Math.round(specific.length/urls.length*100)}%)`);
console.log(`仅域名链接(无具体文档): ${domainOnly.length} (${Math.round(domainOnly.length/urls.length*100)}%)`);
console.log(`无效URL: ${invalid.length}`);
console.log('');

// 按域名统计仅域名链接
const domainGroups = {};
domainOnly.forEach(item => {
  try {
    const d = new URL(item.url).hostname;
    if (!domainGroups[d]) domainGroups[d] = [];
    domainGroups[d].push(item.name);
  } catch {}
});

console.log('--- 仅域名链接分布(需补充精确URL) ---');
Object.entries(domainGroups).sort((a, b) => b[1].length - a[1].length).forEach(([domain, items]) => {
  console.log(`  ${domain}: ${items.length} 条`);
  items.slice(0, 3).forEach(n => console.log(`    - ${n}`));
  if (items.length > 3) console.log(`    ... 还有 ${items.length - 3} 条`);
});

console.log('');
console.log('--- 精确文档链接示例(前5条) ---');
specific.slice(0, 5).forEach(item => {
  console.log(`  ${item.name}`);
  console.log(`    ${item.url}`);
});

if (invalid.length > 0) {
  console.log('');
  console.log('--- 无效URL ---');
  invalid.forEach(item => console.log(`  ${item.name}: ${item.url}`));
}

// 检查是否有政策缺少url字段
const policyBlocks = content.split(/policyName: "/);
let missingUrl = 0;
policyBlocks.slice(1).forEach((block, i) => {
  const nameEnd = block.indexOf('"');
  const name = block.slice(0, nameEnd);
  // 检查该条目附近是否有url
  const nextPolicy = block.indexOf('policyName:');
  const segment = nextPolicy > 0 ? block.slice(0, nextPolicy) : block;
  if (!segment.includes('url:')) {
    missingUrl++;
    console.log(`  [缺失URL] ${name}`);
  }
});

console.log('');
console.log(`=== 总结 ===`);
console.log(`需要补充精确URL的条目: ${domainOnly.length} 条`);
console.log(`信源完整率: ${Math.round(specific.length/urls.length*100)}%`);
