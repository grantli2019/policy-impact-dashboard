const fs = require('fs');
const c = fs.readFileSync('src/data/impactData.js', 'utf8');

console.log('=== 各维度国家政策评分覆盖分析 ===\n');
const dims = ['housing','employment','education','elderly','finance','industry'];
const dimNames = {housing:'住房',employment:'就业',education:'教育',elderly:'养老',finance:'金融',industry:'行业'};

dims.forEach(d => {
  const regex = new RegExp('key: "' + d + '"[\\s\\S]*?scores: \\[([\\s\\S]*?)\\],\\s*regionalPolicies');
  const m = c.match(regex);
  if (m) {
    const count = (m[1].match(/policyName:/g) || []).length;
    const dates = [...m[1].matchAll(/date: "(\d{4}-\d{2}-\d{2})"/g)].map(x => x[1]).sort();
    const years = {};
    dates.forEach(dt => { const y = dt.slice(0,4); years[y] = (years[y]||0)+1; });
    console.log(`${dimNames[d]}(${d}): ${count}条 | ${dates[0]} ~ ${dates[dates.length-1]}`);
    console.log(`  年份分布: ${Object.entries(years).map(([y,n])=>y+'('+n+')').join(' ')}`);
    // 检查缺口
    const allYears = Object.keys(years).map(Number).sort();
    const min = Math.min(...allYears), max = Math.max(...allYears);
    const gaps = [];
    for (let y = min; y <= max; y++) { if (!years[y]) gaps.push(y); }
    if (gaps.length) console.log(`  ⚠ 缺口年份: ${gaps.join(', ')}`);
    console.log('');
  }
});

// 区域政策覆盖
console.log('=== 区域政策覆盖 ===\n');
const regions = ['yangtze_delta','jingjinji','greater_bay','chengyu','central'];
const regionNames = {yangtze_delta:'长三角',jingjinji:'京津冀',greater_bay:'大湾区',chengyu:'成渝',central:'中部'};
dims.forEach(d => {
  const regex = new RegExp('key: "' + d + '"[\\s\\S]*?regionalPolicies: \\{([\\s\\S]*?)\\},\\s*(?:tips|timeline)');
  const m = c.match(regex);
  if (m) {
    const counts = regions.map(r => {
      const rm = m[1].match(new RegExp(r + ': \\[([\\s\\S]*?)\\]'));
      return rm ? (rm[1].match(/policyName:/g)||[]).length : 0;
    });
    console.log(`${dimNames[d]}: ${regions.map((r,i)=>regionNames[r]+'('+counts[i]+')').join(' ')}`);
  }
});

// 新闻覆盖
console.log('\n=== 新闻联播解读覆盖 ===\n');
const newsMatch = c.match(/newsLianboUpdates = \[([\s\S]*?)\];/);
if (newsMatch) {
  const newsDates = [...newsMatch[1].matchAll(/date: "(\d{4}-\d{2}-\d{2})"/g)].map(x=>x[1]).sort();
  const months = {};
  newsDates.forEach(d => { const m = d.slice(0,7); months[m] = (months[m]||0)+1; });
  console.log(`总计: ${newsDates.length}条 | ${newsDates[0]} ~ ${newsDates[newsDates.length-1]}`);
  console.log(`月份分布: ${Object.entries(months).map(([m,n])=>m+'('+n+')').join(' ')}`);
  // 检查月份缺口
  const sortedMonths = Object.keys(months).sort();
  const start = sortedMonths[0], end = sortedMonths[sortedMonths.length-1];
  const [sy,sm] = start.split('-').map(Number);
  const [ey,em] = end.split('-').map(Number);
  const gaps = [];
  for (let y=sy; y<=ey; y++) {
    for (let m=1; m<=12; m++) {
      const key = `${y}-${String(m).padStart(2,'0')}`;
      if (key < start || key > end) continue;
      if (!months[key]) gaps.push(key);
    }
  }
  if (gaps.length) console.log(`⚠ 缺口月份: ${gaps.join(', ')}`);
}

// 案例墙
console.log('\n=== 案例墙覆盖 ===\n');
const testimonials = (c.match(/id:'t\d+'/g)||[]).length;
console.log(`总计: ${testimonials}条`);
const cities = [...c.matchAll(/city:'([^']+)'/g)].map(x=>x[1]);
const cityCount = {};
cities.forEach(ct => { cityCount[ct] = (cityCount[ct]||0)+1; });
console.log(`城市分布: ${Object.entries(cityCount).sort((a,b)=>b[1]-a[1]).map(([ct,n])=>ct+'('+n+')').join(' ')}`);

// 专题
console.log('\n=== 专题覆盖 ===\n');
const topics = [...c.matchAll(/id: "([^"]+)",\s*\n\s*icon/g)].map(x=>x[1]);
console.log(`总计: ${topics.length}个专题`);
console.log(`列表: ${topics.join(', ')}`);
