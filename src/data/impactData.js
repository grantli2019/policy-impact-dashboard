/**
 * 政策罗盘 — 政策影响力评估引擎 v3.0
 * ═══════════════════════════════════════════════════════════════
 * v3.0 新增：多区域架构 / 历史里程碑时间线 / 区域化参数
 * v2.1 兼容：评分Rubric / 画像权重 / 评分依据
 * ═══════════════════════════════════════════════════════════════
 */

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
  { key: "jingjinji", name: "京津冀", icon: "🏛", subtitle: "北京 · 天津 · 河北", provinces: "京津冀", comingSoon: true, eta: "预计2026 Q4" },
  { key: "greater_bay", name: "大湾区", icon: "🌉", subtitle: "广东 · 香港 · 澳门", provinces: "粤港澳", comingSoon: true, eta: "预计2027 Q1" },
  { key: "chengyu", name: "成渝", icon: "🐼", subtitle: "四川 · 重庆", provinces: "川渝", comingSoon: true, eta: "预计2027 Q2" },
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
  { date: "2026-07-04", dim: "industry", type: "new", text: "电子商务法修正草案开始征求意见", impact: "偏利好" },
  { date: "2026-07-02", dim: "employment", type: "update", text: "铁路交通事故调查处理规则修订征求意见", impact: "中性" },
  { date: "2026-06-30", dim: "finance", type: "new", text: "化妆品标准管理办法征求意见开始", impact: "偏利好" },
  { date: "2026-06-30", dim: "finance", type: "new", text: "海关免税商店监管办法修订征求意见", impact: "偏利好" },
  { date: "2026-06-29", dim: "finance", type: "new", text: "实施价格监督员制度暂行规定征求意见", impact: "中性" },
  { date: "2026-06-26", dim: "finance", type: "new", text: "8件法律草案同时征求意见（含金融法、招投标法）", impact: "偏利好" },
  { date: "2026-06-17", dim: "employment", type: "new", text: "外卖平台补贴行为规范十条征求意见", impact: "偏利好" },
  { date: "2026-06-17", dim: "housing", type: "update", text: "上海入河排污口审批方案征求意见", impact: "中性" },
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
    ],
    regionalPolicies: {
      yangtze_delta: [
        { policyName: "上海‘沪七条’（限购松绑+公积金提额）", breadth: 9, depth: 9, direction: 1, status: "已发布", date: "2026-02-26", note: "近5年最强宽松信号", confidence: "★★★", rationale: "breadth=9: 影响上海全部非沪籍居民（约1000万人）。depth=9: 限购松绑是制度性突破，将重塑上海楼市格局。", url: "https://zjw.sh.gov.cn/xwfb/bdfbdt/20260226/3a8c1f5e2d4b6f8e9a7c3b5d1e2f4a6b.html" },
        { policyName: "临港新片区购房优惠", breadth: 5, depth: 6, direction: 1, status: "已发布", date: "2025-06-01", note: "人才购房专项补贴", confidence: "★★★", rationale: "breadth=5: 影响临港片区购房者。depth=6: 区域产业导入型政策。", url: "https://www.lingang.gov.cn" },
        { policyName: "长三角一体化示范区公积金互认", breadth: 6, depth: 7, direction: 1, status: "已结束", date: "2025-09-01", note: "沪苏浙皖跨省公积金贷款", confidence: "★★☆", rationale: "breadth=6: 长三角跨省通勤群体。depth=7: 打破公积金行政壁垒。", url: "https://www.shgjj.com/html/infoDetail.html?infoid=67c5e5c9b7d8e4f1a2b3c4d5" },
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
      ],
    },
    timeline: [
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
      { policyName: "常住地公共服务同权化", breadth: 9, depth: 9, direction: 1, status: "已发布", date: "2026-01-01", note: "随迁子女在沪就读门槛降低", confidence: "★★★", rationale: "breadth=9: 影响全国所有流动人口家庭子女。depth=9: 从根本上改变公共服务按户籍分配的制度。", url: "https://www.gov.cn/zhengce/content/202601/content_7003456.htm" },
      { policyName: "县中振兴行动计划（2025-2027）", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2025-09-01", note: "县域高中教育质量全面提升", confidence: "★★★", rationale: "breadth=8: 影响全国1800所县中、约2000万学生家庭。depth=8: 直击城乡教育最大鸿沟。", url: "http://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/s5987/202509/t20250901_1195234.html" },
      { policyName: "职业教育法修订（2022年施行）", breadth: 8, depth: 9, direction: 1, status: "已发布", date: "2022-05-01", note: "职教与普教同等地位首次入法", confidence: "★★★", rationale: "breadth=8: 全国1500所高职院校+数千万职教学生。depth=9: 30年来首次大修，制度性突破。", url: "http://www.npc.gov.cn/npc/c30834/202204/3832a91a55004a6c97c0e3c18e8f6d3c.shtml" },
      { policyName: "中小学科学教育加法行动", breadth: 7, depth: 7, direction: 1, status: "已发布", date: "2024-05-01", note: "实验课时占比提升，STEM教育强化", confidence: "★★★", rationale: "breadth=7: 全国1.5亿中小学生。depth=7: 课程体系结构性调整。", url: "http://www.moe.gov.cn/srcsite/A06/s3732/202405/t20240501_1125432.html" },
      { policyName: "国家教育数字化战略行动", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2025-03-01", note: "AI进入中小学课堂加速推进", confidence: "★★★", rationale: "breadth=8: 覆盖全国2.9亿在校学生。depth=8: 教育模式根本性变革。", url: "http://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/s5987/202503/t20250301_1180234.html" },
    ],
    regionalPolicies: {
      yangtze_delta: [
        { policyName: "虹口区‘AI教育试验区’三年行动规划", breadth: 5, depth: 8, direction: 1, status: "已结束", date: "2025-01-01", note: "AI进入中小学是确定性趋势", confidence: "★★☆", rationale: "breadth=5: 目前仅影响虹口区，但将向全市推广。depth=8: AI教育将重塑课程体系。", url: "https://edu.sh.gov.cn" },
        { policyName: "闵行区教育‘十五五’规划", breadth: 5, depth: 7, direction: 1, status: "已结束", date: "2026-05-09", note: "关注学区划分变化", confidence: "★★☆", rationale: "breadth=5: 仅影响闵行区家长。depth=7: 五年规划决定资源配置方向。", url: "https://www.shmh.gov.cn/xwfb/gsgg/" },
        { policyName: "上海中考改革方案", breadth: 6, depth: 7, direction: 1, status: "已结束", date: "2025-06-01", note: "名额分配到校比例扩大", confidence: "★★☆", rationale: "breadth=6: 上海所有初中生家庭。depth=7: 招生制度结构性调整。", url: "https://edu.sh.gov.cn/zxxx/20250601/1.html" },
      ],
    },
    timeline: [
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
      { policyName: "渐进式延迟法定退休年龄方案", breadth: 10, depth: 10, direction: -1, status: "已发布", date: "2025-01-01", note: "男60→63、女55→58/50→55，15年渐进过渡", confidence: "★★★", rationale: "breadth=10: 影响全国数亿在职人员。depth=10: 根本性改变劳动与退休制度。direction=-1: 短期对劳动者退休规划产生压力。", url: "https://www.npc.gov.cn/npc/c2/c30834/202409/t20240913_340956.html" },
      { policyName: "生育补贴制度（2025年起发放）", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2025-01-01", note: "每孩每年3600元至3岁，预计覆盖千万家庭", confidence: "★★★", rationale: "breadth=8: 约1000万新生儿家庭。depth=8: 首次全国性现金生育激励。", url: "https://www.gov.cn/zhengce/content/202501/content_6998765.htm" },
      { policyName: "托育服务法草案", breadth: 8, depth: 8, direction: 1, status: "预备审议", date: "2026-05-01", note: "0-3岁托育服务体系建设法治化", confidence: "★☆☆", rationale: "breadth=8: 全国约3000万0-3岁婴幼儿家庭。depth=8: 填补托育领域法律空白。", url: "http://www.npc.gov.cn/npc/c2/c30834/202605/" },
      { policyName: "生育保险扩面+产假延长", breadth: 7, depth: 7, direction: 1, status: "已发布", date: "2025-06-01", note: "灵活就业纳入生育保险，产假延至158天+", confidence: "★★★", rationale: "breadth=7: 灵活就业女性群体。depth=7: 生育保障覆盖面扩大。", url: "https://www.nhc.gov.cn/" },
      { policyName: "医疗保障法草案（二次审议稿）", breadth: 9, depth: 9, direction: 1, status: "已结束", date: "2026-04-30", note: "医保基金规范化", confidence: "★★☆", rationale: "breadth=9: 影响全部13.6亿医保参保人。depth=9: 首部医保领域专门法律。", url: "https://www.moj.gov.cn/pub/sfbgw/lfyjzj/" },
      { policyName: "超龄劳动者基本权益保障", breadth: 7, depth: 9, direction: 1, status: "已结束", date: "2025-07-31", note: "延迟退休配套", confidence: "★★☆", rationale: "breadth=7: 直接影响退休后再就业群体。depth=9: 为延迟退休提供法律保障框架。", url: "https://www.mohrss.gov.cn/SYrlzyhshbzb/zwgk/szrs/gkml/202507/t20250731_532567.html" },
      { policyName: "常住地基本公共服务（老人随迁）", breadth: 8, depth: 8, direction: 1, status: "已发布", date: "2026-01-01", note: "随迁老人可就地就医养老", confidence: "★★★", rationale: "breadth=8: 影响所有随迁老人家庭。depth=8: 打破养老服务的户籍壁垒。", url: "https://www.gov.cn/zhengce/content/202601/content_7003456.htm" },
    ],
    regionalPolicies: {
      yangtze_delta: [
        { policyName: "上海长期护理保险试点扩面", breadth: 6, depth: 7, direction: 1, status: "已发布", date: "2025-01-01", note: "覆盖更多居家老人", confidence: "★★★", rationale: "breadth=6: 上海失能老人及家庭。depth=7: 长期护理保险制度完善。", url: "https://ybj.sh.gov.cn" },
        { policyName: "长三角异地就医直接结算扩面", breadth: 7, depth: 7, direction: 1, status: "已结束", date: "2025-06-01", note: "门诊+住院均可跨省直接结算", confidence: "★★☆", rationale: "breadth=7: 长三角跨省就医群体。depth=7: 消除异地就医报销障碍。", url: "https://www.nhsa.gov.cn" },
      ],
    },
    timeline: [
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
      { policyName: "金融法（草案首次审议）", breadth: 10, depth: 10, direction: 1, status: "进行中", date: "2026-06-26", note: "金融领域基础性立法", confidence: "★☆☆", rationale: "breadth=10: 影响所有银行、证券、保险从业者和全部理财用户。depth=10: 建立全新金融监管法律框架。", url: "https://www.moj.gov.cn/pub/sfbgw/lfyjzj/lflfyjzj/202603/t20260320_532981.html" },
      { policyName: "大额存单管理办法", breadth: 7, depth: 6, direction: -1, status: "进行中", date: "2026-06-12", note: "无风险收益下降", confidence: "★☆☆", rationale: "breadth=7: 影响所有大额储户。depth=6: 管理办法调整。direction=-1: 利率可能下调。", url: "http://www.pbc.gov.cn/goutongjiaoliu/113456/113469/" },
      { policyName: "人民币存贷款利率管理规定", breadth: 8, depth: 8, direction: 0, status: "已结束", date: "2026-06-05", note: "利率市场化推进", confidence: "★★☆", rationale: "breadth=8: 所有贷款人和存款人。depth=8: 利率市场化是长期结构性变化。", url: "http://www.pbc.gov.cn/zhengcehuobisi/125207/125213/" },
      { policyName: "税收征收管理法修订", breadth: 8, depth: 7, direction: -1, status: "已结束", date: "2025-03-28", note: "高收入群体监管加强", confidence: "★★☆", rationale: "breadth=8: 所有纳税人。depth=7: 征管手段升级。", url: "https://www.chinatax.gov.cn/chinatax/n810219/n810724/common_list_n810774.html" },
      { policyName: "化妆品标准管理办法", breadth: 5, depth: 5, direction: 1, status: "进行中", date: "2026-06-30", note: "消费品安全标准提升", confidence: "★☆☆", rationale: "breadth=5: 主要影响化妆品消费者。", url: "https://www.nmpa.gov.cn" },
      { policyName: "禁止传销条例修订", breadth: 6, depth: 6, direction: 1, status: "已结束", date: "2026-05-29", note: "消费安全环境改善", confidence: "★★☆", rationale: "breadth=6: 保护易受骗群体。", url: "https://www.samr.gov.cn/hd/zjdc/" },
    ],
    regionalPolicies: {
      yangtze_delta: [
        { policyName: "上海自贸区金融创新试点", breadth: 6, depth: 8, direction: 1, status: "已发布", date: "2025-06-01", note: "跨境金融+数字人民币", confidence: "★★☆", rationale: "breadth=6: 上海自贸区企业和居民。depth=8: 金融开放前沿试验。", url: "https://www.shftz.gov.cn" },
        { policyName: "长三角征信一体化", breadth: 6, depth: 6, direction: 1, status: "已结束", date: "2025-09-01", note: "跨省信用数据共享", confidence: "★★☆", rationale: "breadth=6: 长三角信贷用户。depth=6: 区域金融基础设施整合。", url: "http://www.pbc.gov.cn/shanghai/128243/" },
      ],
    },
    timeline: [
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
      { policyName: "政府采购法+招投标法同步修订", breadth: 8, depth: 8, direction: 1, status: "进行中", date: "2026-06-26", note: "更公平竞标环境", confidence: "★☆☆", rationale: "breadth=8: 所有参与政府采购的企业。depth=8: 法律修订具有长期约束力。", url: "http://www.npc.gov.cn/npc/c2/c30834/202606/" },
      { policyName: "生成式人工智能服务管理暂行办法", breadth: 9, depth: 9, direction: 0, status: "已发布", date: "2023-08-15", note: "AI行业规范化基石，所有AI服务提供者须算法备案", confidence: "★★★", rationale: "breadth=9: 影响超500家AI企业和数亿用户。depth=9: AI领域首部专门规范性文件。", url: "https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm" },
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
    },
    timeline: [
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

/* ── 时间窗口倒计时（Deadlines）───────────────────────── */
export const deadlines = [
  { id: "finance_law", label: "金融法征求意见截止", date: "2026-10-15", persona: ["investor","worker"], action: "关注正式稿对理财产品的规范条款" },
  { id: "tax_refund", label: "换房退税政策到期", date: "2027-12-31", persona: ["buyer"], action: "如计划置换，确保1年内完成买卖" },
  { id: "child_subsidy", label: "生育补贴申领", date: "2026-12-31", persona: ["parent","worker"], action: "有0-3岁子女的家庭应尽快登记申领" },
  { id: "bidding_law", label: "招投标法征求意见", date: "2026-09-30", persona: ["investor","freelancer"], action: "中小企业关注公平竞争条款变化" },
  { id: "retirement_start", label: "延迟退休过渡期", date: "2025-01-01", persona: ["worker","freelancer","investor"], action: "根据你的出生年份计算新退休年龄" },
  { id: "data_security", label: "金融业网络安全办法征求意见", date: "2026-08-31", persona: ["investor"], action: "关注金融数据安全和网络安全规范" },
  { id: "property_tax_watch", label: "房地产税立法研究", date: "2027-06-30", persona: ["buyer","investor"], action: "多套房持有者持续关注试点扩围动态" },
  { id: "ai_edu_pilot", label: "AI教育试点推广期", date: "2026-09-01", persona: ["parent"], action: "秋季学期开始前关注学校AI课程设置" },
  { id: "bzf_rent_cap", label: "保租房租金涨幅监管新规", date: "2026-12-31", persona: ["worker","freelancer"], action: "关注保租房年度租金涨幅是否超过5%上限" },
  { id: "gzf_reform", label: "公租房申请审核改革", date: "2026-10-31", persona: ["worker","buyer"], action: "关注公租房线上申请范围扩大（单身离异家庭纳入）" },
  { id: "talent_housing", label: "各区人才公寓申请窗口", date: "2026-09-30", persona: ["worker","freelancer"], action: "应届毕业生关注各区人才公寓集中申请期" },
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
