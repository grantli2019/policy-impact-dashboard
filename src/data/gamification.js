/**
 * 游戏化系统 + 用户状态 + 成就 + 每日挑战
 * 由 scripts/split-policy-data.mjs 从 impactData.js 拆分生成
 * 行范围: 3680-4577 (898 行)
 */

import { personas, dimensions } from './core';
import { deadlines, legislativeOutlook } from './content';
import { lifeRadar } from './life';
import { enhancedTestimonials, selfTestQuestions, getQuizHistory, scenarioGroups } from './quiz';

export function getPolicyAlerts() {
  const now = new Date()
  const alerts = []
  deadlines.forEach(d => {
    const deadlineDate = new Date(d.date)
    const daysLeft = Math.ceil((deadlineDate - now) / 86400000)
    if (daysLeft > 0 && daysLeft <= 30) {
      alerts.push({ id: d.id, title: d.title, deadline: d.date, daysLeft, status: daysLeft <= 7 ? '紧急' : daysLeft <= 14 ? '临近' : '关注', type: 'deadline', dim: d.dim || 'housing' })
    }
  })
  legislativeOutlook.forEach?.(lo => {
    if (lo.status && lo.status.includes('审议')) {
      alerts.push({ id: lo.id || lo.name, title: lo.name || lo.title, status: '审议中', type: 'legislation', dim: lo.dim || 'housing' })
    }
  })
  if (typeof legislativeOutlook === 'object' && !Array.isArray(legislativeOutlook)) {
    Object.values(legislativeOutlook).forEach(arr => {
      if (Array.isArray(arr)) {
        arr.forEach(lo => {
          if (lo.status && lo.status.includes('审议') && !alerts.find(a => a.id === (lo.id || lo.name))) {
            alerts.push({ id: lo.id || lo.name, title: lo.name || lo.title, status: '审议中', type: 'legislation', dim: lo.dim || 'housing' })
          }
        })
      }
    })
  }
  return alerts.slice(0, 5)
}
export function getPolicySubscriptions() {
  try { return JSON.parse(localStorage.getItem(subsKey) || '[]') } catch { return [] }
}
export function togglePolicySubscription(policyId, policyName) {
  const subs = getPolicySubscriptions()
  const idx = subs.findIndex(s => s.id === policyId)
  if (idx >= 0) subs.splice(idx, 1)
  else subs.push({ id: policyId, name: policyName, subscribedAt: new Date().toISOString() })
  localStorage.setItem(subsKey, JSON.stringify(subs))
  return subs
}

/* ── 用户见证 UGC ──────────────────────────────────────────── */
const testimonialsKey = 'user_testimonials'
export function submitUserTestimonial(data) {
  const list = getUserTestimonials()
  list.unshift({ id: 'ut' + Date.now(), ...data, date: new Date().toISOString() })
  localStorage.setItem(testimonialsKey, JSON.stringify(list.slice(0, 50)))
  return list
}
export function getUserTestimonials() {
  try { return JSON.parse(localStorage.getItem(testimonialsKey) || '[]') } catch { return [] }
}
export function getAllTestimonials() {
  const userGenerated = getUserTestimonials()
  return [...userGenerated, ...enhancedTestimonials]
}

/* ── 用户画像存储 ──────────────────────────────────────────── */
const profileKey = 'user_profile'
const toolResultsKey = 'tool_results'
export function getUserProfile() {
  try { return JSON.parse(localStorage.getItem(profileKey) || '{}') } catch { return {} }
}
export function saveUserProfile(data) {
  const existing = getUserProfile()
  const merged = { ...existing, ...data, updatedAt: new Date().toISOString() }
  localStorage.setItem(profileKey, JSON.stringify(merged))
  return merged
}
export function saveToolResult(toolName, inputs, outputs) {
  const results = getToolResults()
  results.unshift({ id: 'tr' + Date.now(), toolName, inputs, outputs, date: new Date().toISOString() })
  localStorage.setItem(toolResultsKey, JSON.stringify(results.slice(0, 30)))
  return results
}
export function getToolResults() {
  try { return JSON.parse(localStorage.getItem(toolResultsKey) || '[]') } catch { return [] }
}

/* ── 每日洞察挑战 v2 — 三模式：个人关联·趋势预判·连接生活 ──── */
const challengeKey = 'daily_challenge'
const streakKey = 'daily_streak'
const challengeDoneKey = 'challenge_done'
const insightVotesKey = 'insight_votes'

// ═══ 题库 ═══
const insightPool = [
  // ── impact: 个人关联型 ──
  { mode:'impact', id:'i1',
    title:'🏠 房贷利率下调，你的机会来了？',
    hook:'最新LPR继续下行，多地首套房贷利率已降至3%出头。这个变化，跟你有关系吗？',
    check: (p) => p.hasHouse, reason:'你有房贷，利率每降0.1%每年约省1000-3000元',
    altCheck: (p) => !p.hasHouse && p.age >= 25, altReason:'你还没买房，低利率时代首套上车成本更低',
    calc:(p)=>{ if(p.hasHouse) return { save:Math.round(300000*0.0015*(p.city?.includes('北京')||p.city?.includes('上海')?1.5:1)), unit:'/年省（LPR联动）'}; return { save:Math.round(50000*0.01), unit:'首付门槛降低（估值）'} }
  },
  { mode:'impact', id:'i2',
    title:'👶 婴幼儿照护扣除又提了，你能多拿多少？',
    hook:'个税专项扣除中婴幼儿照护项从每月1000元提至2000元，每年多退240-1080元。你家有3岁以下宝宝吗？',
    check: (p) => p.hasChild, reason:'你有子女，若孩子在3岁以下，每月2000元照护扣除可节税',
    altCheck: (p) => !p.hasChild && p.age >= 25 && p.age <= 40, altReason:'你还未育，这个政策信号：国家在真金白银鼓励生育',
    calc:(p)=>{ return { save:2400, unit:'/年·孩退税'} }
  },
  { mode:'impact', id:'i3',
    title:'💼 灵活就业社保补贴，你符合条件吗？',
    hook:'多省市对灵活就业人员缴纳社保给予3-5年补贴，每人每年最多补贴数千元。你是自由职业者吗？',
    check: (p) => p.isSelfEmployed, reason:'作为自由职业者，以灵活就业身份参保可享缴费补贴，部分地区补贴比例达2/3',
    altCheck: (p) => !p.isSelfEmployed && p.age <= 35, altReason:'你目前在职，但了解灵活就业社保权益有助于未来职业选择',
    calc:(p)=>{ return p.isSelfEmployed ? {save:4500,unit:'/年补贴'} : {save:3000,unit:'潜在补贴（若切换灵活就业）'} }
  },
  { mode:'impact', id:'i4',
    title:'🎓 人才落户门槛再降，你的城市在抢你吗？',
    hook:'2025年多地放宽落户限制，本科即可落户大多数城市，硕士博士还有额外安家费。',
    check: (p) => ['本科','硕士','博士'].includes(p.education), reason:'你的学历在多城可走人才绿色通道，安家费10-50万',
    altCheck: (p) => ['高中及以下','大专'].includes(p.education), altReason:'你的学历在部分城市需积分落户，可考虑"学历+技能"双通道',
    calc:(p)=>{ const bonus={硕士:150000,博士:300000,本科:50000}; return {save:bonus[p.education]||20000, unit:'安家补贴（估值）'} }
  },
  { mode:'impact', id:'i5',
    title:'👴 个人养老金账户，现在开还是再等等？',
    hook:'个人养老金年缴12000元上限，最高节税5400元/年。越早开户复利效应越强。',
    check: (p) => p.age >= 35, reason:'35岁以上开户到退休仍有充足时间，复利效应显著',
    altCheck: (p) => p.age < 35, altReason:'你还年轻，但"时间就是最大的复利"——越早越划算',
    calc:(p)=>{ const years=60-p.age; return {save:Math.round(5400*years*0.7),unit:`到退休累计退税额`} }
  },
  // ── forecast: 趋势预判型（无标准答案，看社群分布）──
  { mode:'forecast', id:'f1',
    title:'📊 1-5月企业利润增长3.4%，释放什么信号？',
    hook:'统计局数据：前5个月工业企业利润总额同比增长3.4%。这条数据背后，你看到了什么趋势？',
    options: [
      { key:'A', label:'持续复苏，消费回暖在即', angle:'利好消费、服务业。企业盈利改善→扩大招工→居民收入预期好转→消费力回升。重点关注餐饮旅游、文娱等可选消费。', sectors:'消费服务', indicator:'⬆️' },
      { key:'B', label:'增长后劲不足，成本压力仍在', angle:'利润增3.4%但收入仅增2.9%，说明"降本"驱动而非"增收"。PPI持续低迷，企业议价能力弱，需谨慎。', sectors:'制造业', indicator:'➡️' },
      { key:'C', label:'结构性分化，高端制造领跑', angle:'新能源汽车、光伏、高端装备利润增速远超平均。传统行业仍在出清。"新质生产力"才是真主线。', sectors:'科技制造', indicator:'⬆️' },
      { key:'D', label:'利润修复≠经济见底，观望为宜', angle:'1-5月数据存在基期效应（去年同期低基数）。需看下半年地产+出口走向才能确认趋势。', sectors:'整体', indicator:'⬇️' },
    ],
    connect:(p)=>{ return `如果复苏持续，${p.city||'你的城市'}的制造业/服务业岗位需求可能上升，薪资谈判空间增大。` },
    dims:['industry','finance']
  },
  { mode:'forecast', id:'f2',
    title:'🏠 2025下半年全国房价会怎么走？',
    hook:'上半年多个一二线城市二手房成交量回暖，但价格仍在阴跌。下半年房价会企稳反弹吗？',
    options: [
      { key:'A', label:'核心区率先企稳，远郊继续阴跌', angle:'一线城市核心地段供需关系健康，刚需支撑。但三四线库存压力大、人口流出，远郊没有反弹基础。"分化"是主题词。', sectors:'房产', indicator:'↗️' },
      { key:'B', label:'政策大招在路上，整体反弹可期', angle:'政府收购存量房转保障房、城中村改造、降息降首付等组合拳，信心修复后量价齐升。', sectors:'房产', indicator:'⬆️' },
      { key:'C', label:'"房住不炒"定调未变，长期横盘', angle:'政策托底不刺激。人口拐点+高杠杆率制约房价上行空间，大概率进入"L型"底部区间。', sectors:'房产', indicator:'➡️' },
      { key:'D', label:'不确定性太大，继续观望', angle:'地缘政治、经济增速、就业市场等多变量交织，单一判断失准风险高。', sectors:'整体', indicator:'❓' },
    ],
    connect:(p)=>{ return p.hasHouse?`你已有房产，重点关注${p.city||'所在城市'}核心区域成交量和挂牌价变化，判断是否适合改善置换。`: `你尚未购房，${p.city||'你的城市'}若选择核心区/地铁房，抗跌性更强。`},
    dims:['housing','finance']
  },
  { mode:'forecast', id:'f3',
    title:'🤖 AI对就业市场的影响：威胁还是机会？',
    hook:'2025年AI应用加速落地，部分岗位开始"被替代"。你认为未来3年，AI对你所在行业的影响是？',
    options: [
      { key:'A', label:'大幅替代：基础文案/客服/翻译等岗位锐减', angle:'OpenAI CEO预测"AGI在2027年到来"。重复性脑力劳动首当其冲。但"提示词工程师""AI训练师"等新岗位涌现。', sectors:'全行业', indicator:'⬇️' },
      { key:'B', label:'工具增强：AI是副驾驶，人还是决策者', angle:'AI提升效率但无法替代判断力、同理心和创造力。会用AI的人将淘汰不会用的人，而非AI淘汰人。', sectors:'知识服务', indicator:'⬆️' },
      { key:'C', label:'创造性毁灭：短期阵痛，长期新机会', angle:'每次技术革命都先"替代"后"创造"。工业革命消灭手工纺织却创造了工程师。关键是终身学习能力。', sectors:'创新产业', indicator:'🔄' },
    ],
    connect:(p)=>{ const pname={worker:'上班族',startup:'创业者',investor:'投资者',parent:'家长',homebuyer:'购房者'}; return `作为${pname[p.personaKey]||'职场人'}，关注AI工具提升你的核心竞争力，而非恐惧替代。`},
    dims:['employment','industry']
  },
  { mode:'forecast', id:'f4',
    title:'💹 A股下半年会突破3500点吗？',
    hook:'上证指数在3000-3300区间震荡已超半年。下半年是否有望突破？你的判断是？',
    options: [
      { key:'A', label:'政策+资金共振，突破3500', angle:'降准降息预期+国家队护盘+外资回流+企业盈利改善="戴维斯双击"。关注券商+科技板块。', sectors:'证券/科技', indicator:'⬆️' },
      { key:'B', label:'3000-3300区间震荡为主', angle:'经济复苏"一波三折"，增量资金有限，存量博弈。但结构性机会存在（AI、新能源、高股息）。', sectors:'结构轮动', indicator:'➡️' },
      { key:'C', label:'风险事件或导致破3000', angle:'地缘政治+中美关系+房地产风险出清未完。情绪脆弱时可能出现恐慌性杀跌。', sectors:'防御板块', indicator:'⬇️' },
    ],
    connect:(p)=>{ return `无论判断如何，核心原则：不预测点位，管理仓位。${p.age<40?'你年轻，可承受更高风险比例。':'你接近退休年龄，建议控制权益类资产占比。'}`},
    dims:['finance']
  },
  { mode:'forecast', id:'f5',
    title:'🏥 医保DRG改革后，看病会更难还是更便宜？',
    hook:'DRG/DIP支付方式改革2025年全覆盖，按病种"一口价"付费。这会让就医体验变好还是变差？',
    options: [
      { key:'A', label:'总体利好：控费降负，减少过度医疗', angle:'DRG倒逼医院控制成本，减少不必要的检查和药品。患者自付比例有望下降。但需警惕"推诿重症"问题。', sectors:'医疗', indicator:'✅' },
      { key:'B', label:'双刃剑：费用降了但就医体验可能变差', angle:'医院为控费可能压缩住院天数、减少高值耗材使用。重症、罕见病可能面临"被出院"风险。商业保险重要性上升。', sectors:'医疗/保险', indicator:'⚠️' },
      { key:'C', label:'短期阵痛，长期规范', angle:'DRG本质是"倒逼医院精细化管理"。初期不适应，但3-5年后就医流程将更标准化、透明化。', sectors:'医疗', indicator:'🔄' },
    ],
    connect:(p)=>{ return `无论DRG如何演变，建议：①关注自己及家人的商业医疗保险配置；②慢性病定期复查不可因"控费"而中断。`},
    dims:['elderly','finance']
  },
  // ── connect: 连接生活型 ──
  { mode:'connect', id:'c1',
    title:'💡 如果你月入1.5万，个税改革能省多少？',
    hook:'个税起征点、专项扣除、年终奖计税方式……这些税改跟你钱包直接相关。我们帮你算笔账。',
    exploreSteps: [
      { label:'基础扣除', detail:'月薪15000，年18万。基本减除6万/年→应税所得12万。税率10%，速算扣除2520→年税约9480元。' },
      { label:'叠加专项扣除', detail:'若有房贷(1000/月)+子女教育(2000/月)+赡养老人(3000/月)=6000/月×12=72000/年。应税所得降为4.8万，税率3%→年税1440元。'},
      { label:'对比差额', detail:'从9480→1440，每年多退8040元！三项扣除是否都申报了？去个税APP检查。' },
    ],
    dims:['finance']
  },
  { mode:'connect', id:'c2',
    title:'🔗 延迟退休→养老金→你的退休生活，一条链看清',
    hook:'从"延迟退休"到"每月领多少养老金"到"退休后能维持什么生活水平"——这是一条完整的政策影响链。',
    exploreSteps: [
      { label:'延迟退休时间', detail:'男性60→63岁，女干部55→58岁，女职工50→55岁。2025年起15年逐步过渡。晚退休3年=多缴3年+少领3年。' },
      { label:'养老金计算', detail:'养老金=基础养老金+个人账户。缴费每多1年，基础养老金约增1%。多缴3年≈养老金增3-5%。' },
      { label:'退休生活水平', detail:'以月薪1万为例，缴30年退休金约4000-5000/月。远低于在职收入。差额需靠个人养老金+商业保险+储蓄补足。' },
    ],
    dims:['elderly','finance']
  },
  { mode:'connect', id:'c3',
    title:'📱 新能源汽车降价潮→二手车→你的购车决策',
    hook:'新能源车企价格战愈演愈烈，新车一降再降。这会影响二手车残值、保险定价、甚至充电基础设施布局。买还是不买？',
    exploreSteps: [
      { label:'价格传导', detail:'新车降价→二手车加速贬值→燃油车二手车"跌得更猛"。现在卖旧车买新车，旧车可能折价超预期。' },
      { label:'隐性成本', detail:'新能源车保险费用比同级燃油车高20-30%。部分车型维修难、配件贵。总拥有成本需算总账。' },
      { label:'决策建议', detail:'不急用→等等（价格还在下行通道）；急用→选"保价协议"车型；二手→关注3年内、续航400+车型，性价比最高。' },
    ],
    dims:['industry','finance']
  },
]

// ═══ 核心函数 ═══
export function getDailyChallenge(personaKey, userProfile) {
  const today = new Date().toISOString().slice(0, 10)
  const cached = (() => {
    try { const c = JSON.parse(localStorage.getItem(challengeKey) || '{}'); return c.date === today ? c : null } catch { return null }
  })()
  if (cached) return cached

  const profile = userProfile || {}
  // 按日期轮换，确保每天不同
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000)
  const idx = dayOfYear % insightPool.length
  const template = insightPool[idx]

  const challenge = {
    ...template,
    id: 'dc' + today.replace(/-/g, ''),
    date: today,
    cachedAt: Date.now(),
  }

  // impact模式：预计算个人结果
  if (template.mode === 'impact') {
    const matched = template.check(profile)
    const alt = template.altCheck?.(profile)
    challenge.personalMatch = matched
    challenge.personalReason = matched ? template.reason : (alt ? template.altReason : '根据你的情况，这条政策可能与你正相关')
    challenge.personalCalc = template.calc(profile)
  }

  // forecast模式：获取社群投票分布
  if (template.mode === 'forecast') {
    challenge.votes = getInsightVotes(template.id)
    challenge.personalConnect = template.connect(profile)
  }

  localStorage.setItem(challengeKey, JSON.stringify(challenge))
  return challenge
}

// 获取/模拟社群投票分布
export function getInsightVotes(challengeId) {
  try {
    const all = JSON.parse(localStorage.getItem(insightVotesKey) || '{}')
    return all[challengeId] || null
  } catch { return null }
}

export function submitInsightVote(challengeId, optionKey) {
  try {
    const all = JSON.parse(localStorage.getItem(insightVotesKey) || '{}')
    if (!all[challengeId]) {
      // 首次创建，用伪随机种子生成初始投票分布（模拟社群）
      const seed = challengeId.charCodeAt(challengeId.length-1) + new Date().getDate()
      const mock = (offset) => Math.max(8, Math.floor(20 + (seed + offset * 7) % 40))
      all[challengeId] = { A:mock(0), B:mock(1), C:mock(2), D:mock(3), total:0, userVote:null }
      all[challengeId].total = all[challengeId].A + all[challengeId].B + all[challengeId].C + all[challengeId].D
    }
    all[challengeId].userVote = optionKey
    all[challengeId][optionKey] = (all[challengeId][optionKey] || 0) + 1
    all[challengeId].total += 1
    localStorage.setItem(insightVotesKey, JSON.stringify(all))
    return all[challengeId]
  } catch { return null }
}

export function submitDailyChallenge(challengeId, selected, correct) {
  const today = new Date().toISOString().slice(0, 10)
  localStorage.setItem(challengeDoneKey, today)
  const streak = getStreak()
  const lastDate = localStorage.getItem('last_challenge_date')
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (lastDate === yesterday || lastDate === today) {
    localStorage.setItem(streakKey, streak + 1)
  } else if (lastDate !== today) {
    localStorage.setItem(streakKey, '1')
  }
  localStorage.setItem('last_challenge_date', today)
  return { correct: correct !== undefined ? correct : true, streak: getStreak() }
}
export function getStreak() {
  const lastDate = localStorage.getItem('last_challenge_date')
  if (!lastDate) return 0
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (lastDate !== today && lastDate !== yesterday) return 0
  return parseInt(localStorage.getItem(streakKey) || '0') || 0
}
export function getTodayChallengeDone() {
  return localStorage.getItem(challengeDoneKey) === new Date().toISOString().slice(0, 10)
}

/* ── 用户段位系统 ──────────────────────────────────────────── */
const tierKey = 'user_tier'
const wrongAnswersKey = 'wrong_answers'
export function getUserTier() {
  try {
    const data = JSON.parse(localStorage.getItem(tierKey) || '{}')
    const total = (data.totalCorrect || 0) + (data.totalWrong || 0)
    const accuracy = total > 0 ? Math.round((data.totalCorrect || 0) / total * 100) : 0
    const tierPct = total > 0 ? Math.min(100, Math.round(accuracy * 0.6 + Math.min(total * 2, 40))) : 0
    let tier
    if (tierPct >= 90) tier = { icon: '👑', label: '政策大师', color: '#8e44ad' }
    else if (tierPct >= 70) tier = { icon: '💎', label: '政策专家', color: '#2980b9' }
    else if (tierPct >= 50) tier = { icon: '🥇', label: '政策达人', color: '#27ae60' }
    else if (tierPct >= 30) tier = { icon: '🥈', label: '政策新手', color: '#e67e22' }
    else tier = { icon: '🟤', label: '政策小白', color: '#95a5a6' }
    return { ...data, total, accuracy, tierPct, tier }
  } catch { return { totalCorrect: 0, totalWrong: 0, total: 0, accuracy: 0, tierPct: 0, tier: { icon: '🟤', label: '政策小白', color: '#95a5a6' } } }
}
export function updateUserTier(correct, wrong) {
  const existing = getUserTier()
  const updated = {
    totalCorrect: (existing.totalCorrect || 0) + correct,
    totalWrong: (existing.totalWrong || 0) + wrong,
  }
  localStorage.setItem(tierKey, JSON.stringify(updated))
  return getUserTier()
}
export function getWrongAnswers() {
  try { return JSON.parse(localStorage.getItem(wrongAnswersKey) || '[]') } catch { return [] }
}
export function addWrongAnswer(question, userAnswer, correctAnswer, explanation, dim) {
  const list = getWrongAnswers()
  list.unshift({ id: 'wa' + Date.now(), question, userAnswer, correctAnswer, explanation, dim, mastered: false, date: new Date().toISOString() })
  localStorage.setItem(wrongAnswersKey, JSON.stringify(list.slice(0, 100)))
  return list
}
export function markWrongAnswerMastered(id) {
  const list = getWrongAnswers()
  const item = list.find(w => w.id === id)
  if (item) { item.mastered = true; localStorage.setItem(wrongAnswersKey, JSON.stringify(list)) }
  return list
}

/* ── 价值总览与通知 ─────────────────────────────────────────── */
export function getValueSummary(personaKey, stageKey) {
  const tierData = getUserTier()
  const actions = (() => { try { const saved = JSON.parse(localStorage.getItem('unified_actions') || '{}'); return saved.items || [] } catch { return [] } })()
  const doneActions = actions.filter(a => a.status === 'done').length
  const totalActions = actions.length || 5
  const actionPct = totalActions > 0 ? Math.round(doneActions / totalActions * 100) : 0
  const blindspotCost = (() => {
    try {
      const history = getQuizHistory()
      const wrongQids = history.filter(h => !h.correct).map(h => h.qid)
      let min = 0, max = 0
      selfTestQuestions.filter(q => wrongQids.includes(q.id)).forEach(q => { if (q.cost) { min += q.cost.min; max += q.cost.max } })
      return { min, max }
    } catch { return { min: 0, max: 0 } }
  })()
  const potentialMin = blindspotCost.min + doneActions * 5000
  const potentialMax = blindspotCost.max + doneActions * 20000
  const potentialLabel = potentialMin > 100000 ? '显著价值' : potentialMin > 10000 ? '值得关注' : '开始探索'
  return {
    tier: tierData.tier, tierPct: tierData.tierPct,
    doneActions, totalActions, actionPct,
    potentialMin, potentialMax, potentialLabel,
    blindspotCost,
  }
}
export function getNotificationCount() {
  let count = 0
  if (!getTodayChallengeDone()) count++
  const alerts = getPolicyAlerts()
  count += Math.min(alerts.filter(a => a.status === '紧急').length, 3)
  try {
    const newAchievements = JSON.parse(localStorage.getItem('new_achievements') || '[]')
    count += newAchievements.length
  } catch {}
  return count
}

/* ── 成就系统逻辑 ───────────────────────────────────────────── */
const achievementsKey = 'user_achievements'
export function getUserAchievements() {
  try { return JSON.parse(localStorage.getItem(achievementsKey) || '[]') } catch { return [] }
}
export function getUserStats() {
  const tier = getUserTier()
  const achievements = getUserAchievements()
  const wrongs = getWrongAnswers()
  const mastered = wrongs.filter(w => w.mastered).length
  const actions = (() => { try { const s = JSON.parse(localStorage.getItem('unified_actions') || '{}'); return s.items || [] } catch { return [] } })()
  const doneActions = actions.filter(a => a.status === 'done').length
  const projects = getDecisionProjects()
  const streak = getStreak()
  const quizHistory = getQuizHistory()
  const quizDone = quizHistory.length > 0
  const quizScore = quizDone ? Math.round(quizHistory.filter(h => h.correct).length / quizHistory.length * 100) : 0
  const shared = localStorage.getItem('has_shared') === 'true'
  const healthChecked = localStorage.getItem('health_checked') === 'true'
  return { tier, achievements, wrongs, mastered, actions, doneActions, projects, streak, quizDone, quizScore, shared, healthChecked }
}
export function checkAndAwardAchievements(stats) {
  const existing = getUserAchievements()
  const existingIds = existing.map(a => a.id)
  const newAwards = []
  const award = (id) => {
    if (!existingIds.includes(id)) {
      const def = achievementDefs.find(d => d.id === id)
      if (def) {
        const awarded = { id: def.id, icon: def.icon, label: def.label, desc: def.desc, awardedAt: new Date().toISOString() }
        existing.push(awarded)
        newAwards.push(awarded)
      }
    }
  }
  if (stats.quizDone) award('first_quiz')
  if (stats.quizScore >= 80) award('quiz_master')
  if (stats.quizScore >= 100) award('perfect_score')
  if (stats.streak >= 3) award('streak_3')
  if (stats.streak >= 7) award('streak_7')
  if (stats.streak >= 30) award('streak_30')
  if (stats.doneActions >= 1) award('first_action')
  if (stats.doneActions >= 10) award('action_10')
  // 价值估算
  let totalValue = 0
  const actions2 = (() => { try { const s = JSON.parse(localStorage.getItem('unified_actions') || '{}'); return s.items || [] } catch { return [] } })()
  actions2.filter(a => a.status === 'done').forEach(() => { totalValue += 10000 })
  const wrongQids = getQuizHistory().filter(h => !h.correct).map(h => h.qid)
  selfTestQuestions.filter(q => wrongQids.includes(q.id)).forEach(q => { if (q.cost) totalValue += q.cost.min })
  if (totalValue >= 100000) award('value_100k')
  if (totalValue >= 1000000) award('value_1m')
  if (stats.projects.length >= 1) award('first_project')
  if (stats.shared) award('first_share')
  if (stats.mastered >= 5) award('wrong_master')
  if (stats.healthChecked) award('health_check')
  if (existing.length > 0) localStorage.setItem(achievementsKey, JSON.stringify(existing))
  if (newAwards.length > 0) {
    try { localStorage.setItem('new_achievements', JSON.stringify(newAwards)) } catch {}
  }
  return { all: existing, new: newAwards }
}

/* ── 价值闭环 ───────────────────────────────────────────────── */
export function getRealizedValue() {
  const actions = (() => { try { const s = JSON.parse(localStorage.getItem('unified_actions') || '{}'); return s.items || [] } catch { return [] } })()
  const done = actions.filter(a => a.status === 'done')
  const pending = actions.filter(a => a.status !== 'done')
  const doneCount = done.length
  const pendingCount = pending.length
  const total = doneCount + pendingCount
  const realizedPct = total > 0 ? Math.round(doneCount / total * 100) : 0
  // 每个行动预估价值
  const actionItems = done.map(a => ({ id: a.id, title: a.title, cost: { min: 2000 + Math.floor(Math.random() * 5000), max: 8000 + Math.floor(Math.random() * 20000) } }))
  const realizedMax = actionItems.reduce((sum, a) => sum + a.cost.max, 0)
  const potentialMax = realizedMax + pendingCount * 15000
  return { doneCount, pendingCount, realizedPct, realizedMax, potentialMax, actionItems: actionItems.slice(0, 5) }
}

/* ── 关键时刻提醒 ───────────────────────────────────────────── */
export function getUrgencyItems() {
  const now = new Date()
  const items = []
  deadlines.filter(d => {
    const dl = new Date(d.date)
    const daysLeft = Math.ceil((dl - now) / 86400000)
    return daysLeft > 0 && daysLeft <= 30
  }).forEach(d => {
    const daysLeft = Math.ceil((new Date(d.date) - now) / 86400000)
    items.push({ title: d.title, daysLeft, severity: daysLeft <= 7 ? 'critical' : 'high', type: 'deadline' })
  })
  // 加入养老金并轨等重大节点
  items.push({ title: '延迟退休渐进实施持续推进中', daysLeft: 180, severity: 'medium', type: 'legislation' })
  items.push({ title: '年终奖单独计税政策2027年底到期', daysLeft: 530, severity: 'medium', type: 'deadline' })
  return items.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5)
}

/* ── 增长曲线 ───────────────────────────────────────────────── */
const growthKey = 'growth_history'
export function recordGrowthSnapshot() {
  const tier = getUserTier()
  const snapshots = getGrowthHistory()
  const today = new Date().toISOString().slice(0, 10)
  const todaySnap = snapshots.find(s => s.date === today)
  if (todaySnap) {
    todaySnap.tierPct = tier.tierPct
    todaySnap.tierLabel = tier.tier.label
  } else {
    snapshots.push({ date: today, tierPct: tier.tierPct, tierLabel: tier.tier.label })
  }
  if (snapshots.length > 90) snapshots.shift()
  localStorage.setItem(growthKey, JSON.stringify(snapshots))
  return snapshots
}
export function getGrowthHistory() {
  try { return JSON.parse(localStorage.getItem(growthKey) || '[]') } catch { return [] }
}

/* ── 分享报告 ───────────────────────────────────────────────── */
export function getShareReport() {
  const tier = getUserTier()
  const rv = getRealizedValue()
  const achievements = getUserAchievements()
  const streak = getStreak()
  const realizedLabel = rv.realizedMax > 100000 ? '重大决策价值' : rv.realizedMax > 10000 ? '可观价值' : '初始价值'
  return {
    date: new Date().toISOString().slice(0, 10),
    tier: tier.tier,
    tierPct: tier.tierPct,
    realizedMax: rv.realizedMax,
    realizedLabel,
    actionsDone: rv.doneCount,
    totalAchievements: achievements.length,
    achievements: achievements.slice(0, 5),
    streak,
  }
}
export function markShared() {
  localStorage.setItem('has_shared', 'true')
}

/* ── 决策项目管理 ──────────────────────────────────────────── */
const projectsKey = 'decision_projects'
export function getDecisionProjects() {
  try { return JSON.parse(localStorage.getItem(projectsKey) || '[]') } catch { return [] }
}
export function createDecisionProject(name, goal, dims) {
  const projects = getDecisionProjects()
  projects.push({ id: 'dp' + Date.now(), name, goal, dims: dims || [], status: 'active', progress: 0, createdAt: new Date().toISOString() })
  localStorage.setItem(projectsKey, JSON.stringify(projects))
  return projects
}
export function updateDecisionProject(id, updates) {
  const projects = getDecisionProjects()
  const idx = projects.findIndex(p => p.id === id)
  if (idx >= 0) {
    projects[idx] = { ...projects[idx], ...updates, updatedAt: new Date().toISOString() }
    if (updates.status === 'done') projects[idx].progress = 100
    localStorage.setItem(projectsKey, JSON.stringify(projects))
  }
  return projects
}
export function deleteDecisionProject(id) {
  const projects = getDecisionProjects().filter(p => p.id !== id)
  localStorage.setItem(projectsKey, JSON.stringify(projects))
  return projects
}

/* ── 时间机器场景 ───────────────────────────────────────────── */
export function getTimeMachineScenarios() {
  return [
    { id:'tm1', icon:'🏠', title:'早一年买房', desc:'如果2024年底前买入', calc:() => { const saved = 80000 + Math.floor(Math.random() * 120000); return { totalSaved: saved, detail: `公积金利率更低（2.85% vs 3.25%），多校划片前学区溢价未稀释，预估节省 ¥${saved.toLocaleString()}` } } },
    { id:'tm2', icon:'💼', title:'早一年缴灵活就业社保', desc:'如果2024年开始缴纳', calc:() => { const saved = 24000 + Math.floor(Math.random() * 36000); return { totalSaved: saved, detail: `多缴一年社保意味着多一个月失业金 + 养老金缴费年限+1，预估价值 ¥${saved.toLocaleString()}` } } },
    { id:'tm3', icon:'💰', title:'早开户个人养老金', desc:'如果2023年开户并缴满', calc:() => { const saved = 16200 + Math.floor(Math.random() * 5400); return { totalSaved: saved, detail: `3年×12000元×45%税率=已省税¥16200，加上账户收益，预估价值 ¥${saved.toLocaleString()}` } } },
    { id:'tm4', icon:'🎓', title:'早规划子女入学积分', desc:'如果提前3年准备', calc:() => { const saved = 100000 + Math.floor(Math.random() * 300000); return { totalSaved: saved, detail: `提前准备居住证+社保+积分材料，避免高价私立/跨区择校，预估节省 ¥${saved.toLocaleString()}` } } },
  ]
}

/* ── 里程碑检查 ─────────────────────────────────────────────── */
export function checkMilestones() {
  const milestones = []
  const tier = getUserTier()
  const streak = getStreak()
  const achievements = getUserAchievements()
  if (tier.tierPct >= 50 && !milestones.find(m => m.id === 'tier_50')) milestones.push({ id:'tier_50', icon:'🥇', msg:`政策感知力达到 ${tier.tierPct} 分！`, type:'tier' })
  if (streak === 7) milestones.push({ id:'streak_7_m', icon:'🔥', msg:'连续7天打卡！习惯正在养成', type:'streak' })
  if (streak === 30) milestones.push({ id:'streak_30_m', icon:'👑', msg:'连续30天！你是政策守望者', type:'streak' })
  if (achievements.length === 5) milestones.push({ id:'ach_5', icon:'🏅', msg:'已解锁5个成就徽章！', type:'achievement' })
  if (achievements.length === 10) milestones.push({ id:'ach_10', icon:'🌟', msg:'已解锁10个成就！太厉害了', type:'achievement' })
  return milestones
}

/* ── 地区政策对比 ──────────────────────────────────────────── */
export function getRegionComparison() {
  const regions_list = ['北京','上海','深圳','广州','杭州','成都','武汉']
  const dims_list = ['housing','employment','education','elderly','finance']
  const dimLabels = { housing:'住房', employment:'就业', education:'教育', elderly:'养老', finance:'金融' }
  const data = []
  const baseScores = { '北京':{housing:78,employment:72,education:80,elderly:75,finance:70}, '上海':{housing:75,employment:74,education:78,elderly:73,finance:72}, '深圳':{housing:72,employment:70,education:65,elderly:60,finance:68}, '广州':{housing:68,employment:68,education:70,elderly:65,finance:65}, '杭州':{housing:65,employment:66,education:68,elderly:62,finance:62}, '成都':{housing:60,employment:62,education:64,elderly:60,finance:58}, '武汉':{housing:62,employment:60,education:65,elderly:58,finance:55} }
  dims_list.forEach(dim => {
    regions_list.forEach(region => {
      data.push({ region, dim, label: dimLabels[dim], score: baseScores[region]?.[dim] || 50, icon: dim==='housing'?'🏠':dim==='employment'?'💼':dim==='education'?'🎓':dim==='elderly'?'👴':'💰' })
    })
  })
  return data
}

/* ── 相似案例发现 ──────────────────────────────────────────── */
export function getSimilarTestimonials({ personaKey, age, city, stageKey }) {
  return enhancedTestimonials.map(t => {
    let score = 0
    if (t.persona === personaKey) score += 3
    if (t.stage === stageKey) score += 3
    if (age && Math.abs(t.age - age) <= 5) score += 2
    if (city && t.city === city) score += 2
    return { ...t, relevance: score }
  }).filter(t => t.relevance >= 2).sort((a, b) => b.relevance - a.relevance)
}

/* ── 同路人发现 ────────────────────────────────────────────── */
export function getPeerDiscoveries({ personaKey, stageKey }) {
  const peers = []
  if (personaKey === 'worker' || personaKey === 'parent') {
    peers.push({ pct: 73, title: '同阶段用户中73%不知道共有产权房', desc: '市场价50-70%即可购房' })
    peers.push({ pct: 65, title: '65%的人漏掉了至少一项个税扣除', desc: '平均每年多缴2000-6000元' })
  }
  if (stageKey === 'young_single' || stageKey === 'newlywed') {
    peers.push({ pct: 58, title: '58%的年轻人不了解公积金贷款上限', desc: '首套最高240万，利率仅2.85%' })
  }
  if (stageKey === 'young_parent' || personaKey === 'parent') {
    peers.push({ pct: 81, title: '81%的家长不了解多校划片政策', desc: '学区房确定性大幅降低' })
    peers.push({ pct: 47, title: '47%的家长已开始规划子女入学积分', desc: '非户籍家庭的必备功课' })
  }
  if (stageKey === 'approaching_retire' || personaKey === 'elder') {
    peers.push({ pct: 62, title: '62%的临近退休者未开户个人养老金', desc: '每年最多省税5400元' })
    peers.push({ pct: 55, title: '55%不了解长期护理保险', desc: '49城已试点，失能可报销' })
  }
  if (personaKey === 'startup' || personaKey === 'entrepreneur') {
    peers.push({ pct: 68, title: '68%的创业者不知道小微企业税率仅5%', desc: '年利润300万以下实际税负5%' })
  }
  return peers.slice(0, 5)
}

/* ── 政策体检诊断 v2 — 多维度数据驱动 ────────────────────── */
export function getPolicyHealthCheck(form) {
  const dims = ['housing','employment','education','elderly','finance']
  const dimLabels = { housing:'住房', employment:'就业', education:'教育', elderly:'养老', finance:'金融' }
  const dimIcons = { housing:'🏠', employment:'💼', education:'🎓', elderly:'👴', finance:'💰' }
  const dimScores = { housing:100, employment:100, education:100, elderly:100, finance:100 }
  const dimIssues = { housing:[], employment:[], education:[], elderly:[], finance:[] }
  const addIssue = (dim, severity, icon, title, desc, action, boost, deductScore) => {
    dimIssues[dim].push({ id:'h'+Date.now()+Math.random(), severity, icon, title, desc, action, estimatedBoost:boost })
    dimScores[dim] = Math.max(0, dimScores[dim] - deductScore)
  }
  const tier1Cities = ['北京','上海','深圳','广州']
  const tier2Cities = ['杭州','成都','武汉','南京','苏州','西安','重庆','天津','长沙','郑州','合肥','青岛','厦门','宁波','无锡']
  const isTier1 = tier1Cities.some(c => form.city?.includes(c))
  const isTier2 = tier2Cities.some(c => form.city?.includes(c))
  const hasHighEdu = ['硕士','博士'].includes(form.education)
  const hasDegree = ['本科','硕士','博士'].includes(form.education)
  const isFemale = form.gender === '女'

  // ═══ 住房维度 ═══
  if (form.age >= 25 && form.age <= 42 && !form.hasHouse) {
    if (isTier1) {
      addIssue('housing', 'high', '🏠', '一线城市购房资格规划缺失',
        `${form.city || '你所在城市'}要求连续缴纳社保5年，现在不规划可能错失上车时机`,
        `查看${form.city||'当地'}公积金政策和共有产权房条件`,
        {min:100000,max:500000,unit:'（潜在差价）'}, 25)
    } else if (isTier2) {
      addIssue('housing', 'medium', '🏠', '二线城市购房窗口期',
        `${form.city|| '你所在城市'}人才购房补贴+低利率环境，现在是不错的入市窗口`,
        `了解${form.city||'当地'}人才购房补贴政策`,
        {min:50000,max:200000,unit:'（潜在节省）'}, 15)
    } else {
      addIssue('housing', 'low', '🏠', '购房准备建议',
        '了解公积金缴存基数和贷款额度关系，提前规划首付',
        '查看公积金贷款政策',
        {min:20000,max:100000,unit:'（潜在节省）'}, 8)
    }
  }
  if (form.hasHouse && form.isMarried) {
    addIssue('housing', 'low', '🏠', '改善置换退税窗口',
      '"卖一买一"退个税政策可节省数万至十数万，建议在窗口期内完成置换',
      '了解卖一买一退税条件',
      {min:20000,max:120000,unit:'（退税金额）'}, 5)
  }
  if (hasHighEdu && !form.hasHouse && (isTier1 || isTier2)) {
    addIssue('housing', 'medium', '🏡', `${form.education}学历住房补贴未申领`,
      `${form.city||'多城'}对${form.education}及以上人才提供购房补贴（数十万级），你可能符合条件`,
      `查询${form.city||'当地'}人才安居政策`,
      {min:50000,max:300000,unit:'（人才补贴）'}, 12)
  }

  // ═══ 就业维度 ═══
  if (form.isSelfEmployed) {
    addIssue('employment', 'high', '💼', '灵活就业社保权益不完整',
      '自由职业者可以灵活就业身份参加职工社保（养老+医疗），比居民社保待遇高一倍以上',
      '以灵活就业身份缴纳职工社保',
      {min:30000,max:120000,unit:'（退休后多领）'}, 20)
    addIssue('employment', 'medium', '📊', '小微企业税收优惠未利用',
      '年应纳税所得额300万以下，实际税率仅5%（减按25%×20%），比25%低很多',
      '申请小微企业税收优惠认定',
      {min:10000,max:80000,unit:'/年（省税）'}, 10)
  }
  if (isFemale && form.age >= 25 && form.age <= 42) {
    if (!form.hasChild) {
      addIssue('employment', 'medium', '👶', '生育津贴规划可提前准备',
        '生育津贴金额与社保缴费基数直接挂钩，备孕前提高基数可多领数万元',
        '了解生育津贴与社保基数关系',
        {min:10000,max:50000,unit:'（津贴差额）'}, 10)
    }
    addIssue('employment', 'low', '👩', '女性劳动权益保障',
      '产假、哺乳假、职场歧视等权益受劳动法保护，了解你的法定权利',
      '查看最新产假天数和生育保险政策',
      {min:5000,max:30000,unit:'（权益保障）'}, 5)
  }
  if (hasDegree && (isTier1 || isTier2)) {
    addIssue('employment', 'medium', '🎓', `${form.education}学历人才引进落户机会`,
      `${form.city||'多城'}对${form.education}人才有落户绿色通道，落户后享购房/教育/医疗等福利`,
      `查询${form.city||'当地'}人才引进落户条件`,
      {min:50000,max:200000,unit:'（落户价值）'}, 10)
  }
  // 男性退休年龄提醒
  if (form.gender === '男' && form.age >= 55) {
    addIssue('employment', 'medium', '⏳', '延迟退休过渡期规划',
      '男性退休年龄将从60岁逐步延迟至63岁（2025年起15年过渡），需重新规划职业生涯',
      '了解延迟退休对个人养老金的影响',
      {min:0,max:0,unit:''}, 8)
  }

  // ═══ 教育维度 ═══
  if (form.hasChild) {
    if (isTier1) {
      addIssue('education', 'high', '🎓', '一线城市子女入学积分规划',
        `${form.city||'你所在城市'}非户籍子女入学需居住证+社保+积分达标，提前3年准备`,
        `查看${form.city||'当地'}入学积分细则`,
        {min:100000,max:500000,unit:'（避免私立/跨区成本）'}, 20)
    }
    addIssue('education', 'medium', '🏫', '多校划片与学位锁定',
      '"多校划片"稀释学区房价值，"六年一学位"限制二手学区房，买房前必查',
      '了解所在城市学区政策',
      {min:100000,max:1000000,unit:'（学区溢价风险）'}, 12)
    addIssue('education', 'low', '💰', '子女教育个税扣除',
      '每个子女每月可扣2000元（3岁到博士），别漏报',
      '在个税APP中检查子女教育扣除',
      {min:2400,max:4800,unit:'/年/孩'}, 5)
  } else if (form.isMarried && form.age >= 25) {
    addIssue('education', 'low', '📚', '教育政策提前了解',
      '多校划片、学位锁定、入学积分等政策变化快，有孩子后再准备可能来不及',
      '提前了解所在城市教育政策趋势',
      {min:50000,max:300000,unit:'（未来择校成本）'}, 8)
  }
  // 学历继续教育扣除
  if (!hasDegree && form.age <= 45) {
    addIssue('education', 'low', '📖', '继续教育个税扣除',
      '参加学历继续教育期间每月可扣400元，考证（职业资格）当年可扣3600元',
      '在个税APP中添加继续教育扣除',
      {min:400,max:4800,unit:'/年（省税）'}, 3)
  }

  // ═══ 养老维度 ═══
  if (form.age >= 35) {
    addIssue('elderly', form.age >= 45 ? 'high' : 'medium', '🏖️', '个人养老金账户未开立',
      `年缴12000元进入个人养老金账户，最高税率档每年省税5400元，且账户内收益免税`,
      '开立个人养老金账户并开始定投',
      {min:3600,max:5400,unit:'/年（省税）'}, form.age >= 45 ? 18 : 10)
  }
  if (form.age >= 50) {
    const retireAge = isFemale ? (form.education==='博士'||form.education==='硕士' ? 58 : 55) : 63
    addIssue('elderly', 'high', '⏳', `延迟退休对你影响：最终退休年龄${retireAge}岁`,
      `2025年起15年过渡，你预计${retireAge}岁退休，比原计划晚${retireAge-(isFemale?55:60)}年`,
      '了解延迟退休对养老金计算的具体影响',
      {min:0,max:0,unit:'（需重新规划）'}, 15)
  }
  addIssue('elderly', 'low', '🏥', '长期护理保险认知不足',
    '长护险已在49城试点，覆盖超1.8亿人，失能老人每月可获数千元护理报销',
    '查询所在城市是否已纳入长护险试点',
    {min:10000,max:50000,unit:'（护理费用）'}, 5)
  if (form.hasChild) {
    addIssue('elderly', 'low', '👴', '赡养老人个税扣除',
      '赡养60岁以上父母，每月可扣3000元（独生子女），非独生子女分摊',
      '在个税APP中添加赡养老人扣除',
    {min:2400,max:7200,unit:'/年（省税）'}, 5)
  }

  // ═══ 金融维度 ═══
  addIssue('finance', 'medium', '💰', '个税专项附加扣除可能未最大化',
    '房贷利息、子女教育、婴幼儿照护、赡养老人、继续教育、住房租金——你漏了几项？',
    '在个税APP中逐项检查专项附加扣除',
    {min:2000,max:15000,unit:'/年（退税）'}, 12)
  if (form.hasHouse) {
    addIssue('finance', 'low', '🏦', '房贷利息扣除是否已申报',
      '首套房贷利息每月1000元、最长20年，很多人忘记申报',
      '在个税APP中确认房贷利息扣除',
    {min:2400,max:6000,unit:'/年（省税）'}, 5)
  }
  if (form.age >= 30) {
    addIssue('finance', 'low', '📈', '年终奖计税方式选择',
      '年终奖单独计税政策延至2027年底，选"单独计税"vs"并入综合所得"差额可达数千',
      '下次汇算清缴时对比两种方式',
      {min:1000,max:10000,unit:'（差额）'}, 5)
  }

  // ═══ 错题联动：从自测错题定位薄弱维度 ═══
  try {
    const wrongAnswers = JSON.parse(localStorage.getItem('wrong_answers') || '[]')
    const quizHistory = JSON.parse(localStorage.getItem('quiz_history') || '[]')
    const wrongQids = quizHistory.filter(h => !h.correct).map(h => h.qid)
    const wrongByDim = {}
    wrongQids.forEach(qid => {
      const q = selfTestQuestions.find(qq => qq.id === qid)
      if (q) wrongByDim[q.dim] = (wrongByDim[q.dim] || 0) + 1
    })
    // 最薄弱的维度
    const weakest = Object.entries(wrongByDim).sort((a,b) => b[1]-a[1])[0]
    if (weakest && weakest[1] >= 2) {
      addIssue(weakest[0], 'medium', '🎯', `${dimLabels[weakest[0]]}维度知识薄弱`,
        `你在${dimLabels[weakest[0]]}维度的自测中错了${weakest[1]}题，这是你的政策盲区重灾区`,
        '去错题本复习该维度的错题',
        {min:5000,max:30000,unit:'（知识盲区成本）'}, 8)
    }
  } catch {}

  // ═══ 汇总 ═══
  const allIssues = dims.flatMap(d => dimIssues[d])
  // 加权总分：各维度取最低分加权
  const weights = { housing:0.25, employment:0.25, education:0.15, elderly:0.20, finance:0.15 }
  const totalScore = Math.round(dims.reduce((sum, d) => sum + dimScores[d] * weights[d], 0))
  const tier = totalScore >= 85 ? { icon:'🟢', label:'政策达人', color:'#27ae60' }
    : totalScore >= 65 ? { icon:'🟡', label:'还需关注', color:'#e67e22' }
    : { icon:'🔴', label:'盲区较多', color:'#e74c3c' }

  localStorage.setItem('health_checked', 'true')
  return {
    score: totalScore,
    tier,
    issues: allIssues,
    dimScores: dims.map(d => ({ dim: d, label: dimLabels[d], icon: dimIcons[d], score: dimScores[d], count: dimIssues[d].length })),
    totalIssues: allIssues.length,
    highCount: allIssues.filter(i => i.severity === 'high').length,
    mediumCount: allIssues.filter(i => i.severity === 'medium').length,
    lowCount: allIssues.filter(i => i.severity === 'low').length,
    date: new Date().toISOString(),
  }
}

/* ── 个性化政策周报 ─────────────────────────────────────────── */
export function getWeeklyDigest({ personaKey, stageKey, regionKey, viewHistory, userProfile }) {
  const persona = personas.find(p => p.key === personaKey) || personas[0]
  const stage = lifeRadar?.stages?.find(s => s.key === stageKey)
  const personaLabel = persona?.label || '职场人'
  const stageLabel = stage?.label || '中年'
  // 盲区信号
  const signals = []
  if (stageKey === 'young_single' || stageKey === 'newlywed') {
    signals.push({ type:'blindspot', title:'公积金贷款额度与缴存基数挂钩', desc:'提高缴存基数可大幅提升贷款额度（上限240万）', cost:{min:50000,max:240000,unit:''} })
    signals.push({ type:'opportunity', title:'灵活就业可参加职工社保', desc:'自由职业者现在可缴公积金+职工社保', cost:{min:12000,max:60000,unit:'/年'} })
  }
  if (stageKey === 'young_parent') {
    signals.push({ type:'blindspot', title:'多校划片后学区房价值不确定性增加', desc:'需关注所在城市的具体划片方案', cost:{min:100000,max:1000000,unit:''} })
    signals.push({ type:'opportunity', title:'子女教育专项扣除每月2000元/孩', desc:'从3岁到博士均可享受', cost:{min:2400,max:4800,unit:'/年'} })
  }
  if (stageKey === 'approaching_retire') {
    signals.push({ type:'blindspot', title:'个人养老金账户年省税最高5400元', desc:'年缴12000进入账户，45%税率档全额抵扣', cost:{min:3600,max:5400,unit:'/年'} })
    signals.push({ type:'opportunity', title:'长期护理保险逐步扩大覆盖', desc:'49城试点，失能老人可获护理报销', cost:{min:10000,max:50000,unit:''} })
  }
  // 通用信号
  signals.push({ type:'opportunity', title:'小微企业税收优惠：实际税负仅5%', desc:'年应纳税所得额300万以下适用', cost:{min:10000,max:80000,unit:'/年'} })
  // 同路人
  const peers = getPeerDiscoveries({ personaKey, stageKey })
  // 立法前瞻
  const outlook = []
  if (typeof legislativeOutlook === 'object') {
    const arr = Array.isArray(legislativeOutlook) ? legislativeOutlook : Object.values(legislativeOutlook).flat().filter(Boolean)
    const relevant = arr.filter(lo => {
      if (!lo) return false
      const dims = lo.dims || (lo.dim ? [lo.dim] : [])
      const stageWeights = stage?.weights || {}
      return dims.some(d => stageWeights[d] >= 0.2)
    })
    relevant.slice(0, 3).forEach(lo => { outlook.push({ name: lo.name || lo.title, status: lo.status, note: lo.note || lo.summary?.slice(0, 60), dim: lo.dim || (lo.dims?.[0]) }) })
  }
  // 风向标个性化信号（基于全画像）
  let compassSignals = []
  try {
    const profile = userProfile || getUserProfile()
    if (profile && Object.keys(profile).length > 0) {
      const compass = getPolicyCompass(personaKey || 'worker', profile)
      if (compass && compass.signals) {
        compassSignals = compass.signals.slice(0, 3).map(s => ({
          domain: s.domain,
          domainIcon: domainMeta[s.domain]?.icon || '📡',
          domainLabel: domainMeta[s.domain]?.label || s.domain,
          change: s.change,
          action: s.actionText,
          urgency: s.urgency,
          financial: s._financial,
        }))
      }
    }
  } catch { compassSignals = [] }
  return {
    signals: signals.slice(0, 6),
    peers,
    outlook,
    compassSignals,
    personaLabel,
    stageLabel,
    date: new Date().toISOString().slice(0, 10),
  }
}

