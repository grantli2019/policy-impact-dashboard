/**
 * 专题视图 + 决策场景 + 推荐引擎
 * 由 scripts/split-policy-data.mjs 从 impactData.js 拆分生成
 * 行范围: 1298-2666 (1369 行)
 */

import { personas, dimensions, calcDimensionScore, getIndexLevel } from './core';

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

