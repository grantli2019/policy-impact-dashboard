/**
 * 策查查小程序 — 核心政策数据层
 * 从 Web 端 impactData.js 提取的精简数据，供小程序 MVP 使用
 */

/* ── 用户画像 ── */
export const personas = [
  { key: 'worker', icon: '💼', label: '上班族' },
  { key: 'parent', icon: '👨‍👩‍👧', label: '家长' },
  { key: 'buyer', icon: '🏠', label: '购房者' },
  { key: 'entrepreneur', icon: '🚀', label: '创业者' },
  { key: 'retiree', icon: '👴', label: '临退休' },
  { key: 'graduate', icon: '🎓', label: '应届生' },
]

/* ── 政策红利数据 ── */
export const policyDividends = {
  worker: [
    { id: 'gjj', label: '公积金缴存（单位+个人）', amount: 36000, confirmed: true },
    { id: 'tax', label: '个税专项附加扣除', amount: 5880, confirmed: true },
    { id: 'medical', label: '医保个人账户划入', amount: 3600, confirmed: true },
    { id: 'unemployment', label: '失业保险保障', amount: 1200, confirmed: true },
  ],
  parent: [
    { id: 'education', label: '子女教育专项扣除', amount: 2400, confirmed: true },
    { id: 'childcare', label: '3岁以下婴幼儿照护扣除', amount: 2400, confirmed: true },
    { id: 'gjj', label: '公积金缴存（单位+个人）', amount: 36000, confirmed: true },
    { id: 'tax', label: '个税专项附加扣除', amount: 5880, confirmed: true },
  ],
  buyer: [
    { id: 'gjj_loan', label: '公积金贷款利息节省', amount: 48000, confirmed: true },
    { id: 'tax_refund', label: '换房退税', amount: 15000, confirmed: false },
    { id: 'gjj', label: '公积金缴存（单位+个人）', amount: 36000, confirmed: true },
    { id: 'first_home', label: '首套房利率优惠', amount: 12000, confirmed: true },
  ],
  entrepreneur: [
    { id: 'small_biz_tax', label: '小微企业税收减免', amount: 60000, confirmed: true },
    { id: 'vat', label: '增值税优惠', amount: 36000, confirmed: true },
    { id: 'social_subsidy', label: '创业社保补贴', amount: 12000, confirmed: false },
  ],
  retiree: [
    { id: 'pension', label: '基本养老金', amount: 48000, confirmed: true },
    { id: 'medical', label: '医保报销', amount: 8000, confirmed: true },
    { id: 'elderly_care', label: '长期护理保险', amount: 3600, confirmed: false },
  ],
  graduate: [
    { id: 'rental_subsidy', label: '租房补贴', amount: 18000, confirmed: false },
    { id: 'gjj', label: '公积金缴存（单位+个人）', amount: 24000, confirmed: true },
    { id: 'tax', label: '个税起征点优惠', amount: 1800, confirmed: true },
    { id: 'employment_subsidy', label: '就业见习补贴', amount: 6000, confirmed: false },
  ],
}

/* ── 通俗化评分 ── */
function getPlainBreadth(score) {
  if (score >= 9) return '影响几乎所有人'
  if (score >= 7) return '影响数千万人'
  if (score >= 5) return '影响特定群体'
  return '影响少数人'
}

function getPlainDepth(score) {
  if (score >= 9) return '根本性制度变革'
  if (score >= 7) return '长期结构性影响'
  if (score >= 5) return '中期政策调整'
  return '短期窗口性变化'
}

/* ── 核心政策数据（精选高频政策） ── */
const rawPolicies = [
  { id: 'gjj_2026', name: '住房公积金管理条例（修订）', dim: 'housing', dimLabel: '房产', icon: '🏠', breadth: 8, depth: 8, direction: 1, confidence: '★★☆', date: '2026-06-05', note: '提取条件放宽、覆盖灵活就业人员', rationale: 'breadth=8: 全国缴存职工超1.7亿人。depth=8: 条例修订是法规层面的结构性变化。', source: '住建部', url: 'https://www.mohurd.gov.cn/gongkai/fdzdgknr/zqyj/202606/20260605_776384.html' },
  { id: 'tax_refund', name: '换房退税政策延续至2027年底', dim: 'housing', dimLabel: '房产', icon: '🏠', breadth: 6, depth: 5, direction: 1, confidence: '★★★', date: '2026-01-01', note: '改善型住房消费直接利好', rationale: 'breadth=6: 仅影响有换房需求的中产家庭。depth=5: 窗口期政策。', source: '税务总局', url: 'https://www.chinatax.gov.cn/chinatax/n810219/n810724/common_list_n810774.html' },
  { id: 'lpr_rate', name: '房贷利率市场化改革深化', dim: 'housing', dimLabel: '房产', icon: '🏠', breadth: 9, depth: 8, direction: 1, confidence: '★★★', date: '2024-05-01', note: '房贷利率与LPR挂钩，持续下行', rationale: 'breadth=9: 影响所有房贷借款人。depth=8: 利率市场化是长期结构性变化。', source: '中国人民银行', url: 'http://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125440/3876551/5482244/index.html' },
  { id: 'first_home', name: '认房不认贷政策全国推广', dim: 'housing', dimLabel: '房产', icon: '🏠', breadth: 8, depth: 7, direction: 1, confidence: '★★★', date: '2024-08-01', note: '改善型购房门槛大幅降低', rationale: 'breadth=8: 影响全国改善型购房者。depth=7: 购房资格认定标准变革。', source: '住建部', url: 'https://www.mohurd.gov.cn/gongkai/fdzdgknr/zcjd/202308/20230825_77507.html' },
  { id: 'rental_housing', name: '保障性租赁住房建设提速', dim: 'housing', dimLabel: '房产', icon: '🏠', breadth: 8, depth: 8, direction: 1, confidence: '★★★', date: '2025-01-01', note: '十四五期间全国筹集870万套保障房', rationale: 'breadth=8: 影响全国新市民及青年人群体。depth=8: 住房供应体系结构性变革。', source: '国务院', url: 'https://www.gov.cn/zhengce/content/2021-07/02/content_5622059.htm' },
  { id: 'new_employment', name: '新就业形态劳动者权益保障', dim: 'employment', dimLabel: '就业', icon: '💼', breadth: 8, depth: 8, direction: 1, confidence: '★★★', date: '2021-07-01', note: '外卖/网约车/快递等平台劳动者权益保障', rationale: 'breadth=8: 影响数千万平台劳动者。depth=8: 新就业形态制度性保障。', source: '人社部', url: 'https://www.mohrss.gov.cn/wap/xw/rsxw/202107/t20210722_419104.html' },
  { id: 'delay_retire', name: '渐进式延迟法定退休年龄', dim: 'employment', dimLabel: '就业', icon: '💼', breadth: 10, depth: 9, direction: -1, confidence: '★★★', date: '2025-01-01', note: '男60→63岁，女50→55岁，每几个月延迟1个月', rationale: 'breadth=10: 影响所有劳动者。depth=9: 根本性制度变革。', source: '全国人大', url: 'https://www.gov.cn/yaowen/liebiao/202409/content_6971009.htm' },
  { id: 'double_reduction', name: "'双减'政策（校外培训监管）", dim: 'education', dimLabel: '教育', icon: '🎓', breadth: 9, depth: 9, direction: 1, confidence: '★★★', date: '2021-07-01', note: 'K12学科类培训全面压减，教育回归校园', rationale: 'breadth=9: 影响全国1.5亿中小学生家庭。depth=9: 教培行业根本性变革。', source: '国务院', url: 'https://www.gov.cn/zhengce/2021-07/24/content_5627132.htm' },
  { id: 'pension_personal', name: '个人养老金制度全面推开', dim: 'elderly', dimLabel: '养老', icon: '👴', breadth: 8, depth: 8, direction: 1, confidence: '★★★', date: '2024-12-15', note: '每年12000元税优额度，全国放开', rationale: 'breadth=8: 影响所有基本养老保险参保人。depth=8: 养老第三支柱制度化。', source: '人社部', url: 'https://www.gov.cn/zhengce/content/202411/content_6986000.htm' },
  { id: 'lpr_cut', name: 'LPR连续下调+存量房贷利率调整', dim: 'finance', dimLabel: '金融', icon: '💰', breadth: 9, depth: 8, direction: 1, confidence: '★★★', date: '2023-09-01', note: "房贷利率进入'3时代'，月供减少数千元", rationale: 'breadth=9: 影响所有房贷借款人。depth=8: 利率市场化深化。', source: '中国人民银行', url: 'http://www.pbc.gov.cn' },
  { id: 'trade_in', name: '消费品以旧换新补贴', dim: 'finance', dimLabel: '金融', icon: '💰', breadth: 8, depth: 6, direction: 1, confidence: '★★★', date: '2024-03-01', note: '汽车/家电/家装以旧换新，最高补贴2万', rationale: 'breadth=8: 影响有消费需求的家庭。depth=6: 阶段性刺激政策。', source: '国务院', url: 'https://www.gov.cn/zhengce/content/202403/content_6939000.htm' },
  { id: 'small_biz', name: '小微企业税收优惠政策', dim: 'industry', dimLabel: '行业', icon: '🏭', breadth: 8, depth: 7, direction: 1, confidence: '★★★', date: '2023-01-01', note: '小微企业减半征收所得税+增值税起征点提高', rationale: 'breadth=8: 影响全国小微企业主。depth=7: 营商环境优化。', source: '税务总局', url: 'https://www.chinatax.gov.cn' },
]

/* ──  enriched 政策数据（添加通俗化评分） ── */
export const policies = rawPolicies.map(p => ({
  ...p,
  plainBreadth: getPlainBreadth(p.breadth),
  plainDepth: getPlainDepth(p.depth),
  plainScore: `${getPlainBreadth(p.breadth)}，${getPlainDepth(p.depth)}`,
}))

/* ── 热门政策（首页展示） ── */
export const hotPolicies = policies.slice(0, 6)

/* ── 搜索函数 ── */
const SYNONYMS = {
  '买房': ['购房', '房贷', '公积金', '限购'],
  '卖房': ['售房', '二手房', '房产交易'],
  '换工作': ['跳槽', '离职', '辞职', '灵活就业'],
  '生娃': ['生育', '产假', '托育'],
  '孩子': ['子女', '学区', '托育', '教育'],
  '退休': ['养老', '延迟退休', '养老金'],
  '存钱': ['存款', '理财', '利率'],
  '看病': ['医保', '医疗', '门诊', '住院'],
  '开公司': ['创业', '营商环境', '小微企业'],
}

export function searchPolicies(query) {
  const kw = query.toLowerCase()
  const synonyms = Object.entries(SYNONYMS).reduce((acc, [key, vals]) => {
    if (kw.includes(key) || vals.some(v => kw.includes(v))) return [...acc, key, ...vals]
    return acc
  }, [])
  const allKw = [...new Set([kw, ...synonyms.map(s => s.toLowerCase())])]

  return policies
    .filter(p => {
      const title = p.name.toLowerCase()
      const note = (p.note || '').toLowerCase()
      return allKw.some(k => title.includes(k) || note.includes(k))
    })
    .sort((a, b) => (b.breadth + b.depth) - (a.breadth + a.depth))
}

/* ── 根据ID获取政策 ── */
export function getPolicyById(id) {
  return policies.find(p => p.id === id) || null
}
