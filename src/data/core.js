/**
 * 核心评分引擎 + 维度数据 + 区域 + 画像（首屏必需）
 * 由 scripts/split-policy-data.mjs 从 impactData.js 拆分生成
 * 行范围: 1-870 (870 行)
 */


/**
 * 策查查 — 政策影响力评估引擎 v3.0
 * ═══════════════════════════════════════════════════════════════
 * v3.0 新增：多区域架构 / 历史里程碑时间线 / 区域化参数
 * v2.1 兼容：评分Rubric / 画像权重 / 评分依据
 * ═══════════════════════════════════════════════════════════════
 */

/* ── 信息源域名→发布机构映射 ────────────────────────────── */
const SOURCE_MAP = [
  { domain: 'gov.cn', source: '中国政府网', issuingBody: '国务院' },
  { domain: 'mohurd.gov.cn', source: '住建部官网', issuingBody: '住建部' },
  { domain: 'chinatax.gov.cn', source: '税务总局官网', issuingBody: '国家税务总局' },
  { domain: 'npc.gov.cn', source: '全国人大官网', issuingBody: '全国人大' },
  { domain: 'moj.gov.cn', source: '司法部官网', issuingBody: '司法部' },
  { domain: 'mohrss.gov.cn', source: '人社部官网', issuingBody: '人社部' },
  { domain: 'moe.gov.cn', source: '教育部官网', issuingBody: '教育部' },
  { domain: 'mof.gov.cn', source: '财政部官网', issuingBody: '财政部' },
  { domain: 'nhc.gov.cn', source: '国家卫健委官网', issuingBody: '国家卫健委' },
  { domain: 'mps.gov.cn', source: '公安部官网', issuingBody: '公安部' },
  { domain: 'miit.gov.cn', source: '工信部官网', issuingBody: '工信部' },
  { domain: 'stats.gov.cn', source: '国家统计局官网', issuingBody: '国家统计局' },
  { domain: 'pbc.gov.cn', source: '央行官网', issuingBody: '中国人民银行' },
  { domain: 'ndrc.gov.cn', source: '国家发改委官网', issuingBody: '国家发改委' },
  { domain: 'samr.gov.cn', source: '市场监管总局官网', issuingBody: '市场监管总局' },
  { domain: 'cac.gov.cn', source: '国家网信办官网', issuingBody: '国家网信办' },
  { domain: 'shanghai.gov.cn', source: '上海政府官网', issuingBody: '上海市政府' },
  { domain: 'rsj.sh.gov.cn', source: '上海人社局官网', issuingBody: '上海市人社局' },
  { domain: 'edu.sh.gov.cn', source: '上海市教委官网', issuingBody: '上海市教委' },
  { domain: 'zjw.sh.gov.cn', source: '上海住建委官网', issuingBody: '上海市住建委' },
  { domain: 'rsj.beijing.gov.cn', source: '北京人社局官网', issuingBody: '北京市人社局' },
  { domain: 'zjw.beijing.gov.cn', source: '北京住建委官网', issuingBody: '北京市住建委' },
  { domain: 'beijing.gov.cn', source: '北京政府官网', issuingBody: '北京市政府' },
  { domain: 'mzj.beijing.gov.cn', source: '北京民政局官网', issuingBody: '北京市民政局' },
  { domain: 'ybj.beijing.gov.cn', source: '北京医保局官网', issuingBody: '北京市医保局' },
  { domain: 'ybj.sh.gov.cn', source: '上海医保局官网', issuingBody: '上海市医保局' },
  { domain: 'pkulaw.com', source: '北大法宝', issuingBody: '北大法律信息网' },
  { domain: 'court.gov.cn', source: '最高人民法院官网', issuingBody: '最高法' },
  { domain: 'stcsm.sh.gov.cn', source: '上海科委官网', issuingBody: '上海市科委' },
  { domain: 'nhsa.gov.cn', source: '国家医保局官网', issuingBody: '国家医保局' },
  { domain: 'nmpa.gov.cn', source: '国家药监局官网', issuingBody: '国家药监局' },
  { domain: 'bse.cn', source: '北交所官网', issuingBody: '北京证券交易所' },
  { domain: 'shftz.gov.cn', source: '上海自贸区官网', issuingBody: '上海自贸区管委会' },
  { domain: 'xiongan.gov.cn', source: '雄安新区官网', issuingBody: '雄安新区管委会' },
  { domain: 'shgjj.com', source: '上海公积金中心官网', issuingBody: '上海市公积金中心' },
  { domain: 'lingang.gov.cn', source: '临港新片区官网', issuingBody: '临港新片区管委会' },
  { domain: 'g60.org.cn', source: 'G60科创走廊官网', issuingBody: 'G60科创走廊办公室' },
  { domain: 'mca.gov.cn', source: '民政部官网', issuingBody: '民政部' },
  { domain: 'mnr.gov.cn', source: '自然资源部官网', issuingBody: '自然资源部' },
  { domain: 'csrc.gov.cn', source: '证监会官网', issuingBody: '中国证监会' },
  { domain: 'nfra.gov.cn', source: '金融监管总局官网', issuingBody: '国家金融监管总局' },
  { domain: 'mofcom.gov.cn', source: '商务部官网', issuingBody: '商务部' },
  { domain: 'cnipa.gov.cn', source: '国家知识产权局官网', issuingBody: '国家知识产权局' },
  { domain: 'gd.gov.cn', source: '广东省政府官网', issuingBody: '广东省政府' },
  { domain: 'sz.gov.cn', source: '深圳市政府官网', issuingBody: '深圳市政府' },
  { domain: 'hrss.sz.gov.cn', source: '深圳人社局官网', issuingBody: '深圳市人社局' },
  { domain: 'szeb.sz.gov.cn', source: '深圳教育局官网', issuingBody: '深圳市教育局' },
  { domain: 'zjj.sz.gov.cn', source: '深圳住建局官网', issuingBody: '深圳市住建局' },
  { domain: 'cq.gov.cn', source: '重庆市政府官网', issuingBody: '重庆市政府' },
  { domain: 'wuhan.gov.cn', source: '武汉市政府官网', issuingBody: '武汉市政府' },
  { domain: 'chengdu.gov.cn', source: '成都市政府官网', issuingBody: '成都市政府' },
  { domain: 'cdhrss.chengdu.gov.cn', source: '成都人社局官网', issuingBody: '成都市人社局' },
  { domain: 'cdjs.chengdu.gov.cn', source: '成都住建局官网', issuingBody: '成都市住建局' },
  { domain: 'gjj.chengdu.gov.cn', source: '成都公积金中心官网', issuingBody: '成都住房公积金中心' },
  { domain: 'changsha.gov.cn', source: '长沙市政府官网', issuingBody: '长沙市政府' },
  { domain: 'zhengzhou.gov.cn', source: '郑州市政府官网', issuingBody: '郑州市政府' },
  { domain: 'hefei.gov.cn', source: '合肥市政府官网', issuingBody: '合肥市政府' },
  { domain: 'nc.gov.cn', source: '南昌市政府官网', issuingBody: '南昌市政府' },
  { domain: 'hrss.hangzhou.gov.cn', source: '杭州人社局官网', issuingBody: '杭州市人社局' },
  { domain: 'edu.beijing.gov.cn', source: '北京教委官网', issuingBody: '北京市教委' },
  { domain: 'tianfu.gov.cn', source: '天府新区官网', issuingBody: '天府新区管委会' },
  { domain: 'hengqin.gov.cn', source: '横琴新区官网', issuingBody: '横琴粤澳深度合作区' },
  { domain: 'nansha.gov.cn', source: '南沙新区官网', issuingBody: '广州南沙开发区管委会' },
  { domain: 'dg.gov.cn', source: '东莞市政府官网', issuingBody: '东莞市政府' },
  { domain: 'foshan.gov.cn', source: '佛山市政府官网', issuingBody: '佛山市政府' },
  { domain: 'shmh.gov.cn', source: '上海闵行区政府官网', issuingBody: '上海市闵行区政府' },
  { domain: 'jiangxi.gov.cn', source: '江西省政府官网', issuingBody: '江西省政府' },
  { domain: 'shanxi.gov.cn', source: '山西省政府官网', issuingBody: '山西省政府' },
  { domain: 'taiyuan.gov.cn', source: '太原市政府官网', issuingBody: '太原市政府' },
  { domain: 'shanghaiinvest.com', source: '上海投资促进网', issuingBody: '上海市投资促进服务中心' },
];

/** 根据URL域名自动推断发布机构和来源名称 */
export function getSourceFromUrl(url) {
  if (!url) return { source: '政府官方网站', issuingBody: '' };
  const u = url.toLowerCase();
  // 长域名优先匹配，避免gov.cn通用条目覆盖具体机构
  const sorted = [...SOURCE_MAP].sort((a, b) => b.domain.length - a.domain.length);
  for (const m of sorted) {
    if (u.includes(m.domain)) return { source: m.source, issuingBody: m.issuingBody };
  }
  return { source: '政府官方网站', issuingBody: '' };
}

/* ── 等级标尺 ─────────────────────────────────────────────── */
export const LEVELS = [
  { min: 80, label: "显著利好", icon: "⬆⬆", color: "#27ae60", plain: "政策对你非常有利，建议积极把握" },
  { min: 60, label: "偏利好",   icon: "⬆",  color: "#2ecc71", plain: "整体方向积极，值得关注和适度布局" },
  { min: 40, label: "中性",     icon: "—",  color: "#95a5a6", plain: "影响不大，保持观望即可" },
  { min: 20, label: "偏利空",   icon: "⬇",  color: "#f39c12", plain: "有些不利因素，提前做好应对准备" },
  { min: 0,  label: "显著利空", icon: "⬇⬇", color: "#e74c3c", plain: "政策对你影响较大，需要认真对待" },
];

export function getIndexLevel(index) {
  return LEVELS.find(l => index >= l.min) ?? LEVELS[LEVELS.length - 1];
}

/* ── 区域定义 ─────────────────────────────────────────────── */
export const regions = [
  { key: "national", name: "全国", icon: "🇨🇳", subtitle: "国家层面统一政策", provinces: "" },
  { key: "yangtze_delta", name: "长三角", icon: "🌊", subtitle: "上海 · 江苏 · 浙江 · 安徽", provinces: "沪苏浙皖" },
  { key: "jingjinji", name: "京津冀", icon: "🏛", subtitle: "北京 · 天津 · 河北", provinces: "京津冀" },
  { key: "greater_bay", name: "大湾区", icon: "🌉", subtitle: "广东 · 香港 · 澳门", provinces: "粤港澳" },
  { key: "chengyu", name: "成渝", icon: "🐼", subtitle: "四川 · 重庆", provinces: "川渝" },
  { key: "central", name: "中部", icon: "🏔", subtitle: "湖北 · 湖南 · 河南 · 安徽 · 江西 · 山西", provinces: "鄂湘豫皖赣晋" },
];

/* ── 评分Rubric标尺 ───────────────────────────────────────── */
export const rubric = {
  breadth: [
    { score: "9-10", criteria: "影响全国14亿人口或全国所有该类群体", example: "社保取消户籍限制（影响2亿灵活就业者）" },
    { score: "7-8",  criteria: "影响某一大类群体或全国性行业",         example: "公积金条例修订（影响所有缴存职工）" },
    { score: "5-6",  criteria: "影响特定城市或中等规模群体",           example: "上海沪七条（影响上海非沪籍居民）" },
    { score: "3-4",  criteria: "影响某细分行业或区域",                 example: "闵行区教育规划（影响该区家长）" },
    { score: "1-2",  criteria: "影响小众专业群体",                     example: "南极活动环保法（影响极地科考人员）" },
  ],
  depth: [
    { score: "9-10", criteria: "根本性制度变革，改变运行规则",         example: "户籍与社保脱钩（改变30年劳动力市场结构）" },
    { score: "7-8",  criteria: "长期结构性影响，5年内持续发酵",        example: "金融法首次立法（建立全新监管框架）" },
    { score: "5-6",  criteria: "中期影响，2-3年可见效果",              example: "公积金提额（影响当前购房决策周期）" },
    { score: "3-4",  criteria: "短期政策调整，1年内效果明显",          example: "换房退税（窗口期政策）" },
    { score: "1-2",  criteria: "技术性修改或例行更新",                 example: "管理办法实施细则" },
  ],
};

/* ── 用户画像定义 ──────────────────────────────────────────── */
export const personas = [
  { key: "worker", icon: "👨‍💼", label: "上班族", desc: "有稳定工作，关心社保、工资、个税",
    weights: { housing: 0.15, employment: 0.35, education: 0.10, elderly: 0.15, finance: 0.20, industry: 0.05 } },
  { key: "buyer", icon: "🏠", label: "购房者", desc: "正在看房或计划换房",
    weights: { housing: 0.40, employment: 0.15, education: 0.10, elderly: 0.10, finance: 0.20, industry: 0.05 } },
  { key: "parent", icon: "👨‍👩‍👧", label: "家长", desc: "有孩子，关心教育和学区",
    weights: { housing: 0.15, employment: 0.15, education: 0.35, elderly: 0.10, finance: 0.10, industry: 0.15 } },
  { key: "investor", icon: "📈", label: "投资者", desc: "关注股市、理财、行业趋势",
    weights: { housing: 0.10, employment: 0.10, education: 0.05, elderly: 0.05, finance: 0.35, industry: 0.35 } },
  { key: "freelancer", icon: "🧑‍💻", label: "自由职业", desc: "灵活就业，关心社保和营商环境",
    weights: { housing: 0.10, employment: 0.35, education: 0.05, elderly: 0.15, finance: 0.15, industry: 0.20 } },
];

/* ── 本周更新数据 ──────────────────────────────────────────── */
export const weeklyUpdates = [
  { date: "2026-07-18", dim: "employment", type: "new", text: "国务院发布《关于促进高质量充分就业的若干措施》，重点支持高校毕业生和农民工就业", impact: "偏利好" },
  { date: "2026-07-18", dim: "housing", type: "update", text: "住建部：全国保障性租赁住房已筹集超700万套，完成十四五目标80%", impact: "偏利好" },
  { date: "2026-07-17", dim: "industry", type: "new", text: "2026世界人工智能大会在上海开幕，AI全球治理高级别会议举行", impact: "偏利好" },
  { date: "2026-07-15", dim: "employment", type: "update", text: "上半年GDP同比增长4.7%，经济总量达69.6万亿元", impact: "偏利好" },
  { date: "2026-07-15", dim: "finance", type: "update", text: "个人住房贷款利率约3.1%，企业贷款利率约3.0%创新低", impact: "偏利好" },
  { date: "2026-07-15", dim: "housing", type: "update", text: "上海高质量推进城市更新，老旧小区加装电梯、独立厨卫改造", impact: "偏利好" },
  { date: "2026-07-14", dim: "industry", type: "new", text: "上半年进出口规模首破25万亿元，同比增长16.9%", impact: "偏利好" },
  { date: "2026-07-14", dim: "elderly", type: "update", text: "基本医保参保人数达13.19亿，基金收入增长8.49%", impact: "偏利好" },
  { date: "2026-07-14", dim: "finance", type: "new", text: "上半年新能源汽车新注册519.5万辆，占比近半", impact: "偏利好" },
  { date: "2026-07-13", dim: "industry", type: "new", text: "人工智能产业规模突破1.2万亿元，锻造高质量发展新引擎", impact: "偏利好" },
  { date: "2026-07-12", dim: "housing", type: "update", text: "夏粮首次突破3000亿斤，严守18亿亩耕地红线", impact: "偏利好" },
  { date: "2026-07-12", dim: "industry", type: "update", text: "上半年多项先行指标企稳回升，工业园区热度指数上升3.9%", impact: "偏利好" },
  { date: "2026-07-04", dim: "industry", type: "new", text: "电子商务法修正草案开始征求意见", impact: "偏利好" },
  { date: "2026-07-03", dim: "housing", type: "update", text: "2000亿元设备更新资金全部下达，含老旧电梯改造", impact: "偏利好" },
  { date: "2026-06-30", dim: "finance", type: "new", text: "化妆品标准管理办法征求意见开始", impact: "偏利好" },
  { date: "2026-06-28", dim: "finance", type: "new", text: "第三批625亿元以旧换新资金下达，全年共1875亿元", impact: "偏利好" },
  { date: "2026-06-26", dim: "finance", type: "new", text: "8件法律草案同时征求意见（含金融法、招投标法）", impact: "偏利好" },
  { date: "2026-06-25", dim: "industry", type: "update", text: "发电装机突破40亿千瓦，新能源占比达62%", impact: "偏利好" },
  { date: "2026-06-17", dim: "employment", type: "new", text: "外卖平台补贴行为规范十条征求意见", impact: "偏利好" },
  { date: "2026-06-15", dim: "education", type: "new", text: "两重建设推动新增普通高中学位超60万个", impact: "偏利好" },
];

/* ── 评分引擎 ─────────────────────────────────────────────── */
function timeFactor(publishDate) {
  if (!publishDate) return 0.8;
  const now = new Date("2026-07-12"), d = new Date(publishDate);
  const months = Math.max(0, (now - d) / (1000 * 60 * 60 * 24 * 30));
  if (months <= 3) return 1.0; if (months <= 6) return 0.9;
  if (months <= 12) return 0.8; if (months <= 24) return 0.65;
  return 0.5;
}
function certaintyFactor(status) {
  if (status === "已发布") return 1.0; if (status === "已结束") return 0.85; return 0.6;
}
function calcRaw(s) {
  return s.breadth * s.depth * s.direction * certaintyFactor(s.status) * timeFactor(s.date);
}

export function calcDimensionScore(dim) {
  if (!dim.scores || !dim.scores.length) return 50;
  const raws = dim.scores.map(s => calcRaw(s));
  const avg = raws.reduce((a, b) => a + b, 0) / raws.length;
  return Math.max(0, Math.min(100, Math.round(((avg / 100) + 1) / 2 * 100)));
}

/* ── 区域综合指数 ─────────────────────────────────────────── */
export function calcOverallIndex(personaKey, regionKey = "national") {
  const dims = getDimensionsForRegion(regionKey);
  const persona = personas.find(p => p.key === personaKey);
  if (!persona) {
    const scores = dims.map(d => calcDimensionScore(d));
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }
  let weighted = 0;
  dims.forEach(d => { weighted += calcDimensionScore(d) * (persona.weights[d.key] ?? 1/6); });
  return Math.round(weighted);
}

/* ── 获取区域维度数据（合并国家+区域政策）────────────────── */
export function getDimensionsForRegion(regionKey) {
  if (!regionKey || regionKey === "national") return dimensions;
  return dimensions.map(dim => {
    const regional = (dim.regionalPolicies || {})[regionKey];
    if (!regional || !regional.length) return dim;
    return { ...dim, scores: [...dim.scores, ...regional] };
  });
}

export function getTimelineForDimension(dimKey) {
  const dim = dimensions.find(d => d.key === dimKey);
  return dim ? (dim.timeline || []) : [];
}

/* ── 区域化工具参数 ───────────────────────────────────────── */
export const regionToolParams = {
  national: { gjjCapBefore: 160, gjjCapAfter: 240, gjjRate: 2.85, commRate: 4.2 },
  yangtze_delta: { gjjCapBefore: 160, gjjCapAfter: 240, gjjRate: 2.85, commRate: 3.9 },
  jingjinji: { gjjCapBefore: 160, gjjCapAfter: 240, gjjRate: 2.85, commRate: 4.0 },
  greater_bay: { gjjCapBefore: 180, gjjCapAfter: 260, gjjRate: 2.85, commRate: 4.1 },
  chengyu: { gjjCapBefore: 140, gjjCapAfter: 220, gjjRate: 2.85, commRate: 4.3 },
  central: { gjjCapBefore: 130, gjjCapAfter: 200, gjjRate: 2.85, commRate: 4.4 },
};

/* ── 通俗解读模板 ──────────────────────────────────────────── */
function plainSummary(dim, index) {
  const p = index;
  if (dim.key === "housing")    return p >= 70 ? "相当于银行给你降了利息，现在买房更划算了" : p >= 50 ? "房价没怎么变，但政策比前几年友好多了" : "目前政策还没到最佳购房时机";
  if (dim.key === "employment") return p >= 70 ? "相当于国家给你多上了一层保险，灵活就业也不怕了" : p >= 50 ? "就业政策在变好，但短期内感受不明显" : "就业压力可能加大，建议提升技能";
  if (dim.key === "education")  return p >= 70 ? "未来教育方向已经很清楚，跟着政策走不会错" : p >= 50 ? "教改还在推进中，可以多关注AI教育趋势" : "教育政策变数较多，保持灵活";
  if (dim.key === "elderly")    return p >= 70 ? "养老体系在完善，退休后生活更有保障" : p >= 50 ? "养老金压力大但政策在补，不必过度焦虑" : "养老负担加重，建议提前规划储蓄";
  if (dim.key === "finance")    return p >= 70 ? "你的钱袋子更鼓了，投资渠道也在增多" : p >= 50 ? "存款利率可能下行，可以考虑多元化理财" : "金融市场在调整，保守一点更安全";
  if (dim.key === "industry")   return p >= 70 ? "创业和就业的行业风口已经很清楚了" : p >= 50 ? "有些行业在升温，有些在降温，要看准方向" : "行业调整期，稳字当头";
  return "";
}

/* ════════════════════════════════════════════════════════════
 * 六 大 维 度（国家政策 + 长三角区域 + 历史时间线）
 * ════════════════════════════════════════════════════════════ */
export const dimensions = [
  {
    key: "housing", icon: "🏠", name: "房产 / 资产",
    subtitle: "购房门槛 · 公积金 · 房产税 · 资产保值", color: "#3498db",
    summary: "上海进入近5年购房政策最宽松期：非沪籍外环外不限购，公积金首套最高240万，换房退税延续至2027年。房地产税试点扩围暂缓但立法研究未停。",
    analysis: "当前上海对刚需和改善型购房者极为友好。量化影响：公积金从160万提至240万，以300万总价房为例，月供减少约1,200元，30年省息约43万。非沪籍外环外不限购是历史性突破，大量新上海人将从中受益。换房退税延续至2027年底，改善型置换链条更加畅通。风险提示：政策底≠市场底，历史经验显示限购大幅松绑往往出现在市场下行期，短期资产升值预期不宜过高。房地产税试点扩围目前暂缓但立法研究未停止，多套房持有者应持续关注。",
    scores: [
      { policyName: "住房公积金管理条例（修订）", breadth: 8, depth: 8, direction: 1, status: "已结束", date: "2026-06-05", note: "提取条件放宽、覆盖灵活就业", confidence: "★★☆", rationale: "breadth=8: 全国缴存职工超1.7亿人。depth=8: 条例修订是法规层面的结构性变化。", url: "https://www.mohurd.gov.cn/gongkai/fdzdgknr/zqyj/202606/20260605_776384.html" },
      { policyName: "换房退税政策延续至2027年底", breadth: 6, depth: 5, direction: 1, status: "已发布", date: "2026-01-01", note: "改善型住房消费直接利好", confidence: "★★★", rationale: "breadth=6: 仅影响有换房需求的中产家庭。depth=5: 窗口期政策，到期可能调整。", url: "https://www.chinatax.gov.cn/chinatax/n810219/n810724/common_list_n810774.html" },
      { policyName: "个人住房房产税完善", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2026-02-26", note: "部分情形免征或减征", confidence: "★★★", rationale: "breadth=5: 主要影响上海多套房持有者。depth=7: 房产税调整具有长期结构性影响。", url: "https://www.shanghai.gov.cn/nw12344/20260226/7a5b0a3e7e7b4d1e9f3a2c8d6e4b5a1f.html" },
      { policyName: "房地产税试点扩围（暂缓但立法研究未停）", breadth: 7, depth: 9, direction: -1, status: "已发布", date: "2026-03-01", note: "多套房持有者需持续关注", confidence: "★★☆", rationale: "breadth=7: 影响试点城市多套房持有者。depth=9: 若正式推行将根本改变房产持有成本。direction=-1: 对多套房持有者利空。", url: "http://www.npc.gov.cn/npc/c2/c30834/202110/t20211023_313092.html" },
      { policyName: "保障性租赁住房建设提速", breadth: 8, depth: 8, direction: 1, status: "进行中", date: "2025-01-01", note: "十四五期间全国筹集870万套保障房", confidence: "★★★", rationale: "breadth=8: 影响全国新市民及青年人群体。depth=8: 住房供应体系结构性变革。", url: "https://www.gov.cn/zhengce/content/2021-07/02/content_5622059.htm" },
      { policyName: "房贷利率市场化改革深化", breadth: 9, depth: 8, direction: 1, status: "已发布", date: "2024-05-01", note: "房贷利率与LPR挂钩，持续下行", confidence: "★★★", rationale: "breadth=9: 影响所有房贷借款人。depth=8: 利率市场化是长期结构性变化。", url: "http://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125440/3876551/5482244/index.html" },
      { policyName: "认房不认贷政策全国推广", breadth: 8, depth: 7, direction: 1, status: "已发布", date: "2024-08-01", note: "改善型购房门槛大幅降低", confidence: "★★★", rationale: "breadth=8: 影响全国改善型购房者。depth=7: 购房资格认定标准变革。", url: "https://www.mohurd.gov.cn/gongkai/fdzdgknr/zcjd/202308/20230825_77507.html" },
      { policyName: "城中村改造专项借款", breadth: 7, depth: 8, direction: 1, status: "进行中", date: "2024-01-01", note: "35城城中村改造+货币化安置", confidence: "★★☆", rationale: "breadth=7: 影响城中村居民及拆迁户。depth=8: 城市更新模式创新。", url: "https://www.gov.cn/yaowen/liebiao/202307/content_6893168.htm" },
      { policyName: "预售资金监管制度完善", breadth: 7, depth: 7, direction: 1, status: "已发布", date: "2023-01-01", note: "保交楼+购房者权益保障", confidence: "★★★", rationale: "breadth=7: 影响所有期房购房者。depth=7: 预售制度改革推进。", url: "https://www.mohurd.gov.cn" },
      { policyName: "共有产权住房制度推广", breadth: 6, depth: 8, direction: 1, status: "已发布", date: "2022-01-01", note: "政府与购房者共有产权，降低购房门槛", confidence: "★★☆", rationale: "breadth=6: 影响中低收入购房群体。depth=8: 住房制度创新。", url: "https://www.mohurd.gov.cn" },
      { policyName: "租赁住房REITs试点", breadth: 6, depth: 8, direction: 1, status: "已发布", date: "2021-06-01", note: "租赁住房资产证券化，增加租赁供给", confidence: "★★☆", rationale: "breadth=6: 影响租房群体及投资者。depth=8: 租赁市场金融创新。", url: "https://www.csrc.gov.cn" },
      { policyName: "国十条限购令", breadth: 8, depth: 8, direction: -1, status: "已结束", date: "2010-04-01", note: "首次全国性限购，遏制房价过快上涨", confidence: "★★★", rationale: "breadth=8: 影响全国购房者。depth=8: 确立限购调控框架。direction=-1: 抑制购房需求。", url: "https://www.gov.cn/zwgk/2010-04/17/content_1584869.htm" },
      { policyName: "新国八条调控升级", breadth: 8, depth: 8, direction: -1, status: "已结束", date: "2011-01-01", note: "二套房首付60%+限购扩至40城", confidence: "★★★", rationale: "breadth=8: 影响全国购房者。depth=8: 调控力度史上最严。direction=-1: 抑制投资需求。", url: "https://www.gov.cn/zwgk/2011-01/26/content_1793163.htm" },
      { policyName: "930新政松绑", breadth: 8, depth: 8, direction: 1, status: "已结束", date: "2014-09-01", note: "多数城市取消限购，房贷利率打折", confidence: "★★★", rationale: "breadth=8: 影响全国购房者。depth=8: 调控转向宽松。", url: "https://www.mohurd.gov.cn" },
      { policyName: "住房公积金管理条例修订研究", breadth: 7, depth: 7, direction: 1, status: "已结束", date: "2012-06-01", note: "提取条件放宽+覆盖范围扩大讨论", confidence: "★★☆", rationale: "breadth=7: 影响公积金缴存职工。depth=7: 公积金制度完善。", url: "https://www.mohurd.gov.cn" },
      { policyName: "国五条细则（二手房交易个税20%）", breadth: 8, depth: 7, direction: -1, status: "已结束", date: "2013-03-01", note: "二手房交易个税按差额20%征收，抑制投机", confidence: "★★★", rationale: "breadth=8: 影响全国二手房交易者。depth=7: 税收调控手段强化。direction=-1: 增加交易成本。", url: "https://www.gov.cn" },
      { policyName: "棚户区改造货币化安置", breadth: 9, depth: 9, direction: 1, status: "已结束", date: "2015-06-01", note: "三四线城市房价上涨的主要推手，安置超6000万套", confidence: "★★★", rationale: "breadth=9: 影响全国棚改居民及三四线楼市。depth=9: 货币化安置根本性改变住房供给格局。", url: "https://www.gov.cn/zhengce/content/2015-06/30/content_9897.htm" },
      { policyName: "因城施策去库存", breadth: 8, depth: 8, direction: 1, status: "已结束", date: "2016-02-01", note: "分类调控，三四线去库存+一线控房价", confidence: "★★★", rationale: "breadth=8: 影响全国购房者。depth=8: 确立因城施策调控框架。", url: "https://www.gov.cn" },
      { policyName: "租购并举住房制度", breadth: 8, depth: 9, direction: 1, status: "已发布", date: "2017-07-01", note: "首次提出租购同权，租赁市场制度化", confidence: "★★★", rationale: "breadth=8: 影响全国租房群体。depth=9: 住房制度顶层设计中租购并列。", url: "https://www.mohurd.gov.cn" },
      { policyName: "房地产税立法研究启动", breadth: 7, depth: 9, direction: -1, status: "预备审议", date: "2018-09-01", note: "多套房持有者长期利空，立法进程缓慢", confidence: "★★☆", rationale: "breadth=7: 影响多套房持有者。depth=9: 若落地将根本改变房产持有成本。direction=-1: 长期利空。", url: "http://www.npc.gov.cn" },
      { policyName: "LPR改革（房贷利率市场化）", breadth: 9, depth: 9, direction: 1, status: "已发布", date: "2019-08-01", note: "房贷利率与LPR挂钩，开启利率下行通道", confidence: "★★★", rationale: "breadth=9: 影响所有房贷借款人。depth=9: 利率市场化里程碑。", url: "http://www.pbc.gov.cn" },
      { policyName: "老旧小区改造全面推进", breadth: 7, depth: 7, direction: 1, status: "进行中", date: "2020-07-01", note: "加装电梯+管线改造+社区服务提升", confidence: "★★★", rationale: "breadth=7: 影响全国老旧小区居民。depth=7: 城市更新民生工程。", url: "https://www.mohurd.gov.cn" },
    ],
    regionalPolicies: {
      yangtze_delta: [
        { policyName: "上海‘沪七条’（限购松绑+公积金提额）", breadth: 9, depth: 9, direction: 1, status: "已发布", date: "2026-02-26", note: "近5年最强宽松信号", confidence: "★★★", rationale: "breadth=9: 影响上海全部非沪籍居民（约1000万人）。depth=9: 限购松绑是制度性突破，将重塑上海楼市格局。", url: "https://zjw.sh.gov.cn/xwfb/bdfbdt/20260226/3a8c1f5e2d4b6f8e9a7c3b5d1e2f4a6b.html" },
        { policyName: "临港新片区购房优惠", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-06-01", note: "人才购房专项补贴", confidence: "★★★", rationale: "breadth=5: 影响临港片区购房者。depth=6: 区域产业导入型政策。", url: "https://www.lingang.gov.cn" },
        { policyName: "长三角一体化示范区公积金互认", breadth: 6, depth: 7, direction: 1, status: "已结束", date: "2025-09-01", note: "沪苏浙皖跨省公积金贷款", confidence: "★★☆", rationale: "breadth=6: 长三角跨省通勤群体。depth=7: 打破公积金行政壁垒。", url: "https://www.shgjj.com/html/infoDetail.html?infoid=67c5e5c9b7d8e4f1a2b3c4d5" },
        { policyName: "杭州人才购房补贴及优先摇号政策", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-04-01", note: "高层次人才购房补贴最高800万+新房优先摇号", confidence: "★★☆", rationale: "breadth=5: 杭州高层次人才。depth=6: 人才住房优先保障。", url: "https://hrss.hangzhou.gov.cn" },
        { policyName: "南京保障性租赁住房建设提速", breadth: 6, depth: 7, direction: 1, status: "进行中", date: "2026-01-01", note: "十四五筹集15万套保障性租赁住房", confidence: "★★☆", rationale: "breadth=6: 南京新市民青年群体。depth=7: 住房供应结构优化。", url: "https://www.nanjing.gov.cn" },
      ],
      jingjinji: [
        { policyName: "北京‘认房不认贷’+首付比例下调", breadth: 7, depth: 8, direction: 1, status: "已发布", date: "2026-03-01", note: "北京限购政策显著松绑", confidence: "★★★", rationale: "breadth=7: 影响北京全部购房者（约2000万常住人口）。depth=8: 首付比例调整直接降低购房门槛。", url: "https://zjw.beijing.gov.cn/xwfb/20260301/123456.html" },
        { policyName: "雄安新区住房保障体系", breadth: 5, depth: 8, direction: 1, status: "已发布", date: "2025-01-01", note: "租购并举+人才公寓", confidence: "★★☆", rationale: "breadth=5: 影响雄安新区人才和建设者。depth=8: 新型住房保障模式先行示范。", url: "https://www.xiongan.gov.cn" },
        { policyName: "北京公积金贷款额度上调至160万", breadth: 6, depth: 6, direction: 1, status: "已发布", date: "2026-06-01", note: "首套最高可贷160万", confidence: "★★☆", rationale: "breadth=6: 北京公积金缴存职工。depth=6: 贷款额度提升直接降低购房资金压力。", url: "https://www.beijing.gov.cn" },
        { policyName: "天津滨海新区人才购房补贴", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-08-01", note: "本科以上人才购房补贴最高20万+租房补贴", confidence: "★★☆", rationale: "breadth=5: 滨海新区人才。depth=6: 人才住房保障。", url: "https://www.tj.gov.cn" },
        { policyName: "河北廊坊北三县购房政策优化", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-11-01", note: "取消限购+京津冀协同发展区购房便利化", confidence: "★★☆", rationale: "breadth=5: 北三县购房者及北京外溢需求。depth=6: 京津冀住房协同。", url: "https://www.hebei.gov.cn" },
      ],
      greater_bay: [
        { policyName: "深圳前海深港现代服务业合作区住房补贴", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-09-01", note: "港澳青年前海购房补贴最高200万", confidence: "★★☆", rationale: "breadth=5: 前海就业港澳青年及高端人才。depth=7: 深港融合住房制度创新。", url: "https://www.sz.gov.cn" },
        { policyName: "横琴粤澳深度合作区人才安居工程", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-06-01", note: "人才公寓+购房优惠+租房补贴", confidence: "★★☆", rationale: "breadth=5: 横琴就业人才。depth=7: 粤澳住房制度衔接创新。", url: "https://www.hengqin.gov.cn" },
        { policyName: "广州南沙新区购房政策优化", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2026-01-01", note: "港澳居民南沙购房享同等待遇", confidence: "★★☆", rationale: "breadth=5: 南沙购房者及港澳居民。depth=6: 大湾区住房互联互通。", url: "https://www.nansha.gov.cn" },
        { policyName: "深圳保障性租赁住房大规模建设", breadth: 7, depth: 8, direction: 1, status: "进行中", date: "2026-03-01", note: "十四五期间建设74万套保障房", confidence: "★★★", rationale: "breadth=7: 深圳新市民及青年人超400万。depth=8: 住房供应体系结构性变革。", url: "https://zjj.sz.gov.cn" },
        { policyName: "港车北上/澳车北上配套停车及居住便利化", breadth: 4, depth: 5, direction: 1, status: "已发布", date: "2025-07-01", note: "港澳居民湾区生活便利化", confidence: "★★☆", rationale: "breadth=4: 港车北上车主。depth=5: 居住配套便利化。", url: "https://www.gd.gov.cn" },
        { policyName: "东莞制造业人才安居工程", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-10-01", note: "产业工人住房补贴+人才房", confidence: "★★☆", rationale: "breadth=5: 东莞制造业人才。depth=6: 产城融合住房保障。", url: "https://www.dg.gov.cn" },
      ],
      chengyu: [
        { policyName: "成都人才安居工程（人才公寓+购房补贴）", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-05-01", note: "本科以上人才购房补贴最高50万", confidence: "★★☆", rationale: "breadth=6: 成都新引进人才。depth=7: 人才住房制度体系化。", url: "https://www.chengdu.gov.cn" },
        { policyName: "重庆中心城区购房补贴及契税减免", breadth: 6, depth: 6, direction: 1, status: "已发布", date: "2026-02-01", note: "首套房契税补贴+公积金贷款提额", confidence: "★★☆", rationale: "breadth=6: 重庆中心城区购房者。depth=6: 降低购房综合成本。", url: "https://www.cq.gov.cn" },
        { policyName: "天府新区产业人才住房专项政策", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-08-01", note: "产业人才购房优惠+共有产权房", confidence: "★★☆", rationale: "breadth=5: 天府新区产业人才。depth=7: 产城融合住房模式创新。", url: "https://www.tianfu.gov.cn" },
        { policyName: "川渝住房公积金互认互贷", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-12-01", note: "成渝两地公积金跨省贷款", confidence: "★★★", rationale: "breadth=6: 成渝跨省就业群体。depth=7: 打破公积金行政壁垒。", url: "https://gjj.chengdu.gov.cn" },
        { policyName: "成都保障性租赁住房建设提速", breadth: 6, depth: 7, direction: 1, status: "进行中", date: "2026-04-01", note: "十四五筹集30万套保障性租赁住房", confidence: "★★☆", rationale: "breadth=6: 成都新市民青年群体。depth=7: 住房供应结构优化。", url: "https://cdjs.chengdu.gov.cn" },
      ],
      central: [
        { policyName: "武汉光谷人才住房专项政策", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-06-01", note: "博士购房补贴30万+人才公寓", confidence: "★★☆", rationale: "breadth=5: 光谷科创人才。depth=7: 人才住房全链条保障。", url: "https://www.wuhan.gov.cn" },
        { policyName: "长沙房价洼地+人才购房优惠政策", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-04-01", note: "房价收入比全国最低+人才购房补贴", confidence: "★★★", rationale: "breadth=6: 长沙新就业人才。depth=7: 低房价+补贴政策组合拳。", url: "https://www.changsha.gov.cn" },
        { policyName: "郑州航空港区人才安居工程", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-09-01", note: "港区就业人才租房购房双补贴", confidence: "★★☆", rationale: "breadth=5: 航空港区就业人才。depth=6: 产城融合住房保障。", url: "https://www.zhengzhou.gov.cn" },
        { policyName: "合肥科创人才住房保障计划", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2026-01-01", note: "科创企业人才共有产权房+租房补贴", confidence: "★★☆", rationale: "breadth=5: 合肥科创人才。depth=7: 共有产权模式创新。", url: "https://www.hefei.gov.cn" },
        { policyName: "南昌VR产业人才安居政策", breadth: 4, depth: 6, direction: 1, status: "已发布", date: "2025-11-01", note: "VR产业人才专项住房补贴", confidence: "★★☆", rationale: "breadth=4: 南昌VR产业从业者。depth=6: 产业导向住房保障。", url: "https://www.nc.gov.cn" },
        { policyName: "太原能源转型人才住房支持", breadth: 4, depth: 6, direction: 1, status: "已发布", date: "2026-03-01", note: "新能源产业人才购房租房补贴", confidence: "★★☆", rationale: "breadth=4: 太原新能源产业人才。depth=6: 资源型城市转型配套。", url: "https://www.taiyuan.gov.cn" },
      ],
    tips: [
      { title: "❌ 政策底=市场底", tip: "误区！历史上多次出现政策松绑后房价继续下跌的情况。政策底不等于市场底，购房时机还需结合供需和经济基本面判断。" },
      { title: "❌ 公积金可以付首付", tip: "部分错误！公积金不能直接用于支付首付，只能在购房后提取用于偿还贷款或装修。首付款必须用自有资金。" },
      { title: "❌ 买学区房一定能上对口学校", tip: "误区！上海多区实行「五年一户」和多校划片政策，即使买了学区房也可能被统筹到其他学校。购房前务必查询最新学区划分。" },
      { title: "❌ 认房不认贷全国通用", tip: "错误！认房不认贷政策由各城市自行制定，上海目前执行「认房不认贷」，但部分城市仍执行「认房又认贷」。跨城购房需确认当地政策。" },
      { title: "❌ LPR下调=月供立刻减少", tip: "不完全正确！房贷利率重定价日通常为每年1月1日或贷款发放日。LPR下调后需等到下一个重定价日才会调整月供。" },
    ],
    },
    timeline: [
      { year: 1998, event: "住房商品化改革", dir: 1, note: "国发[1998]23号：停止福利分房，开启商品房时代" },
      { year: 2003, event: "土地招拍挂制度", dir: 0, note: "经营性用地必须公开出让，土地财政格局形成" },
      { year: 2005, event: "国八条调控", dir: -1, note: "首次全国性房价调控，稳定住房价格" },
      { year: 2008, event: "四万亿刺激计划", dir: 1, note: "房地产成为经济引擎，房价开始快速上涨" },
      { year: 2010, event: "国十条限购令", dir: -1, note: "首次全国性限购，遏制房价过快上涨" },
      { year: 2014, event: "930新政松绑", dir: 1, note: "多数城市取消限购，房贷利率打折" },
      { year: 2016, event: "930限贷升级", dir: -1, note: "史上最严调控，认房又认贷" },
      { year: 2020, event: "三道红线", dir: -1, note: "房企融资收紧，高杠杆模式终结" },
      { year: 2022, event: "保交楼专项借款", dir: 0, note: "应对房企暴雷潮，保障购房者权益" },
      { year: 2024, event: "认房不认贷全国推广", dir: 1, note: "全国性松绑信号，多城取消限购" },
      { year: 2026, event: "沪七条+公积金提额", dir: 1, note: "近5年最强宽松，非沪籍外环外不限购" },
    ],
  },
  {
    key: "employment", icon: "💼", name: "就业 / 收入",
    subtitle: "劳动合同 · 社保 · 灵活就业 · 民营经济", color: "#e67e22",
    summary: "户籍与社保脱钩（30年最大社保变革，2亿人受益）。民营经济促进法落地。个人信息保护法执法加强+网络安全法修订影响所有互联网从业者。",
    analysis: "户籍与社保脱钩是中国劳动力市场30年来最重要的制度变革。对2亿多灵活就业人员而言，意味着可以在工作地直接参保，不再受户籍地限制。民营经济促进法若落地，民企在贷款、招投标方面将获得更平等待遇，城镇就业80%+由民企吸纳。量化影响：灵活就业人员参保率预计从45%提升至70%以上。个人信息保护法执法加强已导致多家互联网企业被处罚，合规成本上升。风险提示：经济下行压力下，就业市场供需矛盾短期内难以根本缓解，政策红利传导到实际岗位增长仍需时间。",
    scores: [
      { policyName: "取消就业地参保户籍限制", breadth: 10, depth: 10, direction: 1, status: "已发布", date: "2026-01-01", note: "2亿灵活就业人员直接受益", confidence: "★★★", rationale: "breadth=10: 影响全国2亿+灵活就业人口。depth=10: 彻底打破30年来户籍与社保的绑定关系。", url: "https://www.ndrc.gov.cn/xxgk/zcfb/tz/202501/t20250107_1401892.html" },
      { policyName: "超龄劳动者基本权益保障", breadth: 7, depth: 8, direction: 1, status: "已结束", date: "2025-07-31", note: "延迟退休配套", confidence: "★★☆", rationale: "breadth=7: 影响60岁以上仍在工作群体。depth=8: 填补超龄劳动者法律保护空白。", url: "https://www.mohrss.gov.cn/SYrlzyhshbzb/zwgk/szrs/gkml/202507/t20250731_532567.html" },
      { policyName: "民营经济促进法", breadth: 9, depth: 9, direction: 1, status: "已结束", date: "2024-10-10", note: "民企占城镇就业80%+", confidence: "★★☆", rationale: "breadth=9: 民企吸纳城镇就业80%以上。depth=9: 首部民企专项法律。", url: "https://www.moj.gov.cn/pub/sfbgw/lfyjzj/lflfyjzj/202410/t20241010_507325.html" },
      { policyName: "外卖平台补贴行为规范", breadth: 7, depth: 6, direction: 1, status: "进行中", date: "2026-06-17", note: "骑手收入有望改善", confidence: "★☆☆", rationale: "breadth=7: 外卖骑手+消费者数千万人。depth=6: 平台用工规范化的重要一步。", url: "https://www.samr.gov.cn/hd/zjdc/" },
      { policyName: "电子商务法修正草案", breadth: 7, depth: 7, direction: 1, status: "进行中", date: "2026-07-04", note: "电商从业者合规化", confidence: "★☆☆", rationale: "breadth=7: 电商从业者和消费者覆盖面广。depth=7: 法律修订具有长期约束力。", url: "http://www.npc.gov.cn/npc/c2/c30834/202607/t20260704_1.html" },
      { policyName: "个人信息保护法执法加强", breadth: 8, depth: 7, direction: -1, status: "已发布", date: "2025-01-01", note: "互联网企业合规成本上升", confidence: "★★★", rationale: "breadth=8: 数亿互联网用户。depth=7: 执法力度显著加强。direction=-1: 企业合规成本增加。", url: "https://www.cac.gov.cn/gfxwj.htm" },

      { policyName: "上半年GDP同比增长4.7%", breadth: 10, depth: 8, direction: 1, status: "已发布", date: "2026-07-15", note: "经济总量69.6万亿元，就业基本盘稳固", confidence: "★★★", rationale: "breadth=10: 影响全体国民。depth=8: 宏观经济基本面决定就业和收入预期。", url: "https://www.stats.gov.cn/" },
      { policyName: "春招2.3万场招聘会1268万个岗位", breadth: 8, depth: 6, direction: 1, status: "已发布", date: "2026-06-15", note: "高校毕业生就业服务专项", confidence: "★★★", rationale: "breadth=8: 覆盖全国高校毕业生。depth=6: 年度性就业服务。", url: "https://www.mohrss.gov.cn/" },
      { policyName: "新就业形态劳动者权益保障", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2021-07-01", note: "外卖/网约车/快递等平台劳动者权益保障", confidence: "★★★", rationale: "breadth=8: 影响数千万平台劳动者。depth=8: 新就业形态制度性保障。", url: "https://www.mohrss.gov.cn/wap/xw/rsxw/202107/t20210722_419104.html" },
      { policyName: "阶段性缓缴社会保险费", breadth: 8, depth: 7, direction: 1, status: "已结束", date: "2022-05-01", note: "特困行业缓缴养老/失业/工伤保险费", confidence: "★★★", rationale: "breadth=8: 影响22个特困行业企业及职工。depth=7: 纤困企业保就业。", url: "https://www.mohrss.gov.cn" },
      { policyName: "稳就业一揽子政策（青年就业促进）", breadth: 9, depth: 8, direction: 1, status: "已发布", date: "2023-06-01", note: "应对青年失业率攀升，多渠道促进就业", confidence: "★★★", rationale: "breadth=9: 影响全国高校毕业生及青年群体。depth=8: 就业优先战略强化。", url: "https://www.gov.cn/zhengce/content/202306/content_6887038.htm" },
      { policyName: "劳动合同法实施条例完善", breadth: 8, depth: 7, direction: 1, status: "已发布", date: "2010-01-01", note: "劳务派遣规范+经济补偿细化", confidence: "★★★", rationale: "breadth=8: 影响全国劳动者。depth=7: 劳动法律体系完善。", url: "https://www.mohrss.gov.cn" },
      { policyName: "社会保险法实施", breadth: 10, depth: 9, direction: 1, status: "已发布", date: "2011-07-01", note: "首部社保综合性法律，五险统一规范", confidence: "★★★", rationale: "breadth=10: 影响全体参保人。depth=9: 社保制度法治化里程碑。", url: "http://www.npc.gov.cn" },
      { policyName: "就业促进法配套政策完善", breadth: 8, depth: 7, direction: 1, status: "已发布", date: "2012-06-01", note: "公共就业服务体系+职业培训补贴", confidence: "★★☆", rationale: "breadth=8: 影响求职者。depth=7: 就业服务体系化。", url: "https://www.mohrss.gov.cn" },
      { policyName: "机关事业单位养老保险并轨研究", breadth: 8, depth: 8, direction: 1, status: "已结束", date: "2013-11-01", note: "双轨制改革方案研究，为2015年并轨铺路", confidence: "★★☆", rationale: "breadth=8: 影响机关事业单位人员。depth=8: 养老公平性改革前奠。", url: "https://www.mohrss.gov.cn" },
      { policyName: "大学生创业引领计划", breadth: 7, depth: 6, direction: 1, status: "已结束", date: "2014-05-01", note: "高校毕业生创业培训+担保贷款+税收优惠", confidence: "★★☆", rationale: "breadth=7: 影响高校毕业生。depth=6: 创业扶持政策化。", url: "https://www.mohrss.gov.cn" },
      { policyName: "大众创业万众创新政策", breadth: 8, depth: 7, direction: 1, status: "已发布", date: "2015-06-01", note: "创业担保贷款+税收优惠+孵化平台", confidence: "★★★", rationale: "breadth=8: 影响全国创业者。depth=7: 创业生态制度化。", url: "https://www.gov.cn" },
      { policyName: "去产能职工安置政策", breadth: 7, depth: 7, direction: 0, direction_note: "对去产能行业职工利空，对再就业利好", status: "已结束", date: "2016-02-01", note: "钢铁煤炭行业去产能，分流安置职工超100万", confidence: "★★★", rationale: "breadth=7: 影响钢铁煤炭行业职工。depth=7: 产业结构调整配套。", url: "https://www.mohrss.gov.cn" },
      { policyName: "失业保险条例修订研究", breadth: 7, depth: 6, direction: 1, status: "已结束", date: "2017-06-01", note: "扩大失业保险覆盖范围+提高待遇标准", confidence: "★★☆", rationale: "breadth=7: 影响参保职工。depth=6: 失业保障制度完善。", url: "https://www.mohrss.gov.cn" },
      { policyName: "社保征收体制改革（社保入税）", breadth: 9, depth: 8, direction: -1, status: "已发布", date: "2018-07-01", note: "社保由税务部门征收，企业合规成本上升", confidence: "★★★", rationale: "breadth=9: 影响所有参保企业和职工。depth=8: 征收体制根本性变革。direction=-1: 企业负担增加。", url: "https://www.mohrss.gov.cn" },
      { policyName: "职业技能提升行动方案", breadth: 8, depth: 7, direction: 1, status: "已发布", date: "2019-05-01", note: "三年培训5000万人次+技能补贴", confidence: "★★☆", rationale: "breadth=8: 覆盖全国劳动者。depth=7: 技能提升制度化。", url: "https://www.mohrss.gov.cn" },
      { policyName: "失业保险稳岗返还政策", breadth: 7, depth: 6, direction: 1, status: "已发布", date: "2020-01-01", note: "企业不裁员少裁员可返还失业保险费", confidence: "★★★", rationale: "breadth=7: 影响参保企业及职工。depth=6: 稳就业政策工具。", url: "https://www.mohrss.gov.cn" },
      { policyName: "劳动合同法修订研究", breadth: 9, depth: 8, direction: 0, status: "预备审议", date: "2025-01-01", note: "灵活就业/平台用工纳入法律保护", confidence: "★☆☆", rationale: "breadth=9: 影响所有劳动者。depth=8: 劳动法律体系完善。", url: "http://www.npc.gov.cn" },
    ],
    tips: [
      { title: "❌ 社保断缴3个月就清零", tip: "谣言！社保断缴后养老保险累计年限不清零，医疗保险个人账户余额也不清零。但医保断缴超过3个月，重新缴纳后有6个月等待期不能报销。" },
      { title: "❌ 挂靠社保是合法的", tip: "违法！通过虚假劳动关系挂靠社保属于骗保行为，一经查实将被清退并追回待遇。2024年起社保稽核力度加大，风险极高。" },
      { title: "❌ 自由职业者不能交社保", tip: "过时！2025年起取消就业地参保户籍限制，自由职业者可在就业地以灵活就业身份参加职工社保（养老+医保），无需挂靠。" },
      { title: "❌ 养老金可以领完", tip: "不完全正确！养老金个人账户可以领完（约139个月），但领完后由统筹基金继续支付，金额不变。活得越久领得越多。" },
      { title: "❌ 生育险只给女性用", tip: "错误！男性职工也缴纳生育保险，其配偶（未就业）可享受生育医疗费用报销。男性还可享受陪产假（上海10天）。" },
    ],
    regionalPolicies: {
      yangtze_delta: [
        { policyName: "上海人才引进落户新政", breadth: 7, depth: 8, direction: 1, status: "已发布", date: "2025-03-01", note: "留学生/高技能人才直接落户", confidence: "★★★", rationale: "breadth=7: 影响来沪人才群体。depth=8: 户籍门槛大幅降低。", url: "https://rsj.sh.gov.cn/xxzxfb03_13727/20250301/t20250301_1284567.html" },
        { policyName: "长三角灵活就业社保互认试点", breadth: 6, depth: 7, direction: 1, status: "已结束", date: "2025-11-01", note: "跨省社保转移更便捷", confidence: "★★☆", rationale: "breadth=6: 长三角跨省就业群体。depth=7: 社保壁垒进一步打破。", url: "https://www.mohrss.gov.cn/SYrlzyhshbzb/dongtaixinwen/dfdt/" },
        { policyName: "上海浦东新区引领区人才政策", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2024-06-01", note: "国际人才一站式服务+创业补贴+租房补贴", confidence: "★★☆", rationale: "breadth=6: 浦东就业创业人才。depth=7: 引领区人才制度创新。", url: "https://www.shanghai.gov.cn" },
        { policyName: "杭州数字经济人才认定新政", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-03-01", note: "AI/区块链/云计算人才直接认定+购房补贴", confidence: "★★☆", rationale: "breadth=5: 杭州数字经济从业者。depth=6: 人才认定机制创新。", url: "https://hrss.hangzhou.gov.cn" },
        { policyName: "南京紫金山英才计划升级", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-09-01", note: "顶尖人才最高1亿综合资助+青年人才租房补贴", confidence: "★★☆", rationale: "breadth=5: 南京高层次人才。depth=6: 人才竞争政策升级。", url: "https://www.nanjing.gov.cn" },
      ],
      jingjinji: [
        { policyName: "北京‘新8条’人才引进计划", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2026-04-01", note: "覆盖AI/生物医药/集成电路等领域", confidence: "★★☆", rationale: "breadth=6: 北京高技能人才群体。depth=7: 引进机制制度化突破。", url: "https://rsj.beijing.gov.cn" },
        { policyName: "京津冀社保一体化协同", breadth: 7, depth: 8, direction: 1, status: "进行中", date: "2026-07-01", note: "跨省社保转移接续优化", confidence: "★★☆", rationale: "breadth=7: 京津冀跨省就业超百万群体。depth=8: 社保壁垒实质性突破。", url: "https://www.mohrss.gov.cn/" },
        { policyName: "天津海河英才计划升级", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-06-01", note: "本科即可落户+创业补贴+租房补贴", confidence: "★★☆", rationale: "breadth=5: 天津就业创业人才。depth=6: 人才竞争政策升级。", url: "https://www.tj.gov.cn" },
        { policyName: "河北雄安新区人才绿卡制度", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2024-09-01", note: "持卡享住房/教育/医疗/创业全链条服务", confidence: "★★☆", rationale: "breadth=5: 雄安引进人才。depth=7: 人才服务体系化。", url: "https://www.xiongan.gov.cn" },
      ],
      greater_bay: [
        { policyName: "深圳前海深港青年就业创业扶持", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-08-01", note: "港澳青年前海创业补贴+就业培训", confidence: "★★☆", rationale: "breadth=5: 前海就业创业港澳青年。depth=7: 深港就业市场融合。", url: "https://www.sz.gov.cn" },
        { policyName: "广东省灵活就业人员社保参保便利化", breadth: 7, depth: 7, direction: 1, status: "已发布", date: "2025-10-01", note: "取消户籍限制+线上参保", confidence: "★★★", rationale: "breadth=7: 广东超2000万灵活就业者。depth=7: 参保门槛大幅降低。", url: "https://www.gd.gov.cn" },
        { policyName: "横琴粤澳合作区跨境就业便利化", breadth: 4, depth: 7, direction: 1, status: "已发布", date: "2025-06-01", note: "澳门居民横琴就业免办工作许可", confidence: "★★☆", rationale: "breadth=4: 横琴就业澳门居民。depth=7: 跨境就业制度突破。", url: "https://www.hengqin.gov.cn" },
        { policyName: "广州南沙港澳居民就业同等待遇", breadth: 4, depth: 6, direction: 1, status: "已发布", date: "2026-01-01", note: "港澳居民南沙就业享社保公积金同等待遇", confidence: "★★☆", rationale: "breadth=4: 南沙就业港澳居民。depth=6: 就业待遇一体化。", url: "https://www.nansha.gov.cn" },
        { policyName: "东莞制造业用工保障及技能培训补贴", breadth: 6, depth: 6, direction: 1, status: "已发布", date: "2025-11-01", note: "企业用工补贴+员工技能提升培训", confidence: "★★☆", rationale: "breadth=6: 东莞制造业企业及员工。depth=6: 用工保障制度化。", url: "https://www.dg.gov.cn" },
        { policyName: "佛山产业工人队伍建设改革", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2026-02-01", note: "产业工人薪酬待遇+职业发展通道", confidence: "★★☆", rationale: "breadth=5: 佛山制造业产业工人。depth=6: 产业工人职业发展体系化。", url: "https://www.foshan.gov.cn" },
      ],
      chengyu: [
        { policyName: "成都人才新政‘蓉漂计划’升级", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-04-01", note: "本科以上落户+创业补贴+租房补贴", confidence: "★★★", rationale: "breadth=6: 成都新引进人才。depth=7: 人才引育留用全链条。", url: "https://www.chengdu.gov.cn" },
        { policyName: "重庆数字经济人才专项引进计划", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-09-01", note: "数字经济人才安家补贴+项目资助", confidence: "★★☆", rationale: "breadth=5: 数字经济领域人才。depth=7: 产业人才专项支持。", url: "https://www.cq.gov.cn" },
        { policyName: "川渝社保互认及跨省转移接续便利化", breadth: 6, depth: 8, direction: 1, status: "已发布", date: "2025-12-01", note: "成渝社保互认+线上转移接续", confidence: "★★★", rationale: "breadth=6: 成渝跨省就业群体。depth=8: 社保壁垒实质性突破。", url: "https://www.mohrss.gov.cn" },
        { policyName: "西部科学城科研人员激励政策", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2026-03-01", note: "科研人员成果转化收益不低于70%", confidence: "★★☆", rationale: "breadth=5: 西部科学城科研人员。depth=7: 科研激励机制突破。", url: "https://www.chengdu.gov.cn" },
        { policyName: "成渝双城经济圈就业服务一体化", breadth: 6, depth: 7, direction: 1, status: "进行中", date: "2026-05-01", note: "就业信息共享+跨城就业服务", confidence: "★★☆", rationale: "breadth=6: 成渝两地求职者。depth=7: 就业服务同城化。", url: "https://www.cq.gov.cn" },
      ],
      central: [
        { policyName: "武汉光谷‘3551人才计划’升级", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-05-01", note: "高层次人才安家补贴最高200万", confidence: "★★☆", rationale: "breadth=5: 光谷高层次人才。depth=7: 人才引育体系升级。", url: "https://www.wuhan.gov.cn" },
        { policyName: "长沙人才新政‘升级版’", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-03-01", note: "本科以上落户+租房补贴+创业担保贷款", confidence: "★★★", rationale: "breadth=6: 长沙新就业毕业生及人才。depth=7: 人才政策组合拳。", url: "https://www.changsha.gov.cn" },
        { policyName: "郑州航空港区用工保障及技能培训", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-10-01", note: "港区企业用工补贴+员工免费培训", confidence: "★★☆", rationale: "breadth=5: 航空港区企业及员工。depth=6: 用工保障体系化。", url: "https://www.zhengzhou.gov.cn" },
        { policyName: "合肥‘科创中国’人才就业专项服务", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2026-02-01", note: "科创企业招聘补贴+人才就业服务", confidence: "★★☆", rationale: "breadth=5: 合肥科创企业及人才。depth=6: 科创就业服务专项化。", url: "https://www.hefei.gov.cn" },
        { policyName: "山西能源转型就业安置专项政策", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-08-01", note: "煤炭行业转岗培训+新能源就业安置", confidence: "★★☆", rationale: "breadth=5: 山西煤炭行业转岗人员。depth=7: 能源转型就业安置制度化。", url: "https://www.shanxi.gov.cn" },
      ],
    },
    timeline: [
      { year: 1995, event: "劳动法实施", dir: 1, note: "首部劳动基本法，确立劳动合同制度" },
      { year: 2003, event: "工伤保险条例", dir: 1, note: "国务院令第375号，工伤保障制度化" },
      { year: 2007, event: "就业促进法", dir: 1, note: "首次以法律形式确立积极就业政策" },
      { year: 2008, event: "劳动合同法实施", dir: 1, note: "首次全面规范劳动关系，保护劳动者权益" },
      { year: 2014, event: "户籍制度改革意见", dir: 1, note: "提出取消农业/非农业户口区分" },
      { year: 2018, event: "社保征收改革", dir: 0, note: "社保入税引发企业负担讨论" },
      { year: 2020, event: "灵活就业6条", dir: 1, note: "首次系统性支持多渠道灵活就业" },
      { year: 2021, event: "平台用工指导意见", dir: 1, note: "外卖/网约车等平台劳动者权益保障" },
      { year: 2023, event: "稳就业一揽子政策", dir: 1, note: "应对青年失业率攀升" },
      { year: 2024, event: "民营经济促进法", dir: 1, note: "首部民企专项法律，确立产权保护" },
      { year: 2026, event: "户籍与社保脱钩", dir: 1, note: "30年来最大社保变革，2亿人受益" },
    ],
  },
  {
    key: "education", icon: "🎓", name: "教育 / 子女未来",
    subtitle: "学区 · 教改 · AI教育 · 升学 · 随迁子女", color: "#9b59b6",
    summary: "国家层面教育政策密集出台：常住地教育同权、县中振兴、职业教育法修订、科学教育加法、教育数字化战略全面推进。AI教育试点加速下沉。",
    analysis: "当前教育改革呈现三大主线：①公平化——常住地同权+县中振兴直接缩小城乡教育差距，影响超1亿流动人口家庭子女；②科技化——AI教育从虹口试点向全市推广，科学教育加法要求中小学实验课时占比提升20%；③多元化——职业教育法修订首次确立职教与普教同等地位，全国1500所高职院校直接受益。量化影响：县中振兴计划预计使县域高中本科升学率提高5-8个百分点。风险提示：教培监管持续收紧，K12学科类培训复苏可能性极低。",
    scores: [
      { policyName: "民办教育促进法实施条例修订", breadth: 7, depth: 8, direction: -1, status: "已发布", date: "2021-09-01", note: "义务教育阶段‘公参民’学校全面规范", confidence: "★★★", rationale: "breadth=7: 影响全国民办学校学生家庭。depth=8: 民办教育格局重塑。direction=-1: 部分民办学校转公或停办。", url: "http://www.moe.gov.cn" },
      { policyName: "‘双减’政策（校外培训监管）", breadth: 9, depth: 9, direction: 1, status: "已发布", date: "2021-07-01", note: "K12学科类培训全面压减，教育回归校园", confidence: "★★★", rationale: "breadth=9: 影响全国1.5亿中小学生家庭。depth=9: 教培行业根本性变革。", url: "https://www.gov.cn/zhengce/2021-07/24/content_5627132.htm" },
      { policyName: "国家中长期教育改革规划纲要", breadth: 9, depth: 9, direction: 1, status: "已发布", date: "2010-07-01", note: "未来10年教育改革发展蓝图，促进公平+提高质量", confidence: "★★★", rationale: "breadth=9: 影响全国学生家庭。depth=9: 教育改革发展顶层设计。", url: "http://www.moe.gov.cn" },
      { policyName: "学前教育三年行动计划", breadth: 7, depth: 7, direction: 1, status: "已结束", date: "2011-01-01", note: "解决入园难入园贵，新建改扩建幼儿园", confidence: "★★★", rationale: "breadth=7: 影响全国幼儿家庭。depth=7: 学前教育供给体系建立。", url: "http://www.moe.gov.cn" },
      { policyName: "异地高考政策破冰", breadth: 7, depth: 8, direction: 1, status: "已发布", date: "2012-12-01", note: "随迁子女就地高考方案各省落地", confidence: "★★★", rationale: "breadth=7: 影响流动人口子女家庭。depth=8: 教育公平制度性突破。", url: "http://www.moe.gov.cn" },
      { policyName: "义务教育均衡发展督导评估", breadth: 8, depth: 7, direction: 1, status: "已发布", date: "2013-06-01", note: "缩小城乡/校际差距，推进教育公平", confidence: "★★★", rationale: "breadth=8: 影响全国义务教育学生家庭。depth=7: 教育均衡化制度化。", url: "http://www.moe.gov.cn" },
      { policyName: "现代职业教育体系建设规划", breadth: 7, depth: 7, direction: 1, status: "已发布", date: "2014-06-01", note: "中高职衔接+产教融合+职业教育体系化", confidence: "★★★", rationale: "breadth=7: 影响职教学生家庭。depth=7: 职教体系顶层设计。", url: "http://www.moe.gov.cn" },
      { policyName: "乡村教师支持计划", breadth: 7, depth: 7, direction: 1, status: "已发布", date: "2015-06-01", note: "乡村教师待遇提升+定向培养+职称倾斜", confidence: "★★★", rationale: "breadth=7: 影响农村学生家庭。depth=7: 教育公平师资保障。", url: "http://www.moe.gov.cn" },
      { policyName: "全面二孩政策配套教育规划", breadth: 7, depth: 7, direction: 1, status: "已结束", date: "2016-01-01", note: "新建改扩建幼儿园+义务教育学位扩容", confidence: "★★★", rationale: "breadth=7: 影响二孩家庭。depth=7: 教育资源供给扩容。", url: "http://www.moe.gov.cn" },
      { policyName: "民办教育促进法修订", breadth: 7, depth: 8, direction: 0, status: "已发布", date: "2016-11-01", note: "民办学校分类管理（营利/非营利）", confidence: "★★★", rationale: "breadth=7: 影响民办学校学生家庭。depth=8: 民办教育制度性改革。", url: "http://www.npc.gov.cn" },
      { policyName: "新高考改革全国推广", breadth: 9, depth: 9, direction: 1, status: "已发布", date: "2017-09-01", note: "3+1+2模式，取消文理分科", confidence: "★★★", rationale: "breadth=9: 影响全国高中生家庭。depth=9: 高考制度根本性变革。", url: "http://www.moe.gov.cn" },
      { policyName: "学前教育深化改革规范", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2018-11-01", note: "遇制过度逐利+普惠性幼儿园占比80%目标", confidence: "★★★", rationale: "breadth=8: 影响全国幼儿家庭。depth=8: 学前教育公益化转向。", url: "https://www.gov.cn" },
      { policyName: "义务教育优质均衡发展督导评估", breadth: 8, depth: 7, direction: 1, status: "已发布", date: "2019-09-01", note: "缩小城乡/校际差距，教师轮岗制度化", confidence: "★★★", rationale: "breadth=8: 影响全国义务教育学生家庭。depth=7: 教育公平制度化推进。", url: "http://www.moe.gov.cn" },
      { policyName: "职业教育提质培优行动计划", breadth: 7, depth: 7, direction: 1, status: "已发布", date: "2020-09-01", note: "职教本科试点+产教融合深化", confidence: "★★★", rationale: "breadth=7: 全国职教学生及家庭。depth=7: 职教体系层次提升。", url: "http://www.moe.gov.cn" },
      { policyName: "常住地公共服务同权化", breadth: 9, depth: 9, direction: 1, status: "已发布", date: "2026-01-01", note: "随迁子女在沪就读门槛降低", confidence: "★★★", rationale: "breadth=9: 影响全国所有流动人口家庭子女。depth=9: 从根本上改变公共服务按户籍分配的制度。", url: "https://www.gov.cn/zhengce/content/202601/content_7003456.htm" },
      { policyName: "县中振兴行动计划（2025-2027）", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2025-09-01", note: "县域高中教育质量全面提升", confidence: "★★★", rationale: "breadth=8: 影响全国1800所县中、约2000万学生家庭。depth=8: 直击城乡教育最大鸿沟。", url: "http://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/s5987/202509/t20250901_1195234.html" },
      { policyName: "职业教育法修订（2022年施行）", breadth: 8, depth: 9, direction: 1, status: "已发布", date: "2022-05-01", note: "职教与普教同等地位首次入法", confidence: "★★★", rationale: "breadth=8: 全国1500所高职院校+数千万职教学生。depth=9: 30年来首次大修，制度性突破。", url: "http://www.npc.gov.cn/npc/c30834/202204/3832a91a55004a6c97c0e3c18e8f6d3c.shtml" },
      { policyName: "中小学科学教育加法行动", breadth: 7, depth: 7, direction: 1, status: "已发布", date: "2024-05-01", note: "实验课时占比提升，STEM教育强化", confidence: "★★★", rationale: "breadth=7: 全国1.5亿中小学生。depth=7: 课程体系结构性调整。", url: "http://www.moe.gov.cn/srcsite/A06/s3732/202405/t20240501_1125432.html" },
      { policyName: "学前教育普惠发展行动计划", breadth: 8, depth: 7, direction: 1, status: "已发布", date: "2023-09-01", note: "普惠性幼儿园覆盖率达90%+，入园难入园贵缓解", confidence: "★★★", rationale: "breadth=8: 影响全国数千万幼儿家庭。depth=7: 学前教育供给体系完善。", url: "http://www.moe.gov.cn" },
      { policyName: "国家教育数字化战略行动", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2025-03-01", note: "AI进入中小学课堂加速推进", confidence: "★★★", rationale: "breadth=8: 覆盖全国2.9亿在校学生。depth=8: 教育模式根本性变革。", url: "http://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/s5987/202503/t20250301_1180234.html" },

      { policyName: "新增普通高中学位超60万个", breadth: 8, depth: 7, direction: 1, status: "已发布", date: "2026-06-15", note: "两重建设推动教育资源扩容", confidence: "★★★", rationale: "breadth=8: 影响全国初中毕业生家庭。depth=7: 学位供给结构性改善。", url: "https://www.moe.gov.cn/" },
      { policyName: "AI教育试点加速推广", breadth: 7, depth: 8, direction: 1, status: "进行中", date: "2026-07-17", note: "世界人工智能大会教育论坛", confidence: "★★☆", rationale: "breadth=7: 全国中小学生。depth=8: AI重塑教育模式。", url: "https://www.moe.gov.cn/" },
    ],
    regionalPolicies: {
      yangtze_delta: [
        { policyName: "虹口区‘AI教育试验区’三年行动规划", breadth: 5, depth: 8, direction: 1, status: "已结束", date: "2025-01-01", note: "AI进入中小学是确定性趋势", confidence: "★★☆", rationale: "breadth=5: 目前仅影响虹口区，但将向全市推广。depth=8: AI教育将重塑课程体系。", url: "https://edu.sh.gov.cn" },
        { policyName: "闵行区教育‘十五五’规划", breadth: 5, depth: 7, direction: 1, status: "已结束", date: "2026-05-09", note: "关注学区划分变化", confidence: "★★☆", rationale: "breadth=5: 仅影响闵行区家长。depth=7: 五年规划决定资源配置方向。", url: "https://www.shmh.gov.cn/xwfb/gsgg/" },
        { policyName: "上海中考改革方案", breadth: 6, depth: 7, direction: 1, status: "已结束", date: "2025-06-01", note: "名额分配到校比例扩大", confidence: "★★☆", rationale: "breadth=6: 上海所有初中生家庭。depth=7: 招生制度结构性调整。", url: "https://edu.sh.gov.cn/zxxx/20250601/1.html" },
        { policyName: "杭州基础教育优质均衡创建", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-09-01", note: "名校集团化+新建学校50所+师资轮岗", confidence: "★★☆", rationale: "breadth=5: 杭州中小学生家庭。depth=7: 教育均衡化推进。", url: "https://edu.hangzhou.gov.cn" },
        { policyName: "苏州职业教育产教融合试点", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2026-03-01", note: "校企双元制+产业学院+学徒制", confidence: "★★☆", rationale: "breadth=5: 苏州职业院校学生。depth=6: 职教产教融合深化。", url: "https://www.suzhou.gov.cn" },
      ],
      jingjinji: [
        { policyName: "北京多校划片政策深化", breadth: 6, depth: 7, direction: 0, status: "已发布", date: "2026-05-01", note: "学区房价值面临重估", confidence: "★★☆", rationale: "breadth=6: 北京学生家长群体。depth=7: 多校划片将根本改变学区格局。", url: "https://edu.beijing.gov.cn" },
        { policyName: "京津冀教育协同共享", breadth: 6, depth: 6, direction: 1, status: "进行中", date: "2026-06-15", note: "跨区域名校合作办学", confidence: "★★☆", rationale: "breadth=6: 京津冀三地学生家庭。depth=6: 教育资源跨区域流动。", url: "https://www.moe.gov.cn/" },
        { policyName: "天津海河教育园区产教融合升级", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-10-01", note: "园区高校+企业联合培养+实习就业一体化", confidence: "★★☆", rationale: "breadth=5: 天津职业院校学生。depth=6: 产教融合深化。", url: "https://www.tj.gov.cn" },
        { policyName: "河北雄安新区教育高质量发展规划", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-06-01", note: "北京名校雄安校区+智慧教育先行区", confidence: "★★☆", rationale: "breadth=5: 雄安新区学生家庭。depth=7: 教育高起点规划。", url: "https://www.xiongan.gov.cn" },
      ],
      greater_bay: [
        { policyName: "深圳基础教育扩优提质工程", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-09-01", note: "新增公办学位超30万+名校集团化", confidence: "★★★", rationale: "breadth=6: 深圳中小学生家庭。depth=7: 基础教育供给体系性提升。", url: "https://szeb.sz.gov.cn" },
        { policyName: "横琴粤澳合作区教育配套建设", breadth: 4, depth: 6, direction: 1, status: "已发布", date: "2025-06-01", note: "澳门子弟学校+国际学校引进", confidence: "★★☆", rationale: "breadth=4: 横琴澳门居民子女。depth=6: 跨境教育配套完善。", url: "https://www.hengqin.gov.cn" },
        { policyName: "广州南沙港澳子弟学校及DSE课程推广", breadth: 4, depth: 6, direction: 1, status: "已发布", date: "2025-10-01", note: "港澳子弟在内地享受本地教育待遇", confidence: "★★☆", rationale: "breadth=4: 南沙港澳子弟家庭。depth=6: 教育互联互通。", url: "https://www.nansha.gov.cn" },
        { policyName: "深圳AI教育先行示范区建设", breadth: 5, depth: 8, direction: 1, status: "进行中", date: "2026-03-01", note: "中小学AI课程全覆盖+智慧校园", confidence: "★★☆", rationale: "breadth=5: 深圳中小学生。depth=8: AI教育先行示范。", url: "https://szeb.sz.gov.cn" },
        { policyName: "东莞随迁子女教育同权化改革", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2026-01-01", note: "积分入学门槛降低+公办学位扩容", confidence: "★★☆", rationale: "breadth=5: 东莞随迁子女家庭。depth=7: 教育公平化推进。", url: "https://www.dg.gov.cn" },
        { policyName: "佛山职业教育产教融合试点", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-11-01", note: "校企双元制+产业学院建设", confidence: "★★☆", rationale: "breadth=5: 佛山职业院校学生。depth=7: 职教产教融合深化。", url: "https://www.foshan.gov.cn" },
      ],
      chengyu: [
        { policyName: "成都‘蓉城教育’优质均衡行动计划", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-05-01", note: "新建改扩建学校200所+名师工作室", confidence: "★★☆", rationale: "breadth=6: 成都中小学生家庭。depth=7: 教育优质均衡体系化。", url: "https://www.chengdu.gov.cn" },
        { policyName: "重庆基础教育集团化办学改革", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-09-01", note: "名校+弱校集团化办学全覆盖", confidence: "★★☆", rationale: "breadth=6: 重庆中小学生家庭。depth=7: 教育资源均衡化配置。", url: "https://www.cq.gov.cn" },
        { policyName: "成渝双城教育协同发展联盟", breadth: 5, depth: 6, direction: 1, status: "进行中", date: "2026-04-01", note: "成渝名校结对+教师交流+课程共享", confidence: "★★☆", rationale: "breadth=5: 成渝两地学校及师生。depth=6: 教育资源跨城共享。", url: "https://www.chengdu.gov.cn" },
        { policyName: "成都职业教育产教融合示范区", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2026-02-01", note: "电子信息/装备制造产教融合", confidence: "★★☆", rationale: "breadth=5: 成都职业院校学生。depth=7: 职教与产业深度对接。", url: "https://www.chengdu.gov.cn" },
        { policyName: "重庆智慧教育平台建设", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2026-01-01", note: "AI+教育数字化全覆盖", confidence: "★★☆", rationale: "breadth=5: 重庆全市师生。depth=7: 教育数字化转型。", url: "https://www.cq.gov.cn" },
      ],
      central: [
        { policyName: "武汉光谷‘未来学校’建设计划", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-06-01", note: "AI+STEAM教育融合+智慧校园", confidence: "★★☆", rationale: "breadth=5: 光谷片区学生家庭。depth=7: 未来教育模式探索。", url: "https://www.wuhan.gov.cn" },
        { policyName: "长沙基础教育优质均衡发展", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-04-01", note: "名校集团化+新建学校+师资均衡配置", confidence: "★★★", rationale: "breadth=6: 长沙中小学生家庭。depth=7: 教育均衡化系统性推进。", url: "https://www.changsha.gov.cn" },
        { policyName: "郑州航空港区教育配套提升工程", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-10-01", note: "新建学校+引进名校+师资培训", confidence: "★★☆", rationale: "breadth=5: 航空港区居民子女。depth=6: 教育配套完善。", url: "https://www.zhengzhou.gov.cn" },
        { policyName: "合肥科创教育特色学校建设", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2026-02-01", note: "科创特色中小学+少年科学院", confidence: "★★☆", rationale: "breadth=5: 合肥中小学生。depth=7: 科创教育体系化。", url: "https://www.hefei.gov.cn" },
        { policyName: "江西VR+教育融合应用试点", breadth: 4, depth: 7, direction: 1, status: "已发布", date: "2025-11-01", note: "VR沉浸式教学+数字孪生实验室", confidence: "★★☆", rationale: "breadth=4: 江西试点学校学生。depth=7: VR教育应用创新。", url: "https://www.jiangxi.gov.cn" },
      ],
    },
    timeline: [
      { year: 1986, event: "义务教育法颁布", dir: 1, note: "确立九年义务教育制度，全民教育起点" },
      { year: 2001, event: "基础教育课程改革", dir: 1, note: "新课标启动，素质教育理念全面推进" },
      { year: 2006, event: "义务教育经费保障", dir: 1, note: "农村义务教育免学杂费，教育公平里程碑" },
      { year: 2013, event: "异地高考破冰", dir: 1, note: "部分省份允许随迁子女就地高考" },
      { year: 2014, event: "新高考改革启动", dir: 1, note: "上海/浙江率先试点3+3模式" },
      { year: 2018, event: "民办教育分类管理", dir: 0, note: "民办学校面临营利/非营利选择" },
      { year: 2021, event: "双减政策", dir: 1, note: "教培行业巨变，校外培训全面规范" },
      { year: 2023, event: "科学教育加法", dir: 1, note: "中小学科学教育强化，实验课程增多" },
      { year: 2025, event: "AI教育试点", dir: 1, note: "AI进入中小学课堂，虹口区率先试点" },
      { year: 2026, event: "常住地教育同权", dir: 1, note: "随迁子女受教育门槛大幅降低" },
    ],
  },
  {
    key: "elderly", icon: "👴", name: "养老 / 医疗",
    subtitle: "养老金 · 医保 · 延迟退休 · 长期护理", color: "#e74c3c",
    summary: "延迟退休正式实施（男60→63、女55→58/50→55），15年渐进过渡。生育补贴政策落地，育儿补贴每年3600元。医疗保障法二审，托育服务法进入立法程序。",
    analysis: "养老与生育是当前最紧迫的政策交汇点。延迟退休已于2025年1月正式实施，影响数亿在职人员：70后影响最小（延迟3-12个月），80后延迟1-2年，90后延迟2-3年。弹性退休机制允许提前3年退休（不低于原法定年龄）。生育补贴制度从2025年起发放，每孩每年3600元至3岁，预计覆盖约1000万家庭。量化影响：延迟退休可使养老金替代率下降约3-5个百分点，但个人账户积累期延长可部分抵消。风险提示：托育服务法仍在预备阶段，短期内托育资源短缺问题难以缓解。",
    scores: [
      { policyName: "新型农村社会养老保险全覆盖", breadth: 9, depth: 9, direction: 1, status: "已发布", date: "2010-10-01", note: "农村居民首次纳入养老保险体系，覆盖超1亿人", confidence: "★★★", rationale: "breadth=9: 影响全国农村居民。depth=9: 养老保障制度历史性突破。", url: "https://www.mohrss.gov.cn" },
      { policyName: "城镇居民社会养老保险试点", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2011-07-01", note: "城镇非就业居民纳入养老保障", confidence: "★★★", rationale: "breadth=8: 影响城镇非就业居民。depth=8: 养老保障制度全覆盖关键一步。", url: "https://www.mohrss.gov.cn" },
      { policyName: "企业退休人员养老金八连调", breadth: 9, depth: 6, direction: 1, status: "已结束", date: "2012-01-01", note: "企业退休人员基本养老金上调10%", confidence: "★★★", rationale: "breadth=9: 影响全国企业退休人员。depth=6: 年度调整机制。", url: "https://www.mohrss.gov.cn" },
      { policyName: "养老服务业发展若干意见", breadth: 7, depth: 7, direction: 1, status: "已发布", date: "2013-09-01", note: "鼓励社会资本办养老+居家养老为基础", confidence: "★★★", rationale: "breadth=7: 影响老年人口及养老产业。depth=7: 养老服务体系顶层设计。", url: "https://www.gov.cn" },
      { policyName: "城乡居民养老保险制度合并", breadth: 9, depth: 9, direction: 1, status: "已发布", date: "2014-02-01", note: "新农保与城居保合并为城乡居民养老保险", confidence: "★★★", rationale: "breadth=9: 影响全国城乡居民。depth=9: 养老制度统一性改革。", url: "https://www.gov.cn" },
      { policyName: "机关事业单位养老保险并轨", breadth: 9, depth: 9, direction: 1, status: "已发布", date: "2015-01-01", note: "结束养老金双轨制，机关事业单位与企业统一制度", confidence: "★★★", rationale: "breadth=9: 影响4000万机关事业单位人员。depth=9: 养老制度公平性里程碑。", url: "https://www.gov.cn" },
      { policyName: "长期护理保险试点启动", breadth: 6, depth: 8, direction: 1, status: "已发布", date: "2016-06-01", note: "上海等15城试点，失能老人护理费用报销", confidence: "★★★", rationale: "breadth=6: 试点城市失能老人。depth=8: 第六险制度创新。", url: "https://www.nhsa.gov.cn" },
      { policyName: "划转国有资本充实社保基金", breadth: 8, depth: 9, direction: 1, status: "已发布", date: "2017-11-01", note: "国企股权划转10%充实社保，增强基金可持续性", confidence: "★★★", rationale: "breadth=8: 影响全体参保人。depth=9: 社保基金可持续性制度保障。", url: "https://www.gov.cn" },
      { policyName: "养老金中央调剂制度", breadth: 9, depth: 8, direction: 1, status: "已发布", date: "2018-07-01", note: "缓解省际养老金收支不平衡", confidence: "★★★", rationale: "breadth=9: 影响全国退休人员。depth=8: 养老金全国统筹关键一步。", url: "https://www.mohrss.gov.cn" },
      { policyName: "社保降费减负综合方案", breadth: 9, depth: 7, direction: 1, status: "已发布", date: "2019-05-01", note: "养老保险单位缴费比例降至16%，企业减负超3000亿", confidence: "★★★", rationale: "breadth=9: 影响所有参保企业。depth=7: 降费减负制度化。", url: "https://www.gov.cn" },
      { policyName: "养老金十六连调（2020年上调5%）", breadth: 9, depth: 6, direction: 1, status: "已结束", date: "2020-04-01", note: "企退人员月均增加140元", confidence: "★★★", rationale: "breadth=9: 影响1.2亿退休人员。depth=6: 年度调整机制。", url: "https://www.mohrss.gov.cn" },
      { policyName: "三孩生育政策及配套支持措施", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2021-07-01", note: "取消社会抚养费+托育+教育减负", confidence: "★★★", rationale: "breadth=8: 影响全国育龄家庭。depth=8: 生育政策根本性调整。", url: "https://www.gov.cn/zhengce/2021-07/20/content_5626190.htm" },
      { policyName: "个人养老金制度启动实施", breadth: 8, depth: 9, direction: 1, status: "已发布", date: "2022-11-01", note: "第三支柱养老正式启动，年上限12000元", confidence: "★★★", rationale: "breadth=8: 影响所有基本养老保险参保人。depth=9: 养老体系结构性变革。", url: "https://www.gov.cn/zhengce/content/2022-11/25/content_5728873.htm" },
      { policyName: "企业职工基本养老保险全国统筹", breadth: 9, depth: 9, direction: 1, status: "已发布", date: "2022-01-01", note: "解决省际基金收支不平衡", confidence: "★★★", rationale: "breadth=9: 影响全国4亿职工养老保险参保人。depth=9: 养老保险制度统一性改革。", url: "https://www.mohrss.gov.cn" },
      { policyName: "养老金十九连调+个人养老金扩面", breadth: 9, depth: 7, direction: 1, status: "已发布", date: "2023-05-01", note: "退休人员基本养老金上调3.8%，个人养老金试点城市扩至36个", confidence: "★★★", rationale: "breadth=9: 影响1.3亿退休人员+个人养老金参与者。depth=7: 年度调整+制度扩面。", url: "https://www.mohrss.gov.cn" },
      { policyName: "渐进式延迟退休决定（全国人大常委会）", breadth: 10, depth: 10, direction: -1, status: "已发布", date: "2024-09-13", note: "男60→63、女55→58/50→55，15年渐进过渡", confidence: "★★★", rationale: "breadth=10: 影响全国数亿在职人员。depth=10: 根本性改变劳动与退休制度。", url: "https://www.npc.gov.cn/npc/c2/c30834/202409/t20240913_340956.html" },
      { policyName: "渐进式延迟法定退休年龄方案", breadth: 10, depth: 10, direction: -1, status: "已发布", date: "2025-01-01", note: "男60→63、女55→58/50→55，15年渐进过渡", confidence: "★★★", rationale: "breadth=10: 影响全国数亿在职人员。depth=10: 根本性改变劳动与退休制度。direction=-1: 短期对劳动者退休规划产生压力。", url: "https://www.npc.gov.cn/npc/c2/c30834/202409/t20240913_340956.html" },
      { policyName: "生育补贴制度（2025年起发放）", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2025-01-01", note: "每孩每年3600元至3岁，预计覆盖千万家庭", confidence: "★★★", rationale: "breadth=8: 约1000万新生儿家庭。depth=8: 首次全国性现金生育激励。", url: "https://www.gov.cn/zhengce/content/202501/content_6998765.htm" },
      { policyName: "托育服务法草案", breadth: 8, depth: 8, direction: 1, status: "预备审议", date: "2026-05-01", note: "0-3岁托育服务体系建设法治化", confidence: "★☆☆", rationale: "breadth=8: 全国约3000万0-3岁婴幼儿家庭。depth=8: 填补托育领域法律空白。", url: "http://www.npc.gov.cn/npc/c2/c30834/202605/" },
      { policyName: "生育保险扩面+产假延长", breadth: 7, depth: 7, direction: 1, status: "已发布", date: "2025-06-01", note: "灵活就业纳入生育保险，产假延至158天+", confidence: "★★★", rationale: "breadth=7: 灵活就业女性群体。depth=7: 生育保障覆盖面扩大。", url: "https://www.nhc.gov.cn/" },
      { policyName: "医疗保障法草案（二次审议稿）", breadth: 9, depth: 9, direction: 1, status: "已结束", date: "2026-04-30", note: "医保基金规范化", confidence: "★★☆", rationale: "breadth=9: 影响全部13.6亿医保参保人。depth=9: 首部医保领域专门法律。", url: "https://www.moj.gov.cn/pub/sfbgw/lfyjzj/" },
      { policyName: "超龄劳动者基本权益保障", breadth: 7, depth: 9, direction: 1, status: "已结束", date: "2025-07-31", note: "延迟退休配套", confidence: "★★☆", rationale: "breadth=7: 直接影响退休后再就业群体。depth=9: 为延迟退休提供法律保障框架。", url: "https://www.mohrss.gov.cn/SYrlzyhshbzb/zwgk/szrs/gkml/202507/t20250731_532567.html" },
      { policyName: "常住地基本公共服务（老人随迁）", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2026-01-01", note: "随迁老人可就地就医养老", confidence: "★★★", rationale: "breadth=8: 影响所有随迁老人家庭。depth=8: 打破养老服务的户籍壁垒。", url: "https://www.gov.cn/zhengce/content/202601/content_7003456.htm" },

      { policyName: "基本医保参保人数达13.19亿", breadth: 10, depth: 7, direction: 1, status: "已发布", date: "2026-07-14", note: "参保率稳定在95%，基金收入增长8.49%", confidence: "★★★", rationale: "breadth=10: 覆盖全民。depth=7: 医保基金可持续性。", url: "https://www.nhsa.gov.cn/" },
    ],
    regionalPolicies: {
      yangtze_delta: [
        { policyName: "上海长期护理保险试点扩面", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-01-01", note: "覆盖更多居家老人", confidence: "★★★", rationale: "breadth=6: 上海失能老人及家庭。depth=7: 长期护理保险制度完善。", url: "https://ybj.sh.gov.cn" },
        { policyName: "长三角异地就医直接结算扩面", breadth: 7, depth: 7, direction: 1, status: "已结束", date: "2025-06-01", note: "门诊+住院均可跨省直接结算", confidence: "★★☆", rationale: "breadth=7: 长三角跨省就医群体。depth=7: 消除异地就医报销障碍。", url: "https://www.nhsa.gov.cn" },
        { policyName: "杭州智慧养老服务体系建设", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-09-01", note: "智慧养老+居家监测+社区嵌入式养老", confidence: "★★☆", rationale: "breadth=5: 杭州老年人口。depth=7: 养老服务数字化转型。", url: "https://www.hangzhou.gov.cn" },
        { policyName: "南京医养结合示范城市建设", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2026-02-01", note: "医疗机构+养老机构融合发展", confidence: "★★☆", rationale: "breadth=5: 南京老年人口。depth=7: 医养结合模式创新。", url: "https://www.nanjing.gov.cn" },
        { policyName: "苏州长期护理保险全覆盖", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-12-01", note: "失能老人护理费用报销70%+", confidence: "★★☆", rationale: "breadth=5: 苏州失能老人及家庭。depth=7: 长护险制度成熟。", url: "https://www.suzhou.gov.cn" },
      ],
      jingjinji: [
        { policyName: "北京居家养老服务体系升级", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2026-04-01", note: "居家养老补贴+社区助餐", confidence: "★★☆", rationale: "breadth=6: 北京老年人口超400万。depth=7: 居家养老服务体系化建设。", url: "https://mzj.beijing.gov.cn" },
        { policyName: "京津冀异地就医门诊直接结算", breadth: 7, depth: 7, direction: 1, status: "进行中", date: "2026-06-01", note: "三地医疗资源互通", confidence: "★★☆", rationale: "breadth=7: 京津冀跨省就医群体。depth=7: 打破异地就医壁垒。", url: "https://ybj.beijing.gov.cn" },
        { policyName: "天津社区嵌入式养老服务网络", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-10-01", note: "社区助餐+日间照料+上门服务全覆盖", confidence: "★★☆", rationale: "breadth=5: 天津老年人口。depth=6: 居家养老服务网络化。", url: "https://www.tj.gov.cn" },
        { policyName: "河北环京养老产业带建设", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-08-01", note: "廊坊/保定/承德养老基地+北京老人外迁养老", confidence: "★★☆", rationale: "breadth=5: 环京养老群体。depth=7: 京津冀养老协同。", url: "https://www.hebei.gov.cn" },
      ],
      greater_bay: [
        { policyName: "港澳居民大湾区社保医保同等待遇", breadth: 6, depth: 8, direction: 1, status: "已发布", date: "2025-06-01", note: "港澳居民可参加大湾区内地城市社保医保", confidence: "★★★", rationale: "breadth=6: 大湾区内地城市就业居住港澳居民。depth=8: 跨境社保制度突破。", url: "https://www.gd.gov.cn" },
        { policyName: "深圳养老服务体系建设（社区嵌入式养老）", breadth: 6, depth: 7, direction: 1, status: "进行中", date: "2026-01-01", note: "社区嵌入式养老服务机构全覆盖", confidence: "★★☆", rationale: "breadth=6: 深圳老年人口。depth=7: 养老服务体系化建设。", url: "https://www.sz.gov.cn" },
        { policyName: "横琴粤澳合作区医疗资源共享", breadth: 4, depth: 7, direction: 1, status: "已发布", date: "2025-09-01", note: "澳门居民横琴就医直接结算", confidence: "★★☆", rationale: "breadth=4: 横琴居住澳门居民。depth=7: 跨境医疗制度衔接。", url: "https://www.hengqin.gov.cn" },
        { policyName: "广州南沙港澳居民医疗保障便利化", breadth: 4, depth: 6, direction: 1, status: "已发布", date: "2025-10-01", note: "港澳居民南沙就医报销便利化", confidence: "★★☆", rationale: "breadth=4: 南沙居住港澳居民。depth=6: 医疗保障互联互通。", url: "https://www.nansha.gov.cn" },
        { policyName: "广东省长护险试点扩面至全省", breadth: 7, depth: 8, direction: 1, status: "进行中", date: "2026-04-01", note: "失能老人护理报销覆盖全省", confidence: "★★☆", rationale: "breadth=7: 广东失能老人及家庭。depth=8: 长护险制度全省覆盖。", url: "https://www.gd.gov.cn" },
        { policyName: "东莞社区居家养老服务网络建设", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2026-02-01", note: "社区助餐+日间照料+上门服务", confidence: "★★☆", rationale: "breadth=5: 东莞老年人口。depth=6: 居家养老服务网络化。", url: "https://www.dg.gov.cn" },
      ],
      chengyu: [
        { policyName: "成都长期护理保险全覆盖", breadth: 6, depth: 8, direction: 1, status: "已发布", date: "2025-06-01", note: "失能老人护理费用报销70%+", confidence: "★★★", rationale: "breadth=6: 成都失能老人及家庭。depth=8: 长护险制度成熟。", url: "https://www.chengdu.gov.cn" },
        { policyName: "重庆智慧养老服务平台建设", breadth: 6, depth: 7, direction: 1, status: "进行中", date: "2026-03-01", note: "智慧养老+居家监测+紧急呼叫", confidence: "★★☆", rationale: "breadth=6: 重庆老年人口。depth=7: 养老服务数字化转型。", url: "https://www.cq.gov.cn" },
        { policyName: "川渝异地就医直接结算全覆盖", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-12-01", note: "成渝门诊住院跨省直接结算", confidence: "★★★", rationale: "breadth=6: 成渝跨省就医群体。depth=7: 异地就医壁垒消除。", url: "https://www.mohrss.gov.cn" },
        { policyName: "成都社区嵌入式养老服务机构建设", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2026-01-01", note: "社区养老综合体+日间照料中心", confidence: "★★☆", rationale: "breadth=5: 成都社区老年人。depth=7: 养老服务体系化。", url: "https://www.chengdu.gov.cn" },
        { policyName: "重庆养老服务人才培养计划", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-09-01", note: "养老护理员培训+薪酬补贴", confidence: "★★☆", rationale: "breadth=5: 养老服务从业人员。depth=6: 养老人才队伍建设。", url: "https://www.cq.gov.cn" },
      ],
      central: [
        { policyName: "武汉社区居家养老服务全覆盖", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-06-01", note: "社区养老服务中心+助餐+日间照料", confidence: "★★☆", rationale: "breadth=6: 武汉老年人口。depth=7: 居家养老服务体系化。", url: "https://www.wuhan.gov.cn" },
        { policyName: "长沙医养结合示范城市建设", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-05-01", note: "医疗机构+养老机构融合发展", confidence: "★★☆", rationale: "breadth=5: 长沙老年人口。depth=7: 医养结合模式创新。", url: "https://www.changsha.gov.cn" },
        { policyName: "郑州养老服务体系建设提速", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-10-01", note: "社区养老设施全覆盖+智慧养老", confidence: "★★☆", rationale: "breadth=5: 郑州老年人口。depth=6: 养老服务网络完善。", url: "https://www.zhengzhou.gov.cn" },
        { policyName: "合肥科创+养老智慧化应用", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2026-02-01", note: "AI健康监测+智慧养老平台", confidence: "★★☆", rationale: "breadth=5: 合肥老年人口。depth=7: 科技赋能养老服务。", url: "https://www.hefei.gov.cn" },
        { policyName: "山西能源企业退休人员社会化管理", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-08-01", note: "国企退休人员社区化管理+养老保障", confidence: "★★☆", rationale: "breadth=5: 山西能源企业退休人员。depth=6: 退休保障社会化。", url: "https://www.shanxi.gov.cn" },
      ],
    },
    timeline: [
      { year: 1997, event: "统一养老保险制度", dir: 1, note: "国发[1997]26号：统账结合模式确立" },
      { year: 2003, event: "新农合试点", dir: 1, note: "农村居民首次获得基本医疗保障" },
      { year: 2005, event: "养老金计发改革", dir: 1, note: "多缴多得长缴多得机制确立" },
      { year: 2009, event: "新农保试点", dir: 1, note: "农村居民首次纳入养老保险体系" },
      { year: 2014, event: "城乡养老并轨", dir: 1, note: "新农保与城居保合并为城乡居民养老保险" },
      { year: 2016, event: "长期护理保险试点", dir: 1, note: "上海等15城率先试点" },
      { year: 2018, event: "养老金中央调剂", dir: 1, note: "缓解省际养老金收支不平衡" },
      { year: 2021, event: "三孩政策+养老焦虑", dir: 0, note: "生育政策调整但养老压力持续增大" },
      { year: 2022, event: "个人养老金制度", dir: 1, note: "第三支柱养老正式启动" },
      { year: 2024, event: "延迟退休决定", dir: -1, note: "渐进式延迟退休正式立法" },
      { year: 2026, event: "医疗保障法二审", dir: 1, note: "首部医保专门法律即将出台" },
    ],
  },
  {
    key: "finance", icon: "💰", name: "消费 / 理财",
    subtitle: "存款利率 · 股市 · 个税 · 消费安全", color: "#f1c40f",
    summary: "金融法首次立法，银证保统一规范。大额存单管理新规压缩存款利率上限。LPR改革深化，房贷利率仍有下行空间。个税征管精准度提升。",
    analysis: "金融法是中国金融领域第一部综合性基础法律，将统一规范银行、证券、保险三大行业。量化影响：LPR已连续下调，2024年房贷利率较2021年高点下降约200个基点，300万30年贷款月供减少约3,500元。大额存单管理办法可能进一步压缩存款利率上限，无风险收益持续下行。税收征管法修订加强了对高净值人群的监管，CRS信息交换网络已覆盖100+国家。风险提示：利率下行周期中，理财产品收益率普遍下降，投资者应警惕「高收益」产品的风险。",
    scores: [
      { policyName: "融资融券业务试点扩大", breadth: 7, depth: 7, direction: 1, status: "已发布", date: "2010-03-01", note: "资本市场做空机制建立，交易制度完善", confidence: "★★★", rationale: "breadth=7: 影响股民及机构投资者。depth=7: 资本市场制度完善。", url: "https://www.csrc.gov.cn" },
      { policyName: "个人所得税法修订（起征点3500）", breadth: 9, depth: 7, direction: 1, status: "已发布", date: "2011-09-01", note: "起征点从2000提高至3500，减税惠及6000万人", confidence: "★★★", rationale: "breadth=9: 影响所有纳税人。depth=7: 个税减负制度化。", url: "https://www.chinatax.gov.cn" },
      { policyName: "利率市场化改革推进", breadth: 9, depth: 9, direction: 1, status: "已发布", date: "2012-06-01", note: "存贷款利率浮动区间扩大，银行竞争加剧", confidence: "★★★", rationale: "breadth=9: 影响所有储户和贷款人。depth=9: 利率市场化关键步骤。", url: "http://www.pbc.gov.cn" },
      { policyName: "余额宝上线（互联网金融元年）", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2013-06-01", note: "货币基金互联网化，存款利率市场化倒逼", confidence: "★★★", rationale: "breadth=8: 影响数亿用户。depth=8: 互联网金融开启利率市场化加速。", url: "http://www.pbc.gov.cn" },
      { policyName: "沪港通开通（资本市场互联互通）", breadth: 7, depth: 8, direction: 1, status: "已发布", date: "2014-11-01", note: "内地与香港股票市场互联互通，投资者跨境投资便利化", confidence: "★★★", rationale: "breadth=7: 影响两地投资者。depth=8: 资本市场开放里程碑。", url: "https://www.csrc.gov.cn" },
      { policyName: "存款保险制度实施", breadth: 9, depth: 8, direction: 1, status: "已发布", date: "2015-05-01", note: "50万以内存款全额保障，金融安全网完善", confidence: "★★★", rationale: "breadth=9: 影响所有储户。depth=8: 金融安全制度基石。", url: "http://www.pbc.gov.cn" },
      { policyName: "营改增全面推开", breadth: 9, depth: 8, direction: 1, status: "已发布", date: "2016-05-01", note: "营业税改增值税全覆盖，企业减负超5000亿", confidence: "★★★", rationale: "breadth=9: 影响所有纳税人。depth=8: 税制结构性改革。", url: "https://www.chinatax.gov.cn" },
      { policyName: "资管新规征求意见", breadth: 8, depth: 9, direction: -1, status: "已发布", date: "2017-11-01", note: "打破刚兑+去通道+净值化，理财市场重塑", confidence: "★★★", rationale: "breadth=8: 影响所有理财投资者。depth=9: 资管行业根本性变革。direction=-1: 短期阵痛。", url: "http://www.pbc.gov.cn" },
      { policyName: "个人所得税法修订（综合与分类结合）", breadth: 10, depth: 9, direction: 1, status: "已发布", date: "2018-10-01", note: "起征点5000+六项专项附加扣除", confidence: "★★★", rationale: "breadth=10: 影响所有纳税人。depth=9: 个税制度根本性改革。", url: "https://www.chinatax.gov.cn" },
      { policyName: "科创板开板+注册制试点", breadth: 8, depth: 9, direction: 1, status: "已发布", date: "2019-07-01", note: "硬科技企业上市新通道，资本市场改革试验田", confidence: "★★★", rationale: "breadth=8: 影响科创企业及投资者。depth=9: 资本市场制度性突破。", url: "https://www.csrc.gov.cn" },
      { policyName: "数字人民币试点启动", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2020-10-01", note: "深圳/苏州/成都等城市率先试点", confidence: "★★★", rationale: "breadth=8: 影响试点城市数千万居民。depth=8: 货币体系数字化转型。", url: "http://www.pbc.gov.cn" },
      { policyName: "资管新规过渡期结束", breadth: 8, depth: 8, direction: 0, status: "已结束", date: "2021-12-31", note: "打破刚兑，理财全面净值化", confidence: "★★★", rationale: "breadth=8: 影响所有银行理财投资者。depth=8: 资管行业根本性变革。", url: "https://www.pbc.gov.cn" },
      { policyName: "存款利率市场化调整机制建立", breadth: 9, depth: 8, direction: -1, status: "已发布", date: "2022-04-01", note: "存款利率自律上限优化，无风险收益持续下行", confidence: "★★★", rationale: "breadth=9: 影响所有储户。depth=8: 利率市场化关键一步。direction=-1: 存款收益下降。", url: "http://www.pbc.gov.cn" },
      { policyName: "LPR连续下调+存量房贷利率调整", breadth: 9, depth: 8, direction: 1, status: "已发布", date: "2023-09-01", note: "房贷利率进入‘3时代’，月供减少数千元", confidence: "★★★", rationale: "breadth=9: 影响所有房贷借款人。depth=8: 利率市场化深化。", url: "http://www.pbc.gov.cn" },
      { policyName: "新国九条+退市新规", breadth: 8, depth: 9, direction: 1, status: "已发布", date: "2024-04-01", note: "资本市场基础制度改革，强化投资者保护", confidence: "★★★", rationale: "breadth=8: 影响2亿股民。depth=9: 资本市场制度性变革。", url: "https://www.csrc.gov.cn" },
      { policyName: "金融法（草案首次审议）", breadth: 10, depth: 10, direction: 1, status: "进行中", date: "2026-06-26", note: "金融领域基础性立法", confidence: "★☆☆", rationale: "breadth=10: 影响所有银行、证券、保险从业者和全部理财用户。depth=10: 建立全新金融监管法律框架。", url: "https://www.moj.gov.cn/pub/sfbgw/lfyjzj/lflfyjzj/202603/t20260320_532981.html" },
      { policyName: "大额存单管理办法", breadth: 7, depth: 6, direction: -1, status: "进行中", date: "2026-06-12", note: "无风险收益下降", confidence: "★☆☆", rationale: "breadth=7: 影响所有大额储户。depth=6: 管理办法调整。direction=-1: 利率可能下调。", url: "http://www.pbc.gov.cn/goutongjiaoliu/113456/113469/" },
      { policyName: "人民币存贷款利率管理规定", breadth: 8, depth: 8, direction: 0, status: "已结束", date: "2026-06-05", note: "利率市场化推进", confidence: "★★☆", rationale: "breadth=8: 所有贷款人和存款人。depth=8: 利率市场化是长期结构性变化。", url: "http://www.pbc.gov.cn/zhengcehuobisi/125207/125213/" },
      { policyName: "税收征收管理法修订", breadth: 8, depth: 7, direction: -1, status: "已结束", date: "2025-03-28", note: "高收入群体监管加强", confidence: "★★☆", rationale: "breadth=8: 所有纳税人。depth=7: 征管手段升级。", url: "https://www.chinatax.gov.cn/chinatax/n810219/n810724/common_list_n810774.html" },
      { policyName: "化妆品标准管理办法", breadth: 5, depth: 5, direction: 1, status: "进行中", date: "2026-06-30", note: "消费品安全标准提升", confidence: "★☆☆", rationale: "breadth=5: 主要影响化妆品消费者。", url: "https://www.nmpa.gov.cn" },
      { policyName: "禁止传销条例修订", breadth: 6, depth: 6, direction: 1, status: "已结束", date: "2026-05-29", note: "消费安全环境改善", confidence: "★★☆", rationale: "breadth=6: 保护易受骗群体。", url: "https://www.samr.gov.cn/hd/zjdc/" },

      { policyName: "个人住房贷款利率降至3.1%", breadth: 8, depth: 7, direction: 1, status: "已发布", date: "2026-07-15", note: "购房成本持续降低，同比基本持平", confidence: "★★★", rationale: "breadth=8: 影响所有房贷用户。depth=7: 利率水平直接影响月供和购房决策。", url: "http://www.pbc.gov.cn/" },
      { policyName: "消费品以旧换新资金1875亿元", breadth: 8, depth: 6, direction: 1, status: "已发布", date: "2026-06-28", note: "三批625亿元超长期特别国债支持", confidence: "★★★", rationale: "breadth=8: 覆盖全国消费者。depth=6: 年度性财政刺激。", url: "https://www.ndrc.gov.cn/" },
    ],
    regionalPolicies: {
      yangtze_delta: [
        { policyName: "上海自贸区金融创新试点", breadth: 6, depth: 8, direction: 1, status: "已发布", date: "2025-06-01", note: "跨境金融+数字人民币", confidence: "★★☆", rationale: "breadth=6: 上海自贸区企业和居民。depth=8: 金融开放前沿试验。", url: "https://www.shftz.gov.cn" },
        { policyName: "长三角征信一体化", breadth: 6, depth: 6, direction: 1, status: "已结束", date: "2025-09-01", note: "跨省信用数据共享", confidence: "★★☆", rationale: "breadth=6: 长三角信贷用户。depth=6: 区域金融基础设施整合。", url: "http://www.pbc.gov.cn/shanghai/128243/" },
        { policyName: "杭州数字金融创新试验区建设", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-11-01", note: "数字人民币+智能合约+供应链金融", confidence: "★★☆", rationale: "breadth=5: 杭州金融科技企业及用户。depth=7: 数字金融创新深化。", url: "https://www.hangzhou.gov.cn" },
        { policyName: "南京科创金融改革试验区", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2026-01-01", note: "科创企业专属信贷+股权融资便利化", confidence: "★★☆", rationale: "breadth=5: 南京科创企业。depth=7: 科创金融制度创新。", url: "https://www.nanjing.gov.cn" },
        { policyName: "苏州数字人民币试点深化", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-08-01", note: "数字人民币覆盖政务/交通/消费全场景", confidence: "★★☆", rationale: "breadth=5: 苏州市民。depth=6: 数字货币应用深化。", url: "https://www.suzhou.gov.cn" },
      ],
      jingjinji: [
        { policyName: "北京证券交易所改革深化", breadth: 6, depth: 8, direction: 1, status: "已发布", date: "2026-03-15", note: "创新型中小企业融资渠道拓宽", confidence: "★★☆", rationale: "breadth=6: 北交所上市和拟上市企业。depth=8: 资本市场改革纵深推进。", url: "https://www.bse.cn" },
        { policyName: "京津冀金融协同发展", breadth: 6, depth: 6, direction: 1, status: "进行中", date: "2026-05-01", note: "跨区域金融服务一体化", confidence: "★★☆", rationale: "breadth=6: 京津冀三地企业和居民。depth=6: 区域金融基础设施互联互通。", url: "http://www.pbc.gov.cn/" },
        { policyName: "天津融资租赁产业聚集区建设", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-09-01", note: "东疆保税港区融资租赁+飞机/船舶租赁", confidence: "★★☆", rationale: "breadth=5: 天津融资租赁企业。depth=7: 融资租赁产业聚集。", url: "https://www.tj.gov.cn" },
        { policyName: "河北雄安新区数字金融创新", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2026-02-01", note: "数字人民币+区块链+供应链金融", confidence: "★★☆", rationale: "breadth=5: 雄安金融科技企业。depth=7: 数字金融先行先试。", url: "https://www.xiongan.gov.cn" },
      ],
      greater_bay: [
        { policyName: "跨境理财通2.0升级（大湾区）", breadth: 6, depth: 8, direction: 1, status: "已发布", date: "2025-06-01", note: "个人投资额度提升至300万+产品范围扩大", confidence: "★★★", rationale: "breadth=6: 大湾区居民跨境理财需求。depth=8: 跨境金融制度性突破。", url: "https://www.gd.gov.cn" },
        { policyName: "深圳数字人民币应用场景扩展", breadth: 6, depth: 7, direction: 1, status: "进行中", date: "2026-01-01", note: "数字人民币覆盖公共交通/医疗/教育", confidence: "★★☆", rationale: "breadth=6: 深圳市民。depth=7: 数字货币应用场景深化。", url: "https://www.sz.gov.cn" },
        { policyName: "横琴粤澳合作区跨境金融创新", breadth: 4, depth: 7, direction: 1, status: "已发布", date: "2025-09-01", note: "澳门居民横琴开户/理财/保险便利化", confidence: "★★☆", rationale: "breadth=4: 横琴澳门居民。depth=7: 跨境金融服务创新。", url: "https://www.hengqin.gov.cn" },
        { policyName: "广州南沙跨境贸易投资便利化", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-10-01", note: "跨境资金流动便利+外汇管理改革", confidence: "★★☆", rationale: "breadth=5: 南沙跨境贸易企业。depth=7: 跨境金融便利化。", url: "https://www.nansha.gov.cn" },
        { policyName: "深圳消费金融创新试点", breadth: 6, depth: 6, direction: 1, status: "已发布", date: "2026-03-01", note: "消费信贷便利化+数字消费场景", confidence: "★★☆", rationale: "breadth=6: 深圳消费者。depth=6: 消费金融创新。", url: "https://www.sz.gov.cn" },
        { policyName: "大湾区保险互联互通", breadth: 6, depth: 7, direction: 1, status: "进行中", date: "2026-05-01", note: "港澳居民内地投保便利化+车险互认", confidence: "★★☆", rationale: "breadth=6: 大湾区居民。depth=7: 保险市场互联互通。", url: "https://www.gd.gov.cn" },
      ],
      chengyu: [
        { policyName: "成都数字人民币试点深化", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-06-01", note: "数字人民币覆盖政务/交通/消费全场景", confidence: "★★☆", rationale: "breadth=6: 成都市民。depth=7: 数字货币应用深化。", url: "https://www.chengdu.gov.cn" },
        { policyName: "重庆西部金融中心建设", breadth: 6, depth: 8, direction: 1, status: "进行中", date: "2026-01-01", note: "金融机构集聚+金融产品创新", confidence: "★★☆", rationale: "breadth=6: 重庆市民及企业。depth=8: 金融中心建设战略性。", url: "https://www.cq.gov.cn" },
        { policyName: "成渝跨境贸易结算便利化", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-12-01", note: "中欧班列跨境结算+外汇便利化", confidence: "★★☆", rationale: "breadth=5: 成渝跨境贸易企业。depth=7: 跨境结算便利化。", url: "https://www.cq.gov.cn" },
        { policyName: "成都消费金融创新试点", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2026-02-01", note: "新市民消费信贷+数字消费场景", confidence: "★★☆", rationale: "breadth=5: 成都新市民。depth=6: 消费金融创新。", url: "https://www.chengdu.gov.cn" },
        { policyName: "重庆普惠金融示范区建设", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-09-01", note: "小微企业贷款便利化+农村普惠金融", confidence: "★★☆", rationale: "breadth=5: 重庆小微企业及农村居民。depth=7: 普惠金融体系化。", url: "https://www.cq.gov.cn" },
      ],
      central: [
        { policyName: "武汉区域金融中心建设", breadth: 6, depth: 7, direction: 1, status: "进行中", date: "2026-01-01", note: "金融机构集聚+科技金融创新", confidence: "★★☆", rationale: "breadth=6: 武汉市民及企业。depth=7: 金融中心建设。", url: "https://www.wuhan.gov.cn" },
        { policyName: "长沙消费金融创新试点", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-05-01", note: "新市民消费信贷+数字消费场景", confidence: "★★☆", rationale: "breadth=5: 长沙新市民。depth=6: 消费金融创新。", url: "https://www.changsha.gov.cn" },
        { policyName: "郑州商品交易所品种创新", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-10-01", note: "新增期货品种+期货市场对外开放", confidence: "★★☆", rationale: "breadth=5: 期货市场参与者。depth=7: 期货市场创新发展。", url: "https://www.zhengzhou.gov.cn" },
        { policyName: "合肥科创金融改革试验区", breadth: 5, depth: 8, direction: 1, status: "已发布", date: "2026-02-01", note: "科创企业融资便利化+股权激励", confidence: "★★☆", rationale: "breadth=5: 合肥科创企业。depth=8: 科创金融制度创新。", url: "https://www.hefei.gov.cn" },
        { policyName: "山西能源金融创新试点", breadth: 4, depth: 7, direction: 1, status: "已发布", date: "2025-08-01", note: "能源期货交易+绿色金融产品", confidence: "★★☆", rationale: "breadth=4: 山西能源企业。depth=7: 能源金融创新。", url: "https://www.shanxi.gov.cn" },
      ],
    },
    timeline: [
      { year: 1990, event: "沪深交易所成立", dir: 1, note: "中国资本市场正式起步" },
      { year: 2004, event: "国九条", dir: 1, note: "资本市场改革开放纲领性文件" },
      { year: 2005, event: "股权分置改革", dir: 1, note: "解决历史遗留问题，全流通时代开启" },
      { year: 2009, event: "创业板开板", dir: 1, note: "中小企业直接融资新通道" },
      { year: 2013, event: "余额宝上线+利率市场化", dir: 1, note: "互联网金融爆发，存款利率浮动扩大" },
      { year: 2015, event: "存款利率上限放开", dir: 0, note: "利率市场化里程碑，储户议价权增强" },
      { year: 2018, event: "资管新规", dir: 0, note: "打破刚兑，理财不再保本保收益" },
      { year: 2019, event: "科创板开板+LPR改革", dir: 1, note: "资本市场和利率体系双重改革" },
      { year: 2020, event: "数字人民币试点", dir: 1, note: "深圳/苏州/成都等城市率先试点" },
      { year: 2023, event: "LPR连续下调", dir: 1, note: "房贷利率持续下行，存量利率下调" },
      { year: 2025, event: "新国九条+退市新规", dir: 1, note: "资本市场基础制度改革" },
      { year: 2026, event: "金融法首次立法", dir: 1, note: "银证保统一监管法律框架" },
    ],
  },
  {
    key: "industry", icon: "🏭", name: "行业 / 创业",
    subtitle: "产业扶持 · 营商环境 · 新兴赛道 · 中小企业", color: "#1abc9c",
    summary: "AI监管与数据安全成为行业新规：生成式AI管理办法、算法推荐规定、网络安全法修订全面落地。上海科创政策密度空前：生物医药、孵化器、G60科创走廊2.0。",
    analysis: "行业政策呈现双轮驱动格局：①规范端——生成式AI管理办法要求所有AI服务提供者进行算法备案，影响超500家AI企业和数亿用户；算法推荐规定赋予用户「关闭个性化推荐」权利，互联网平台商业模式面临重构；网络安全法修订将罚款上限提升至5000万元，企业合规成本显著增加。②激励端——上海生物医药外资高能级项目扶持+G60科创走廊2.0+节能减排专项资金形成产业全链条红利。量化影响：AI行业合规成本预计增加15-20%，但长期有利于行业健康发展。风险提示：AI监管可能过度收紧，影响创新速度。",
    scores: [
      { policyName: "战略性新兴产业培育", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2010-10-01", note: "七大战略性新兴产业规划，节能环保/新一代IT/生物/新能源等", confidence: "★★★", rationale: "breadth=8: 影响新兴产业从业者。depth=8: 产业升级顶层设计。", url: "https://www.gov.cn" },
      { policyName: "小微企业税收优惠政策", breadth: 8, depth: 7, direction: 1, status: "已发布", date: "2011-11-01", note: "小微企业减半征收所得税+增值税起征点提高", confidence: "★★★", rationale: "breadth=8: 影响全国小微企业主。depth=7: 营商环境优化。", url: "https://www.chinatax.gov.cn" },
      { policyName: "节能减排“十二五”规划", breadth: 8, depth: 7, direction: -1, status: "已结束", date: "2012-08-01", note: "高耗能行业约束加强，环保成本上升", confidence: "★★★", rationale: "breadth=8: 影响高耗能行业企业。depth=7: 绿色发展制度化。direction=-1: 企业合规成本增加。", url: "https://www.gov.cn" },
      { policyName: "“宽带中国”战略及实施方案", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2013-08-01", note: "光纤到户+4G网络建设，数字经济基础设施", confidence: "★★★", rationale: "breadth=8: 影响全国网民及互联网企业。depth=8: 数字基础设施奠基。", url: "https://www.gov.cn" },
      { policyName: "国家集成电路产业投资基金成立", breadth: 7, depth: 8, direction: 1, status: "已发布", date: "2014-09-01", note: "大基金一期1387亿元，芯片产业国家级投资", confidence: "★★★", rationale: "breadth=7: 影响半导体产业链。depth=8: 芯片自主可控战略起步。", url: "https://www.gov.cn" },
      { policyName: "中国制造2025战略", breadth: 9, depth: 9, direction: 1, status: "已发布", date: "2015-05-01", note: "十大重点领域+智能制造+绿色制造", confidence: "★★★", rationale: "breadth=9: 影响全国制造业。depth=9: 制造业升级顶层战略。", url: "https://www.gov.cn" },
      { policyName: "供给侧结构性改革（去产能）", breadth: 9, depth: 9, direction: -1, status: "已结束", date: "2016-01-01", note: "钢铁煤炭去产能，僵尸企业出清", confidence: "★★★", rationale: "breadth=9: 影响传统行业从业者。depth=9: 产业结构根本性调整。direction=-1: 传统行业阵痛。", url: "https://www.ndrc.gov.cn" },
      { policyName: "环保督察常态化", breadth: 8, depth: 8, direction: -1, status: "已发布", date: "2017-01-01", note: "中央环保督察全覆盖，高污染企业关停整改", confidence: "★★★", rationale: "breadth=8: 影响高污染行业企业。depth=8: 环保执法制度化。direction=-1: 企业合规成本增加。", url: "https://www.gov.cn" },
      { policyName: "个人所得税专项附加扣除暂行办法", breadth: 9, depth: 7, direction: 1, status: "已发布", date: "2018-12-01", note: "子女教育/继续教育/房贷/租房/赡养老人/大病医疗六项扣除", confidence: "★★★", rationale: "breadth=9: 影响所有纳税人。depth=7: 个税减负制度化。", url: "https://www.chinatax.gov.cn" },
      { policyName: "减税降费2万亿综合方案", breadth: 9, depth: 8, direction: 1, status: "已发布", date: "2019-03-01", note: "增值税率降至13%+社保降费+小微企业普惠", confidence: "★★★", rationale: "breadth=9: 影响所有市场主体。depth=8: 营商环境制度性优化。", url: "https://www.chinatax.gov.cn" },
      { policyName: "优化营商环境条例", breadth: 9, depth: 8, direction: 1, status: "已发布", date: "2020-01-01", note: "首部营商环境专项行政法规，市场准入负面清单", confidence: "★★★", rationale: "breadth=9: 影响所有市场主体。depth=8: 营商环境法治化。", url: "https://www.gov.cn" },
      { policyName: "反垄断法修正+平台经济规范", breadth: 9, depth: 9, direction: -1, status: "已发布", date: "2021-02-01", note: "互联网巨头反垄断执法元年", confidence: "★★★", rationale: "breadth=9: 影响所有平台经济参与者。depth=9: 竞争规则根本性重塑。direction=-1: 短期压制平台企业扩张。", url: "https://www.samr.gov.cn" },
      { policyName: "专精特新‘小巨人’培育计划", breadth: 7, depth: 8, direction: 1, status: "已发布", date: "2021-07-01", note: "中小企业专业化道路获政策支持", confidence: "★★★", rationale: "breadth=7: 全国中小企业。depth=8: 制造业升级微观基础。", url: "https://www.miit.gov.cn" },
      { policyName: "双碳目标‘1+N’政策体系", breadth: 9, depth: 9, direction: 1, status: "已发布", date: "2021-10-01", note: "2030碳达峰2060碳中和路线图", confidence: "★★★", rationale: "breadth=9: 影响所有行业。depth=9: 经济社会发展全面绿色转型。", url: "https://www.gov.cn/zhengce/2021-10/24/content_5644613.htm" },
      { policyName: "政府采购法+招投标法同步修订", breadth: 8, depth: 8, direction: 1, status: "进行中", date: "2026-06-26", note: "更公平竞标环境", confidence: "★☆☆", rationale: "breadth=8: 所有参与政府采购的企业。depth=8: 法律修订具有长期约束力。", url: "http://www.npc.gov.cn/npc/c2/c30834/202606/" },
      { policyName: "生成式人工智能服务管理暂行办法", breadth: 9, depth: 9, direction: 0, status: "已发布", date: "2023-08-15", note: "AI行业规范化基石，所有AI服务提供者须算法备案", confidence: "★★★", rationale: "breadth=9: 影响超500家AI企业和数亿用户。depth=9: AI领域首部专门规范性文件。", url: "https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm" },
      { policyName: "新质生产力发展战略部署", breadth: 9, depth: 9, direction: 1, status: "已发布", date: "2024-03-01", note: "AI/量子/生物科技/新能源成国家战略，各地密集出台产业扶持", confidence: "★★★", rationale: "breadth=9: 影响所有新兴产业从业者。depth=9: 国家产业升级顶层战略。", url: "https://www.gov.cn/zhengce/202403/content_6939781.htm" },
      { policyName: "互联网信息服务算法推荐管理规定", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2022-03-01", note: "用户可关闭个性化推荐，平台透明度提升", confidence: "★★★", rationale: "breadth=8: 数亿互联网用户。depth=8: 重构平台与用户的权利关系。", url: "https://www.cac.gov.cn/2022-01/04/c_1642894606364259.htm" },
      { policyName: "网络安全法修订（罚款上限提至5000万）", breadth: 9, depth: 8, direction: -1, status: "已发布", date: "2025-01-01", note: "企业合规成本增加，数据安全要求升级", confidence: "★★★", rationale: "breadth=9: 所有互联网企业。depth=8: 处罚力度大幅提升。direction=-1: 短期增加企业成本。", url: "https://www.cac.gov.cn/2025-01/01/c_1737502372738654.htm" },
      { policyName: "电子商务法修正+外卖平台规范", breadth: 7, depth: 7, direction: 0, status: "进行中", date: "2026-07-04", note: "规范发展", confidence: "★☆☆", rationale: "breadth=7: 平台经济参与者。direction=0: 对合规者利好，对违规者利空。", url: "http://www.npc.gov.cn/npc/c2/c30834/202607/t20260704_1.html" },
    ],
    regionalPolicies: {
      yangtze_delta: [
        { policyName: "上海生物医药外资高能级项目扶持", breadth: 7, depth: 9, direction: 1, status: "已结束", date: "2026-04-03", note: "生物医药确定性高", confidence: "★★☆", rationale: "breadth=7: 生物医药行业全链条。depth=9: 外资+高能级项目专项扶持是战略性布局。", url: "https://www.shanghai.gov.cn/nw12344/" },
        { policyName: "科技创新券+孵化器+研发机构系列政策", breadth: 7, depth: 8, direction: 1, status: "已结束", date: "2025-06-01", note: "科技创业全链条红利", confidence: "★★☆", rationale: "breadth=7: 覆盖中小科技企业和创业者。depth=8: 全链条政策组合形成系统性支撑。", url: "https://www.stcsm.sh.gov.cn" },
        { policyName: "节能减排降碳专项资金", breadth: 6, depth: 8, direction: 1, status: "已结束", date: "2026-04-15", note: "新能源/双碳赛道", confidence: "★★☆", rationale: "breadth=6: 新能源和环保行业。depth=8: 双碳是20-30年结构性趋势。", url: "https://www.shanghai.gov.cn/nw12344/" },
        { policyName: "长三角G60科创走廊2.0", breadth: 7, depth: 8, direction: 1, status: "已结束", date: "2025-12-01", note: "九城市协同创新", confidence: "★★☆", rationale: "breadth=7: G60沿线9城市科技企业。depth=8: 区域创新协同机制升级。", url: "https://www.g60.org.cn" },
      ],
      jingjinji: [
        { policyName: "北京全球数字经济标杆城市", breadth: 7, depth: 8, direction: 1, status: "已发布", date: "2026-02-01", note: "数据要素市场化+数字产业集群", confidence: "★★☆", rationale: "breadth=7: 北京数字经济产业群。depth=8: 数字经济发展顶层设计。", url: "https://www.beijing.gov.cn" },
        { policyName: "雄安新区高端高新产业集聚", breadth: 6, depth: 8, direction: 1, status: "已发布", date: "2026-01-01", note: "央企总部+科技创新中心", confidence: "★★☆", rationale: "breadth=6: 迁入雄安的央企和科技企业。depth=8: 雄安产业承载能力持续增强。", url: "https://www.xiongan.gov.cn" },
      ],
      greater_bay: [
        { policyName: "深圳前海深港现代服务业合作区扩区", breadth: 6, depth: 8, direction: 1, status: "已发布", date: "2025-06-01", note: "前海合作区面积扨8倍+产业政策升级", confidence: "★★★", rationale: "breadth=6: 前海合作区企业。depth=8: 深港产业融合制度性突破。", url: "https://www.sz.gov.cn" },
        { policyName: "广州南沙新区科技创新产业扶持", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-10-01", note: "科技企业研发补贴+孵化器建设", confidence: "★★☆", rationale: "breadth=5: 南沙科技企业。depth=7: 科创产业扶持体系化。", url: "https://www.nansha.gov.cn" },
        { policyName: "深圳人工智能产业集群培育", breadth: 7, depth: 8, direction: 1, status: "进行中", date: "2026-03-01", note: "AI产业规模突5000亿+算力基础设施", confidence: "★★☆", rationale: "breadth=7: 深圳AI产业链企业。depth=8: AI产业集群战略性布局。", url: "https://www.sz.gov.cn" },
        { policyName: "东莞制造业数字化转型专项", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-11-01", note: "制造业数字化改造补贴+工业互联网", confidence: "★★☆", rationale: "breadth=6: 东莞制造业企业。depth=7: 制造业数字化转型。", url: "https://www.dg.gov.cn" },
        { policyName: "佛山先进制造业产业集群建设", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2026-02-01", note: "智能家电/装备制造产业集群培育", confidence: "★★☆", rationale: "breadth=5: 佛山制造业企业。depth=7: 先进制造业集群化。", url: "https://www.foshan.gov.cn" },
        { policyName: "横琴粤澳合作区科技研发及高端制造", breadth: 4, depth: 7, direction: 1, status: "已发布", date: "2025-09-01", note: "科技研发+高端制造+税收优惠", confidence: "★★☆", rationale: "breadth=4: 横琴科技制造企业。depth=7: 粤澳产业合作深化。", url: "https://www.hengqin.gov.cn" },
      ],
      chengyu: [
        { policyName: "成渝双城经济圈产业协同发展", breadth: 6, depth: 8, direction: 1, status: "进行中", date: "2026-01-01", note: "电子信息/汽车/装备制造产业协同", confidence: "★★★", rationale: "breadth=6: 成渝两地产业链企业。depth=8: 产业协同制度性安排。", url: "https://www.chengdu.gov.cn" },
        { policyName: "成都人工智能产业建圈强链", breadth: 6, depth: 8, direction: 1, status: "已发布", date: "2025-06-01", note: "AI产业规模突2000亿+算力中心", confidence: "★★☆", rationale: "breadth=6: 成都AI产业链企业。depth=8: AI产业战略性布局。", url: "https://www.chengdu.gov.cn" },
        { policyName: "重庆数字经济产业园建设", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-09-01", note: "数字经济企业入驻补贴+税收优惠", confidence: "★★☆", rationale: "breadth=6: 重庆数字经济企业。depth=7: 数字经济产业集聚。", url: "https://www.cq.gov.cn" },
        { policyName: "西部科学城科技创新平台建设", breadth: 5, depth: 8, direction: 1, status: "进行中", date: "2026-03-01", note: "国家实验室+大科学装置+科创平台", confidence: "★★☆", rationale: "breadth=5: 西部科学城科研机构及企业。depth=8: 科创平台战略性布局。", url: "https://www.chengdu.gov.cn" },
        { policyName: "成都营商环境优化‘蓉易办’升级", breadth: 6, depth: 6, direction: 1, status: "已发布", date: "2026-02-01", note: "企业开办1天办结+政务服务数字化", confidence: "★★☆", rationale: "breadth=6: 成都各类企业。depth=6: 营商环境优化。", url: "https://www.chengdu.gov.cn" },
        { policyName: "重庆智能网联汽车产业集群培育", breadth: 5, depth: 8, direction: 1, status: "已发布", date: "2025-10-01", note: "智能网联汽车全产业链培育", confidence: "★★☆", rationale: "breadth=5: 重庆汽车产业链企业。depth=8: 智能网联汽车战略性布局。", url: "https://www.cq.gov.cn" },
      ],
      central: [
        { policyName: "武汉光谷科技创新大走廊建设", breadth: 6, depth: 8, direction: 1, status: "进行中", date: "2026-01-01", note: "光电子信息/生命健康/智能制造产业集群", confidence: "★★★", rationale: "breadth=6: 光谷科创企业。depth=8: 科创大走廊战略性布局。", url: "https://www.wuhan.gov.cn" },
        { policyName: "长沙工程机械及智能制造产业集群", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-05-01", note: "工程机械世界级产业集群培育", confidence: "★★★", rationale: "breadth=6: 长沙工程机械企业。depth=7: 世界级产业集群建设。", url: "https://www.changsha.gov.cn" },
        { policyName: "郑州航空港经济综合实验区产业升级", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-10-01", note: "电子信息/生物医药/航空物流产业", confidence: "★★☆", rationale: "breadth=6: 航空港区企业。depth=7: 产业升级体系化。", url: "https://www.zhengzhou.gov.cn" },
        { policyName: "合肥综合性国家科学中心建设", breadth: 6, depth: 9, direction: 1, status: "进行中", date: "2026-02-01", note: "量子信息/核聚变/深空探测等国家实验室", confidence: "★★★", rationale: "breadth=6: 合肥科研机构及科创企业。depth=9: 国家科学中心战略性布局。", url: "https://www.hefei.gov.cn" },
        { policyName: "南昌VR产业及数字经济集群建设", breadth: 5, depth: 7, direction: 1, status: "已发布", date: "2025-11-01", note: "VR产业规模突1000亿+数字经济企业培育", confidence: "★★☆", rationale: "breadth=5: 南昌VR及数字经济企业。depth=7: VR产业集群化发展。", url: "https://www.nc.gov.cn" },
        { policyName: "太原能源革命综合改革试点", breadth: 5, depth: 8, direction: 1, status: "已发布", date: "2025-08-01", note: "新能源产业培育+传统能源清洁化改造", confidence: "★★☆", rationale: "breadth=5: 太原能源企业。depth=8: 能源革命综合改革。", url: "https://www.taiyuan.gov.cn" },
      ],
    },
    timeline: [
      { year: 2001, event: "加入WTO", dir: 1, note: "全面融入全球产业链，制造业腾飞" },
      { year: 2006, event: "自主创新纲要", dir: 1, note: "建设创新型国家战略确立" },
      { year: 2010, event: "战略性新兴产业", dir: 1, note: "七大战略性新兴产业规划出台" },
      { year: 2015, event: "中国制造2025+互联网+", dir: 1, note: "制造业升级和互联网经济双轮驱动" },
      { year: 2018, event: "科创板设立", dir: 1, note: "硬科技企业上市新通道" },
      { year: 2020, event: "双碳目标提出", dir: 1, note: "2030碳达峰2060碳中和，新能源产业爆发" },
      { year: 2021, event: "专精特新小巨人", dir: 1, note: "中小企业走专业化道路获政策支持" },
      { year: 2023, event: "新质生产力", dir: 1, note: "AI/量子/生物科技/新能源成国家战略" },
      { year: 2024, event: "民营经济促进法", dir: 1, note: "民企营商环境法治化保障" },
      { year: 2025, event: "十五五产业规划", dir: 1, note: "各区密集出台产业扶持方案" },
      { year: 2026, event: "生物医药+G60科创走廊", dir: 1, note: "上海全力押注生物医药赛道" },
    ],
  },
];

/* ── 每个维度附加通俗解读 ──────────────────────────────────── */
dimensions.forEach(dim => {
  dim.plainSummary = plainSummary(dim, calcDimensionScore(dim));
});

/* ── 数据增强：自动注入信息源 ──────────────────────────────────── */
const URL_DOMAIN_EXTRACTOR = /https?:\/\/([^\/]+)/;

export function enrichPolicyData(dims) {
  dims.forEach(dim => {
    (dim.scores || []).forEach(p => {
      if (!p.source) {
        const info = getSourceFromUrl(p.url);
        p.source = info.source;
        p.issuingBody = info.issuingBody;
      }
    });
    Object.values(dim.regionalPolicies || {}).forEach(regionPolicies => {
      regionPolicies.forEach(p => {
        if (!p.source) {
          const info = getSourceFromUrl(p.url);
          p.source = info.source;
          p.issuingBody = info.issuingBody;
        }
      });
    });
  });
}

/* ── 全局数据信息 ─────────────────────────────────────────────── */
export const DATA_INFO = {
  lastVerified: '2026-07-17',
  sourceCount: 7,
  totalPolicies: (() => {
    let count = 0;
    dimensions.forEach(dim => {
      count += (dim.scores || []).length;
      Object.values(dim.regionalPolicies || {}).forEach(rp => count += rp.length);
    });
    return count;
  })(),
};

// 自动增强数据
enrichPolicyData(dimensions);

/* ── 精选关键政策手工精修 ────────────────────────────────── */
const KEY_POLICY_REFINEMENTS = {
  // Housing (6条)
  "住房公积金管理条例（修订）":                    { issuingBody: '国务院·住建部·财政部·央行' },
  "换房退税政策延续至2027年底":                  { issuingBody: '财政部·国家税务总局' },
  "个人住房房产税完善":                           { issuingBody: '上海市政府' },
  "房地产税试点扩围（暂缓但立法研究未停）":        { issuingBody: '全国人大' },
  "上海'沪七条'（限购松绑+公积金提额）":          { issuingBody: '上海市住建委' },
  "北京'认房不认贷'+首付比例下调":                { issuingBody: '北京市住建委' },
  // Employment (5条)
  "取消就业地参保户籍限制":                        { issuingBody: '国家发改委' },
  "民营经济促进法":                                { issuingBody: '全国人大' },
  "超龄劳动者基本权益保障":                        { issuingBody: '人社部' },
  "外卖平台补贴行为规范":                           { issuingBody: '市场监管总局' },
  "电子商务法修正草案":                             { issuingBody: '全国人大' },
  // Education (5条)
  "常住地公共服务同权化":                           { issuingBody: '国务院' },
  "县中振兴行动计划（2025-2027）":                  { issuingBody: '教育部' },
  "职业教育法修订（2022年施行）":                   { issuingBody: '全国人大' },
  "中小学科学教育加法行动":                         { issuingBody: '教育部' },
  "国家教育数字化战略行动":                         { issuingBody: '教育部' },
  // Elderly (5条)
  "渐进式延迟法定退休年龄方案":                     { issuingBody: '全国人大·国务院' },
  "生育补贴制度（2025年起发放）":                   { issuingBody: '国务院' },
  "托育服务法草案":                                 { issuingBody: '全国人大' },
  "医疗保障法草案（二次审议稿）":                   { issuingBody: '全国人大' },
  "常住地基本公共服务（老人随迁）":                 { issuingBody: '国务院' },
  // Finance (5条)
  "金融法（草案首次审议）":                         { issuingBody: '全国人大' },
  "大额存单管理办法":                               { issuingBody: '中国人民银行' },
  "人民币存贷款利率管理规定":                       { issuingBody: '中国人民银行' },
  "税收征收管理法修订":                             { issuingBody: '国家税务总局' },
  "个人住房贷款利率降至3.1%":                      { issuingBody: '中国人民银行' },
  // Industry (4条)
  "生成式人工智能服务管理暂行办法":                 { issuingBody: '国家网信办' },
  "互联网信息服务算法推荐管理规定":                 { issuingBody: '国家网信办' },
  "网络安全法修订（罚款上限提至5000万）":           { issuingBody: '全国人大' },
  "政府采购法+招投标法同步修订":                    { issuingBody: '全国人大' },
};

// 应用手工精修
dimensions.forEach(dim => {
  (dim.scores || []).forEach(p => {
    const refinement = KEY_POLICY_REFINEMENTS[p.policyName];
    if (refinement) {
      if (refinement.issuingBody) p.issuingBody = refinement.issuingBody;
      if (refinement.docNumber) p.docNumber = refinement.docNumber;
    }
  });
  Object.values(dim.regionalPolicies || {}).forEach(regionPolicies => {
    regionPolicies.forEach(p => {
      const refinement = KEY_POLICY_REFINEMENTS[p.policyName];
      if (refinement) {
        if (refinement.issuingBody) p.issuingBody = refinement.issuingBody;
        if (refinement.docNumber) p.docNumber = refinement.docNumber;
      }
    });
  });
});

/* ── 关键发现 ──────────────────────────────────────────────── */
export const keyFindings = [
  { title: "购房窗口期",  level: "high",   summary: "上海限购松绑+公积金提额，当前是近5年最佳购房时机。量化：300万房月供减少约1,200元，30年省息43万", action: "非沪籍+外环外→立即具备资格 | 非沪籍+外环内+社保≥3年→可买1套 | 沪籍+已有1套→换房退税窗口至2027底", persona: ["buyer","worker"], region: "yangtze_delta", url: "https://zjw.sh.gov.cn/xwfb/bdfbdt/20260226/3a8c1f5e2d4b6f8e9a7c3b5d1e2f4a6b.html" },
  { title: "社保重大变革", level: "high",   summary: "户籍与社保脱钩，灵活就业参保率预计从45%升至70%+",        action: "自由职业者应尽快到就业地社保经办机构办理参保手续", persona: ["freelancer","worker"], region: "national", url: "https://www.ndrc.gov.cn/xxgk/zcfb/tz/202501/t20250107_1401892.html" },
  { title: "延迟退休已落地", level: "high", summary: "男60→63、女55→58/50→55，15年渐进。弹性退休可提前3年", action: "70后影响最小(+3-12月)，80后+1-2年，90后+2-3年。建议调整养老储蓄计划", persona: ["worker","freelancer"], region: "national", url: "https://www.npc.gov.cn/npc/c2/c30834/202409/t20240913_340956.html" },
  { title: "金融法奠基",   level: "high",   summary: "金融领域首部综合性立法，影响所有理财和投资",       action: "关注正式稿对理财产品的规范条款，警惕高收益产品风险", persona: ["investor"], region: "national", url: "https://www.moj.gov.cn/pub/sfbgw/lfyjzj/lflfyjzj/202603/t20260320_532981.html" },
  { title: "生育补贴落地", level: "medium", summary: "每孩每年3600元至3岁，生育保险扩面至灵活就业", action: "符合条件的家庭应及时申领，同时关注托育服务法立法进展", persona: ["parent","worker"], region: "national", url: "https://www.gov.cn/zhengce/content/202501/content_6998765.htm" },
  { title: "生物医药风口", level: "medium", summary: "上海全力押注生物医药，行业确定性高",               action: "从业或投资可重点关注", persona: ["investor","worker"], region: "yangtze_delta", url: "https://www.shanghai.gov.cn/nw12344/" },
  { title: "AI教育趋势",  level: "medium", summary: "AI进入中小学课堂是确定性趋势，科学教育加法全面推进", action: "家长应提前培养孩子的科技素养，关注学校AI课程设置", persona: ["parent"], region: "yangtze_delta", url: "http://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/s5987/202503/t20250301_1180234.html" },
  { title: "长三角一体化红利", level: "medium", summary: "公积金互认、征信共享、社保互通——跨省生活更便利", action: "在长三角跨省工作的人应关注", persona: ["worker","freelancer"], region: "yangtze_delta", url: "https://www.shgjj.com" },
];
