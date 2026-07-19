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
const LEVELS = [
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
      { policyName: "保障性租赁住房建设提速", breadth: 8, depth: 8, direction: 1, status: "进行中", date: "2025-01-01", note: "十四五期间全国筹集870万套保障房", confidence: "★★★", rationale: "breadth=8: 影响全国新市民及青年人群体。depth=8: 住房供应体系结构性变革。", url: "https://www.mohurd.gov.cn" },
      { policyName: "房贷利率市场化改革深化", breadth: 9, depth: 8, direction: 1, status: "已发布", date: "2024-05-01", note: "房贷利率与LPR挂钩，持续下行", confidence: "★★★", rationale: "breadth=9: 影响所有房贷借款人。depth=8: 利率市场化是长期结构性变化。", url: "http://www.pbc.gov.cn" },
      { policyName: "认房不认贷政策全国推广", breadth: 8, depth: 7, direction: 1, status: "已发布", date: "2024-08-01", note: "改善型购房门槛大幅降低", confidence: "★★★", rationale: "breadth=8: 影响全国改善型购房者。depth=7: 购房资格认定标准变革。", url: "https://www.mohurd.gov.cn" },
      { policyName: "城中村改造专项借款", breadth: 7, depth: 8, direction: 1, status: "进行中", date: "2024-01-01", note: "35城城中村改造+货币化安置", confidence: "★★☆", rationale: "breadth=7: 影响城中村居民及拆迁户。depth=8: 城市更新模式创新。", url: "https://www.mohurd.gov.cn" },
      { policyName: "预售资金监管制度完善", breadth: 7, depth: 7, direction: 1, status: "已发布", date: "2023-01-01", note: "保交楼+购房者权益保障", confidence: "★★★", rationale: "breadth=7: 影响所有期房购房者。depth=7: 预售制度改革推进。", url: "https://www.mohurd.gov.cn" },
      { policyName: "共有产权住房制度推广", breadth: 6, depth: 8, direction: 1, status: "已发布", date: "2022-01-01", note: "政府与购房者共有产权，降低购房门槛", confidence: "★★☆", rationale: "breadth=6: 影响中低收入购房群体。depth=8: 住房制度创新。", url: "https://www.mohurd.gov.cn" },
      { policyName: "租赁住房REITs试点", breadth: 6, depth: 8, direction: 1, status: "已发布", date: "2021-06-01", note: "租赁住房资产证券化，增加租赁供给", confidence: "★★☆", rationale: "breadth=6: 影响租房群体及投资者。depth=8: 租赁市场金融创新。", url: "https://www.csrc.gov.cn" },
      { policyName: "棚户区改造货币化安置", breadth: 9, depth: 9, direction: 1, status: "已结束", date: "2015-06-01", note: "三四线城市房价上涨的主要推手，安置超6000万套", confidence: "★★★", rationale: "breadth=9: 影响全国棚改居民及三四线楼市。depth=9: 货币化安置根本性改变住房供给格局。", url: "https://www.mohurd.gov.cn" },
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
      { policyName: "新就业形态劳动者权益保障", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2021-07-01", note: "外卖/网约车/快递等平台劳动者权益保障", confidence: "★★★", rationale: "breadth=8: 影响数千万平台劳动者。depth=8: 新就业形态制度性保障。", url: "https://www.mohrss.gov.cn" },
      { policyName: "阶段性缓缴社会保险费", breadth: 8, depth: 7, direction: 1, status: "已结束", date: "2022-05-01", note: "特困行业缓缴养老/失业/工伤保险费", confidence: "★★★", rationale: "breadth=8: 影响22个特困行业企业及职工。depth=7: 纤困企业保就业。", url: "https://www.mohrss.gov.cn" },
      { policyName: "稳就业一揽子政策（青年就业促进）", breadth: 9, depth: 8, direction: 1, status: "已发布", date: "2023-06-01", note: "应对青年失业率攀升，多渠道促进就业", confidence: "★★★", rationale: "breadth=9: 影响全国高校毕业生及青年群体。depth=8: 就业优先战略强化。", url: "https://www.gov.cn/zhengce/content/202306/content_6887038.htm" },
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

/* ── 政策联动效应（crossLinks）────────────────────────────── */
export const crossLinks = [
  { from: "户籍与社保脱钩", to: "公积金条例修订", dim1: "employment", dim2: "housing",
    note: "户籍松绑→购房需求增加→公积金使用率上升→需关注公积金余额充足性" },
  { from: "延迟退休方案", to: "超龄劳动者权益保障", dim1: "elderly", dim2: "employment",
    note: "延迟退休→超龄劳动者增多→劳动权益保障配套必须跟上" },
  { from: "金融法", to: "大额存单管理办法", dim1: "finance", dim2: "finance",
    note: "金融法框架→存款利率市场化加速→无风险收益持续下行" },
  { from: "生成式AI管理办法", to: "教育数字化战略", dim1: "industry", dim2: "education",
    note: "AI行业规范化→AI教育工具合规使用→校园AI应用需符合算法备案要求" },
  { from: "房地产税试点", to: "沪七条限购松绑", dim1: "housing", dim2: "housing",
    note: "限购松绑刺激需求→但房产税可能增加持有成本→多套房持有者需权衡" },
  { from: "生育补贴制度", to: "托育服务法", dim1: "elderly", dim2: "education",
    note: "生育补贴降低生育成本→但托育资源短缺仍制约生育意愿→需配套托育服务法" },
];

/* ── 立法前瞻数据（五年规划 + 年度立法计划）─────────────── */
export const legislativeOutlook = {
  fiveYearPlans: [
    {
      name: "十五五规划纲要（2026–2030）",
      level: "national",
      date: "2026-03",
      url: "https://www.ndrc.gov.cn/fggz/fzzlgh/gjfzgh/202603/U020260317369114704096.pdf",
      highlights: [
        "18篇部署：现代化产业体系、科技创新、数字中国、内需、乡村振兴、区域发展",
        "加快上海「五个中心」建设（金融、贸易、航运、科创、国际消费中心）",
        "高标准建设长三角生态绿色一体化发展示范区",
        "新质生产力：AI/量子/生物科技/新能源成国家战略方向",
        "人口老龄化应对与生育支持政策并重",
      ],
    },
    {
      name: "十四五规划纲要（2021–2025）",
      level: "national",
      date: "2021-03",
      url: "https://www.ndrc.gov.cn/xxgk/zcfb/ghwb/202103/P020210313315693279320.pdf",
      highlights: [
        "共同富裕目标首次写入五年规划",
        "双碳目标（2030碳达峰/2060碳中和）",
        "数字经济发展规划",
        "2035年远景目标纲要",
      ],
    },
    {
      name: "上海市十五五规划纲要（2026–2030）",
      level: "shanghai",
      date: "2026-02",
      url: "https://www.shanghaiinvest.com/cn/viewfile.php?id=21626",
      highlights: [
        "「五个中心」建设为核心：金融、贸易、航运、科创、国际消费中心",
        "部署13方面重大举措",
        "聚焦民生：就业、收入、住房、养老指标",
        "绿色低碳转型与韧性城市建设",
      ],
    },
  ],
  legislativePlans: [
    {
      name: "国务院2026年度立法工作计划",
      date: "2026-05-11",
      source: "国办发〔2026〕14号",
      url: "https://www.moj.gov.cn/pub/sfbgw/zwgkztzl/xxxcgcxjpfzsx/fzsxyw/202605/t20260511_534688.html",
      stats: { laws: 14, regulations: 24, preparatory: 30 },
    },
    {
      name: "全国人大常委会2026年度立法工作计划",
      date: "2026-05-11",
      source: "全国人大常委会",
      url: "https://www.moj.gov.cn/pub/sfbgw/gwxw/xwyw/202605/t20260511_534683.html",
      stats: { continuing: 15, firstReview: 19 },
    },
  ],
  // 按维度映射的重点立法前瞻项目
  outlookByDim: {
    housing: [
      { name: "住房公积金管理条例（修订）", status: "预备修订", source: "国务院立法计划", impact: "利好", dim: "housing",
        note: "提取条件进一步放宽，覆盖灵活就业群体，跨省转移便利化", url: "https://www.mohurd.gov.cn/gongkai/fdzdgknr/zqyj/202606/20260605_776384.html" },
      { name: "城镇房屋安全管理条例", status: "预备制定", source: "国务院立法计划", impact: "中性", dim: "housing",
        note: "房屋养老金制度探索，老旧小区安全管理法治化", url: "https://www.mohurd.gov.cn" },
      { name: "不动产登记法", status: "预备审议", source: "国务院立法计划", impact: "中性", dim: "housing",
        note: "统一不动产登记制度，产权保护法治化", url: "https://www.mnr.gov.cn" },
      { name: "物业管理条例（修订）", status: "预备修订", source: "国务院立法计划", impact: "利好", dim: "housing",
        note: "业委会权责明晰化，物业服务规范化", url: "https://www.mohurd.gov.cn" },
    ],
    employment: [
      { name: "税收征收管理法修订", status: "提请审议", source: "国务院立法计划", impact: "中性", dim: "employment",
        note: "征管数字化升级，高收入群体监管加强，对普通工薪影响有限", url: "https://www.chinatax.gov.cn" },
      { name: "退役军人就业创业促进条例", status: "拟制定", source: "国务院立法计划", impact: "利好", dim: "employment",
        note: "退役军人就业专项扶持", url: "https://www.mohrss.gov.cn" },
      { name: "养老服务法", status: "预备审议", source: "国务院立法计划", impact: "利好", dim: "employment",
        note: "银发经济就业新增长点", url: "https://www.mca.gov.cn" },
      { name: "残疾人就业条例（修订）", status: "预备修订", source: "国务院立法计划", impact: "利好", dim: "employment",
        note: "残障群体就业保障强化", url: "https://www.mohrss.gov.cn" },
    ],
    education: [
      { name: "教师法修订", status: "提请审议", source: "国务院立法计划", impact: "利好", dim: "education",
        note: "教师待遇保障、师德师风建设，教育行业从业者直接受益", url: "http://www.moe.gov.cn" },
      { name: "教材管理条例", status: "预备制定", source: "国务院立法计划", impact: "中性", dim: "education",
        note: "教材选用和质量监管规范化", url: "http://www.moe.gov.cn" },
      { name: "学前教育法（已实施）", status: "已实施", source: "全国人大", impact: "利好", dim: "education",
        note: "学前教育普及普惠，减轻家长入园焦虑", url: "http://www.npc.gov.cn/npc/c30834/202411/" },
    ],
    elderly: [
      { name: "医疗保障法", status: "二次审议", source: "全国人大（进行中）", impact: "利好", dim: "elderly",
        note: "首部医保专门法律，统一医保基金监管和药品集采制度", url: "https://www.moj.gov.cn/pub/sfbgw/lfyjzj/" },
      { name: "养老服务法", status: "预备审议", source: "国务院立法计划", impact: "利好", dim: "elderly",
        note: "养老服务体系建设法治化，长期护理保险制度化", url: "https://www.mca.gov.cn" },
      { name: "药品管理法实施条例（修订）", status: "拟修订", source: "国务院立法计划", impact: "利好", dim: "elderly",
        note: "药品集采扩面，创新药审批加速", url: "https://www.nmpa.gov.cn" },
      { name: "中医药传统知识保护条例", status: "拟制定", source: "国务院立法计划", impact: "利好", dim: "elderly",
        note: "中医药服务体系完善", url: "http://www.nhc.gov.cn" },
      { name: "社会保险基金监督条例", status: "预备制定", source: "国务院立法计划", impact: "利好", dim: "elderly",
        note: "社保基金安全运营保障", url: "https://www.mohrss.gov.cn" },
    ],
    finance: [
      { name: "金融法（草案）", status: "进行中·征求意见", source: "全国人大", impact: "利好", dim: "finance",
        note: "金融领域首部综合性立法，银证保统一监管框架", url: "https://www.moj.gov.cn/pub/sfbgw/lfyjzj/lflfyjzj/202603/t20260320_532981.html" },
      { name: "中国人民银行法修订", status: "进行中·征求意见", source: "全国人大", impact: "利好", dim: "finance",
        note: "货币政策独立性强化，数字人民币法律框架", url: "http://www.pbc.gov.cn" },
      { name: "消费税法", status: "预备审议", source: "国务院立法计划", impact: "中性", dim: "finance",
        note: "消费税改革，部分消费品税率调整", url: "https://www.chinatax.gov.cn" },
      { name: "商业银行法修订", status: "预备审议", source: "国务院立法计划", impact: "利好", dim: "finance",
        note: "利率市场化深化，储户保护强化", url: "http://www.pbc.gov.cn" },
      { name: "保险法修订", status: "预备审议", source: "国务院立法计划", impact: "利好", dim: "finance",
        note: "保险产品规范化，理赔权益保护", url: "https://www.nfra.gov.cn" },
      { name: "价格法修正", status: "提请审议", source: "国务院立法计划", impact: "利好", dim: "finance",
        note: "价格监管体系完善，消费者权益保护", url: "https://www.samr.gov.cn" },
      { name: "金融业网络安全管理办法", status: "征求意见中", source: "央行+金融监管总局+证监会", impact: "中性", dim: "finance",
        note: "金融数据安全和网络安全统一规范", url: "http://www.pbc.gov.cn" },
    ],
    industry: [
      { name: "招标投标法修订", status: "进行中·征求意见", source: "全国人大", impact: "利好", dim: "industry",
        note: "公平竞争环境优化，中小企业参与政府采购门槛降低", url: "http://www.npc.gov.cn/npc/c2/c30834/202606/" },
      { name: "政府采购法修订", status: "进行中·征求意见", source: "全国人大", impact: "利好", dim: "industry",
        note: "政府采购流程透明化，创新产品优先采购", url: "http://www.npc.gov.cn/npc/c2/c30834/202606/" },
      { name: "全国统一大市场建设条例", status: "拟制定", source: "国务院立法计划", impact: "利好", dim: "industry",
        note: "打破地方保护和市场分割，全国统一营商环境", url: "https://www.ndrc.gov.cn" },
      { name: "反外国不当域外管辖条例", status: "拟制定", source: "国务院立法计划", impact: "利好", dim: "industry",
        note: "涉外法治保护，应对外国长臂管辖", url: "https://www.mofcom.gov.cn" },
      { name: "产业链供应链安全规定", status: "拟制定", source: "国务院立法计划", impact: "利好", dim: "industry",
        note: "关键产业链安全保障法治化", url: "https://www.ndrc.gov.cn" },
      { name: "互联网信息服务管理办法修订", status: "征求意见中", source: "国家网信办", impact: "中性", dim: "industry",
        note: "AI内容监管、平台算法推荐规范，互联网企业合规要求升级", url: "https://www.cac.gov.cn" },
      { name: "集成电路布图设计保护条例修订", status: "拟修订", source: "国务院立法计划", impact: "利好", dim: "industry",
        note: "芯片知识产权保护强化，半导体产业支撑", url: "https://www.cnipa.gov.cn" },
    ],
  },
};

/* ── 方法论元信息 ──────────────────────────────────────────── */
export const methodology = {
  version: "3.0",
  frameworks: [
    { name: "OECD RIA 监管影响评估", desc: "评估政策对目标群体的净影响，区分直接影响与间接影响" },
    { name: "PEST 宏观环境分析",     desc: "从政治、经济、社会、技术四个维度扫描政策的结构性影响" },
    { name: "利益相关者影响矩阵",     desc: "World Bank框架，评估对不同群体的差异化影响" },
  ],
  formula:
    "RawScore = breadth × depth × direction × certainty × timeliness\n" +
    "Index    = clamp( (avg(RawScores)/100 + 1) / 2 × 100, 0, 100 )\n" +
    "Overall  = Σ( DimensionIndex × PersonaWeight )",
  params: [
    { key: "breadth",    label: "影响广度", range: "1–10", desc: "该政策影响多少人口（见评分标尺）" },
    { key: "depth",      label: "深远程度", range: "1–10", desc: "结构性变革(8-10) vs 临时调整(1-3)（见评分标尺）" },
    { key: "direction",  label: "方向",     range: "+1/0/-1", desc: "利好 / 中性 / 利空" },
    { key: "certainty",  label: "确定性",   range: "0.5–1.0", desc: "征求意见中(0.6) / 已结束(0.85) / 已通过(1.0)" },
    { key: "timeliness", label: "时效权重", range: "0.5–1.0", desc: "距今≤3月(1.0) / ≤6月(0.9) / ≤12月(0.8) / ≤24月(0.65) / >24月(0.5)" },
  ],
  levels: LEVELS,
  confidence: [
    { level: "★★★", label: "高置信度", desc: "政策已通过或征求意见已截止，结果确定" },
    { level: "★★☆", label: "中置信度", desc: "征求意见中，大概率通过但可能有修改" },
    { level: "★☆☆", label: "低置信度", desc: "早期征求意见阶段，变数较大" },
  ],
  sources: [
    "中国人大网（npc.gov.cn）— 全国人大法律草案征求意见",
    "司法部立法意见征集（moj.gov.cn）— 行政法规征求意见稿",
    "商务部全球法规网（policy.mofcom.gov.cn）— 部门规章征求意见",
    "上海市科委（stcsm.sh.gov.cn）— 上海科技类政策",
    "上海市住建委 / 房管局 — 上海房地产政策",
    "江苏省 / 浙江省 / 安徽省政府官网 — 长三角区域政策",
    "国家网信办 / 公安部 — 互联网与公共安全",
  ],
};

/* ── 个性化行动清单（Action Plans）─────────────────────── */
export const actionPlans = {
  buyer: [
    { id: "b1", title: "确认你的购房资格", urgency: "immediate",
      steps: ["打开「购房资格自测」工具", "输入户籍和社保情况", "确认购房区域限制"],
      benefit: null, risk: null, toolLink: "tools", policyRef: "沪七条" },
    { id: "b2", title: "计算公积金可贷额度", urgency: "immediate",
      steps: ["登录「上海公积金」APP查询余额", "确认连续缴存是否满6个月", "用「房贷计算器」对比公积金vs商贷"],
      benefit: 432000, risk: null, toolLink: "tools", policyRef: "公积金条例修订" },
    { id: "b3", title: "把握换房退税窗口", urgency: "soon",
      steps: ["如计划置换，确保卖房后1年内购买新房", "保留好卖房已缴个税的完税凭证", "在税务局窗口申请退税"],
      benefit: 50000, risk: null, toolLink: null, policyRef: "换房退税政策", deadline: "2027-12-31" },
    { id: "b4", title: "评估房地产税风险", urgency: "watch",
      steps: ["如持有2套及以上房产，关注房地产税试点扩围动态", "评估持有成本是否可承受", "必要时咨询房产规划顾问"],
      benefit: null, risk: "试点暂缓但立法研究未停，多套房持有成本可能上升", toolLink: null, policyRef: "房地产税试点" },
    { id: "b5", title: "利用LPR下行窗口", urgency: "soon",
      steps: ["关注LPR每月报价", "如已有商贷可申请转为浮动利率", "对比固定vs浮动利率的长期差异"],
      benefit: 64000, risk: null, toolLink: null, policyRef: "利率管理规定" },
    { id: "b6", title: "关注长三角公积金互认", urgency: "watch",
      steps: ["如在长三角跨省工作，确认公积金可跨省使用", "咨询当地公积金中心互认细则"],
      benefit: null, risk: null, toolLink: null, policyRef: "长三角一体化" },
  ],
  worker: [
    { id: "w1", title: "办理就业地社保参保", urgency: "immediate",
      steps: ["确认单位是否已在就业地为你参保", "灵活就业者到当地社保经办机构办理", "确认缴费基数和险种覆盖"],
      benefit: null, risk: null, toolLink: null, policyRef: "户籍与社保脱钩" },
    { id: "w2", title: "检查个税专项附加扣除", urgency: "immediate",
      steps: ["登录「个人所得税」APP", "检查子女教育、房贷利息、赡养老人等扣除项", "确保每项都填写完整，最大化扣除额"],
      benefit: 12000, risk: null, toolLink: null, policyRef: "个税专项附加扣除" },
    { id: "w3", title: "了解延迟退休对你的影响", urgency: "soon",
      steps: ["根据你的出生年份计算新的法定退休年龄", "评估是否需要增加个人养老金储蓄", "关注弹性退休选择权"],
      benefit: null, risk: "延迟退休使养老金替代率下降约3-5个百分点", toolLink: null, policyRef: "延迟退休方案" },
    { id: "w4", title: "开立个人养老金账户", urgency: "soon",
      steps: ["在银行APP或社保平台开户", "每年可存入12000元，享受税前扣除", "选择养老目标基金或储蓄产品"],
      benefit: 3600, risk: null, toolLink: null, policyRef: "个人养老金制度" },
    { id: "w5", title: "关注平台用工规范", urgency: "watch",
      steps: ["如通过外卖/网约车等平台获得收入，关注补贴行为规范", "确认平台是否为你缴纳工伤保险"],
      benefit: null, risk: null, toolLink: null, policyRef: "外卖平台补贴规范" },
    { id: "w6", title: "申领生育补贴（如适用）", urgency: "soon",
      steps: ["如有0-3岁子女，到社区或线上平台登记", "每孩每年3600元，持续发放至3岁"],
      benefit: 10800, risk: null, toolLink: null, policyRef: "生育补贴制度" },
  ],
  parent: [
    { id: "p1", title: "关注学区划分变化", urgency: "immediate",
      steps: ["查询你所在区最新的学区划分地图", "关注「多校划片」政策是否影响你的学区", "留意新建学校的划片范围"],
      benefit: null, risk: "多校划片可能导致学区房价值波动", toolLink: null, policyRef: "常住地教育同权" },
    { id: "p2", title: "了解AI教育试点学校", urgency: "soon",
      steps: ["查询虹口区AI教育试验区推广名单", "关注孩子学校是否开设AI/编程课程", "考虑校外STEM教育补充"],
      benefit: null, risk: null, toolLink: null, policyRef: "教育数字化战略" },
    { id: "p3", title: "申请生育补贴", urgency: "immediate",
      steps: ["如有0-3岁子女，到社区或线上登记", "每孩每年3600元，持续至3岁", "同时确认生育保险是否覆盖"],
      benefit: 10800, risk: null, toolLink: null, policyRef: "生育补贴制度" },
    { id: "p4", title: "检查随迁子女教育同权资格", urgency: "soon",
      steps: ["非本地户籍家庭确认居住证和社保缴纳情况", "联系当地教育局了解入学条件", "提前准备材料（居住证、社保证明等）"],
      benefit: null, risk: null, toolLink: null, policyRef: "常住地公共服务同权化" },
    { id: "p5", title: "关注托育服务法立法", urgency: "watch",
      steps: ["0-3岁托育资源仍短缺，关注立法进展", "评估当前托育机构资质和价格"],
      benefit: null, risk: "托育服务法仍在预备阶段，短期资源短缺", toolLink: null, policyRef: "托育服务法" },
    { id: "p6", title: "利用学前教育法红利", urgency: "soon",
      steps: ["确认孩子所在幼儿园是否为普惠性幼儿园", "关注公办幼儿园学位供给增加情况"],
      benefit: null, risk: null, toolLink: null, policyRef: "学前教育法" },
  ],
  investor: [
    { id: "i1", title: "关注金融法征求意见进展", urgency: "immediate",
      steps: ["访问中国人大网查看金融法草案全文", "评估对你持有的理财产品/基金的影响", "关注正式稿对资管产品的规范条款"],
      benefit: null, risk: "正式稿可能大幅修改，理财产品收益率和规则可能变化", toolLink: null, policyRef: "金融法" },
    { id: "i2", title: "评估大额存单利率变化", urgency: "soon",
      steps: ["检查你的大额存单到期时间", "对比当前利率与预期收益率", "考虑分散配置（国债、货币基金等）"],
      benefit: null, risk: "大额存单利率上限可能进一步压缩，无风险收益持续下行", toolLink: null, policyRef: "大额存单管理办法" },
    { id: "i3", title: "跟踪生物医药/G60产业动态", urgency: "watch",
      steps: ["关注上海生物医药外资项目扶持政策落地", "跟踪G60科创走廊2.0沿线企业动态", "评估相关板块基金的投资价值"],
      benefit: null, risk: null, toolLink: null, policyRef: "生物医药扶持+G60走廊" },
    { id: "i4", title: "检查理财产品合规性", urgency: "soon",
      steps: ["确认持有的理财产品是否完成资管新规过渡", "警惕「保本高收益」类产品", "检查产品管理人资质"],
      benefit: null, risk: "利率下行周期中，高收益产品风险加大", toolLink: null, policyRef: "资管新规+金融法" },
    { id: "i5", title: "评估房产资产配置", urgency: "watch",
      steps: ["如持有投资性房产，评估持有成本变化", "关注房地产税试点扩围进展", "考虑是否需要优化房产配置"],
      benefit: null, risk: "房地产税试点扩围可能增加持有成本", toolLink: null, policyRef: "房地产税试点" },
    { id: "i6", title: "开立个人养老金账户", urgency: "soon",
      steps: ["每年可存入12000元，享受税前扣除", "适合有较高边际税率的投资者", "选择指数基金或养老目标基金"],
      benefit: 3600, risk: null, toolLink: null, policyRef: "个人养老金制度" },
  ],
  freelancer: [
    { id: "f1", title: "办理就业地社保参保", urgency: "immediate",
      steps: ["到就业地社保经办机构办理灵活就业参保", "选择缴费基数档次（60%-300%）", "预计月缴约1800元（60%档）"],
      benefit: null, risk: null, toolLink: null, policyRef: "户籍与社保脱钩" },
    { id: "f2", title: "了解个税核定征收政策", urgency: "immediate",
      steps: ["确认你所在地区是否支持核定征收", "对比查账征收vs核定征收的税负差异", "咨询12366税务热线或当地税局"],
      benefit: 6000, risk: "税收征管法修订加强高收入群体监管", toolLink: null, policyRef: "税收征管法修订" },
    { id: "f3", title: "开立个人养老金账户", urgency: "soon",
      steps: ["在银行APP开户，每年存入12000元", "灵活就业者同样享受税前扣除", "选择适合风险偏好的产品"],
      benefit: 3600, risk: null, toolLink: null, policyRef: "个人养老金制度" },
    { id: "f4", title: "关注平台用工规范", urgency: "soon",
      steps: ["确认平台是否为你缴纳职业伤害保险", "关注外卖平台补贴行为规范的落地", "保留好收入证明和平台协议"],
      benefit: null, risk: null, toolLink: null, policyRef: "外卖平台补贴规范" },
    { id: "f5", title: "办理就业地医保", urgency: "immediate",
      steps: ["户籍松绑后可在就业地直接参加职工医保", "到当地医保局办理参保手续", "确认门诊和住院报销比例"],
      benefit: null, risk: null, toolLink: null, policyRef: "户籍与社保脱钩" },
    { id: "f6", title: "关注延迟退休影响", urgency: "watch",
      steps: ["灵活就业者同样适用延迟退休方案", "评估你的新法定退休年龄", "考虑是否需要增加养老储蓄"],
      benefit: null, risk: "灵活就业者养老金替代率可能更低", toolLink: null, policyRef: "延迟退休方案" },
  ],
};

/* ── 政策红利计算数据（Policy Dividends）────────────────── */
export const policyDividends = {
  buyer: [
    { id: "gjj_saving", label: "公积金提额省息", amount: 432000, confirmed: true, calc: "300万房/30年，公积金2.85% vs 商贷4.2%" },
    { id: "tax_refund", label: "换房退税", amount: 50000, confirmed: true, calc: "500万房产，已缴个税全额退还" },
    { id: "lpr_down", label: "房贷利率下行红利", amount: 64000, confirmed: true, calc: "LPR较2021年降200基点，300万/30年" },
  ],
  worker: [
    { id: "social_security", label: "就业地参保权益", amount: 0, confirmed: true, calc: "灵活就业可在工作地直接参保，预计参保率从45%升至70%+", isQualitative: true },
    { id: "tax_deduction", label: "个税专项附加扣除", amount: 12000, confirmed: true, calc: "子女教育+房贷利息+赡养老人等，年扣除约1.2万" },
    { id: "child_subsidy", label: "生育补贴", amount: 10800, confirmed: true, calc: "每孩每年3600元，持续3年" },
    { id: "pension_acct", label: "个人养老金税收优惠", amount: 3600, confirmed: true, calc: "年存12000元，边际税率30%节税3600元" },
  ],
  parent: [
    { id: "child_subsidy", label: "生育补贴", amount: 10800, confirmed: true, calc: "每孩每年3600元，持续3年" },
    { id: "edu_equal", label: "随迁子女教育同权", amount: 0, confirmed: true, calc: "免去回原籍高考的隐性成本", isQualitative: true },
    { id: "preschool", label: "学前教育普惠化", amount: 0, confirmed: true, calc: "公办幼儿园学位增加，降低入园成本", isQualitative: true },
    { id: "tax_deduction", label: "子女教育个税扣除", amount: 12000, confirmed: true, calc: "子女教育专项附加扣除每年12000元" },
  ],
  investor: [
    { id: "lpr_down", label: "房贷利率下行红利", amount: 64000, confirmed: true, calc: "LPR较2021年降200基点，300万/30年" },
    { id: "pension_acct", label: "个人养老金税收优惠", amount: 3600, confirmed: true, calc: "年存12000元，边际税率30%节税3600元" },
    { id: "finance_law", label: "金融法保护预期", amount: 0, confirmed: false, calc: "银证保统一监管，投资者保护强化", isQualitative: true },
    { id: "property_tax_risk", label: "房地产税风险", amount: -30000, confirmed: false, calc: "若试点扩围，年持有成本可能增加约3万", isRisk: true },
  ],
  freelancer: [
    { id: "social_security", label: "就业地参保权益", amount: 0, confirmed: true, calc: "户籍松绑后在工作地参保，预计月缴约1800元", isQualitative: true },
    { id: "tax_saving", label: "核定征收节税", amount: 6000, confirmed: true, calc: "年收入20万以下，核定征收较查账征收省税约6000元" },
    { id: "pension_acct", label: "个人养老金税收优惠", amount: 3600, confirmed: true, calc: "年存12000元，边际税率30%节税3600元" },
    { id: "medical_ins", label: "就业地医保参保", amount: 0, confirmed: true, calc: "可在工作地参加职工医保，报销比例与本地一致", isQualitative: true },
  ],
};

/* ── 场景化搜索映射 ──────────────────────────────────────── */
export const searchScenes = [
  { id: 'buy_house', label: '我要买房', icon: '🏠', desc: '公积金、限购、房贷、退税', keywords: ['公积金','限购','房贷','购房','LPR','首付','沪七条','公积金管理'], dims: ['housing','finance'] },
  { id: 'change_job', label: '跳槽换工作', icon: '💼', desc: '社保、劳动权益、失业', keywords: ['社保','劳动','N+1','失业','灵活就业','户籍','社保脱钩'], dims: ['employment'] },
  { id: 'have_baby', label: '生娃养娃', icon: '👶', desc: '生育、产假、托育、学区', keywords: ['生育','产假','托育','学区','补贴','婴幼儿','生育津贴'], dims: ['education','elderly'] },
  { id: 'retire_plan', label: '规划养老', icon: '🏖️', desc: '退休、养老金、医保、护理', keywords: ['退休','养老金','医保','长期护理','延迟退休','个人养老金','弹性退休'], dims: ['elderly'] },
  { id: 'tax_optimize', label: '个税优化', icon: '💰', desc: '个税、扣除、年终奖、汇算', keywords: ['个税','专项附加扣除','年终奖','汇算','税收征收'], dims: ['finance'] },
  { id: 'invest', label: '投资理财', icon: '📈', desc: '利率、金融法、存款、保险', keywords: ['利率','金融法','存款','理财','保险','大额存单','商业银行法'], dims: ['finance','industry'] },
  { id: 'start_business', label: '创业开公司', icon: '🚀', desc: '营商环境、税收、招投标', keywords: ['营商环境','小微企业','税收','电商法','招投标','统一大市场','政府采购'], dims: ['industry','finance'] },
  { id: 'edu_plan', label: '教育规划', icon: '🎓', desc: '学区、双减、AI教育、学前教育', keywords: ['学区','双减','AI教育','教师','学前教育','教材','多校划片'], dims: ['education'] },
  { id: 'crisis_help', label: '失业应急', icon: '🆘', desc: '失业金、公积金提取、社保续缴、劳动仲裁', keywords: ['失业','裁员','断缴','离职','辞退','赔偿','失业金','劳动仲裁','N+1','公积金提取','社保断缴','医保断缴'], dims: ['employment','housing','elderly'] },
];

/* ── 时间窗口倒计时（Deadlines）───────────────────────── */
export const deadlines = [
  { id: "finance_law", stage: 'draft', label: "金融法征求意见截止", date: "2026-10-15", persona: ["investor","worker"], action: "关注正式稿对理财产品的规范条款", dims: ["finance"] },
  { id: "tax_refund", stage: 'active', label: "换房退税政策到期", date: "2027-12-31", persona: ["buyer"], action: "如计划置换，确保1年内完成买卖", dims: ["housing","finance"] },
  { id: "child_subsidy", stage: 'active', label: "生育补贴申领", date: "2026-12-31", persona: ["parent","worker"], action: "有0-3岁子女的家庭应尽快登记申领", dims: ["education","elderly"] },
  { id: "bidding_law", stage: 'draft', label: "招投标法征求意见", date: "2026-09-30", persona: ["investor","freelancer"], action: "中小企业关注公平竞争条款变化", dims: ["industry"] },
  { id: "retirement_start", stage: 'active', label: "延迟退休过渡期", date: "2025-01-01", persona: ["worker","freelancer","investor"], action: "根据你的出生年份计算新退休年龄", dims: ["elderly","employment"] },
  { id: "data_security", stage: 'draft', label: "金融业网络安全办法征求意见", date: "2026-08-31", persona: ["investor"], action: "关注金融数据安全和网络安全规范", dims: ["finance"] },
  { id: "property_tax_watch", stage: 'draft', label: "房地产税立法研究", date: "2027-06-30", persona: ["buyer","investor"], action: "多套房持有者持续关注试点扩围动态", dims: ["housing"] },
  { id: "ai_edu_pilot", stage: 'final', label: "AI教育试点推广期", date: "2026-09-01", persona: ["parent"], action: "秋季学期开始前关注学校AI课程设置", dims: ["education","industry"] },
  { id: "bzf_rent_cap", stage: 'draft', label: "保租房租金涨幅监管新规", date: "2026-12-31", persona: ["worker","freelancer"], action: "关注保租房年度租金涨幅是否超过5%上限", dims: ["housing"] },
  { id: "gzf_reform", stage: 'draft', label: "公租房申请审核改革", date: "2026-10-31", persona: ["worker","buyer"], action: "关注公租房线上申请范围扩大（单身离异家庭纳入）", dims: ["housing"] },
  { id: "talent_housing", stage: 'active', label: "各区人才公寓申请窗口", date: "2026-09-30", persona: ["worker","freelancer"], action: "应届毕业生关注各区人才公寓集中申请期", dims: ["housing","employment"] },
  { id: "gjj_regulation", stage: 'draft', label: "住房公积金管理条例修订征求意见", date: "2026-08-05", persona: ["buyer","worker","freelancer"], action: "关注公积金提取条件放宽和灵活就业覆盖", dims: ["housing"] },
  { id: "medical_insurance_law", stage: 'draft', label: "医疗保障法二审", date: "2026-11-30", persona: ["worker","freelancer"], action: "关注医保基金监管和药品集采制度变化", dims: ["elderly"] },
  { id: "elderly_service_law", stage: 'draft', label: "养老服务法预备审议", date: "2027-03-31", persona: ["worker","investor"], action: "关注长期护理保险制度化和银发经济", dims: ["elderly","industry"] },
  { id: "consumer_subsidy_end", stage: 'active', label: "以旧换新补贴年度窗口", date: "2026-12-31", persona: ["buyer","worker"], action: "家电/汽车以旧换新补贴年底前申领", dims: ["finance"] },
  { id: "personal_pension", stage: 'active', label: "个人养老金年度缴存截止", date: "2026-12-31", persona: ["worker","investor"], action: "年底前缴满12000元可享当年个税抵扣", dims: ["finance","elderly"] },
  // 安家政策截止日期
  { id: "settle_bj_score", stage: 'active', label: "北京积分落户申报窗口", date: "2026-07-15", persona: ["worker","buyer"], action: "每年Q2开放申报，提前核查社保和纳税记录", dims: ["housing"] },
  { id: "settle_hz_score", stage: 'active', label: "杭州积分落户申请截止", date: "2026-09-30", persona: ["worker","freelancer","buyer"], action: "每年3月和9月两次申请窗口，提前准备积分材料", dims: ["housing"] },
  { id: "settle_sz_apply", stage: 'active', label: "深圳人才引进落户申请", date: "2026-12-31", persona: ["worker","freelancer","buyer"], action: "全年开放，全流程网上办理，最快1个月落户", dims: ["housing"] },
  { id: "settle_sh_apply", stage: 'active', label: "上海居转户年度名额", date: "2026-12-31", persona: ["worker","buyer"], action: "居转户年度总量控制，尽早提交申请材料", dims: ["housing"] },
  { id: "settle_gz_talent", stage: 'active', label: "广州人才引进补贴申领", date: "2026-11-30", persona: ["worker","freelancer","buyer"], action: "各区引才补贴年底前申领，注意学历认证时间", dims: ["housing","finance"] },
  { id: "settle_sz_house", stage: 'active', label: "深圳人才房集中配售期", date: "2026-08-31", persona: ["worker","buyer"], action: "市价60%配售人才房，关注住建局公告", dims: ["housing"] },
  { id: "settle_gjj_rise", stage: 'active', label: "公积金贷款额度上浮政策", date: "2026-12-31", persona: ["buyer","worker"], action: "多城上调公积金贷款额度，首套最高可贷120万", dims: ["housing","finance"] },
];

/* ── 政策术语速查表（Policy Glossary）────────────────── */
export const policyGlossary = [
  { term: "居转户", definition: "持有上海居住证满一定年限（通常7年），满足社保、职称等条件后转为上海户籍", dims: ["housing","education"] },
  { term: "N+1赔偿", definition: "用人单位解除劳动合同时支付的经济补偿金（N=工作年限×月薪）加1个月代通知金", dims: ["employment"] },
  { term: "五险一金", definition: "养老保险、医疗保险、失业保险、工伤保险、生育保险和住房公积金的总称", dims: ["employment","housing"] },
  { term: "专项附加扣除", definition: "个税中除基本减除费用（5000元/月）外的7类额外扣除项，可降低应纳税所得额", dims: ["finance"] },
  { term: "个人养老金", definition: "第三支柱养老保险，每年可缴纳12000元并享受税前扣除，退休后领取", dims: ["elderly","finance"] },
  { term: "公积金", definition: "住房公积金，由单位和个人各缴一半，可用于购房贷款（利率2.85%）和租房提取", dims: ["housing"] },
  { term: "保租房", definition: "保障性租赁住房，面向新市民和青年人，不限户籍，租金低于市场价85%", dims: ["housing"] },
  { term: "公租房", definition: "公共租赁住房，面向青年职工和引进人才，需沪籍或居住证，租金为市场价80-90%", dims: ["housing"] },
  { term: "限购", definition: "限制家庭或个人购买住房套数的政策，上海目前非沪籍外环外不限购", dims: ["housing"] },
  { term: "认房不认贷", definition: "购房资格认定标准：只看名下是否有房，不看是否有过贷款记录", dims: ["housing"] },
  { term: "延迟退休", definition: "渐进式延迟法定退休年龄：男性63岁、女干部58岁、女工人55岁，2025年起过渡", dims: ["elderly","employment"] },
  { term: "弹性退休", definition: "允许在法定退休年龄前后最多3年内灵活选择退休时间，养老金不打折", dims: ["elderly"] },
  { term: "灵活就业", definition: "非全日制、临时性、季节性等灵活形式就业，可按灵活就业身份参加社保", dims: ["employment"] },
  { term: "居住证积分", definition: "上海居住证积分制度，满分120分可享子女在沪中高考等公共服务", dims: ["education","housing"] },
  { term: "LPR", definition: "贷款市场报价利率（Loan Prime Rate），是房贷利率的定价基准，每月公布", dims: ["housing","finance"] },
  { term: "大病保险", definition: "基本医保自动覆盖的大病补充保险，年度自负超起付线（约2.5万）后自动报销60-80%", dims: ["elderly"] },
  { term: "竞业限制", definition: "离职后一定期限内不得到竞争对手工作或自营同类业务，公司需按月支付补偿（≥工资30%）", dims: ["employment"] },
  { term: "劳动仲裁", definition: "劳动者与用人单位发生争议时，向劳动仲裁委员会申请裁决的法定程序（免费，时效1年）", dims: ["employment"] },
  { term: "生育津贴", definition: "生育保险支付给产假期间职工的工资替代，标准为用人单位上年度月平均工资", dims: ["elderly","employment"] },
  { term: "换房退税", definition: "1年内卖出旧房并购买新房，可退还卖房时缴纳的个人所得税，政策延续至2027年底", dims: ["housing","finance"] },
];


/* ── 政策演变里程碑（Policy Milestones）────────────────── */
export const policyMilestones = [
  { year: "2020", month: "05", title: "民法典颁布", dims: ["housing","finance"], impact: "positive",
    summary: "首次以法典形式确立物权、合同、人格权等基本民事制度，影响房产交易和租赁市场" },
  { year: "2021", month: "05", title: "三孩生育政策放开", dims: ["education","elderly"], impact: "positive",
    summary: "放开三孩并配套支持措施，推动教育、托育、住房等政策联动调整" },
  { year: "2021", month: "07", title: "双减政策落地", dims: ["education"], impact: "neutral",
    summary: "规范校外培训，重塑教育生态，家长教育支出结构发生重大变化" },
  { year: "2021", month: "10", title: "房地产税试点授权", dims: ["housing"], impact: "negative",
    summary: "全国人大授权国务院在部分地区开展房地产税改革试点，多套房持有者承压" },
  { year: "2022", month: "01", title: "个人养老金制度启动", dims: ["finance","elderly"], impact: "positive",
    summary: "第三支柱养老保险正式落地，每年可缴纳12000元并享受税收优惠" },
  { year: "2022", month: "08", title: "保租房顶层设计出台", dims: ["housing"], impact: "positive",
    summary: "国务院发布保障性租赁住房指导意见，明确面向新市民、青年人的住房保障体系" },
  { year: "2023", month: "07", title: "生成式AI管理暂行办法", dims: ["industry"], impact: "neutral",
    summary: "首次为AI产业立规，平衡创新发展与安全监管，影响科技从业者和投资者" },
  { year: "2023", month: "08", title: "个税专项扣除提标", dims: ["finance"], impact: "positive",
    summary: "3岁以下婴幼儿照护、子女教育扣除标准从1000元提至2000元/月，惠及数千万家庭" },
  { year: "2024", month: "01", title: "民营经济促进法草案", dims: ["industry","employment"], impact: "positive",
    summary: "首次以法律形式明确民营经济的地位和作用，提振市场信心" },
  { year: "2024", month: "09", title: "延迟退休方案通过", dims: ["elderly","employment"], impact: "neutral",
    summary: "渐进式延迟法定退休年龄方案通过，男性63岁、女性58/55岁，2025年起过渡" },
  { year: "2025", month: "01", title: "户籍社保脱钩改革", dims: ["employment","housing"], impact: "positive",
    summary: "取消就业地参保户籍限制，2亿灵活就业者可在就业地参加社保" },
  { year: "2025", month: "03", title: "公积金条例修订启动", dims: ["housing"], impact: "positive",
    summary: "缴存上限从月工资12%提至16%，异地转移接续、租房提取更加便利" },
  { year: "2025", month: "06", title: "金融法草案征求意见", dims: ["finance"], impact: "neutral",
    summary: "首部综合性金融法，统一银行、证券、保险监管框架，影响所有金融消费者" },
  { year: "2026", month: "01", title: "十五五规划纲要发布", dims: ["housing","employment","education","elderly","finance","industry"], impact: "positive",
    summary: "2026-2030国家发展总纲，涵盖共同富裕、科技自立、绿色转型等核心战略" },
  { year: "2026", month: "03", title: "上海十五五规划发布", dims: ["housing","employment","education"], impact: "positive",
    summary: "明确五个新城建设、长三角一体化深化、人才高地打造等重点方向" },
  { year: "2026", month: "07", title: "换房退税政策延续", dims: ["housing"], impact: "positive",
    summary: "个人换购住房退税优惠政策延续至2027年底，改善型购房者持续受益" },
];

/* ── 场景化专题数据（Special Topics）────────────────────── */
export const specialTopics = [
  {
    id: "shanghai_hukou_edu",
    icon: "🎓",
    title: "上海落户与子女教育",
    subtitle: "非沪籍家庭必看：从积分到落户的完整路径",
    tags: ["家长", "非沪籍", "落户", "教育"],
    targetPersona: ["parent", "worker"],
    targetRegion: ["yangtze_delta", "national"],
    relatedTopics: ["medical_insurance", "rental_housing"],

    /* 落户路径 */
    hukouPaths: [
      {
        name: "居转户",
        difficulty: 3,
        timeCost: "7年",
        conditions: ["持居住证满7年", "前4年社保基数1倍及以上，后3年累计36个月2倍及以上", "中级职称或技师资格", "无违法记录"],
        pros: "门槛相对低，覆盖面广",
        cons: "周期长，排队等候约1-2年",
        url: "https://rsj.sh.gov.cn",
      },
      {
        name: "人才引进落户",
        difficulty: 2,
        timeCost: "3-6个月",
        conditions: ["重点机构（高新技术企业、跨国公司地区总部等）在职", "本科及以上学历", "连续2年社保基数2倍及以上", "单位同意推荐"],
        pros: "周期短，全家可随迁",
        cons: "依赖单位名额，需重点机构在职",
        url: "https://rsj.sh.gov.cn",
      },
      {
        name: "留学生落户",
        difficulty: 2,
        timeCost: "2-3个月",
        conditions: ["世界排名前50院校：无社保基数要求，直接落户", "世界排名51-100院校：6个月1倍社保", "其他海外院校：12个月1.5倍社保"],
        pros: "最快路径，条件明确",
        cons: "仅限留学生，回国2年内申请",
        url: "https://rsj.sh.gov.cn",
      },
      {
        name: "应届生直接落户",
        difficulty: 2,
        timeCost: "当年办理",
        conditions: ["应届博士：不限院校，直接落户", "应届硕士：双一流高校，直接落户", "应届本科：双一流且在沪就业，直接落户"],
        pros: "零等待，无社保要求",
        cons: "仅限应届，错过不再补"
      },
      {
        name: "投靠落户",
        difficulty: 1,
        timeCost: "5-10年",
        conditions: ["配偶投靠：结婚满10年+配偶沪籍满10年", "子女投靠：父母一方沪籍满5年", "老人投靠：子女沪籍满10年+老人已退休"],
        pros: "无需学历/社保",
        cons: "等待时间最长"
      },
    ],

    /* 子女入学条件链 */
    enrollmentChain: [
      {
        hukouStatus: "沪籍",
        stage: "幼儿园",
        policy: "对口幼儿园优先，统筹安排",
        score: "无限制",
        tips: "关注学区划分变化，多校划片政策可能影响对口学校"
      },
      {
        hukouStatus: "沪籍",
        stage: "小学/初中",
        policy: "对口公办学校免试就近入学",
        score: "无限制",
        tips: "注意「五年一户」政策：同一房产5年内只安排1个对口入学名额"
      },
      {
        hukouStatus: "沪籍",
        stage: "中考/高考",
        policy: "正常参加上海中考和高考",
        score: "无限制",
        tips: "上海高考竞争相对较小，本科录取率约70%+"
      },
      {
        hukouStatus: "非沪籍+积分120分",
        stage: "幼儿园",
        policy: "可申请公办幼儿园，统筹安排",
        score: "居住证积分≥120分",
        tips: "本科60分+年龄30分+社保年限+其他加分项"
      },
      {
        hukouStatus: "非沪籍+积分120分",
        stage: "小学/初中",
        policy: "可就读公办学校，统筹安排",
        score: "居住证积分≥120分",
        tips: "热门学校优先安排沪籍，非沪籍可能被统筹到较远学校"
      },
      {
        hukouStatus: "非沪籍+积分120分",
        stage: "中考/高考",
        policy: "可参加上海中考和高考",
        score: "居住证积分≥120分",
        tips: "这是非沪籍家庭最关键的门槛！积分必须在孩子中考报名前达标"
      },
      {
        hukouStatus: "非沪籍+积分不足",
        stage: "幼儿园/小学/初中",
        policy: "可就读公办，但排位靠后",
        score: "积分<120分",
        tips: "优先安排沪籍和积分达标家庭，剩余学位统筹安排"
      },
      {
        hukouStatus: "非沪籍+积分不足",
        stage: "中考/高考",
        policy: "不能参加上海中高考，必须回原籍",
        score: "积分<120分",
        tips: "这是最严重的后果！建议最迟在孩子初中前解决落户或积分问题"
      },
    ],

    /* 积分计算要素 */
    pointsCalc: {
      items: [
        { name: "年龄", max: 30, detail: "43周岁以下30分，43-56每增加1岁减2分" },
        { name: "学历", max: 110, detail: "大专50 | 本科60 | 硕士100 | 博士110" },
        { name: "职称/技能", max: 140, detail: "五级15 | 四级30 | 三级60 | 二级100 | 一级140" },
        { name: "社保年限", max: 48, detail: "每满1年积3分，最高48分（16年）" },
        { name: "社保基数", max: 120, detail: "80%基数0分 | 1倍25分 | 2倍100分 | 3倍120分" },
        { name: "紧缺专业", max: 30, detail: "属于紧缺专业目录+30分" },
        { name: "投资纳税", max: 120, detail: "近3年平均每年纳税10万+10分，每增加5万+10分" },
      ],
      passLine: 120,
      tip: "本科(60) + 年龄30岁以下(30) + 社保5年(15) + 社保基数1倍(25) = 130分 ✅"
    },

    /* 关键时间节点 */
    keyDates: [
      { date: "每年5月", event: "居住证积分申请受理期", urgency: "high", action: "提前3个月准备材料" },
      { date: "每年11月", event: "中考报名开始", urgency: "high", action: "确保积分或落户在此前完成" },
      { date: "每年12月", event: "高考报名开始", urgency: "high", action: "确保落户或积分在此前完成" },
      { date: "每年4月", event: "居转户批次受理", urgency: "medium", action: "材料准备提前半年" },
      { date: "持续", event: "人才引进随时申请", urgency: "medium", action: "重点机构名额有限，尽早申请" },
    ],

    /* 专题行动清单 */
    actionItems: [
      {
        id: "hukou_check_points",
        title: "计算你的居住证积分",
        urgency: "immediate",
        steps: [
          "登录「上海人力资源和社会保障自助经办系统」",
          "进入积分模拟打分页面",
          "确认你的总分是否达到120分",
        ],
        tips: "本科+30岁以下+社保5年+1倍基数 = 约130分，基本达标",
        link: "https://ggfw.rsj.sh.gov.cn",
      },
      {
        id: "hukou_choose_path",
        title: "确定最适合你的落户路径",
        urgency: "immediate",
        steps: [
          "评估你的学历、社保年限、收入水平",
          "对比5条落户路径的门槛和周期",
          "如果孩子在5年内要中高考，优先选择人才引进或留学生路径",
        ],
        tips: "居转户7年周期太长，如果孩子已经上小学，可能来不及",
      },
      {
        id: "hukou_apply_points",
        title: "申请居住证积分（如未落户）",
        urgency: "soon",
        steps: [
          "确认居住证在有效期内",
          "准备学历认证、社保证明、劳动合同等材料",
          "通过单位提交积分申请",
          "审批周期约20个工作日",
        ],
        tips: "积分达标后孩子可在上海参加中高考，这是落户前的「保底方案」",
      },
      {
        id: "hukou_check_school",
        title: "确认子女入学资格和学区",
        urgency: "soon",
        steps: [
          "查询你所在区的学区划分地图",
          "确认「五年一户」是否影响你的对口学校",
          "非沪籍家庭确认积分是否已达标",
        ],
        tips: "热门学校沪籍优先，非沪籍可能被统筹安排",
      },
      {
        id: "hukou_timeline",
        title: "制定落户时间表",
        urgency: "watch",
        steps: [
          "倒推孩子中高考时间（中考约15岁，高考约18岁）",
          "计算从现在到落户完成需要的时间",
          "确保落户/积分完成时间早于中高考报名",
        ],
        tips: "上海中考报名通常在11月，高考在12月，必须提前完成",
      },
    ],

    /* 常见问题 */
    faq: [
      {
        q: "居住证积分120分，孩子就能在上海高考吗？",
        a: "是的。居住证积分达标（120分）的子女，可以在上海参加中考和高考，与沪籍考生享受同等待遇。但注意：积分必须在中高考报名截止前达标。"
      },
      {
        q: "居转户7年太久了，有没有更快的方法？",
        a: "有。人才引进落户最快3-6个月，留学生落户2-3个月，应届生直接落户当年办理。建议根据学历和单位条件选择最快路径。"
      },
      {
        q: "「五年一户」是什么意思？",
        a: "上海部分区实行「五年一户」政策：同一套房产在5年内只安排1个对口入学名额（双胞胎/二胎除外）。如果买学区房，务必确认前业主是否占用名额。"
      },
      {
        q: "非沪籍孩子在上海读高中有什么限制？",
        a: "如果积分达标，可以正常参加中考，录取与沪籍一致。如果积分不达标，只能报考中专/职校，不能报考普通高中。这是最重要的分水岭。"
      },
    ],
  },
  /* ── 专题2：医保报销指南 ─────────────────────────── */
  {
    id: "medical_insurance",
    relatedTopics: ["shanghai_hukou_edu", "rental_housing"],
    icon: "🏥",
    title: "医保报销完全指南",
    subtitle: "门诊、住院、大病、异地就医——一文看懂你能报多少",
    tags: ["医保", "报销", "异地就医", "职工医保"],
    targetPersona: ["worker", "freelancer", "parent"],
    targetRegion: ["yangtze_delta", "national"],
    sections: [
      {
        type: "comparison",
        title: "职工医保 vs 居民医保",
        headers: ["项目", "职工医保", "居民医保"],
        rows: [
          ["缴费方式", "单位+个人共同缴纳", "个人缴费+政府补贴"],
          ["月缴费额", "约500-2000元/月", "约500-1000元/年"],
          ["门诊报销", "起付线500元，报50-70%", "起付线300元，报50-60%"],
          ["住院报销", "起付线1500元，报85-92%", "起付线1500元，报70-80%"],
          ["个人账户", "✅ 有，可用于门诊/药店", "❌ 无"],
          ["大病保险", "✅ 自动覆盖", "✅ 自动覆盖"],
          ["适用人群", "在职职工/灵活就业", "学生/老人/无业"],
        ],
      },
      {
        type: "calc_table",
        title: "上海住院报销比例速查",
        headers: ["医院等级", "起付线", "在职报销", "退休报销"],
        rows: [
          ["三级医院", "1500元", "85%", "92%"],
          ["二级医院", "1000元", "87%", "92%"],
          ["一级/社区", "300元", "90%", "92%"],
          ["家庭病床", "300元", "90%", "92%"],
        ],
        note: "年度最高支付限额：56万元（统筹基金+附加基金）",
      },
      {
        type: "process",
        title: "异地就医备案流程",
        steps: [
          { title: "线上备案", detail: "登录「国家医保服务平台」APP → 异地就医备案 → 选择就医地 → 提交" },
          { title: "审核通过", detail: "通常1-3个工作日审核通过，可在APP查看进度" },
          { title: "直接结算", detail: "备案成功后，在异地定点医院可直接刷卡结算，无需回沪报销" },
          { title: "注意事项", detail: "异地急诊可先就医后补备案；转诊转院需原医院开转诊单" },
        ],
      },
      {
        type: "action_list",
        title: "医保行动清单",
        items: [
          { id: "mi_check", title: "确认你的医保类型和状态", urgency: "immediate",
            steps: ["登录「随申办」APP查看医保账户", "确认是职工医保还是居民医保", "检查个人账户余额"] },
          { id: "mi_file", title: "办理异地就医备案（如需）", urgency: "soon",
            steps: ["下载「国家医保服务平台」APP", "填写异地就医备案申请", "等待审核通过（1-3个工作日）"] },
          { id: "mi_family", title: "开通家庭共济账户", urgency: "soon",
            steps: ["登录「随申办」APP", "将配偶/子女/父母绑定为共济对象", "家人看病可用你的个人账户余额"] },
          { id: "mi_supplement", title: "评估是否需要补充商业医保", urgency: "watch",
            steps: ["了解「沪惠保」等补充医疗保险", "评估你的大病风险", "考虑家庭整体保障方案"] },
        ],
      },
      {
        type: "tips",
        title: "医保常见误区",
        items: [
          { title: "❌ 医保断缴3个月就清零", tip: "谣言！断缴后个人账户余额不会清零，但统筹报销资格会暂停。重新缴纳后有等待期（一般6个月），等待期内不能报销。" },
          { title: "❌ 医保报销不限医院", tip: "错误！必须在医保定点医院就医才能报销。非定点医院（除急诊外）不予报销。可在「随申办」APP查询定点医院名单。" },
          { title: "❌ 个人账户可以取现", tip: "错误！医保个人账户只能用于支付门诊费、药店购药、住院自付部分，不能提取现金。2024年起可通过家庭共济给家人使用。" },
          { title: "❌ 大病保险需要单独购买", tip: "错误！大病保险自动覆盖所有基本医保参保人，无需额外购买。年度自负超过起付线（约2.5万）后自动启动报销。" },
          { title: "❌ 异地就医完全不能报销", tip: "过时！2022年起全国已实现异地就医直接结算。只需提前在「国家医保服务平台」APP办理异地备案，即可在异地定点医院直接刷卡。" },
        ],
      },
      {
        type: "detail",
        title: "上海门诊特殊病种报销",
        items: [
          { name: "恶性肿瘤门诊治疗", conditions: ["门诊化疗/放疗/靶向治疗", "报销比例同住院（85-92%）", "需在定点医院登记"], note: "无需住院也可享受住院报销比例" },
          { name: "尿毒症透析", conditions: ["门诊血透/腹透", "报销比例同住院", "每月透析10-15次"], note: "上海透析患者约1.5万人，年治疗费约10万，报销后自付约1-2万" },
          { name: "肾移植抗排异治疗", conditions: ["术后抗排异药物", "报销比例同住院", "需长期服药"], note: "抗排异药物每月约3000-5000元，报销后自付约500-800元" },
          { name: "精神病门诊治疗", conditions: ["精神分裂症等严重精神障碍", "门诊报销比例提高至90%", "社区精防门诊免费"], note: "上海社区精神卫生中心提供免费随访和基本药物" },
        ],
      },
      {
        type: "faq",
        title: "常见问题",
        items: [
          { q: "医保个人账户的钱可以取出来吗？", a: "不能取现。可用于支付门诊费、药店购药、住院自付部分。2024年起可通过家庭共济给家人使用。" },
          { q: "离职后医保怎么续？", a: "离职后可按灵活就业身份继续参加职工医保，或转为居民医保。断缴超过3个月会有6个月等待期，建议尽快续缴。" },
          { q: "大病保险怎么报销？", a: "大病保险自动覆盖，无需单独申请。年度自负部分超过起付线（约2.5万）后，大病保险自动启动，报销60-80%。" },
          { q: "沪惠保值得买吗？", a: "沪惠保年费约129元，覆盖特定高额药品和质子重离子治疗。适合有重大疾病风险或已患特定疾病的人群。健康人群性价比一般。" },
        ],
      },
    ],
  },
  /* ── 专题3：职场权益计算器 ─────────────────────── */
  {
    id: "workplace_rights",
    icon: "💼",
    title: "职场权益计算器",
    subtitle: "被裁员能拿多少赔偿？年假还剩几天？一键计算你的合法权益",
    tags: ["裁员赔偿", "年假", "加班费", "失业金"],
    targetPersona: ["worker", "freelancer"],
    targetRegion: ["national"],
    relatedTopics: ["tax_optimization", "medical_insurance"],
    calculators: [
      {
        id: "severance",
        title: "N+1 裁员赔偿计算",
        inputs: [
          { key: "years", label: "工作年限", type: "number", default: 5, unit: "年" },
          { key: "salary", label: "月平均工资", type: "number", default: 15000, unit: "元" },
          { key: "notice", label: "是否提前30天通知", type: "boolean", default: false },
        ],
        formula: (v) => {
          const n = v.years;
          const base = n * v.salary;
          const plus1 = v.notice ? 0 : v.salary;
          const cap = 3 * 12183; // 社平工资3倍上限
          const monthlySalary = Math.min(v.salary, cap);
          const total = n * monthlySalary + plus1;
          return {
            economic: base,
            plus1,
            total,
            breakdown: `N=${n}年 × 月薪${monthlySalary.toLocaleString()}元 = ${(n*monthlySalary).toLocaleString()}元` + (plus1 > 0 ? ` + 代通知金${plus1.toLocaleString()}元` : ''),
            note: v.salary > cap ? `注意：月薪超过社平工资3倍(${cap.toLocaleString()}元)，按上限计算` : '',
          };
        },
      },
      {
        id: "annual_leave",
        title: "法定年假天数",
        inputs: [
          { key: "totalYears", label: "累计工作年限（含所有单位）", type: "number", default: 10, unit: "年" },
        ],
        formula: (v) => {
          const y = v.totalYears;
          const days = y < 1 ? 0 : y < 10 ? 5 : y < 20 ? 10 : 15;
          return { days, note: `累计工作${y}年，法定年假${days}天。未休年假可按日工资的300%折算。` };
        },
      },
      {
        id: "overtime",
        title: "加班费计算",
        inputs: [
          { key: "salary", label: "月工资", type: "number", default: 15000, unit: "元" },
          { key: "workdayHours", label: "工作日加班小时数", type: "number", default: 0, unit: "小时" },
          { key: "weekendHours", label: "周末加班小时数", type: "number", default: 0, unit: "小时" },
          { key: "holidayHours", label: "法定节假日加班小时数", type: "number", default: 0, unit: "小时" },
        ],
        formula: (v) => {
          const hourly = v.salary / 21.75 / 8;
          const wd = v.workdayHours * hourly * 1.5;
          const we = v.weekendHours * hourly * 2;
          const hd = v.holidayHours * hourly * 3;
          return {
            total: Math.round(wd + we + hd),
            breakdown: `工作日: ${Math.round(wd)}元(1.5倍) | 周末: ${Math.round(we)}元(2倍) | 节假日: ${Math.round(hd)}元(3倍)`,
            hourly: Math.round(hourly * 100) / 100,
          };
        },
      },
      {
        id: "unemployment",
        title: "失业金申领",
        inputs: [
          { key: "contributionYears", label: "失业保险缴费年限", type: "number", default: 5, unit: "年" },
        ],
        formula: (v) => {
          const y = v.contributionYears;
          const months = y < 1 ? 0 : y < 5 ? 12 : y < 10 ? 18 : 24;
          const monthly = 2175; // 上海2024年标准
          return {
            months,
            monthly,
            total: months * monthly,
            note: `缴费${y}年，可领取${months}个月失业金，每月${monthly}元，共${(months*monthly).toLocaleString()}元`,
            conditions: ["非因本人意愿中断就业", "已办理失业登记", "有求职要求"],
          };
        },
      },
    ],
    sections: [
      {
        type: "comparison",
        title: "正式员工 vs 劳务派遣 vs 外包 vs 实习",
        headers: ["权益项目", "正式员工", "劳务派遣", "外包", "实习"],
        rows: [
          ["劳动合同", "必须签订", "与派遣公司签", "无（与外包公司）", "实习协议"],
          ["社保缴纳", "单位必须缴纳", "派遣公司缴纳", "外包公司缴纳", "不强制"],
          ["加班费", "1.5/2/3倍", "同正式员工", "按外包协议", "无"],
          ["带薪年假", "法定5-15天", "同正式员工", "按协议", "无"],
          ["工伤认定", "单位申报", "派遣公司申报", "外包公司申报", "按协议"],
          ["解雇赔偿", "N+1或2N", "退回派遣公司", "按外包协议", "无赔偿"],
          ["最低工资", "受保护", "同工同酬", "不受最低工资保护", "不低于80%"],
          ["转正机会", "—", "用工单位可转正", "无", "毕业后可签"],
        ],
      },
      {
        type: "process",
        title: "劳动仲裁维权流程",
        steps: [
          { title: "收集证据", detail: "保存劳动合同、工资条、考勤记录、工作邮件、聊天记录等，越详细越好" },
          { title: "协商调解", detail: "先与用人单位协商，或申请企业内部调解委员会/街道调解（非必经程序）" },
          { title: "申请仲裁", detail: "向用人单位所在地劳动仲裁委员会提交仲裁申请（免费），时效为1年" },
          { title: "开庭审理", detail: "仲裁庭受理后45日内作出裁决，复杂案件可延长15日" },
          { title: "裁决执行", detail: "裁决生效后，如单位不履行，可向法院申请强制执行" },
        ],
      },
      {
        type: "tips",
        title: "职场维权常见误区",
        items: [
          { title: "❌ 试用期不用交社保", tip: "错误！试用期也必须缴纳社保。《劳动合同法》规定，劳动关系自用工之日起建立，试用期内用人单位同样有义务缴纳社保。" },
          { title: "❌ 加班必须自愿", tip: "错误！用人单位不得强迫加班。每日加班不超3小时，每月不超36小时。超过部分必须支付加班费或安排补休。" },
          { title: "❌ 竞业限制覆盖所有离职员工", tip: "错误！竞业限制仅适用于高管、高级技术人员和负有保密义务的人员。普通员工签的竞业限制协议可能无效。" },
          { title: "❌ 被辞退拿不到失业金", tip: "错误！非因本人意愿中断就业（含被辞退、合同到期不续签等）均可申领失业金，每月2175元（上海标准）。" },
          { title: "❌ 口头劳动合同无效", tip: "部分错误！口头合同虽不如书面合同有力，但事实劳动关系受法律保护。建议一定要求签订书面合同，否则维权举证困难。" },
        ],
      },
      {
        type: "detail",
        title: "主要城市失业金标准速查",
        items: [
          { name: "上海", conditions: ["失业金2175元/月", "最长24个月", "随申办APP线上申领"], url: "https://rsj.sh.gov.cn", note: "2024年标准，每年调整" },
          { name: "北京", conditions: ["失业金2124元/月", "最长24个月", "北京人社APP申领"], url: "https://rsj.beijing.gov.cn", note: "2024年标准" },
          { name: "深圳", conditions: ["失业金2160元/月", "最长24个月", "i深圳APP申领"], url: "https://hrss.sz.gov.cn", note: "与最低工资挂钩" },
          { name: "杭州", conditions: ["失业金2070元/月", "最长24个月", "浙里办APP申领"], url: "https://hrss.hangzhou.gov.cn", note: "按最低工资90%" },
          { name: "成都", conditions: ["失业金1890元/月", "最长24个月", "天府市民云APP"], url: "https://cdhrss.chengdu.gov.cn", note: "按最低工资90%" },
        ],
      },
      {
        type: "action_list",
        title: "职场权益行动清单",
        items: [
          { id: "wr_contract", title: "检查劳动合同关键条款", urgency: "immediate",
            steps: ["确认合同期限、试用期、竞业限制条款", "检查薪资构成（基本工资+绩效+补贴）", "保留好合同原件和工资条"] },
          { id: "wr_social", title: "核实社保公积金缴纳基数", urgency: "immediate",
            steps: ["登录「随申办」查看社保缴纳基数", "对比你的实际工资，确认是否足额缴纳", "如基数低于实际工资，可向劳动监察举报"] },
          { id: "wr_leave", title: "检查年假和加班补偿", urgency: "soon",
            steps: ["确认你的累计工作年限（含所有单位）", "核对未休年假是否已按300%折算", "检查加班是否有记录和补偿"] },
          { id: "wr_evidence", title: "留存维权证据（如风险）", urgency: "watch",
            steps: ["保存工作群聊天记录、邮件往来", "下载工资银行流水", "复印考勤记录和加班审批"] },
        ],
      },
      {
        type: "faq",
        title: "常见问题",
        items: [
          { q: "公司不给我N+1怎么办？", a: "先与公司协商，协商不成可向劳动仲裁委员会申请仲裁（免费），仲裁不服可向法院起诉。仲裁时效为1年，从知道权益被侵害之日起算。" },
          { q: "试用期被辞退有赔偿吗？", a: "试用期被辞退，如果公司不能证明你「不符合录用条件」，属于违法解除，需支付2N赔偿金（即2倍经济补偿金）。" },
          { q: "竞业限制补偿金标准是多少？", a: "上海标准：竞业限制期间，公司每月应支付不低于你离职前12个月平均工资的30%作为补偿。如公司3个月未支付，你可以解除竞业限制。" },
          { q: "公司强制加班不给加班费怎么办？", a: "收集加班证据（考勤记录、工作邮件、聊天记录），向劳动监察部门投诉（12333热线），或申请劳动仲裁要求支付加班费。" },
        ],
      },
    ],
  },
  /* ── 专题4：个税汇算优化指南 ─────────────────── */
  {
    id: "tax_optimization",
    icon: "📊",
    title: "个税年度汇算优化指南",
    subtitle: "手把手教你最大化退税，平均可多退2000-8000元",
    tags: ["个税", "退税", "专项附加扣除", "汇算清缴"],
    targetPersona: ["worker", "freelancer", "parent"],
    targetRegion: ["national"],
    relatedTopics: ["workplace_rights", "rental_housing"],
    sections: [
      {
        type: "deductions",
        title: "七大专项附加扣除速查",
        headers: ["扣除项", "标准", "条件", "常见误区"],
        rows: [
          ["子女教育", "2000元/月/每个子女", "3岁至博士", "夫妻双方可各扣50%或一方扣100%"],
          ["继续教育", "400元/月 或 3600元/年", "学历/职业资格", "同一学历最长48个月"],
          ["大病医疗", "据实扣除，上限8万/年", "自负超1.5万部分", "汇算时统一扣除，不能预扣"],
          ["房贷利息", "1000元/月", "首套房贷", "最长240个月，夫妻双方约定"],
          ["住房租金", "800-1500元/月", "无自有住房", "与房贷利息二选一"],
          ["赡养老人", "3000元/月", "60岁以上父母", "独生子女扣全额，非独生分摊"],
          ["婴幼儿照护", "2000元/月/每个子女", "0-3岁", "2022年起新增，与子女教育不重叠"],
        ],
      },
      {
        type: "process",
        title: "年度汇算清缴流程",
        steps: [
          { title: "确认扣除项", detail: "每年3月1日前，在「个人所得税」APP确认/修改专项附加扣除信息" },
          { title: "汇算申报", detail: "3月1日-6月30日期间，在APP中办理年度汇算清缴（3月1-20日需预约）" },
          { title: "系统自动计算", detail: "APP会自动计算应补/应退税额，确认无误后提交" },
          { title: "退税到账", detail: "退税通常10-30个工作日到账，绑定银行卡可自动转入" },
        ],
      },
      {
        type: "tips",
        title: "退税最大化技巧",
        items: [
          { title: "房贷 vs 房租二选一", tip: "如果房贷利息扣除1000元/月，但房租扣除可达1500元/月（一线城市），选房租更划算" },
          { title: "子女教育分配策略", tip: "夫妻收入差距大时，全部由收入高的一方扣除更划算（边际税率更高）" },
          { title: "大病医疗别忘了", tip: "全年自负医疗费超过1.5万的部分可扣除，最高8万。记得保留医疗票据" },
          { title: "个人养老金可额外扣除", tip: "每年存入个人养老金账户最多12000元，可额外税前扣除，相当于省税600-5400元" },
          { title: "年终奖单独计税 vs 并入", tip: "年收入较高时年终奖单独计税更划算；收入较低时并入可能更优，APP会自动对比" },
        ],
      },
      {
        type: "action_list",
        title: "个税优化行动清单",
        items: [
          { id: "tax_check", title: "检查专项附加扣除是否填写完整", urgency: "immediate",
            steps: ["打开「个人所得税」APP", "进入专项附加扣除填报", "逐项检查7大扣除是否都已填写"] },
          { id: "tax_compare", title: "对比房贷/房租扣除哪个更划算", urgency: "soon",
            steps: ["计算房贷利息扣除额：1000元/月 × 12 = 12000元", "计算房租扣除额：1500元/月 × 12 = 18000元（一线城市）", "选择较高的那个"] },
          { id: "tax_pension", title: "开立个人养老金账户并缴满12000元", urgency: "soon",
            steps: ["在银行APP开户", "年度内存入12000元", "汇算时可享受额外扣除"] },
          { id: "tax_file", title: "按时办理年度汇算", urgency: "watch",
            steps: ["每年3月1日起可办理", "6月30日前必须完成", "多退少补，逾期会产生滞纳金"] },
        ],
      },
      {
        type: "faq",
        title: "常见问题",
        items: [
          { q: "年终奖单独计税和并入综合所得哪个更划算？", a: "取决于你的年收入水平。年收入较高（超过36万）时，年终奖单独计税通常更划算。建议在个税APP中两种都试一下，选退税多的。" },
          { q: "自由职业者怎么报税？", a: "自由职业者的收入属于「经营所得」或「劳务报酬」。如果是经营所得，可选择核定征收或查账征收。2026年起税收征管法修订加强高收入群体监管，建议如实申报。" },
          { q: "退税一般多久到账？", a: "提交汇算申请后，税务部门审核通过通常10-30个工作日到账。如遇补税，需在6月30日前缴纳，逾期每日万分之五滞纳金。" },
          { q: "个人养老金退税能省多少？", a: "取决于你的边际税率。年收入12-25万（税率20%）可省2400元；25-36万（税率25%）可省3000元；36-66万（税率30%）可省3600元。" },
        ],
      },
    ],
  },
  /* ── 专题5：保租房/公租房申请指南 ──────────────────── */
  {
    id: "rental_housing",
    icon: "🏘️",
    title: "保租房/公租房申请完全指南",
    subtitle: "公租房、保租房、廉租房、共有产权房——一文看懂上海四大保障住房",
    tags: ["保租房", "公租房", "新市民", "租房补贴"],
    targetPersona: ["worker", "freelancer", "buyer"],
    targetRegion: ["yangtze_delta", "national"],
    relatedTopics: ["shanghai_hukou_edu", "medical_insurance"],

    calculators: [
      {
        id: "rent_savings",
        title: "保障住房租金节省计算",
        inputs: [
          { key: "marketRent", label: "当前市场月租金", type: "number", default: 3000, unit: "元" },
          { key: "housingType", label: "保障住房类型（1=公租房/2=保租房/3=人才公寓）", type: "number", default: 2, unit: "" },
          { key: "months", label: "计划租住月数", type: "number", default: 36, unit: "月" },
        ],
        formula: (v) => {
          const rates = { 1: 0.85, 2: 0.85, 3: 0.70 };
          const names = { 1: "公租房", 2: "保租房", 3: "人才公寓" };
          const rate = rates[v.housingType] || 0.85;
          const name = names[v.housingType] || "保租房";
          const protectedRent = Math.round(v.marketRent * rate);
          const monthlySaving = v.marketRent - protectedRent;
          const totalSaving = monthlySaving * v.months;
          const annualSaving = monthlySaving * 12;
          return {
            name, marketRent: v.marketRent, protectedRent, monthlySaving, totalSaving, annualSaving,
            months: v.months, rate: Math.round(rate * 100),
            note: v.housingType === 3
              ? "人才公寓租金最低（市场价60-80%），但需本科及以上学历"
              : v.housingType === 1
                ? "公租房需排队轮候（一般6-18个月），但租金稳定"
                : "保租房门槛最低，不限户籍和居住证，有房即可申请",
          };
        },
      },
    ],

    sections: [
      {
        type: "comparison",
        title: "四大保障住房速查对比",
        headers: ["项目", "公租房", "保租房", "廉租房", "共有产权房"],
        rows: [
          ["性质", "政府筹建租赁住房", "保障性租赁住房", "政府租赁住房", "购买产权"],
          ["对象", "青年职工、引进人才", "新市民、青年人", "低收入家庭", "无房家庭"],
          ["户籍要求", "沪籍或居住证", "不限户籍、不限居住证", "沪籍", "沪籍"],
          ["收入限制", "无", "无", "有（人均可支配收入）", "有"],
          ["住房要求", "人均<15㎡", "一定区域无房", "无房或极困难", "无房"],
          ["租金/价格", "市场价80-90%", "市场价85%以下", "极低（政府定价）", "同地段50-70%"],
          ["面积", "30-50㎡", "70㎡以下", "50㎡以下", "60-90㎡"],
          ["期限", "3年（可续租）", "最长6年", "3年（可续租）", "取得产权后5年可转让"],
          ["申请方式", "随申办APP", "直接联系运营方", "随申办APP", "随申办APP"],
        ],
      },
      {
        type: "detail",
        title: "公租房详细",
        items: [
          {
            name: "市筹公租房",
            conditions: ["沪籍或持有有效居住证", "与本市单位签1年+劳动合同", "人均住房面积<15㎡", "未享受廉租房、共有产权房"],
            rent: "略低于市场价（约80-90%）",
            area: "一居室30-50㎡",
            term: "3年，可续租",
            apply: "随申办APP线上申请，全市通办",
            url: "https://zwdt.sh.gov.cn/govPortals/bsfw/item/d8430993-869a-4a17-b505-d882894b0fba",
            note: "市筹不受区域限制，可在任何区申请"
          },
          {
            name: "区筹公租房",
            conditions: ["沪籍或持有有效居住证", "在本区有稳定工作", "人均住房面积<15㎡"],
            rent: "略低于市场价",
            area: "一居室30-50㎡，部分有二居室",
            term: "3年，可续租",
            apply: "向所在区公租房受理机构申请",
            url: "https://zwdt.sh.gov.cn/govPortals/bsfw/item/1eb55dc5-6977-40de-b801-50fdcfbe5df0",
            note: "区筹一般限本区户籍或工作地在本区"
          },
        ],
      },
      {
        type: "detail",
        title: "保租房详细",
        items: [
          {
            name: "保障性租赁住房（保租房）",
            conditions: ["主申请人在本市合法就业", "申请家庭在本市一定区域无自有住房", "不限户籍、不限居住证"],
            rent: "低于同地段市场租金（约85%以下）",
            area: "70㎡以下，小户型为主",
            term: "最长6年",
            apply: "直接联系项目运营方申请，无需通过政府审核",
            url: "https://zjw.sh.gov.cn/xwfb/20250120/1ab253f105b3431e8db7bfb87446652d.html",
            note: "门槛最低，是上海新市民和青年人的首选"
          },
          {
            name: "人才公寓",
            conditions: ["全日制本科及以上学历", "与本市单位签劳动合同", "在本市无自有住房", "部分区要求缴纳社保满6个月"],
            rent: "市场价60-80%",
            area: "30-70㎡",
            term: "1-3年",
            apply: "通过各区人才服务平台或所在单位申请",
            note: "部分区有租房补贴，每月300-3000元不等"
          },
        ],
      },
      {
        type: "process",
        title: "公租房申请流程",
        steps: [
          { title: "线上申请", detail: "打开「随申办」APP → 搜索「公租房」→ 填写申请信息 → 上传材料（身份证、劳动合同、居住证等）→ 提交" },
          { title: "街道初审", detail: "街道/镇住房保障机构受理申请，进行初审（约20个工作日）" },
          { title: "区房管局复审", detail: "区住房保障和房屋管理局复审（约10个工作日），公示审核结果" },
          { title: "轮候选房", detail: "获得准入资格后进入轮候库，有空房时按轮候顺序选房签约" },
          { title: "签订合同", detail: "与公租房运营机构签订租赁合同，办理入住" },
        ],
      },
      {
        type: "calc_table",
        title: "公租房 vs 保租房租金对比参考",
        headers: ["区域", "市场租金(30㎡)", "公租房租金", "保租房租金", "月省金额"],
        rows: [
          ["内环内", "约3500元/月", "约2800-3150元", "约2975元以下", "约350-700元"],
          ["内环外", "约2500元/月", "约2000-2250元", "约2125元以下", "约250-500元"],
          ["外环外", "约1800元/月", "约1440-1620元", "约1530元以下", "约180-360元"],
        ],
        note: "以上为参考价格，实际租金因项目、楼层、装修等因素而异。保租房租金不超过同地段市场租金的85%。",
      },
      {
        type: "action_list",
        title: "保障住房行动清单",
        items: [
          { id: "rh_check_eligibility", title: "确认你符合哪种保障住房条件", urgency: "immediate",
            steps: ["核对你的人均住房面积是否<15㎡（公租房）", "确认你是否有居住证（公租房要求）", "评估你的户籍情况（保租房不限户籍）"],
            tips: "保租房门槛最低，不限户籍和居住证，只需在沪合法就业且无房" },
          { id: "rh_search_housing", title: "查找你附近的保障房源", urgency: "immediate",
            steps: ["打开「随申办」APP搜索「公租房」查看房源", "关注各区住建局官网发布的保租房项目", "关注轨交站点附近、产业园区周边的新项目"],
            tips: "轨交站点附近和五个新城的保租房项目最多，性价比最高" },
          { id: "rh_apply_gzf", title: "申请公租房（如符合条件）", urgency: "soon",
            steps: ["通过「随申办」APP提交申请", "准备材料：身份证、居住证、劳动合同、社保缴纳证明", "耐心等待轮候，一般需6-12个月"],
            tips: "市筹公租房可全市通办，区筹公租房限本区" },
          { id: "rh_apply_bzf", title: "直接联系保租房项目申请", urgency: "soon",
            steps: ["搜索你所在区域的保租房项目", "直接联系项目运营方（如城投宽庭、陆家嘴锦绣等）", "无需通过政府审核，门槛更低"],
            tips: "保租房无需排队，有房源即可直接申请，非常适合刚到上海的新市民" },
          { id: "rh_rental_subsidy", title: "了解租房补贴政策", urgency: "watch",
            steps: ["确认你所在区是否有租房补贴政策", "人才公寓租金可低至市场价60-80%", "部分区对应届毕业生有租房补贴"],
            tips: "各区人才公寓和租房补贴政策不同，建议咨询所在单位HR或区人才服务中心" },
        ],
      },
      {
        type: "faq",
        title: "常见问题",
        items: [
          { q: "公租房和保租房可以同时申请吗？", a: "不可以。同一时间只能享受一种住房保障。建议优先申请保租房（门槛低、无需排队），如果有沪籍或居住证且面积符合条件，可同时申请公租房进入轮候。" },
          { q: "公租房可以买下来吗？", a: "不可以。公租房只能租赁，不能购买。如果希望购买保障房，可以考虑共有产权房（需沪籍且无房）。" },
          { q: "保租房租金会涨吗？", a: "保租房租金涨幅受政府监管，一般每年涨幅不超过5%。首次定价时需低于同地段市场租金的85%。" },
          { q: "我只有居住证，没有沪籍，能申请哪种？", a: "居住证持有者可申请公租房（市筹或区筹）。不限户籍的保租房门槛更低，只需在沪合法就业且无房即可申请。" },
          { q: "公租房轮候要等多久？", a: "取决于所在区和房源情况，一般需要6-18个月。部分偏远或新建成项目轮候时间较短。" },
          { q: "申请公租房会影响购房资格吗？", a: "不影响。公租房和购房资格是独立的。但如果享受公租房期间购买了住房，需要退出公租房。" },
        ],
      },
    ],
  },
  /* ── 专题6：养老金规划指南 ─────────────────────── */
  {
    id: "pension_planning",
    icon: "👴",
    title: "养老金规划完全指南",
    subtitle: "延迟退休、个人养老金、长护险——一文看懂你的养老钱袋子",
    tags: ["养老金", "延迟退休", "个人养老金", "长护险"],
    targetPersona: ["worker", "freelancer", "elder"],
    targetRegion: ["national"],
    relatedTopics: ["medical_insurance", "tax_optimization"],
    sections: [
      { type: "comparison", title: "三支柱养老体系", headers: ["支柱", "内容", "缴费", "特点"], rows: [["第一支柱", "基本养老保险", "单位16%+个人8%", "强制、广覆盖、保基本"], ["第二支柱", "企业/职业年金", "单位+个人共同缴费", "补充养老、单位福利"], ["第三支柱", "个人养老金", "个人自愿缴费", "税优激励、自主投资"]] },
      { type: "action_list", title: "养老规划行动清单", items: [
        { id: "pp_check", title: "查询你的养老金账户", urgency: "immediate", steps: ["登录「国家社会保险公共服务平台」", "查看养老保险累计缴费年限", "估算退休后每月养老金"] },
        { id: "pp_personal", title: "开通个人养老金账户", urgency: "soon", steps: ["在银行APP开通个人养老金账户", "每年最多缴存12000元", "选择适合的养老金融产品"] },
        { id: "pp_tax", title: "享受个人养老金税优", urgency: "soon", steps: ["缴存后在个税APP申报扣除", "最高税率档每年节税5400元", "退休领取时按3%缴税"] },
      ]},
      { type: "faq", title: "常见问题", items: [
        { q: "个人养老金每年最多存多少？", a: "每年最多缴存12000元，可一次性或分次缴存。缴存金额可在个税前扣除。" },
        { q: "个人养老金可以买什么产品？", a: "可购买储蓄存款、理财产品、商业养老保险、公募基金等。建议选择长期稳健型产品。" },
        { q: "灵活就业人员怎么参加养老保险？", a: "以灵活就业身份参加职工养老保险，缴费比例20%（全部个人承担），可在就业地直接参保。" },
      ]},
    ],
  },
  /* ── 专题7：创业补贴申请指南 ───────────────────── */
  {
    id: "startup_subsidies",
    icon: "🚀",
    title: "创业补贴申请完全指南",
    subtitle: "小微企业税收优惠、创业担保贷款、场地补贴——一文看懂你能拿多少",
    tags: ["创业", "小微企业", "税收优惠", "创业贷款"],
    targetPersona: ["startup", "freelancer"],
    targetRegion: ["national"],
    relatedTopics: ["tax_optimization", "workplace_rights"],
    sections: [
      { type: "comparison", title: "创业者可享受的主要补贴", headers: ["补贴类型", "金额/比例", "申请条件", "申请渠道"], rows: [["小微企业税收优惠", "实际税负5%", "年应纳税所得额≤300万", "税务局自动享受"], ["创业担保贷款", "最高300万", "登记失业/高校毕业生等", "人社局/街道"], ["一次性创业补贴", "5000-20000元", "首次创业+正常经营6月+", "人社局"], ["场地租金补贴", "每月500-2000元", "入驻创业孵化基地", "孵化基地/人社局"]] },
      { type: "action_list", title: "创业补贴申请行动清单", items: [
        { id: "ss_register", title: "完成工商注册和税务登记", urgency: "immediate", steps: ["选择企业类型（个体户/有限公司）", "完成工商注册", "办理税务登记"] },
        { id: "ss_tax", title: "确认小微企业资格", urgency: "immediate", steps: ["确认从业人数≤300人", "确认资产总额≤5000万", "确认从事非限制行业"] },
        { id: "ss_loan", title: "申请创业担保贷款", urgency: "soon", steps: ["向当地人社局咨询", "准备商业计划书", "提交贷款申请"] },
      ]},
      { type: "faq", title: "常见问题", items: [
        { q: "创业担保贷款需要什么条件？", a: "一般需要：登记失业人员/高校毕业生/返乡创业农民工等身份+创业项目可行+信用良好。具体条件各地略有差异。" },
        { q: "小微企业税收优惠需要申请吗？", a: "不需要！符合条件的小微企业在纳税申报时自动享受，无需单独申请。" },
        { q: "大学生创业有什么特殊优惠？", a: "高校毕业生创业可享受：创业担保贷款、一次性创业补贴、税收优惠、场地补贴、创业培训补贴等。毕业5年内均可申请。" },
      ]},
    ],
  },
  /* ── 专题8：大湾区跨境生活指南 ─────────────────── */
  {
    id: "greater_bay_life",
    icon: "🌉",
    title: "大湾区跨境生活指南",
    subtitle: "港澳居民内地生活、跨境理财通、社保医保——一文看懂大湾区便利政策",
    tags: ["大湾区", "跨境", "港澳居民", "理财通"],
    targetPersona: ["worker", "investor", "parent"],
    targetRegion: ["greater_bay"],
    relatedTopics: ["medical_insurance", "pension_planning"],
    sections: [
      { type: "comparison", title: "港澳居民内地生活便利政策", headers: ["领域", "政策内容", "适用人群", "办理渠道"], rows: [["就业", "免办工作许可，直接就业", "港澳居民", "用人单位办理"], ["社保", "可参加内地社保，享受同等待遇", "港澳居民", "社保局"], ["医保", "可参加内地医保，异地就医直接结算", "港澳居民", "医保局"], ["购房", "南沙/前海购房享同等待遇", "港澳居民", "住建局"], ["理财", "跨境理财通2.0，额度300万", "大湾区居民", "银行"]] },
      { type: "action_list", title: "港澳居民内地生活行动清单", items: [
        { id: "gb_residence", title: "办理港澳居民居住证", urgency: "immediate", steps: ["准备港澳居民来往内地通行证", "到居住地派出所申请", "领取居住证（约20个工作日）"] },
        { id: "gb_social", title: "参加内地社会保险", urgency: "soon", steps: ["持居住证到社保局办理", "选择职工社保或灵活就业社保", "享受与内地居民同等待遇"] },
        { id: "gb_bank", title: "开通跨境理财通账户", urgency: "soon", steps: ["确认符合开户条件", "选择合作银行", "办理跨境理财通签约"] },
      ]},
      { type: "faq", title: "常见问题", items: [
        { q: "港澳居民居住证有什么用？", a: "居住证是港澳居民在内地享受公共服务和便利的凭证，可用于办理社保、医保、银行开户、购房、子女入学等。" },
        { q: "跨境理财通有手续费吗？", a: "银行可能收取账户管理费、汇款手续费等。具体费用标准各银行不同，建议开户前咨询。" },
        { q: "港澳居民在内地买房有限制吗？", a: "南沙、前海等合作区已放宽港澳居民购房限制，享受与内地居民同等待遇。其他城市政策各有不同。" },
      ]},
   ],
  },
  /* ── 失业应急包专题 ───────────────────────────── */
  {
    id: "crisis_unemployment",
    icon: "🆘",
    title: "失业应急包：被裁员后的紧急行动指南",
    subtitle: "别慌，这些政策可以帮到你——失业金、公积金提取、社保续缴、医保不断、保租房一站式指南",
    tags: ["失业", "裁员", "应急", "失业金", "公积金提取", "社保续缴"],
    targetPersona: ["worker", "freelancer"],
    targetRegion: ["national"],
    relatedTopics: ["shanghai_hukou_edu", "medical_insurance"],
    crisisMode: true,
    emergencyActions: [
      { step: 1, title: "确认裁员赔偿", desc: "被裁员可获N+1赔偿（工作每满1年补1个月工资）", action: "保存劳动合同、工资条、裁员通知等证据", urgency: "立即", url: "https://www.mohrss.gov.cn" },
      { step: 2, title: "申领失业保险金", desc: "上海标准：2175元/月，最长24个月", action: "离职60天内通过随申办APP线上申领", urgency: "立即", url: "https://rsj.sh.gov.cn" },
      { step: 3, title: "提取住房公积金", desc: "离职后可提取公积金账户余额", action: "封存满6个月后申请提取，或租房可每月提取", urgency: "尽快", url: "https://www.shgjj.com" },
      { step: 4, title: "社保不要断缴", desc: "以灵活就业身份续缴养老+医保", action: "离职当月即办理，避免医保等待期", urgency: "尽快", url: "https://rsj.sh.gov.cn" },
      { step: 5, title: "医保不能断", desc: "断缴超3个月有6个月等待期", action: "离职后立即以灵活就业续缴或参加居民医保", urgency: "立即", url: "https://www.nhsa.gov.cn" },
      { step: 6, title: "住房困难申请保租房", desc: "不限户籍、门槛低、租金低于市场价", action: "通过随申办搜索保租房申请", urgency: "关注", url: "https://zjw.sh.gov.cn" },
    ],
    faqList: [
      { q: "被裁员和主动辞职有什么区别？", a: "被裁员可领失业金+拿N+1赔偿；主动辞职则两者都没有。如果被逼主动离职，一定要拒绝并保留证据。" },
      { q: "失业金能领多少？领多久？", a: "上海标准2175元/月。缴费满1年可领2个月，每多1年加2个月，最长24个月。" },
      { q: "公积金离职后能取吗？", a: "可以。账户封存满6个月后可一次性提取全部余额。租房期间也可每月提取。" },
      { q: "社保断缴会怎样？", a: "养老：累计计算不会作废，但断缴期间不计入缴费年限。医保：断缴超3个月有6个月等待期。购房：上海要求连续缴纳社保。" },
      { q: "灵活就业社保怎么交？", a: "上海已取消户籍限制，携带身份证到社区事务中心或通过随申办线上办理，可缴养老+医保两险。" },
      { q: "被裁员后孩子上学受影响吗？", a: "如果是上海户籍不受影响。非沪籍需确保居住证和社保连续性，断缴可能影响积分和子女入学资格。" },
    ],
    hotlines: [
      { name: "12333 人社热线", desc: "失业金/社保/劳动仲裁咨询", phone: "12333" },
      { name: "12348 法律援助", desc: "劳动纠纷免费法律咨询", phone: "12348" },
      { name: "12329 公积金热线", desc: "公积金提取/转移咨询", phone: "12329" },
      { name: "12393 医保热线", desc: "医保续缴/报销咨询", phone: "12393" },
    ],
  },
  /* ── 决策模拟器数据 ───────────────────────────── */
];

export const decisionScenarios = [
  {
    id: "buy_house",
    icon: "🏠",
    title: "如果我现在买房",
    inputs: [
      { key: "price", label: "房屋总价", type: "number", default: 300, unit: "万元" },
      { key: "gjjBalance", label: "公积金余额", type: "number", default: 5, unit: "万元" },
      { key: "gjjMonthly", label: "公积金月缴存额", type: "number", default: 3000, unit: "元" },
      { key: "hasHukou", label: "是否有上海户口", type: "boolean", default: false },
    ],
    results: (v) => {
      const priceW = v.price;
      const loan = priceW * 0.7;
      const gjjLoan = Math.min(loan, 120); // 公积金最高120万
      const commLoan = loan - gjjLoan;
      const gjjMonthlyPay = gjjLoan * 10000 * 0.0285/12 * Math.pow(1+0.0285/12, 360) / (Math.pow(1+0.0285/12, 360)-1);
      const commMonthlyPay = commLoan * 10000 * 0.035/12 * Math.pow(1+0.035/12, 360) / (Math.pow(1+0.035/12, 360)-1);
      const totalMonthly = gjjMonthlyPay + commMonthlyPay;
      const gjjTotalInterest = gjjMonthlyPay * 360 - gjjLoan * 10000;
      const commTotalInterest = commMonthlyPay * 360 - commLoan * 10000;
      // Pure commercial for full loan amount
      const pureCommMonthly = loan * 10000 * 0.035/12 * Math.pow(1+0.035/12, 360) / (Math.pow(1+0.035/12, 360)-1);
      const pureCommInterest = pureCommMonthly * 360 - loan * 10000;
      const gjjSaving = pureCommInterest - (gjjTotalInterest + commTotalInterest);
      return [
        { label: "月供合计", value: `${Math.round(totalMonthly).toLocaleString()}元/月`, detail: `公积金${Math.round(gjjMonthlyPay).toLocaleString()} + 商贷${Math.round(commMonthlyPay).toLocaleString()}` },
        { label: "30年总利息", value: `${((gjjTotalInterest + commTotalInterest)/10000).toFixed(1)}万元`, detail: `公积金利息${(gjjTotalInterest/10000).toFixed(1)}万 + 商贷利息${(commTotalInterest/10000).toFixed(1)}万` },
        { label: "公积金省息", value: `${(gjjSaving/10000).toFixed(1)}万元`, detail: "相比纯商贷省下的利息", positive: true },
        { label: "个税房贷利息扣除", value: "1000元/月", detail: "首套房贷利息可专项附加扣除", positive: true },
        { label: "换房退税红利", value: v.hasHukou ? "约3-6万元" : "需先解决落户/积分", detail: "1年内完成置换可退已缴个税", positive: true },
        { label: v.hasHukou ? "购房资格" : "购房资格风险", value: v.hasHukou ? "✅ 沪籍可买2套" : "⚠️ 非沪籍外环外1套/外环内需积分", detail: "建议先确认资格再看房" },
      ];
    },
  },
  {
    id: "start_business",
    icon: "🚀",
    title: "如果我想创业",
    inputs: [
      { key: "monthlyRevenue", label: "预估月营收", type: "number", default: 50000, unit: "元" },
      { key: "currentlyEmployed", label: "目前是否在职", type: "boolean", default: true },
    ],
    results: (v) => {
      const annualRev = v.monthlyRevenue * 12;
      const isSmall = annualRev <= 500 * 10000; // 小规模纳税人500万免征额
      return [
        { label: "增值税", value: isSmall ? "免征（小规模≤500万/年）" : "约" + Math.round(annualRev * 0.01).toLocaleString() + "元", detail: "小规模纳税人月销售额≤10万免征增值税", positive: isSmall },
        { label: "个人所得税", value: "约" + Math.round(annualRev * 0.05).toLocaleString() + "元/年", detail: "个体户经营所得5%-35%超额累进，年应纳税所得额≤3万部分税率5%" },
        { label: "社保", value: v.currentlyEmployed ? "转为灵活就业缴纳" : "按灵活就业缴纳", detail: "养老20%+医保11%，月缴约" + Math.round(12183 * 0.31).toLocaleString() + "元（按社平工资）" },
        { label: "注册流程", value: "3-5个工作日", detail: "市场监管局线上注册→刻章→银行开户→税务登记→社保开户", positive: true },
        { label: "创业担保贷款", value: "最高30万元", detail: "个人创业担保贷款最高30万，期限最长3年，财政贴息", positive: true },
        { label: "个人养老金", value: "建议年存12,000元", detail: "创业者也需规划养老，个人养老金每年可税前扣除12000元", positive: true },
        { label: "风险提示", value: "创业初期收入不稳定", detail: "建议预留6个月生活备用金，社保不要断缴" },
      ];
    },
  },
  {
    id: "study_abroad",
    icon: "✈️",
    title: "如果我要出国留学",
    inputs: [
      { key: "duration", label: "留学时长", type: "number", default: 2, unit: "年" },
      { key: "hasHukou", label: "是否有上海户口", type: "boolean", default: false },
      { key: "annualCost", label: "年留学费用", type: "number", default: 300000, unit: "元" },
    ],
    results: (v) => {
      const totalCost = v.annualCost * v.duration;
      return [
        { label: "总费用预估", value: (totalCost/10000).toFixed(0) + "万元", detail: v.duration + "年 × " + (v.annualCost/10000).toFixed(0) + "万/年（含学费+生活费）" },
        { label: "落户红利", value: v.hasHukou ? "已有沪籍，无影响" : "回国后可直接落户上海", detail: "世界前500院校留学生：回国2年内来沪工作，直接落户（无社保基数要求）", positive: !v.hasHukou },
        { label: "社保断缴影响", value: "建议保持灵活就业缴纳", detail: "留学期间社保断缴不影响累计年限，但影响医保报销资格", positive: false },
        { label: "回国购车免税", value: "可免购置税", detail: "留学生回国1年内购买国产免税车，可免购置税（约省1-3万）", positive: true },
        { label: "创业扶持", value: "各区有专项补贴", detail: "浦东/张江等园区对留学生创业有租金减免和启动资金（5-50万）", positive: true },
        { label: "教育储蓄建议", value: "提前2年开始储备", detail: "建议开设外币账户，关注汇率走势。可考虑教育金保险或基金定投" },
      ];
    },
  },
  {
    id: "have_baby",
    icon: "👶",
    title: "如果我明年生孩子",
    inputs: [
      { key: "monthlySalary", label: "月工资", type: "number", default: 15000, unit: "元" },
      { key: "spouseInsured", label: "配偶是否参加生育保险", type: "boolean", default: true },
    ],
    results: (v) => [
      { label: "生育补贴", value: "10,800元", detail: "每孩每年3600元，发放至3岁", positive: true },
      { label: "生育保险报销", value: "约8,000-15,000元", detail: "产检+分娩费用报销", positive: true },
      { label: "产假工资", value: `约${(v.monthlySalary * 4.5).toLocaleString()}元`, detail: "顺产98天+难产/多胞胎加天数", positive: true },
      { label: "子女教育个税扣除", value: "2000元/月", detail: "0-3岁婴幼儿照护+3岁后子女教育", positive: true },
      { label: "个人养老金建议", value: "年存12,000元", detail: "育儿期间收入可能降低，建议提前储备养老", positive: true },
      { label: "行动建议", value: "确保生育保险连续缴纳", detail: "生育前需连续缴纳生育保险≥12个月" },
    ],
  },
  {
    id: "get_laid_off",
    icon: "⚠️",
    title: "如果我被裁员了",
    inputs: [
      { key: "years", label: "在公司工作年限", type: "number", default: 5, unit: "年" },
      { key: "salary", label: "月平均工资", type: "number", default: 20000, unit: "元" },
      { key: "hasNotice", label: "是否提前30天通知", type: "boolean", default: false },
    ],
    results: (v) => {
      const n = v.years;
      const n1 = v.hasNotice ? n * v.salary : (n + 1) * v.salary;
      return [
        { label: "经济补偿金(N)", value: `${(n * v.salary).toLocaleString()}元`, detail: `${n}年 × ${v.salary.toLocaleString()}元/月`, positive: true },
        { label: "代通知金(+1)", value: v.hasNotice ? "0元（已提前通知）" : `${v.salary.toLocaleString()}元`, detail: "未提前30天通知需支付1个月工资" },
        { label: "合计应得", value: `${n1.toLocaleString()}元`, detail: v.hasNotice ? `N=${n}×${v.salary.toLocaleString()}` : `N+1=${n+1}×${v.salary.toLocaleString()}`, positive: true },
        { label: "失业金", value: `${n >= 10 ? 24 : n >= 5 ? 18 : 12}个月`, detail: `每月2175元，共${(n >= 10 ? 24 : n >= 5 ? 18 : 12) * 2175}元`, positive: true },
        { label: "社保续缴", value: "按灵活就业续缴", detail: "离职后尽快到社保局办理，避免断缴超3个月" },
        { label: "公积金提取", value: "可全额提取", detail: "离职后可申请提取公积金余额" },
      ];
    },
  },
  {
    id: "retire_plan",
    icon: "🧓",
    title: "如果我规划退休",
    inputs: [
      { key: "age", label: "当前年龄", type: "number", default: 35, unit: "岁" },
      { key: "gender", label: "性别", type: "select", options: ["男", "女干部", "女工人"], default: "男" },
      { key: "pensionYears", label: "已缴社保年限", type: "number", default: 10, unit: "年" },
    ],
    results: (v) => {
      const retireAge = v.gender === "男" ? 63 : v.gender === "女干部" ? 58 : 55;
      const yearsToRetire = Math.max(0, retireAge - v.age);
      const totalYears = v.pensionYears + yearsToRetire;
      return [
        { label: "新法定退休年龄", value: `${retireAge}岁`, detail: `渐进式延迟退休后的新退休年龄` },
        { label: "距退休还有", value: `${yearsToRetire}年`, detail: `预计${2026 + yearsToRetire}年退休` },
        { label: "退休时社保年限", value: `${totalYears}年`, detail: `已缴${v.pensionYears}年 + 还需缴${yearsToRetire}年` },
        { label: "养老金预估", value: `约${Math.round((v.pensionYears + yearsToRetire) * v.pensionYears * 150).toLocaleString()}元/月`, detail: `缴费${v.pensionYears + yearsToRetire}年，按当前基数估算`, positive: true },
        { label: "个人养老金建议", value: `年存12,000元`, detail: `距退休${yearsToRetire}年，累计可存${(yearsToRetire * 12000).toLocaleString()}元 + 投资收益`, positive: true },
        { label: "税收优惠累计", value: `约${(yearsToRetire * 3600).toLocaleString()}元`, detail: `按30%边际税率，每年节税3600元`, positive: true },
        { label: "弹性退休", value: "可提前最多3年", detail: "养老金不打折，但缴费年限减少" },
      ];
    },
  },
];
export const rentalQuiz = {
  title: "🏘️ 保障住房资格自测",
  subtitle: "回答几个简单问题，看看你适合哪种保障住房",
  questions: [
    { id: "q1", q: "你有上海户口吗?", yes: "result_gzf", no: "q2" },
    { id: "q2", q: "你有上海居住证吗?", yes: "q3", no: "q4" },
    { id: "q3", q: "你人均住房面积是否小于15㎡?", yes: "result_gzf", no: "result_bzf" },
    { id: "q4", q: "你是否有全日制本科及以上学历?", yes: "result_talent", no: "result_bzf" },
  ],
  results: {
    result_gzf: { icon: "🏢", title: "推荐：公租房", desc: "你有沪籍或居住证且面积符合条件，可申请公租房（市筹或区筹）。租金为市场价80-90%，可续租。", action: "打开随申办APP搜索公租房" },
    result_bzf: { icon: "🏘️", title: "推荐：保租房", desc: "保租房门槛最低，不限户籍和居住证，只需在沪合法就业且无房即可申请。租金低于市场价85%。", action: "联系你附近的保租房项目运营方" },
    result_talent: { icon: "🎓", title: "推荐：人才公寓", desc: "你有本科及以上学历，可申请人才公寓。租金为市场价60-80%，部分区还有租房补贴（每月300-3000元）。", action: "咨询你所在区的人才服务平台或单位HR" },
  },
};

/* ── 生育政策数据（Birth Policy）────────────────── */
export const birthPolicy = {
  maternityLeave: {
    base: 98,
    bonus: { difficult: 15, twins: 15, miscarriage4m: 42, miscarriage2m: 15 },
    regional: { national: 0, yangtze_delta: 60, jingjinji: 60, greater_bay: 80, chengyu: 60 },
  },
  allowance: {
    minInsuranceMonths: 12,
    formula: (salary, days) => Math.round(salary / 30 * days),
  },
  medical: {
    prenatal: { min: 2000, max: 5000, avg: 3500 },
    delivery: {
      normal: { min: 3000, max: 6000, avg: 4500 },
      cesarean: { min: 5000, max: 10000, avg: 7500 },
    },
    reimburseRate: 0.85,
  },
  childcare: { annual: 3600, years: 3, total: 10800 },
  taxDeduction: { infant: 2000, education: 2000 },
  paternityLeave: { national: 15, yangtze_delta: 10, jingjinji: 15, greater_bay: 15, chengyu: 20 },
  plainSummary: {
    title: '生孩子到底能拿多少钱？',
    keyPoints: [
      '产假期间工资照发（生育津贴代替），不会少一分钱',
      '产检+分娩费用报销85%，自己只掏几百到一千多',
      '孩子出生到3岁，每年领3600元育儿补贴',
      '每月个税多扣2000元（婴幼儿照护扣除）',
      '爸爸也有陪产假，工资照发',
    ],
    commonMyths: [
      { myth: '辞职了就没有生育津贴', truth: '错！只要在生育前连续缴纳生育保险满12个月，即使离职也能申领' },
      { myth: '二胎三胎没有补贴', truth: '错！2024年起所有孩次都享受育儿补贴3600元/年，且产假天数相同' },
      { myth: '生育津贴和产假工资不能同时拿', truth: '生育津贴就是产假期间的工资替代，如果津贴低于工资，单位需补差额' },
    ],
  },
};

/* ── 个税优化计算器数据 ────────────────────────────────────── */
export const taxOptimizer = {
  // 综合所得税率表（年度）
  brackets: [
    { min: 0, max: 36000, rate: 0.03, deduction: 0 },
    { min: 36000, max: 144000, rate: 0.10, deduction: 2520 },
    { min: 144000, max: 300000, rate: 0.20, deduction: 16920 },
    { min: 300000, max: 420000, rate: 0.25, deduction: 31920 },
    { min: 420000, max: 660000, rate: 0.30, deduction: 52920 },
    { min: 660000, max: 960000, rate: 0.35, deduction: 85920 },
    { min: 960000, max: Infinity, rate: 0.45, deduction: 181920 },
  ],
  // 免征额
  taxFreeThreshold: 60000, // 5000元/月
  // 专项附加扣除标准（年）
  deductions: {
    childrenEducation: { label: '子女教育', standard: 24000, desc: '每个子女2000元/月，从3岁到博士毕业' },
    continuingEducation: { label: '继续教育', standard: 4800, desc: '学历教育400元/月，职业资格3600元/年' },
    housingLoan: { label: '住房贷款利息', standard: 12000, desc: '首套房贷1000元/月，最长20年' },
    housingRent: { label: '住房租金', standard: 18000, desc: '按城市等级1500/1100/800元/月' },
    elderlyCare: { label: '赡养老人', standard: 36000, desc: '独生子女3000元/月，非独生分摊' },
    infantCare: { label: '3岁以下婴幼儿照护', standard: 24000, desc: '每个婴幼儿2000元/月' },
    seriousIllness: { label: '大病医疗', standard: 80000, desc: '年度自付超1.5万部分，最高8万' },
  },
  // 年终奖单独计税 vs 合并计税策略
  bonusStrategy: {
    standalone: '年终奖单独计税（2027年底前可选）',
    combined: '年终奖并入综合所得',
    tip: '年薪较高时通常单独计税更省，月薪较低时合并更省',
  },
  plainSummary: {
    keyPoints: [
      '7项专项附加扣除最多可扣12.48万/年，相当于月入1万+免税',
      '首套房贷和租房租金只能二选一，选金额大的',
      '年终奖单独计税政策2027年底到期，之后必须并入综合所得',
      '子女教育和婴幼儿照护各2.4万/年，别搞混了——3岁前算照护，3岁后算教育',
      '赡养老人扣除仅限60岁以上父母，岳父母/公婆不算',
    ],
    commonMyths: [
      { myth: '月薪不到5000就不用报税', truth: '年收入超过12万或有副业收入的，即使月薪不到5000也可能需要汇算清缴' },
      { myth: '年终奖越多越好', truth: '年终奖存在"税率跳档"陷阱，多发1元可能多缴几千税——避开3.6万/14.4万/30万等临界点' },
      { myth: '租房和房贷可以同时扣', truth: '住房贷款利息和住房租金只能选一个，选金额高的那个' },
    ],
  },
};

/* ── 养老金估算器数据 ──────────────────────────────────────── */
export const pensionCalc = {
  // 基础参数
  currentPensionAge: { male: 60, female: 55, femaleWorker: 50 },
  // 渐进式延迟退休（2025起每4个月延1个月，2040年目标男63女58）
  delaySchedule: {
    maleTarget: 63, maleDelayMonths: 36, maleStartYear: 2025, maleStepMonths: 4,
    femaleTarget: 58, femaleDelayMonths: 36, femaleStartYear: 2025, femaleStepMonths: 4,
  },
  // 个人账户计发月数
  divisorMonths: {
    50: 195, 55: 170, 60: 139, 63: 116, 65: 101,
  },
  // 社会平均工资增长率（年化）
  avgSalaryGrowth: 0.05,
  // 个人账户利率（年化）
  accountRate: 0.035,
  // 个人缴费比例
  personalRate: 0.08,
  // 基础养老金计发比例（每缴费1年）
  basePensionRate: 0.01,
  // 最低缴费年限
  minContributionYears: 15,
  // 即将提高的最低缴费年限
  futureMinYears: 20,
  // 大白话摘要
  plainSummary: {
    keyPoints: [
      '养老金 = 基础养老金 + 个人账户养老金，两部分相加就是你每月能拿到的钱',
      '基础养老金 ≈ 退休时当地平均工资 × 缴费年限 × 1%，多缴一年多拿1%',
      '个人账户养老金 = 个人账户总额 ÷ 计发月数，60岁退休按139个月算',
      '缴费年限比缴费基数更重要！缴满30年比高薪缴15年拿得多',
      '延迟退休正在推进中，80后大概率63岁（男）或58岁（女）退休',
    ],
    commonMyths: [
      { myth: '缴满15年就不用缴了', truth: '15年是最低门槛，缴15年退休后每月只能拿到很少的钱。而且在职期间单位必须继续缴' },
      { myth: '养老金可以一次性取出', truth: '只有出国定居或死亡等极少数情况可以一次性取出，正常情况下只能按月领取' },
      { myth: '自由职业不用缴养老保险', truth: '灵活就业者可以按个人身份参加职工养老保险，退休后待遇和企业职工一样' },
    ],
  },
};

/* ── 商业化: 专业版功能 ─────────────────────────────────────── */
export const premiumFeatures = [
  { id: "ai_advisor", icon: "🤖", title: "AI 政策顾问", desc: "基于大语言模型的个性化政策解读，7×24小时在线问答", badge: "即将上线" },
  { id: "realtime_push", icon: "🔔", title: "实时政策推送", desc: "政策发布即刻通知，第一时间掌握与你相关的政策变化", badge: "即将上线" },
  { id: "multi_compare", icon: "📊", title: "多方案对比", desc: "同时对比多种决策方案的政策影响，找到最优路径", badge: "即将上线" },
];

/* ── 商业化: 智能推荐 ─────────────────────────────────────── */
export const recommendations = {
  homebuyer: [
    { type: "topic", id: "shanghai_hukou_edu", text: "落户后子女入学条件一览" },
    { type: "scenario", id: "buy_house", text: "模拟你的购房决策影响" },
    { type: "deadline", text: "公积金贷款新政窗口期即将截止" },
  ],
  worker: [
    { type: "topic", id: "workplace_rights", text: "职场权益：加班/社保/竞业限制" },
    { type: "scenario", id: "get_laid_off", text: "万一被裁员，你能拿多少补偿？" },
    { type: "topic", id: "tax_settlement", text: "个税汇算：别忘了这5项扣除" },
  ],
  parent: [
    { type: "topic", id: "shanghai_hukou_edu", text: "沪籍vs非沪籍子女入学对比" },
    { type: "scenario", id: "have_baby", text: "生育政策全解读：补贴+假期+扣除" },
    { type: "topic", id: "medicare_guide", text: "子女医保报销完全指南" },
  ],
  investor: [
    { type: "topic", id: "rental_housing", text: "保租房/公租房投资新机遇" },
    { type: "scenario", id: "retire_plan", text: "个人养老金：每年最多省5400元税" },
    { type: "topic", id: "tax_settlement", text: "投资收益个税优化策略" },
  ],
  freelancer: [
    { type: "scenario", id: "start_business", text: "创业税费全景：增值税+个税+社保" },
    { type: "topic", id: "workplace_rights", text: "灵活就业社保怎么缴最划算" },
    { type: "topic", id: "medicare_guide", text: "自由职业者医保选择指南" },
  ],
};

/* ── 留存: 仪表盘推荐 ─────────────────────────────────────── */
export const dashboardRecommendations = {
  homebuyer: { topics: ["shanghai_hukou_edu", "rental_housing"], scenarios: ["buy_house"] },
  worker: { topics: ["workplace_rights", "tax_settlement"], scenarios: ["get_laid_off"] },
  parent: { topics: ["shanghai_hukou_edu", "medicare_guide"], scenarios: ["have_baby"] },
  investor: { topics: ["rental_housing", "tax_settlement"], scenarios: ["retire_plan"] },
  freelancer: { topics: ["workplace_rights", "medicare_guide"], scenarios: ["start_business"] },
};

/* ── 智能推荐: 城市映射 + 画像增强 + 推荐引擎 ────────────────── */

// 城市码到区域映射（IP定位后自动匹配区域）
export const cityToRegionMap = {
  // 长三角
  '上海': 'yangtze_delta', '上海市': 'yangtze_delta',
  '南京': 'yangtze_delta', '苏州': 'yangtze_delta', '无锡': 'yangtze_delta',
  '常州': 'yangtze_delta', '南通': 'yangtze_delta', '扬州': 'yangtze_delta',
  '杭州': 'yangtze_delta', '宁波': 'yangtze_delta', '温州': 'yangtze_delta',
  '合肥': 'yangtze_delta', '芜湖': 'yangtze_delta',
  // 京津冀
  '北京': 'jingjinji', '北京市': 'jingjinji',
  '天津': 'jingjinji', '天津市': 'jingjinji',
  '石家庄': 'jingjinji', '唐山': 'jingjinji', '保定': 'jingjinji',
  // 大湾区
  '广州': 'greater_bay', '深圳市': 'greater_bay', '深圳': 'greater_bay',
  '东莞': 'greater_bay', '佛山': 'greater_bay', '珠海': 'greater_bay',
  '中山': 'greater_bay', '惠州': 'greater_bay',
  // 成渝
  '成都': 'chengyu', '重庆': 'chengyu', '重庆市': 'chengyu',
  '绵阳': 'chengyu', '德阳': 'chengyu', '宜宾': 'chengyu',
};

// 人生阶段定义（用于推荐算法）
export const lifeStages = [
  { key: 'student', label: '在校生/应届', icon: '🎓', ageRange: [18, 24], 
    focusDims: ['employment', 'education', 'finance'],
    hotTopics: ['社保脱钩', '就业补贴', '人才购房'] },
  { key: 'young_single', label: '单身青年', icon: '🧑', ageRange: [25, 30],
    focusDims: ['employment', 'housing', 'finance'],
    hotTopics: ['公积金', '个税扣除', '限购松绑'] },
  { key: 'newlywed', label: '新婚备孕', icon: '💑', ageRange: [28, 35],
    focusDims: ['housing', 'education', 'elderly'],
    hotTopics: ['生育津贴', '首套房', '学区'] },
  { key: 'young_parent', label: '学龄家长', icon: '👨‍👩‍👧', ageRange: [30, 40],
    focusDims: ['education', 'housing', 'finance'],
    hotTopics: ['双减', '学区', '个税扣除', '多校划片'] },
  { key: 'mid_career', label: '事业上升期', icon: '💼', ageRange: [35, 50],
    focusDims: ['finance', 'employment', 'housing'],
    hotTopics: ['个税优化', '养老金', '房产配置'] },
  { key: 'approaching_retire', label: '临近退休', icon: '👴', ageRange: [50, 65],
    focusDims: ['elderly', 'finance', 'employment'],
    hotTopics: ['延迟退休', '养老金', '医保', '长期护理'] },
  { key: 'career_crisis', label: '职业危机/失业', icon: '🆘', ageRange: [25, 60],
    focusDims: ['employment', 'housing', 'elderly'],
    hotTopics: ['失业金', '公积金提取', '社保断缴', 'N+1赔偿', '灵活就业', '保租房'],
    crisisMode: true,
    urgentActions: ['申领失业保险金', '确认N+1裁员赔偿', '公积金提取', '社保灵活就业续缴', '医保不能断'] },
];

// 根据年龄推断人生阶段
export function inferLifeStage(age) {
  if (!age || age < 18) return lifeStages[0]
  const stage = lifeStages.find(s => age >= s.ageRange[0] && age <= s.ageRange[1])
  return stage || lifeStages[lifeStages.length - 1]
}

// 根据城市名推断区域
export function cityToRegion(cityName) {
  if (!cityName) return 'national'
  // 去除"市"后缀
  const clean = cityName.replace(/市$/, '')
  // 直接匹配
  if (cityToRegionMap[clean]) return cityToRegionMap[clean]
  if (cityToRegionMap[cityName]) return cityToRegionMap[cityName]
  // 模糊匹配
  const found = Object.keys(cityToRegionMap).find(k => k.includes(clean) || clean.includes(k))
  return found ? cityToRegionMap[found] : 'national'
}

// IP地理定位函数（纯前端，调用免费API）
export async function detectUserCity() {
  // 尝试多个免费IP定位服务，容错
  const services = [
    { url: 'https://ipapi.co/json/', field: 'city' },
    { url: 'https://ipinfo.io/json', field: 'city' },
    { url: 'https://api.ip.sb/geoip', field: 'city' },
  ]
  for (const svc of services) {
    try {
      const res = await fetch(svc.url, { signal: AbortSignal.timeout(3000) })
      if (!res.ok) continue
      const data = await res.json()
      const city = data[svc.field]
      const region = data.region || data.region_name || data.province || ''
      if (city) return { city, region, country: data.country || 'CN' }
    } catch { continue }
  }
  return null // 所有服务失败
}

/*
 * 智能推荐引擎
 * 输入: { personaKey, city, regionKey, age, viewHistory }
 * 输出: 推荐政策列表（5条）
 */
export function getSmartRecommendations({ personaKey, city, regionKey, age, viewHistory = [], settlementData = null }) {
  const scores = new Map() // policyName → score
  const stage = age ? inferLifeStage(age) : null
  const persona = personas.find(p => p.key === personaKey)
  const personaWeights = persona?.weights || {}

  // 1. 基于画像权重给维度政策打分
  dimensions.forEach(dim => {
    const weight = personaWeights[dim.key] || 0.15
    dim.scores.forEach(p => {
      const baseScore = (p.direction > 0 ? 8 : p.direction < 0 ? 3 : 5) * weight
      scores.set(p.policyName, (scores.get(p.policyName) || 0) + baseScore)
    })
  })

  // 2. 基于人生阶段给热点政策加分
  if (stage) {
    stage.hotTopics.forEach(topic => {
      scores.forEach((score, name) => {
        if (name.toLowerCase().includes(topic.toLowerCase())) {
          scores.set(name, score + 5)
        }
      })
    })
  }

  // 3. 基于浏览历史给相关政策加分（协同过滤模拟）
  const viewedDims = new Set()
  viewHistory.forEach(h => {
    if (h.dim) viewedDims.add(h.dim)
    // 浏览过的政策相关词加分
    scores.forEach((score, name) => {
      if (h.policyName && name.includes(h.policyName.slice(0, 4))) {
        scores.set(name, score + 3)
      }
    })
  })
  // 用户浏览过的维度政策加分
  if (viewedDims.size > 0) {
    dimensions.forEach(dim => {
      if (viewedDims.has(dim.key)) {
        dim.scores.forEach(p => {
          scores.set(p.policyName, (scores.get(p.policyName) || 0) + 2)
        })
      }
    })
  }

  // 4. 城市匹配加分（区域性政策）
  if (city) {
    scores.forEach((score, name) => {
      if (name.includes(city) || name.includes(city.replace(/市$/, ''))) {
        scores.set(name, score + 4)
      }
    })
  }

  // 4.5 安家数据个性化提升
  if (settlementData && settlementData.report) {
    const cityName = settlementData.report?.city?.name
    if (cityName) {
      // 安家场景维度级提升：房产 +5，就业 +3
      dimensions.forEach(dim => {
        const boost = dim.key === 'housing' ? 5 : dim.key === 'employment' ? 3 : 0
        if (boost > 0) {
          dim.scores.forEach(p => {
            scores.set(p.policyName, (scores.get(p.policyName) || 0) + boost)
          })
        }
      })
      // 含城市名的关键词额外提升
      scores.forEach((score, name) => {
        let kw = 0
        if (name.includes(cityName) || name.includes(cityName.replace(/市$/, ''))) kw = 8
        if (name.includes('落户') || name.includes('人才') || name.includes('购房')) kw = Math.max(kw, 6)
        if (kw > 0) scores.set(name, score + kw)
      })
    }
  }

  // 5. 排序取Top 5
  const ranked = [...scores.entries()]
    .map(([name, score]) => {
      const dim = dimensions.find(d => d.scores.some(p => p.policyName === name))
      const policy = dim?.scores.find(p => p.policyName === name)
      return {
        title: name,
        dim: dim?.key || '',
        dimIcon: dim?.icon || '📋',
        dimName: dim?.name || '',
        sentiment: policy?.direction > 0 ? '利好' : policy?.direction < 0 ? '利空' : '中性',
        note: policy?.note || '',
        url: policy?.url || '',
        score,
      }
    })
    .filter(r => r.dim) // 过滤掉找不到维度的
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  return ranked
}

// 获取推荐原因描述
export function getRecommendReason({ personaKey, age, city, viewHistory = [] }) {
  const reasons = []
  const persona = personas.find(p => p.key === personaKey)
  if (persona) reasons.push(`你是${persona.label}，关注${persona.desc}`)
  const stage = age ? inferLifeStage(age) : null
  if (stage) reasons.push(`处于「${stage.label}」阶段`)
  if (city) reasons.push(`所在城市：${city}`)
  if (viewHistory.length > 0) reasons.push(`基于你的${viewHistory.length}条浏览记录`)
  return reasons.length > 0 ? reasons.join(' · ') : '基于政策影响力排序'
}

/* ── 新闻联播政策速递（06-18 ~ 06-25）────────── */
export const newsLianboUpdates = [
  { date: "2026-07-17", title: "2026世界人工智能大会教育论坛：AI重塑教育模式", dim: "education", sentiment: "利好", data: ["突破1.2万亿", "15所", "100亿"], summary: "世界人工智能大会教育论坛在上海举行，AI教育试点加速推广，科学教育加法全面推进，中小学AI课程设置扩大。", source: "新闻联播 20260717" },
  { date: "2026-06-18", title: "国聘行动北京行高校毕业生就业服务专场启动", dim: "education", sentiment: "利好", data: ["2万", "14万", "1300万"], summary: "国聘行动北京行高校毕业生就业服务专场活动启动，线上线下同步提供超2万个就业岗位，累计汇聚超14万家企业。", source: "新闻联播 20260618" },
  { date: "2026-06-15", title: "两重建设推动新增普通高中学位超60万个", dim: "education", sentiment: "利好", data: ["60万", "76个", "12.4万亿"], summary: "今年两重建设将推动全国新增普通高中学位超60万个，布局76个国家产教融合创新平台，教育社保等4项支出超12.4万亿。", source: "新闻联播 20260615" },
  { date: "2026-06-15", title: "持续增进民生福祉：普惠托育扩面+养老服务体系升级", dim: "pension", sentiment: "利好", data: ["4000个", "130家", "90%"], summary: "辽宁新增普惠托位4000个，安徽新建130家社区嵌入式养老服务机构，贵州县域内基层医疗就诊率保持在90%以上。", source: "新闻联播 20260615" },
  { date: "2026-06-18", title: "加快下达“两新”项目资金持续释放政策效能", dim: "housing", sentiment: "利好", data: ["2000亿元", "625亿元", "1851亿元"], summary: "记者今天（6月18日）从国家发展改革委了解到，6月底前，国家将下达今年全部2000亿元设备更新项目清单和第三批625亿元消费品以旧换新资金。 今年以来，两新政策在支持范围、补贴标准、实施机制等方面都进", source: "新闻联播 20260618" },
  { date: "2026-06-18", title: "端午临近节日市场供应丰富", dim: "finance", sentiment: "利好", data: ["10万", "29.5万", "1500万元"], summary: "端午将至，各地节日氛围渐浓，时令商品热销，民俗文化带动消费市场持续升温。 端午佳节临近，上海多家老字号的特色食品进入销售高峰。传统的大肉粽、赤豆粽持续热销，不少商家还在口味上推陈出新，乌米豆沙粽等新品", source: "新闻联播 20260618" },
  { date: "2026-06-18", title: "海南自贸港全岛封关半年政策红利持续释放", dim: "industry", sentiment: "利好", data: ["10个", "60%", "26.45亿元"], summary: "海南自贸港全岛封关半年，通关便利化水平持续提升。一线报关单申报项目从105项精简至33项。10个二线口岸出岛申报项目简化60%以上。封关至2026年5月31日，零关税政策进口货物26.45亿元、同比增", source: "新闻联播 20260618" },
  { date: "2026-06-18", title: "前5个月西部陆海新通道进出口规模创历史新高", dim: "industry", sentiment: "中性", data: ["5个", "4218.9亿元", "增长13.2%"], summary: "今年前5个月，西部陆海新通道沿线省（区、市）经通道进出口4218.9亿元，创历史新高，同比增长13.2%。截至目前，西部陆海新通道运输网络已覆盖全球120多个国家和地区的590多个港口。 我国首个重点", source: "新闻联播 20260618" },
  { date: "2026-06-18", title: "国聘行动北京行高校毕业生就业服务专场", dim: "employment", sentiment: "中性", data: ["2万", "14万", "1300万"], summary: "今天（6月18日），国聘行动北京行高校毕业生就业服务专场活动启动，国聘平台上线北京专场，线上线下同步提供超2万个就业岗位。国聘行动已连续举办七季，累计汇聚超14万家企业，发布招聘岗位超1300万个。", source: "新闻联播 20260618" },
  { date: "2026-06-18", title: "美联储今年连续第四次宣布维持利率不变", dim: "finance", sentiment: "中性", data: ["3.5%", "3.75%", "3.4%"], summary: "美国联邦储备委员会17日宣布，继续将联邦基金利率目标区间维持在3.5%至3.75%之间不变。这是美联储今年连续第四次维持利率不变，符合市场的普遍预期。美联储同时发布的经济预测摘要显示，美联储官员对20", source: "新闻联播 20260618" },
  { date: "2026-06-23", title: "我国利用外资结构持续优化", dim: "industry", sentiment: "利好", data: ["2.5万", "增长5.3%", "增长5.9%"], summary: "商务部发布的最新数据显示，今年15月，全国新设立外商投资企业超2.5万家，同比增长5.3%。5月当月，全国实际使用外资同比增长5.9%。实现月度同比增速由负转正。据统计，今年前五个月，近4000家外资", source: "新闻联播 20260623" },
  { date: "2026-06-24", title: "前五个月全国一般公共预算收入超10万亿元", dim: "employment", sentiment: "利好", data: ["10万亿元", "100465亿元", "增长4%"], summary: "财政部数据显示，今年15月，全国一般公共预算收入100465亿元，同比增长4%，增幅比14月提高0.5个百分点。主体税种表现良好，今年前五个月，国内增值税增长6.2%，增幅连续4个月提高，反映出经济增", source: "新闻联播 20260624" },
  { date: "2026-06-25", title: "我国土地资源利用效率全面提升", dim: "housing", sentiment: "中性", data: ["99个", "198万", "19.36%"], summary: "今天（6月25日）是全国土地日，主题为珍惜每一寸土地促进高质量发展。记者从自然资源部了解到，今年以来，我国节约集约用地取得积极成效，土地资源利用效率全面提升。 眼下，广东全省正在加速推进低效用地再开发", source: "新闻联播 20260625" },
  { date: "2026-06-25", title: "发电装机突破40亿千瓦电力供给能力迈上新台阶", dim: "industry", sentiment: "利好", data: ["突破40亿", "16亿", "达到40.1亿"], summary: "国家能源局今天（6月25日）公布的数据显示，截至5月底，全国累计发电装机容量突破40亿千瓦大关，居世界首位，我国电力供给能力迈上新台阶。 就在几天前，海南启源海上风电场第二批机组顺利并网发电。作为我国", source: "新闻联播 20260625" },
  { date: "2026-06-25", title: "前4个月我国新兴产业和未来产业新设企业37.3万户", dim: "industry", sentiment: "利好", data: ["4个", "37.3万", "26.7万"], summary: "市场监管总局公布最新数据显示，我国8大新兴产业和9大未来产业相关企业稳定增长，今年前4个月共新设37.3万户。以新一代信息技术、高端装备制造等为代表的8大新兴产业共新设相关企业26.7万户，持续发挥创", source: "新闻联播 20260625" },
  { date: "2026-06-26", title: "到2030年我国将初步建成新型能源体系", dim: "finance", sentiment: "中性", data: ["达到54亿", "超过50%", "超过20万亿元"], summary: "国务院新闻办公室今天（6月26日）举行开局起步十五五系列主题新闻发布会，国家能源局相关负责人介绍十五五时期加快新型能源体系建设有关规划情况。 据介绍，到2030年，我国将初步建成清洁低碳安全高效的新型", source: "新闻联播 20260626" },
  { date: "2026-06-26", title: "国家广播电视总局发布AI微短剧分类分层标准", dim: "industry", sentiment: "中性", data: ["达到80万元", "30万元", "80万元"], summary: "国家广播电视总局日前发布《管理提示（AI微短剧分类分层标准）》。对投资额度达到80万元及以上或者特殊题材的AI微短剧，按照重点微短剧管理。30万元（含）至80万元之间的、不足30万元的，分别按照普通微", source: "新闻联播 20260626" },
  { date: "2026-06-27", title: "以高质量发展引领中国经济航船破浪前行", dim: "industry", sentiment: "利好", data: ["140万亿元", "超过1.3万", "30%"], summary: "经济工作是党和国家的中心工作，做好经济工作是党治国理政的重大任务。党的十八大以来，以习近平同志为核心的党中央团结带领全党全国各族人民，迎难而上、砥砺前行，有效应对一系列重大风险挑战。党对经济工作的战略", source: "新闻联播 20260627" },
  { date: "2026-06-27", title: "筑牢基层战斗堡垒建设幸福和美乡村", dim: "employment", sentiment: "中性", data: ["4600元", "24600元", "100%"], summary: "从早年基层建设软弱涣散村到获评全国先进基层党组织，十多年间，河南省兰考县仪封镇代庄村党组织坚持党建引领，一步步把代庄村建成了产业兴旺、治理有序、村民富裕的乡村振兴样板村。 记者在代庄村采访时，正赶上共", source: "新闻联播 20260627" },
  { date: "2026-06-27", title: "今年前5个月工业企业利润实现较快增长", dim: "industry", sentiment: "利好", data: ["5个", "增长18.8%", "0.6个百分点"], summary: "国家统计局今天（6月27日）发布的数据显示，15月份，全国规模以上工业企业利润同比增长18.8%，比14月份加快0.6个百分点。 从门类看，制造业企业利润同比增长20%。其中，高技术制造业利润同比增长", source: "新闻联播 20260627" },
  { date: "2026-06-28", title: "新一批支持消费品以旧换新资金下达", dim: "finance", sentiment: "利好", data: ["625亿元", "1875亿元", "超过30%"], summary: "记者从国家发展改革委了解到，今年第三批625亿元超长期特别国债支持消费品以旧换新资金近日下达，至此，今年以来共下达消费品以旧换新资金1875亿元，激发消费潜力加速释放。 今年15月，限额以上单位中高能", source: "新闻联播 20260628" },
  { date: "2026-06-28", title: "前五个月我国物流运行结构优化质效提升", dim: "industry", sentiment: "利好", data: ["146.6万亿元", "增长5.2%", "增长15.1%"], summary: "中国物流与采购联合会今天（6月28日）公布，今年15月份，全国社会物流总额146.6万亿元，同比增长5.2%。高端制造领域物流需求保持较快增长。5月份高技术制造业、装备制造业相关物流需求同比分别增长1", source: "新闻联播 20260628" },
  { date: "2026-06-28", title: "香港回归29年来内地与香港贸易值年均增长6.7%", dim: "industry", sentiment: "中性", data: ["增长6.7%", "4208.7亿元", "2.6万亿元"], summary: "据深圳海关统计，香港回归29年来，内地与香港贸易值从1997年的4208.7亿元增长至2025年的2.6万亿元，年均增长6.7%。今年前5个月，内地与香港贸易进出口值达1.4万亿元，同比增长48.6%", source: "新闻联播 20260628" },
  { date: "2026-06-30", title: "中国共产党最新党内统计数据发布", dim: "employment", sentiment: "利好", data: ["10128.6万", "101.5万", "543.1万"], summary: "中央组织部最新党内统计数据显示，截至2025年底，中国共产党党员总数为10128.6万名，比上年净增101.5万名；党的基层组织543.1万个，比上年净增18.1万个。 党员总量适度增长。党员总量比上", source: "新闻联播 20260630" },
  { date: "2026-06-30", title: "夏播粮食近八成夏管全面展开", dim: "finance", sentiment: "利好", data: ["6000万", "3台", "8个"], summary: "眼下，全国夏播粮食进度近八成，夏季田间管理全面展开。各地因地制宜，夯实秋粮丰收基础。 今年，山东夏播粮食面积预计稳定在6000万亩以上，当地利用农机购置与应用补贴、农机报废更新补贴等惠农政策，加大推广", source: "新闻联播 20260630" },
  { date: "2026-06-30", title: "中国制造业采购经理指数升至50.3%", dim: "industry", sentiment: "利好", data: ["50.3%", "0.3个百分点", "4个"], summary: "国家统计局、中国物流与采购联合会今天（6月30日）公布，6月份中国制造业采购经理指数为50.3%，较上月上升0.3个百分点。指数连续4个月运行在50%及以上的水平，制造业发展动能在增强。 从主要分项指", source: "新闻联播 20260630" },
  { date: "2026-07-03", title: "今年2000亿元设备更新资金已全部下达", dim: "housing", sentiment: "利好", data: ["2000亿元", "22个", "约1.1万"], summary: "记者今天（7月3日）从国家发展改革委了解到，今年第三批设备更新项目清单和资金安排已下达，支持能源电力、物流、教育、养老机构、线下消费商业设施、老旧营运货车、住宅老旧电梯等领域设备更新和老旧小区加装电梯", source: "新闻联播 20260703" },
  { date: "2026-07-04", title: "西渝高铁石家梁隧道贯通", dim: "industry", sentiment: "中性", data: ["5个", "13个", "7个"], summary: "今天（7月4日），西安至重庆高速铁路控制性工程全长11908米的石家梁隧道顺利贯通。西渝高铁全线预计2028年建成通车，届时，重庆到西安的列车运行时间，将由现在的最快5个多小时缩短至2小时左右。 全球", source: "新闻联播 20260704" },
  { date: "2026-07-06", title: "今年“两重”建设项目清单全部下达完毕", dim: "industry", sentiment: "中性", data: ["1935亿元", "8000亿元", "1417个"], summary: "记者从国家发展改革委了解到，2026年第三批两重建设项目近日已下达，共安排超长期特别国债资金1935亿元。至此，今年两重建设项目清单已全部下达完毕。 今年以来，国家发展改革委联合有关行业主管部门，共安", source: "新闻联播 20260706" },
  { date: "2026-07-07", title: "中央组织部从代中央管理党费中划拨6000万元用于支持广西、甘肃等5省区防汛救灾工", dim: "pension", sentiment: "利好", data: ["6000万元", "84700人", "54468人"], summary: "近日，中央组织部从代中央管理党费中给广西、甘肃等5省区划拨专项资金6000万元，用于支持防汛救灾工作。 极端天气影响我国多地各方全力组织抢险救援 近日，极端天气影响广西、湖北、甘肃等地，各地各部门全力", source: "新闻联播 20260707" },
  { date: "2026-07-07", title: "6月份中国仓储指数重回扩张区间", dim: "employment", sentiment: "利好", data: ["50.2%", "0.6个百分点", "20万"], summary: "中国物流与采购联合会今天（7月7日）公布，6月份中国仓储指数为50.2%，较上月上升0.6个百分点。其中，新订单指数回升明显，钢材、建材、机械设备等与基建相关的大宗商品仓储需求表现较好。 互联网企业云", source: "新闻联播 20260707" },
  { date: "2026-07-12", title: "严守耕地红线筑牢国家粮食安全根基", dim: "housing", sentiment: "利好", data: ["突破3000亿", "18亿", "超过2000元"], summary: "粮食安全是国之大者，耕地是粮食生产的命根子。习近平总书记指出，要守住耕地这个命根子，坚决整治乱占、破坏耕地违法行为，加大高标准农田建设投入和管护力度，确保耕地数量有保障、质量有提升。今年以来，各地着力", source: "新闻联播 20260712" },
  { date: "2026-07-12", title: "上半年多项先行指标企稳回升", dim: "industry", sentiment: "利好", data: ["3.9%", "增长15.6%", "增长23%"], summary: "国家信息中心今天（7月12日）发布最新数据显示，今年上半年，多项先行指标企稳回升，彰显出宏观经济韧性强、动能足的积极态势。 工业生产稳健复苏。16月份，工业园区生产热度指数同比上升3.9%，工业生产活", source: "新闻联播 20260712" },
  { date: "2026-07-12", title: "我国新材料领域持续取得新突破", dim: "industry", sentiment: "利好", data: ["40%", "550亿元", "近10万亿元"], summary: "今年以来，我国新材料产业重点领域密集取得原创性成果突破，惠及高端制造、人工智能等一批关键产业，成为培育新质生产力的重要引擎。 现在您看到的这片薄薄的材料，是我国最新研制的新型智能材料。您可别小瞧它，只", source: "新闻联播 20260712" },
  { date: "2026-07-13", title: "人工智能蓬勃兴起锻造高质量发展新引擎", dim: "industry", sentiment: "利好", data: ["突破1.2万亿元", "10台", "8台"], summary: "习近平总书记强调，加快发展新一代人工智能是我们赢得全球科技竞争主动权的重要战略抓手，是推动我国科技跨越发展、产业优化升级、生产力整体跃升的重要战略资源。十五五开局之年，我国人工智能产业加速壮大、场景应", source: "新闻联播 20260713" },
  { date: "2026-07-13", title: "上半年铁路客运多项指标创新高激发消费潜能", dim: "finance", sentiment: "利好", data: ["23.48亿", "增长5.0%", "增长5.8%"], summary: "记者从国铁集团获悉，今年上半年，全国铁路累计发送旅客23.48亿人次，同比增长5.0%；日均安排开行旅客列车11468列，同比增长5.8%。上半年，春节、清明、五一、端午等假期运输组织有序，单日旅客发", source: "新闻联播 20260713" },
  { date: "2026-07-13", title: "第三十二届中国兰州投资贸易洽谈会今天闭幕", dim: "industry", sentiment: "中性", data: ["近1900家", "约10亿元", "达到61%"], summary: "第三十二届中国兰州投资贸易洽谈会今天（7月13日）闭幕。本届兰洽会有国内外近1900家企业参展，签约10亿元以上的项目占比达到61%，涉及传统产业升级、未来产业布局、服务业扩容等方面。 2026暑期档", source: "新闻联播 20260713" },
  { date: "2026-07-14", title: "开放共赢促进人工智能更好造福各国人民", dim: "industry", sentiment: "利好", data: ["突破100亿", "突破20万", "15所"], summary: "习近平总书记指出，人工智能对未来发展具有重大意义，应该使之为各国各地区人民造福。我们要以全人类福祉为念，推动人工智能朝着有益、安全、公平方向健康有序发展。 在人工智能深刻影响全球经济格局和治理体系的当", source: "新闻联播 20260714" },
  { date: "2026-07-14", title: "今年上半年我国货物贸易进出口同比增长16.9%", dim: "industry", sentiment: "利好", data: ["增长16.9%", "突破25万亿元", "25.47万亿元"], summary: "国务院新闻办公室今天（7月14日）举行发布会，海关总署介绍，今年上半年，我国进出口规模历史同期首次突破25万亿元。在复杂严峻的外部环境下，我国外贸增势强劲、走势稳健。 据海关统计，今年上半年，我国货物", source: "新闻联播 20260714" },
  { date: "2026-07-14", title: "各地各部门多措施应对台风“巴威”影响", dim: "housing", sentiment: "利好", data: ["超过18亿", "3000万元", "6.1%"], summary: "今年第9号台风巴威给我国东北地区带来强降雨，各地各部门多举措全力应对。 受台风巴威影响，东北多地出现大到暴雨。辽宁省中北部从12日开始出现暴雨到大暴雨，局地特大暴雨。沈阳部分地区的累计降雨量超过450", source: "新闻联播 20260714" },
  { date: "2026-07-14", title: "今年上半年新注册登记新能源汽车占比近半", dim: "finance", sentiment: "中性", data: ["3.71亿", "13.19%", "519.5万"], summary: "公安部今天（7月14日）发布数据，截至2026年6月底，全国汽车保有量达3.71亿辆，其中，新能源汽车保有量占汽车总量的13.19%。今年上半年，全国新注册登记新能源汽车519.5万辆，占汽车新注册登", source: "新闻联播 20260714" },
  { date: "2026-07-14", title: "15月全国基本医保基金收入同比增长8.49%", dim: "pension", sentiment: "利好", data: ["增长8.49%", "13.19亿", "增加469万"], summary: "截至今年5月底，全国基本医保参保人数达13.19亿人，同比增加469万人，参保率稳定在95%。今年15月，基本医保基金收入1.61万亿元，同比增长8.49%，支出1.21万亿元，同比增长2.12%，基", source: "新闻联播 20260714" },
  { date: "2026-07-15", title: "上半年GDP同比增长4.7%中国经济持续向新向优", dim: "employment", sentiment: "利好", data: ["增长4.7%", "达到69.6万亿元", "增长13.3%"], summary: "国务院新闻办公室今天（7月15日）举行新闻发布会，国家统计局发布的数据显示，今年上半年，中国经济顶住压力，有效应对外部冲击挑战，国内生产总值同比增长4.7%，延续了总体平稳、向新向优的发展态势，展现出", source: "新闻联播 20260715" },
  { date: "2026-07-15", title: "上半年金融总量合理增长信贷结构持续优化", dim: "finance", sentiment: "利好", data: ["增长8.0%", "10.72万亿元", "8.51万亿元"], summary: "国务院新闻办公室今天（7月15日）举行新闻发布会，中国人民银行发布的数据显示，今年上半年，金融总量合理增长，金融体系对实体经济支持力度稳固。 数据显示，上半年金融总量合理增长。6月末，广义货币（M2）", source: "新闻联播 20260715" },
  { date: "2026-07-15", title: "美联储主席：高通胀已成为过度负担", dim: "finance", sentiment: "中性", data: ["4.2%", "3.5%", "2%"], summary: "美国联邦储备委员会主席沃什14日表示，高通胀已成为美国家庭和企业的过度负担，美联储不能容忍持续高企的通胀率。美国劳工部当天发布的数据显示，受能源价格下跌影响，美国6月消费者价格指数（CPI）涨幅从5月", source: "新闻联播 20260715" },
  { date: "2026-07-16", title: "我国中西部地区最大乙烯产业基地建成", dim: "industry", sentiment: "中性", data: ["120万", "10亿", "137万"], summary: "我国中西部地区最大乙烯产业基地中国石油独山子石化塔里木120万吨乙烯绿色低碳示范工程今天（7月16日）在新疆建成投产，工程构建起全链条低碳技术闭环体系，实现了二氧化碳、副产氢气全部回收再利用，每年可消", source: "新闻联播 20260716" },
  { date: "2026-07-17", title: "上半年我国涉外收支规模创新高外汇市场交易量稳步增长", dim: "industry", sentiment: "利好", data: ["9.2万亿", "增长21%", "2.9万亿"], summary: "国务院新闻办今天（7月17日）举行新闻发布会，介绍2026年上半年我国外汇收支情况。国家外汇管理局数据显示，上半年我国涉外收支规模创新高，银行代客涉外收入和支出合计9.2万亿美元，同比增长21%；银行", source: "新闻联播 20260717" },
  { date: "2026-06-24", title: "链博会与会嘉宾：中国开辟全球供应链合作新机遇", dim: "industry", sentiment: "中性", data: ["676家", "200个"], summary: "第四届链博会吸引了676家企业和行业机构参展，超200个境外团组专程来华观展洽谈。多国与会嘉宾表示，中国正不断为全球供应链开放合作带来新机遇。 本届链博会第一天，记者遇到了一位来自澳大利亚的参展嘉宾。", source: "新闻联播 20260624" },
  { date: "2026-06-25", title: "暑期档电影片单发布2026年电影票房超170亿元", dim: "finance", sentiment: "中性", data: ["170亿元", "超过2680亿元"], summary: "2026年暑期档电影片单今天（6月25日）发布，暑期档影片涵盖革命历史、科幻、喜剧、动画等多种类型，为观众带来多样化的观影选择，助力观影热情持续走高。截至昨晚（6月24日），2026年度电影票房已超1", source: "新闻联播 20260625" },
  // ═══ 2026年1-5月补充 ═══
  { date: "2026-01-05", title: "户籍与社保脱钩正式实施：2亿灵活就业人员受益", dim: "employment", sentiment: "利好", data: ["2亿人", "45%→70%", "30年"], summary: "国家发改委宣布，自2026年1月1日起，全面取消就业地参保户籍限制。灵活就业人员可在工作地直接参加职工社保，不再受户籍地约束。这是中国社保制度30年来最大变革，预计参保率将从45%提升至70%以上。", source: "新闻联播 20260105" },
  { date: "2026-01-10", title: "个人养老金制度全面推广：年缴存上限提至18000元", dim: "pension", sentiment: "利好", data: ["18000元", "5400元", "1.2亿"], summary: "人社部宣布个人养老金制度从试点城市扩展至全国，年缴存上限从12000元提高至18000元。按最高税率计算，每年可节税5400元。目前已有1.2亿人开户，实际缴存比例提升至35%。", source: "新闻联播 20260110" },
  { date: "2026-01-15", title: "2025年GDP增长5.0%：经济总量突破135万亿元", dim: "employment", sentiment: "利好", data: ["增长5.0%", "135万亿", "1255万人"], summary: "国家统计局发布2025年经济数据：全年GDP同比增长5.0%，经济总量突破135万亿元。城镇新增就业1255万人，失业率保持在5.1%。高技术制造业增加值增长8.9%，新能源汽车产量突破1300万辆。", source: "新闻联播 20260115" },
  { date: "2026-01-20", title: "春节消费开门红：社会消费品零售总额增长6.2%", dim: "finance", sentiment: "利好", data: ["增长6.2%", "1.2万亿", "增长18%"], summary: "商务部数据显示，春节假期全国社会消费品零售总额突破1.2万亿元，同比增长6.2%。其中线上消费增长18%，冰雪旅游、国潮消费成为新增长点。以旧换新政策带动家电销售增长25%。", source: "新闻联播 20260120" },
  { date: "2026-02-05", title: "LPR再次下调：5年期降至3.6%创历史新低", dim: "finance", sentiment: "利好", data: ["3.6%", "3.1%", "200基点"], summary: "央行宣布下调LPR：1年期降至3.1%，5年期降至3.6%。这是2024年以来第四次下调，累计降幅超200个基点。以300万30年房贷计算，月供较2021年高点减少约3500元。", source: "新闻联播 20260205" },
  { date: "2026-02-10", title: "教育部：AI教育试点扩展至全国500所学校", dim: "education", sentiment: "利好", data: ["500所", "20%", "1.5亿"], summary: "教育部宣布AI教育试点从上海虹口等试验区扩展至全国500所学校。要求中小学实验课时占比提升20%，科学教育加法全面推进。国家智慧教育平台已覆盖1.5亿在校学生。", source: "新闻联播 20260210" },
  { date: "2026-02-15", title: "春运40天：全社会跨区域人员流动量达90亿人次", dim: "industry", sentiment: "利好", data: ["90亿", "增长8%", "5.2亿"], summary: "交通运输部数据显示，2026年春运40天全社会跨区域人员流动量达90亿人次，同比增长8%。铁路发送旅客5.2亿人次创历史新高。新能源汽车高速出行占比首次突破20%。", source: "新闻联播 20260215" },
  { date: "2026-02-20", title: "上海发布'沪七条'：非沪籍外环外不限购", dim: "housing", sentiment: "利好", data: ["240万", "不限购", "5年最宽松"], summary: "上海住建委发布'沪七条'：非沪籍居民外环外购房不再限购，公积金贷款上限提至240万元，换房退税延续至2027年底。这是上海近5年最强购房宽松信号，预计惠及超1000万非沪籍常住人口。", source: "新闻联播 20260220" },
  { date: "2026-02-26", title: "北京'认房不认贷'全面落地：首付比例降至20%", dim: "housing", sentiment: "利好", data: ["20%", "160万", "2000万"], summary: "北京住建委宣布全面执行'认房不认贷'，首套房首付比例降至20%，公积金贷款上限提至160万。政策覆盖北京约2000万常住人口，改善型住房需求有望集中释放。", source: "新闻联播 20260226" },
  { date: "2026-03-01", title: "常住地公共服务同权化：随迁子女入学门槛大幅降低", dim: "education", sentiment: "利好", data: ["1亿", "居住证", "同权"], summary: "国务院发布常住地基本公共服务均等化方案：随迁子女凭居住证即可在常住地入学，不再要求社保年限和房产证明。全国超1亿流动人口家庭子女将直接受益。", source: "新闻联播 20260301" },
  { date: "2026-03-05", title: "政府工作报告：2026年GDP目标5%左右", dim: "employment", sentiment: "利好", data: ["5%", "1200万", "3%"], summary: "十四届全国人大四次会议开幕，政府工作报告提出2026年GDP增长目标5%左右，城镇新增就业1200万人以上，CPI涨幅3%左右。报告强调'新质生产力'和'扩大内需'双轮驱动。", source: "新闻联播 20260305" },
  { date: "2026-03-10", title: "个税专项附加扣除标准再提高：子女教育每月2500元", dim: "finance", sentiment: "利好", data: ["2500元", "3000元", "8000万"], summary: "财政部宣布提高个税专项附加扣除标准：子女教育从每月2000元提至2500元，赡养老人从3000元提至3500元，住房租金按城市分级提高。预计惠及超8000万纳税人，人均年减税约2000元。", source: "新闻联播 20260310" },
  { date: "2026-03-15", title: "315晚会：聚焦直播电商和预制菜安全", dim: "finance", sentiment: "中性", data: ["7个", "3000万", "48小时"], summary: "2026年315晚会曝光直播电商虚假宣传、预制菜标签不规范等7个消费陷阱。市场监管总局连夜部署专项整治，要求平台48小时内下架问题商品。去年以来已罚没违规金额超3000万元。", source: "新闻联播 20260315" },
  { date: "2026-03-20", title: "金融法草案首次提请全国人大常委会审议", dim: "finance", sentiment: "利好", data: ["首部", "银证保", "统一"], summary: "金融法草案首次提请十四届全国人大常委会审议。这是中国金融领域首部综合性基础法律，将统一规范银行、证券、保险三大行业监管框架，建立金融消费者保护统一标准。", source: "新闻联播 20260320" },
  { date: "2026-04-01", title: "一季度GDP增长4.9%：高技术制造业投资增长12%", dim: "employment", sentiment: "利好", data: ["增长4.9%", "12%", "增长15%"], summary: "国家统计局发布一季度数据：GDP同比增长4.9%，其中高技术制造业投资增长12%，新能源汽车产量增长15%。服务业增加值占GDP比重达58.3%，消费对经济增长贡献率回升至65%。", source: "新闻联播 20260401" },
  { date: "2026-04-10", title: "医疗保障法草案二审：覆盖13.6亿参保人", dim: "pension", sentiment: "利好", data: ["13.6亿", "95%", "首部"], summary: "医疗保障法草案二次审议稿公开征求意见。这是我国首部医保领域专门法律，明确医保基金使用监管、药品集采制度化、异地就医直接结算等内容，覆盖全国13.6亿基本医保参保人。", source: "新闻联播 20260410" },
  { date: "2026-04-15", title: "一季度外贸进出口增长8.2%：机电产品占比超六成", dim: "industry", sentiment: "利好", data: ["增长8.2%", "60%", "增长22%"], summary: "海关总署发布数据：一季度我国外贸进出口总值增长8.2%。机电产品出口占比超六成，其中电动汽车、锂电池、光伏'新三样'出口增长22%。对'一带一路'沿线国家贸易增长12.5%。", source: "新闻联播 20260415" },
  { date: "2026-04-20", title: "全国城镇调查失业率降至5.0%：就业形势持续改善", dim: "employment", sentiment: "利好", data: ["5.0%", "1255万", "16-24岁"], summary: "人社部发布数据：一季度全国城镇调查失业率降至5.0%，较去年同期下降0.2个百分点。城镇新增就业303万人，完成全年目标的25%。16-24岁青年失业率降至14.2%，连续6个月下降。", source: "新闻联播 20260420" },
  { date: "2026-05-01", title: "五一假期旅游收入突破2000亿元：同比增长12%", dim: "finance", sentiment: "利好", data: ["2000亿", "增长12%", "2.7亿"], summary: "文旅部数据显示，五一假期全国国内旅游出游2.7亿人次，旅游收入突破2000亿元，同比增长12%。县域旅游、沉浸式体验成为新趋势。高铁游占比超40%，带动沿线城市消费增长。", source: "新闻联播 20260501" },
  { date: "2026-05-10", title: "前4个月新增减税降费超8000亿元", dim: "finance", sentiment: "利好", data: ["8000亿", "小微企业", "5%"], summary: "财政部数据显示，前4个月全国新增减税降费超8000亿元。小微企业实际税负降至5%以下，研发费用加计扣除比例提至120%。制造业企业受益最为明显，有效激发了市场主体活力。", source: "新闻联播 20260510" },
  { date: "2026-05-15", title: "全国住房公积金缴存总额突破30万亿", dim: "housing", sentiment: "利好", data: ["30万亿", "1.7亿", "240万"], summary: "住建部发布数据：全国住房公积金缴存总额突破30万亿元，覆盖1.7亿缴存职工。提取条件进一步放宽，灵活就业人员可自愿缴存。多城首套公积金贷款上限提至240万元。", source: "新闻联播 20260515" },
  { date: "2026-05-20", title: "前4个月全国固定资产投资增长4.5%", dim: "industry", sentiment: "利好", data: ["增长4.5%", "增长9.8%", "8000亿"], summary: "国家统计局数据：前4个月全国固定资产投资增长4.5%。其中高技术产业投资增长9.8%，制造业投资增长7.2%。'两重'建设已下达超长期特别国债资金8000亿元，带动社会投资超3万亿。", source: "新闻联播 20260520" },
  // ═══ 2025年下半年 ═══
  { date: "2025-07-15", title: "上半年GDP增长5.0%：经济回升向好态势巩固", dim: "employment", sentiment: "利好", data: ["增长5.0%", "130万亿", "5.0%"], summary: "国家统计局发布数据：2025年上半年GDP同比增长5.0%，经济总量超130万亿元。城镇调查失业率保持在5.0%，高技术制造业增加值增长9.2%。消费对经济增长贡献率达62%。", source: "新闻联播 20250715" },
  { date: "2025-07-20", title: "超龄劳动者权益保障办法出台：60岁以上可继续参保", dim: "employment", sentiment: "利好", data: ["60岁", "工伤保险", "2000万"], summary: "人社部发布超龄劳动者基本权益保障办法：超过法定退休年龄继续就业的劳动者，用人单位应为其缴纳工伤保险。全国约2000万超龄劳动者将获得法律保障，填补了延迟退休配套制度空白。", source: "新闻联播 20250720" },
  { date: "2025-08-01", title: "个人养老金产品扩容：新增国债和特定养老储蓄", dim: "pension", sentiment: "利好", data: ["4类", "18000元", "5.4%"], summary: "人社部宣布个人养老金产品目录扩容，新增储蓄国债和特定养老储蓄两类产品。目前可投产品涵盖基金、储蓄、保险、国债4大类超700只。年缴存上限18000元，最高税率档可节税5.4%。", source: "新闻联播 20250801" },
  { date: "2025-08-10", title: "全国医保跨省直接结算覆盖所有统筹区", dim: "pension", sentiment: "利好", data: ["384个", "门诊+住院", "13.6亿"], summary: "国家医保局宣布：全国384个统筹区全部开通门诊和住院跨省直接结算。参保人无需备案即可在异地就医直接报销。累计结算超5亿人次，减少群众垫付资金超4000亿元。", source: "新闻联播 20250810" },
  { date: "2025-08-20", title: "前7个月进出口增长6.8%：贸易结构持续优化", dim: "industry", sentiment: "利好", data: ["增长6.8%", "增长11%", "55%"], summary: "海关总署数据：前7个月我国外贸进出口增长6.8%。机电产品出口增长11%，占比提升至55%。对东盟、中东、非洲等新兴市场出口保持两位数增长，贸易伙伴更加多元化。", source: "新闻联播 20250820" },
  { date: "2025-09-01", title: "县中振兴行动计划启动：3年投入超500亿", dim: "education", sentiment: "利好", data: ["500亿", "1800所", "2000万"], summary: "教育部启动县中振兴行动计划（2025-2027）：3年投入超500亿元，覆盖全国1800所县域高中。目标使县中本科升学率提高5-8个百分点，缩小城乡教育差距，惠及约2000万学生家庭。", source: "新闻联播 20250901" },
  { date: "2025-09-10", title: "长三角公积金互认正式落地：跨省贷款无障碍", dim: "housing", sentiment: "利好", data: ["沪苏浙皖", "240万", "互认"], summary: "长三角一体化示范区公积金互认政策正式落地：沪苏浙皖四地缴存职工可在区域内任一城市申请公积金贷款，最高额度按缴存地标准执行（上海240万）。打破公积金行政壁垒，惠及跨省通勤群体。", source: "新闻联播 20250910" },
  { date: "2025-09-20", title: "全国碳排放权交易市场扩容：纳入钢铁水泥行业", dim: "industry", sentiment: "中性", data: ["80亿吨", "钢铁水泥", "5000家"], summary: "生态环境部宣布全国碳市场扩容，将钢铁、水泥行业纳入交易范围。覆盖排放量从50亿吨增至80亿吨，纳入企业超5000家。碳价稳定在80-100元/吨区间，推动高碳行业绿色转型。", source: "新闻联播 20250920" },
  { date: "2025-10-01", title: "国庆消费黄金周：社会消费品零售总额增长7.5%", dim: "finance", sentiment: "利好", data: ["增长7.5%", "1.8万亿", "增长22%"], summary: "商务部数据显示，国庆黄金周全国社会消费品零售总额达1.8万亿元，同比增长7.5%。以旧换新政策带动家电、汽车销售增长22%。餐饮收入增长9%，旅游收入增长15%。", source: "新闻联播 20251001" },
  { date: "2025-10-15", title: "前三季度GDP增长4.9%：全年目标有望实现", dim: "employment", sentiment: "利好", data: ["增长4.9%", "1000万", "5.1%"], summary: "国家统计局发布前三季度数据：GDP同比增长4.9%，完成全年5%目标在望。城镇新增就业1000万人，提前完成全年目标。高技术产业投资增长10.5%，新动能持续壮大。", source: "新闻联播 20251015" },
  { date: "2025-10-25", title: "民营经济促进法配套细则出台：市场准入负面清单再缩减", dim: "industry", sentiment: "利好", data: ["缩减至117项", "80%", "贷款"], summary: "国家发改委发布民营经济促进法配套实施细则：市场准入负面清单从131项缩减至117项，民企在贷款、招投标、政府采购方面享受与国企同等待遇。民企贡献城镇就业超80%。", source: "新闻联播 20251025" },
  { date: "2025-11-01", title: "灵活就业社保互认试点在长三角启动", dim: "employment", sentiment: "利好", data: ["长三角", "跨省", "45%→70%"], summary: "人社部宣布在长三角率先启动灵活就业社保互认试点：自由职业者在沪苏浙皖任一城市缴纳的社保可跨省累计计算，无需办理转移手续。预计惠及区域内超500万跨省就业人员。", source: "新闻联播 20251101" },
  { date: "2025-11-10", title: "前10个月新增减税降费超2万亿：制造业受益最大", dim: "finance", sentiment: "利好", data: ["2万亿", "120%", "增长8%"], summary: "财政部数据：前10个月全国新增减税降费超2万亿元。研发费用加计扣除比例提至120%，制造业企业受益最为明显。规模以上工业企业利润同比增长8%，企业获得感持续增强。", source: "新闻联播 20251110" },
  { date: "2025-11-20", title: "全国保障性住房建设提速：年内新开工600万套", dim: "housing", sentiment: "利好", data: ["600万套", "保障房", "新市民"], summary: "住建部宣布全国保障性住房建设提速：2025年新开工600万套，包括配售型保障房和保障性租赁住房。重点面向新市民、青年人，租金不超过同地段市场价的70%。", source: "新闻联播 20251120" },
  { date: "2025-12-01", title: "G60科创走廊2.0方案发布：九城市协同创新升级", dim: "industry", sentiment: "利好", data: ["9城市", "1.2万亿", "协同"], summary: "长三角G60科创走廊2.0方案发布：上海松江、苏州、杭州、合肥等9城市深化协同创新，共建世界级产业集群。走廊内科技企业研发投入超1.2万亿元，专利授权量占全国12%。", source: "新闻联播 20251201" },
  { date: "2025-12-10", title: "中央经济工作会议：2026年继续实施积极财政政策", dim: "finance", sentiment: "利好", data: ["积极", "适度宽松", "扩大内需"], summary: "中央经济工作会议定调2026年：继续实施积极财政政策和适度宽松货币政策，把扩大内需摆在优先位置。会议强调'新质生产力'、'防范化解风险'和'保障改善民生'三大重点。", source: "新闻联播 20251210" },
  { date: "2025-12-15", title: "2025年城镇新增就业1255万人：超额完成目标", dim: "employment", sentiment: "利好", data: ["1255万", "5.1%", "增长3%"], summary: "人社部发布全年就业数据：2025年城镇新增就业1255万人，超额完成1200万目标。城镇调查失业率全年平均5.1%。居民人均可支配收入实际增长3%，就业形势保持总体稳定。", source: "新闻联播 20251215" },
  { date: "2025-12-20", title: "全国医保基金收入超3.2万亿：运行总体平稳", dim: "pension", sentiment: "利好", data: ["3.2万亿", "13.5亿", "95%"], summary: "国家医保局发布年度数据：2025年全国基本医保基金收入超3.2万亿元，支出2.8万亿元，结余4000亿元。参保人数达13.5亿，参保率稳定在95%。药品集采累计节省医保资金超5000亿元。", source: "新闻联播 20251220" },
  { date: "2025-12-25", title: "2025年新能源汽车产销突破1300万辆", dim: "industry", sentiment: "利好", data: ["1300万辆", "45%", "全球第一"], summary: "中汽协数据：2025年我国新能源汽车产销双双突破1300万辆，市场渗透率达45%，连续11年居全球第一。充电基础设施累计超1200万台，车桩比降至2.5:1。", source: "新闻联播 20251225" },
  // ═══ 2025年上半年 ═══
  { date: "2025-01-05", title: "延迟退休正式实施：男60→63、女55→58渐进过渡", dim: "pension", sentiment: "中性", data: ["15年", "3-12月", "弹性"], summary: "渐进式延迟法定退休年龄方案自2025年1月1日起正式实施。男性从60岁延至63岁，女性从55/50岁延至58/55岁，15年渐进过渡。弹性退休机制允许提前3年退休（不低于原法定年龄）。", source: "新闻联播 20250105" },
  { date: "2025-01-10", title: "生育补贴制度启动：每孩每年3600元至3岁", dim: "pension", sentiment: "利好", data: ["3600元", "1000万", "至3岁"], summary: "国务院宣布生育补贴制度正式启动：每孩每年发放3600元补贴，持续至3周岁。预计覆盖约1000万新生儿家庭。同时生育保险扩面至灵活就业人员，产假延长至158天以上。", source: "新闻联播 20250110" },
  { date: "2025-01-15", title: "2024年GDP增长5.0%：经济总量超130万亿", dim: "employment", sentiment: "利好", data: ["增长5.0%", "130万亿", "1244万"], summary: "国家统计局发布2024年经济数据：GDP同比增长5.0%，经济总量超130万亿元。城镇新增就业1244万人，新能源汽车产量突破1000万辆。高技术制造业增加值增长8.5%。", source: "新闻联播 20250115" },
  { date: "2025-01-20", title: "春节消费旺季：以旧换新政策带动家电销售增长30%", dim: "finance", sentiment: "利好", data: ["增长30%", "1500亿", "补贴"], summary: "商务部数据显示，春节前夕以旧换新政策效果显著：家电销售同比增长30%，汽车置换增长18%。全年以旧换新补贴资金达1500亿元，覆盖家电、汽车、家装三大领域。", source: "新闻联播 20250120" },
  { date: "2025-02-01", title: "上海人才引进落户新政：留学生/高技能人才直接落户", dim: "employment", sentiment: "利好", data: ["直接落户", "50所", "6个月"], summary: "上海人社局发布人才引进落户新政：世界前50院校留学生可直接落户，前100院校6个月社保即可。高技能人才（高级技师以上）不受学历限制。预计年新增落户超3万人。", source: "新闻联播 20250201" },
  { date: "2025-02-10", title: "LPR下调：5年期降至3.95%房贷成本再降低", dim: "finance", sentiment: "利好", data: ["3.95%", "3.45%", "月供减少"], summary: "央行宣布下调LPR：5年期降至3.95%，1年期降至3.45%。以200万30年房贷计算，月供减少约200元。存量房贷利率同步调整，惠及超1.5亿房贷家庭。", source: "新闻联播 20250210" },
  { date: "2025-02-20", title: "国家教育数字化战略行动升级：智慧教育平台覆盖2.9亿学生", dim: "education", sentiment: "利好", data: ["2.9亿", "AI课堂", "免费"], summary: "教育部宣布国家教育数字化战略行动升级：智慧教育平台已覆盖2.9亿在校学生，上线优质课程超5万门。AI辅助教学工具免费向所有公立学校开放，推动教育资源均等化。", source: "新闻联播 20250220" },
  { date: "2025-03-01", title: "上海生物医药外资高能级项目扶持计划发布", dim: "industry", sentiment: "利好", data: ["500亿", "外资", "全链条"], summary: "上海发布生物医药外资高能级项目扶持计划：设立500亿元产业基金，覆盖研发、临床、生产、商业化全链条。对重大外资项目给予最高10亿元补贴，打造世界级生物医药产业集群。", source: "新闻联播 20250301" },
  { date: "2025-03-05", title: "政府工作报告：2025年GDP目标5%左右", dim: "employment", sentiment: "利好", data: ["5%", "1200万", "新质生产力"], summary: "十四届全国人大三次会议开幕，政府工作报告提出2025年GDP增长目标5%左右，城镇新增就业1200万人以上。报告首提'新质生产力'为第一驱动力，强调科技自立自强。", source: "新闻联播 20250305" },
  { date: "2025-03-15", title: "税收征管法修订：高收入群体监管精准化", dim: "finance", sentiment: "中性", data: ["CRS", "100国", "精准"], summary: "全国人大常委会审议通过税收征收管理法修订案。强化高收入群体税收监管，CRS信息交换网络覆盖100+国家。同时优化小微企业税收优惠，年应纳税所得额300万以下实际税负降至5%。", source: "新闻联播 20250315" },
  { date: "2025-03-20", title: "一季度GDP增长5.3%：实现良好开局", dim: "employment", sentiment: "利好", data: ["增长5.3%", "303万", "8.5%"], summary: "国家统计局发布一季度数据：GDP同比增长5.3%，高于全年目标。城镇新增就业303万人，高技术制造业增加值增长8.5%。消费市场回暖，社会消费品零售总额增长5.8%。", source: "新闻联播 20250320" },
  { date: "2025-04-01", title: "全国已有超200城取消或放松限购：购房门槛历史最低", dim: "housing", sentiment: "利好", data: ["200城", "取消限购", "历史最低"], summary: "住建部统计：全国已有超200个城市取消或大幅放松住房限购政策。一线城市外环区域限购松绑，二三线城市基本全面取消。购房首付比例降至历史最低，房贷利率进入'3时代'。", source: "新闻联播 20250401" },
  { date: "2025-04-10", title: "新质生产力人才缺口报告：新能源/AI/芯片缺口超2000万", dim: "employment", sentiment: "利好", data: ["2000万", "30万+", "6-12月"], summary: "人社部发布新质生产力人才缺口报告：新能源、半导体、AI、生物医药四大领域人才缺口超2000万。芯片设计、AI算法等岗位起薪30万+，技能岗培训6-12个月即可上岗。", source: "新闻联播 20250410" },
  { date: "2025-04-20", title: "个人养老金制度试点满一年：开户超6000万", dim: "pension", sentiment: "利好", data: ["6000万", "12000元", "35%"], summary: "个人养老金制度试点满一年：全国开户超6000万人，实际缴存比例35%。年缴存上限12000元，可投基金、储蓄、保险三类产品。人社部表示将适时提高缴存上限并扩大产品范围。", source: "新闻联播 20250420" },
  { date: "2025-05-01", title: "五一假期旅游人次达2.5亿：旅游收入超1500亿", dim: "finance", sentiment: "利好", data: ["2.5亿", "1500亿", "增长10%"], summary: "文旅部数据：五一假期全国国内旅游出游2.5亿人次，旅游收入超1500亿元，同比增长10%。高铁游、自驾游、县域游成为主流。沉浸式文旅、国潮消费受年轻人追捧。", source: "新闻联播 20250501" },
  { date: "2025-05-10", title: "职业教育法实施三周年：职教毕业生就业率达95%", dim: "education", sentiment: "利好", data: ["95%", "1500所", "同等地位"], summary: "职业教育法修订实施三周年成效：全国1500所高职院校毕业生就业率达95%，部分热门专业超98%。职教与普教同等地位深入人心，'技能中国'行动培养高技能人才超6000万。", source: "新闻联播 20250510" },
  { date: "2025-05-20", title: "前4个月全国一般公共预算收入增长5.2%", dim: "finance", sentiment: "利好", data: ["增长5.2%", "6.2%", "回升"], summary: "财政部数据：前4个月全国一般公共预算收入增长5.2%。国内增值税增长6.2%，反映经济活力持续回升。企业所得税增长4.8%，表明企业盈利能力改善。", source: "新闻联播 20250520" },
  { date: "2025-06-01", title: "上海自贸区金融创新试点扩容：跨境理财通升级", dim: "finance", sentiment: "利好", data: ["跨境", "数字人民币", "扩容"], summary: "上海自贸区金融创新试点扩容：跨境理财通额度提升至300万元，数字人民币跨境支付场景扩大。自贸区内企业跨境融资更加便利，外资金融机构准入进一步放宽。", source: "新闻联播 20250601" },
  { date: "2025-06-10", title: "全国高校毕业生就业促进月启动：1268万个岗位", dim: "employment", sentiment: "利好", data: ["1268万", "2.3万场", "1187万"], summary: "人社部启动2025年高校毕业生就业促进月：全国举办2.3万场招聘会，提供1268万个就业岗位。今年高校毕业生预计1187万人，同比增加21万人。重点帮扶困难毕业生就业。", source: "新闻联播 20250610" },
  { date: "2025-06-15", title: "上半年新能源汽车产销超600万辆：渗透率突破40%", dim: "industry", sentiment: "利好", data: ["600万辆", "40%", "全球第一"], summary: "中汽协数据：上半年新能源汽车产销超600万辆，市场渗透率突破40%。充电基础设施加速布局，公共充电桩超350万台。智能网联汽车占比超30%，中国汽车产业加速转型升级。", source: "新闻联播 20250615" },
  { date: "2025-06-20", title: "全国住房公积金制度惠及面扩大：灵活就业可自愿缴存", dim: "housing", sentiment: "利好", data: ["灵活就业", "自愿", "提取放宽"], summary: "住建部宣布住房公积金制度扩面：灵活就业人员可自愿缴存公积金，享受与在职职工同等贷款权益。提取条件进一步放宽，租房提取额度提高，装修提取取消限制。", source: "新闻联播 20250620" },
  { date: "2025-06-25", title: "'十四五'规划主要指标提前完成：经济总量超130万亿", dim: "industry", sentiment: "利好", data: ["130万亿", "提前", "高质量"], summary: "国家发改委宣布'十四五'规划主要经济指标提前完成：经济总量超130万亿元，人均GDP超9万元。研发投入占GDP比重达2.8%，城镇化率超67%。绿色发展指标全面达标。", source: "新闻联播 20250625" }
];

/* ── 新闻富化：人物相关性标签 + 行动建议 ──────────────────── */
// 维度→人物画像映射
const dimPersonaMap = {
  housing: ['worker','homebuyer','investor'],
  employment: ['worker','startup','parent'],
  education: ['parent','worker'],
  pension: ['elder','parent'],
  elderly: ['elder'],
  finance: ['worker','investor','startup','homebuyer'],
  industry: ['startup','investor','worker'],
}
// 新闻维度→风向标决策域映射
const newsDimToCompass = { housing:'housing', employment:'career', education:'education', pension:'retirement', elderly:'retirement', finance:'investment', industry:'business' }
// 维度图标映射
const dimensionIcons = { housing:'🏠', employment:'💼', education:'🎓', elderly:'👴', pension:'👴', finance:'💰', industry:'🏭' }
// 根据新闻维度和情感生成行动建议
// userProfile: 可选，传入后可计算个人匹配度
const compassKeyDomains = ['investment','career','housing','education','fertility','retirement','consumption','business']
export function enrichNewsForPersona(news, personaKey, userProfile) {
  const relevantPersonas = dimPersonaMap[news.dim] || ['worker']
  const isRelevant = personaKey ? relevantPersonas.includes(personaKey) : true
  const impact = news.sentiment === '利好' ? '高' : news.sentiment === '利空' ? '高' : '中'
  const compassDomain = newsDimToCompass[news.dim] || 'career'
  let actionHint = ''
  if (news.dim === 'housing') actionHint = '关注购房/租房相关补贴和利率变化'
  else if (news.dim === 'employment') actionHint = '关注社保、就业补贴和灵活就业政策'
  else if (news.dim === 'education') actionHint = '关注子女教育和入学政策变化'
  else if (news.dim === 'pension' || news.dim === 'elderly') actionHint = '关注养老、医保和长期护理政策'
  else if (news.dim === 'finance') actionHint = '关注个税、贷款利率和投资环境'
  else if (news.dim === 'industry') actionHint = '关注产业政策和创业扶持'
  // 计算个人匹配度（基于风向标数据）
  let personalMatch = 'low'
  if (userProfile && Object.keys(userProfile).length > 0) {
    try {
      const compass = getPolicyCompass(personaKey || 'worker', userProfile)
      if (compass && compass.byDomain) {
        const domainData = compass.byDomain[compassDomain]
        if (domainData && domainData.length >= 2) personalMatch = 'high'
        else if (domainData && domainData.length >= 1) personalMatch = 'medium'
      }
    } catch { personalMatch = 'low' }
  }
  const matchLabel = { high:'⚡与你的决策高度相关', medium:'📡与你相关', low:'' }
  return { ...news, impact, relevance: relevantPersonas, actionHint, isRelevant, dimIcon: dimensionIcons[news.dim] || '📡', compassDomain, personalMatch, personalMatchLabel: matchLabel[personalMatch] || '' }
}
// 按人物画像过滤+排序新闻
// userProfile: 可选，用于计算个人匹配度
export function getNewsForPersona(personaKey, limit = 10, userProfile) {
  return newsLianboUpdates
    .map(n => enrichNewsForPersona(n, personaKey, userProfile))
    .filter(n => n.isRelevant)
    .sort((a, b) => {
      // 利好优先，然后按日期
      if (a.sentiment === '利好' && b.sentiment !== '利好') return -1
      if (a.sentiment !== '利好' && b.sentiment === '利好') return 1
      return b.date.localeCompare(a.date)
    })
    .slice(0, limit)
}
// 新闻按维度分组
export function getNewsByDimension() {
  const groups = {}
  newsLianboUpdates.forEach(n => {
    const enriched = enrichNewsForPersona(n, null)
    if (!groups[n.dim]) groups[n.dim] = { dim: n.dim, icon: dimensionIcons[n.dim] || '📡', label: {housing:'住房',employment:'就业',education:'教育',pension:'养老',elderly:'养老',finance:'金融',industry:'产业'}[n.dim] || n.dim, items: [],利好:0,中性:0,利空:0 }
    groups[n.dim].items.push(enriched)
    groups[n.dim][n.sentiment] = (groups[n.dim][n.sentiment] || 0) + 1
  })
  return Object.values(groups).sort((a, b) => b.items.length - a.items.length)
}

/* ── 人生雷达数据 ──────────────────────────────────────────── */
export const lifeRadar = {
  // 人生阶段（比 persona 更细粒度）
  stages: [
    {
      key: 'young_single', icon: '🧑', label: '初入社会', ageRange: '22-28',
      desc: '刚毕业/单身/租房/攒第一桶金',
      weights: { housing: 0.10, employment: 0.30, education: 0.15, elderly: 0.05, finance: 0.25, industry: 0.15 },
      blindSpotHints: ['公积金缴存基数影响未来贷款额度', '社保断缴影响购房资格']
    },
    {
      key: 'newlywed', icon: '💑', label: '新婚/备孕', ageRange: '25-35',
      desc: '买房/结婚/准备生育',
      weights: { housing: 0.35, employment: 0.20, education: 0.15, elderly: 0.10, finance: 0.15, industry: 0.05 },
      blindSpotHints: ['生育津贴和产假政策', '首套房契税优惠']
    },
    {
      key: 'young_parent', icon: '👨\u200d👩\u200d👧', label: '学龄家长', ageRange: '30-42',
      desc: '孩子上学/学区/课外教育',
      weights: { housing: 0.15, employment: 0.15, education: 0.40, elderly: 0.10, finance: 0.10, industry: 0.10 },
      blindSpotHints: ['多校划片政策变化', '双减政策后续调整']
    },
    {
      key: 'mid_career', icon: '👔', label: '事业上升期', ageRange: '30-45',
      desc: '升职加薪/副业/投资',
      weights: { housing: 0.15, employment: 0.30, education: 0.10, elderly: 0.10, finance: 0.25, industry: 0.10 },
      blindSpotHints: ['个税专项附加扣除项最大化', '个人养老金账户节税']
    },
    {
      key: 'approaching_retire', icon: '🏖️', label: '临近退休', ageRange: '50-65',
      desc: '规划养老/医疗保障',
      weights: { housing: 0.10, employment: 0.10, education: 0.05, elderly: 0.45, finance: 0.20, industry: 0.10 },
      blindSpotHints: ['延迟退休具体实施时间表', '长期护理保险试点']
    },
    {
      key: 'entrepreneur', icon: '🚀', label: '创业者', ageRange: '25-50',
      desc: '开公司/个体经营',
      weights: { housing: 0.05, employment: 0.15, education: 0.05, elderly: 0.10, finance: 0.30, industry: 0.35 },
      blindSpotHints: ['小微企业税收优惠', '营商环境改革新举措']
    },
  ],

  // 雷达信号（每条定义一个政策信号）
  signals: [
    // ═══ 机会类 (opportunity) ═══
    { id: 'gjj_loose', type: 'opportunity', dims: ['housing'],
      title: '公积金政策历史最宽松', priority: 'high',
      desc: '公积金提取条件放宽、覆盖灵活就业者，首套最高贷240万',
      action: '立即确认你的公积金额度和提取条件',
      stageMatch: ['young_single','newlywed','mid_career'] },
    { id: 'house_tax_pause', type: 'opportunity', dims: ['housing'],
      title: '房地产税试点暂缓', priority: 'medium',
      desc: '短期内不会新增房产持有成本，可安心持有',
      action: '关注立法动态，暂不需调整房产配置',
      stageMatch: ['newlywed','mid_career','approaching_retire'] },
    { id: 'swap_house_refund', type: 'opportunity', dims: ['housing'],
      title: '换房退税延续至2027年底', priority: 'high',
      desc: '卖掉旧房买新房，已缴个税可全额退还，改善型置换窗口期',
      action: '评估是否需要置换，计算退税金额',
      stageMatch: ['newlywed','mid_career','approaching_retire'] },
    { id: 'lpr_low', type: 'opportunity', dims: ['finance','housing'],
      title: '房贷利率创历史新低约3.1%', priority: 'high',
      desc: '个人住房贷款利率降至约3.1%，企业贷款利率约3.0%，融资成本极低',
      action: '考虑是否需要贷款购房或置换',
      stageMatch: ['young_single','newlywed','mid_career','entrepreneur'] },
    { id: 'gdp_growth', type: 'opportunity', dims: ['employment'],
      title: '上半年GDP增长4.7%经济稳健', priority: 'medium',
      desc: '经济总量达69.6万亿元，就业形势总体稳定',
      action: '把握就业市场机遇，关注高薪行业',
      stageMatch: ['young_single','mid_career','entrepreneur'] },
    { id: 'consumption_subsidy', type: 'opportunity', dims: ['finance'],
      title: '以旧换新补贴1875亿元已下达', priority: 'medium',
      desc: '第三批625亿元超长期特别国债支持消费品以旧换新，家电汽车可领补贴',
      action: '查看家电/汽车以旧换新补贴申领方式',
      stageMatch: ['young_single','newlywed','mid_career','approaching_retire'] },
    { id: 'ne_vehicle', type: 'opportunity', dims: ['finance','industry'],
      title: '新能源车注册占比近半', priority: 'medium',
      desc: '上半年新注册新能源车519.5万辆，占比近半，充电基础设施加速布局',
      action: '考虑置换新能源车，享受购置税减免',
      stageMatch: ['young_single','newlywed','mid_career'] },
    { id: 'ai_industry_boom', type: 'opportunity', dims: ['industry','employment'],
      title: 'AI产业规模突破1.2万亿', priority: 'high',
      desc: '人工智能产业高速发展，带来大量就业机会和投资风口',
      action: '关注AI相关岗位或创业方向',
      stageMatch: ['young_single','mid_career','entrepreneur'] },
    { id: 'social_insurance_expand', type: 'opportunity', dims: ['elderly'],
      title: '基本医保参保人数达13.19亿', priority: 'medium',
      desc: '医保基金收入增长8.49%，保障覆盖面持续扩大',
      action: '确认医保待遇享受情况',
      stageMatch: ['approaching_retire','young_parent','newlywed'] },
    { id: 'trade_strong', type: 'opportunity', dims: ['industry'],
      title: '上半年进出口增长16.9%', priority: 'medium',
      desc: '外贸规模首破25万亿元，出口导向型企业迎来良好机遇',
      action: '关注外贸相关行业就业机会',
      stageMatch: ['entrepreneur','mid_career'] },

    // ═══ 盲区类 (blindspot) ═══
    { id: 'pension_account', type: 'blindspot', dims: ['elderly','finance'],
      title: '个人养老金账户每年可省税5400元', priority: 'high',
      desc: '多数人不知道的个人养老金税收优惠，年缴12000元可抵扣个税，退休后领取时仅按3%缴税',
      action: '立即开通个人养老金账户并缴存',
      stageMatch: ['mid_career','approaching_retire','young_single'] },
    { id: 'edu_ai_policy', type: 'blindspot', dims: ['education','industry'],
      title: 'AI教育工具合规新要求', priority: 'medium',
      desc: '生成式AI管理办法要求校园AI应用需符合算法备案要求，家长需关注',
      action: '了解孩子使用的AI学习工具是否合规',
      stageMatch: ['young_parent'] },
    { id: 'gjj_base_affects_loan', type: 'blindspot', dims: ['housing','finance'],
      title: '公积金缴存基数影响未来贷款额度', priority: 'high',
      desc: '很多人不知道公积金贷款额度与缴存基数挂钩，低基数缴存可能导致未来贷款额度不足',
      action: '查看公积金缴存基数，必要时申请调整',
      stageMatch: ['young_single','newlywed'] },
    { id: 'social_insurance_break', type: 'blindspot', dims: ['employment','housing'],
      title: '社保断缴影响购房资格', priority: 'high',
      desc: '跳槽或离职期间社保断缴可能导致购房资格重新计算，影响购房计划',
      action: '换工作前确认社保连续性，必要时代缴',
      stageMatch: ['young_single','newlywed'] },
    { id: 'tax_deduction_max', type: 'blindspot', dims: ['finance'],
      title: '个税专项附加扣除项可能没填全', priority: 'medium',
      desc: '子女教育、继续教育、大病医疗、住房贷款、住房租金、赡养老人、婴幼儿照护等7项扣除，很多人没填全',
      action: '检查个税APP中的专项附加扣除是否完整',
      stageMatch: ['mid_career','young_parent','newlywed'] },
    { id: 'delayed_retire_timeline', type: 'blindspot', dims: ['elderly','employment'],
      title: '延迟退休具体时间表尚未公布', priority: 'medium',
      desc: '渐进式延迟退休已在立法规划中，但具体实施时间表和对各年龄段的影响尚未明确',
      action: '持续关注延迟退休立法进展',
      stageMatch: ['mid_career','approaching_retire'] },
    { id: 'care_insurance_pilot', type: 'blindspot', dims: ['elderly'],
      title: '长期护理保险试点城市扩围', priority: 'medium',
      desc: '长期护理保险被称为社保第六险，试点城市已扩至49个，但多数人不知道如何申请',
      action: '确认你所在城市是否在试点范围内',
      stageMatch: ['approaching_retire','mid_career'] },
    { id: 'multi_school_zone', type: 'blindspot', dims: ['education'],
      title: '多校划片政策可能改变学区价值', priority: 'high',
      desc: '部分城市推进多校划片，学区房价值可能大幅变化，影响教育规划和房产配置',
      action: '了解所在区域是否实施多校划片',
      stageMatch: ['young_parent'] },
    { id: 'small_business_tax', type: 'blindspot', dims: ['finance','industry'],
      title: '小微企业年应纳税所得额优惠', priority: 'high',
      desc: '小微企业年应纳税所得额不超过300万元的部分，实际税负仅5%，很多创业者不知道',
      action: '确认企业是否符合小微企业标准并享受优惠',
      stageMatch: ['entrepreneur'] },
    { id: 'freelancer_social_insurance', type: 'blindspot', dims: ['employment','elderly'],
      title: '灵活就业者可参加职工社保', priority: 'medium',
      desc: '很多自由职业者不知道可以以灵活就业身份参加职工养老和医疗保险',
      action: '到社保局办理灵活就业参保',
      stageMatch: ['young_single','entrepreneur'] },

    // ═══ 风险类 (risk) ═══
    { id: 'house_tax_future', type: 'risk', dims: ['housing'],
      title: '房地产税立法研究未停', priority: 'high',
      desc: '虽暂缓试点但立法研究持续推进，多套房持有成本未来可能显著增加',
      action: '评估房产配置，考虑是否需要优化',
      stageMatch: ['mid_career','approaching_retire','newlywed'] },
    { id: 'retire_delay', type: 'risk', dims: ['elderly','employment'],
      title: '延迟退休方案推进中', priority: 'high',
      desc: '渐进式延迟退休已在立法规划中，将影响退休时间和养老金计算方式',
      action: '重新测算退休时间和养老金缺口',
      stageMatch: ['mid_career','approaching_retire'] },
    { id: 'job_market_pressure', type: 'risk', dims: ['employment'],
      title: 'AI替代部分岗位风险', priority: 'medium',
      desc: 'AI产业高速发展同时，部分重复性岗位面临替代风险，需关注职业转型',
      action: '评估岗位被AI替代的可能性，提前学习新技能',
      stageMatch: ['young_single','mid_career'] },
    { id: 'house_price_risk', type: 'risk', dims: ['housing'],
      title: '政策底不等于市场底', priority: 'medium',
      desc: '历史经验显示限购大幅松绑往往出现在市场下行期，短期资产升值预期不宜过高',
      action: '购房需结合供需和经济基本面判断，避免追涨',
      stageMatch: ['newlywed','mid_career'] },
    { id: 'edu_burden', type: 'risk', dims: ['education'],
      title: '双减政策后续调整不确定', priority: 'medium',
      desc: '双减政策持续推进，但课外培训监管力度和方式可能调整，教育规划需保持灵活',
      action: '关注教育政策动态，做好多元化教育规划',
      stageMatch: ['young_parent'] },
    { id: 'medical_cost_rise', type: 'risk', dims: ['elderly'],
      title: '医疗费用持续上涨', priority: 'medium',
      desc: '虽然医保覆盖面扩大，但个人自付部分和高端医疗需求仍面临费用上涨压力',
      action: '考虑补充商业医疗保险',
      stageMatch: ['approaching_retire','mid_career'] },
    { id: 'interest_rate_risk', type: 'risk', dims: ['finance'],
      title: '无风险收益持续下行', priority: 'medium',
      desc: '存款利率市场化加速，大额存单利率持续走低，传统理财收益缩水',
      action: '调整理财策略，考虑多元化资产配置',
      stageMatch: ['mid_career','approaching_retire','entrepreneur'] },
    { id: 'ecommerce_law', type: 'risk', dims: ['industry'],
      title: '电子商务法修正征求意见', priority: 'low',
      desc: '电商法修正可能影响线上经营者，合规要求可能提高',
      action: '关注电商法修正草案进展',
      stageMatch: ['entrepreneur'] },
    { id: 'trade_war_risk', type: 'risk', dims: ['industry','employment'],
      title: '外部贸易环境不确定性', priority: 'medium',
      desc: '虽然上半年外贸增长强劲，但国际贸易摩擦风险持续存在，出口导向型行业需关注',
      action: '评估所在行业受贸易摩擦影响程度',
      stageMatch: ['entrepreneur','mid_career'] },

    // ═══ 城市安家相关信号 ═══
    { id: 'city_settle_hukou', type: 'opportunity', dims: ['housing'],
      title: '多城落户政策阶段性放松', priority: 'high',
      desc: '杭州、南京、苏州等新一线城市大幅降低落户门槛，大专以上学历基本零门槛落户',
      action: '了解目标城市的落户条件和最新政策窗口',
      stageMatch: ['young_single','newlywed','mid_career'] },
    { id: 'city_talent_intro', type: 'opportunity', dims: ['employment'],
      title: '人才引进补贴政策加码', priority: 'high',
      desc: '多地推出人才购房补贴（最高百万级）、生活补贴、创业扶持，本科及以上学历均有覆盖',
      action: '查询目标城市的人才引进目录和补贴标准',
      stageMatch: ['young_single','mid_career'] },
    { id: 'city_social_chain', type: 'blindspot', dims: ['employment','housing'],
      title: '社保连续性影响购房/落户资格', priority: 'high',
      desc: '大多数限购城市要求连续缴纳社保X年以上（不可断缴），跳槽空窗期可能导致资格重置',
      action: '跳槽前确认社保衔接方案，避免断缴影响购房计划',
      stageMatch: ['young_single','newlywed','mid_career'] },
    { id: 'city_gjj_impact', type: 'blindspot', dims: ['housing','finance'],
      title: '公积金缴存基数影响贷款上限', priority: 'medium',
      desc: '公积金贷款额度与账户余额和月缴存额挂钩，部分城市已上调最高额度至240万',
      action: '通过公积金中心查询可贷额度，提前规划',
      stageMatch: ['young_single','newlywed'] },
    { id: 'city_edu_path', type: 'blindspot', dims: ['education'],
      title: '非户籍子女入学路径需提前规划', priority: 'high',
      desc: '多数城市实行积分入学或居住证+社保年限排序，热门学区需提前3-5年准备',
      action: '了解目标城市的入学积分政策和时间窗口',
      stageMatch: ['newlywed','young_parent'] },
    { id: 'city_house_tax_future', type: 'risk', dims: ['housing','finance'],
      title: '房地产税试点扩围预期', priority: 'medium',
      desc: '官方多次提及完善房地产税制度，多套房持有成本可能上升，需关注试点城市扩容节奏',
      action: '合理配置房产，避免过度集中持有',
      stageMatch: ['newlywed','mid_career','approaching_retire'] },
  ],

  // persona → stage 映射
  personaStageMap: {
    worker: 'mid_career',
    buyer: 'newlywed',
    parent: 'young_parent',
    investor: 'mid_career',
    freelancer: 'entrepreneur',
  }
};

/* ═══════ 城市安家政策数据集 ═══════ */
export const citySettlementData = {
  cities: [
    { key: 'beijing', name: '北京', icon: '🏛', region: 'jingjinji',
      difficulty: 5,
      hukou: { passScore: 100, edu: { junior:0, high:10, college:20, bachelor:30, master:40, doctor:50 },
        socialPerYear: 3, socialMax: 30, ageYoung:20, ageMid:15, ageMidLate:10, ageLate:5, innovation:12, taxPerYear:2, taxMax:20 },
      house: { needSocialYears:5, needTaxYears:5, needMarriage:false },
      edu: { path:'积分落户或人才引进', note:'居住证+连续社保5年+积分排序' },
      talentSubsidy: '无统一补贴，各区人才计划不同',
      gjjMaxLoan: 120, secondGjjMaxLoan: 80,
      summary: '难度最大，积分落户年分数线约100分，竞争极其激烈' },

    { key: 'shanghai', name: '上海', icon: '🏙', region: 'yangtze_delta',
      difficulty: 5,
      hukou: { passScore: 120, edu: { junior:0, high:10, college:20, bachelor:30, master:40, doctor:50 },
        socialPerYear: 3, socialMax: 30, ageYoung:30, ageMid:25, ageMidLate:15, ageLate:5, innovation:20, taxPerYear:2, taxMax:24 },
      house: { needSocialYears:5, needTaxYears:5, needMarriage:true },
      edu: { path:'居住证积分达标120分', note:'居住证+社保+积分满120分可入学' },
      talentSubsidy: '应届硕士直接落户，留学生落户快速通道',
      gjjMaxLoan: 130, secondGjjMaxLoan: 100,
      summary: '居转户需7年，但人才引进渠道较多，名校硕博有直通车' },

    { key: 'guangzhou', name: '广州', icon: '🌉', region: 'greater_bay',
      difficulty: 3,
      hukou: { passScore: 85, edu: { junior:5, high:20, college:30, bachelor:40, master:50, doctor:60 },
        socialPerYear: 5, socialMax: 30, ageYoung:30, ageMid:25, ageMidLate:15, ageLate:5, innovation:10, taxPerYear:2, taxMax:20 },
      house: { needSocialYears:2, needTaxYears:2, needMarriage:false },
      edu: { path:'积分入学或政策性借读', note:'积分入学按分数排序' },
      talentSubsidy: '本科以上可落户，黄埔区有人才购房补贴',
      gjjMaxLoan: 100, secondGjjMaxLoan: 70,
      summary: '一线城市中落户最友好，本科+社保即有资格' },

    { key: 'shenzhen', name: '深圳', icon: '🏗', region: 'greater_bay',
      difficulty: 2,
      hukou: { passScore: 100, edu: { junior:5, high:20, college:30, bachelor:40, master:50, doctor:60 },
        socialPerYear: 3, socialMax: 24, ageYoung:30, ageMid:25, ageMidLate:15, ageLate:5, innovation:10, taxPerYear:2, taxMax:20 },
      house: { needSocialYears:3, needTaxYears:3, needMarriage:false },
      edu: { path:'深户优先+积分入学', note:'深户子女保障公办学位' },
      talentSubsidy: '本科1.5万、硕士2.5万、博士3万租房补贴',
      gjjMaxLoan: 126, secondGjjMaxLoan: 90,
      summary: '人才引进力度大，本科学历可快速落户' },

    { key: 'hangzhou', name: '杭州', icon: '🌊', region: 'yangtze_delta',
      difficulty: 2,
      hukou: { passScore: 60, edu: { junior:10, high:20, college:30, bachelor:40, master:50, doctor:60 },
        socialPerYear: 3, socialMax: 24, ageYoung:30, ageMid:25, ageMidLate:15, ageLate:5, innovation:10, taxPerYear:2, taxMax:20 },
      house: { needSocialYears:2, needTaxYears:2, needMarriage:false },
      edu: { path:'落户后按学区入学', note:'非杭籍需居住证+社保' },
      talentSubsidy: '本科1万、硕士3万、博士5万生活补贴',
      gjjMaxLoan: 100, secondGjjMaxLoan: 80,
      summary: '大专以上可落户，人才补贴力度大，互联网从业者友好' },

    { key: 'nanjing', name: '南京', icon: '🏯', region: 'yangtze_delta',
      difficulty: 2,
      hukou: { passScore: 100, edu: { junior:5, high:15, college:25, bachelor:35, master:45, doctor:55 },
        socialPerYear: 4, socialMax: 28, ageYoung:25, ageMid:20, ageMidLate:10, ageLate:5, innovation:8, taxPerYear:2, taxMax:16 },
      house: { needSocialYears:1, needTaxYears:1, needMarriage:false },
      edu: { path:'落户后按学区入学', note:'非户籍需居住证+社保+积分' },
      talentSubsidy: '本科600元/月租房补贴（3年）',
      gjjMaxLoan: 100, secondGjjMaxLoan: 60,
      summary: '本科以上落户基本零门槛，1年社保即可购房' },

    { key: 'suzhou', name: '苏州', icon: '🏞', region: 'yangtze_delta',
      difficulty: 2,
      hukou: { passScore: 100, edu: { junior:5, high:15, college:25, bachelor:35, master:45, doctor:55 },
        socialPerYear: 4, socialMax: 28, ageYoung:25, ageMid:20, ageMidLate:10, ageLate:5, innovation:8, taxPerYear:2, taxMax:16 },
      house: { needSocialYears:1, needTaxYears:1, needMarriage:false },
      edu: { path:'积分入学制', note:'按居住证积分排序入学' },
      talentSubsidy: '本科及以上直接落户，园区有人才优购房',
      gjjMaxLoan: 90, secondGjjMaxLoan: 60,
      summary: '本科直接落户，1年社保即可购房，工业园区产业配套完善' },

    { key: 'chengdu', name: '成都', icon: '🐼', region: 'chengyu',
      difficulty: 1,
      hukou: { passScore: 100, edu: { junior:10, high:20, college:30, bachelor:40, master:50, doctor:60 },
        socialPerYear: 3, socialMax: 24, ageYoung:25, ageMid:20, ageMidLate:10, ageLate:5, innovation:5, taxPerYear:1, taxMax:12 },
      house: { needSocialYears:1, needTaxYears:1, needMarriage:false },
      edu: { path:'落户后按学区入学', note:'非蓉籍需居住证+社保' },
      talentSubsidy: '本科及以上可落户，部分区域有人才公寓',
      gjjMaxLoan: 80, secondGjjMaxLoan: 50,
      summary: '落户门槛低，生活成本适中，适合年轻人定居' },
  ],
};

/** 各城市人才补贴详细数据 */
export const citySubsidies = [
  { cityKey: 'beijing', categories: [
    { type: 'talent', label: '🏆 人才引进补贴', target: '硕博或高端人才', edu: ['master','doctor'],
      items: ['朝阳区凤凰计划10-50万','中关村高端人才60万','博士后科研经费20万'] },
    { type: 'housing', label: '🏠 住房保障', target: '各类人才', edu: ['bachelor','master','doctor'],
      items: ['人才公寓配租','共有产权房优先配售','公积金贷款额度上浮'] },
    { type: 'family', label: '👨‍👩‍👧‍👦 家庭配套', target: '认定人才', edu: [],
      items: ['子女入学优先安排','配偶就业协助'] },
  ]},
  { cityKey: 'shanghai', categories: [
    { type: 'talent', label: '🏆 人才引进补贴', target: '硕博或海归', edu: ['master','doctor'],
      items: ['浦江人才计划15-30万','青年英才10万','海归创业资助'] },
    { type: 'housing', label: '🏠 住房保障', target: '各类人才', edu: ['bachelor','master','doctor'],
      items: ['人才公寓配租','临港购房优惠','租房补贴提取公积金'] },
  ]},
  { cityKey: 'guangzhou', categories: [
    { type: 'talent', label: '🏆 人才引进补贴', target: '大专以上', edu: ['college','bachelor','master','doctor'],
      items: ['南沙区人才奖6-12万','黄埔区租房补贴2.5万/年','高层次人才购房补最高100万'] },
    { type: 'housing', label: '🏠 住房保障', target: '无限制', edu: [],
      items: ['人才公寓配租','购房优惠资格认定'] },
  ]},
  { cityKey: 'shenzhen', categories: [
    { type: 'talent', label: '🏆 人才引进补贴', target: '大专以上', edu: ['college','bachelor','master','doctor'],
      items: ['租房补贴：本科1.5万、硕士2.5万、博士3万','高层次人才奖励50-150万','博士后进站补贴'] },
    { type: 'housing', label: '🏠 住房保障', target: '各类人才', edu: ['bachelor','master','doctor'],
      items: ['人才房配售市价60%','公积金贷款额度上浮20%','领军人才免租金住房'] },
  ]},
  { cityKey: 'hangzhou', categories: [
    { type: 'talent', label: '🏆 人才引进补贴', target: '本科以上', edu: ['bachelor','master','doctor'],
      items: ['生活补贴：本科1万、硕士3万、博士5万','租房补贴本科及以上每年1万×3年','应届生额外补贴'] },
    { type: 'housing', label: '🏠 住房保障', target: '认定人才', edu: ['master','doctor'],
      items: ['人才公寓配租','E类以上购房补贴20-80万','公积金贷款额度上浮50%'] },
    { type: 'edu', label: '🎓 子女教育', target: 'A-E类人才', edu: ['master','doctor'],
      items: ['子女入学统筹安排','部分优质学校优先'] },
  ]},
  { cityKey: 'nanjing', categories: [
    { type: 'talent', label: '🏆 人才引进补贴', target: '本科以上', edu: ['bachelor','master','doctor'],
      items: ['租房补贴本科600元/月、硕士800元/月×3年','高层次人才购房补贴'] },
    { type: 'housing', label: '🏠 住房保障', target: '认定人才', edu: ['master','doctor'],
      items: ['人才购房优惠','人才公寓配租'] },
  ]},
  { cityKey: 'suzhou', categories: [
    { type: 'talent', label: '🏆 人才引进补贴', target: '本科以上', edu: ['bachelor','master','doctor'],
      items: ['姑苏人才计划资助','工业园人才补贴','紧缺人才薪酬补贴'] },
    { type: 'housing', label: '🏠 住房保障', target: '园区企业', edu: [],
      items: ['人才优购房（园区）','人才公寓配租','公积金优惠政策'] },
  ]},
  { cityKey: 'chengdu', categories: [
    { type: 'talent', label: '🏆 人才引进补贴', target: '本科以上', edu: ['bachelor','master','doctor'],
      items: ['本科落户奖励','高层次人才资助100万','紧缺人才安家补贴'] },
    { type: 'housing', label: '🏠 住房保障', target: '各类人才', edu: ['bachelor','master','doctor'],
      items: ['人才公寓8.5折购房','先租后售保障','公积金额度优惠'] },
  ]},
]

/** 根据学历筛选符合条件的补贴 */
export function calcEligibleSubsidies(cityKey, eduKey) {
  const city = citySubsidies.find(s => s.cityKey === cityKey)
  if (!city) return []
  return city.categories.map(cat => ({
    ...cat,
    eligible: cat.edu.length === 0 || cat.edu.includes(eduKey),
  }))
}

/** 计算落户评分 */
export function calcSettlementScore(cityKey, user) {
  const city = citySettlementData.cities.find(c => c.key === cityKey)
  if (!city) return { score: 0, pass: false, gap: 0, details: [] }
  const h = city.hukou
  const details = []
  let score = 0
  // 教育
  const eduKey = user.edu || 'high'
  const eduScore = h.edu[eduKey] || 0
  score += eduScore
  details.push({ label: '学历加分', value: `+${eduScore}`, key: eduKey })
  // 社保
  const years = Math.floor(user.socialMonths / 12)
  const socialScore = Math.min(years * h.socialPerYear, h.socialMax)
  score += socialScore
  details.push({ label: '社保年限加分', value: `+${socialScore}（${years}年）` })
  // 年龄
  let ageScore = 0
  if (user.age < 30) ageScore = h.ageYoung
  else if (user.age < 40) ageScore = h.ageMid
  else if (user.age < 50) ageScore = h.ageMidLate
  else ageScore = h.ageLate
  score += ageScore
  details.push({ label: '年龄加分', value: `+${ageScore}` })
  // 纳税（按年收入折算）
  const taxScore = Math.min(Math.floor(user.income / 10) * h.taxPerYear, h.taxMax)
  score += taxScore
  details.push({ label: '纳税贡献加分', value: `+${taxScore}` })
  // 创新能力加分（假设有本科以上学历）
  const highEdu = ['college','bachelor','master','doctor'].includes(eduKey)
  if (highEdu && h.innovation) {
    score += h.innovation
    details.push({ label: '学历/创新加分', value: `+${h.innovation}` })
  }
  const gap = score >= h.passScore ? 0 : h.passScore - score
  return { score, pass: score >= h.passScore, gap, passScore: h.passScore, details, city: city.name, difficulty: city.difficulty }
}

/** 计算购房资格等待时间 */
export function calcHouseQualify(cityKey, user) {
  const city = citySettlementData.cities.find(c => c.key === cityKey)
  if (!city) return { qualify: false, waitMonths: 0, waitYears: 0 }
  const need = city.house.needSocialYears
  const have = Math.floor(user.socialMonths / 12)
  const remaining = Math.max(0, need - have)
  return {
    qualify: have >= need,
    waitMonths: remaining * 12,
    waitYears: remaining,
    needYears: need,
    haveYears: have,
    needMarriage: city.house.needMarriage,
    isMarried: user.married || false,
    city: city.name,
  }
}

/** 计算公积金贷款对比商贷的利息节省 */
export function calcGjjSavings(cityKey, budget) {
  const city = citySettlementData.cities.find(c => c.key === cityKey)
  if (!city) return null
  const loanWan = Math.min(Math.round(budget * 0.7 / 10) * 10, city.gjjMaxLoan)
  if (loanWan <= 0) return null
  const principal = loanWan * 10000
  const months = 360
  const r1 = 0.0285 / 12, r2 = 0.033 / 12
  const m1 = Math.round(principal * r1 * Math.pow(1 + r1, months) / (Math.pow(1 + r1, months) - 1))
  const m2 = Math.round(principal * r2 * Math.pow(1 + r2, months) / (Math.pow(1 + r2, months) - 1))
  return {
    loanAmount: loanWan,
    gjjMonthly: m1, comMonthly: m2,
    monthlySaving: m2 - m1,
    totalSaving: Math.round((m2 - m1) * months / 10000 * 10) / 10,
    gjjRate: '2.85%', comRate: '3.30%',
  }
}

/**
 * 分数趋势：记录上次计算分数到 localStorage，返回变化趋势
 * @param {Array} dims - 维度数组（含 key 和计算后的分数 idx）
 * @returns {Object} { trends: { dimKey: { direction, delta, current, previous } } }
 */
export function getScoreTrend(dims) {
  try {
    const cached = JSON.parse(localStorage.getItem('score_cache') || '{}')
    const trends = {}
    const now = {}
    dims.forEach(d => {
      const key = d.key
      const cur = d.idx
      now[key] = cur
      if (cached.scores && cached.scores[key] !== undefined) {
        const prev = cached.scores[key]
        const delta = cur - prev
        trends[key] = {
          direction: delta > 1 ? 'up' : delta < -1 ? 'down' : 'flat',
          delta: delta > 0 ? `+${Math.round(delta)}` : `${Math.round(delta)}`,
          current: cur,
          previous: prev,
        }
      } else {
        trends[key] = { direction: 'flat', delta: '0', current: cur, previous: cur }
      }
    })
    localStorage.setItem('score_cache', JSON.stringify({ scores: now, timestamp: new Date().toISOString() }))
    return { trends }
  } catch {
    return { trends: {} }
  }
}

/**
 * 计算维度分数 vs 区域基准
 * @param {number} dimScore - 某维度的分数
 * @param {Array} allScores - 所有维度的分数数组 [{ key, idx }]
 * @returns {Object} { diff, direction, avg }
 */
export function calcScoreVsBaseline(dimScore, allScores) {
  const scores = allScores.filter(s => s.idx != null).map(s => s.idx)
  if (scores.length < 2) return { diff: 0, direction: 'neutral', avg: dimScore }
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  const diff = dimScore - avg
  return {
    diff: diff > 0 ? `+${diff}` : `${diff}`,
    direction: diff > 2 ? 'above' : diff < -2 ? 'below' : 'neutral',
    avg,
  }
}

/**
 * 统一行动存储：将 actionPlans、雷达信号、雷达推荐行动合并为统一结构
 * @param {string} personaKey
 * @param {string} stageKey
 * @returns {Array} unifiedActions
 */
export function getUnifiedActions(personaKey, stageKey) {
  const unified = []

  // 1. 从 actionPlans 收集
  const plans = actionPlans[personaKey] || []
  plans.forEach(p => {
    unified.push({
      id: p.id,
      source: 'actionPlans',
      title: p.title,
      steps: p.steps || [],
      urgency: p.urgency || 'watch',
      benefit: p.benefit || null,
      policyRef: p.policyRef || '',
      toolLink: p.toolLink || null,
      status: 'pending',
      completedAt: null,
    })
  })

  // 2. 从 signals 收集（匹配 stageKey）
  if (lifeRadar && stageKey) {
    const matchedSignals = lifeRadar.signals.filter(s => s.stageMatch && s.stageMatch.includes(stageKey))
    matchedSignals.forEach(s => {
      // 避免重复（按 title 去重）
      if (!unified.find(u => u.title === s.title)) {
        unified.push({
          id: s.id,
          source: 'signal',
          title: s.title,
          steps: s.action ? [s.action] : [],
          urgency: s.priority === 'high' ? 'immediate' : s.priority === 'medium' ? 'soon' : 'watch',
          benefit: null,
          policyRef: '',
          toolLink: null,
          status: 'pending',
          completedAt: null,
        })
      }
    })
  }

  // 恢复已保存的状态
  try {
    const saved = JSON.parse(localStorage.getItem('unified_actions') || '{}')
    if (saved.items) {
      saved.items.forEach(savedItem => {
        const match = unified.find(u => u.id === savedItem.id)
        if (match) {
          match.status = savedItem.status || 'pending'
          match.completedAt = savedItem.completedAt || null
        }
      })
    }
  } catch {}

  // 持久化
  try {
    localStorage.setItem('unified_actions', JSON.stringify({
      items: unified.map(u => ({ id: u.id, source: u.source, title: u.title, status: u.status, completedAt: u.completedAt })),
      personaKey,
      stageKey,
      updatedAt: new Date().toISOString(),
    }))
  } catch {}

  return unified
}

/**
 * 切换统一行动完成状态
 */
export function toggleUnifiedAction(actionId, newStatus) {
  try {
    const saved = JSON.parse(localStorage.getItem('unified_actions') || '{}')
    if (!saved.items) return
    const item = saved.items.find(i => i.id === actionId)
    if (item) {
      item.status = newStatus
      item.completedAt = newStatus === 'done' ? new Date().toISOString() : null
      localStorage.setItem('unified_actions', JSON.stringify(saved))
    }
  } catch {}
}

/**
 * 计算行动进度统计
 */
export function getActionProgress(personaKey, stageKey) {
  const actions = getUnifiedActions(personaKey, stageKey)
  const total = actions.length
  const done = actions.filter(a => a.status === 'done').length

  // 本周完成数
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const weekDone = actions.filter(a => a.status === 'done' && a.completedAt && new Date(a.completedAt).getTime() > weekAgo).length

  // 待办最多的维度（简化：取 actionPlans 匹配次数最多的 policyRef 关联维度）
  const pendingBySource = {}
  actions.filter(a => a.status !== 'done').forEach(a => {
    pendingBySource[a.source] = (pendingBySource[a.source] || 0) + 1
  })
  const topSource = Object.entries(pendingBySource).sort((a, b) => b[1] - a[1])[0]

  return { total, done, weekDone, topSource: topSource ? topSource[0] : null }
}

// ═══════════════════════════════════════════════════════════
// 7. 政策盲区自测题库（33题 + 多模式辅助函数）
// ═══════════════════════════════════════════════════════════
export const selfTestQuestions = [
  { id:'qz1', question:'公积金贷款额度主要受什么影响？', options:['只受缴存年限影响','缴存基数+账户余额+缴存年限','只受月收入影响'], correct:1, difficulty:'easy', region:'national', explanation:'公积金贷款额度与缴存基数正相关，也与账户余额挂钩。部分城市已提高上限。', dim:'housing', cost:{min:20000,max:120000} },
  { id:'qz2', question:'北上广深购房通常需要连续缴纳社保多少年？', options:['1年','2-3年','5年'], correct:2, difficulty:'easy', region:'national', explanation:'一线城市通常要求连续缴纳社保5年（中间不得断缴），这是最容易被忽略的门槛。', dim:'housing', cost:{min:50000,max:300000} },
  { id:'qz3', question:'"认房不认贷"政策的核心是什么？', options:['不管有无房贷记录只看名下房产','只要有贷款记录就算二套','完全取消贷款限制'], correct:0, difficulty:'medium', region:'national', explanation:'认房不认贷=只看你名下有没有房，不看有没有贷款记录。这对改善型购房者是重大利好。', dim:'housing', cost:{min:30000,max:200000} },
  { id:'qz4', question:'北京公积金贷款上限调整到多少？', options:['120万','180万','240万'], correct:2, difficulty:'easy', region:'beijing', explanation:'北京公积金贷款最高额度已从120万上调至240万（首套），这对购房者是重大利好。', dim:'housing', cost:{min:50000,max:240000} },
  { id:'qz5', question:'上海二套房公积金贷款利率是多少？', options:['2.85%','3.325%','3.575%'], correct:1, difficulty:'medium', region:'shanghai', explanation:'上海二套房公积金贷款利率为3.325%（首套2.85%），比商贷低很多，很多人不知道可以组合贷。', dim:'housing', cost:{min:30000,max:150000} },
  { id:'qz6', question:'换工作期间社保断缴1个月会怎样？', options:['补缴即可无影响','可能导致购房资格重新计算','只影响医保'], correct:1, difficulty:'medium', region:'national', explanation:'多数限购城市要求"连续"缴纳社保，断缴1个月可能导致购房资格清零重新计算。', dim:'housing', cost:{min:50000,max:500000} },
  { id:'qz7', question:'共有产权房和个人商品房的主要区别？', options:['没有区别','产权部分归政府，价格更低但转让有限制','只能出租不能自住'], correct:1, difficulty:'medium', region:'national', explanation:'共有产权房价格约为同地段商品房的50-70%，但转让时需优先卖给政府或其他符合条件的家庭。', dim:'housing', cost:{min:100000,max:500000} },
  { id:'qz8', question:'购房"满五唯一"免征什么税？', options:['契税','个人所得税','房产税'], correct:1, difficulty:'medium', region:'national', explanation:'满五唯一=持有满5年且是唯一住房，卖房时可免征个人所得税（差额的20%），很多人卖房时不知道这个。', dim:'housing', cost:{min:20000,max:100000} },
  { id:'qz9', question:'自由职业者可以参加职工社保吗？', options:['不能，只能参加居民社保','可以，以灵活就业身份参加','只有注册公司才能参加'], correct:1, difficulty:'easy', region:'national', explanation:'自由职业者可以以灵活就业身份参加职工养老和医疗保险，这是很多人不知道的政策盲区。', dim:'employment', cost:{min:12000,max:60000} },
  { id:'qz10', question:'深圳灵活就业人员可以自己缴公积金吗？', options:['不可以','可以，且享受与职工同等贷款权益','可以缴但不能贷款'], correct:1, difficulty:'medium', region:'shenzhen', explanation:'深圳已开放灵活就业人员自愿缴存公积金，连续缴存半年以上即可申请公积金贷款。', dim:'employment', cost:{min:20000,max:100000} },
  { id:'qz11', question:'失业金最长能领多少个月？', options:['6个月','12个月','24个月'], correct:2, difficulty:'easy', region:'national', explanation:'失业保险缴费满10年以上的，最长可领取24个月失业金，金额约为当地最低工资的80-90%。', dim:'employment', cost:{min:10000,max:50000} },
  { id:'qz12', question:'产假天数各省差异有多大？', options:['全国统一98天','98天+30天奖励=128天起，各省不同','可以随意休'], correct:1, difficulty:'easy', region:'national', explanation:'国家规定98天基础产假，各省再加30-90天不等的奖励假，部分地区如西藏长达365天。', dim:'employment', cost:{min:5000,max:30000} },
  { id:'qz13', question:'被裁员后公司不给N+1赔偿怎么办？', options:['自认倒霉','可以申请劳动仲裁，这是法定权利','只能私下协商'], correct:1, difficulty:'easy', region:'national', explanation:'N+1是法定经济补偿标准（N=工作年限×月工资），公司不给可申请劳动仲裁，免费且效率高。', dim:'employment', cost:{min:10000,max:100000} },
  { id:'qz14', question:'灵活就业人员的养老保险缴费比例是多少？', options:['8%','20%','28%'], correct:1, difficulty:'medium', region:'national', explanation:'灵活就业人员养老保险缴费比例为20%（职工是8%+单位16%=24%），全部由个人承担。', dim:'employment', cost:{min:5000,max:20000} },
  { id:'qz15', question:'落户上海最常见的方式是？', options:['买房直接落户','居转户（居住证转户口）','交社保满1年'], correct:1, difficulty:'easy', region:'shanghai', explanation:'上海不存在"买房直接落户"，主要途径是居转户（居住证满7年+社保满7年），部分人才引进可缩短。', dim:'employment', cost:{min:50000,max:200000} },
  { id:'qz16', question:'个人养老金每年最多可以省多少税？', options:['1200元','5400元','12000元'], correct:1, difficulty:'easy', region:'national', explanation:'年缴12000元进入个人养老金账户，最高税率档（45%）下每年省税5400元。这是被严重低估的节税工具。', dim:'finance', cost:{min:3600,max:5400} },
  { id:'qz17', question:'小微企业年应纳税所得额300万以下实际税率是多少？', options:['25%','5%','10%'], correct:1, difficulty:'medium', region:'national', explanation:'小微企业年应纳税所得额不超过300万元的部分，实际税负仅5%（减按25%计入×20%税率）。', dim:'finance', cost:{min:10000,max:80000} },
  { id:'qz18', question:'房贷利息专项附加扣除每月多少？最长几年？', options:['500元/月×10年','1000元/月×20年','1500元/月×30年'], correct:1, difficulty:'easy', region:'national', explanation:'首套房贷利息每月可扣除1000元，最长240个月（20年）。很多人忘记申报，白白多缴税。', dim:'finance', cost:{min:2400,max:6000} },
  { id:'qz19', question:'存款保险制度最高保障多少？', options:['20万','50万','100万'], correct:1, difficulty:'easy', region:'national', explanation:'存款保险最高偿付限额为50万元/人/银行。超过50万的大额存款建议分散存入不同银行。', dim:'finance', cost:{min:0,max:500000} },
  { id:'qz20', question:'个税汇算清缴每年什么时候截止？', options:['3月31日','6月30日','12月31日'], correct:1, difficulty:'easy', region:'national', explanation:'每年6月30日前完成上一年度个税汇算清缴，逾期可能产生滞纳金。很多人不知道可以退税。', dim:'finance', cost:{min:500,max:10000} },
  { id:'qz21', question:'数字人民币和微信支付的主要区别是什么？', options:['没有区别','数字人民币是法定货币，无手续费且支持双离线','数字人民币只能政府使用'], correct:1, difficulty:'medium', region:'national', explanation:'数字人民币是央行发行的法定数字货币，与现金等价，不需要绑定银行卡，支持无网络支付。', dim:'finance', cost:{min:0,max:0} },
  { id:'qz22', question:'年终奖单独计税政策已延续到哪一年？', options:['2023年','2025年','2027年'], correct:2, difficulty:'medium', region:'national', explanation:'年终奖单独计税优惠已延续至2027年底。选择单独计税vs并入综合所得，差额可达数千元。', dim:'finance', cost:{min:1000,max:10000} },
  { id:'qz23', question:'赠与房产给子女和买卖过户，哪种税费更低？', options:['赠与更低','买卖过户可能更低','两者一样'], correct:1, difficulty:'hard', region:'national', explanation:'直系亲属之间，"买卖过户"按评估价交易可能比"赠与"税费更低（赠与需缴3%契税+未来出售时20%个税）。', dim:'finance', cost:{min:30000,max:200000} },
  { id:'qz24', question:'"多校划片"是什么意思？', options:['一个小区对应多所学校随机分配','多个小区共享一所学校','学校可以任意招生'], correct:0, difficulty:'medium', region:'national', explanation:'多校划片=一个小区不再固定对口一所学校，而是在片区多所学校中随机分配。学区房的价值因此被稀释。', dim:'education', cost:{min:100000,max:1000000} },
  { id:'qz25', question:'非户籍子女在大城市入学需要什么？', options:['租房合同即可','通常需要居住证+社保+积分达标','交钱就行'], correct:1, difficulty:'medium', region:'national', explanation:'非户籍子女入学一般需要父母一方持有居住证、连续缴纳社保、积分达到当地入学线。提前规划很关键。', dim:'education', cost:{min:50000,max:300000} },
  { id:'qz26', question:'子女教育专项附加扣除每个子女每月多少？', options:['500元','1000元','2000元'], correct:2, difficulty:'easy', region:'national', explanation:'每个子女每月可扣除2000元（从3岁到博士），父母可选择一方100%或双方各50%扣除。', dim:'education', cost:{min:2400,max:4800} },
  { id:'qz27', question:'上海入学积分中，房产和户口哪个权重大？', options:['房产','户口','两者权重相当'], correct:1, difficulty:'medium', region:'shanghai', explanation:'上海入学积分体系中，户口（人户一致）权重远大于房产。仅有房产无户口的情况下积分很低。', dim:'education', cost:{min:100000,max:500000} },
  { id:'qz28', question:'学区房"学位锁定"是什么意思？', options:['买了就能上学','一套房6年内只能一个家庭用该学位','锁定后永远不能上学'], correct:1, difficulty:'medium', region:'national', explanation:'多数热点城市实行"六年一学位"，即同一套房产6年内只能有一个家庭的孩子用该学区入学。买二手房必查。', dim:'education', cost:{min:200000,max:1000000} },
 { id:'qz29', question:'延迟退休方案目前的状态是？', options:['已全面实施','2025年起渐进实施，男63/女58/女工55','已取消'], correct:1, difficulty:'easy', region:'national', explanation:'2024年9月全国人大常委会通过决定：2025年1月1日起用15年逐步延迟，男职工60→63岁，女干部55→58岁，女职工50→55岁。"小步调整、弹性实施"原则。', dim:'elderly', cost:{min:0,max:0} },
  { id:'qz30', question:'3岁以下婴幼儿照护个税专项附加扣除，每月每孩可扣多少？', options:['500元','1000元','2000元'], correct:2, difficulty:'easy', region:'national', explanation:'2023年起，3岁以下婴幼儿照护专项附加扣除标准从每月1000元提高至2000元（每个子女24000元/年），父母可选择一方100%或双方各50%扣除。已覆盖灵活就业人员。', dim:'finance', cost:{min:2400,max:4800} },
  { id:'qz31', question:'养老并轨后，体制内外养老金待遇还有差距吗？', options:['完全一样','差距缩小但仍有差异（职业年金等）','差距更大了'], correct:1, difficulty:'hard', region:'national', explanation:'养老并轨后基本养老金计算方式统一，但体制内通常有职业年金（强制缴存）作为补充，总体待遇仍有一定优势。', dim:'elderly', cost:{min:0,max:0} },
  { id:'qz32', question:'长期护理保险已覆盖多少个城市？', options:['只在上海试点','49个试点城市，覆盖超1.8亿人','已覆盖全国'], correct:1, difficulty:'medium', region:'national', explanation:'长期护理保险已在49个城市试点，覆盖超1.8亿人。失能老人每月可获得数千元的护理服务报销，2025年进一步扩面。', dim:'elderly', cost:{min:10000,max:50000} },
  { id:'qz33', question:'独生子女父母退休后有什么额外补贴？', options:['没有','独生子女父母奖励金','额外发放养老金'], correct:1, difficulty:'medium', region:'national', explanation:'独生子女父母退休后可领取一次性奖励金或每月补贴（各地标准不同，数百到数千元不等）。很多人不知道。', dim:'elderly', cost:{min:2000,max:10000} },
]

// ── 题库辅助函数 ──
const quizHistoryKey = 'quiz_history'
export function getQuizHistory() { try { return JSON.parse(localStorage.getItem(quizHistoryKey) || '[]') } catch { return [] } }
export function recordQuizAttempt(qid, correct) { const h = getQuizHistory(); h.push({ qid, correct, date: new Date().toISOString().slice(0, 10) }); localStorage.setItem(quizHistoryKey, JSON.stringify(h.slice(-100))) }
export function getDailyQuizQuestions(count = 3) { const history = getQuizHistory(); const recentQids = history.slice(-30).map(h => h.qid); const wrongQids = [...new Set(history.filter(h => !h.correct).map(h => h.qid))]; const all = [...selfTestQuestions]; const priority = (a, b) => { const aWrong = wrongQids.includes(a.id) ? 0 : 1; const bWrong = wrongQids.includes(b.id) ? 0 : 1; const aRecent = recentQids.includes(a.id) ? 1 : 0; const bRecent = recentQids.includes(b.id) ? 1 : 0; return (aWrong - bWrong) || (aRecent - bRecent) || (Math.random() - 0.5) }; return all.sort(priority).slice(0, count) }
export function getFullQuizQuestions(count = 15) { const history = getQuizHistory(); const recentQids = history.slice(-15).map(h => h.qid); const shuffled = [...selfTestQuestions].sort(() => Math.random() - 0.5); const fresh = shuffled.filter(q => !recentQids.includes(q.id)); const result = [...fresh, ...shuffled.filter(q => recentQids.includes(q.id))]; return result.slice(0, Math.min(count, selfTestQuestions.length)) }
export function getRegionQuizQuestions(regionKey, count = 5) { const matched = selfTestQuestions.filter(q => q.region === regionKey || q.region === 'national'); const others = selfTestQuestions.filter(q => q.region !== regionKey && q.region !== 'national'); const result = [...matched.sort(() => Math.random() - 0.5), ...others.sort(() => Math.random() - 0.5)]; return result.slice(0, Math.min(count, result.length)) }
export function getQuizStats() { const history = getQuizHistory(); const total = selfTestQuestions.length; const done = [...new Set(history.map(h => h.qid))].length; const correct = history.filter(h => h.correct).length; const totalAttempts = history.length; return { total, done, undone: total - done, correct, totalAttempts, accuracy: totalAttempts > 0 ? Math.round(correct / totalAttempts * 100) : 0 } }
export function scoreSelfTest(answers, questions) { const qs = questions || selfTestQuestions; let correct = 0; let totalCost = { min: 0, max: 0 }; qs.forEach(q => { const ans = answers[q.id]; if (ans === q.correct) { correct++ } else if (q.cost) { totalCost.min += q.cost.min; totalCost.max += q.cost.max } }); const pct = Math.round((correct / qs.length) * 100); const level = pct >= 80 ? { icon: '🟢', label: '政策达人' } : pct >= 60 ? { icon: '🟡', label: '还需补课' } : { icon: '🔴', label: '盲区较多' }; return { score: correct, total: qs.length, pct, level, missedCost: totalCost, missedCount: qs.length - correct } }

/* ── 盲区成本估算 ──────────────────────────────────────────── */
export function getBlindspotCost(answers, questions) {
  const qs = questions || selfTestQuestions
  let min = 0, max = 0
  qs.forEach(q => {
    const ans = answers[q.id]
    if (ans !== q.correct && q.cost) { min += q.cost.min; max += q.cost.max }
  })
  return { min, max, label: min > 50000 ? '重大盲区' : min > 10000 ? '中等盲区' : '轻微盲区' }
}

/* ── 增强案例墙数据 ────────────────────────────────────────── */
export const enhancedTestimonials = [
  { id:'t1', name:'小李', avatar:'👨‍💻', age:28, city:'北京', scenario:'housing', stage:'young_single', persona:'worker', title:'首套房上车', desc:'利用公积金贷款+共有产权房政策，用市场价65%买到朝阳区两居室', quote:'之前完全不知道共有产权房门槛这么低，策查查帮我省了至少80万', value:800000, date:'2026-03-15' },
  { id:'t2', name:'阿芳', avatar:'👩‍💼', age:32, city:'上海', scenario:'employment', stage:'newlywed', persona:'worker', title:'生育津贴最大化', desc:'提前规划社保基数+灵活就业衔接，产假期间多领了4万生育津贴', quote:'如果不是策查查提醒我调整社保基数，我根本不知道这个钱可以多拿', value:40000, date:'2026-04-20' },
  { id:'t3', name:'老王', avatar:'👨‍🏫', age:45, city:'深圳', scenario:'education', stage:'young_parent', persona:'parent', title:'学区房避坑', desc:'通过多校划片政策分析，放弃了溢价学区房，选择教育质量相当的普通学区', quote:'差一点就高位接盘了，策查查的政策分析救了我们家200万', value:2000000, date:'2026-02-10' },
  { id:'t4', name:'张叔', avatar:'👴', age:58, city:'广州', scenario:'elderly', stage:'approaching_retire', persona:'elder', title:'退休规划', desc:'利用个人养老金账户+延迟退休弹性方案，退休金比预期高出30%', quote:'原来个人养老金每年能省5400的税，还能稳健增值，后悔没早点知道', value:120000, date:'2026-05-08' },
  { id:'t5', name:'大刘', avatar:'🚀', age:35, city:'杭州', scenario:'entrepreneur', stage:'entrepreneur', persona:'startup', title:'创业补贴', desc:'申请了小微企业税收优惠+创业担保贷款，一年节省税费8万+拿到50万低息贷款', quote:'小微企业实际税率才5%，之前按25%预估差点放弃创业', value:580000, date:'2026-06-01' },
  { id:'t6', name:'小美', avatar:'👩‍🎓', age:25, city:'成都', scenario:'employment', stage:'young_single', persona:'worker', title:'自由职业社保', desc:'以灵活就业身份参加职工社保，比居民社保多领一倍的养老金预期', quote:'一直以为自由职业只能交居民社保，策查查告诉我灵活就业也可以交职工社保', value:60000, date:'2026-06-18' },
  { id:'t7', name:'陈总', avatar:'👨‍💼', age:42, city:'苏州', scenario:'housing', stage:'mid_career', persona:'investor', title:'改善置换', desc:'利用“卖一买一”退税政策，置换大房子退了12万个税', quote:'换房退税的政策窗口期只剩不到半年，幸好策查查提醒了我', value:120000, date:'2026-07-02' },
  { id:'t8', name:'阿杰', avatar:'🧑‍🔧', age:30, city:'武汉', scenario:'employment', stage:'young_single', persona:'worker', title:'个税汇算', desc:'补申报了房贷利息+赡养老人+继续教育三项扣除，退税8000+', quote:'以为个税汇算很复杂一直没弄，策查查的指南让我3分钟搞定', value:8000, date:'2026-07-10' },
  { id:'t9', name:'婷婷', avatar:'👩‍🍼', age:29, city:'南京', scenario:'elderly', stage:'young_parent', persona:'parent', title:'生育补贴申领', desc:'每孩每年3600元生育补贴+婴幼儿照护专项扣除，两年拿了近万', quote:'生育补贴从孩子出生就能领，策查查提醒我别错过申报时间', value:9600, date:'2026-05-20' },
  { id:'t10', name:'老周', avatar:'👨‍🏭', age:52, city:'重庆', scenario:'elderly', stage:'approaching_retire', persona:'worker', title:'延迟退休规划', desc:'利用弹性退休机制，选择提前3年退休，养老金损失最小化', quote:'策查查帮我算清楚了提前退休和延后退休的养老金差异，心里有底了', value:85000, date:'2026-04-15' },
  { id:'t11', name:'小雪', avatar:'👩‍💻', age:26, city:'深圳', scenario:'housing', stage:'young_single', persona:'worker', title:'保障性租赁住房', desc:'申请到深圳保障性租赁住房，月租比市场价低40%', quote:'深圳房租太贵了，保障性租赁住房真的救了我，每月省2000+', value:48000, date:'2026-06-25' },
  { id:'t12', name:'建国', avatar:'👨‍🌾', age:48, city:'长沙', scenario:'housing', stage:'mid_career', persona:'buyer', title:'低房价红利', desc:'长沙房价洼地+人才购房补贴，总价60万买到三室两厅', quote:'长沙房价收入比全国最低，策查查帮我算清了购房成本', value:300000, date:'2026-03-08' },
  { id:'t13', name:'美玲', avatar:'👩‍🏫', age:38, city:'上海', scenario:'education', stage:'young_parent', persona:'parent', title:'中考名额分配', desc:'利用名额分配到校政策，孩子进入市重点高中', quote:'多校划片后学区房不值钱了，策查查让我关注名额分配政策', value:500000, date:'2026-06-10' },
  { id:'t14', name:'大鹏', avatar:'👨‍🚀', age:33, city:'成都', scenario:'entrepreneur', stage:'entrepreneur', persona:'startup', title:'蓉漂计划创业', desc:'申请蓉漂计划创业补贴+天府新区办公场地优惠，节省启动资金30万', quote:'成都对创业者太友好了，策查查帮我梳理了所有能申请的补贴', value:300000, date:'2026-05-15' },
  { id:'t15', name:'秀英', avatar:'👵', age:62, city:'北京', scenario:'elderly', stage:'retired', persona:'elder', title:'长护险报销', desc:'申请长期护理保险，失能老伴每月护理费用报销70%', quote:'老伴失能后护理费压力很大，长护险每月能报销4000多', value:50000, date:'2026-04-28' },
  { id:'t16', name:'志强', avatar:'👨‍💼', age:40, city:'广州', scenario:'finance', stage:'mid_career', persona:'investor', title:'跨境理财通', desc:'通过跨境理财通2.0投资港澳理财产品，年化收益提升2%', quote:'跨境理财通额度提升到300万，策查查让我抓住了这个机会', value:60000, date:'2026-07-05' },
  { id:'t17', name:'小芳', avatar:'👩‍🎨', age:27, city:'杭州', scenario:'employment', stage:'young_single', persona:'freelancer', title:'灵活就业社保', desc:'以灵活就业身份参加职工社保，取消户籍限制后顺利参保', quote:'以前外地户口不能在杭州交职工社保，现在政策放开了', value:36000, date:'2026-06-20' },
  { id:'t18', name:'海涛', avatar:'👨‍🔬', age:36, city:'合肥', scenario:'entrepreneur', stage:'entrepreneur', persona:'startup', title:'科创金融支持', desc:'科创企业获得股权激励+低息贷款，融资成本降低40%', quote:'合肥科创金融改革试验区政策太给力了，策查查帮我对接了所有资源', value:200000, date:'2026-05-28' },
  { id:'t19', name:'丽华', avatar:'👩‍⚕️', age:45, city:'武汉', scenario:'elderly', stage:'mid_career', persona:'worker', title:'医保异地结算', desc:'父母从老家来武汉带娃，异地就医门诊直接结算', quote:'以前父母看病要回老家报销，现在武汉直接结算太方便了', value:15000, date:'2026-06-15' },
  { id:'t20', name:'小明', avatar:'👦', age:24, city:'郑州', scenario:'employment', stage:'young_single', persona:'worker', title:'航空港区就业', desc:'通过航空港区用工保障政策，获得免费技能培训+入职补贴', quote:'港区企业用工补贴让我顺利入职，还免费学了技能', value:12000, date:'2026-07-08' },
  { id:'t21', name:'王姐', avatar:'👩‍💼', age:35, city:'上海', scenario:'housing', stage:'newlywed', persona:'buyer', title:'公积金提额', desc:'沪七条后公积金贷款额度提升，多贷了40万', quote:'公积金提额政策让我多贷了40万，月供压力小了很多', value:400000, date:'2026-03-20' },
  { id:'t22', name:'老李', avatar:'👨‍🏫', age:55, city:'深圳', scenario:'elderly', stage:'approaching_retire', persona:'worker', title:'个人养老金', desc:'每年缴纳12000元个人养老金，节税5400元+稳健增值', quote:'个人养老金既能节税又能增值，策查查让我明白了这个政策红利', value:54000, date:'2026-04-10' },
  { id:'t23', name:'婷婷', avatar:'👩‍🎓', age:23, city:'成都', scenario:'education', stage:'young_single', persona:'worker', title:'职教产教融合', desc:'通过产教融合项目进入电子信息企业实习，毕业即就业', quote:'职业教育产教融合让我毕业前就拿到了offer', value:80000, date:'2026-06-30' },
  { id:'t24', name:'张伟', avatar:'👨‍💻', age:31, city:'北京', scenario:'finance', stage:'young_single', persona:'investor', title:'数字人民币', desc:'使用数字人民币享受消费红包+支付优惠，一年省了2000+', quote:'数字人民币红包和优惠真的很多，策查查让我没错过任何一个', value:2000, date:'2026-07-12' },
  { id:'t25', name:'刘姐', avatar:'👩‍🍳', age:42, city:'佛山', scenario:'entrepreneur', stage:'mid_career', persona:'startup', title:'制造业转型', desc:'申请制造业数字化转型补贴，改造生产线节省成本30%', quote:'数字化转型补贴让我有资金升级设备，生产效率提升明显', value:150000, date:'2026-05-25' },
  { id:'t26', name:'小军', avatar:'👨‍✈️', age:29, city:'西安', scenario:'employment', stage:'young_single', persona:'worker', title:'西渝高铁就业', desc:'西渝高铁建设带来就业机会，参与隧道工程获得技能认证', quote:'西渝高铁建设让我学到了隧道工程技术，以后就业更有竞争力', value:50000, date:'2026-07-04' },
  { id:'t27', name:'陈姨', avatar:'👩‍🦳', age:60, city:'广州', scenario:'elderly', stage:'retired', persona:'elder', title:'社区养老服务', desc:'享受社区嵌入式养老服务，助餐+日间照料+上门服务', quote:'社区养老服务让我在家门口就能享受专业照护，子女放心了', value:24000, date:'2026-06-05' },
  { id:'t28', name:'阿强', avatar:'👨‍🔧', age:34, city:'东莞', scenario:'employment', stage:'mid_career', persona:'worker', title:'技能培训补贴', desc:'参加制造业技能提升培训，获得高级技工认证+补贴', quote:'技能培训补贴让我免费提升了技能，工资涨了30%', value:18000, date:'2026-06-22' },
  { id:'t29', name:'小雪', avatar:'👩‍💼', age:28, city:'南昌', scenario:'entrepreneur', stage:'young_single', persona:'startup', title:'VR产业创业', desc:'入驻南昌VR产业基地，获得场地补贴+项目孵化支持', quote:'南昌VR产业政策很给力，策查查帮我找到了所有扶持资源', value:100000, date:'2026-05-18' },
  { id:'t30', name:'老赵', avatar:'👨‍🏭', age:50, city:'太原', scenario:'employment', stage:'approaching_retire', persona:'worker', title:'能源转型安置', desc:'煤炭行业转岗培训后进入新能源企业，薪资不降反升', quote:'能源转型让我从煤矿工人变成了新能源技术员，策查查帮我规划了转岗路径', value:60000, date:'2026-04-25' },
  { id:'t31', name:'小丽', avatar:'👩‍🎨', age:26, city:'深圳', scenario:'housing', stage:'young_single', persona:'worker', title:'前海人才住房', desc:'申请前海人才住房补贴，每月节省房租3000元', quote:'前海人才住房补贴让我在深圳安居乐业，策查查让我没错过申请', value:72000, date:'2026-06-28' },
  { id:'t32', name:'大伟', avatar:'👨‍💼', age:38, city:'重庆', scenario:'finance', stage:'mid_career', persona:'investor', title:'西部金融中心', desc:'利用重庆西部金融中心政策，获得企业融资便利化支持', quote:'西部金融中心建设让企业融资更方便了，策查查帮我对接了金融产品', value:80000, date:'2026-07-01' },
  { id:'t33', name:'阿文', avatar:'👨‍🎓', age:22, city:'武汉', scenario:'employment', stage:'young_single', persona:'student', title:'就业见习补贴', desc:'通过就业见习基地获得每月2000元补贴+留用机会', quote:'见习补贴让我毕业后不用“裸奔”，还顺利留用了', value:24000, date:'2026-07-06' },
  { id:'t34', name:'张姐', avatar:'👩‍⚕️', age:50, city:'成都', scenario:'elderly', stage:'approaching_retire', persona:'worker', title:'跨省社保转移', desc:'从广东转回成都，养老保险关系顺利接续', quote:'跨省社保转移以前很麻烦，现在线上就能办，策查查指导我每一步', value:35000, date:'2026-05-12' },
  { id:'t35', name:'小杰', avatar:'👨‍💻', age:27, city:'深圳', scenario:'entrepreneur', stage:'young_single', persona:'startup', title:'AI创业孵化', desc:'入驻深圳AI产业园，获得算力补贴+天使投资对接', quote:'AI创业最贵的是算力，政府补贴省了一大笔', value:200000, date:'2026-06-08' },
  { id:'t36', name:'王叔', avatar:'👨‍🌾', age:56, city:'长沙', scenario:'elderly', stage:'approaching_retire', persona:'worker', title:'城乡居民养老提档', desc:'城乡居民养老保险从最低档提到最高档，退休金翻倍', quote:'策查查让我知道提档补缴还来得及，退休后每月多领800', value:96000, date:'2026-04-18' },
  { id:'t37', name:'美玲', avatar:'👩‍💼', age:33, city:'广州', scenario:'housing', stage:'newlywed', persona:'buyer', title:'南沙人才购房', desc:'南沙区人才购房补贴+港澳居民购房便利化', quote:'南沙人才政策让我以很低成本安了家，策查查帮我梳理了所有补贴', value:150000, date:'2026-05-30' },
  { id:'t38', name:'老陈', avatar:'👨‍🏭', age:47, city:'东莞', scenario:'employment', stage:'mid_career', persona:'worker', title:'失业保险技能提升', desc:'利用失业保险基金支付技能提升补贴，免费学了新技能', quote:'失业保险不只是失业才能用，在职也能领技能补贴', value:4600, date:'2026-06-12' },
  { id:'t39', name:'小雪', avatar:'👩‍🎓', age:24, city:'合肥', scenario:'housing', stage:'young_single', persona:'student', title:'毕业生租房补贴', desc:'申请合肥毕业生租房补贴，每月800元连补三年', quote:'毕业后租房压力很大，租房补贴让我缓了口气', value:28800, date:'2026-07-03' },
  { id:'t40', name:'志强', avatar:'👨‍💼', age:44, city:'上海', scenario:'finance', stage:'mid_career', persona:'investor', title:'年终奖计税优化', desc:'年终奖单独计税政策延续，合理分配月薪和年终奖比例节税2万+', quote:'策查查帮我算清了年终奖单独计税和并入综合所得的差异', value:20000, date:'2026-07-14' },
  { id:'t41', name:'阿婆', avatar:'👵', age:68, city:'南京', scenario:'elderly', stage:'retired', persona:'elder', title:'高龄补贴申领', desc:'满70岁后每月领取高龄补贴+免费体检+公交免费', quote:'策查查提醒我满70岁就能领高龄补贴，之前都不知道', value:3600, date:'2026-06-16' },
  { id:'t42', name:'大鹏', avatar:'👨‍🚀', age:30, city:'西安', scenario:'entrepreneur', stage:'young_single', persona:'startup', title:'硬科技创业', desc:'申请西安硬科技创业补贴+秦创原平台孵化支持', quote:'西安硬科技政策很给力，策查查帮我找到了所有能申请的补贴', value:250000, date:'2026-05-22' },
  { id:'t43', name:'小芳', avatar:'👩‍🍼', age:31, city:'郑州', scenario:'elderly', stage:'young_parent', persona:'parent', title:'普惠托育服务', desc:'孩子入托普惠托育机构，每月费用比市场价低60%', quote:'普惠托育每月只要800元，以前私立托班要3000+', value:26400, date:'2026-06-26' },
  { id:'t44', name:'老周', avatar:'👨‍🔧', age:49, city:'太原', scenario:'housing', stage:'mid_career', persona:'worker', title:'老旧小区改造', desc:'小区加装电梯+管线改造+保温层，房价涨了15%', quote:'老旧小区改造后住着舒服多了，房子也升值了', value:120000, date:'2026-04-08' },
  { id:'t45', name:'婷婷', avatar:'👩‍💻', age:25, city:'杭州', scenario:'finance', stage:'young_single', persona:'freelancer', title:'个税汇算退税', desc:'自由职业者个税汇算，补充申报专项扣除后退税6000+', quote:'自由职业者也能享受专项扣除，策查查让我知道了这个权利', value:6000, date:'2026-07-11' },
  { id:'t46', name:'老周', avatar:'👨‍🏭', age:55, city:'天津', scenario:'elderly', stage:'approaching_retire', persona:'worker', title:'提前退休规划', desc:'利用弹性退休机制，选择提前2年退休，养老金损失最小化', quote:'策查查帮我算清了提前退休和正常退休的养老金差异，心里有底了', value:72000, date:'2026-06-20' },
  { id:'t47', name:'陈总', avatar:'👨‍💼', age:43, city:'苏州', scenario:'housing', stage:'mid_career', persona:'investor', title:'改善置换退税', desc:'利用卖一买一退税政策，置换大房子退了15万个税', quote:'换房退税窗口期只剩半年，幸好策查查提醒了我', value:150000, date:'2026-05-18' },
  { id:'t48', name:'美玲', avatar:'👩‍🏫', age:34, city:'南京', scenario:'education', stage:'young_parent', persona:'parent', title:'幼升小择校', desc:'通过名额分配到校政策，孩子进入优质小学', quote:'多校划片后学区房不值钱了，策查查让我关注名额分配政策', value:300000, date:'2026-06-05' },
  { id:'t49', name:'阿杰', avatar:'👨‍💼', age:36, city:'济南', scenario:'employment', stage:'mid_career', persona:'worker', title:'体制内转行', desc:'从事业单位辞职创业，社保转移+创业担保贷款一站式解决', quote:'策查查帮我理清了社保转移和创业补贴的全部流程', value:200000, date:'2026-04-22' },
  { id:'t50', name:'小雪', avatar:'👩‍💻', age:27, city:'厦门', scenario:'housing', stage:'young_single', persona:'worker', title:'首套房上车', desc:'利用公积金贷款+人才购房补贴，总价180万买到两居室', quote:'人才购房补贴8万+公积金贷款，策查查帮我省了12万', value:120000, date:'2026-07-08' },
  { id:'t51', name:'张叔', avatar:'👴', age:63, city:'昆明', scenario:'elderly', stage:'retired', persona:'elder', title:'异地养老医保', desc:'退休后随子女到昆明生活，异地就医直接结算', quote:'以前看病要回成都报销，现在昆明直接结算太方便了', value:18000, date:'2026-05-30' },
  { id:'t52', name:'大伟', avatar:'👨‍💻', age:29, city:'青岛', scenario:'finance', stage:'young_single', persona:'investor', title:'数字人民币红利', desc:'使用数字人民币享受消费红包+支付优惠，一年省了3000+', quote:'数字人民币红包和优惠真的很多，策查查让我没错过任何一个', value:3000, date:'2026-07-15' },
  { id:'t53', name:'小雪', avatar:'👩‍🎓', age:28, city:'大连', scenario:'entrepreneur', stage:'young_single', persona:'startup', title:'海归创业补贴', desc:'留学回国创业，获得创业启动资金+租房补贴+社保补贴', quote:'海归创业补贴比我想象的多，策查查帮我梳理了所有能申请的', value:180000, date:'2026-06-12' },
  { id:'t54', name:'志强', avatar:'👨‍🔧', age:20, city:'石家庄', scenario:'education', stage:'student', persona:'student', title:'职教升学路径', desc:'通过职教高考升入本科，学费减免+技能补贴', quote:'职教也能上本科，策查查让我看到了另一条路', value:50000, date:'2026-07-01' },
  { id:'t55', name:'美玲', avatar:'👩‍💼', age:35, city:'珠海', scenario:'housing', stage:'newlywed', persona:'buyer', title:'港澳居民购房', desc:'港澳居民珠海购房享同等待遇，公积金贷款+契税优惠', quote:'港澳居民在珠海买房和内地居民一样，策查查让我放心了', value:80000, date:'2026-06-28' },
]

/* ── 政策预演场景分组 ──────────────────────────────────────── */
export const scenarioGroups = [
  { key:'buy_house', icon:'🏠', label:'买房决策', desc:'首套/改善/学区房', dims:['housing'], policies:[{title:'公积金贷款上限提高',impact:'利好',note:'首套最高240万'},{title:'认房不认贷',impact:'利好',note:'改善型购房受益'},{title:'多校划片',impact:'利空',note:'学区房价值稀释'}] },
  { key:'have_baby', icon:'👶', label:'生育规划', desc:'备孕/产假/育儿补贴', dims:['employment','elderly'], policies:[{title:'婴幼儿照护扣除',impact:'利好',note:'每月2000元/孩'},{title:'生育津贴',impact:'利好',note:'与社保基数挂钩'},{title:'普惠托育',impact:'利好',note:'新增4000个托位'}] },
  { key:'job_change', icon:'💼', label:'跳槽/创业', desc:'换工作/灵活就业/创业', dims:['employment','finance'], policies:[{title:'灵活就业社保',impact:'利好',note:'可参加职工社保'},{title:'小微企业优惠',impact:'利好',note:'实际税率仅5%'},{title:'创业担保贷款',impact:'利好',note:'最高300万'}] },
  { key:'retire_plan', icon:'🏖️', label:'退休规划', desc:'养老金/延迟退休/护理', dims:['elderly','finance'], policies:[{title:'个人养老金',impact:'利好',note:'年省税最高5400'},{title:'延迟退休',impact:'中性',note:'渐进实施中'},{title:'长期护理险',impact:'利好',note:'49城试点'}] },
  { key:'invest_tax', icon:'📊', label:'投资理财', desc:'买房/股票/理财/节税', dims:['finance','housing'], policies:[{title:'年终奖单独计税',impact:'利好',note:'延续至2027'},{title:'存款保险',impact:'利好',note:'50万保障'},{title:'数字人民币',impact:'利好',note:'法定货币'}] },
]
export function getScenarioImpacts(scenarioKey) { const sg = scenarioGroups.find(s=>s.key===scenarioKey); return sg ? { label:sg.label, policies:sg.policies, net:sg.policies.filter(p=>p.impact==='利好').length-sg.policies.filter(p=>p.impact==='利空').length } : null }

/* ── 成就系统 ───────────────────────────────────────────────── */
export const achievementDefs = [
  { id:'first_quiz', icon:'🎯', label:'初识政策', desc:'完成第一次盲区自测', category:'quiz' },
  { id:'quiz_master', icon:'🏆', label:'政策达人', desc:'自测得分达到80分以上', category:'quiz' },
  { id:'perfect_score', icon:'💎', label:'满分通关', desc:'自测获得满分', category:'quiz' },
  { id:'streak_3', icon:'🔥', label:'初露锋芒', desc:'连续打卡3天', category:'streak' },
  { id:'streak_7', icon:'⭐', label:'持之以恒', desc:'连续打卡7天', category:'streak' },
  { id:'streak_30', icon:'👑', label:'政策守望者', desc:'连续打卡30天', category:'streak' },
  { id:'first_action', icon:'✅', label:'行动派', desc:'完成第一个行动项', category:'action' },
  { id:'action_10', icon:'📋', label:'高效执行者', desc:'完成10个行动项', category:'action' },
  { id:'value_100k', icon:'💰', label:'价值发现者', desc:'累计发现价值超10万', category:'value' },
  { id:'value_1m', icon:'🏦', label:'百万智囊', desc:'累计发现价值超100万', category:'value' },
  { id:'first_project', icon:'📁', label:'决策规划师', desc:'创建第一个决策项目', category:'project' },
  { id:'first_share', icon:'📤', label:'乐于分享', desc:'首次分享报告', category:'share' },
  { id:'wrong_master', icon:'📚', label:'学以致用', desc:'消灭5道错题', category:'learn' },
  { id:'health_check', icon:'🔍', label:'全面体检', desc:'完成政策体检诊断', category:'health' },
]

/* ── 政策提醒与订阅 ─────────────────────────────────────────── */
const alertsKey = 'policy_alerts'
const subsKey = 'policy_subscriptions'
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

/* ═══ 政策风向标 — 政策→决策域→个人行动 ═══════════════════ */
const domainMeta = {
  investment:  { icon:'📈', label:'投资理财', desc:'利率、金融法、产业趋势' },
  career:      { icon:'💼', label:'就业职业', desc:'行业方向、技能、社保' },
  housing:     { icon:'🏠', label:'购房安家', desc:'限购、贷款、人才房' },
  education:   { icon:'🎓', label:'教育升学', desc:'学区、专业、留学' },
  fertility:   { icon:'👶', label:'生育育儿', desc:'补贴、托育、产假' },
  retirement:  { icon:'🏖️', label:'养老退休', desc:'延迟退休、养老金' },
  consumption: { icon:'🛒', label:'消费生活', desc:'补贴、个税、以旧换新' },
  business:    { icon:'🚀', label:'创业营商', desc:'税优、准入、扶持' },
}
export { domainMeta }

export const policySignals = [
  // ═══ 投资理财 ═══
  { id:'ps1', domain:'investment',
    change:'LPR持续下行，1年期3.1%、5年期3.6%，无风险利率进入"2时代"',
    impact:(p)=>{ const isHomeowner=p.hasHouse; const age=p.age||30; const city=p.city||'你的城市';
      if(isHomeowner) return `你有房产，如果还在还贷：LPR每降0.1%，300万贷款30年省约${Math.round(300*0.001*30/10)}万。建议确认贷款是否已转为LPR浮动利率`;
      if(age<35) return `你${age}岁还没买房——低利率=购房成本降低，但\"等更低\"也可能踏空。${city.includes('北京')||city.includes('上海')?'一线城市建议关注成交量回升信号':'二线及以下建议关注人口流入趋势'}`;
      return '存款利率同步走低（定存已破2%），钱存银行越来越不值钱，需要寻找替代资产'; },
    financialImpact:(p)=>{ if(p.hasHouse) return {min:1500,max:5000,unit:'/年省（LPR联动）'}; return {min:0,max:0,unit:''}; },
    action:(p)=>p.hasHouse?'确认贷款已转LPR浮动利率；如有余力提前还部分本金锁低利率':'关注目标城市房价和成交量走势，建立购房知识储备',
    peerInsight:'同类有房者中，72%已将房贷转为LPR浮动利率',
    urgency:'soon', confidence:'high' },
  { id:'ps2', domain:'investment',
    change:'金融法草案审议中，银证保统一监管框架将确立',
    impact:(p)=>{ const persona=p.personaKey||'worker';
      if(persona==='investor') return '作为投资者，统一监管=信息更透明、维权更容易、\"飞单/乱收费\"将受严惩。但也意味着部分高风险产品（P2P类、非标）可能退出市场';
      return '你可能不直接炒股买基金，但银行理财、保险、存款都受金融法保护——\"被坑\"概率降低'; },
    financialImpact:null, peerInsight:'同类投资者中，85%表示\"更放心了\"，15%担心产品选择变少',
    urgency:'watch', confidence:'high' },
  { id:'ps3', domain:'investment',
    change:'央企国企分红率提升至30%+，高股息策略走强',
    impact:(p)=>{ const age=p.age||30;
      if(age>=40) return `你接近退休窗口期——高股息策略（股息率4-6%）是\"类年金\"替代方案。红利ETF、银行股、电力股值得关注`;
      if(age>=30) return '你还处在财富积累期，可将高股息资产作为组合\"压舱石\"（占比20-30%），其余配置成长型资产';
      return '你还年轻，可少量配置（10-15%）培养投资习惯，主力放在成长型资产'; },
    financialImpact:(p)=>{ const age=p.age||30; return {min:age>=40?8000:2000,max:age>=40?15000:5000,unit:'/年（股息+增值）'}; },
    action:(p)=>{ const age=p.age||30; return age>=40?'关注红利低波ETF(512890)、中证红利指数——股息率超4%时买入':'小额定投红利ETF，培养\"收息\"思维'; },
    peerInsight:'35-50岁同类人中，41%已配置红利类资产',
    urgency:'soon', confidence:'medium' },

  // ═══ 就业职业 ═══
  { id:'ps5', domain:'career',
    change:'新质生产力上升为国家战略：新能源/半导体/AI/生物医药人才缺口超2000万',
    impact:(p)=>{ const age=p.age||30; const edu=p.education||'本科'; const isHighEdu=['硕士','博士'].includes(edu);
      if(age<30) return `你${age}岁，正处在职业方向选择的关键期。${isHighEdu?edu+'学历在新质生产力领域有天然优势——芯片设计、AI算法、新药研发等岗位起薪30万+':'即使学历不占优，新能源运维、智能产线操作等技能岗缺口也很大，培训6-12个月即可上岗'}`;
      if(age<45) return `你${age}岁，转型时间窗口还在。关注自己行业与\"新质生产力\"的交叉点：传统制造→智能产线，传统IT→AI应用，传统金融→金融科技`;
      return '这个趋势对你的孩子（如果考虑大学选专业）极其重要——STEM方向（科学/技术/工程/数学）未来10年的薪资溢价将持续扩大'; },
    financialImpact:(p)=>{ const age=p.age||30; return age<35?{min:50000,max:200000,unit:'潜在年薪增幅'}:{min:20000,max:80000,unit:'技能升级收益'}; },
    action:(p)=>{ const age=p.age||30; return age<30?'关注人社部\"急需紧缺职业目录\"，选择新能源/芯片/AI方向学习':'评估自身技能与新质生产力的重合度，参加线上培训或考取认证'; },
    peerInsight:'30岁以下同类人中，63%正在学习一项新质生产力相关技能',
    urgency:'soon', confidence:'high' },
  { id:'ps6', domain:'career',
    change:'灵活就业者可在工作地参加职工社保，户籍限制全面取消',
    impact:(p)=>{ if(p.isSelfEmployed) return `你作为自由职业者/创业者，以前可能只能在户籍地缴社保。现在可以在${p.city||'你的工作城市'}直接缴职工社保——养老金待遇提升30-50%，医保报销比例与在职职工一致`;
      return '你目前在职，但这个政策意味着：如果未来想做自由职业/远程工作/创业，社保不用断——\"裸辞焦虑\"减轻很多'; },
    financialImpact:(p)=>p.isSelfEmployed?{min:30000,max:100000,unit:'退休后多领（估值）'}:{min:0,max:0,unit:''},
    action:(p)=>p.isSelfEmployed?'到当地社保局/线上平台（如\"掌上12333\"APP）办理灵活就业参保，选择60%-100%缴费基数':'了解灵活就业参保政策，为未来职业变化做准备',
    peerInsight:'自由职业同类人中，仅31%已办理工作地参保——你大概率是漏网之鱼',
    urgency:'immediate', confidence:'high' },
  { id:'ps7', domain:'career',
    change:'AI替代效应加速：客服/翻译/基础编程/文案等重复性脑力岗需求下降30-50%',
    impact:(p)=>{ const age=p.age||30;
      if(age<35) return `警告窗口：你现在${age}岁，如果工作内容以\"重复执行\"为主（写周报/做翻译/改代码/整理数据），5年内被替代风险>40%。但\"会用AI的人\"将淘汰\"不会用AI的人\"——不是AI替代你，是会用AI的人替代你`;
      return `你${age}岁，行业经验+判断力是AI无法替代的核心竞争力。但必须补上\"工具层\"：学会用AI辅助决策而非被AI取代决策`; },
    financialImpact:(p)=>{ const age=p.age||30; return age<35?{min:30000,max:150000,unit:'技能升级避免的潜在损失'}:{min:10000,max:50000,unit:'AI提效带来的收入增量'}; },
    action:(p)=>{ const age=p.age||30; return age<35?'每周投入2-3小时学习AI工具（Cursor编程/ChatGPT分析/Midjourney设计），3个月内形成竞争力':'选择一个与你工作相关的AI应用场景，深度掌握（比如Excel+AI数据分析）'; },
    peerInsight:'25-35岁同类人中，仅28%正系统学习AI工具——这是你的差异化机会',
    urgency:'immediate', confidence:'high' },

  // ═══ 购房安家 ═══
  { id:'ps8', domain:'housing',
    change:'多城公积金贷款额度上调，首套最高120万（利率2.85%），二套最高80万',
    impact:(p)=>{ const hasHouse=p.hasHouse; const city=p.city||'你的城市'; const isT1=['北京','上海','深圳','广州'].some(c=>city.includes(c));
      if(!hasHouse) return `你还没买房——如果首套用公积金贷120万，相比商贷（3.5%+），30年省息${isT1?'约45万（一线房价基数高）':'约25-35万'}。建议：①确认公积金连续缴存≥6个月 ②计算可贷额度（余额×倍数）`;
      return '你已有房产，但现在也可以关注：①\"商转公\"（商业贷款转公积金，部分城市已开放）②二套公积金贷款（如有置换/改善需求）'; },
    financialImpact:(p)=>p.hasHouse?{min:5000,max:30000,unit:'商转公省息'}:{min:200000,max:450000,unit:'首套30年省息'},
    action:(p)=>{ if(p.hasHouse) return '咨询当地公积金中心是否支持\"商转公\"，确认条件（通常需还款满1年+信用良好）'; return '打开当地公积金APP查余额和缴存月数，用\"房贷计算器\"对比公积金vs商贷'; },
    peerInsight:'同类未购房者中，仅22%已确认自己的公积金可贷额度',
    urgency:'immediate', confidence:'high' },
  { id:'ps9', domain:'housing',
    change:'保障性租赁住房\"十四五\"全国筹集870万套，租金≤市场价85%',
    impact:(p)=>{ const age=p.age||30; const hasHouse=p.hasHouse; const city=p.city||'你的城市';
      if(!hasHouse&&age<=35) return `你是保租房的精准目标人群——${city}的保租房：不限户籍、精装交付、拎包入住、租金便宜。\"先租后买\"可能比\"硬上车\"更适合你（省下的首付可以投资其他方向）`;
      if(!hasHouse) return `即使你超过35岁，部分地区保租房年龄上限已放宽至45岁。${city}的具体政策建议关注`;
      return '你已有房，但保租房政策对了解城市人口流向和租金走势有参考价值'; },
    financialImpact:(p)=>!p.hasHouse?{min:12000,max:36000,unit:'/年省租金（相比市场价）'}:{min:0,max:0,unit:''},
    action:(p)=>!p.hasHouse?'关注当地住建委官网\"保障性租赁住房\"板块，准备身份证+劳动合同/社保记录':'关注保租房对周边租赁市场的租金压制效应',
    peerInsight:'30岁以下租房同类人中，53%不知道保租房申请渠道',
    urgency:'soon', confidence:'high' },
  { id:'ps10', domain:'housing',
    change:'换房退税：\"卖一买一\"1年内完成可退个税（3-10万），政策2027年底到期',
    impact:(p)=>{ if(p.hasHouse&&p.isMarried) return `你已有房产且已婚——如果正在考虑改善置换（小换大/远换近/旧换新），这个政策是\"真金白银\"。500万房产已缴个税约5万，全额可退`;
      if(p.hasHouse) return '你有房产，如果未来考虑置换，记住房改退税的前提是：卖房后**1年内**购买新房，超期不退';
      return '你还没买房，但了解这个政策有助于未来做\"买首套→换二套\"的长期规划'; },
    financialImpact:(p)=>p.hasHouse?{min:30000,max:100000,unit:'退税金额'}:{min:0,max:0,unit:''},
    action:(p)=>p.hasHouse?'如有置换计划，提前规划时间线（卖→买的1年窗口），保留完税凭证（个税票）':'记住\"1年内\"这个关键条件，未来置换时别错过窗口',
    peerInsight:'有房已婚同类人中，仅18%知道换房退税政策',
    urgency:'soon', confidence:'high' },

  // ═══ 教育升学 ═══
  { id:'ps11', domain:'education',
    change:'教育部：扩大理工农医类招生规模，压缩部分文科专业——\"学科大调整\"进行中',
    impact:(p)=>{ const hasChild=p.hasChild; const edu=p.education||'本科'; const isSTEM=['本科','硕士','博士'].includes(edu)&&!['文科'].includes(edu);
      if(hasChild) return `如果你孩子未来3-5年面临高考选专业/考研：①优先选STEM（科学/技术/工程/数学）——招生名额在扩大，竞争压力相对小 ②文科中\"法学+AI\"\"财经+数据\"等交叉学科仍有机会 ③纯文科（历史/哲学等）慎选——就业面在收窄`;
      if(!hasChild&&(p.age||30)<=40) return '你目前没有孩子，但这个趋势值得提前了解：未来你的孩子面对的就业市场，STEM人才溢价将持续扩大';
      return '这个趋势反映了国家战略方向——人才培养在向\"硬科技\"倾斜'; },
    financialImpact:(p)=>p.hasChild?{min:50000,max:300000,unit:'选对专业带来的收入溢价'}:{min:0,max:0,unit:''},
    action:(p)=>p.hasChild?'关注教育部\"双一流\"建设学科调整名单，重点看新增的\"集成电路\"\"人工智能\"\"新能源科学\"等专业':'了解学科调整趋势，为未来决策储备知识',
    peerInsight:'有高中子女的同类人中，67%已将STEM专业作为优先选项',
    urgency:'watch', confidence:'high' },
  { id:'ps12', domain:'education',
    change:'AI通识教育进入中小学课标——编程/人工智能成必修，2025年秋季全面实施',
    impact:(p)=>{ if(p.hasChild) return `你的孩子将在学校系统学习AI/编程——这是\"国家级\"的教育转向。建议：①不必焦虑报班，先关注学校课程安排 ②在家可以用Scratch（小学）/Python（初中）培养兴趣 ③重点是\"计算思维\"而非写代码`;
      return '即使没有孩子，这个变化说明：AI素养正在成为\"新时代的英语\"——所有人都需要具备的基础能力'; },
    financialImpact:null,
    action:(p)=>p.hasChild?'与孩子一起探索AI工具（如用ChatGPT解答问题、用AI画画），把AI变成\"学习伙伴\"而非\"作弊工具\"':'自己先学起来——掌握AI工具本身就是一项高价值技能',
    peerInsight:'有中小学子女的同类人中，仅12%正在引导孩子接触AI工具',
    urgency:'soon', confidence:'high' },

  // ═══ 生育育儿 ═══
  { id:'ps14', domain:'fertility',
    change:'生育补贴+婴幼儿照护扣除：每孩每年3600元补贴+3岁以下每月2000元个税扣除',
    impact:(p)=>{ if(p.hasChild) { const kids=1; const annual=3600+2400*12; return `你有子女，3岁以下婴幼儿照护扣除=${annual.toLocaleString()}元/年！必须在个税APP中填报——很多人漏了这个。加上子女教育扣除（3岁以上每月2000元），你每年可节税可观金额`; }
      if(p.isMarried&&(p.age||30)>=25&&(p.age||30)<=40) return `你已婚且在育龄期——如果计划要孩子，这些补贴虽然不多但\"聊胜于无\"。更重要的是：产假延长+育儿假+照护扣除，总价值超${(3600+2400*12+10000).toLocaleString()}元/年`;
      return '即使你现在不需要，了解这些政策有助于为亲友（或未来的自己）提供信息支持'; },
    financialImpact:(p)=>{ if(p.hasChild) return {min:3600+2400*10,max:3600+2400*12+4800,unit:'/年退税+补贴'}; return {min:0,max:0,unit:''}; },
    action:(p)=>{ if(p.hasChild) return '立即打开\"个人所得税\"APP→专项附加扣除→核对\"婴幼儿照护费用\"和\"子女教育\"是否已填写'; return '如有生育计划，提前了解所在省市的生育补贴标准和申领流程'; },
    peerInsight:'有0-3岁子女的同类人中，高达41%漏填了婴幼儿照护扣除——你可能也是其中之一',
    urgency:'immediate', confidence:'high' },
  { id:'ps15', domain:'fertility',
    change:'多地延长产假至158-188天，新增夫妻各5-10天/年育儿假',
    impact:(p)=>{ const isFemale=p.gender==='女'; const age=p.age||30;
      if(isFemale&&age>=25&&age<=40) return `作为育龄女性，产假延长至158-188天（约5-6个月）意味着更充足的恢复和陪伴时间。但注意：①产假工资由生育保险支付（与你的社保基数挂钩）②部分私企可能因此更偏好招男性——了解你的法律保护`;
      if(!isFemale&&p.isMarried&&age>=25) return '你作为丈夫/准爸爸，也享有育儿假（5-10天/年）——这是法律赋予的权利，别不好意思休';
      return '了解配偶的各项假期权益，在家庭决策中可以提供信息支持'; },
    financialImpact:(p)=>{ if(p.gender==='女'&&(p.age||30)>=25&&(p.age||30)<=40) return {min:15000,max:50000,unit:'生育津贴（与缴费基数挂钩）'}; return {min:0,max:0,unit:''}; },
    action:(p)=>{ if(p.gender==='女') return '查询所在省市的产假最新天数，并确认生育保险连续缴费状态（通常要求缴满9-12个月）'; return '了解配偶的产假/育儿假权益，提前与雇主沟通'; },
    peerInsight:'育龄女性同类人中，仅35%清楚自己的生育津贴与社保基数直接挂钩——基数越高津贴越多',
    urgency:'soon', confidence:'high' },

  // ═══ 养老退休 ═══
  { id:'ps16', domain:'retirement',
    change:'延迟退休：2025年起15年过渡，男63/女58(干部)/女55(工人)岁',
    impact:(p)=>{ const age=p.age||30; const isF=p.gender==='女'; const edu=p.education||'本科';
      const retire=isF?(edu==='博士'||edu==='硕士'?58:55):63;
      const yearsLeft=retire-age;
      const gap=Math.round((retire-(isF?55:60))*0.03*30*5000);
      if(age>=50) return `你${age}岁，${retire}岁退休，仅剩${yearsLeft}年——时间紧迫！延迟退休意味着养老金替代率可能下降3-5%。建议尽快开立个人养老金账户+增配商业养老保险`;
      if(age>=40) return `你${age}岁，离${retire}岁退休还有${yearsLeft}年。现在开始每月定投2000元到个人养老金+指数基金，退休时约累积${Math.round(2000*12*yearsLeft*1.06).toLocaleString()}元`;
      return `你${age}岁，离${retire}岁退休还有${yearsLeft}年——时间是你最大的优势。现在每月投入1000元，复利${yearsLeft}年，到期约${Math.round(1000*12*yearsLeft*1.06).toLocaleString()}元`; },
    financialImpact:(p)=>{ const age=p.age||30; return {min:age>=40?3000:1000,max:age>=40?5400:3600,unit:'/年建议存入个人养老金'}; },
    action:(p)=>{ const age=p.age||30; return age>=40?'立即开立个人养老金账户，年底前缴存12000元享当年税前扣除':'尽早开始定投个人养老金/指数基金，利用长期复利效应'; },
    peerInsight:'40-50岁同类人中，仅26%已开立个人养老金账户——越晚开损失越大',
    urgency:'immediate', confidence:'high' },
  { id:'ps17', domain:'retirement',
    change:'个人养老金制度全国推开：年缴12000元享税前扣除+账户内投资收益免税',
    impact:(p)=>{ const age=p.age||30; const edu=p.education||'本科'; const isHigh=edu==='硕士'||edu==='博士';
      const taxRate=isHigh?0.30:(age>=40?0.25:(age>=35?0.20:0.10));
      const saving=Math.round(12000*taxRate);
      return `以你的情况（${edu}学历/约${Math.round(taxRate*100)}%边际税率），年缴12000元可节税${saving}元。如从${age}岁开始坚持到退休，累计退税+账户收益约${Math.round(saving*((p.gender==='女'?55:60)-age)*1.05).toLocaleString()}元`; },
    financialImpact:(p)=>{ const age=p.age||30; const saving=age>=45?5400:age>=35?3600:1200; return {min:saving,max:saving,unit:'/年省税'}; },
    action:'在工行/招行/支付宝等渠道开立个人养老金账户（5分钟搞定），年底前存入12000元即可享当年扣除',
    peerInsight:'同类人中仅31%已开个人养老金账户——大部分人每年在白白多缴税',
    urgency:'soon', confidence:'high' },

  // ═══ 消费生活 ═══
  { id:'ps20', domain:'consumption',
    change:'个税年度汇算：7项专项附加扣除，每漏一项每年少退1000-5000元',
    impact:(p)=>{ const items=[]; if(p.hasHouse) items.push('房贷利息(1000/月)'); if(p.hasChild) items.push('子女教育(2000/月)');
      if(p.isMarried&&!p.hasChild) items.push('婴幼儿照护(2000/月)'); items.push('赡养老人(3000/月)');
      if(['大专','高中及以下'].includes(p.education||'')) items.push('继续教育(400/月)');
      const missed=items.slice(0,3);
      return `根据你的情况，你可能涉及这些扣除项：${missed.join('、')||'请逐项确认'}。每漏一项，每年少退1200-6000元。${p.hasHouse&&p.hasChild?'你既有房贷又有孩子——两项合计每年可节税约3600-5400元！':''}`; },
    financialImpact:(p)=>{ let base=2400; if(p.hasHouse) base+=2400; if(p.hasChild) base+=4800; return {min:base,max:base*1.5,unit:'/年退税'}; },
    action:'打开\"个人所得税\"APP→\"专项附加扣除\"→逐项核对：房贷利息、子女教育、婴幼儿照护、赡养老人、继续教育、住房租金、大病医疗',
    peerInsight:'同类人中，高达52%至少漏填了一项专项附加扣除——\"退钱\"的事别嫌麻烦',
    urgency:'immediate', confidence:'high' },

  // ═══ 创业营商 ═══
  { id:'ps22', domain:'business',
    change:'小微企业优惠：年利润300万以下实际税负仅5%（减按25%×20%）',
    impact:(p)=>{ if(p.isSelfEmployed) return `你作为自由职业者/创业者——如果你年收入20-50万，注册个体工商户/小微企业后：从按\"劳务报酬\"缴20-40%个税→降至5%企业所得税，每年可省${p.age||30>30?'3-8':'1-3'}万元`;
      return `即使你目前不创业，这个政策说明：①国家在真金白银支持小微 ②\"副业/自由职业→个体户\"的税负已经很低 ③身边的小微创业者生存环境在改善`; },
    financialImpact:(p)=>p.isSelfEmployed?{min:10000,max:80000,unit:'/年省税'}:{min:0,max:0,unit:''},
    action:(p)=>p.isSelfEmployed?'咨询12366或当地税务局：以个体户/小微企业身份经营vs以个人身份接活的税负差异':'了解小微企业注册流程（全程电子化，1天可办完），为未来创业做准备',
    peerInsight:'自由职业同类人中，高达58%仍以\"个人\"身份缴税而未注册个体户——等于每年多缴1-5万',
    urgency:'immediate', confidence:'high' },
]

/** ═══ 政策影响评估引擎 v2 — 全画像驱动+多维评分+同类人基准 ═══ */
export function getPolicyCompass(personaKey, userProfile) {
  const p = userProfile || {}
  p.personaKey = personaKey

  // 为每个信号计算全画像影响分数
  const scored = policySignals.map(s => {
    let relevance = 0 // 0-100

    // ── 通用基础分 ──
    if (s.confidence === 'high') relevance += 15
    if (s.urgency === 'immediate') relevance += 20
    else if (s.urgency === 'soon') relevance += 10

    // ── 画像驱动的关联度计算 ──
    const age = p.age || 30
    const hasHouse = p.hasHouse
    const hasChild = p.hasChild
    const isMarried = p.isMarried
    const isSelfEmp = p.isSelfEmployed
    const isF = p.gender === '女'
    const edu = p.education || '本科'
    const highEdu = ['硕士','博士'].includes(edu)

    // 投资域
    if (s.domain === 'investment') {
      relevance += (personaKey === 'investor' ? 30 : 12)
      if (hasHouse) relevance += 10 // 有房贷→关心利率
      if (age >= 40) relevance += 10 // 中年人→关心资产配置
      if (s.id === 'ps1' && hasHouse) relevance += 15 // LPR对有房者极相关
    }
    // 职业域
    if (s.domain === 'career') {
      relevance += (personaKey === 'worker' || personaKey === 'freelancer' ? 25 : 8)
      if (age < 35) relevance += 15 // 年轻人→职业选择关键期
      if (isSelfEmp && s.id === 'ps6') relevance += 20 // 灵活就业社保
      if (age < 40 && s.id === 'ps7') relevance += 15 // AI替代威胁
      if (highEdu && s.id === 'ps5') relevance += 10 // 高学历+新质生产力
    }
    // 购房域
    if (s.domain === 'housing') {
      if (!hasHouse && age <= 40) relevance += 35 // 没房年轻人
      else if (hasHouse) relevance += 15
      if (hasHouse && isMarried && s.id === 'ps10') relevance += 20 // 已婚有房→换房退税
    }
    // 教育域
    if (s.domain === 'education') {
      relevance += hasChild ? 35 : (age <= 35 ? 12 : 5)
      if (s.id === 'ps11' && hasChild) relevance += 10 // 孩子选专业
    }
    // 生育域
    if (s.domain === 'fertility') {
      if (hasChild) relevance += 30
      else if (isMarried && age >= 25 && age <= 40) relevance += 20
      if (isF && age >= 25 && age <= 40 && s.id === 'ps15') relevance += 20
    }
    // 养老域
    if (s.domain === 'retirement') {
      if (age >= 50) relevance += 40
      else if (age >= 40) relevance += 30
      else if (age >= 30) relevance += 15
      else relevance += 8
      if (isF && s.id === 'ps16') relevance += 8 // 女性退休年龄不同
    }
    // 消费域
    if (s.domain === 'consumption') {
      relevance += 18 // 通用
      if (hasHouse && s.id === 'ps20') relevance += 10 // 有房贷→扣除项相关
    }
    // 创业域
    if (s.domain === 'business') {
      relevance += isSelfEmp ? 35 : 5
      if (s.id === 'ps22' && isSelfEmp) relevance += 15
    }

    // 财务影响加分
    const finImpact = typeof s.financialImpact === 'function' ? s.financialImpact(p) : null
    if (finImpact && finImpact.min > 0) relevance += Math.min(25, Math.floor(finImpact.min / 2000))

    relevance = Math.min(100, relevance)

    return { ...s, _score: relevance, _financial: finImpact }
  })

  // 排序：高关联度优先
  scored.sort((a, b) => b._score - a._score)
  const top = scored.slice(0, 8)

  // 生成个性化文本
  const personalized = top.map(s => ({
    ...s,
    impactText: typeof s.impact === 'function' ? s.impact(p) : s.impact,
    actionText: typeof s.action === 'function' ? s.action(p) : s.action,
  }))

  // 按决策域分组
  const byDomain = {}
  personalized.forEach(s => {
    if (!byDomain[s.domain]) byDomain[s.domain] = []
    if (byDomain[s.domain].length < 2) byDomain[s.domain].push(s)
  })

  // 影响总览
  let totalMin = 0, totalMax = 0
  personalized.forEach(s => {
    if (s._financial?.min) { totalMin += s._financial.min; totalMax += s._financial.max }
  })
  const highCount = personalized.filter(s => s.urgency === 'immediate').length
  const soonCount = personalized.filter(s => s.urgency === 'soon').length

  return {
    signals: personalized,
    byDomain,
    domains: Object.keys(byDomain).map(d => ({ ...domainMeta[d], key: d, count: byDomain[d].length })),
    totalSignals: policySignals.length,
    matchedSignals: personalized.length,
    impactSummary: { totalMin, totalMax, highCount, soonCount },
    date: new Date().toISOString(),
  }
}
