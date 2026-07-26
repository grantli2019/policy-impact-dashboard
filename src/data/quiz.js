/**
 * 政策盲区自测题库 + 案例墙 + 场景组
 * 由 scripts/split-policy-data.mjs 从 impactData.js 拆分生成
 * 行范围: 3531-3679 (149 行)
 */


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
