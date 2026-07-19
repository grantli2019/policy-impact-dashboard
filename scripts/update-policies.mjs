/**
 * 策查查 — 政策数据自动更新脚本
 * 
 * 功能：从政府官方网站抓取最新政策动态，生成结构化数据
 * 运行：node scripts/update-policies.mjs
 * 定时：GitHub Actions 每周一 08:00 (UTC+8) 自动执行
 * 
 * 数据源：
 * - 中国政府网 (gov.cn) — 国务院政策文件
 * - 人社部 (mohrss.gov.cn) — 就业/社保
 * - 住建部 (mohurd.gov.cn) — 住房/公积金
 * - 教育部 (moe.gov.cn) — 教育
 * - 国家医保局 (nhsa.gov.cn) — 医疗/养老
 * - 央行 (pbc.gov.cn) — 金融/利率
 */

import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

/* ── 数据源配置 ── */
const SOURCES = [
  {
    id: 'gov_cn',
    name: '中国政府网',
    url: 'https://www.gov.cn/zhengce/zuixin/',
    dim: 'industry',
    issuingBody: '国务院',
  },
  {
    id: 'mohrss',
    name: '人社部',
    url: 'https://www.mohrss.gov.cn/xxgk2020/fdzdgknr/zcfg/',
    dim: 'employment',
    issuingBody: '人社部',
  },
  {
    id: 'mohurd',
    name: '住建部',
    url: 'https://www.mohurd.gov.cn/gongkai/fdzdgknr/zqyj/',
    dim: 'housing',
    issuingBody: '住建部',
  },
  {
    id: 'moe',
    name: '教育部',
    url: 'http://www.moe.gov.cn/jyb_xxgk/moe_1777/moe_1778/',
    dim: 'education',
    issuingBody: '教育部',
  },
  {
    id: 'nhsa',
    name: '国家医保局',
    url: 'https://www.nhsa.gov.cn/col/col7/index.html',
    dim: 'elderly',
    issuingBody: '国家医保局',
  },
  {
    id: 'pbc',
    name: '央行',
    url: 'http://www.pbc.gov.cn/zhengcehuobisi/125207/125213/index.html',
    dim: 'finance',
    issuingBody: '中国人民银行',
  },
]

/* ── 抓取逻辑（使用 fetch API，Node 18+ 内置） ── */
async function fetchSource(source) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CechachaBot/1.0; Policy Research)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })
    clearTimeout(timeout)
    
    if (!res.ok) {
      console.warn(`  ⚠ ${source.name}: HTTP ${res.status}`)
      return []
    }
    
    const html = await res.text()
    return parsePolicyLinks(html, source)
  } catch (err) {
    console.warn(`  ✗ ${source.name}: ${err.message}`)
    return []
  }
}

/* ── HTML 解析：提取政策标题和链接 ── */
function parsePolicyLinks(html, source) {
  const results = []
  // 匹配常见的政策列表项模式
  const patterns = [
    // gov.cn 格式: <a href="..." ...>标题</a>
    /<a[^>]+href="([^"]*(?:content|art|info)[^"]*)"[^>]*>([^<]{8,80})<\/a>/g,
    // 通用格式: <li><a href="...">标题</a><span>日期</span></li>
    /<li[^>]*>\s*<a[^>]+href="([^"]+)"[^>]*>([^<]{8,80})<\/a>/g,
  ]
  
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(html)) !== null && results.length < 10) {
      const [, url, title] = match
      const cleanTitle = title.replace(/&[a-z]+;/g, '').trim()
      if (cleanTitle.length >= 8 && !cleanTitle.includes('更多') && !cleanTitle.includes('首页')) {
        results.push({
          title: cleanTitle,
          url: url.startsWith('http') ? url : new URL(url, source.url).href,
          source: source.name,
          dim: source.dim,
          issuingBody: source.issuingBody,
          date: new Date().toISOString().slice(0, 10),
        })
      }
    }
  }
  return results
}

/* ── 生成 weeklyUpdates 格式数据 ── */
function toWeeklyUpdate(item) {
  return {
    date: item.date,
    dim: item.dim,
    type: 'new',
    text: item.title,
    impact: '偏利好', // 默认偏利好，人工审核时调整
    source: item.source,
    url: item.url,
  }
}

/* ── 主流程 ── */
async function main() {
  console.log('🧭 策查查政策数据自动更新')
  console.log(`   时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`)
  console.log(`   数据源: ${SOURCES.length} 个政府官方网站\n`)
  
  const allItems = []
  
  for (const source of SOURCES) {
    console.log(`  → 抓取 ${source.name}...`)
    const items = await fetchSource(source)
    console.log(`    获取 ${items.length} 条`)
    allItems.push(...items)
    
    // 礼貌延迟，避免频繁请求
    await new Promise(r => setTimeout(r, 2000))
  }
  
  console.log(`\n📊 总计获取: ${allItems.length} 条政策动态`)
  
  if (allItems.length === 0) {
    console.log('⚠ 未获取到新数据，跳过更新')
    return
  }
  
  // 生成更新数据文件
  const updates = allItems.map(toWeeklyUpdate)
  const outputFile = join(ROOT, 'scripts', 'latest-updates.json')
  writeFileSync(outputFile, JSON.stringify(updates, null, 2), 'utf8')
  console.log(`\n✅ 已写入: scripts/latest-updates.json (${updates.length} 条)`)
  
  // 生成变更摘要
  const summary = updates.map(u => `- [${u.dim}] ${u.text} (${u.source})`).join('\n')
  const summaryFile = join(ROOT, 'scripts', 'update-summary.md')
  writeFileSync(summaryFile, `# 政策数据更新 ${new Date().toISOString().slice(0, 10)}\n\n${summary}\n`, 'utf8')
  console.log(`✅ 已写入: scripts/update-summary.md`)
  
  console.log('\n💡 下一步: 人工审核后合并到 src/data/impactData.js')
}

main().catch(err => {
  console.error('❌ 更新失败:', err.message)
  process.exit(1)
})
