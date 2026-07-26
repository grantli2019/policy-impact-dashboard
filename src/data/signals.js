/**
 * 政策风向标 + 体检诊断 + 个性化周报
 * 由 scripts/split-policy-data.mjs 从 impactData.js 拆分生成
 * 行范围: 4578-4890 (313 行)
 */

import { personas } from './core';
import { lifeRadar } from './life';

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

