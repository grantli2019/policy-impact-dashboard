import { useState, useEffect, useRef } from 'react'
import { regions, birthPolicy, taxOptimizer, pensionCalc, citySettlementData, calcSettlementScore, calcHouseQualify, citySubsidies, calcEligibleSubsidies, calcGjjSavings, saveToolResult } from './data/impactData'
import './App.css'

/* ═══════ 可复用Slider组件（带min/max标注） ═══════ */
function RangeField({ min, max, step, value, onChange, suffix, prefix }) {
  const fmt = v => prefix ? `${prefix}${Number(v).toLocaleString()}` : `${Number(v).toLocaleString()}${suffix || ''}`
  return (
    <div className="bc-range-wrap">
      <input type="range" min={min} max={max} step={step || 1} value={value} onChange={e => onChange(+e.target.value)} />
      <div className="bc-range-row">
        <span className="bc-val">{fmt(value)}</span>
        <span className="bc-range-scale"><span className="bc-scale-min">{fmt(min)}</span><span className="bc-scale-max">{fmt(max)}</span></span>
      </div>
    </div>
  )
}

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
  const savedRef = useRef(false)

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

  // 自动保存计算结果
  useEffect(() => {
    if (step === 2 && !savedRef.current) {
      savedRef.current = true
      saveToolResult('生育权益计算器',
        { salary, insuranceMonths, empType, birthOrder, deliveryType, isDifficult, regionKey },
        { totalBenefit, allowance, leaveDays, medicalReimburse, childcareTotal, taxSavingTotal, paternityDays, eligible }
      )
    }
    if (step !== 2) savedRef.current = false
  }, [step, totalBenefit])

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
            <RangeField min={3000} max={80000} step={1000} value={salary} onChange={setSalary} prefix="¥" />
          </label>
          <label className="bc-label">
            <span>生育保险连续缴纳月数</span>
            <RangeField min={0} max={120} step={1} value={insuranceMonths} onChange={setInsuranceMonths} suffix="个月" />
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
  const [gjjRateErr, setGjjRateErr] = useState('')
  const [commRateErr, setCommRateErr] = useState('')
  const savedRef = useRef(false)
  const validateRate = (v, label) => {
    if (v < 0.5) return `${label}不应低于0.5%`
    if (v > 6.0) return `${label}不应高于6.0%`
    return ''
  }

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

  // 自动保存
  useEffect(() => {
    const key = `${total}_${years}_${gjjRate}_${commRate}_${regionKey}`
    if (!gjjRateErr && !commRateErr && !savedRef.current) {
      savedRef.current = key
      saveToolResult('房贷对比计算器',
        { total, years, gjjRate, commRate, regionKey },
        { saving, monthlySaving, gjjBefore, gjjAfter }
      )
    }
  }, [saving, monthlySaving])

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
          <input type="number" step={0.01} min={0.5} max={6.0} value={gjjRate} onChange={e => { setGjjRate(+e.target.value); setGjjRateErr('') }} onBlur={() => setGjjRateErr(validateRate(gjjRate, '公积金利率'))} className={gjjRateErr ? 'input-error' : ''} />
          {gjjRateErr && <span className="field-error">{gjjRateErr}</span>}
        </label>
        <label>
          商贷利率（%）
          <input type="number" step={0.01} min={0.5} max={6.0} value={commRate} onChange={e => { setCommRate(+e.target.value); setCommRateErr('') }} onBlur={() => setCommRateErr(validateRate(commRate, '商贷利率'))} className={commRateErr ? 'input-error' : ''} />
          {commRateErr && <span className="field-error">{commRateErr}</span>}
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
      <div className="tool-next-steps">
        <h5>📋 下一步行动</h5>
        <div className="tns-list">
          <div className="tns-item"><span className="tns-num">1</span>去公积金中心确认你的可贷额度</div>
          <div className="tns-item"><span className="tns-num">2</span>联系多家银行对比实际审批利率</div>
          <div className="tns-item"><span className="tns-num">3</span>准备首付和贷款材料（身份证、收入证明、征信报告）</div>
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
          <div className="result-box"><div className="result-label">预估已缴个税 <span className="help-tip" data-tip="按全额1%（全额1%计税）或差额20%（扣除30%购房成本后×20%税率）孰低原则计算">?</span></div><div className="result-num">{format(taxPaid)} 元</div></div>
          <div className={`result-box ${refundable > 0 ? 'after' : 'before'}`}>
            <div className="result-label">{refundable > 0 ? '可退税金额' : '不符合退税条件'}</div>
            <div className="result-num">{refundable > 0 ? `${format(refundable)} 元` : '0 元'}</div>
          </div>
        </div>
        {refundable > 0 && <div className="saving-highlight">💰 你可以退回 <b>{format(refundable)} 元</b>（约{(refundable/10000).toFixed(1)}万）个税！</div>}
        {!buyWithinYear && <div className="tip-box">⚠️ 需在卖房后1年内购买新房才能享受退税，请尽快行动！</div>}
      </div>
      <div className="tool-next-steps">
        <h5>📋 下一步行动</h5>
        <div className="tns-list">
          <div className="tns-item"><span className="tns-num">1</span>保留好卖房已缴个税的完税凭证</div>
          <div className="tns-item"><span className="tns-num">2</span>确保卖房后1年内完成新房购买</div>
          <div className="tns-item"><span className="tns-num">3</span>到当地税务局窗口提交退税申请</div>
        </div>
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
      <div className="tool-next-steps">
        <h5>📋 下一步行动</h5>
        <div className="tns-list">
          <div className="tns-item"><span className="tns-num">1</span>确认你的户籍和社保缴纳状态</div>
          <div className="tns-item"><span className="tns-num">2</span>联系当地住建委或房产交易中心核实最新限购政策</div>
          <div className="tns-item"><span className="tns-num">3</span>如有购房计划，提前准备身份、社保、纳税证明</div>
        </div>
      </div>
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
  const [gjjRateErr, setGjjRateErr] = useState('')
  const [commRateErr, setCommRateErr] = useState('')
  const savedRef = useRef(false)
  const validateRate = (v, label) => {
    if (v < 0.5) return `${label}不应低于0.5%`
    if (v > 6.0) return `${label}不应高于6.0%`
    return ''
  }
  const gjjMonthly = pmt(gjjRate/100/12, years*12, loan) * 10000
  const commMonthly = pmt(commRate/100/12, years*12, loan) * 10000
  const diff = commMonthly - gjjMonthly
  const totalDiff = diff * years * 12

  // 自动保存
  useEffect(() => {
    if (!gjjRateErr && !commRateErr && !savedRef.current) {
      savedRef.current = true
      saveToolResult('公积金省息计算器',
        { loan, years, gjjRate, commRate },
        { gjjMonthly, commMonthly, diff, totalDiff }
      )
    }
  }, [totalDiff])

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
          <input type="number" step={0.01} min={0.5} max={6.0} value={gjjRate} onChange={e => { setGjjRate(+e.target.value); setGjjRateErr('') }} onBlur={() => setGjjRateErr(validateRate(gjjRate, '公积金利率'))} className={gjjRateErr ? 'input-error' : ''} />
          {gjjRateErr && <span className="field-error">{gjjRateErr}</span>}
        </label>
        <label>
          商贷利率（%）
          <input type="number" step={0.01} min={0.5} max={6.0} value={commRate} onChange={e => { setCommRate(+e.target.value); setCommRateErr('') }} onBlur={() => setCommRateErr(validateRate(commRate, '商贷利率'))} className={commRateErr ? 'input-error' : ''} />
          {commRateErr && <span className="field-error">{commRateErr}</span>}
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
      <div className="tool-next-steps">
        <h5>📋 下一步行动</h5>
        <div className="tns-list">
          <div className="tns-item"><span className="tns-num">1</span>查询你的公积金账户余额和月缴存额</div>
          <div className="tns-item"><span className="tns-num">2</span>向贷款银行咨询组合贷款流程和利率</div>
          <div className="tns-item"><span className="tns-num">3</span>对比不同银行的公积金贷款办理时效</div>
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
  const savedRef = useRef(false)
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

  // 自动保存
  useEffect(() => {
    if (!savedRef.current) {
      savedRef.current = true
      saveToolResult('个税优化计算器',
        { monthlySalary, annualBonus, bonusMode, selectedDeductions },
        { finalTax, salaryTax, bonusTaxStandalone, combinedTax, bestMode, savedAmount, effectiveRate, totalDeductions }
      )
    }
  }, [finalTax])

  return (
    <div className="tool-card birth-calc">
      <h3>🧾 个税优化计算器</h3>
      <p className="tool-desc">算算你的个税能省多少，找到最优扣除方案</p>
      <div className="bc-form">
        <label className="bc-label">
          <span>月工资（税前）</span>
          <RangeField min={3000} max={80000} step={1000} value={monthlySalary} onChange={setMonthlySalary} prefix="¥" />
        </label>
        <label className="bc-label">
          <span>年终奖</span>
          <RangeField min={0} max={200000} step={5000} value={annualBonus} onChange={setAnnualBonus} prefix="¥" />
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
              <span className="bc-card-amount">¥{(bonusMode === 'standalone' ? bonusTaxStandalone : Math.round(combinedTax - salaryTax)).toLocaleString()}</span>
              <span className="bc-card-detail">年终奖¥{annualBonus.toLocaleString()} · 合并后总税额¥{combinedTax.toLocaleString()}</span>
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
        <div className="tool-next-steps">
          <h5>📋 下一步行动</h5>
          <div className="tns-list">
            <div className="tns-item"><span className="tns-num">1</span>登录「个人所得税」APP确认各项扣除已填满</div>
            <div className="tns-item"><span className="tns-num">2</span>确认年终奖计税方式选择对你最有利的方案</div>
            <div className="tns-item"><span className="tns-num">3</span>如有疑问拨打12366税务服务热线</div>
          </div>
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
  const savedRef = useRef(false)

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

  // 自动保存
  useEffect(() => {
    if (!savedRef.current && meetsMinYears) {
      savedRef.current = true
      saveToolResult('养老金估算器',
        { gender, currentAge, monthlySalary, contribYears, localAvgSalary },
        { totalPension, basePension, accountPension, retireAge, replacementRate, meetsMinYears }
      )
    }
  }, [totalPension])

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
          <RangeField min={20} max={59} value={currentAge} onChange={setCurrentAge} suffix="岁" />
        </label>
        <label className="bc-label">
          <span>当前月工资（税前）</span>
          <RangeField min={3000} max={50000} step={1000} value={monthlySalary} onChange={setMonthlySalary} prefix="¥" />
        </label>
        <label className="bc-label">
          <span>累计缴费年限</span>
          <RangeField min={1} max={40} value={contribYears} onChange={setContribYears} suffix="年" />
          {contribYears < pc.minContributionYears && <span className="bc-warn">⚠️ 最低需缴满{pc.minContributionYears}年（未来可能提高到{pc.futureMinYears}年）</span>}
        </label>
        <label className="bc-label">
          <span>当地社会平均工资</span>
          <RangeField min={5000} max={30000} step={500} value={localAvgSalary} onChange={setLocalAvgSalary} prefix="¥" />
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
                <span className="bc-card-detail">当地工资¥{futureAvgSalary.toLocaleString()} × 缴费{contribYears}年 × 指数{cappedIndex.toFixed(2)} <span className="help-tip" data-tip="缴费指数=你的月工资/当地平均工资，范围0.6~3。指数越高，基础养老金越多">?</span></span>
              </div>
            </div>
            <div className="bc-card">
              <span className="bc-card-icon">💳</span>
              <div className="bc-card-body">
                <h5>个人账户养老金</h5>
                <span className="bc-card-amount">¥{accountPension.toLocaleString()}/月</span>
                <span className="bc-card-detail">账户累计¥{Math.round(accountTotal).toLocaleString()} ÷ {divisor}个月 <span className="help-tip" data-tip="计发月数根据退休年龄确定：60岁退休139个月，55岁170个月，50岁195个月。公式=个人账户总额÷计发月数">?</span></span>
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
        <div className="tool-next-steps">
          <h5>📋 下一步行动</h5>
          <div className="tns-list">
            <div className="tns-item"><span className="tns-num">1</span>开立个人养老金账户，每年可存12000元税前扣除</div>
            <div className="tns-item"><span className="tns-num">2</span>查询你的社保缴费记录，确保连续缴纳</div>
            <div className="tns-item"><span className="tns-num">3</span>考虑增加补充养老储蓄（商业养老保险/基金定投）</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════ 失业金计算器 ═══════ */
function UnemploymentCalc() {
  const [years, setYears] = useState(5)
  const [salary, setSalary] = useState(10000)
  const [city, setCity] = useState('shanghai')
  const cityData = {
    shanghai: { amount: 2175, label: '上海' },
    beijing: { amount: 2124, label: '北京' },
    guangzhou: { amount: 1890, label: '广州' },
    shenzhen: { amount: 1980, label: '深圳' },
    chengdu: { amount: 1680, label: '成都' },
    wuhan: { amount: 1580, label: '武汉' },
  }
  const months = Math.min(2 + (years - 1) * 2, 24)
  const total = cityData[city].amount * months
  const nPlus1 = Math.round(salary * (years + 1))
  return (
    <div className="calc-card">
      <h3>🆘 失业金 + 裁员赔偿计算器</h3>
      <p className="calc-note">被裁员不是你的错，这些是你应得的权益。</p>
      <div className="calc-row"><label>所在城市</label>
        <select value={city} onChange={e=>setCity(e.target.value)}>
          {Object.entries(cityData).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      <div className="calc-row"><label>累计缴费年限：{years}年</label>
        <input type="range" min="1" max="20" value={years} onChange={e=>setYears(+e.target.value)} />
      </div>
      <div className="calc-row"><label>离职前月工资：{salary.toLocaleString()}元</label>
        <input type="range" min="3000" max="50000" step="500" value={salary} onChange={e=>setSalary(+e.target.value)} />
      </div>
      <div className="calc-result">
        <div className="cr-item"><span>失业金标准（{cityData[city].label}）</span><b>{cityData[city].amount.toLocaleString()}元/月</b></div>
        <div className="cr-item"><span>可领取月数</span><b>{months}个月</b></div>
        <div className="cr-item highlight"><span>失业金总计</span><b>¥{total.toLocaleString()}</b></div>
        <div className="cr-item highlight"><span>N+1裁员赔偿（参考）</span><b>¥{nPlus1.toLocaleString()}</b></div>
      </div>
      <div className="calc-action">
        <h4>📋 下一步行动</h4>
        <ol>
          <li>保存劳动合同、工资条、裁员通知等证据</li>
          <li>离职60天内通过“随申办”APP申领失业金</li>
          <li>如公司拒绝支付N+1，拨打12348申请劳动仲裁</li>
          <li>离职当月办理灵活就业社保续缴</li>
        </ol>
      </div>
      <p className="calc-disclaimer">ℹ️ 失业金标准各城市每年调整，以当地人社局最新公告为准。N+1赔偿为参考值，具体以劳动合同和实际工资为准。</p>
    </div>
  )
}

/* ═══════ 公积金提取计算器 ═══════ */
function GjjWithdrawCalc() {
  const [balance, setBalance] = useState(80000)
  const [monthlyRent, setMonthlyRent] = useState(3000)
  const [mode, setMode] = useState('leave')
  const leaveAmount = balance
  const rentMonthly = Math.min(monthlyRent, 3000)
  const rentYearly = rentMonthly * 12
  return (
    <div className="calc-card">
      <h3>🏦 公积金提取计算器</h3>
      <p className="calc-note">离职后公积金可以提取，这是你的钱。</p>
      <div className="calc-row"><label>提取方式</label>
        <select value={mode} onChange={e=>setMode(e.target.value)}>
          <option value="leave">离职提取（封存满6个月）</option>
          <option value="rent">租房提取（每月可提）</option>
        </select>
      </div>
      <div className="calc-row"><label>公积金账户余额：{balance.toLocaleString()}元</label>
        <input type="range" min="5000" max="500000" step="1000" value={balance} onChange={e=>setBalance(+e.target.value)} />
      </div>
      {mode === 'rent' && (
        <div className="calc-row"><label>月租金：{monthlyRent.toLocaleString()}元</label>
          <input type="range" min="500" max="15000" step="100" value={monthlyRent} onChange={e=>setMonthlyRent(+e.target.value)} />
        </div>
      )}
      <div className="calc-result">
        {mode === 'leave' ? (
          <>
            <div className="cr-item highlight"><span>可一次性提取</span><b>¥{leaveAmount.toLocaleString()}</b></div>
            <div className="cr-item"><span>提取条件</span><b>账户封存满6个月</b></div>
            <div className="cr-item"><span>到账时间</span><b>3-5个工作日</b></div>
          </>
        ) : (
          <>
            <div className="cr-item"><span>每月可提取（上限3000元）</span><b>¥{rentMonthly.toLocaleString()}/月</b></div>
            <div className="cr-item highlight"><span>每年可提取</span><b>¥{rentYearly.toLocaleString()}/年</b></div>
            <div className="cr-item"><span>提取条件</span><b>无房+租房备案</b></div>
          </>
        )}
      </div>
      <div className="calc-action">
        <h4>📋 下一步行动</h4>
        <ol>
          <li>确认公积金账户已封存（离职后单位办理）</li>
          <li>封存满6个月后登录上海公积金网或随申办申请提取</li>
          <li>租房提取需提供租房合同+发票</li>
          <li>提取后资金转入本人银行卡，3-5工作日到账</li>
        </ol>
      </div>
      <p className="calc-disclaimer">ℹ️ 各城市提取政策不同，上海租房提取上限3000元/月。具体以当地公积金中心最新规定为准。咨询热线：12329。</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
 * 工具容器（带区域支持）
 * ═══════════════════════════════════════════════════════ */
export default function Tools({ regionKey = "national", toolParams, onNavigateDim, initialTool }) {
  const [active, setActive] = useState(initialTool || 0)
  const region = regions.find(r => r.key === regionKey)
  const tools = [
    { label: '🆘 失业金', comp: UnemploymentCalc },
    { label: '🏦 公积金提取', comp: GjjWithdrawCalc },
    { label: '👶 生育权益', comp: () => <BirthCalc regionKey={regionKey} /> },
    { label: '🏠 房贷对比', comp: () => <MortgageCalc params={toolParams} regionKey={regionKey} /> },
    { label: '🔄 换房退税', comp: TaxRefundCalc },
    { label: '📋 购房资格', comp: () => <QualifyCheck regionKey={regionKey} /> },
    { label: '💰 公积金省息', comp: () => <GjjSavingCalc params={toolParams} /> },
    { label: '🧾 个税优化', comp: TaxOptimizerCalc },
    { label: '👴 养老金', comp: PensionEstimator },
    { label: '🏡 安家计算', comp: () => <SettlementCalculator regionKey={regionKey} /> },
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
        {active === 7 && <button className="policy-link-btn" onClick={() => onNavigateDim?.('housing')}>🏠 了解城市安家政策详情 →</button>}
      </div>
      <div className="tool-disclaimer">
        {active === 0 && <p className="tool-source-note">📊 产假天数依据《女职工劳动保护特别规定》及各地计生条例 · 生育津贴公式来自国家医保局 · 利率数据更新至2026年7月</p>}
        {active === 1 && <p className="tool-source-note">📊 公积金利率2.85%来源：中国人民银行（2024年5月） · 商贷利率参考LPR-20BP · 公积金上限依据各地住建委最新政策</p>}
        {active === 2 && <p className="tool-source-note">📊 换房退税依据：财政部·税务总局公告（延续至2027年底） · 个税计算按差额20%或全额1%孰低原则</p>}
        {active === 3 && <p className="tool-source-note">📊 购房资格规则依据：各城市住建委最新限购政策 · 社保年限要求参考当地购房资格规定</p>}
        {active === 4 && <p className="tool-source-note">📊 公积金利率2.85%来源：中国人民银行 · 商贷利率参考LPR（3.10%） · 等额本息公式计算</p>}
        {active === 5 && <p className="tool-source-note">📊 个税起征点5000元/月依据《个人所得税法》 · 专项附加扣除标准依据国发〔2023〕X号 · 年终奖单独计税政策延续至2027年底</p>}
        {active === 6 && <p className="tool-source-note">📊 养老金计算公式依据《社会保险法》 · 延迟退休方案依据全国人大决定（2024年9月） · 个人账户计发月数参考人社部发布标准</p>}
        {active === 7 && <p className="tool-source-note">📊 落户评分规则依据各城市人才引进办法 · 购房资格参考当地住建委政策 · 公积金额度依据各地公积金管理中心规定</p>}
        ⚠️ 以上计算结果仅供参考，实际金额以银行审批和税务局核定为准。
        数据更新至2026年7月，如有变动请以最新政策为准。
      </div>
    </div>
  )
}

/* ═══════ 城市安家计算器 ═══════ */
const EDU_OPTIONS = [
  { key: 'junior', label: '初中及以下' },
  { key: 'high', label: '高中/中专' },
  { key: 'college', label: '大专' },
  { key: 'bachelor', label: '本科' },
  { key: 'master', label: '硕士' },
  { key: 'doctor', label: '博士' },
]

function SettlementCalculator({ regionKey }) {
  const [step, setStep] = useState(0)
  const [cityKey, setCityKey] = useState(null)
  const [user, setUser] = useState({ age: 28, edu: 'bachelor', socialMonths: 24, income: 20, married: false, hasChild: false, budget: 200 })
  const [report, setReport] = useState(null)

  // 从 localStorage 恢复上次评估
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('settlement_data'))
      if (saved) { setCityKey(saved.cityKey); setUser(saved.user); setReport(saved.report) }
    } catch {}
  }, [])

  const city = cityKey ? citySettlementData.cities.find(c => c.key === cityKey) : null
  const userCities = citySettlementData.cities.filter(c => regionKey === 'national' || c.region === regionKey)

  const handleCitySelect = (key) => {
    setCityKey(key)
    setTimeout(() => setStep(1), 300)
  }

  const runAnalysis = () => {
    if (!cityKey) return
    const score = calcSettlementScore(cityKey, user)
    const qualify = calcHouseQualify(cityKey, user)
    const gjj = calcGjjSavings(cityKey, user.budget || 200)
    const reportData = { score, qualify, gjj, city }
    setReport(reportData)
    setStep(2)
    // 保存工具结果
    saveToolResult('安家综合评估',
      { cityKey, age: user.age, edu: user.edu, socialMonths: user.socialMonths, income: user.income, married: user.married, hasChild: user.hasChild, budget: user.budget },
      { score: { pass: score.pass, score: score.score, gap: score.gap },
        qualify: { qualify: qualify.qualify, waitYears: qualify.waitYears },
        gjj: gjj ? { loanAmount: gjj.loanAmount, totalSaving: gjj.totalSaving } : null }
    )
    try { localStorage.setItem('settlement_data', JSON.stringify({ cityKey, user, report: reportData, timestamp: new Date().toISOString() })) } catch {}
    // 生成安家行动清单
    const actions = []
    // 落户行动
    if (!score.pass) {
      actions.push({ id: 'set_score', title: `提升学历或社保年限力争达到${score.passScore}分落户标准`, category: '落户', priority: 'high' })
    } else {
      actions.push({ id: 'set_start_settle', title: '启动落户申请流程，准备身份、学历、社保证明等材料', category: '落户', priority: 'high' })
    }
    // 购房行动
    if (!qualify.qualify) {
      actions.push({ id: 'set_house_wait', title: `保持社保连续缴纳，还需${qualify.waitYears}年满足购房社保要求`, category: '购房', priority: 'high' })
    } else {
      actions.push({ id: 'set_house_start', title: '查看房产市场，准备首付及贷款材料', category: '购房', priority: 'high' })
    }
    // 公积金行动
    if (gjj) {
      actions.push({ id: 'set_gjj', title: `确认公积金贷款资格，目前最高可贷${gjj.loanAmount}万`, category: '贷款', priority: 'medium' })
    }
    // 补贴行动
    try {
      const eligibleSubs = calcEligibleSubsidies(cityKey, user.edu).filter(c => c.eligible)
      const totalItems = eligibleSubs.reduce((a, c) => a + c.items.length, 0)
      if (totalItems > 0) {
        actions.push({ id: 'set_subsidy', title: `申请${totalItems}项人才补贴福利，查看各项目具体要求`, category: '补贴', priority: 'medium' })
      }
    } catch {}
    // 教育行动
    if (user.hasChild) {
      actions.push({ id: 'set_edu', title: '了解目标城市入学积分政策，提前规划子女教育路径', category: '教育', priority: 'medium' })
    }
    // 财务行动
    const taxSaving = Math.round((user.income || 0) * 0.005 * 10) / 10
    if (taxSaving > 0) {
      actions.push({ id: 'set_tax', title: `申请个税专项附加扣除，每年约省${taxSaving}万元`, category: '财务', priority: 'low' })
    }
    try { localStorage.setItem('settlement_actions', JSON.stringify({ cityKey, actions, timestamp: reportData.timestamp })) } catch {}
  }

  /* 步骤指示器 */
  const steps = ['选择城市', '填写信息', '评估报告']

  /* ===== Step 0: City Selection ===== */
  if (step === 0) {
    return (
      <div className="sc-container">
        {report && (
          <div className="sc-restore-bar" onClick={() => setStep(2)}>
            📋 上次评估：{report.city?.icon} {report.city?.name}
            · 落户{report.score?.pass ? '✅ 达标' : '还差' + report.score?.gap + '分'}
            · 购房{report.qualify?.qualify ? '✅ 已够格' : '还需' + report.qualify?.waitYears + '年'}
            <span className="sc-restore-link"> → 继续查看</span>
          </div>
        )}
        <h3 className="sc-subtitle">你想在哪个城市安家？</h3>
        <p className="sc-hint">选择一个目标城市，系统将分析落户难度、购房资格和教育政策</p>
        <div className="sc-city-grid">
          {(userCities.length > 0 ? userCities : citySettlementData.cities).map(c => (
            <button key={c.key} className={`sc-city-card ${cityKey === c.key ? 'selected' : ''}`} onClick={() => handleCitySelect(c.key)}>
              <span className="scc-icon">{c.icon}</span>
              <span className="scc-name">{c.name}</span>
              <span className={`scc-diff diff-${c.difficulty}`}>{'★'.repeat(c.difficulty)}{'☆'.repeat(5-c.difficulty)}</span>
              <span className="scc-summary">{c.summary}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  /* ===== Step 1: Personal Info ===== */
  if (step === 1) {
    return (
      <div className="sc-container">
        <div className="sc-step-indicator">{steps.map((s, i) => <span key={i} className={`sc-step ${i <= step ? 'active' : ''}`}>{i+1}. {s}</span>)}</div>
        <h3 className="sc-subtitle">{city?.icon} {city?.name} — 填写你的个人信息</h3>
        <div className="sc-form">
          <div className="sc-form-row">
            <div className="sc-field"><label>年龄</label><input type="range" min={18} max={60} value={user.age} onChange={e => setUser(u => ({...u, age: +e.target.value}))} /><span className="sc-val">{user.age}岁</span></div>
            <div className="sc-field"><label>学历</label>
              <select value={user.edu} onChange={e => setUser(u => ({...u, edu: e.target.value}))}>
                {EDU_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="sc-form-row">
            <div className="sc-field"><label>社保已缴</label><input type="range" min={0} max={240} step={6} value={user.socialMonths} onChange={e => setUser(u => ({...u, socialMonths: +e.target.value}))} /><span className="sc-val">{Math.floor(user.socialMonths/12)}年{user.socialMonths%12}个月</span></div>
            <div className="sc-field"><label>年收入</label><input type="range" min={0} max={200} step={5} value={user.income} onChange={e => setUser(u => ({...u, income: +e.target.value}))} /><span className="sc-val">{user.income}万</span></div>
          </div>
          <div className="sc-form-row">
            <div className="sc-field"><label>婚姻状况</label>
              <select value={user.married ? 'married' : 'single'} onChange={e => setUser(u => ({...u, married: e.target.value === 'married'}))}>
                <option value='single'>未婚</option>
                <option value='married'>已婚</option>
              </select>
            </div>
            <div className="sc-field"><label>子女情况</label>
              <select value={user.hasChild ? 'yes' : 'no'} onChange={e => setUser(u => ({...u, hasChild: e.target.value === 'yes'}))}>
                <option value='no'>无子女</option>
                <option value='yes'>有子女</option>
              </select>
            </div>
          </div>
          <div className="sc-form-row">
            <div className="sc-field"><label>购房预算</label><input type="range" min={50} max={2000} step={50} value={user.budget} onChange={e => setUser(u => ({...u, budget: +e.target.value}))} /><span className="sc-val">{user.budget}万</span></div>
          </div>
          <div className="sc-form-actions">
            <button className="sc-btn-back" onClick={() => setStep(0)}>← 重新选择城市</button>
            <button className="sc-btn-next" onClick={runAnalysis}>开始评估 →</button>
          </div>
        </div>
      </div>
    )
  }

  /* ===== Step 2: Report ===== */
  const diffLabel = ['', '极低', '低', '中等', '高', '极高']
  return (
    <div className="sc-container">
      <div className="sc-step-indicator">{steps.map((s, i) => <span key={i} className={`sc-step ${i <= step ? 'active' : ''}`}>{i+1}. {s}</span>)}</div>
      <h3 className="sc-subtitle">{report?.city?.icon} {report?.city?.name} — 安家综合评估报告</h3>

      {/* 落户评分 */}
      <div className="sc-report-card">
        <h4 className="sc-rc-title">📋 落户可行性评分</h4>
        <div className="sc-score-area">
          <div className="sc-score-ring">
            <span className={`sc-score-num ${report?.score.pass ? 'pass' : 'fail'}`}>{report?.score.score}</span>
            <span className="sc-score-target">/ {report?.score.passScore}</span>
          </div>
          <div className="sc-score-info">
            <span className={`sc-score-badge ${report?.score.pass ? 'badge-ok' : 'badge-warn'}`}>
              {report?.score.pass ? '✅ 达到落户标准' : '❌ 距离达标还差' + report?.score.gap + '分'}
            </span>
            <span className="sc-diff-label">落户难度：{diffLabel[report?.city?.difficulty] || '中等'}</span>
          </div>
        </div>
        <div className="sc-detail-list">
          {report?.score.details.map((d, i) => (
            <div key={i} className="sc-detail-item"><span>{d.label}</span><span className="sc-detail-val">{d.value}</span></div>
          ))}
        </div>
        <p className="sc-rc-note">{report?.city?.summary}</p>
      </div>

      {/* 购房资格 */}
      <div className="sc-report-card">
        <h4 className="sc-rc-title">🏠 购房资格评估</h4>
        {report?.qualify.qualify ? (
          <div className="sc-qualify-ok">✅ 你已满足购房社保要求（{report?.qualify.haveYears}年）</div>
        ) : (
          <div className="sc-qualify-wait">
            <p>⚠️ 还需连续缴纳 <strong>{report?.qualify.waitYears}年</strong>（{report?.qualify.waitMonths}个月）社保</p>
            <div className="sc-wait-bar"><div className="sc-wait-fill" style={{ width: `${Math.min(100, (report?.qualify.haveYears/report?.qualify.needYears)*100)}%` }} /></div>
            <span className="sc-wait-label">已缴{report?.qualify.haveYears}年 / 需{report?.qualify.needYears}年</span>
          </div>
        )}
        {report?.qualify.needMarriage && !report?.qualify.isMarried && (
          <p className="sc-rc-warn">⚠️ 该城市要求已婚方可购房（以上评估仅考虑社保条件）</p>
        )}
        <p className="sc-rc-note">公积金最高可贷 {report?.city?.gjjMaxLoan} 万（首套），二套 {report?.city?.secondGjjMaxLoan} 万</p>
      </div>

      {/* 子女教育路径 */}
      {user.hasChild && (
        <div className="sc-report-card">
          <h4 className="sc-rc-title">🎓 子女入学路径</h4>
          <p className="sc-rc-path"><strong>路径：</strong>{report?.city?.edu.path}</p>
          <p className="sc-rc-note">{report?.city?.edu.note}</p>
          {!report?.score.pass && <p className="sc-rc-warn">⚠️ 未落户情况下子女入学可能面临更多限制，建议优先解决落户问题</p>}
        </div>
      )}

      {/* 人才补贴 */}
      <div className="sc-report-card">
        <h4 className="sc-rc-title">🎁 人才补贴与福利</h4>
        <div className="sc-subsidy-grid">
          {report && calcEligibleSubsidies(cityKey, user.edu).map((cat, i) => (
            <div key={i} className={`sc-subsidy-cat ${cat.eligible ? '' : 'sc-subsidy-disabled'}`}>
              <div className="sc-subsidy-hd">
                <span className="sc-subsidy-label">{cat.label}</span>
                {cat.eligible
                  ? <span className="sc-subsidy-badge sc-subsidy-badge-ok">✓ 你可申请</span>
                  : <span className="sc-subsidy-badge sc-subsidy-badge-no">学历不符</span>}
              </div>
              <p className="sc-subsidy-target">面向目标：{cat.target}</p>
              <ul className="sc-subsidy-items">
                {cat.items.map((item, j) => (
                  <li key={j} className={`sc-subsidy-item ${!cat.eligible ? 'sc-subsidy-item-dim' : ''}`}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="sc-rc-note">不同城市和区域的具体政策细节可能有所差异，请以当地政府最新文件为准</p>
      </div>

      {/* 综合财务影响 */}
      {report && (() => {
        const eligibleSubs = calcEligibleSubsidies(cityKey, user.edu).filter(c => c.eligible)
        const subsidyCount = eligibleSubs.reduce((a, c) => a + c.items.length, 0)
        const income = user.income || 0
        const taxSaving = Math.round(income * 0.005 * 10) / 10
        const gjjAnnual = report.gjj ? Math.round(report.gjj.totalSaving / 30 * 10) / 10 : 0
        const totalAnnual = Math.round((gjjAnnual + taxSaving) * 10) / 10
        return (
          <div className="sc-report-card sc-financial-card">
            <h4 className="sc-rc-title">📊 安家综合财务影响</h4>
            <div className="sc-fin-grid">
              <div className="sc-fin-row">
                <span className="sc-fin-icon">💰</span>
                <span className="sc-fin-label">人才补贴</span>
                <span className="sc-fin-value">{subsidyCount}项可申领</span>
              </div>
              {report.gjj && (
                <>
                  <div className="sc-fin-row">
                    <span className="sc-fin-icon">🏦</span>
                    <span className="sc-fin-label">公积金省息</span>
                    <span className="sc-fin-value">{report.gjj.gjjRate} vs 商贷{report.gjj.comRate}</span>
                  </div>
                  <div className="sc-fin-detail">
                    贷款{report.gjj.loanAmount}万 · 月供{report.gjj.gjjMonthly}元
                    比商贷省{report.gjj.monthlySaving}元/月
                  </div>
                  <div className="sc-fin-row sc-fin-highlight">
                    <span className="sc-fin-icon">💎</span>
                    <span className="sc-fin-label">30年省息</span>
                    <span className="sc-fin-value sc-fin-value-big">{report.gjj.totalSaving}万</span>
                  </div>
                </>
              )}
              <div className="sc-fin-row">
                <span className="sc-fin-icon">💳</span>
                <span className="sc-fin-label">个税专项附加扣除</span>
                <span className="sc-fin-value">约省{taxSaving}万/年</span>
              </div>
            </div>
            <div className="sc-fin-total">
              <span className="sc-fin-total-label">📈 综合年化收益潜力 <span className="help-tip" data-tip="= 公积金年省息(30年总省息÷30) + 个税年节省">?</span></span>
              <span className="sc-fin-total-value">约 {totalAnnual} 万/年</span>
            </div>
            <p className="sc-rc-note">以上为估算值（公积金年省息+个税年节省），实际金额以当地政策和银行审批为准</p>
          </div>
        )
      })()}

      {/* 综合建议 */}
      <div className="sc-report-card sc-insight">
        <h4 className="sc-rc-title">💡 综合建议</h4>
        <ul className="sc-insight-list">
          {!report?.score.pass && <li>提升学历或增加社保缴纳年限可提高积分</li>}
          {report?.score.pass && <li>建议尽快启动落户申请，政策窗口期可能变化</li>}
          {!report?.qualify.qualify && <li>购房前确保社保连续缴纳，跳槽需注意社保衔接</li>}
          {report?.city?.difficulty >= 4 && <li>可关注人才引进渠道，部分企业有落户名额</li>}
          {user.hasChild && !report?.score.pass && <li>提前了解目标城市的入学积分政策，做好规划</li>}
          <li>公积金贷款额度与缴存基数和余额挂钩，可适当提高缴存比例</li>
          <li>以上分析仅供参考，具体政策以当地政府最新文件为准</li>
        </ul>
      </div>

      <div className="sc-form-actions">
        <button className="sc-btn-back" onClick={() => setStep(1)}>← 修改信息</button>
        <button className="sc-btn-next" onClick={() => { setStep(0); setCityKey(null); setReport(null) }}>重新评估其他城市 →</button>
      </div>
    </div>
  )
}


function pmt(rate, nper, pv) {
  if (rate === 0) return pv / nper
  return pv * rate * Math.pow(1 + rate, nper) / (Math.pow(1 + rate, nper) - 1)
}
function format(n) { return Math.round(n).toLocaleString('zh-CN') }
