/**
 * 人生雷达 + 城市安家 + 统一行动
 * 由 scripts/split-policy-data.mjs 从 impactData.js 拆分生成
 * 行范围: 2899-3530 (632 行)
 */

import { personas, dimensions, calcDimensionScore, getIndexLevel } from './core';

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
