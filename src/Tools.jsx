import { useState } from 'react'
import { regions, birthPolicy, taxOptimizer, pensionCalc } from './data/impactData'
import './App.css'

/* ═══════════════════════════════════════════════════════
 * 工具5: 生育权益计算器（MVP）
 * ═══════════════════════════════════════════════════════ */
function BirthCalc({ regionKey }) {
  const region = regions.find(r => r.key === regionKey)
  const bp = birthPolicy
  const [step, setStep] = useState(0)
  const [salary, setSalary] = useState(15000)
  const [insuranceMonths, setInsuranceMonths] = useState(24)
  const [empType, setEmpType] = useState('employed')
  const [birthOrder, setBirthOrder] = useState(1)
  const [deliveryType, setDeliveryType] = useState('normal')
  const [isDifficult, setIsDifficult] = useState(false)

  const regionalBonus = bp.maternityLeave.regional[regionKey] || 0
  let leaveDays = bp.maternityLeave.base + regionalBonus
  if (deliveryType === 'twins') leaveDays += bp.maternityLeave.bonus.twins
  if (isDifficult) leaveDays += bp.maternityLeave.bonus.difficult
  const eligible = insuranceMonths >= bp.allowance.minInsuranceMonths
  const allowance = eligible ? bp.allowance.formula(salary, leaveDays) : 0
  const deliveryAvg = deliveryType === 'cesarean' ? bp.medical.delivery.cesarean.avg : bp.medical.delivery.normal.avg
  const medicalTotal = bp.medical.prenatal.avg + deliveryAvg
  const medicalReimburse = Math.round(medicalTotal * bp.medical.reimburseRate)
  const medicalSelf = medicalTotal - medicalReimburse
  const childcareTotal = bp.childcare.total
  const paternityDays = bp.paternityLeave[regionKey] || bp.paternityLeave.national
  const taxMonthly = bp.taxDeduction.infant
  const marginalRate = salary > 35000 ? 0.30 : salary > 25000 ? 0.25 : salary > 17000 ? 0.20 : salary > 8000 ? 0.10 : 0.03
  const taxSavingAnnual = Math.round(taxMonthly * 12 * marginalRate)
  const taxSavingTotal = taxSavingAnnual * 3
  const totalBenefit = allowance + medicalReimburse + childcareTotal + taxSavingTotal
  const plainSummary = bp.plainSummary

  return (
    <div className="tool-card birth-calc">
      <h3>👶 生育权益计算器</h3>
      <p className="tool-desc">输入你的情况，一键算出生育能拿多少钱、休多少天</p>
      <div className="bc-steps">
        {['基本情况', '生育详情', '权益报告'].map((label, i) => (
          <div key={i} className={`bc-step ${step === i ? 'active' : step > i ? 'done' : ''}`} onClick={() => i < step ? setStep(i) : null}>
            <span className="bc-step-num">{step > i ? '✓' : i + 1}</span>
            <span className="bc-step-label">{label}</span>
          </div>
        ))}
        <div className="bc-step-line"><div className="bc-step-fill" style={{ width: (step / 2 * 100) + '%' }} /></div>
      </div>
      {step === 0 && (
        <div className="bc-form">
          <label className="bc-label">
            <span>月工资（税前）</span>
            <div className="bc-range-wrap">
              <input type="range" min={3000} max={80000} step={1000} value={salary} onChange={e => setSalary(+e.target.value)} />
              <span className="bc-val">¥{salary.toLocaleString()}</span>
            </div>
          </label>
          <label className="bc-label">
            <span>生育保险连续缴纳月数</span>
            <div className="bc-range-wrap">
              <input type="range" min={0} max={120} step={1} value={insuranceMonths} onChange={e => setInsuranceMonths(+e.target.value)} />
              <span className="bc-val">{insuranceMonths}个月</span>
            </div>
            {insuranceMonths < 12 && <span className="bc-warn">⚠️ 需连续缴纳≥12个月才能领取生育津贴</span>}
          </label>
          <label className="bc-label">
            <span>就业状态</span>
            <div className="bc-btns">
              {[['employed','在职职工'],['freelancer','灵活就业'],['unemployed','未就业']].map(([k, l]) => (
                <button key={k} className={`bc-opt ${empType === k ? 'active' : ''}`} onClick={() => setEmpType(k)}>{l}</button>
              ))}
            </div>
          </label>
          <button className="bc-next" onClick={() => setStep(1)}>下一步 →</button>
        </div>
      )}
      {step === 1 && (
        <div className="bc-form">
          <label className="bc-label">
            <span>胎次</span>
            <div className="bc-btns">
              {[1,2,3].map(n => (
                <button key={n} className={`bc-opt ${birthOrder === n ? 'active' : ''}`} onClick={() => setBirthOrder(n)}>第{n}胎</button>
              ))}
            </div>
          </label>
          <label className="bc-label">
            <span>分娩方式</span>
            <div className="bc-btns">
              {[['normal','顺产'],['cesarean','剖宫产'],['twins','双胞胎/多胎']].map(([k, l]) => (
                <button key={k} className={`bc-opt ${deliveryType === k ? 'active' : ''}`} onClick={() => setDeliveryType(k)}>{l}</button>
              ))}
            </div>
          </label>
          <label className="bc-check">
            <input type="checkbox" checked={isDifficult} onChange={e => setIsDifficult(e.target.checked)} />
            难产（加{bp.maternityLeave.bonus.difficult}天产假）
          </label>
          <div className="bc-nav">
            <button className="bc-back" onClick={() => setStep(0)}>← 上一步</button>
            <button className="bc-next" onClick={() => setStep(2)}>计算权益 →</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="bc-report">
          <div className="bc-report-header">
            <h4 className="bc-report-title">{plainSummary.title}</h4>
            <div className="bc-total-amount">
              <span className="bc-total-label">预计总权益</span>
              <span className="bc-total-num">¥{totalBenefit.toLocaleString()}</span>
            </div>
          </div>
          <div className="bc-cards">
            <div className="bc-card">
              <span className="bc-card-icon">💰</span>
              <div className="bc-card-body">
                <h5>生育津贴</h5>
                <span className="bc-card-amount">{eligible ? `¥${allowance.toLocaleString()}` : '不符合条件'}</span>
                <span className="bc-card-detail">{eligible ? `月薪¥${salary.toLocaleString()} ÷ 30 × ${leaveDays}天` : `需连续缴纳生育保险≥${bp.allowance.minInsuranceMonths}个月`}</span>
              </div>
            </div>
            <div className="bc-card">
              <span className="bc-card-icon">🏥</span>
              <div className="bc-card-body">
                <h5>医疗报销</h5>
                <span className="bc-card-amount">¥{medicalReimburse.toLocaleString()}</span>
                <span className="bc-card-detail">产检+{deliveryType === 'cesarean' ? '剖宫产' : deliveryType === 'twins' ? '多胎分娩' : '顺产'}，报销{Math.round(bp.medical.reimburseRate*100)}%，自付¥{medicalSelf.toLocaleString()}</span>
              </div>
            </div>
            <div className="bc-card">
              <span className="bc-card-icon">👶</span>
              <div className="bc-card-body">
                <h5>育儿补贴</h5>
                <span className="bc-card-amount">¥{childcareTotal.toLocaleString()}</span>
                <span className="bc-card-detail">每年¥{bp.childcare.annual.toLocaleString()} × {bp.childcare.years}年</span>
              </div>
            </div>
            <div className="bc-card">
              <span className="bc-card-icon">📉</span>
              <div className="bc-card-body">
                <h5>个税减免（3年）</h5>
                <span className="bc-card-amount">¥{taxSavingTotal.toLocaleString()}</span>
                <span className="bc-card-detail">每月扣除¥{taxMonthly.toLocaleString()}，年省¥{taxSavingAnnual.toLocaleString()}</span>
              </div>
            </div>
            <div className="bc-card">
              <span className="bc-card-icon">📅</span>
              <div className="bc-card-body">
                <h5>产假天数</h5>
                <span className="bc-card-amount">{leaveDays}天</span>
                <span className="bc-card-detail">国家{bp.maternityLeave.base}天{regionalBonus > 0 ? ` + ${region?.name || '地方'}${regionalBonus}天` : ''}{deliveryType === 'twins' ? ' + 多胎' + bp.maternityLeave.bonus.twins + '天' : ''}{isDifficult ? ' + 难产' + bp.maternityLeave.bonus.difficult + '天' : ''}</span>
              </div>
            </div>
            <div className="bc-card">
              <span className="bc-card-icon">👨</span>
              <div className="bc-card-body">
                <h5>配偶陪产假</h5>
                <span className="bc-card-amount">{paternityDays}天</span>
                <span className="bc-card-detail">陪产假期间工资正常发放</span>
              </div>
            </div>
          </div>
          <div className="bc-takeaways">
            <h5>💡 大白话总结</h5>
            <ul>{plainSummary.keyPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>
          <div className="bc-myths">
            <h5>🔍 辟谣专区</h5>
            {plainSummary.commonMyths.map((m, i) => (
              <div key={i} className="bc-myth-item">
                <span className="bc-myth-myth">❌ {m.myth}</span>
                <span className="bc-myth-truth">✅ {m.truth}</span>
              </div>
            ))}
          </div>
          <div className="bc-actions">
            <h5>📋 下一步行动</h5>
            <div className="bc-action-list">
              {eligible ? (
                <>
                  <div className="bc-action-item"><span className="bai-num">1</span>确认生育保险缴纳状态（随申办/社保APP查询）</div>
                  <div className="bc-action-item"><span className="bai-num">2</span>提前向HR报备生育计划，确认产假流程</div>
                  <div className="bc-action-item"><span className="bai-num">3</span>准备好生育登记（线上或社区办理）</div>
                  <div className="bc-action-item"><span className="bai-num">4</span>产后及时申领育儿补贴和生育津贴</div>
                </>
              ) : (
                <>
                  <div className="bc-action-item"><span className="bai-num">1</span>尽快以灵活就业身份参加生育保险</div>
                  <div className="bc-action-item"><span className="bai-num">2</span>确保连续缴纳满{bp.allowance.minInsuranceMonths}个月后再计划生育</div>
                  <div className="bc-action-item"><span className="bai-num">3</span>配偶如有生育保险，可用配偶的保险报销医疗费</div>
                </>
              )}
            </div>
          </div>
          <div className="bc-nav"><button className="bc-back" onClick={() => setStep(0)}>← 重新计算</button></div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
 * 工具1: 房贷对比计算器（区域化）
 * ═══════════════════════════════════════════════════════ */
function MortgageCalc({ params, regionKey }) {
  const region = regions.find(r => r.key === regionKey)
  const [total, setTotal] = useState(300)
  const [years, setYears] = useState(30)
  const gjjBefore = params.gjjCapBefore
  const gjjAfter = params.gjjCapAfter
  const [gjjRate, setGjjRate] = useState(params.gjjRate)
  const [commRate, setCommRate] = useState(params.commRate)

  const calc = (gjj, comm) => {
    const gjjLoan = Math.min(gjj, total)
    const commLoan = Math.max(0, total - gjjLoan)
    const gjjMonthly = pmt(gjjRate / 100 / 12, years * 12, gjjLoan) * 10000
    const commMonthly = pmt(commRate / 100 / 12, years * 12, commLoan) * 10000
    const totalInterest = (gjjMonthly + commMonthly) * years * 12 - total * 10000
    return { monthly: gjjMonthly + commMonthly, totalInterest, gjjLoan, commLoan }
  }

  const before = calc(gjjBefore, commRate)
  const after  = calc(gjjAfter, commRate)
  const saving = before.totalInterest - after.totalInterest
  const monthlySaving = before.monthly - after.monthly

  return (
    <div className="tool-card">
      <h3>🏠 房贷对比计算器{regionKey !== 'national' && <span className="tool-region-badge">{region?.icon} {region?.name}</span>}</h3>
      <p className="tool-desc">公积金上限从{gjjBefore}万提高到{gjjAfter}万，帮你算算能省多少</p>
      <div className="tool-inputs">
        <label>
          房屋总价（万元）
          <input type="range" min={100} max={1000} step={10} value={total} onChange={e => setTotal(+e.target.value)} />
          <span className="val">{total}万</span>
        </label>
        <label>
          贷款年限
          <select value={years} onChange={e => setYears(+e.target.value)}>
            {[10,15,20,25,30].map(y => <option key={y} value={y}>{y}年</option>)}
          </select>
        </label>
        <label>
          公积金利率（%）
          <input type="number" step={0.01} value={gjjRate} onChange={e => setGjjRate(+e.target.value)} />
        </label>
        <label>
          商贷利率（%）
          <input type="number" step={0.01} value={commRate} onChange={e => setCommRate(+e.target.value)} />
        </label>
      </div>
      <div className="tool-result">
        <div className="result-grid">
          <div className="result-box before">
            <div className="result-label">政策前（公积金上限{gjjBefore}万）</div>
            <div className="result-num">月供 {format(before.monthly)} 元</div>
            <div className="result-sub">总利息 {format(before.totalInterest)} 元</div>
          </div>
          <div className="result-box after">
            <div className="result-label">政策后（公积金上限{gjjAfter}万）</div>
            <div className="result-num">月供 {format(after.monthly)} 元</div>
            <div className="result-sub">总利息 {format(after.totalInterest)} 元</div>
          </div>
        </div>
        <div className="saving-highlight">
          <div>🎉 {years}年总省息：<b>{format(saving)} 元</b>（约{(saving/10000).toFixed(1)}万）</div>
          <div>📉 月供减少：<b>{format(monthlySaving)} 元/月</b></div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
 * 工具2: 换房退税计算器
 * ═══════════════════════════════════════════════════════ */
function TaxRefundCalc() {
  const [sellPrice, setSellPrice] = useState(500)
  const [buyPrice, setBuyPrice] = useState(600)
  const [buyWithinYear, setBuyWithinYear] = useState(true)
  const taxPaid = Math.max(sellPrice * 0.01, (sellPrice - sellPrice * 0.7) * 0.2) * 10000
  const refundable = buyWithinYear && buyPrice >= sellPrice ? taxPaid : 0

  return (
    <div className="tool-card">
      <h3>🔄 换房退税计算器</h3>
      <p className="tool-desc">卖房1年内再买房，已缴个税可全额退还（政策延续至2027年底）</p>
      <div className="tool-inputs">
        <label>
          卖房价（万元）
          <input type="range" min={50} max={2000} step={10} value={sellPrice} onChange={e => setSellPrice(+e.target.value)} />
          <span className="val">{sellPrice}万</span>
        </label>
        <label>
          买房价（万元）
          <input type="range" min={50} max={2000} step={10} value={buyPrice} onChange={e => setBuyPrice(+e.target.value)} />
          <span className="val">{buyPrice}万</span>
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={buyWithinYear} onChange={e => setBuyWithinYear(e.target.checked)} />
          卖房后1年内购买新房
        </label>
      </div>
      <div className="tool-result">
        <div className="result-grid">
          <div className="result-box"><div className="result-label">预估已缴个税</div><div className="result-num">{format(taxPaid)} 元</div></div>
          <div className={`result-box ${refundable > 0 ? 'after' : 'before'}`}>
            <div className="result-label">{refundable > 0 ? '可退税金额' : '不符合退税条件'}</div>
            <div className="result-num">{refundable > 0 ? `${format(refundable)} 元` : '0 元'}</div>
          </div>
        </div>
        {refundable > 0 && <div className="saving-highlight">💰 你可以退回 <b>{format(refundable)} 元</b>（约{(refundable/10000).toFixed(1)}万）个税！</div>}
        {!buyWithinYear && <div className="tip-box">⚠️ 需在卖房后1年内购买新房才能享受退税，请尽快行动！</div>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
 * 工具3: 购房资格自测（区域化）
 * ═══════════════════════════════════════════════════════ */
function QualifyCheck({ regionKey }) {
  const region = regions.find(r => r.key === regionKey)
  const [hukou, setHukou] = useState('')
  const [socialYears, setSocialYears] = useState(0)
  const [ring, setRing] = useState('')
  const [owned, setOwned] = useState(0)

  let result = null
  if (hukou && ring !== '') {
    if (hukou === 'local') {
      result = owned < 2
        ? { ok: true, text: `✅ ${region?.name || '本地'}户籍家庭，可购买第${owned+1}套房`, detail: '本地户籍家庭限购2套，你还有名额' }
        : { ok: false, text: `❌ ${region?.name || '本地'}户籍家庭已限购（最多2套）`, detail: '可考虑卖掉一套再买，享受换房退税' }
    } else {
      if (ring === 'outer') {
        result = { ok: true, text: '✅ 外环外不限购！你可以购买', detail: '新政：非本地户籍居民在外环外购房不限套数' }
      } else {
        if (socialYears >= 3) {
          result = owned < 1
            ? { ok: true, text: '✅ 社保满3年+外环内可买1套', detail: '非本地户籍购房需满足社保年限要求' }
            : { ok: false, text: '❌ 外环内已限购（非本地户籍限1套）', detail: '建议考虑外环外区域，不限购' }
        } else {
          result = { ok: false, text: '❌ 社保年限不足', detail: `你目前社保${socialYears}年，建议继续缴纳或考虑外环外购房` }
        }
      }
    }
  }

  return (
    <div className="tool-card">
      <h3>📋 购房资格自测{regionKey !== 'national' && <span className="tool-region-badge">{region?.icon} {region?.name}</span>}</h3>
      <p className="tool-desc">2分钟测出你有没有{region?.name || '当地'}购房资格</p>
      <div className="tool-inputs">
        <label>
          户籍情况
          <select value={hukou} onChange={e => setHukou(e.target.value)}>
            <option value="">请选择</option>
            <option value="local">{region?.name || '本地'}户籍</option>
            <option value="other">非{region?.name || '本地'}户籍</option>
          </select>
        </label>
        {hukou === 'other' && (
          <>
            <label>
              当地社保年限
              <input type="range" min={0} max={10} value={socialYears} onChange={e => setSocialYears(+e.target.value)} />
              <span className="val">{socialYears}年</span>
            </label>
            <label>
              计划购房区域
              <select value={ring} onChange={e => setRing(e.target.value)}>
                <option value="">请选择</option>
                <option value="inner">主城区/外环内</option>
                <option value="outer">郊区/外环外</option>
              </select>
            </label>
          </>
        )}
        {hukou === 'local' && (
          <label>
            目前已有住房套数
            <select value={owned} onChange={e => setOwned(+e.target.value)}>
              <option value={0}>0套</option><option value={1}>1套</option><option value={2}>2套及以上</option>
            </select>
          </label>
        )}
      </div>
      {result && (
        <div className="tool-result">
          <div className={`result-box ${result.ok ? 'after' : 'before'}`}>
            <div className="result-num" style={{ fontSize: 18 }}>{result.text}</div>
            <div className="result-sub">{result.detail}</div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
 * 工具4: 公积金省息计算器
 * ═══════════════════════════════════════════════════════ */
function GjjSavingCalc({ params }) {
  const [loan, setLoan] = useState(200)
  const [years, setYears] = useState(30)
  const [gjjRate, setGjjRate] = useState(params.gjjRate)
  const [commRate, setCommRate] = useState(params.commRate)
  const gjjMonthly = pmt(gjjRate/100/12, years*12, loan) * 10000
  const commMonthly = pmt(commRate/100/12, years*12, loan) * 10000
  const diff = commMonthly - gjjMonthly
  const totalDiff = diff * years * 12

  return (
    <div className="tool-card">
      <h3>💰 公积金 vs 商贷省息计算器</h3>
      <p className="tool-desc">算算公积金贷款比商贷省多少钱</p>
      <div className="tool-inputs">
        <label>
          贷款金额（万元）
          <input type="range" min={10} max={500} step={10} value={loan} onChange={e => setLoan(+e.target.value)} />
          <span className="val">{loan}万</span>
        </label>
        <label>
          贷款年限
          <select value={years} onChange={e => setYears(+e.target.value)}>
            {[10,15,20,25,30].map(y => <option key={y} value={y}>{y}年</option>)}
          </select>
        </label>
        <label>
          公积金利率（%）
          <input type="number" step={0.01} value={gjjRate} onChange={e => setGjjRate(+e.target.value)} />
        </label>
        <label>
          商贷利率（%）
          <input type="number" step={0.01} value={commRate} onChange={e => setCommRate(+e.target.value)} />
        </label>
      </div>
      <div className="tool-result">
        <div className="result-grid">
          <div className="result-box before"><div className="result-label">商贷月供</div><div className="result-num">{format(commMonthly)} 元</div></div>
          <div className="result-box after"><div className="result-label">公积金月供</div><div className="result-num">{format(gjjMonthly)} 元</div></div>
        </div>
        <div className="saving-highlight">
          <div>📉 月供差额：<b>{format(diff)} 元/月</b></div>
          <div>🎉 {years}年总省息：<b>{format(totalDiff)} 元</b>（约{(totalDiff/10000).toFixed(1)}万）</div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
 * 工具6: 个税优化计算器
 * ═══════════════════════════════════════════════════════ */
function TaxOptimizerCalc() {
  const tax = taxOptimizer
  const [monthlySalary, setMonthlySalary] = useState(15000)
  const [annualBonus, setAnnualBonus] = useState(30000)
  const [bonusMode, setBonusMode] = useState('standalone') // standalone | combined
  const [selectedDeductions, setSelectedDeductions] = useState({
    childrenEducation: false, continuingEducation: false, housingLoan: true,
    housingRent: false, elderlyCare: true, infantCare: false, seriousIllness: false,
  })
  const toggleDeduction = (key) => {
    const next = { ...selectedDeductions, [key]: !selectedDeductions[key] }
    // 住房贷款和租房租金互斥
    if (key === 'housingLoan' && next.housingLoan) next.housingRent = false
    if (key === 'housingRent' && next.housingRent) next.housingLoan = false
    setSelectedDeductions(next)
  }

  const annualSalary = monthlySalary * 12
  const totalDeductions = Object.entries(tax.deductions)
    .filter(([k]) => selectedDeductions[k])
    .reduce((sum, [, v]) => sum + v.standard, 0)

  // 综合所得应纳税所得额（不含年终奖）
  const taxableIncome = Math.max(0, annualSalary - tax.taxFreeThreshold - totalDeductions)
  const calcTax = (income) => {
    const b = tax.brackets.find(b => income > b.min && income <= b.max) || tax.brackets[tax.brackets.length - 1]
    return Math.max(0, Math.round(income * b.rate - b.deduction))
  }

  // 年终奖单独计税
  const bonusTaxStandalone = (() => {
    if (bonusMode !== 'standalone' || annualBonus <= 0) return 0
    const monthly = annualBonus / 12
    const rate = monthly <= 3000 ? 0.03 : monthly <= 12000 ? 0.10 : monthly <= 25000 ? 0.20 : monthly <= 35000 ? 0.25 : monthly <= 55000 ? 0.30 : monthly <= 80000 ? 0.35 : 0.45
    const ded = monthly <= 3000 ? 0 : monthly <= 12000 ? 210 : monthly <= 25000 ? 1410 : monthly <= 35000 ? 2660 : monthly <= 55000 ? 4410 : monthly <= 80000 ? 7160 : 15160
    return Math.round(annualBonus * rate - ded)
  })()

  const salaryTax = calcTax(taxableIncome)
  const combinedTaxable = Math.max(0, annualSalary + annualBonus - tax.taxFreeThreshold - totalDeductions)
  const combinedTax = calcTax(combinedTaxable)
  const standaloneTotal = salaryTax + bonusTaxStandalone
  const bestMode = standaloneTotal <= combinedTax ? 'standalone' : 'combined'
  const savedAmount = Math.abs(combinedTax - standaloneTotal)
  const finalTax = Math.min(standaloneTotal, combinedTax)
  const effectiveRate = annualSalary + annualBonus > 0 ? (finalTax / (annualSalary + annualBonus) * 100).toFixed(1) : 0
  const ps = tax.plainSummary

  return (
    <div className="tool-card birth-calc">
      <h3>🧾 个税优化计算器</h3>
      <p className="tool-desc">算算你的个税能省多少，找到最优扣除方案</p>
      <div className="bc-form">
        <label className="bc-label">
          <span>月工资（税前）</span>
          <div className="bc-range-wrap">
            <input type="range" min={3000} max={80000} step={1000} value={monthlySalary} onChange={e => setMonthlySalary(+e.target.value)} />
            <span className="bc-val">¥{monthlySalary.toLocaleString()}</span>
          </div>
        </label>
        <label className="bc-label">
          <span>年终奖</span>
          <div className="bc-range-wrap">
            <input type="range" min={0} max={200000} step={5000} value={annualBonus} onChange={e => setAnnualBonus(+e.target.value)} />
            <span className="bc-val">¥{annualBonus.toLocaleString()}</span>
          </div>
        </label>
        <label className="bc-label">
          <span>年终奖计税方式</span>
          <div className="bc-btns">
            <button className={`bc-opt ${bonusMode === 'standalone' ? 'active' : ''}`} onClick={() => setBonusMode('standalone')}>单独计税</button>
            <button className={`bc-opt ${bonusMode === 'combined' ? 'active' : ''}`} onClick={() => setBonusMode('combined')}>并入综合所得</button>
          </div>
          <span className="bc-tip">💡 {tax.bonusStrategy.tip}</span>
        </label>
        <div className="to-deductions">
          <h5>专项附加扣除（勾选你符合条件的）</h5>
          <div className="to-ded-grid">
            {Object.entries(tax.deductions).map(([key, v]) => (
              <label key={key} className={`to-ded-item ${selectedDeductions[key] ? 'active' : ''}`} onClick={() => toggleDeduction(key)}>
                <span className="to-ded-check">{selectedDeductions[key] ? '☑' : '☐'}</span>
                <span className="to-ded-name">{v.label}</span>
                <span className="to-ded-amount">¥{(v.standard/12).toLocaleString()}/月</span>
              </label>
            ))}
          </div>
          <div className="to-ded-total">当前年度扣除总额：<b>¥{totalDeductions.toLocaleString()}</b></div>
        </div>
      </div>
      <div className="bc-report" style={{ marginTop: 16 }}>
        <div className="bc-report-header">
          <h4 className="bc-report-title">年度个税报告</h4>
          <div className="bc-total-amount">
            <span className="bc-total-label">最优方案年缴税</span>
            <span className="bc-total-num">¥{finalTax.toLocaleString()}</span>
          </div>
        </div>
        <div className="bc-cards">
          <div className="bc-card">
            <span className="bc-card-icon">💼</span>
            <div className="bc-card-body">
              <h5>工资薪金税</h5>
              <span className="bc-card-amount">¥{salaryTax.toLocaleString()}</span>
              <span className="bc-card-detail">年工资¥{annualSalary.toLocaleString()}，扣除后应税¥{taxableIncome.toLocaleString()}</span>
            </div>
          </div>
          <div className="bc-card">
            <span className="bc-card-icon">🎁</span>
            <div className="bc-card-body">
              <h5>年终奖税（{bonusMode === 'standalone' ? '单独' : '合并'}）</h5>
              <span className="bc-card-amount">¥{(bonusMode === 'standalone' ? bonusTaxStandalone : '含在综合所得中').toString()}</span>
              <span className="bc-card-detail">年终奖¥{annualBonus.toLocaleString()}</span>
            </div>
          </div>
          <div className="bc-card">
            <span className="bc-card-icon">📉</span>
            <div className="bc-card-body">
              <h5>实际税率</h5>
              <span className="bc-card-amount">{effectiveRate}%</span>
              <span className="bc-card-detail">总税额÷总收入</span>
            </div>
          </div>
          <div className="bc-card">
            <span className="bc-card-icon">🏆</span>
            <div className="bc-card-body">
              <h5>最优方案</h5>
              <span className="bc-card-amount">{bestMode === 'standalone' ? '单独计税' : '合并计税'}</span>
              <span className="bc-card-detail">比另一方案省¥{savedAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="bc-takeaways">
          <h5>💡 大白话总结</h5>
          <ul>{ps.keyPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </div>
        <div className="bc-myths">
          <h5>🔍 辟谣专区</h5>
          {ps.commonMyths.map((m, i) => (
            <div key={i} className="bc-myth-item">
              <span className="bc-myth-myth">❌ {m.myth}</span>
              <span className="bc-myth-truth">✅ {m.truth}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
 * 工具7: 养老金估算器
 * ═══════════════════════════════════════════════════════ */
function PensionEstimator() {
  const pc = pensionCalc
  const [gender, setGender] = useState('male')
  const [currentAge, setCurrentAge] = useState(35)
  const [monthlySalary, setMonthlySalary] = useState(15000)
  const [contribYears, setContribYears] = useState(15)
  const [localAvgSalary, setLocalAvgSalary] = useState(12000)

  // 计算实际退休年龄（含延迟退休）
  const calcRetireAge = () => {
    const ds = pc.delaySchedule
    const baseAge = gender === 'male' ? pc.currentPensionAge.male : pc.currentPensionAge.female
    const target = gender === 'male' ? ds.maleTarget : ds.femaleTarget
    const totalDelay = gender === 'male' ? ds.maleDelayMonths : ds.femaleDelayMonths
    const startYear = ds.maleStartYear
    // 计算该用户到哪一年到达原退休年龄
    const origRetireYear = new Date().getFullYear() - currentAge + baseAge
    if (origRetireYear <= startYear) return baseAge // 已到或未开始延迟
    const yearsAfterStart = origRetireYear - startYear
    const delayMonths = Math.min(totalDelay, Math.floor(yearsAfterStart * 12 / ds.maleStepMonths))
    return baseAge + Math.round(delayMonths / 12 * 10) / 10
  }
  const retireAge = calcRetireAge()
  const yearsToRetire = Math.max(0, Math.round(retireAge) - currentAge)

  // 退休时社会平均工资（考虑增长）
  const futureAvgSalary = Math.round(localAvgSalary * Math.pow(1 + pc.avgSalaryGrowth, yearsToRetire))

  // 基础养老金 = 退休时当地平均工资 × (1 + 缴费指数)/2 × 缴费年限 × 1%
  const contributionIndex = monthlySalary / localAvgSalary // 缴费指数
  const cappedIndex = Math.min(3, Math.max(0.6, contributionIndex)) // 限高限低
  const basePension = Math.round(futureAvgSalary * (1 + cappedIndex) / 2 * contribYears * pc.basePensionRate)

  // 个人账户养老金 = 个人账户累计额 ÷ 计发月数
  const annualContribution = monthlySalary * pc.personalRate * 12
  let accountTotal = 0
  for (let y = 0; y < contribYears && y < yearsToRetire; y++) {
    const yearContrib = annualContribution * Math.pow(1 + pc.avgSalaryGrowth, y)
    accountTotal += yearContrib * Math.pow(1 + pc.accountRate, yearsToRetire - y)
  }
  const retireAgeRound = Math.round(retireAge)
  const divisorKey = Object.keys(pc.divisorMonths).reduce((prev, curr) =>
    Math.abs(curr - retireAgeRound) < Math.abs(prev - retireAgeRound) ? curr : prev
  )
  const divisor = pc.divisorMonths[divisorKey] || 139
  const accountPension = Math.round(accountTotal / divisor)

  const totalPension = basePension + accountPension
  const replacementRate = monthlySalary > 0 ? ((totalPension / monthlySalary) * 100).toFixed(1) : 0
  const totalContributed = Math.round(annualContribution * contribYears * (1 + pc.avgSalaryGrowth) ** (contribYears / 2))
  const paybackMonths = accountPension > 0 ? Math.round(accountTotal / accountPension) : 0
  const meetsMinYears = contribYears >= pc.minContributionYears
  const ps = pc.plainSummary

  return (
    <div className="tool-card birth-calc">
      <h3>👴 养老金估算器</h3>
      <p className="tool-desc">算算退休后每月能拿多少养老金，看看够不够生活</p>
      <div className="bc-form">
        <label className="bc-label">
          <span>性别</span>
          <div className="bc-btns">
            <button className={`bc-opt ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>男</button>
            <button className={`bc-opt ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>女</button>
          </div>
        </label>
        <label className="bc-label">
          <span>当前年龄</span>
          <div className="bc-range-wrap">
            <input type="range" min={20} max={59} value={currentAge} onChange={e => setCurrentAge(+e.target.value)} />
            <span className="bc-val">{currentAge}岁</span>
          </div>
        </label>
        <label className="bc-label">
          <span>当前月工资（税前）</span>
          <div className="bc-range-wrap">
            <input type="range" min={3000} max={50000} step={1000} value={monthlySalary} onChange={e => setMonthlySalary(+e.target.value)} />
            <span className="bc-val">¥{monthlySalary.toLocaleString()}</span>
          </div>
        </label>
        <label className="bc-label">
          <span>累计缴费年限</span>
          <div className="bc-range-wrap">
            <input type="range" min={1} max={40} value={contribYears} onChange={e => setContribYears(+e.target.value)} />
            <span className="bc-val">{contribYears}年</span>
          </div>
          {contribYears < pc.minContributionYears && <span className="bc-warn">⚠️ 最低需缴满{pc.minContributionYears}年（未来可能提高到{pc.futureMinYears}年）</span>}
        </label>
        <label className="bc-label">
          <span>当地社会平均工资</span>
          <div className="bc-range-wrap">
            <input type="range" min={5000} max={30000} step={500} value={localAvgSalary} onChange={e => setLocalAvgSalary(+e.target.value)} />
            <span className="bc-val">¥{localAvgSalary.toLocaleString()}</span>
          </div>
        </label>
      </div>
      <div className="bc-report" style={{ marginTop: 16 }}>
        <div className="bc-report-header">
          <h4 className="bc-report-title">退休养老金预估</h4>
          <div className="bc-total-amount">
            <span className="bc-total-label">预计月养老金</span>
            <span className="bc-total-num">{meetsMinYears ? `¥${totalPension.toLocaleString()}` : '未达最低年限'}</span>
          </div>
        </div>
        {meetsMinYears ? (
          <div className="bc-cards">
            <div className="bc-card">
              <span className="bc-card-icon">🏛️</span>
              <div className="bc-card-body">
                <h5>基础养老金</h5>
                <span className="bc-card-amount">¥{basePension.toLocaleString()}/月</span>
                <span className="bc-card-detail">当地工资¥{futureAvgSalary.toLocaleString()} × 缴费{contribYears}年 × 指数{cappedIndex.toFixed(2)}</span>
              </div>
            </div>
            <div className="bc-card">
              <span className="bc-card-icon">💳</span>
              <div className="bc-card-body">
                <h5>个人账户养老金</h5>
                <span className="bc-card-amount">¥{accountPension.toLocaleString()}/月</span>
                <span className="bc-card-detail">账户累计¥{Math.round(accountTotal).toLocaleString()} ÷ {divisor}个月</span>
              </div>
            </div>
            <div className="bc-card">
              <span className="bc-card-icon">📊</span>
              <div className="bc-card-body">
                <h5>养老金替代率</h5>
                <span className="bc-card-amount">{replacementRate}%</span>
                <span className="bc-card-detail">{+replacementRate > 60 ? '✅ 高于平均水平' : +replacementRate > 40 ? '⚠️ 接近平均水平' : '⚠️ 偏低，建议多缴几年'}</span>
              </div>
            </div>
            <div className="bc-card">
              <span className="bc-card-icon">📅</span>
              <div className="bc-card-body">
                <h5>预计退休年龄</h5>
                <span className="bc-card-amount">{retireAge}岁</span>
                <span className="bc-card-detail">还有{yearsToRetire}年（含延迟退休调整）</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bc-takeaways" style={{textAlign:'center',padding:'24px 0'}}>
            <p style={{fontSize:18}}>⚠️ 缴费年限不足{pc.minContributionYears}年，暂不符合领取条件</p>
            <p style={{color:'#666',marginTop:8}}>建议至少缴满{pc.minContributionYears}年，以灵活就业身份也可参保</p>
          </div>
        )}
        <div className="bc-takeaways">
          <h5>💡 大白话总结</h5>
          <ul>{ps.keyPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </div>
        <div className="bc-myths">
          <h5>🔍 辟谣专区</h5>
          {ps.commonMyths.map((m, i) => (
            <div key={i} className="bc-myth-item">
              <span className="bc-myth-myth">❌ {m.myth}</span>
              <span className="bc-myth-truth">✅ {m.truth}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
 * 工具容器（带区域支持）
 * ═══════════════════════════════════════════════════════ */
export default function Tools({ regionKey = "national", toolParams, onNavigateDim }) {
  const [active, setActive] = useState(0)
  const region = regions.find(r => r.key === regionKey)
  const tools = [
    { label: '👶 生育权益', comp: () => <BirthCalc regionKey={regionKey} /> },
    { label: '🏠 房贷对比', comp: () => <MortgageCalc params={toolParams} regionKey={regionKey} /> },
    { label: '🔄 换房退税', comp: TaxRefundCalc },
    { label: '📋 购房资格', comp: () => <QualifyCheck regionKey={regionKey} /> },
    { label: '💰 公积金省息', comp: () => <GjjSavingCalc params={toolParams} /> },
    { label: '🧾 个税优化', comp: TaxOptimizerCalc },
    { label: '👴 养老金', comp: PensionEstimator },
  ]
  const ActiveComp = tools[active].comp

  return (
    <div className="tools-page">
      <h2 className="section-title">🧮 实用工具集</h2>
      <p className="tool-desc">
        基于最新政策开发的计算工具，帮你把政策翻译成具体的数字
        {regionKey !== 'national' && <span className="tool-region-info"> · 当前：{region?.icon} {region?.name}</span>}
      </p>
      <div className="tool-tabs">
        {tools.map((t, i) => (
          <button key={i} className={`tab-btn tool-tab ${active===i?'active':''}`} onClick={() => setActive(i)}>{t.label}</button>
        ))}
      </div>
      <ActiveComp />
      <div className="tool-policy-link">
        {active <= 3 && <button className="policy-link-btn" onClick={() => onNavigateDim?.('housing')}>🏠 了解住房政策详情 →</button>}
        {active === 4 && <button className="policy-link-btn" onClick={() => onNavigateDim?.('housing')}>🏠 了解公积金条例详情 →</button>}
        {active === 5 && <button className="policy-link-btn" onClick={() => onNavigateDim?.('employment')}>💼 了解个税政策详情 →</button>}
        {active === 6 && <button className="policy-link-btn" onClick={() => onNavigateDim?.('elderly')}>👴 了解养老政策详情 →</button>}
      </div>
      <div className="tool-disclaimer">
        ⚠️ 以上计算结果仅供参考，实际金额以银行审批和税务局核定为准。
        利率数据更新至2026年7月，如有变动请以最新政策为准。
      </div>
    </div>
  )
}

/* ═══════ 辅助函数 ═══════ */
function pmt(rate, nper, pv) {
  if (rate === 0) return pv / nper
  return pv * rate * Math.pow(1 + rate, nper) / (Math.pow(1 + rate, nper) - 1)
}
function format(n) { return Math.round(n).toLocaleString('zh-CN') }
