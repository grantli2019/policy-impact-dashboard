import { useState } from 'react'
import { regions } from './data/impactData'
import './App.css'

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
 * 工具容器（带区域支持）
 * ═══════════════════════════════════════════════════════ */
export default function Tools({ regionKey = "national", toolParams, onNavigateDim }) {
  const [active, setActive] = useState(0)
  const region = regions.find(r => r.key === regionKey)
  const tools = [
    { label: '🏠 房贷对比', comp: () => <MortgageCalc params={toolParams} regionKey={regionKey} /> },
    { label: '🔄 换房退税', comp: TaxRefundCalc },
    { label: '📋 购房资格', comp: () => <QualifyCheck regionKey={regionKey} /> },
    { label: '💰 公积金省息', comp: () => <GjjSavingCalc params={toolParams} /> },
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
        {active === 0 && <button className="policy-link-btn" onClick={() => onNavigateDim?.('housing')}>🏠 了解房贷政策详情 →</button>}
        {active === 1 && <button className="policy-link-btn" onClick={() => onNavigateDim?.('housing')}>🏠 了解换房退税政策详情 →</button>}
        {active === 2 && <button className="policy-link-btn" onClick={() => onNavigateDim?.('housing')}>🏠 了解购房限购政策详情 →</button>}
        {active === 3 && <button className="policy-link-btn" onClick={() => onNavigateDim?.('housing')}>🏠 了解公积金条例详情 →</button>}
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
