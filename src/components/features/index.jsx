import { useState } from 'react'
import {
  personas, regions, crossLinks, decisionScenarios,
  getDimensionsForRegion, getTimelineForDimension, legislativeOutlook,
  calcDimensionScore, calcOverallIndex, getIndexLevel,
} from '../../data/impactData'

/* ═══════ 历史时间线 ═══════ */
export function Timeline({ dimKey }) {
  const [expanded, setExpanded] = useState(false)
  const events = getTimelineForDimension(dimKey)
  if (!events.length) return null
  const shown = expanded ? events : events.slice(-5)
  return (
    <div className="timeline-section">
      <h3 className="timeline-title" onClick={() => setExpanded(!expanded)}>
        📅 政策演变时间线（{events[0].year}–{events[events.length-1].year}）
        <span className="timeline-toggle">{expanded ? '▲ 收起' : '▼ 展开'}</span>
      </h3>
      <div className="timeline-track">
        <div className="timeline-line" />
        {shown.map((e, i) => (
          <div key={i} className={`timeline-node ${e.dir > 0 ? 'good' : e.dir < 0 ? 'bad' : 'neutral'}`}>
            <div className="tl-dot" />
            <div className="tl-content">
              <div className="tl-year">{e.year}</div>
              <div className="tl-event">{e.event}</div>
              <div className="tl-note">{e.note}</div>
            </div>
          </div>
        ))}
      </div>
      {!expanded && events.length > 5 && (
        <button className="timeline-expand" onClick={() => setExpanded(true)}>
          查看完整时间线（{events.length}个关键节点）▼
        </button>
      )}
    </div>
  )
}

/* ═══════ 立法前瞻组件 ═══════ */
export function LegislativeOutlook({ regionKey, personaKey }) {
  const [activeSection, setActiveSection] = useState('plans')
  const [selectedOutlookDim, setSelectedOutlookDim] = useState(null)
  const { fiveYearPlans, legislativePlans, outlookByDim } = legislativeOutlook

  const dimIcons = { housing: '🏠', employment: '💼', education: '🎓', elderly: '👴', finance: '💰', industry: '🏭' }
  const dimNames = { housing: '房产/资产', employment: '就业/收入', education: '教育/子女', elderly: '养老/医疗', finance: '消费/理财', industry: '行业/创业' }

  const statusColor = (s) => {
    if (s.includes('进行中') || s.includes('征求意见')) return '#1a237e'
    if (s.includes('提请') || s.includes('审议') || s.includes('拟')) return '#e67e22'
    if (s.includes('预备') || s.includes('预备制定') || s.includes('预备修订')) return '#9b59b6'
    if (s.includes('已实施')) return '#27ae60'
    return '#95a5a6'
  }
  const impactColor = (v) => v === '利好' ? '#27ae60' : v === '利空' ? '#e74c3c' : '#95a5a6'

  const outlookCounts = Object.fromEntries(
    Object.entries(outlookByDim).map(([k, v]) => [k, v.length])
  )

  return (
    <section className="legislative-outlook">
      <h2 className="section-title">📡 立法前瞻 · 未来政策风向标</h2>
      <p className="outlook-intro">
        五年规划是所有政策的"总纲"，年度立法计划则标明了具体的实施节奏。
        我们将其映射到六大生活维度，帮你提前预判政策走向。
      </p>

      <div className="outlook-tabs">
        <button className={`tab-btn outlook-tab ${activeSection==='plans'?'active':''}`}
          onClick={() => setActiveSection('plans')}>📖 五年规划 & 立法计划</button>
        <button className={`tab-btn outlook-tab ${activeSection==='outlook'?'active':''}`}
          onClick={() => setActiveSection('outlook')}>🔭 按维度立法前瞻</button>
        <button className={`tab-btn outlook-tab ${activeSection==='timeline'?'active':''}`}
          onClick={() => setActiveSection('timeline')}>⏳ 立法时间线</button>
      </div>

      {activeSection === 'plans' && (
        <div className="outlook-content">
          <h3 className="outlook-sub-title">📊 五年规划纲要</h3>
          <div className="plan-cards">
            {fiveYearPlans.map((p, i) => (
              <div key={i} className={`plan-card ${p.level==='national'?'plan-national':'plan-local'}`}>
                <div className="plan-card-header">
                  <span className="plan-badge">{p.level==='national'?'🇨🇳 国家':'🏙 上海'}</span>
                  <span className="plan-date">{p.date}</span>
                </div>
                <h4 className="plan-name">{p.name}</h4>
                <ul className="plan-highlights">
                  {p.highlights.map((h, j) => <li key={j}>{h}</li>)}
                </ul>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="plan-link">📄 查看原文 ↗</a>
              </div>
            ))}
          </div>

          <h3 className="outlook-sub-title" style={{ marginTop: 24 }}>📋 2026年度立法计划</h3>
          <div className="legis-plan-cards">
            {legislativePlans.map((p, i) => (
              <div key={i} className="legis-plan-card">
                <h4 className="legis-plan-name">{p.name}</h4>
                <div className="legis-plan-meta">
                  <span>{p.source}</span>
                  <span className="legis-plan-date">{p.date}</span>
                </div>
                <div className="legis-plan-stats">
                  {p.stats.laws != null && <div className="stat-chip stat-laws"><b>{p.stats.laws}</b>件法律案</div>}
                  {p.stats.regulations != null && <div className="stat-chip stat-regs"><b>{p.stats.regulations}</b>件行政法规</div>}
                  {p.stats.preparatory != null && <div className="stat-chip stat-prep"><b>{p.stats.preparatory}</b>件预备项目</div>}
                  {p.stats.continuing != null && <div className="stat-chip stat-cont"><b>{p.stats.continuing}</b>件继续审议</div>}
                  {p.stats.firstReview != null && <div className="stat-chip stat-first"><b>{p.stats.firstReview}</b>件初次审议</div>}
                </div>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="plan-link">📄 查看原文 ↗</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'outlook' && (
        <div className="outlook-content">
          <div className="outlook-dim-pills">
            <button className={`pill-btn outlook-dim-pill ${!selectedOutlookDim?'active':''}`}
              onClick={() => setSelectedOutlookDim(null)}>全部维度</button>
            {Object.keys(outlookByDim).map(k => (
              <button key={k} className={`pill-btn outlook-dim-pill ${selectedOutlookDim===k?'active':''}`}
                onClick={() => setSelectedOutlookDim(k)}>
                {dimIcons[k]} {dimNames[k]}
                <span className="outlook-count">{outlookCounts[k]}</span>
              </button>
            ))}
          </div>
          <div className="outlook-list">
            {(selectedOutlookDim
              ? Object.entries(outlookByDim).filter(([k]) => k === selectedOutlookDim)
              : Object.entries(outlookByDim)
            ).map(([dimKey, items]) => (
              <div key={dimKey} className="outlook-dim-section">
                <h4 className="outlook-dim-header">
                  {dimIcons[dimKey]} {dimNames[dimKey]}
                  <span className="outlook-dim-count">{items.length} 项前瞻立法</span>
                </h4>
                <div className="outlook-items">
                  {items.map((item, i) => (
                    <div key={i} className="outlook-item">
                      <div className="outlook-item-header">
                        <span className="outlook-item-name">{item.name}</span>
                        <span className="outlook-status" style={{ color: statusColor(item.status), borderColor: statusColor(item.status) }}>
                          {item.status}
                        </span>
                      </div>
                      <div className="outlook-item-meta">
                        <span className="outlook-source">{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="policy-source-link">{item.source}</a> : item.source}</span>
                        <span className="outlook-impact" style={{ color: impactColor(item.impact) }}>● {item.impact}</span>
                      </div>
                      <div className="outlook-item-note">💡 {item.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'timeline' && (
        <div className="outlook-content outlook-timeline">
          <h3 className="outlook-sub-title">⏳ 2026-2027 重点立法进程时间线</h3>
          <div className="tl-track">
            {Object.entries(outlookByDim).flatMap(([dimKey, items]) =>
              items.map((item, i) => ({
                ...item, dimKey, dimIcon: dimIcons[dimKey], dimName: dimNames[dimKey]
              }))
            ).sort((a, b) => {
              const statusOrder = s => s.includes('征求意见') ? 0 : s.includes('进行中') || s.includes('提请') || s.includes('审议') || s.includes('二次') ? 1 : s.includes('拟') || s.includes('预备') ? 2 : 3
              return statusOrder(a.status) - statusOrder(b.status)
            }).map((item, i) => (
              <div key={i} className="tl-item">
                <div className="tl-dot" style={{ background: statusColor(item.status) }} />
                <div className="tl-content">
                  <div className="tl-header">
                    <span className="tl-dim">{item.dimIcon} {item.dimName}</span>
                    <span className="outlook-status" style={{ color: statusColor(item.status), borderColor: statusColor(item.status) }}>{item.status}</span>
                  </div>
                  <div className="tl-name">
                    {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="policy-source-link">{item.name}</a> : item.name}
                  </div>
                  <div className="tl-note">{item.note}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="tl-legend">
            <span className="tl-legend-item"><span className="tl-dot-sm" style={{ background: 'var(--p-600)' }} />进行中/征求意见</span>
            <span className="tl-legend-item"><span className="tl-dot-sm" style={{ background: 'var(--orange)' }} />提请审议/拟制定</span>
            <span className="tl-legend-item"><span className="tl-dot-sm" style={{ background: 'var(--purple)' }} />预备项目</span>
            <span className="tl-legend-item"><span className="tl-dot-sm" style={{ background: 'var(--success)' }} />已实施</span>
          </div>
        </div>
      )}
    </section>
  )
}

/* ═══════ TOP5政策雷达 ═══════ */
export function PolicyRadar({ personaKey, regionKey, DIM_TO_TOOL, setTargetTool, setActiveTab, setTabKey }) {
  if (!personaKey) return null
  const persona = personas.find(p => p.key === personaKey)
  if (!persona) return null

  const currentDims = getDimensionsForRegion(regionKey)
  const allPolicies = []
  currentDims.forEach(dim => {
    const weight = persona.weights[dim.key] ?? 1/6
    dim.scores.forEach(s => {
      allPolicies.push({ ...s, dimKey: dim.key, dimName: dim.name, dimIcon: dim.icon, dimColor: dim.color, weight })
    })
  })

  const now = new Date()
  allPolicies.forEach(p => {
    const d = new Date(p.date)
    const months = Math.max(0, (now - d) / (1000*60*60*24*30))
    const recency = months <= 3 ? 1.0 : months <= 6 ? 0.8 : months <= 12 ? 0.6 : 0.4
    p.radarScore = p.weight * p.breadth * p.depth * recency * (Math.abs(p.direction) || 0.5)
  })

  const top5 = allPolicies.sort((a, b) => b.radarScore - a.radarScore).slice(0, 5)
  const dirLabel = d => d > 0 ? '利好' : d < 0 ? '利空' : '中性'
  const dirColor = d => d > 0 ? '#27ae60' : d < 0 ? '#e74c3c' : '#95a5a6'

  return (
    <section className="policy-radar">
      <h2 className="section-title">🎯 我的TOP5政策雷达 <span className="section-sub">· {persona.icon} {persona.label}视角</span></h2>
      <p className="radar-desc">根据你的身份，从{allPolicies.length}条政策中筛选出与你最相关的5条近期政策</p>
      <div className="radar-list">
        {top5.map((p, i) => (
          <div key={i} className="radar-item" style={{ borderLeftColor: p.dimColor }}>
            <div className="radar-rank">#{i+1}</div>
            <div className="radar-content">
              <div className="radar-header">
                <span className="radar-dim">{p.dimIcon} {p.dimName}</span>
                <span className="radar-badges">
                  {p.source && <span className="source-tag">{p.issuingBody || p.source}</span>}
                  <span className="radar-conf">{p.confidence}</span>
                </span>
                <span className="radar-dir" style={{ color: dirColor(p.direction) }}>{dirLabel(p.direction)}</span>
                {DIM_TO_TOOL && DIM_TO_TOOL[p.dimKey] !== undefined && DIM_TO_TOOL[p.dimKey] >= 0 && (
                  <button className="radar-calc-btn" onClick={(e) => { e.stopPropagation(); setTargetTool(DIM_TO_TOOL[p.dimKey]); setActiveTab('tools'); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:'smooth'}) }} title="算算对你的影响">
                    ⚡
                  </button>
                )}
              </div>
              <div className="radar-name">
                {p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="policy-source-link">{p.policyName}</a> : p.policyName}
              </div>
              <div className="radar-note">{p.note}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ═══════ 政策联动效应 ═══════ */
export function PolicyCrossLinks() {
  return (
    <section className="cross-links">
      <h2 className="section-title">🔗 政策联动效应</h2>
      <p className="cross-desc">政策之间不是孤立的，以下是重要的传导链条</p>
      <div className="cross-list">
        {crossLinks.map((c, i) => (
          <div key={i} className="cross-item">
            <div className="cross-flow">
              <span className="cross-from">{c.from}</span>
              <span className="cross-arrow">→</span>
              <span className="cross-to">{c.to}</span>
            </div>
            <div className="cross-note">💡 {c.note}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ═══════ 决策模拟器 ═══════ */
export function DecisionSimulator() {
  const [activeScenario, setActiveScenario] = useState(0)
  const [inputs, setInputs] = useState({})
  const [results, setResults] = useState(null)

  const scenario = decisionScenarios[activeScenario]

  const runScenario = () => {
    const values = {}
    scenario.inputs.forEach(inp => {
      values[inp.key] = inputs[inp.key] !== undefined ? inputs[inp.key] : inp.default
    })
    setResults(scenario.results(values))
  }

  const URGENCY_DATA = [
    { icon: '⏰', label: '窗口期有限', desc: '政策红利有明确截止时间，错过不再来' },
    { icon: '💸', label: '机会成本', desc: '每晚决策1个月，可能损失数千元补贴' },
    { icon: '🔒', label: '不可逆转', desc: '购房/生育/退休等决策一旦执行无法回退' },
  ]

  return (
    <div className="decision-sim">
      <h2 className="section-title">🎮 决策模拟器</h2>
      <p className="ds-intro">人生重大决策不可逆，让政策数据帮你降低试错成本</p>
      <div className="ds-urgency-strip">
        {URGENCY_DATA.map((u, i) => (
          <div key={i} className="ds-urgency-item">
            <span className="ds-urgency-icon">{u.icon}</span>
            <div className="ds-urgency-text">
              <span className="ds-urgency-label">{u.label}</span>
              <span className="ds-urgency-desc">{u.desc}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="ds-scenario-tabs" role="tablist" aria-label="决策场景">
        {decisionScenarios.map((s, i) => (
          <button key={s.id} className={`tab-btn ds-scenario-tab ${activeScenario === i ? 'active' : ''}`}
            onClick={() => { setActiveScenario(i); setResults(null); setInputs({}) }}>
            {s.icon} {s.title}
          </button>
        ))}
      </div>
      <div className="ds-form">
        {scenario.inputs.map(inp => (
          <div key={inp.key} className="ds-field">
            <label>{inp.label}</label>
            {inp.type === 'boolean' ? (
              <label className="gt-toggle">
                <input type="checkbox" checked={inputs[inp.key] ?? inp.default}
                  onChange={e => setInputs(prev => ({ ...prev, [inp.key]: e.target.checked }))} />
                <span>{(inputs[inp.key] ?? inp.default) ? '是' : '否'}</span>
              </label>
            ) : inp.type === 'select' ? (
              <select value={inputs[inp.key] ?? inp.default}
                onChange={e => setInputs(prev => ({ ...prev, [inp.key]: e.target.value }))}>
                {inp.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <div className="gt-input-group">
                <input type="number" value={inputs[inp.key] ?? inp.default}
                  onChange={e => setInputs(prev => ({ ...prev, [inp.key]: Number(e.target.value) }))} />
                <span className="gt-unit">{inp.unit}</span>
              </div>
            )}
          </div>
        ))}
        <button className="ds-run-btn" onClick={runScenario}>🔍 分析我的情况</button>
      </div>
      {results && (
        <div className="ds-results" aria-live="polite">
          <h3 className="ds-results-title">📊 分析结果</h3>
          {results.map((r, i) => (
            <div key={i} className={`ds-result-card ${r.positive ? 'ds-positive' : ''}`}>
              <div className="ds-result-label">{r.label}</div>
              <div className="ds-result-value">{r.value}</div>
              <div className="ds-result-detail">{r.detail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
