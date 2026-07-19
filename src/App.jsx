import React, { Suspense, lazy } from 'react'
import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react'
import {
  dimensions, methodology, rubric, personas, weeklyUpdates, regions,
  calcDimensionScore, calcOverallIndex, getIndexLevel, keyFindings,
  getDimensionsForRegion, getTimelineForDimension, regionToolParams,
  legislativeOutlook, crossLinks, actionPlans, policyDividends, deadlines, specialTopics, decisionScenarios, policyMilestones, policyGlossary, rentalQuiz, premiumFeatures, recommendations, newsLianboUpdates, lifeRadar, searchScenes,
  detectUserCity, getSmartRecommendations, getRecommendReason, cityToRegion, inferLifeStage, lifeStages,
} from './data/impactData'
import './App.css'

// Trust & transparency constants
const DATA_LAST_UPDATED = '2026-07-17'
const DATA_LAST_UPDATED_CN = '2026年7月17日'
const CONTACT_EMAIL = 'contact@cechacha.com'

// Lazy-loaded components
const Tools = lazy(() => import('./Tools'));
const ShareCard = lazy(() => import('./components/ShareCard'));

/* ═══════ 工具函数 ═══════ */
function timeAgo(dateStr) {
  const now = new Date(), d = new Date(dateStr)
  const days = Math.floor((now - d) / 86400000)
  if (days === 0) return '今天'; if (days === 1) return '昨天'
  if (days <= 7) return `${days}天前`; if (days <= 30) return `${Math.floor(days/7)}周前`
  return `${Math.floor(days/30)}个月前`
}

/* ═══════ 画像选择器 ═══════ */
function PersonaModal({ onSelect, onSkip }) {
  const [first, setFirst] = useState(null)
  if (first) {
    return (
      <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="添加第二身份" onClick={() => onSelect(first)}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <h2 className="modal-title">🧭 选择第二身份（可选）</h2>
          <p className="modal-sub">你已选择「{personas.find(p=>p.key===first)?.icon} {personas.find(p=>p.key===first)?.label}」，可以再选一个身份组合分析</p>
          <div className="persona-grid">
            {personas.filter(p => p.key !== first).map(p => (
              <button key={p.key} className="persona-btn" onClick={() => {
                const composite = first + '+' + p.key
                localStorage.setItem('composite_persona', composite)
                onSelect(first)
              }}>
                <span className="persona-icon">{p.icon}</span>
                <span className="persona-label">{p.label}</span>
                <span className="persona-desc">{p.desc}</span>
              </button>
            ))}
          </div>
          <button className="skip-btn" onClick={() => { localStorage.removeItem('composite_persona'); onSelect(first) }}>不需要，就用单一身份</button>
        </div>
      </div>
    )
  }
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="选择用户画像" onClick={onSkip}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">🧭 欢迎来到策查查</h2>
        <p className="modal-sub">选一个最符合你的身份，我们会根据你的身份调整各维度权重，让分析更贴合你的实际情况</p>
        <div className="persona-grid">
          {personas.map(p => (
            <button key={p.key} className="persona-btn" onClick={() => setFirst(p.key)}>
              <span className="persona-icon">{p.icon}</span>
              <span className="persona-label">{p.label}</span>
              <span className="persona-desc">{p.desc}</span>
            </button>
          ))}
        </div>
        <button className="skip-btn" onClick={onSkip}>跳过，看默认结果</button>
      </div>
    </div>
  )
}

/* ═══════ 本周更新条 ═══════ */
function WeeklyUpdateBar() {
  const [expanded, setExpanded] = useState(false)
  const items = expanded ? weeklyUpdates : weeklyUpdates.slice(0, 3)
  return (
    <section className="weekly-bar">
      <div className="weekly-header" onClick={() => setExpanded(!expanded)}>
        <span className="weekly-dot" />
        <span className="weekly-title">📡 本周更新 · {weeklyUpdates.length}条新动态</span>
        <button className="weekly-toggle" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
          {expanded ? '收起 ▲' : '展开全部 ▼'}
        </button>
      </div>
      <div className={`weekly-list ${expanded ? 'expanded' : ''}`}>
        {items.map((u, i) => (
          <div key={i} className="weekly-item">
            <span className="weekly-date">{u.date.slice(5)}</span>
            <span className={`weekly-tag tag-${u.impact === '偏利好' ? 'good' : u.impact === '中性' ? 'neutral' : 'bad'}`}>{u.impact}</span>
            <span className="weekly-text">{u.text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ═══════ 回到顶部 ═══════ */
const BackToTop = memo(function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (!visible) return null
  return <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="回到顶部">↑</button>
});

/* ═══════ 可折叠区块 ═══════ */
const Collapsible = memo(function Collapsible({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`collapsible ${open ? 'open' : ''}`}>
      <button className="collapsible-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className="collapsible-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  )
});

/* ═══════ 区域选择器 ═══════ */
function RegionSelector({ value, onChange }) {
  return (
    <div className="region-selector">
      <div className="region-label">🗺️ 选择区域</div>
      <div className="region-pills">
        {regions.map(r => {
          const active = value === r.key
          const disabled = r.comingSoon
          return (
            <button key={r.key}
              className={`pill-btn region-pill ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => !disabled && onChange(r.key)}
              disabled={disabled}>
              <span className="rp-icon">{r.icon}</span>
              <span className="rp-name">{r.name}</span>
              {disabled && <span className="rp-soon">{r.eta || '即将上线'}</span>}
            </button>
          )
        })}
      </div>
      {value !== 'national' && !regions.find(r => r.key === value)?.comingSoon && (
        <div className="region-info">
          {regions.find(r => r.key === value)?.subtitle}
        </div>
      )}
    </div>
  )
}

/* ═══════ 历史时间线 ═══════ */
function Timeline({ dimKey }) {
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
function LegislativeOutlook({ regionKey, personaKey }) {
  const [activeSection, setActiveSection] = useState('plans') // 'plans' | 'outlook'
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

  // 按维度统计前瞻项目数量
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

      {/* 切换按钮 */}
      <div className="outlook-tabs">
        <button className={`tab-btn outlook-tab ${activeSection==='plans'?'active':''}`}
          onClick={() => setActiveSection('plans')}>📖 五年规划 & 立法计划</button>
        <button className={`tab-btn outlook-tab ${activeSection==='outlook'?'active':''}`}
          onClick={() => setActiveSection('outlook')}>🔭 按维度立法前瞻</button>
        <button className={`tab-btn outlook-tab ${activeSection==='timeline'?'active':''}`}
          onClick={() => setActiveSection('timeline')}>⏳ 立法时间线</button>
      </div>

      {/* 五年规划 + 立法计划 */}
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

      {/* 按维度立法前瞻 */}
      {activeSection === 'outlook' && (
        <div className="outlook-content">
          {/* 维度筛选 */}
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

          {/* 前瞻列表 */}
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

      {/* 立法前瞻时间线 */}
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

/* ═══════ P2: TOP5政策雷达（按身份筛选最相关近期政策） ═══════ */
function PolicyRadar({ personaKey, regionKey }) {
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

  // Score = weight * breadth * depth * direction_abs * recency
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
                <span className="radar-conf">{p.confidence}</span>
                <span className="radar-dir" style={{ color: dirColor(p.direction) }}>{dirLabel(p.direction)}</span>
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

/* ═══════ P2: 政策联动效应 ═══════ */
function PolicyCrossLinks() {
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

/* ═══════ 移动端政策卡片 ═══════ */
function PolicyCards({ scores, dimKey, expandedRationale, setExpandedRationale }) {
  return (
    <div className="policy-cards-mobile">
      {scores.map((s, i) => {
        const dirLabel = s.direction > 0 ? '利好' : s.direction < 0 ? '利空' : '中性'
        const dirColor = s.direction > 0 ? '#27ae60' : s.direction < 0 ? '#e74c3c' : '#95a5a6'
        const isExpanded = expandedRationale === `${dimKey}-${i}`
        return (
          <div key={i} className="policy-card-item">
            <div className="pc-header">
              <span className="pc-name">
                {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="policy-source-link">{s.policyName}</a> : s.policyName}
              </span>
              <span className="conf-badge">{s.confidence}</span>
            </div>
            <div className="pc-meta">
              <span>广度 <b style={{color:'var(--info)'}}>{s.breadth}</b></span>
              <span>深度 <b style={{color:'var(--purple)'}}>{s.depth}</b></span>
              <span style={{color:dirColor, fontWeight:700}}>{dirLabel}</span>
            </div>
            <div className="pc-note">{s.note}</div>
            {s.rationale && (
              <>
                <button className="rationale-toggle" onClick={() => setExpandedRationale(isExpanded ? null : `${dimKey}-${i}`)}>
                  {isExpanded ? '收起依据 ▲' : '查看依据 ▼'}
                </button>
                {isExpanded && <div className="rationale-box"><b>📐 评分依据：</b>{s.rationale}</div>}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ═══════ 场景化专题（Special Topic） ═══════ */
function SpecialTopicView({ topic, personaKey }) {
  const [activeTab, setActiveTab] = useState('paths')
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [doneActions, setDoneActions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('topic_progress') || '{}') } catch { return {} }
  })

  const topicDone = doneActions[topic.id] || []
  const toggleAction = (id) => {
    setDoneActions(prev => {
      const list = prev[topic.id] || []
      const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id]
      const updated = { ...prev, [topic.id]: next }
      localStorage.setItem('topic_progress', JSON.stringify(updated))
      return updated
    })
  }

  const difficultyStars = d => '★'.repeat(d) + '☆'.repeat(5 - d)
  const urgencyColor = u => u === 'immediate' ? '#e53935' : u === 'soon' ? '#ff9800' : '#4caf50'
  const urgencyLabel = u => u === 'immediate' ? '立即行动' : u === 'soon' ? '尽快办理' : '持续关注'

  const actionDone = topic.actionItems.filter(a => topicDone.includes(a.id)).length
  const actionTotal = topic.actionItems.length

  return (
    <div className="special-topic">
      {/* Topic Header */}
      <div className="topic-hero">
        <span className="topic-hero-icon">{topic.icon}</span>
        <div>
          <h2 className="topic-hero-title">{topic.title}</h2>
          <p className="topic-hero-sub">{topic.subtitle}</p>
          <div className="topic-tags">{topic.tags.map(t => <span key={t} className="topic-tag">{t}</span>)}</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="topic-tabs" role="tablist" aria-label="专题导航">
        {[
          ['paths', '🛤️ 落户路径'],
          ['enrollment', '🏫 入学条件'],
          ['points', '📊 积分计算'],
          ['timeline', '📅 时间节点'],
          ['action', '📝 行动清单'],
          ['faq', '❓ 常见问题'],
        ].map(([k, label]) => (
          <button key={k} className={`tab-btn topic-tab ${activeTab === k ? 'active' : ''}`} role="tab" aria-selected={activeTab === k} onClick={() => setActiveTab(k)}>
            {label}
          </button>
        ))}
      </div>

      {/* Paths Tab */}
      {activeTab === 'paths' && (
        <div className="topic-section">
          <h3 className="topic-section-title">🛤️ 上海落户五大路径对比</h3>
          <div className="paths-grid">
            {topic.hukouPaths.map((p, i) => (
              <div key={i} className="path-card">
                <div className="path-header">
                  <h4 className="path-name">{p.name}</h4>
                  <span className="path-difficulty" title={`难度 ${p.difficulty}/5`}>{difficultyStars(p.difficulty)}</span>
                </div>
                <div className="path-time">⏱️ {p.timeCost}</div>
                <div className="path-conditions">
                  {p.conditions.map((c, ci) => <div key={ci} className="path-cond">• {c}</div>)}
                </div>
                <div className="path-footer">
                  <span className="path-pro">✅ {p.pros}</span>
                  <span className="path-con">⚠️ {p.cons}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrollment Tab */}
      {activeTab === 'enrollment' && (
        <div className="topic-section">
          <h3 className="topic-section-title">🏫 子女入学条件链（沪籍 vs 非沪籍）</h3>
          <div className="enrollment-table">
            <div className="enroll-header">
              <span className="enroll-col status">户籍状态</span>
              <span className="enroll-col stage">学段</span>
              <span className="enroll-col policy">政策</span>
              <span className="enroll-col tips">要点</span>
            </div>
            {topic.enrollmentChain.map((e, i) => (
              <div key={i} className={`enroll-row ${e.hukouStatus.includes('不足') ? 'enroll-warn' : e.hukouStatus === '沪籍' ? 'enroll-ok' : 'enroll-mid'}`}>
                <span className="enroll-col status">{e.hukouStatus}</span>
                <span className="enroll-col stage">{e.stage}</span>
                <span className="enroll-col policy">{e.policy}</span>
                <span className="enroll-col tips">{e.tips}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points Calculator Tab */}
      {activeTab === 'points' && (
        <div className="topic-section">
          <h3 className="topic-section-title">📊 居住证积分计算要素</h3>
          <div className="points-info">
            <span className="points-passline">达标线：<b>{topic.pointsCalc.passLine}分</b></span>
            <span className="points-tip">💡 {topic.pointsCalc.tip}</span>
          </div>
          <div className="points-grid">
            {topic.pointsCalc.items.map((item, i) => (
              <div key={i} className="points-card">
                <div className="points-card-name">{item.name}</div>
                <div className="points-card-max">最高 {item.max} 分</div>
                <div className="points-card-detail">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="topic-section">
          <h3 className="topic-section-title">📅 关键时间节点</h3>
          <div className="topic-timeline">
            {topic.keyDates.map((d, i) => (
              <div key={i} className={`ktl-item ktl-${d.urgency}`}>
                <div className="ktl-date">{d.date}</div>
                <div className="ktl-info">
                  <span className="ktl-event">{d.event}</span>
                  <span className="ktl-action">{d.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Tab */}
      {activeTab === 'action' && (
        <div className="topic-section">
          <div className="topic-action-header">
            <h3 className="topic-section-title">📝 专题行动清单</h3>
            <span className="topic-action-progress">已完成 {actionDone}/{actionTotal} 项</span>
          </div>
          <div className="topic-action-list">
            {topic.actionItems.map(item => {
              const isChecked = topicDone.includes(item.id)
              return (
                <div key={item.id} className={`topic-action-item ${isChecked ? 'tai-done' : ''}`}>
                  <label className="tai-check" onClick={e => { e.stopPropagation(); toggleAction(item.id) }}>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleAction(item.id)} />
                    <span className="tai-visual">{isChecked ? '✓' : ''}</span>
                  </label>
                  <div className="tai-content">
                    <div className="tai-title-row">
                      <span className={`tai-title ${isChecked ? 'title-line' : ''}`}>{item.title}</span>
                      <span className="tai-urgency" style={{ color: urgencyColor(item.urgency), borderColor: urgencyColor(item.urgency) }}>
                        {urgencyLabel(item.urgency)}
                      </span>
                    </div>
                    <div className="tai-steps">{item.steps.map((s, si) => <div key={si} className="tai-step"><span className="tai-step-num">{si + 1}</span>{s}</div>)}</div>
                    {item.tips && <div className="tai-tips">💡 {item.tips}</div>}
                    {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="tai-link">🔗 打开官网</a>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div className="topic-section">
          <h3 className="topic-section-title">❓ 常见问题</h3>
          <div className="topic-faq-list">
            {topic.faq.map((f, i) => (
              <div key={i} className="faq-item">
                <div className="faq-q" onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <span className="faq-arrow">{expandedFaq === i ? '▲' : '▼'}</span>
                </div>
                {expandedFaq === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════ 通用专题视图（Generic Topic View） ═══════ */
function GenericTopicView({ topic }) {
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [calcInputs, setCalcInputs] = useState({})
  const [calcResults, setCalcResults] = useState({})
  const [doneActions, setDoneActions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('topic_progress') || '{}') } catch { return {} }
  })

  const topicDone = doneActions[topic.id] || []
  const toggleAction = (id) => {
    setDoneActions(prev => {
      const list = prev[topic.id] || []
      const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id]
      const updated = { ...prev, [topic.id]: next }
      localStorage.setItem('topic_progress', JSON.stringify(updated))
      return updated
    })
  }

  const runCalc = (calcId, formula) => {
    const inputs = calcInputs[calcId] || {}
    const calc = topic.calculators.find(c => c.id === calcId)
    const values = {}
    calc.inputs.forEach(inp => { values[inp.key] = inputs[inp.key] !== undefined ? inputs[inp.key] : inp.default })
    setCalcResults(prev => ({ ...prev, [calcId]: formula(values) }))
  }

  // Auto-calculate when inputs change
  useEffect(() => {
    if (!topic.calculators) return
    topic.calculators.forEach(calc => {
      if (calcInputs[calc.id]) runCalc(calc.id, calc.formula)
    })
  }, [calcInputs])

  const urgencyColor = u => u === 'immediate' ? '#e53935' : u === 'soon' ? '#ff9800' : '#4caf50'
  const urgencyLabel = u => u === 'immediate' ? '立即行动' : u === 'soon' ? '尽快办理' : '持续关注'

  return (
    <div className="special-topic">
      <div className="topic-hero">
        <span className="topic-hero-icon">{topic.icon}</span>
        <div>
          <h2 className="topic-hero-title">{topic.title}</h2>
          <p className="topic-hero-sub">{topic.subtitle}</p>
          <div className="topic-tags">{topic.tags.map(t => <span key={t} className="topic-tag">{t}</span>)}</div>
        </div>
      </div>

      {/* Calculators (if any) */}
      {/* Eligibility Quiz (if topic has one) */}
      {topic.id === 'rental_housing' && <EligibilityQuiz quiz={rentalQuiz} />}
      {topic.calculators && topic.calculators.map(calc => (
        <div key={calc.id} className="topic-section gt-calc-section">
          <h3 className="topic-section-title">🧮 {calc.title}</h3>
          <div className="gt-calc-form">
            {calc.inputs.map(inp => (
              <div key={inp.key} className="gt-calc-field">
                <label>{inp.label}</label>
                {inp.type === 'boolean' ? (
                  <label className="gt-toggle">
                    <input type="checkbox" checked={calcInputs[calc.id]?.[inp.key] ?? inp.default}
                      onChange={e => setCalcInputs(prev => ({ ...prev, [calc.id]: { ...(prev[calc.id]||{}), [inp.key]: e.target.checked } }))} />
                    <span>{(calcInputs[calc.id]?.[inp.key] ?? inp.default) ? '是' : '否'}</span>
                  </label>
                ) : (
                  <div className="gt-input-group">
                    <input type="number" value={calcInputs[calc.id]?.[inp.key] ?? inp.default}
                      onChange={e => setCalcInputs(prev => ({ ...prev, [calc.id]: { ...(prev[calc.id]||{}), [inp.key]: Number(e.target.value) } }))} />
                    <span className="gt-unit">{inp.unit}</span>
                  </div>
                )}
              </div>
            ))}
            <button className="gt-calc-btn" onClick={() => runCalc(calc.id, calc.formula)}>计算结果</button>
          </div>
          {calcResults[calc.id] && (
            <div className="gt-calc-result">
              {(() => {
                const r = calcResults[calc.id]
                if (calc.id === 'severance') return (
                  <>
                    <div className="gcr-big">应得赔偿：¥{r.total.toLocaleString()}</div>
                    <div className="gcr-detail">{r.breakdown}</div>
                    {r.note && <div className="gcr-note">⚠️ {r.note}</div>}
                  </>
                )
                if (calc.id === 'annual_leave') return (
                  <>
                    <div className="gcr-big">法定年假：{r.days} 天</div>
                    <div className="gcr-detail">{r.note}</div>
                  </>
                )
                if (calc.id === 'overtime') return (
                  <>
                    <div className="gcr-big">加班费合计：¥{r.total.toLocaleString()}</div>
                    <div className="gcr-detail">{r.breakdown}</div>
                    <div className="gcr-detail">时薪基数：¥{r.hourly}/小时</div>
                  </>
                )
                if (calc.id === 'unemployment') return (
                  <>
                    <div className="gcr-big">可领取：{r.months}个月 × ¥{r.monthly}/月 = ¥{r.total.toLocaleString()}</div>
                    <div className="gcr-detail">{r.note}</div>
                    <div className="gcr-conditions">申领条件：{r.conditions.join('、')}</div>
                  </>
                )
                if (calc.id === 'rent_savings') return (
                  <>
                    <div className="gcr-big">{r.name}月租：¥{r.protectedRent.toLocaleString()} <span className="gcr-vs">vs 市场¥{r.marketRent.toLocaleString()}</span></div>
                    <div className="gcr-detail">每月节省 ¥{r.monthlySaving.toLocaleString()} · {r.months}个月共省 ¥{r.totalSaving.toLocaleString()}</div>
                    <div className="gcr-detail">年省 ¥{r.annualSaving.toLocaleString()}（租金为市场的{r.rate}%）</div>
                    {r.note && <div className="gcr-note">💡 {r.note}</div>}
                  </>
                )
                // Generic fallback for any calculator
                return (
                  <div className="gcr-generic">
                    {Object.entries(r).filter(([k]) => !['note'].includes(k)).map(([k, v]) => (
                      <div key={k} className="gcr-row">
                        <span className="gcr-label">{k}</span>
                        <span className="gcr-value">{typeof v === 'number' ? v.toLocaleString() : String(v)}</span>
                      </div>
                    ))}
                    {r.note && <div className="gcr-note">💡 {r.note}</div>}
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      ))}

      {/* Related Topics */}
      {topic.relatedTopics && topic.relatedTopics.length > 0 && (
        <div className="topic-section related-topics-section">
          <h3 className="topic-section-title">🔗 相关专题</h3>
          <div className="related-topics-grid">
            {topic.relatedTopics.map(rtId => {
              const rt = specialTopics.find(t => t.id === rtId);
              if (!rt) return null;
              return (
                <div key={rtId} className="related-topic-card" onClick={() => {
                  const el = document.getElementById(`topic-${rtId}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <span className="rt-icon">{rt.icon}</span>
                  <div className="rt-info">
                    <span className="rt-title">{rt.title}</span>
                    <span className="rt-sub">{rt.subtitle}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sections */}
      {topic.sections && topic.sections.map((sec, si) => (
        <div key={si} className="topic-section">
          <h3 className="topic-section-title">{sec.title}</h3>

          {/* comparison / deductions table */}
          {(sec.type === 'comparison' || sec.type === 'deductions' || sec.type === 'calc_table') && (
            <div className="enrollment-table">
              <div className="enroll-header">{sec.headers.map((h, hi) => <span key={hi} className="enroll-col">{h}</span>)}</div>
              {sec.rows.map((row, ri) => (
                <div key={ri} className="enroll-row">{row.map((cell, ci) => <span key={ci} className="enroll-col">{cell}</span>)}</div>
              ))}
              {sec.note && <div className="gt-table-note">💡 {sec.note}</div>}
            </div>
          )}

          {/* detail cards */}
          {sec.type === 'detail' && (
            <div className="detail-card-list">
              {sec.items.map((item, ii) => (
                <div key={ii} className="detail-card">
                  <div className="detail-card-header">
                    <span className="detail-card-name">{item.name}</span>
                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="policy-source-link">查看政策原文 ↗</a>}
                  </div>
                  {item.conditions && (
                    <div className="detail-card-row">
                      <span className="detail-card-label">申请条件</span>
                      <ul className="detail-card-conditions">
                        {item.conditions.map((c, ci) => <li key={ci}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="detail-card-meta">
                    {item.rent && <div className="detail-meta-item"><span className="detail-meta-k">💰 租金</span><span className="detail-meta-v">{item.rent}</span></div>}
                    {item.area && <div className="detail-meta-item"><span className="detail-meta-k">📐 面积</span><span className="detail-meta-v">{item.area}</span></div>}
                    {item.term && <div className="detail-meta-item"><span className="detail-meta-k">📅 期限</span><span className="detail-meta-v">{item.term}</span></div>}
                    {item.apply && <div className="detail-meta-item"><span className="detail-meta-k">📝 申请</span><span className="detail-meta-v">{item.apply}</span></div>}
                  </div>
                  {item.note && <div className="detail-card-note">💡 {item.note}</div>}
                </div>
              ))}
            </div>
          )}

          {/* process */}
          {sec.type === 'process' && (
            <div className="topic-timeline">
              {sec.steps.map((s, i) => (
                <div key={i} className="ktl-item ktl-medium">
                  <div className="ktl-date">第{i+1}步</div>
                  <div className="ktl-info">
                    <span className="ktl-event">{s.title}</span>
                    <span className="ktl-action">{s.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* action_list */}
          {sec.type === 'action_list' && (() => {
            const items = sec.items || []
            const done = items.filter(it => topicDone.includes(it.id)).length
            return (
              <div>
                <div className="topic-action-header">
                  <span className="topic-action-progress">已完成 {done}/{items.length} 项</span>
                </div>
                <div className="topic-action-list">
                  {items.map(item => {
                    const isChecked = topicDone.includes(item.id)
                    return (
                      <div key={item.id} className={`topic-action-item ${isChecked ? 'tai-done' : ''}`}>
                        <label className="tai-check" onClick={e => { e.stopPropagation(); toggleAction(item.id) }}>
                          <input type="checkbox" checked={isChecked} onChange={() => toggleAction(item.id)} />
                          <span className="tai-visual">{isChecked ? '✓' : ''}</span>
                        </label>
                        <div className="tai-content">
                          <div className="tai-title-row">
                            <span className={`tai-title ${isChecked ? 'title-line' : ''}`}>{item.title}</span>
                            <span className="tai-urgency" style={{ color: urgencyColor(item.urgency), borderColor: urgencyColor(item.urgency) }}>{urgencyLabel(item.urgency)}</span>
                          </div>
                          <div className="tai-steps">{item.steps.map((s, si) => <div key={si} className="tai-step"><span className="tai-step-num">{si+1}</span>{s}</div>)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* tips */}
          {sec.type === 'tips' && (
            <div className="gt-tips-list">
              {sec.items.map((t, i) => (
                <div key={i} className="gt-tip-card">
                  <div className="gt-tip-title">💡 {t.title}</div>
                  <div className="gt-tip-content">{t.tip}</div>
                </div>
              ))}
            </div>
          )}

          {/* faq */}
          {sec.type === 'faq' && (
            <div className="topic-faq-list">
              {sec.items.map((f, i) => {
                const faqKey = `${si}-${i}`
                return (
                  <div key={i} className="faq-item">
                    <div className="faq-q" onClick={() => setExpandedFaq(expandedFaq === faqKey ? null : faqKey)}>
                      <span>{f.q}</span>
                      <span className="faq-arrow">{expandedFaq === faqKey ? '▲' : '▼'}</span>
                    </div>
                    {expandedFaq === faqKey && <div className="faq-a">{f.a}</div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ═══════ 决策模拟器 ═══════ */
function DecisionSimulator() {
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

  // Auto-calculate when scenario or inputs change
  useEffect(() => {
    if (inputs[scenario.id] || activeScenario > 0) {
      runScenario()
    }
  }, [activeScenario, inputs])

  return (
    <div className="decision-sim">
      <h2 className="section-title">🎮 决策模拟器</h2>
      <p className="ds-intro">输入你的情况，看看政策对你意味着什么</p>

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

/* ═══════ 行动中枢（Action Hub） ═══════ */
function ActionHub({ personaKey, onSwitchTab }) {
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('action_progress') || '{}') } catch { return {} }
  })
  const [expandedId, setExpandedId] = useState(null)
  const [dividendOpen, setDividendOpen] = useState(false)

  const plans = actionPlans[personaKey] || []
  const dividends = policyDividends[personaKey] || []
  const myDeadlines = deadlines.filter(d => d.persona.includes(personaKey))
    .map(d => {
      const target = new Date(d.date)
      const now = new Date()
      const days = Math.ceil((target - now) / 86400000)
      return { ...d, daysLeft: days, expired: days < 0 }
    })
    .sort((a, b) => {
      if (a.expired !== b.expired) return a.expired ? 1 : -1
      return a.daysLeft - b.daysLeft
    })

  const done = progress[personaKey] || []
  const completedCount = plans.filter(p => done.includes(p.id)).length
  const total = plans.length
  const pct = total > 0 ? Math.round(completedCount / total * 100) : 0
  const allDone = completedCount === total && total > 0

  const toggleItem = (id) => {
    setProgress(prev => {
      const list = prev[personaKey] || []
      const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id]
      const updated = { ...prev, [personaKey]: next }
      localStorage.setItem('action_progress', JSON.stringify(updated))
      return updated
    })
  }

  const resetProgress = () => {
    setProgress(prev => {
      const updated = { ...prev, [personaKey]: [] }
      localStorage.setItem('action_progress', JSON.stringify(updated))
      return updated
    })
  }

  // Policy dividend totals
  const confirmedTotal = dividends.filter(d => d.confirmed && d.amount > 0).reduce((a, d) => a + d.amount, 0)
  const riskTotal = dividends.filter(d => d.isRisk && d.amount < 0).reduce((a, d) => a + d.amount, 0)
  const netTotal = confirmedTotal + riskTotal

  const urgencyLabel = u => u === 'immediate' ? '立即行动' : u === 'soon' ? '尽快办理' : '持续关注'
  const urgencyClass = u => u === 'immediate' ? 'urg-red' : u === 'soon' ? 'urg-orange' : 'urg-green'

  if (plans.length === 0) return null

  return (
    <div className="action-hub">
      <SavingsDashboard personaKey={personaKey} />
      {/* Header */}
      <div className="hub-header">
        <h2 className="section-title">📋 你的行动清单</h2>
        <div className="hub-progress-bar">
          <div className="progress-track">
            <div className={`progress-fill ${allDone ? 'progress-done' : ''}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="progress-text">
            {allDone ? '🎉 全部完成！' : `已完成 ${completedCount}/${total} 项`}
          </span>
          {completedCount > 0 && (
            <button className="reset-btn" onClick={resetProgress} title="重置进度">↻</button>
          )}
        </div>
      </div>

      {allDone && (
        <div className="hub-celebrate">
          <span className="celebrate-icon">🎊</span>
          <span>恭喜！你已把握所有政策红利，别忘了持续关注新的政策变化</span>
        </div>
      )}

      {/* Action Items */}
      <div className="hub-actions">
        {plans.map(item => {
          const isChecked = done.includes(item.id)
          const isExpanded = expandedId === item.id
          return (
            <div key={item.id} className={`hub-item ${isChecked ? 'hub-item-done' : ''}`}>
              <div className="hub-item-row" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                <label className="hub-checkbox" onClick={e => { e.stopPropagation(); toggleItem(item.id) }}>
                  <input type="checkbox" checked={isChecked} onChange={() => toggleItem(item.id)} />
                  <span className="check-visual">{isChecked ? '✓' : ''}</span>
                </label>
                <div className="hub-item-content">
                  <span className={`hub-item-title ${isChecked ? 'title-done' : ''}`}>{item.title}</span>
                  <span className={`hub-urgency ${urgencyClass(item.urgency)}`}>{urgencyLabel(item.urgency)}</span>
                </div>
                {item.benefit > 0 && (
                  <span className="hub-benefit">+{(item.benefit / 10000).toFixed(1)}万</span>
                )}
                <span className="hub-expand">{isExpanded ? '▲' : '▼'}</span>
              </div>
              {isExpanded && (
                <div className="hub-item-detail">
                  <div className="hub-steps">
                    {item.steps.map((s, si) => (
                      <div key={si} className="hub-step">
                        <span className="step-num">{si + 1}</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                  {item.risk && <div className="hub-risk">⚠️ {item.risk}</div>}
                  {item.toolLink && (
                    <button className="hub-tool-link" onClick={() => onSwitchTab(item.toolLink)}>
                      🧮 打开相关工具
                    </button>
                  )}
                  {item.deadline && (
                    <div className="hub-deadline-hint">⏰ 截止日期：{item.deadline}</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Policy Dividend */}
      {dividends.length > 0 && (
        <div className="hub-dividend">
          <div className="dividend-header" onClick={() => setDividendOpen(!dividendOpen)}>
            <div className="dividend-summary">
              <span className="dividend-label">你的政策红利</span>
              <span className="dividend-amount">约 {(netTotal / 10000).toFixed(1)} 万元</span>
            </div>
            <span className="hub-expand">{dividendOpen ? '▲' : '▼'}</span>
          </div>
          {dividendOpen && (
            <div className="dividend-details">
              {dividends.map(d => (
                <div key={d.id} className={`dividend-row ${d.isRisk ? 'dividend-risk' : ''} ${d.isQualitative ? 'dividend-qual' : ''}`}>
                  <div className="dividend-row-label">
                    {d.isRisk ? '⚠️' : d.isQualitative ? '✨' : '✅'} {d.label}
                  </div>
                  <div className="dividend-row-amount">
                    {d.isRisk ? `-${(Math.abs(d.amount)/10000).toFixed(0)}万` : d.isQualitative ? '定性利好' : `+${(d.amount/10000).toFixed(1)}万`}
                  </div>
                  <div className="dividend-row-calc">{d.calc}</div>
                </div>
              ))}
              {riskTotal < 0 && (
                <div className="dividend-note">* 已扣除潜在风险因素，实际收益可能更高</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Deadline Tracker */}
      {myDeadlines.length > 0 && (
        <div className="hub-deadlines">
          <h3 className="hub-sub-title">⏰ 重要时间窗口</h3>
          {myDeadlines.map(d => {
            const colorClass = d.expired ? 'dl-expired' : d.daysLeft <= 90 ? 'dl-red' : d.daysLeft <= 180 ? 'dl-orange' : 'dl-green'
            return (
              <div key={d.id} className={`dl-item ${colorClass}`}>
                <div className="dl-badge">
                  {d.expired ? '已生效' : `${d.daysLeft}天`}
                </div>
                <div className="dl-info">
                  <span className="dl-label">{d.label}</span>
                  <span className="dl-action">{d.action}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


/* ═══════ A1: 行动成果可视化 (Savings Dashboard) ═══════ */
function SavingsDashboard({ personaKey }) {
  const plans = actionPlans[personaKey] || []
  const dividends = policyDividends[personaKey] || []
  const progress = (() => { try { return JSON.parse(localStorage.getItem("action_progress") || "{}") } catch { return {} } })()
  const done = progress[personaKey] || []
  const doneBenefit = plans.filter(p => done.includes(p.id)).reduce((a, p) => a + (p.benefit || 0), 0)
  const totalBenefit = plans.reduce((a, p) => a + (p.benefit || 0), 0)
  const confirmedTotal = dividends.filter(d => d.confirmed && d.amount > 0).reduce((a, d) => a + d.amount, 0)
  const riskTotal = dividends.filter(d => d.isRisk && d.amount < 0).reduce((a, d) => a + d.amount, 0)
  const netTotal = confirmedTotal + riskTotal
  const pct = plans.length > 0 ? Math.round(done.length / plans.length * 100) : 0
  return (
    <div className="savings-dashboard">
      <h3 className="savings-title">💰 你的政策红利总览</h3>
      <div className="savings-grid">
        <div className="savings-card savings-confirm"><span className="sv-label">已确认红利</span><span className="sv-value">+{confirmedTotal.toLocaleString()}元</span></div>
        <div className="savings-card savings-risk"><span className="sv-label">潜在风险</span><span className="sv-value">{riskTotal.toLocaleString()}元</span></div>
        <div className={`savings-card savings-net ${netTotal >= 0 ? "positive" : "negative"}`}><span className="sv-label">净收益</span><span className="sv-value">{netTotal >= 0 ? "+" : ""}{netTotal.toLocaleString()}元</span></div>
        <div className="savings-card savings-done"><span className="sv-label">行动收益</span><span className="sv-value">+{(doneBenefit / 10000).toFixed(1)}万</span></div>
      </div>
      {pct < 100 && (
        <div className="savings-warning">
          <span>⚠️</span>
          <span>你还有 {plans.length - done.length} 项行动未完成，可能每年损失 <b>{((totalBenefit - doneBenefit) / 10000).toFixed(1)}万</b> 元政策红利</span>
        </div>
      )}
    </div>
  )
}

/* ═══════ A2: PDF 报告导出 ═══════ */
function ReportExport({ personaKey, regionKey, onClose }) {
  const canvasRef = useRef(null)
  const persona = personas.find(p => p.key === personaKey)
  const region = regions.find(r => r.key === regionKey)
  const dims = getDimensionsForRegion(regionKey)
  const overallIndex = calcOverallIndex(personaKey, regionKey)
  const overallLevel = getIndexLevel(overallIndex)
  const plans = actionPlans[personaKey] || []
  const dividends = policyDividends[personaKey] || []
  const confirmedTotal = dividends.filter(d => d.confirmed && d.amount > 0).reduce((a, d) => a + d.amount, 0)

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d")
    const W = 750, H = 1400; canvas.width = W; canvas.height = H
    // Background
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H)
    // Header
    const hGrad = ctx.createLinearGradient(0, 0, W, 100)
    hGrad.addColorStop(0, "#1a1a2e"); hGrad.addColorStop(1, "#16213e")
    ctx.fillStyle = hGrad; ctx.fillRect(0, 0, W, 100)
    ctx.fillStyle = "#fff"; ctx.font = "bold 28px sans-serif"
    ctx.fillText("🧭 策查查 · 个人政策影响报告", 30, 60)
    ctx.font = "14px sans-serif"; ctx.fillStyle = "#aaa"
    ctx.fillText(`${region?.name || "全国"} · ${persona ? persona.icon + persona.label : "未选择身份"} · 2026-07-12`, 30, 85)
    // Overall Index
    ctx.fillStyle = overallLevel.color; ctx.font = "bold 64px sans-serif"
    ctx.fillText(String(overallIndex), 30, 180)
    ctx.font = "bold 24px sans-serif"; ctx.fillText(overallLevel.icon + " " + overallLevel.label, 180, 170)
    ctx.font = "16px sans-serif"; ctx.fillStyle = "#666"; ctx.fillText(overallLevel.plain, 180, 200)
    // Divider
    ctx.strokeStyle = "#e0e0e0"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(30, 220); ctx.lineTo(W-30, 220); ctx.stroke()
    // Dimension Scores
    ctx.fillStyle = "#333"; ctx.font = "bold 18px sans-serif"; ctx.fillText("📈 六维度评分", 30, 260)
    dims.forEach((d, i) => {
      const y = 290 + i * 45; const idx = calcDimensionScore(d); const lvl = getIndexLevel(idx)
      ctx.fillStyle = "#333"; ctx.font = "16px sans-serif"; ctx.fillText(d.icon + " " + d.name, 40, y)
      ctx.fillStyle = "#e0e0e0"; ctx.fillRect(250, y - 12, 350, 16)
      ctx.fillStyle = lvl.color; ctx.fillRect(250, y - 12, 350 * idx / 100, 16)
      ctx.fillStyle = lvl.color; ctx.font = "bold 18px sans-serif"; ctx.fillText(String(idx), 630, y)
    })
    // Action Plans Summary
    const ay = 290 + dims.length * 45 + 30
    ctx.fillStyle = "#333"; ctx.font = "bold 18px sans-serif"; ctx.fillText("📋 行动清单", 30, ay)
    plans.slice(0, 5).forEach((p, i) => {
      ctx.fillStyle = "#555"; ctx.font = "14px sans-serif"
      ctx.fillText(`${i+1}. ${p.title}${p.benefit > 0 ? " (+" + (p.benefit/10000).toFixed(1) + "万)" : ""}`, 40, ay + 30 + i * 28)
    })
    // Dividends
    const dy = ay + 30 + Math.min(plans.length, 5) * 28 + 30
    ctx.fillStyle = "#333"; ctx.font = "bold 18px sans-serif"; ctx.fillText("💰 政策红利", 30, dy)
    ctx.fillStyle = "#27ae60"; ctx.font = "bold 22px sans-serif"; ctx.fillText(`已确认红利: +${confirmedTotal.toLocaleString()}元/年`, 40, dy + 35)
    // Footer
    ctx.fillStyle = "#999"; ctx.font = "12px sans-serif"
    ctx.fillText("策查查 · 读懂政策，做对决策 · 基于 OECD RIA + PEST + 利益相关者矩阵", 30, H - 25)
    ctx.fillText("仅供参考，不构成投资建议", W - 200, H - 25)
  }, [personaKey, regionKey])

  const downloadReport = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const link = document.createElement("a")
    link.download = "策查查_个人报告_2026-07-12.png"
    link.href = canvas.toDataURL("image/png"); link.click()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-card-modal" onClick={e => e.stopPropagation()}>
        <h3>📄 个人政策影响报告</h3>
        <canvas ref={canvasRef} style={{ width: "100%", borderRadius: 12, maxWidth: 375 }} />
        <div className="share-actions">
          <button className="btn-primary" onClick={downloadReport}>💾 下载报告</button>
          <button className="btn-secondary" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  )
}

/* ═══════ A3: 高级功能锁 (Premium Teaser) ═══════ */
function PremiumTeaser() {
  const [showModal, setShowModal] = useState(false)
  return (
    <div className="premium-teaser">
      <h3 className="premium-title">🚀 解锁专业版功能</h3>
      <div className="premium-grid">
        {premiumFeatures.map(f => (
          <div key={f.id} className="premium-card" onClick={() => setShowModal(true)}>
            <span className="premium-badge">{f.badge}</span>
            <span className="premium-icon">{f.icon}</span>
            <h4>{f.title}</h4>
            <p className="premium-desc">{f.desc}</p>
            <div className="premium-lock">🔒 专业版</div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">🚀 专业版即将上线</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>我们正在开发 AI 政策顾问、实时推送等高级功能。<br/>订阅通知，第一时间获得上线提醒和早鸟优惠。</p>
            <div style={{ display: "flex", gap: 8 }}>
              <a href="mailto:subscribe@policycompass.app?subject=订阅专业版上线通知" className="btn-primary" style={{ textDecoration: "none" }}>📧 订阅通知</a>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>稍后再说</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════ A4: Before/After 对比 ═══════ */
function BeforeAfterCompare({ currentScore, actionCount, doneCount }) {
  const boost = Math.min(15, Math.round(actionCount * 2.5))
  const afterScore = Math.min(100, currentScore + boost)
  const pct = actionCount > 0 ? Math.round(doneCount / actionCount * 100) : 0
  return (
    <div className="ba-compare">
      <div className="ba-header">
        <span className="ba-label-before">当前</span>
        <span className="ba-arrow">→</span>
        <span className="ba-label-after">完成行动后</span>
      </div>
      <div className="ba-bars">
        <div className="ba-bar-wrap">
          <div className="ba-bar ba-before" style={{ width: `${currentScore}%` }}><span>{currentScore}</span></div>
        </div>
        <div className="ba-bar-wrap">
          <div className="ba-bar ba-after" style={{ width: `${afterScore}%` }}><span>{afterScore}</span></div>
        </div>
      </div>
      <p className="ba-text">完成全部行动后，你的指数可从 <b>{currentScore}</b> 提升至 <b style={{ color: "var(--success)" }}>{afterScore}</b>（+{boost}分）</p>
    </div>
  )
}

/* ═══════ B1: 首次访问引导 ═══════ */
function OnboardingTour({ onClose }) {
  const [step, setStep] = useState(0)
  const steps = [
    { target: ".overall-card", title: "你的政策影响力指数", desc: "基于六大维度综合计算，告诉你政策对你的整体影响程度", pos: "bottom" },
    { target: ".action-hub", title: "你的行动清单", desc: "根据你的身份生成的个性化行动建议，帮你把握政策红利", pos: "bottom" },
    { target: ".tabs", title: "探索更多维度", desc: "切换标签查看六维度详情、工具、专题和方法论", pos: "bottom" },
    { target: ".quick-stat", title: "维度快览", desc: "点击任意维度卡片，深入了解该维度的政策影响分析", pos: "top" },
    { target: ".share-btn", title: "分享你的结果", desc: "生成精美的分享卡片，把你的政策分析结果分享给朋友", pos: "bottom" },
  ]
  const current = steps[step]
  const finish = () => { sessionStorage.setItem("tour_done", "1"); onClose() }

  useEffect(() => {
    if (!current) return
    const el = document.querySelector(current.target)
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("tour-highlight") }
    return () => { if (el) el.classList.remove("tour-highlight") }
  }, [step])

  if (!current) return null
  return (
    <div className="tour-overlay" onClick={finish}>
      <div className="tour-tooltip" onClick={e => e.stopPropagation()}>
        <div className="tour-step-indicator">{step + 1} / {steps.length}</div>
        <h4 className="tour-step-title">{current.title}</h4>
        <p className="tour-step-desc">{current.desc}</p>
        <div className="tour-actions">
          <button className="tour-skip" onClick={finish}>跳过</button>
          {step < steps.length - 1 ? (
            <button className="tour-next" onClick={() => setStep(s => s + 1)}>下一步 →</button>
          ) : (
            <button className="tour-next" onClick={finish}>开始使用 🎉</button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════ B2.5: 跨区域对比 ═══════ */
function RegionCompare({ personaKey, currentRegion, onSelectRegion }) {
  const compareData = useMemo(() => {
    return regions.map(r => {
      const dims = getDimensionsForRegion(r.key)
      const scores = dims.map(d => ({ key: d.key, name: d.name, icon: d.icon, score: calcDimensionScore(d) }))
      const overall = calcOverallIndex(personaKey, r.key)
      return { ...r, dimScores: scores, overall, totalPolicies: dims.reduce((a, d) => a + d.scores.length, 0) }
    })
  }, [personaKey])

  return (
    <section className="region-compare">
      <h2 className="section-title">🔁 跨区域政策影响对比</h2>
      <p className="rc-intro">比较五大区域的政策影响差异，点击综合指数可快速切换区域</p>
      <div className="rc-table" role="table" aria-label="区域对比">
        <div className="rc-row rc-header">
          <span className="rc-dim" role="columnheader">维度</span>
          {compareData.map(r => (
            <span key={r.key} className={`rc-region ${r.key === currentRegion ? 'rc-active' : ''}`}>
              {r.icon}<span className="rc-rname">{r.name}</span>
              <span className="rc-pcount">{r.totalPolicies}条</span>
            </span>
          ))}
        </div>
        {compareData[0]?.dimScores.map(dim => {
          const best = Math.max(...compareData.map(r => r.dimScores.find(d2 => d2.key === dim.key)?.score || 0))
          return (
            <div key={dim.key} className="rc-row">
              <span className="rc-dim">{dim.icon} {dim.name}</span>
              {compareData.map(r => {
                const s = r.dimScores.find(d2 => d2.key === dim.key)
                const isBest = s?.score === best && best > 0
                return (
                  <span key={r.key} className={`rc-cell ${isBest ? 'rc-best' : ''} ${r.key === currentRegion ? 'rc-current' : ''}`}>
                    {s?.score ?? '-'}
                  </span>
                )
              })}
            </div>
          )
        })}
        <div className="rc-row rc-total">
          <span className="rc-dim">📊 综合指数</span>
          {(() => {
            const best = Math.max(...compareData.map(r => r.overall))
            return compareData.map(r => {
              const isBest = r.overall === best && best > 0
              return (
                <span key={r.key}
                  className={`rc-cell rc-overall ${isBest ? 'rc-best' : ''} ${r.key === currentRegion ? 'rc-current' : ''}`}
                  onClick={() => onSelectRegion(r.key)}
                  title={`点击切换到${r.name}`}>
                  <span className="rc-ov-num">{r.overall}</span>
                  <span className="rc-ov-label">综合</span>
                </span>
              )
            })
          })()}
        </div>
      </div>
      <div className="rc-legend">
        <span className="rc-legend-item"><span className="rc-leg-best" />最优区域</span>
        <span className="rc-legend-item"><span className="rc-leg-cur" />当前区域</span>
        <span className="rc-legend-item"><span className="rc-leg-click" />点击切换</span>
      </div>
    </section>
  )
}

/* ═══════ B3: 个人仪表盘 ═══════ */
function Dashboard({ personaKey, regionKey, bookmarks, onSwitchTab }) {
  const visits = (() => { try { return JSON.parse(localStorage.getItem("visit_stats") || "{}") } catch { return {} } })()
  const persona = personas.find(p => p.key === personaKey)

  const progress = (() => { try { return JSON.parse(localStorage.getItem("action_progress") || "{}") } catch { return {} } })()
  const done = progress[personaKey] || []
  const plans = actionPlans[personaKey] || []
  const dividends = policyDividends[personaKey] || []
  const confirmedTotal = dividends.filter(d => d.confirmed && d.amount > 0).reduce((a, d) => a + d.amount, 0)
  const riskTotal = dividends.filter(d => d.isRisk && d.amount < 0).reduce((a, d) => a + d.amount, 0)
  const dims = getDimensionsForRegion(regionKey)
  const dimScores = dims.map(d => ({ ...d, idx: calcDimensionScore(d) }))
  const overallIndex = calcOverallIndex(personaKey, regionKey)
  const overallLevel = getIndexLevel(overallIndex)
  const doneBenefit = plans.filter(p => done.includes(p.id)).reduce((a, p) => a + (p.benefit || 0), 0)
  const firstVisit = visits.firstDate || new Date().toISOString().slice(0, 10)
  const [folded, setFolded] = useState({ ledger: true, actions: true, bookmarks: true, history: true, settle: true })
  const toggleFolded = name => setFolded(f => ({ ...f, [name]: !f[name] }))
  const historyCount = (() => { try { return JSON.parse(localStorage.getItem('view_history') || '[]').length } catch { return 0 } })()
  const settlementSaved = (() => { try { return JSON.parse(localStorage.getItem('settlement_data')) } catch { return null } })()
  const settlementActions = (() => { try { return JSON.parse(localStorage.getItem('settlement_actions')) } catch { return null } })()
  const [settlementDone, setSettlementDone] = useState(() => { try { return JSON.parse(localStorage.getItem('settlement_actions_done') || '[]') } catch { return [] } })

  return (
    <div className="dashboard-view">
      <h2 className="section-title">📊 我的政策档案</h2>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-header">
          <span className="profile-avatar">{persona ? persona.icon : '👤'}</span>
          <div className="profile-info">
            <span className="profile-name">{persona ? persona.label + '视角' : '未选择身份'}</span>
            <span className="profile-since">首次访问：{firstVisit}</span>
          </div>
          <div className="profile-score" style={{ color: overallLevel.color }}>
            <span className="ps-num">{overallIndex}</span>
            <span className="ps-label">{overallLevel.icon} {overallLevel.label}</span>
          </div>
        </div>
        {/* Radar-like dimension bars */}
        <div className="profile-dims">
          {dimScores.map(d => (
            <div key={d.key} className="pd-row">
              <span className="pd-icon">{d.icon}</span>
              <span className="pd-name">{d.name}</span>
              <div className="pd-bar-wrap"><div className="pd-bar" style={{ width: d.idx + '%', background: d.color }} /></div>
              <span className="pd-score" style={{ color: getIndexLevel(d.idx).color }}>{d.idx}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="dash-stats">
        <div className="dash-stat"><span className="ds-num">{visits.count || 1}</span><span className="ds-label">访问次数</span></div>
        <div className="dash-stat"><span className="ds-num">{done.length}/{plans.length}</span><span className="ds-label">行动完成</span></div>
        <div className="dash-stat"><span className="ds-num">+{(confirmedTotal/10000).toFixed(1)}万</span><span className="ds-label">已确认红利</span></div>
        <div className="dash-stat"><span className="ds-num">{bookmarks.length}</span><span className="ds-label">收藏政策</span></div>
      </div>

      {/* Settlement Progress */}
      {settlementSaved && (
        <div className="dash-settlement-card" onClick={() => onSwitchTab('tools')}>
          <span className="dsc-icon">{settlementSaved.report?.city?.icon}</span>
          <div className="dsc-body">
            <span className="dsc-title">🏡 安家进度 · {settlementSaved.report?.city?.name}</span>
            <div className="dsc-metrics">
              <span className={`dsc-metric ${settlementSaved.report?.score?.pass ? 'dsc-ok' : 'dsc-progress'}`}>
                落户 {settlementSaved.report?.score?.score}/{settlementSaved.report?.score?.passScore}分
              </span>
              <span className={`dsc-metric ${settlementSaved.report?.qualify?.qualify ? 'dsc-ok' : 'dsc-progress'}`}>
                购房 {settlementSaved.report?.qualify?.qualify ? '✅' : '还需' + settlementSaved.report?.qualify?.waitYears + '年'}
              </span>
            </div>
          </div>
          <span className="dsc-arrow">→</span>
        </div>
      )}

      {/* 安家行动清单 */}
      {settlementActions && settlementActions.actions.length > 0 && (
        <div className="dash-fold">
          <div className="dash-fold-hd" onClick={() => toggleFolded('settle')}>
            <span>🎯 安家行动清单 · {settlementActions.cityKey}</span>
            <span className="dash-fold-preview">{settlementDone.filter(id => settlementActions.actions.some(a => a.id === id)).length}/{settlementActions.actions.length} 已完成</span>
            <span className="dash-fold-icon">{folded.settle ? '▸' : '▾'}</span>
          </div>
          {!folded.settle && (
            <div className="settle-action-list">
              {settlementActions.actions.map(a => {
                const done = settlementDone.includes(a.id)
                return (
                  <div key={a.id} className={`sal-item ${done ? 'sal-done' : ''}`}>
                    <span className="sal-check" onClick={() => {
                      const next = done ? settlementDone.filter(x => x !== a.id) : [...settlementDone, a.id]
                      setSettlementDone(next)
                      try { localStorage.setItem('settlement_actions_done', JSON.stringify(next)) } catch {}
                    }}>{done ? '✅' : '⬜'}</span>
                    <div className="sal-body">
                      <span className="sal-title">{a.title}</span>
                      <span className={`sal-priority sal-${a.priority}`}>{a.priority === 'high' ? '🔴 优先' : a.priority === 'medium' ? '🟡 重要' : '🟢 可选'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Dividend Ledger */}
      <div className="dash-fold">
        <div className="dash-fold-hd" onClick={() => toggleFolded('ledger')}>
          <span>💰 我的政策红利账本</span>
          <span className="dash-fold-preview">{confirmedTotal > 0 ? `+${(confirmedTotal/10000).toFixed(1)}万` : '0'} / {riskTotal < 0 ? `${(riskTotal/10000).toFixed(1)}万` : '无风险'}</span>
          <span className="dash-fold-icon">{folded.ledger ? '▸' : '▾'}</span>
        </div>
        {!folded.ledger && (
          <div className="ledger-grid">
            <div className="ledger-card ledger-confirm"><span className="lc-label">已确认红利</span><span className="lc-value">+{confirmedTotal.toLocaleString()}元/年</span></div>
            <div className="ledger-card ledger-risk"><span className="lc-label">潜在风险</span><span className="lc-value">{riskTotal.toLocaleString()}元/年</span></div>
            <div className="ledger-card ledger-action"><span className="lc-label">行动收益</span><span className="lc-value">+{(doneBenefit/10000).toFixed(1)}万</span></div>
            <div className="ledger-card ledger-net"><span className="lc-label">净收益</span><span className="lc-value">{(confirmedTotal+riskTotal>=0?'+':'')}{(confirmedTotal+riskTotal).toLocaleString()}元</span></div>
          </div>
        )}
      </div>

      {/* Action Progress */}
      {plans.length > 0 && (
        <div className="dash-fold">
          <div className="dash-fold-hd" onClick={() => toggleFolded('actions')}>
            <span>📋 行动进度</span>
            <span className="dash-fold-preview">{done.length}/{plans.length} 已完成</span>
            <span className="dash-fold-icon">{folded.actions ? '▸' : '▾'}</span>
          </div>
          {!folded.actions && (
            <div className="action-progress-list">
              {plans.map(p => (
                <div key={p.id} className={`apl-item ${done.includes(p.id) ? 'apl-done' : ''}`}>
                  <span className="apl-check">{done.includes(p.id) ? '✅' : '⬜'}</span>
                  <span className="apl-title">{p.title}</span>
                  {p.benefit > 0 && <span className="apl-benefit">+{(p.benefit/10000).toFixed(1)}万</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <div className="dash-fold">
          <div className="dash-fold-hd" onClick={() => toggleFolded('bookmarks')}>
            <span>🔖 我收藏的政策</span>
            <span className="dash-fold-preview">{bookmarks.length} 项</span>
            <span className="dash-fold-icon">{folded.bookmarks ? '▸' : '▾'}</span>
          </div>
          {!folded.bookmarks && (
            <div className="dash-bookmarks">{bookmarks.map(b => <div key={b} className="dash-bm-item" onClick={() => onSwitchTab("dimensions")}>{b}</div>)}</div>
          )}
        </div>
      )}

      {/* View History */}
      <div className="dash-fold">
        <div className="dash-fold-hd" onClick={() => toggleFolded('history')}>
          <span>📖 最近浏览</span>
          <span className="dash-fold-preview">{historyCount} 项</span>
          <span className="dash-fold-icon">{folded.history ? '▸' : '▾'}</span>
        </div>
        {!folded.history && (() => {
          try {
            const hist = JSON.parse(localStorage.getItem('view_history') || '[]')
            const recent = hist.slice(0, 5)
            return recent.length > 0 ? (
              <div className="dash-history-list">
                {recent.map((h, i) => (
                  <div key={i} className="dash-history-item" onClick={() => onSwitchTab("dimensions")}>
                    <span className="dhi-name">{h.policyName}</span>
                    <span className="dhi-dim">{h.dimName}</span>
                    <span className="dhi-time">{new Date(h.timestamp).toLocaleDateString('zh-CN', {month:'short',day:'numeric'})}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-history-empty">
                <p>还没有浏览记录</p>
                <button className="dhe-btn" onClick={() => onSwitchTab("dimensions")}>去浏览政策 →</button>
              </div>
            )
          } catch { return null }
        })()}
      </div>

      {/* Compact Radar */}
      <div className="dash-mini-radar" onClick={() => onSwitchTab('radar')}>
        <span className="dmr-icon">📡</span>
        <span className="dmr-text">人生雷达 — 扫描政策机会和盲区</span>
        <span className="dmr-arrow">开启 →</span>
      </div>

      {/* Compact Calendar */}
      <div className="dash-inline-calendar">
        <span className="dic-label">📅 即将到来</span>
        <PolicyCalendar personaKey={personaKey} compact={true} />
      </div>

    </div>
  )
}

/* ═══════ B4: 智能推荐 ═══════ */
/* ═══════ C2: 画像对比 ═══════ */
function PersonaCompare({ currentPersonaKey }) {
  const scores = personas.map(p => ({ ...p, score: calcOverallIndex(p.key, "national") }))
  const maxScore = Math.max(...scores.map(s => s.score))
  const current = scores.find(s => s.key === currentPersonaKey)
  return (
    <div className="persona-compare">
      <h3 className="pc-title">👥 画像对比（同一政策，不同身份的影响差异）</h3>
      <div className="pc-bars">
        {scores.map(s => (
          <div key={s.key} className={`pc-row ${s.key === currentPersonaKey ? "pc-current" : ""}`}>
            <span className="pc-label">{s.icon} {s.label}</span>
            <div className="pc-bar-track"><div className="pc-bar-fill" style={{ width: `${(s.score / maxScore) * 100}%`, background: getIndexLevel(s.score).color }} /></div>
            <span className="pc-score">{s.score}</span>
          </div>
        ))}
      </div>
      {current && <p className="pc-summary">作为「{current.icon} {current.label}」，你的指数在所有画像中排名第 {scores.sort((a,b) => b.score - a.score).findIndex(s => s.key === currentPersonaKey) + 1} 位</p>}
    </div>
  )
}

/* ═══════ C3: 邀请机制 ═══════ */
function InvitePanel() {
  const userId = (() => { let id = localStorage.getItem("user_id"); if (!id) { id = "u_" + Math.random().toString(36).slice(2, 10); localStorage.setItem("user_id", id) } return id })()
  const inviteCount = parseInt(localStorage.getItem("invite_count") || "0")
  const inviteLink = window.location.origin + "?ref=" + userId
  const [copied, setCopied] = useState(false)
  const hasBadge = inviteCount >= 3
  const copyLink = () => { navigator.clipboard.writeText(inviteLink).then(() => setCopied(true)); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="invite-panel">
      <h3 className="invite-title">🤝 邀请好友一起用</h3>
      <p className="invite-desc">把策查查分享给朋友，一起读懂政策、做对决策</p>
      <div className="invite-link-box">
        <input className="invite-input" readOnly value={inviteLink} onClick={e => e.target.select()} />
        <button className="invite-copy" onClick={copyLink}>{copied ? "✅ 已复制" : "📋 复制"}</button>
      </div>
      <div className="invite-stats">
        <span>已邀请 <b>{inviteCount}</b> 人</span>
        {hasBadge && <span className="invite-badge-earned">🏆 罗盘达人</span>}
      </div>
    </div>
  )
}
/* ═══════ 主应用 ═══════ */
/* ═══════ 动画计数器 ═══════ */
const _counterAnimated = new Set()
const AnimatedCounter = memo(function AnimatedCounter({ target, duration = 600 }) {
  const hasAnimated = _counterAnimated.has(target)
  const [value, setValue] = useState(hasAnimated ? target : 0)
  const prev = useRef(hasAnimated ? target : 0)
  useEffect(() => {
    if (hasAnimated) return
    const start = performance.now()
    const from = prev.current
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      const v = Math.round(from + (target - from) * ease)
      setValue(v)
      if (t < 1) requestAnimationFrame(tick)
      else { prev.current = target; _counterAnimated.add(target) }
    }
    requestAnimationFrame(tick)
  }, [target, duration, hasAnimated])
  return <>{value}</>
});

/* ═══════ 资格自测 Quiz ═══════ */
function EligibilityQuiz({ quiz }) {
  const [step, setStep] = useState(null)
  const [result, setResult] = useState(null)
  if (!quiz) return null
  const handleAnswer = (qId, answer) => {
    const q = quiz.questions.find(x => x.id === qId)
    if (!q) return
    const next = answer === 'yes' ? q.yes : q.no
    if (next.startsWith('result_')) { setResult(next); setStep(null) }
    else setStep(next)
  }
  const currentQ = step ? quiz.questions.find(q => q.id === step) : null
  const currentResult = result ? quiz.results[result] : null
  return (
    <div className="quiz-card">
      <h3 className="quiz-title">{quiz.title}</h3>
      <p className="quiz-sub">{quiz.subtitle}</p>
      {!step && !result && (
        <button className="quiz-start-btn" onClick={() => setStep(quiz.questions[0].id)}>开始自测 →</button>
      )}
      {currentQ && (
        <div className="quiz-question">
          <p className="quiz-q">{currentQ.q}</p>
          <div className="quiz-options">
            <button className="quiz-opt yes" onClick={() => handleAnswer(currentQ.id, 'yes')}>✅ 是</button>
            <button className="quiz-opt no" onClick={() => handleAnswer(currentQ.id, 'no')}>❌ 否</button>
          </div>
        </div>
      )}
      {currentResult && (
        <div className="quiz-result" role="region" aria-live="polite" aria-label="自测结果">
          <span className="qr-icon">{currentResult.icon}</span>
          <h4 className="qr-title">{currentResult.title}</h4>
          <p className="qr-desc">{currentResult.desc}</p>
          <p className="qr-action">👉 {currentResult.action}</p>
          <button className="quiz-restart" onClick={() => { setResult(null); setStep(null) }}>重新测试</button>
        </div>
      )}
    </div>
  )
}

/* ═══════ Error Boundary ═══════ */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("ErrorBoundary caught:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 48, textAlign: "center", fontFamily: "sans-serif" }}>
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>😵 页面出错了</h2>
          <p style={{ color: "#666", marginBottom: 24 }}>抱歉，应用遇到了一个错误。请尝试刷新页面。</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={{ padding: "12px 24px", background: "#3f51b5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 16 }}>
            🔄 刷新页面</button>
        </div>
      );
    }
    return this.props.children;
  }
}



/* ═══════ 政策搜索（对标企查查搜索框）═══════ */
function PolicySearch({ onSwitchTab, variant, onNavigateDim }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [sceneMatch, setSceneMatch] = useState(null)
  const [dailyCount, setDailyCount] = useState(() => {
    try { const d = JSON.parse(localStorage.getItem('search_stats') || '{}'); const today = new Date().toISOString().slice(0,10); return d.date === today ? d.count : 0 } catch { return 0 }
  })
  const [sceneExpanded, setSceneExpanded] = useState(false)
  const FREE_LIMIT = 10

  // Synonym map for better matching
  const SYNONYMS = { '买房': ['购房','房贷','公积金'], '卖房': ['售房','二手房','房产交易'], '换工作': ['跳槽','离职','辞职','灵活就业'], '生娃': ['生育','产假','托育'], '孩子': ['子女','学区','托育'], '退休': ['养老','延迟退休','养老金'], '存钱': ['存款','理财','利率'], '看病': ['医保','医疗','门诊','住院'], '开公司': ['创业','营商环境','小微企业'] }

  const searchTimer = useRef(null)
  const lastCountedQuery = useRef('')

  const doSearch = (q) => {
    setQuery(q)
    // Scene matching
    if (q.trim().length >= 2) {
      const kw = q.toLowerCase()
      const matched = searchScenes.find(s => s.label.toLowerCase().includes(kw) || s.keywords.some(k => k.toLowerCase().includes(kw) || kw.includes(k)))
      setSceneMatch(matched || null)
    } else {
      setSceneMatch(null)
    }
    if (!q.trim()) { setResults(null); setSceneMatch(null); lastCountedQuery.current = ''; return }
    // Debounce: only count and execute after 400ms pause
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => executeSearch(q), 400)
  }

  const executeSearch = (q) => {
    const today = new Date().toISOString().slice(0,10)
    const stats = (() => { try { return JSON.parse(localStorage.getItem('search_stats') || '{}') } catch { return {} } })()
    const count = stats.date === today ? stats.count : 0
    if (count >= FREE_LIMIT && !isPremium()) { setResults([]); return }
    // Only count if query changed significantly (not just added 1 char)
    const normalizedQ = q.trim().toLowerCase()
    if (normalizedQ !== lastCountedQuery.current) {
      localStorage.setItem('search_stats', JSON.stringify({ date: today, count: count + 1 }))
      setDailyCount(count + 1)
      lastCountedQuery.current = normalizedQ
    }

    // Expand query with synonyms
    const kw = q.toLowerCase()
    const synonyms = Object.entries(SYNONYMS).reduce((acc, [key, vals]) => {
      if (kw.includes(key) || vals.some(v => kw.includes(v))) return [...acc, key, ...vals]
      return acc
    }, [])
    const allKw = [...new Set([kw, ...synonyms.map(s => s.toLowerCase())])]
    const res = []
    dimensions.forEach(dim => {
      dim.scores.forEach(p => {
        const pTitle = p.policyName.toLowerCase()
        const pNote = (p.note || '').toLowerCase()
        if (allKw.some(k => pTitle.includes(k) || pNote.includes(k))) {
          res.push({ type: 'policy', dim: dim.key, icon: dim.icon, dimLabel: dim.name, title: p.policyName, desc: p.note, sentiment: p.direction > 0 ? '利好' : p.direction < 0 ? '利空' : '中性', url: p.url, date: p.date })
        }
      })
    })
    newsLianboUpdates.forEach(n => {
      const nTitle = n.title.toLowerCase()
      const nSummary = n.summary.toLowerCase()
      if (allKw.some(k => nTitle.includes(k) || nSummary.includes(k))) {
        const dimMeta = { housing:'🏠', employment:'💼', education:'🎓', pension:'👴', finance:'💰', industry:'🏭' }
        res.push({ type: 'news', dim: n.dim, icon: dimMeta[n.dim] || '📺', dimLabel: '新闻联播', title: n.title, desc: n.summary?.slice(0,60), sentiment: n.sentiment, data: n.data, date: n.date })
      }
    })
    weeklyUpdates.forEach(w => {
      const wText = w.text.toLowerCase()
      if (allKw.some(k => wText.includes(k))) {
        res.push({ type: 'weekly', dim: w.dim, icon: '📡', dimLabel: '本周更新', title: w.text, desc: '', sentiment: w.impact, date: w.date })
      }
    })
    keyFindings.forEach(k2 => {
      const kTitle = k2.title.toLowerCase()
      const kSummary = k2.summary.toLowerCase()
      if (allKw.some(k => kTitle.includes(k) || kSummary.includes(k))) {
        res.push({ type: 'finding', dim: '', icon: '🔑', dimLabel: '关键发现', title: k2.title, desc: k2.summary?.slice(0,60), sentiment: '', url: k2.url })
      }
    })
    specialTopics.forEach(t => {
      const tTitle = t.title.toLowerCase()
      const tSub = t.subtitle.toLowerCase()
      const tTags = t.tags.map(tag => tag.toLowerCase())
      if (allKw.some(k => tTitle.includes(k) || tSub.includes(k) || tTags.some(tag => tag.includes(k)))) {
        res.push({ type: 'topic', dim: '', icon: t.icon, dimLabel: '专题', title: t.title, desc: t.subtitle, sentiment: '' })
      }
    })
    // Sort by relevance: count keyword matches + bonus for policy type
    res.forEach(r => {
      const title = (r.title || '').toLowerCase()
      const desc = (r.desc || '').toLowerCase()
      let score = 0
      allKw.forEach(k => {
        if (title.includes(k)) score += 10
        if (desc.includes(k)) score += 3
      })
      if (r.type === 'policy') score += 5 // prefer policy results
      if (r.sentiment === '利好') score += 2
      r._score = score
    })
    res.sort((a, b) => b._score - a._score)
    setResults(res.slice(0, 20))
  }

  // Search all keywords for a scene
  const doSceneSearch = (scene) => {
    const today = new Date().toISOString().slice(0,10)
    const stats = (() => { try { return JSON.parse(localStorage.getItem('search_stats') || '{}') } catch { return {} } })()
    const count = stats.date === today ? stats.count : 0
    if (count >= FREE_LIMIT && !isPremium()) { setResults([]); setQuery(scene.label); setSceneMatch(scene); return }
    localStorage.setItem('search_stats', JSON.stringify({ date: today, count: count + 1 }))
    setDailyCount(count + 1)

    const res = []
    const seen = new Set()
    scene.keywords.forEach(kw => {
      const k = kw.toLowerCase()
      dimensions.forEach(dim => {
        dim.scores.forEach(p => {
          if (!seen.has(p.policyName) && (p.policyName.toLowerCase().includes(k) || (p.note && p.note.toLowerCase().includes(k)))) {
            seen.add(p.policyName)
            res.push({ type: 'policy', dim: dim.key, icon: dim.icon, dimLabel: dim.name, title: p.policyName, desc: p.note, sentiment: p.direction > 0 ? '利好' : p.direction < 0 ? '利空' : '中性', url: p.url, date: p.date })
          }
        })
      })
      newsLianboUpdates.forEach(n => {
        if (!seen.has(n.title) && (n.title.toLowerCase().includes(k) || n.summary.toLowerCase().includes(k))) {
          seen.add(n.title)
          const dimMeta = { housing:'🏠', employment:'💼', education:'🎓', pension:'👴', finance:'💰', industry:'🏭' }
          res.push({ type: 'news', dim: n.dim, icon: dimMeta[n.dim] || '📺', dimLabel: '新闻联播', title: n.title, desc: n.summary?.slice(0,60), sentiment: n.sentiment, data: n.data, date: n.date })
        }
      })
    })
    setQuery(scene.label)
    setSceneMatch(scene)
    setResults(res.slice(0, 20))
  }

  const sentColor = s => s === '利好' || s === '偏利好' ? 'var(--success)' : s === '利空' || s === '偏利空' ? 'var(--danger)' : 'var(--text-secondary)'

  return (
    <div className={`policy-search ${variant === 'header' ? 'ps-header' : ''}`}>
      <div className="ps-input-wrap">
        <span className="ps-icon">🔍</span>
        <input className="ps-input" aria-label="搜索政策" role="searchbox" type="text" placeholder="搜索政策（如：我要买房、规划养老、个税优化）"
          value={query} onChange={e => doSearch(e.target.value)} />
        {query && <button className="ps-clear" onClick={() => { setQuery(''); setResults(null); setSceneMatch(null) }}>✕</button>}
      </div>
      <div className="ps-hint">
        {isPremium() ? <span>VIP 不限次数</span> : <><span>已搜索 {dailyCount}/{FREE_LIMIT} 次</span>
        {dailyCount >= FREE_LIMIT && <span className="ps-limit">今日免费次数已用完，升级专业版享无限搜索</span>}</>}
      </div>
      {/* Scene match suggestion — show when matched, especially when results are empty */}
      {sceneMatch && (
        <div className="ps-scene-match">
          <span className="ps-scene-label">场景推荐：</span>
          <button className="ps-scene-card" onClick={() => doSceneSearch(sceneMatch)}>
            <span className="psc-icon">{sceneMatch.icon}</span>
            <span className="psc-label">{sceneMatch.label}</span>
            <span className="psc-desc">{sceneMatch.desc}</span>
            <span className="psc-go">查看全部 →</span>
          </button>
        </div>
      )}
      {/* Scene cards (empty state) */}
      {!results && !query && (
        <div className="ps-scenes">
          <div className="ps-hot"><span className="ps-hot-label">热门：</span><span key="公积金" className="ps-hot-tag" onClick={() => doSearch('公积金')}>公积金</span><span key="延迟退休" className="ps-hot-tag" onClick={() => doSearch('延迟退休')}>延迟退休</span><span key="个税" className="ps-hot-tag" onClick={() => doSearch('个税')}>个税</span><span key="利率" className="ps-hot-tag" onClick={() => doSearch('利率')}>利率</span></div>
          <div className="ps-scene-grid">
            <span className="ps-scene-grid-label">场景速查：</span>
            <div className="ps-scene-grid-items">
              {searchScenes.slice(0, 4).map(s => (
                <button key={s.id} className="ps-scene-mini" onClick={() => doSceneSearch(s)}>
                  <span>{s.icon}</span> {s.label}
                </button>
              ))}
              {sceneExpanded && searchScenes.slice(4).map(s => (
                <button key={s.id} className="ps-scene-mini" onClick={() => doSceneSearch(s)}>
                  <span>{s.icon}</span> {s.label}
                </button>
              ))}
              <button className="ps-scene-mini ps-scene-more" onClick={() => setSceneExpanded(e => !e)}>
                {sceneExpanded ? '收起 ⬆' : '更多 ▾'}
              </button>
            </div>
          </div>
        </div>
      )}
      {results && (
        <div className="ps-results">
          {results.length === 0 ? (
            <div className="ps-empty">
              {(dailyCount >= FREE_LIMIT && !isPremium()) ? (
                <div className="ps-limit-reached">
                  <p className="pslr-title">🔒 今日免费搜索次数已用完</p>
                  <p className="pslr-desc">已使用 {dailyCount}/{FREE_LIMIT} 次，升级专业版享无限搜索</p>
                  <button className="pslr-btn" onClick={() => onSwitchTab('dashboard')}>升级专业版 →</button>
                </div>
              ) : (
                <div className="ps-empty-guide">
                  <p>😕 未找到相关政策，试试以下方法：</p>
                  <ul>
                    <li>换个关键词，如「公积金」「限购」「生育」</li>
                    <li>点击下方的<span className="ps-hot-tag" style={{display:'inline',padding:'2px 6px',margin:'0 4px'}}>场景速查</span>快速浏览</li>
                    <li>输入更通用的词，如「买房」而不是「LPR下调」</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="ps-results-header">找到 {results.length} 条结果{sceneMatch ? <span className="ps-results-scene"> · 场景：{sceneMatch.icon} {sceneMatch.label}</span> : null}</div>
              {results.map((r, i) => (
                <div key={i} className="ps-result-item" onClick={() => { if (r.type === 'topic') onSwitchTab('topics'); else if (r.type === 'policy') { onSwitchTab('dimensions'); if (r.dim && onNavigateDim) onNavigateDim(r.dim); } else onSwitchTab('overview') }}>
                  <span className="ps-ri-icon">{r.icon}</span>
                  <div className="ps-ri-body">
                    <div className="ps-ri-title">{r.title}</div>
                    {r.desc && <div className="ps-ri-desc">{r.desc}</div>}
                    <div className="ps-ri-meta">
                      <span className="ps-ri-tag">{r.dimLabel}</span>
                      {r.sentiment && <span className="ps-ri-sent" style={{ color: sentColor(r.sentiment) }}>{r.sentiment}</span>}
                      {r.data && r.data.length > 0 && <span className="ps-ri-data">{r.data[0]}</span>}
                      {r.date && <span className="ps-ri-date">{r.date}</span>}
                    </div>
                  </div>
                  {r.url && <a className="ps-ri-link" href={r.url} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}>↗</a>}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}


/* ═══════ P2: 付费墙 + 升级模态框 ═══════ */
const TIERS = {
  free: { label: '免费版', price: '¥0', features: ['综合指数', '六维度概览', '每日3次搜索', '新闻联播速递'] },
  personal: { label: '个人版', price: '¥99/年', features: ['无限搜索', '完整行动清单', '政策红利账本', 'PDF报告', '关注5个关键词'] },
  pro: { label: '专业版', price: '¥299/年', features: ['个人版全部', '政策监控推送', '关系图谱', '决策模拟全场景', '无限关注'] },
}
function getTier() { return localStorage.getItem('user_tier') || 'free' }
function isPremium() { return getTier() !== 'free' }

function UpgradeModal({ onClose }) {
  const [selected, setSelected] = useState('personal')
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={e => e.stopPropagation()}>
        <h3 className="upgrade-title">🚀 升级策查查</h3>
        <p className="upgrade-sub">解锁全部功能，让政策成为你的决策利器</p>
        <div className="tier-grid">
          {Object.entries(TIERS).filter(([k]) => k !== 'free').map(([key, tier]) => (
            <div key={key} className={`tier-card ${selected === key ? 'tier-selected' : ''}`} onClick={() => setSelected(key)}>
              {key === 'pro' && <span className="tier-badge">推荐</span>}
              <h4>{tier.label}</h4>
              <div className="tier-price">{tier.price}</div>
              <ul className="tier-features">{tier.features.map((f, i) => <li key={i}>✓ {f}</li>)}</ul>
              <button className={`tier-btn ${selected === key ? 'tier-btn-active' : ''}`}
                onClick={() => { localStorage.setItem('user_tier', key); onClose(); window.location.reload(); }}>
                {selected === key ? '选择此方案' : '查看详情'}
              </button>
            </div>
          ))}
        </div>
        <div className="upgrade-guarantee">💡 首月¥1体验 · 随时取消 · 7天无理由退款</div>
        <button className="upgrade-close" onClick={onClose}>暂不升级</button>
      </div>
    </div>
  )
}

function PaywallGate({ feature, children }) {
  const [showUpgrade, setShowUpgrade] = useState(false)
  if (isPremium()) return children
  return (
    <div className="paywall-gate">
      <div className="paywall-blur">{children}</div>
      <div className="paywall-overlay">
        <span className="paywall-lock">🔒</span>
        <span className="paywall-text">{feature}为专业版功能</span>
        <button className="paywall-btn" onClick={() => setShowUpgrade(true)}>升级解锁</button>
      </div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}

/* ═══════ P3: 政策监控 + 推送 ═══════ */
function PolicyMonitor() {
  const [keywords, setKeywords] = useState(() => { try { return JSON.parse(localStorage.getItem('monitor_keywords') || '[]') } catch { return [] } })
  const [input, setInput] = useState('')
  const [alerts, setAlerts] = useState([])
  const tier = getTier()
  const maxKeywords = tier === 'free' ? 3 : tier === 'personal' ? 5 : 99

  const addKeyword = () => {
    const kw = input.trim()
    if (!kw || keywords.includes(kw)) return
    if (keywords.length >= maxKeywords) return
    const next = [...keywords, kw]
    setKeywords(next)
    localStorage.setItem('monitor_keywords', JSON.stringify(next))
    setInput('')
    // Check for matches in newsLianboUpdates
    const matches = newsLianboUpdates.filter(n => n.title.includes(kw) || n.summary?.includes(kw))
    if (matches.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('📺 策查查·监控提醒', { body: `"${kw}"有${matches.length}条相关动态` })
    }
  }
  const removeKeyword = (kw) => {
    const next = keywords.filter(k => k !== kw)
    setKeywords(next)
    localStorage.setItem('monitor_keywords', JSON.stringify(next))
  }
  const requestNotify = () => { if ('Notification' in window) Notification.requestPermission() }

  // Find matching news for each keyword
  const matchedNews = keywords.map(kw => ({
    kw, matches: newsLianboUpdates.filter(n => n.title.includes(kw) || n.summary?.includes(kw)).slice(0, 3)
  })).filter(m => m.matches.length > 0)

  return (
    <div className="monitor-panel">
      <div className="monitor-header">
        <h3>🔔 政策监控</h3>
        <span className="monitor-count">{keywords.length}/{maxKeywords} 关键词</span>
      </div>
      <div className="monitor-input-row">
        <input className="monitor-input" aria-label="输入关注关键词" placeholder="输入关注关键词（如：公积金、利率）" value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addKeyword()} />
        <button className="monitor-add" onClick={addKeyword}>+ 关注</button>
      </div>
      {keywords.length > 0 && (
        <div className="monitor-tags">
          {keywords.map(kw => (
            <span key={kw} className="monitor-tag">{kw}<button className="mt-x" onClick={() => removeKeyword(kw)}>✕</button></span>
          ))}
        </div>
      )}
      {'Notification' in window && Notification.permission !== 'granted' && (
        <button className="monitor-notify-btn" onClick={requestNotify}>🔔 开启浏览器通知</button>
      )}
      {matchedNews.length > 0 && (
        <div className="monitor-alerts">
          <h4>📡 最新动态</h4>
          {matchedNews.map(m => (
            <div key={m.kw} className="monitor-alert-group">
              <span className="mag-kw">🔑 {m.kw}</span>
              {m.matches.map((n, i) => (
                <div key={i} className="mag-item">
                  <span className="mag-date">{n.date}</span>
                  <span className="mag-title">{n.title}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════ P4: 政策关系图谱 ═══════ */
function PolicyGraph() {
  const [selected, setSelected] = useState(null)
  const nodes = [
    { id: 'hukou_shebao', label: '户籍社保脱钩', dim: 'employment', x: 50, y: 30 },
    { id: 'gjj', label: '公积金修订', dim: 'housing', x: 20, y: 60 },
    { id: 'retirement', label: '延迟退休', dim: 'pension', x: 80, y: 25 },
    { id: 'superage', label: '超龄劳动者权益', dim: 'employment', x: 85, y: 55 },
    { id: 'finlaw', label: '金融法', dim: 'finance', x: 50, y: 75 },
    { id: 'deposit', label: '大额存单管理', dim: 'finance', x: 25, y: 90 },
    { id: 'ai_mgmt', label: 'AI管理办法', dim: 'industry', x: 75, y: 80 },
    { id: 'edu_digital', label: '教育数字化', dim: 'education', x: 55, y: 50 },
    { id: 'property_tax', label: '房地产税', dim: 'housing', x: 15, y: 35 },
    { id: 'h7', label: '沪七条松绑', dim: 'housing', x: 35, y: 15 },
    { id: 'birth_subsidy', label: '生育补贴', dim: 'pension', x: 65, y: 10 },
    { id: 'childcare_law', label: '托育服务法', dim: 'education', x: 90, y: 40 },
  ]
  const dimColor = { housing: '#3498db', employment: '#e67e22', education: '#9b59b6', pension: '#e74c3c', finance: '#f1c40f', industry: '#1abc9c' }
  const selectedNode = nodes.find(n => n.id === selected)
  const relatedLinks = crossLinks.filter(l => {
    const n = nodes.find(nd => nd.label.includes(l.from.slice(0,4)) || nd.label.includes(l.to.slice(0,4)))
    return n?.id === selected
  })

  return (
    <div className="policy-graph">
      <h3 className="pg-title">🕸️ 政策关系图谱</h3>
      <p className="pg-sub">点击节点查看政策间的传导关系</p>
      <div className="pg-canvas-wrap">
        <svg viewBox="0 0 100 100" className="pg-svg" role="img" aria-label="政策关系图谱">
          {crossLinks.map((link, i) => {
            const from = nodes.find(n => n.label.includes(link.from.slice(0,4)))
            const to = nodes.find(n => n.label.includes(link.to.slice(0,4)))
            if (!from || !to) return null
            return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="pg-edge" />
          })}
          {nodes.map(n => (
            <g key={n.id} className={`pg-node ${selected === n.id ? 'pg-active' : ''}`} onClick={() => setSelected(selected === n.id ? null : n.id)}>
              <circle cx={n.x} cy={n.y} r={selected === n.id ? 5 : 3.5} fill={dimColor[n.dim]} />
              <text x={n.x} y={n.y - 5} className="pg-label" textAnchor="middle">{n.label}</text>
            </g>
          ))}
        </svg>
      </div>
      {selectedNode && (
        <div className="pg-detail">
          <h4>{selectedNode.label}</h4>
          <div className="pg-detail-dim" style={{ color: dimColor[selectedNode.dim] }}>
            {dimensions.find(d => d.key === selectedNode.dim)?.icon} {dimensions.find(d => d.key === selectedNode.dim)?.name}
          </div>
          {crossLinks.filter(l => l.from.includes(selectedNode.label.slice(0,3)) || l.to.includes(selectedNode.label.slice(0,3))).map((l, i) => (
            <div key={i} className="pg-link-item">
              <span className="pg-link-chain">{l.from} → {l.to}</span>
              <span className="pg-link-note">💡 {l.note}</span>
            </div>
          ))}
        </div>
      )}
      <div className="pg-legend">
        {Object.entries(dimColor).map(([dim, color]) => (
          <span key={dim} className="pg-legend-item"><span className="pg-dot" style={{ background: color }} />{dimensions.find(d => d.key === dim)?.name}</span>
        ))}
      </div>
    </div>
  )
}

/* ═══════ P5: API文档页 ═══════ */
function ApiDocs() {
  const endpoints = [
    { method: 'GET', path: '/api/v1/policies', desc: '获取政策列表', params: 'dimension, region, status' },
    { method: 'GET', path: '/api/v1/impact-score', desc: '计算政策影响指数', params: 'persona, region' },
    { method: 'GET', path: '/api/v1/news', desc: '获取新闻联播政策速递', params: 'date, dimension' },
    { method: 'GET', path: '/api/v1/deadlines', desc: '获取政策截止日期', params: 'persona' },
    { method: 'GET', path: '/api/v1/topics', desc: '获取场景化专题', params: 'persona, region' },
  ]
  return (
    <div className="api-docs">
      <h2 className="section-title">🔌 政策数据 API</h2>
      <p className="api-intro">面向企业客户和开发者，提供结构化政策数据接口。适用于房产中介、金融机构、企业HR、政策研究机构。</p>
      <div className="api-pricing">
        <div className="api-plan"><span className="ap-name">体验版</span><span className="ap-price">免费</span><span className="ap-limit">100次/月</span></div>
        <div className="api-plan"><span className="ap-name">标准版</span><span className="ap-price">¥500/月</span><span className="ap-limit">10,000次/月</span></div>
        <div className="api-plan"><span className="ap-name">企业版</span><span className="ap-price">¥5,000/月</span><span className="ap-limit">无限调用</span></div>
      </div>
      <div className="api-endpoints">
        {endpoints.map((ep, i) => (
          <div key={i} className="api-ep">
            <span className={`api-method api-${ep.method.toLowerCase()}`}>{ep.method}</span>
            <code className="api-path">{ep.path}</code>
            <span className="api-desc">{ep.desc}</span>
            <span className="api-params">参数: {ep.params}</span>
          </div>
        ))}
      </div>
      <div className="api-cta">
        <p>📧 商务合作请联系：<a href="mailto:api@policycompass.app">api@policycompass.app</a></p>
      </div>
    </div>
  )
}

/* ═══════ 新闻联播政策速递 ═══════ */
function NewsLianboPanel() {
  const [expanded, setExpanded] = useState(false)
  const [filter, setFilter] = useState('all')
  const dimMeta = {
    housing: { icon: '🏠', label: '房产' }, employment: { icon: '💼', label: '就业' },
    education: { icon: '🎓', label: '教育' }, pension: { icon: '👴', label: '养老' },
    finance: { icon: '💰', label: '消费' }, industry: { icon: '🏭', label: '行业' },
  }
  const sentColor = { '利好': 'var(--success)', '利空': 'var(--danger)', '中性': 'var(--text-secondary)' }
  const filtered = filter === 'all' ? newsLianboUpdates : newsLianboUpdates.filter(n => n.dim === filter)
  const shown = expanded ? filtered : filtered.slice(0, 6)
  const dims = [...new Set(newsLianboUpdates.map(n => n.dim))]

  return (
    <div className="xwlb-panel">
      <div className="xwlb-header" onClick={() => setExpanded(!expanded)}>
        <span className="xwlb-title">📺 新闻联播·政策速递</span>
        <span className="xwlb-count">{newsLianboUpdates.length}条 · {newsLianboUpdates[0]?.date}~{newsLianboUpdates[newsLianboUpdates.length-1]?.date}</span>
        <span className="xwlb-toggle">{expanded ? '收起 ▲' : '展开 ▼'}</span>
      </div>
      <div className="xwlb-filters">
        <button className={`xwlb-filter ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>全部</button>
        {dims.map(d => (
          <button key={d} className={`xwlb-filter ${filter === d ? 'active' : ''}`} onClick={() => setFilter(d)}>
            {dimMeta[d]?.icon} {dimMeta[d]?.label}
          </button>
        ))}
      </div>
      <div className="xwlb-list">
        {shown.map((item, i) => (
          <div key={i} className="xwlb-item">
            <div className="xwlb-item-top">
              <span className="xwlb-date">{item.date}</span>
              <span className="xwlb-dim-tag">{dimMeta[item.dim]?.icon} {dimMeta[item.dim]?.label}</span>
              <span className="xwlb-sent" style={{ color: sentColor[item.sentiment] }}>{item.sentiment}</span>
            </div>
            <div className="xwlb-item-title">{item.title}</div>
            {item.data?.length > 0 && (
              <div className="xwlb-data">{item.data.map((d, j) => <span key={j} className="xwlb-datum">{d}</span>)}</div>
            )}
            <div className="xwlb-summary">{item.summary}</div>
          </div>
        ))}
      </div>
      {!expanded && filtered.length > 6 && (
        <button className="xwlb-more" onClick={() => setExpanded(true)}>查看全部 {filtered.length} 条 ▼</button>
      )}
    </div>
  )
}

/* ═══════ 政策日历组件 ═══════ */
function PolicyCalendar({ personaKey, compact = false, filterDims = null }) {
  const today = new Date()
  const [stageFilter, setStageFilter] = useState(null)
  const stageLabels = { draft: '征求意见', final: '已发布', active: '进行中' }
  const sorted = [...deadlines].sort((a, b) => new Date(a.date) - new Date(b.date))
  const filtered = sorted.filter(d => {
    if (filterDims && filterDims.length > 0) return d.dims && d.dims.some(dim => filterDims.includes(dim))
    if (personaKey) return d.persona.includes(personaKey)
    return true
  })
  const stageFiltered = stageFilter ? filtered.filter(d => d.stage === stageFilter) : filtered
  const items = compact ? stageFiltered.slice(0, 2) : stageFiltered

  const getDaysLeft = (dateStr) => {
    const d = new Date(dateStr)
    return Math.ceil((d - today) / 86400000)
  }

  const getStatusClass = (days) => {
    if (days < 0) return 'pcal-expired'
    if (days <= 30) return 'pcal-urgent'
    if (days <= 90) return 'pcal-soon'
    return 'pcal-future'
  }

  const getStatusLabel = (days) => {
    if (days < 0) return '已过期'
    if (days === 0) return '今天'
    if (days <= 30) return `${days}天后`
    if (days <= 90) return `${days}天后`
    return `${days}天后`
  }

  if (items.length === 0) return null

  return (
    <div className={`policy-calendar ${compact ? 'pcal-compact' : ''}`}>
      {!compact && (
        <>
          <div className="pcal-stage-tabs">
            <button className={`pcal-stage-tab ${!stageFilter ? 'active' : ''}`} onClick={() => setStageFilter(null)}>全部</button>
            <button className={`pcal-stage-tab ${stageFilter === 'active' ? 'active' : ''}`} onClick={() => setStageFilter('active')}>🔵 进行中</button>
            <button className={`pcal-stage-tab ${stageFilter === 'draft' ? 'active' : ''}`} onClick={() => setStageFilter('draft')}>🟡 征求意见</button>
            <button className={`pcal-stage-tab ${stageFilter === 'final' ? 'active' : ''}`} onClick={() => setStageFilter('final')}>🟢 已发布</button>
          </div>
          <h3 className="pcal-title">📅 政策动态时间线</h3>
        </>
      )}
      <div className="pcal-list">
        {items.map((d, i) => {
          const days = getDaysLeft(d.date)
          const status = getStatusClass(days)
          return (
            <div key={d.id} className={`pcal-item ${status}`}>
              <div className="pcal-date-col">
                <span className="pcal-month">{d.date.slice(5, 7)}月</span>
                <span className="pcal-day">{d.date.slice(8)}</span>
              </div>
              <div className="pcal-info">
                <div className="pcal-label">{!compact && d.stage && <span className={`pcal-stage-badge pcal-sb-${d.stage}`}>{stageLabels[d.stage]}</span>}{d.label}</div>
                <div className="pcal-action">{d.action}</div>
                {!compact && d.dims && (
                  <div className="pcal-dims">{d.dims.map(dim => {
                    const icons = { housing: '🏠', employment: '💼', education: '🎓', elderly: '👴', finance: '💰', industry: '🏭' }
                    return <span key={dim} className="pcal-dim-tag">{icons[dim] || '📋'} {dim}</span>
                  })}</div>
                )}
              </div>
              <span className="pcal-countdown">{getStatusLabel(days)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════ 人生雷达 — 扫描算法 ═══════ */
function runRadarScan(stageKey, currentDims) {
  const stage = lifeRadar.stages.find(s => s.key === stageKey)
  if (!stage) return { opportunities: [], blindSpots: [], risks: [], radarScore: 0, topActions: [], dimScores: {} }

  // 1. 过滤匹配当前 stage 的信号
  const matched = lifeRadar.signals.filter(s => s.stageMatch.includes(stageKey))

  // 2. 按 type 分组
  const opportunities = matched.filter(s => s.type === 'opportunity').sort((a,b) => (b.priority==='high'?1:0) - (a.priority==='high'?1:0))
  const blindSpots = matched.filter(s => s.type === 'blindspot').sort((a,b) => (b.priority==='high'?1:0) - (a.priority==='high'?1:0))
  const risks = matched.filter(s => s.type === 'risk').sort((a,b) => (b.priority==='high'?1:0) - (a.priority==='high'?1:0))

  // 3. 计算各维度得分
  const dimScores = {}
  currentDims.forEach(dim => {
    dimScores[dim.key] = calcDimensionScore(dim)
  })

  // 4. 加权综合分
  let radarScore = 0
  Object.entries(stage.weights).forEach(([dimKey, weight]) => {
    radarScore += (dimScores[dimKey] || 0) * weight
  })
  radarScore = Math.round(radarScore)

  // 5. 从维度中提取高分利好政策作为额外机会
  const extraOpportunities = []
  currentDims.forEach(dim => {
    const w = stage.weights[dim.key] || 0
    if (w >= 0.15) {
      dim.scores.forEach(s => {
        if (s.direction > 0 && s.breadth >= 6) {
          extraOpportunities.push({
            id: 'dim_' + s.policyName,
            type: 'opportunity',
            title: s.policyName,
            desc: s.note,
            priority: s.breadth >= 8 ? 'high' : 'medium',
            dims: [dim.key],
            action: '查看该政策详情',
          })
        }
      })
    }
  })

  // 6. 合并并去重
  const allOpportunities = [...opportunities]
  extraOpportunities.forEach(e => {
    if (!allOpportunities.find(o => o.title.includes(e.title) || e.title.includes(o.title))) {
      allOpportunities.push(e)
    }
  })

  // 7. topActions: 从所有信号中提取，按 priority 排序
  const allSignals = [...matched, ...extraOpportunities]
  const topActions = allSignals
    .sort((a,b) => {
      const pa = a.priority === 'high' ? 3 : a.priority === 'medium' ? 2 : 1
      const pb = b.priority === 'high' ? 3 : b.priority === 'medium' ? 2 : 1
      return pb - pa
    })
    .slice(0, 5)
    .map(s => ({ title: s.action, signalId: s.id, dims: s.dims }))

  return { opportunities: allOpportunities, blindSpots, risks, radarScore, topActions, dimScores }
}

/* ═══════ 雷达图组件 (CSS 六边形) ═══════ */
function RadarChart({ dimScores, weights }) {
  const dimKeys = ['housing', 'employment', 'education', 'elderly', 'finance', 'industry']
  const dimLabels = { housing: '房产', employment: '就业', education: '教育', elderly: '养老', finance: '理财', industry: '行业' }
  const dimIcons = { housing: '🏠', employment: '💼', education: '🎓', elderly: '👴', finance: '💰', industry: '🏭' }
  const size = 220
  const cx = size / 2, cy = size / 2, r = 85

  // 生成六边形顶点
  const getPoint = (i, radius) => {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
  }

  // 雷达网格线
  const gridLevels = [0.25, 0.5, 0.75, 1.0]
  const gridPaths = gridLevels.map(level => {
    const pts = dimKeys.map((_, i) => getPoint(i, r * level))
    return pts.map(p => `${p.x},${p.y}`).join(' ')
  })

  // 数据多边形
  const dataPts = dimKeys.map((key, i) => {
    const score = (dimScores[key] || 0) / 100
    const weight = weights[key] || 0
    // 高权重维度在雷达图中更突出
    const displayScore = Math.min(1, score * (0.6 + weight * 2))
    return getPoint(i, r * displayScore)
  })
  const dataPath = dataPts.map(p => `${p.x},${p.y}`).join(' ')

  // 轴线
  const axes = dimKeys.map((_, i) => {
    const p = getPoint(i, r)
    return { x1: cx, y1: cy, x2: p.x, y2: p.y }
  })

  // 标签位置
  const labels = dimKeys.map((key, i) => {
    const p = getPoint(i, r + 22)
    const weight = weights[key] || 0
    return { x: p.x, y: p.y, key, label: dimLabels[key], icon: dimIcons[key], weight, isHigh: weight >= 0.25 }
  })

  return (
    <div className="radar-chart-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="radar-svg">
        {/* 网格 */}
        {gridPaths.map((path, i) => (
          <polygon key={i} points={path} fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" opacity={0.4 + i * 0.15} />
        ))}
        {/* 轴线 */}
        {axes.map((a, i) => (
          <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="var(--border-subtle)" strokeWidth="0.5" opacity="0.4" />
        ))}
        {/* 数据多边形 */}
        <polygon points={dataPath} fill="rgba(22,119,255,0.15)" stroke="#1677ff" strokeWidth="2" className="radar-polygon" />
        {/* 数据点 */}
        {dataPts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#1677ff" className="radar-dot" />
        ))}
        {/* 扫描动效线 */}
        <line x1={cx} y1={cy} x2={cx} y2={cy - r} stroke="#1677ff" strokeWidth="1" opacity="0.6" className="radar-sweep" />
      </svg>
      {/* 标签 */}
      {labels.map((lb, i) => (
        <div key={i} className={`radar-label ${lb.isHigh ? 'radar-label-high' : ''}`}
          style={{
            left: `${(lb.x / size) * 100}%`,
            top: `${(lb.y / size) * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}>
          <span className="rl-icon">{lb.icon}</span>
          <span className="rl-name">{lb.label}</span>
          <span className="rl-score">{dimScores[lb.key] || 0}</span>
        </div>
      ))}
    </div>
  )
}

/* ═══════ 人生雷达主组件 ═══════ */
function LifeRadar({ currentDims, personaKey, onNavigateDim, onSwitchTab }) {
  const [stageKey, setStageKey] = useState(() => {
    const saved = localStorage.getItem('radar_stage')
    if (saved) return saved
    if (personaKey && lifeRadar.personaStageMap[personaKey]) return lifeRadar.personaStageMap[personaKey]
    return null
  })
  const [scanning, setScanning] = useState(false)
  const [scanDone, setScanDone] = useState(false)
  const [actionsDone, setActionsDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem('radar_actions_done') || '{}') } catch { return {} }
  })
  const [floatText, setFloatText] = useState(null)
  const [dimFilter, setDimFilter] = useState(null)

  const dimOptions = {
    housing: { icon: '🏠', label: '房产' },
    employment: { icon: '💼', label: '就业' },
    education: { icon: '🎓', label: '教育' },
    elderly: { icon: '👴', label: '养老' },
    finance: { icon: '💰', label: '金融' },
    industry: { icon: '🏭', label: '产业' },
  }

  const toggleAction = (e, stageKey, actionIdx, totalActions) => {
    e.stopPropagation()
    const key = stageKey
    const current = actionsDone[key] || []
    const next = current.includes(actionIdx) ? current.filter(i => i !== actionIdx) : [...current, actionIdx]
    const updated = { ...actionsDone, [key]: next }
    setActionsDone(updated)
    localStorage.setItem('radar_actions_done', JSON.stringify(updated))
    // Float text animation
    if (!current.includes(actionIdx)) {
      setFloatText('+1 行动力')
      setTimeout(() => setFloatText(null), 1200)
      // All done celebration
      if (next.length === totalActions) {
        setTimeout(() => { setFloatText('🎉 全部完成！你的政策行动力满分') }, 300)
        setTimeout(() => setFloatText(null), 4000)
      }
    }
  }

  const handleSelectStage = (key) => {
    setStageKey(key)
    localStorage.setItem('radar_stage', key)
    setScanDone(false)
    setScanning(true)
    setTimeout(() => { setScanning(false); setScanDone(true) }, 1500)
  }

  // 如果已经有 stageKey 且还没扫描过，自动扫描
  useEffect(() => {
    if (stageKey && !scanDone && !scanning) {
      setScanning(true)
      setTimeout(() => { setScanning(false); setScanDone(true) }, 1500)
    }
  }, [])

  const result = stageKey ? runRadarScan(stageKey, currentDims) : null
  const currentStage = lifeRadar.stages.find(s => s.key === stageKey)

  // 注入个性化安家信号
  const settlementSaved = (() => { try { return JSON.parse(localStorage.getItem('settlement_data')) } catch { return null } })()
  if (result && settlementSaved && ['young_single','newlywed','young_parent','mid_career'].includes(stageKey)) {
    const s = settlementSaved.report
    if (s?.score && !s.score.pass) {
      result.opportunities.unshift({
        id: 'p_settle_score', type: 'opportunity', dims: ['housing'],
        title: `📍 ${s.city?.name}落户评估：还差${s.score.gap}分达标，建议尽快申请`,
        priority: 'high', desc: `你的评分${s.score.score}/${s.score.passScore}分，重点提升社保年限和学历`,
        action: '打开安家计算器查看提升方案',
      })
    }
    if (s?.qualify && !s.qualify.qualify) {
      result.blindSpots.unshift({
        id: 'p_house_wait', type: 'blindspot', dims: ['housing'],
        title: `⚠️ 距离购房社保要求还差${s.qualify.waitYears}年`,
        priority: 'high', desc: `已缴${s.qualify.haveYears}年，需${s.qualify.needYears}年，跳槽务必注意社保衔接`,
        action: '确保社保连续性',
      })
    }
    if (s?.score?.pass && s?.qualify?.qualify) {
      result.opportunities.unshift({
        id: 'p_settle_ready', type: 'opportunity', dims: ['housing'],
        title: `🎉 你在${s.city?.name}已满足落户和购房条件！`,
        priority: 'high', desc: '政策窗口期可能变化，建议尽快启动办理流程',
        action: '查看安家计算器详细报告',
      })
    }
  }

  // 未选择阶段时的引导页
  if (!stageKey) {
    return (
      <div className="life-radar">
        <div className="radar-intro">
          <h2 className="radar-intro-title">📡 启动你的人生雷达</h2>
          <p className="radar-intro-sub">选择你当前的人生阶段，我会帮你扫描所有政策盲区，找到你该抓住的机会和可能忽略的风险</p>
        </div>
        <div className="radar-stage-grid">
          {lifeRadar.stages.map(s => (
            <button key={s.key} className="radar-stage-card" onClick={() => handleSelectStage(s.key)}>
              <span className="rsc-icon">{s.icon}</span>
              <span className="rsc-label">{s.label}</span>
              <span className="rsc-age">{s.ageRange}岁</span>
              <span className="rsc-desc">{s.desc}</span>
            </button>
          ))}
        </div>
        {personaKey && lifeRadar.personaStageMap[personaKey] && (
          <button className="radar-auto-btn" onClick={() => handleSelectStage(lifeRadar.personaStageMap[personaKey])}>
            ✨ 使用当前身份（{personas.find(p => p.key === personaKey)?.label}）自动扫描
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="life-radar">
      {/* 阶段选择器 */}
      <div className="radar-stage-bar">
        {lifeRadar.stages.map(s => (
          <button key={s.key}
            className={`rsb-btn ${stageKey === s.key ? 'active' : ''}`}
            onClick={() => handleSelectStage(s.key)}>
            <span className="rsb-icon">{s.icon}</span>
            <span className="rsb-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* 扫描动效 */}
      {scanning && (
        <div className="radar-scanning">
          <div className="radar-scanning-ring">
            <div className="radar-scanning-sweep" />
          </div>
          <p className="radar-scanning-text">正在扫描「{currentStage?.label}」相关的政策信号...</p>
        </div>
      )}

      {/* 扫描结果 */}
      {scanDone && result && (
        <div className="radar-result">
          {/* 雷达图 + 综合分 */}
          <section className="radar-chart-section">
            <h3 className="radar-chart-title">{currentStage?.icon} {currentStage?.label} · 政策影响力雷达</h3>
            <div className="radar-chart-area">
              <RadarChart dimScores={result.dimScores} weights={currentStage?.weights || {}} />
              <div className="radar-score-badge">
                <span className="rsb-value" style={{ color: getIndexLevel(result.radarScore).color }}>{result.radarScore}</span>
                <span className="rsb-unit">/100</span>
                <span className="rsb-level" style={{ color: getIndexLevel(result.radarScore).color }}>
                  {getIndexLevel(result.radarScore).icon} {getIndexLevel(result.radarScore).label}
                </span>
              </div>
            </div>
          </section>

          {/* 维度筛选标签 */}
          {(() => {
            const allSignals = [...result.opportunities, ...result.blindSpots, ...result.risks]
            const allDims = [...new Set(allSignals.flatMap(s => s.dims || []))]
            const filteredCount = dimFilter ? allSignals.filter(s => (s.dims || []).includes(dimFilter)).length : allSignals.length
            return allDims.length > 1 ? (
              <section className="radar-section radar-dim-filter">
                <div className="rdf-tabs">
                  <button className={`rdf-tab ${!dimFilter ? 'active' : ''}`} onClick={() => setDimFilter(null)}>
                    全部 <span className="rdf-count">{allSignals.length}</span>
                  </button>
                  {allDims.map(dk => dimOptions[dk] && (
                    <button key={dk} className={`rdf-tab ${dimFilter === dk ? 'active' : ''}`} onClick={() => setDimFilter(dk)}>
                      {dimOptions[dk].icon} {dimOptions[dk].label} <span className="rdf-count">{allSignals.filter(s => (s.dims || []).includes(dk)).length}</span>
                    </button>
                  ))}
                </div>
                {dimFilter && <p className="rdf-hint">显示 {dimOptions[dimFilter]?.icon} {dimOptions[dimFilter]?.label} 相关信号 {filteredCount} 条</p>}
              </section>
            ) : null
          })()}

          {/* 机会区 */}
          {(() => {
            const items = dimFilter ? result.opportunities.filter(s => (s.dims || []).includes(dimFilter)) : result.opportunities
            return items.length > 0 ? (
            <section className="radar-section radar-opportunity">
              <h3 className="radar-section-title"><span className="rst-icon">✅</span> 机会区 · 你该抓住的政策红利</h3>
              <div className="radar-signal-list">
                {items.map((s, i) => (
                  <div key={s.id || i} className={`radar-signal-card ${s.priority === 'high' ? 'signal-high' : ''}`}
                    onClick={() => s.dims?.[0] && onNavigateDim(s.dims[0])}>
                    <div className="rsc-header">
                      <span className="rsc-title">{s.title}</span>
                      {s.priority === 'high' && <span className="rsc-priority">重要</span>}
                    </div>
                    <p className="rsc-desc">{s.desc}</p>
                    <div className="rsc-action">→ {s.action}</div>
                  </div>
                ))}
              </div>
            </section>
          ) : null})()}

          {/* 盲区警告 */}
          {(() => {
            const items = dimFilter ? result.blindSpots.filter(s => (s.dims || []).includes(dimFilter)) : result.blindSpots
            return items.length > 0 ? (
              <section className="radar-section radar-blindspot">
                <h3 className="radar-section-title"><span className="rst-icon">⚠️</span> 盲区警告 · 你可能忽略的重要政策</h3>
                <div className="radar-signal-list">
                  {items.map((s, i) => (
                    <div key={s.id || i} className={`radar-signal-card ${s.priority === 'high' ? 'signal-high' : ''}`}
                      onClick={() => s.dims?.[0] && onNavigateDim(s.dims[0])}>
                      <div className="rsc-header">
                        <span className="rsc-title">{s.title}</span>
                        {s.priority === 'high' && <span className="rsc-priority">重要</span>}
                      </div>
                      <p className="rsc-desc">{s.desc}</p>
                      <div className="rsc-action">→ {s.action}</div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null})()}

          {/* 风险提醒 */}
          {(() => {
            const items = dimFilter ? result.risks.filter(s => (s.dims || []).includes(dimFilter)) : result.risks
            return items.length > 0 ? (
              <section className="radar-section radar-risk">
                <h3 className="radar-section-title"><span className="rst-icon">🔴</span> 风险提醒 · 对你不利的政策变化</h3>
                <div className="radar-signal-list">
                  {items.map((s, i) => (
                    <div key={s.id || i} className={`radar-signal-card ${s.priority === 'high' ? 'signal-high' : ''}`}
                      onClick={() => s.dims?.[0] && onNavigateDim(s.dims[0])}>
                      <div className="rsc-header">
                        <span className="rsc-title">{s.title}</span>
                        {s.priority === 'high' && <span className="rsc-priority">重要</span>}
                      </div>
                      <p className="rsc-desc">{s.desc}</p>
                      <div className="rsc-action">→ {s.action}</div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null})()}

          {/* 行动清单 */}
          {result.topActions.length > 0 && (() => {
            const doneList = actionsDone[stageKey] || []
            const total = result.topActions.length
            const doneCount = doneList.filter(i => i < total).length
            const pct = Math.round((doneCount / total) * 100)
            const barColor = pct === 100 ? '#27ae60' : pct >= 60 ? '#e67e22' : '#e74c3c'
            return (
              <section className="radar-section radar-action" style={{ position: 'relative' }}>
                <h3 className="radar-section-title"><span className="rst-icon">📝</span> 你的行动清单</h3>
                <div className="radar-action-progress">
                  <div className="rap-bar"><div className="rap-fill" style={{ width: pct + '%', background: barColor }} /></div>
                  <span className="rap-text">已完成 {doneCount}/{total}</span>
                </div>
                {floatText && <div className="radar-float-text">{floatText}</div>}
                <div className="radar-action-list">
                  {result.topActions.map((a, i) => {
                    const isDone = doneList.includes(i)
                    return (
                      <div key={i} className={`radar-action-item ${isDone ? 'rai-done' : ''}`} onClick={() => {
                        if (!isDone && (a.dims?.[0])) onNavigateDim(a.dims[0])
                        else if (!isDone) onSwitchTab('tools')
                      }}>
                        <button className="rai-check" onClick={(e) => toggleAction(e, stageKey, i, total)}>
                          {isDone ? '✅' : <span className="rai-circle" />}
                        </button>
                        <span className="rai-num">{i + 1}</span>
                        <span className="rai-text">{a.title}</span>
                        {!isDone && <span className="rai-arrow">去做 →</span>}
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })()}

          {/* 盲区提示 */}
          {currentStage?.blindSpotHints && (
            <section className="radar-section radar-hints">
              <h3 className="radar-section-title"><span className="rst-icon">💡</span> 你可能不知道的</h3>
              <div className="radar-hints-list">
                {currentStage.blindSpotHints.map((h, i) => (
                  <div key={i} className="radar-hint-item">· {h}</div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

/* ═══════ SmartRecommendations: 首页智能推荐区 ═══════ */
function SmartRecommendations({ personaKey, regionKey, userCity, userAge, onSwitchTab, onNavigateDim }) {
  const [recs, setRecs] = useState([])
  const [reasonTags, setReasonTags] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 读取浏览历史
    let viewHistory = []
    try { viewHistory = JSON.parse(localStorage.getItem('view_history') || '[]') } catch {}
    // 读取安家数据
    let settlementData = null
    try { settlementData = JSON.parse(localStorage.getItem('settlement_data')) } catch {}
    const params = { personaKey, city: userCity, regionKey, age: userAge, viewHistory, settlementData }
    const result = getSmartRecommendations(params)
    setRecs(result)
    // 拆解推荐原因为标签
    const persona = personas.find(p => p.key === personaKey)
    const tags = []
    if (persona) tags.push(persona.label)
    if (userCity) tags.push(userCity.replace(/市$/, ''))
    if (viewHistory.length > 0) tags.push(`${viewHistory.length}条浏览`)
    setReasonTags(tags)
    setLoading(false)
  }, [personaKey, userCity, regionKey, userAge])

  const sentColor = s => s === '利好' ? 'var(--success)' : s === '利空' ? 'var(--danger)' : 'var(--text-secondary)'

  if (loading) {
    return (
      <div className="smart-rec">
        <div className="sr-loading">正在为你梳理相关政策…</div>
      </div>
    )
  }

  if (recs.length === 0) return null

  return (
    <div className="smart-rec">
      <div className="sr-header">
        <h3 className="sr-title">🎯 为你推荐</h3>
        <div className="sr-tags">
          {reasonTags.map((t, i) => <span key={i} className="sr-tag">{t}</span>)}
        </div>
      </div>
      <div className="sr-list">
        {recs.map((r, i) => (
          <div key={i} className="sr-item" onClick={() => { onNavigateDim?.(r.dim); onSwitchTab?.('dimensions') }}>
            <span className="sr-rank">{i + 1}</span>
            <span className="sr-icon">{r.dimIcon}</span>
            <div className="sr-body">
              <div className="sr-name">{r.title}</div>
              {r.note && <div className="sr-note">{r.note.slice(0, 40)}{r.note.length > 40 ? '…' : ''}</div>}
              <div className="sr-meta">
                <span className="sr-dim">{r.dimName}</span>
                <span className="sr-sent" style={{ color: sentColor(r.sentiment) }}>{r.sentiment}</span>
              </div>
            </div>
            <span className="sr-go">→</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDim, setSelectedDim] = useState(null)
  const [personaKey, setPersonaKey] = useState(() => localStorage.getItem('persona') || null)
  const [regionKey, setRegionKey] = useState(() => localStorage.getItem('region') || 'national')
  const [showModal, setShowModal] = useState(!personaKey && !sessionStorage.getItem('skipped'))
  const [showShare, setShowShare] = useState(false)
  const [expandedRationale, setExpandedRationale] = useState(null)
  const [userCity, setUserCity] = useState(() => localStorage.getItem('user_city') || '')
  const [userAge, setUserAge] = useState(() => { const a = localStorage.getItem('user_age'); return a ? +a : null })
  const [cityDetected, setCityDetected] = useState(false)
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bookmarks') || '[]') } catch { return [] }
  })
  const [tabKey, setTabKey] = useState(0)
  const [ringValue, setRingValue] = useState(0)
  const [msFilterDim, setMsFilterDim] = useState(null)
  const [topicSearch, setTopicSearch] = useState('')
  const [darkMode, setDarkMode] = useState(() => { try { return localStorage.getItem('theme') === 'dark' } catch { return false } })
  useEffect(() => { document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : ''); localStorage.setItem('theme', darkMode ? 'dark' : 'light') }, [darkMode])
  const [showTour, setShowTour] = useState(() => !sessionStorage.getItem("tour_done"))
  const [showReport, setShowReport] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [policyDetail, setPolicyDetail] = useState(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [headerShadow, setHeaderShadow] = useState(false)
  useEffect(() => {
    const onScroll = () => setHeaderShadow(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => { if (!moreOpen) return; const handler = () => setMoreOpen(false); document.addEventListener('click', handler); return () => document.removeEventListener('click', handler); }, [moreOpen])
  // Track visits
  useEffect(() => {
    try {
      const stats = JSON.parse(localStorage.getItem("visit_stats") || "{}")
      const today = new Date().toISOString().slice(0, 10)
      if (stats.lastDate !== today) { stats.count = (stats.count || 0) + 1; stats.lastDate = today; localStorage.setItem("visit_stats", JSON.stringify(stats)) }
    } catch {}
  }, [])

  // Region-aware data
  const currentRegion = regions.find(r => r.key === regionKey) || regions[0]
  const currentDims = getDimensionsForRegion(regionKey)
  const totalPolicies = currentDims.reduce((a, d) => a + d.scores.length, 0)

  const overallIndex = calcOverallIndex(personaKey, regionKey)
  const doneActions = (() => { try { return JSON.parse(localStorage.getItem("action_progress") || "{}") } catch { return {} } })()[personaKey] || []
  const overallLevel = getIndexLevel(overallIndex)
  const currentPersona = personas.find(p => p.key === personaKey)

  // Ring chart fill animation
  useEffect(() => {
    let frame = 0
    const target = overallIndex
    setRingValue(0)
    const start = performance.now()
    const duration = 800
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setRingValue(Math.round(target * ease))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [overallIndex])

  const sortedDims = useMemo(() => currentPersona
    ? [...currentDims].sort((a, b) => (currentPersona.weights[b.key] ?? 0) - (currentPersona.weights[a.key] ?? 0))
    : currentDims, [currentPersona, currentDims])
  const topDimKeys = currentPersona ? sortedDims.slice(0, 2).map(d => d.key) : []

  const handlePersonaSelect = (key) => {
    setPersonaKey(key); localStorage.setItem('persona', key); setShowModal(false)
  }
  const handleSkip = () => { sessionStorage.setItem('skipped', '1'); setShowModal(false) }
  const handleRegionChange = (key) => {
    setRegionKey(key); localStorage.setItem('region', key); setSelectedDim(null); setTabKey(k => k + 1)
  }

  // IP自动定位用户城市
  useEffect(() => {
    if (userCity) { setCityDetected(true); return } // 已有缓存
    let cancelled = false
    detectUserCity().then(result => {
      if (cancelled || !result) { setCityDetected(true); return }
      const { city, region } = result
      localStorage.setItem('user_city', city)
      if (region) localStorage.setItem('user_region', region)
      setUserCity(city)
      // 自动匹配区域
      const autoRegion = cityToRegion(city)
      if (autoRegion !== 'national' && autoRegion !== regionKey) {
        setRegionKey(autoRegion)
        localStorage.setItem('region', autoRegion)
      }
      setCityDetected(true)
    })
    return () => { cancelled = true }
  }, []) // eslint-disable-line

  const switchTab = useCallback((k) => {
    setActiveTab(k)
    if (k === 'dimensions' && !selectedDim) setSelectedDim(currentDims[0]?.key || null)
    else setSelectedDim(null)
    setTabKey(prev => prev + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedDim, currentDims])

  const toggleBookmark = useCallback((policyName) => {
    setBookmarks(prev => {
      const next = prev.includes(policyName) ? prev.filter(n => n !== policyName) : [...prev, policyName]
      localStorage.setItem('bookmarks', JSON.stringify(next)); return next
    })
  }, [])

  const filteredFindings = useMemo(() => keyFindings.filter(f => {
    const personaMatch = !currentPersona || f.persona.includes(personaKey)
    const regionMatch = !f.region || f.region === regionKey || regionKey === 'national'
    return personaMatch && regionMatch
  }), [currentPersona, personaKey, regionKey])

  return (
    <ErrorBoundary>
      {showTour && <OnboardingTour onClose={() => setShowTour(false)} />}
    <div className="app">
      {showModal && <PersonaModal onSelect={handlePersonaSelect} onSkip={handleSkip} />}
      {showShare && <Suspense fallback={null}><ShareCard personaKey={personaKey} regionKey={regionKey} onClose={() => setShowShare(false)} /></Suspense>}
      {showReport && <ReportExport personaKey={personaKey} regionKey={regionKey} onClose={() => setShowReport(false)} />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      <BackToTop />

      <header className={`header${headerShadow ? ' header-shadow' : ''}`}>
        <div className="header-inner">
          <div className="logo-area">
            <span className="logo-icon">🧭</span>
            <h1 className="logo-title">策查查</h1>
          </div>
          {activeTab !== 'overview' && (
            <div className="header-search">
              <PolicySearch onSwitchTab={(tab) => { setActiveTab(tab); setTabKey(k => k+1); window.scrollTo({top:0,behavior:"smooth"}) }} variant="header" onNavigateDim={(key) => { setSelectedDim(key); setTabKey(k=>k+1) }} />
            </div>
          )}
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} title={darkMode ? '切换亮色模式' : '切换暗黑模式'}>{darkMode ? '☀️' : '🌙'}</button>
            {currentPersona && (
              <button className="persona-chip" onClick={() => { localStorage.removeItem('persona'); setPersonaKey(null); setShowModal(true); sessionStorage.removeItem('skipped') }}>
                {currentPersona.icon} {currentPersona.label}<span className="chip-x">✕</span>
              </button>
            )}
            {!isPremium() && <button className="upgrade-btn" onClick={() => setShowUpgrade(true)}>⭐</button>}
            <button className="icon-btn" onClick={() => setShowReport(true)} title="下载报告">📄</button>
            <button className="icon-btn" onClick={() => setShowShare(true)} title="分享">📤</button>
          </div>
        </div>
      </header>

      <nav className="tabs" role="tablist" aria-label="主导航">
        {[['overview','🏠 首页'],['radar','📡 雷达'],['dimensions','📋 政策库'],['tools','🧮 工具箱'],['topics','🎯 专题'],['dashboard','👤 我的']].map(([k, label]) => (
          <button key={k} className={`tab ${activeTab===k?'active':''}`} role="tab" aria-selected={activeTab===k} onClick={() => switchTab(k)}>{label}</button>
        ))}
        <div className="tab-more-wrap">
          <button className={`tab tab-more ${['methodology','graph','api','monitor','about'].includes(activeTab)?'active':''}`} onClick={(e) => { e.stopPropagation(); setMoreOpen(!moreOpen); }}>⋯ 更多</button>
          {moreOpen && (
            <div className="tab-dropdown">
              {[['monitor','🔔 监控'],['methodology','🔬 方法论'],['graph','🕸️ 图谱'],['api','🔌 API'],['about','🧭 关于']].map(([k, label]) => (
                <button key={k} className={`tab-drop-item ${activeTab===k?'active':''}`} onClick={() => { switchTab(k); setMoreOpen(false); }}>{label}</button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="main">

        {/* ════════ OVERVIEW ════════ */}
        {activeTab === 'overview' && (
          <div className="overview">
            <section className="hero-search">
              <h2 className="hero-title">读懂政策，做对决策</h2>
              <p className="hero-sub">覆盖房产、就业、教育、养老、消费、行业六大维度，{totalPolicies}条权威政策实时解读</p>
              <div className="hero-search-box">
                <PolicySearch onSwitchTab={(tab) => { setActiveTab(tab); setTabKey(k => k+1); window.scrollTo({top:0,behavior:"smooth"}) }} variant="hero" onNavigateDim={(key) => { setSelectedDim(key); setTabKey(k=>k+1) }} />
              </div>
            </section>

            <PolicyStatsBar totalPolicies={totalPolicies} />
            
            <SmartRecommendations 
              personaKey={personaKey} 
              regionKey={regionKey} 
              userCity={userCity} 
              userAge={userAge}
              onSwitchTab={(tab) => { setActiveTab(tab); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:'smooth'}) }}
              onNavigateDim={(key) => { setSelectedDim(key); setTabKey(k=>k+1) }}
            />

            <RegionSelector value={regionKey} onChange={handleRegionChange} />

            <RegionCompare personaKey={personaKey} currentRegion={regionKey} onSelectRegion={handleRegionChange} />

            <TestimonialWall />

            <section className="overview-dims">
              <h2 className="section-title">政策影响力总览</h2>
              <div className="overview-quick-stats">
                {sortedDims.map(dim => {
                  const idx = calcDimensionScore(dim)
                  const lvl = getIndexLevel(idx)
                  return (
                    <div key={dim.key} className="quick-stat" onClick={() => { setActiveTab('dimensions'); setSelectedDim(dim.key); setTabKey(k=>k+1) }} style={{ cursor: 'pointer' }}>
                      <span className="qs-icon">{dim.icon}</span>
                      <span className="qs-value" style={{ color: lvl.color }}><AnimatedCounter target={idx} /></span>
                      <span className="qs-label">{dim.name}</span>
                      <span className="qs-level" style={{ color: lvl.color }}>{lvl.label}</span>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="overview-summary">
              <div className="summary-top">
                <span className="summary-score" style={{ color: overallLevel.color }}>{overallIndex}</span>
                <span className="summary-unit">/100 · {overallLevel.icon} {overallLevel.label}</span>
              </div>
              <p className="summary-plain">💬 {overallLevel.plain}</p>
              {!currentPersona && (
                <button className="summary-persona-btn" onClick={() => setShowModal(true)}>👤 选择我的身份，查看专属分析</button>
              )}
            </section>

            <section className="overview-hot">
              <h2 className="section-title">📡 本周热点政策</h2>
              <div className="hot-list">
                {weeklyUpdates.slice(0, 4).map((u, i) => (
                  <div key={i} className="hot-item" onClick={() => { setActiveTab('dimensions'); setSelectedDim(u.dim); setTabKey(k=>k+1) }}>
                    <span className="hot-date">{u.date.slice(5)}</span>
                    <span className={['hot-tag', 'tag-' + (u.impact === '偏利好' ? 'good' : u.impact === '中性' ? 'neutral' : 'bad')].join(' ')}>{u.impact}</span>
                    <span className="hot-text">{u.text}</span>
                    <span className="hot-arrow">→</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="overview-radar-entry" onClick={() => { setActiveTab('radar'); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:'smooth'}) }}>
              <div className="ore-content">
                <span className="ore-icon">📡</span>
                <div className="ore-text">
                  <h3 className="ore-title">人生雷达</h3>
                  <p className="ore-desc">扫描你的人生阶段，发现政策机会和盲区</p>
                </div>
              </div>
              <span className="ore-arrow">开启扫描 →</span>
            </section>

            <PolicyCalendar personaKey={personaKey} />
          </div>
        )}
        {/* ════════ 人生雷达 ════════ */}
        {activeTab === 'radar' && (
          <LifeRadar currentDims={currentDims} personaKey={personaKey}
            onNavigateDim={(key) => { setActiveTab('dimensions'); setSelectedDim(key); setTabKey(k=>k+1) }}
            onSwitchTab={(tab) => { setActiveTab(tab); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:'smooth'}) }} />
        )}
        {/* ════════ DIMENSIONS — 列表浏览模式 ════════ */}
        {activeTab === 'dimensions' && (
          <div className="dimensions-page">
            <WeeklyUpdateBar />
            <div className="dim-pills">
              {currentDims.map(dim => (
                <button key={dim.key}
                  className={'pill-btn dim-pill' + (selectedDim===dim.key?' active':'')}
                  style={selectedDim===dim.key ? { background: dim.color, borderColor: dim.color } : {}}
                  onClick={() => setSelectedDim(dim.key)}>
                  {dim.icon} {dim.name}
                </button>
              ))}
            </div>

            {currentDims.filter(d => !selectedDim || d.key===selectedDim).map(dim => {
              const idx = calcDimensionScore(dim)
              const lvl = getIndexLevel(idx)
              return (
                <section key={dim.key} className="dim-section">
                  <div className="dim-section-header">
                    <span className="ds-icon">{dim.icon}</span>
                    <div className="ds-info">
                      <h3>{dim.name}</h3>
                      <p>{dim.subtitle}</p>
                    </div>
                    <div className="ds-score" style={{ color: lvl.color }}>
                      <span className="ds-score-num">{idx}</span>
                      <span className="ds-score-label">{lvl.label}</span>
                    </div>
                  </div>
                  <p className="dim-plain-text">💬 {dim.plainSummary}</p>
                  <Timeline dimKey={dim.key} />

                  <div className="policy-list">
                    <h4>📌 相关政策 ({dim.scores.length}条)</h4>
                    {dim.scores.map((s, i) => {
                      const dirLabel = s.direction > 0 ? '利好' : s.direction < 0 ? '利空' : '中性'
                      const dirColor = s.direction > 0 ? 'var(--success)' : s.direction < 0 ? 'var(--error)' : 'var(--text-muted)'
                      return (
                        <div key={i} className="policy-list-item"
                          onClick={() => {
                                                      setPolicyDetail({ ...s, dimName: dim.name, dimIcon: dim.icon, dimColor: dim.color, dimKey: dim.key })
                                                      try {
                                                        const hist = JSON.parse(localStorage.getItem('view_history') || '[]')
                                                        const entry = { policyName: s.policyName, dim: dim.key, dimName: dim.name, timestamp: Date.now() }
                                                        const filtered = hist.filter(h => h.policyName !== s.policyName)
                                                        filtered.unshift(entry)
                                                        localStorage.setItem('view_history', JSON.stringify(filtered.slice(0, 50)))
                                                      } catch {}
                                                    }}>
                          <span className="pl-name">{s.policyName}</span>
                          <span className="pl-dir" style={{ color: dirColor }}>{dirLabel}</span>
                          <span className="pl-conf">{s.confidence}</span>
                          <span className="pl-note">{s.note}</span>
                          <span className="pl-arrow">→</span>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}

            <NewsLianboPanel />
            <LegislativeOutlook regionKey={regionKey} personaKey={personaKey} />
          </div>
        )}

        {/* ════════ POLICY DETAIL ════════ */}
        {policyDetail && (
          <div className="policy-detail-overlay" onClick={() => setPolicyDetail(null)}>
            <div className="policy-detail-panel" onClick={e => e.stopPropagation()}>
              <button className="pd-close" onClick={() => setPolicyDetail(null)}>✕</button>
              <div className="pd-header">
                <span className="pd-dim" style={{ color: policyDetail.dimColor }}>{policyDetail.dimIcon} {policyDetail.dimName}</span>
                <span className="pd-conf">{policyDetail.confidence}</span>
              </div>
              <h2 className="pd-title">
                {policyDetail.url ? <a href={policyDetail.url} target="_blank" rel="noopener noreferrer">{policyDetail.policyName} ↗</a> : policyDetail.policyName}
              </h2>
              <div className="pd-scores">
                <div className="pd-score-item">
                  <span className="pds-label">影响广度</span>
                  <RatingBar value={policyDetail.breadth} color="#1677ff" />
                </div>
                <div className="pd-score-item">
                  <span className="pds-label">深远程度</span>
                  <RatingBar value={policyDetail.depth} color="#722ed1" />
                </div>
                <div className="pd-score-item">
                  <span className="pds-label">影响方向</span>
                  <span style={{ color: policyDetail.direction > 0 ? 'var(--success)' : policyDetail.direction < 0 ? 'var(--error)' : 'var(--text-muted)', fontWeight: 700 }}>
                    {policyDetail.direction > 0 ? '利好' : policyDetail.direction < 0 ? '利空' : '中性'}
                  </span>
                </div>
              </div>
              <div className="pd-note">
                <h4>📋 政策摘要</h4>
                <p>{policyDetail.note}</p>
              </div>
              {policyDetail.rationale && (
                <div className="pd-rationale">
                  <h4>📐 评分依据</h4>
                  <p>{policyDetail.rationale}</p>
                </div>
              )}
              <div className="pd-actions">
                <button className="btn-primary" onClick={() => { setPolicyDetail(null); setActiveTab('dimensions'); setSelectedDim(policyDetail.dimKey); setTabKey(k=>k+1) }}>
                  查看「{policyDetail.dimName}」全部政策
                </button>
                <button className="btn-secondary" onClick={() => setPolicyDetail(null)}>关闭</button>
              </div>
            </div>
          </div>
        )}
        {/* ════════ TOOLS ════════ */}
        {activeTab === 'tools' && <Suspense fallback={<div style={{padding:40,textAlign:'center',color:'var(--text-secondary)'}}>加载中...</div>}><Tools regionKey={regionKey} toolParams={regionToolParams[regionKey] || regionToolParams.national} onNavigateDim={(key) => { setActiveTab('dimensions'); setSelectedDim(key); setTabKey(k=>k+1) }} /></Suspense>}

        {/* ════════ TOPICS ════════ */}
        {activeTab === 'topics' && (
          <div className="topics-page">
            <h2 className="section-title">🎯 场景化专题</h2>
            
            {/* Policy Milestones Timeline */}
            <div className="topic-search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" className="topic-search-input" placeholder="搜索专题（如：租房、医保、个税…）"
                value={topicSearch} onChange={e => setTopicSearch(e.target.value)} />
              {topicSearch && <button className="search-clear" onClick={() => setTopicSearch('')}>✕</button>}
            </div>
            <div className="milestones-section">
              <div className="milestones-title">📜 政策演变里程碑 <span style={{fontSize:'0.8rem',color:'var(--text-muted)',fontWeight:400}}>（2020-2026 影响你我生活的关键转折）</span></div>
              <div className="ms-filter-pills">
                {[{k:null,l:'全部'},{k:'housing',l:'🏠住房'},{k:'employment',l:'💼就业'},{k:'education',l:'🎓教育'},{k:'elderly',l:'👴养老'},{k:'finance',l:'💰金融'},{k:'industry',l:'🏭产业'}].map(f => (
                  <button key={f.k||'all'} className={`ms-pill ${msFilterDim===f.k?'active':''}`} onClick={()=>setMsFilterDim(f.k)}>{f.l}</button>
                ))}
              </div>
              <div className="milestones-track">
                {(msFilterDim ? policyMilestones.filter(m => m.dims.includes(msFilterDim)) : policyMilestones).map((m, i) => (
                  <div key={i} className={`milestone-item ms-${m.impact}`}>
                    <div className="ms-date">{m.year}.{m.month}</div>
                    <div className="ms-title">{m.title}</div>
                    <div className="ms-summary">{m.summary}</div>
                    <div className="ms-dims">{m.dims.map(d => <span key={d} className="ms-dim-tag">{d}</span>)}</div>
                  </div>
                ))}
              </div>
            </div>

            <p className="topics-intro">将多个维度的政策串联起来，针对具体生活场景提供完整决策指南</p>
            {specialTopics.filter(t => { if (!topicSearch) return true; const q = topicSearch.toLowerCase(); return t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q) || (t.tags && t.tags.some(tag => tag.includes(q))); }).map(topic => (
              topic.hukouPaths
                ? <SpecialTopicView key={topic.id} topic={topic} personaKey={personaKey} />
                : <GenericTopicView key={topic.id} topic={topic} />
            ))}

            <DecisionSimulator />

            {/* Policy Glossary */}
            <div className="glossary-section">
              <div className="glossary-title">📖 政策术语速查 <span style={{fontSize:'0.8rem',color:'var(--text-muted)',fontWeight:400}}>（20个关键词帮你读懂政策）</span></div>
              <div className="glossary-grid">
                {policyGlossary.map((g, i) => (
                  <div key={i} className="glossary-item">
                    <span className="glossary-term">{g.term}</span>
                    <span className="glossary-def">{g.definition}</span>
                    <div className="glossary-dims">{g.dims.map(d => <span key={d} className="ms-dim-tag">{d}</span>)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="topics-coming">
              <span className="coming-icon">🚀</span>
              <span>更多专题正在规划中：长三角跨省生活手册 | 长期护理保险 | 新业态从业者权益保障</span>
            </div>
          </div>
        )}

        {/* ════════ METHODOLOGY ════════ */}
        {activeTab === 'methodology' && (
          <div className="methodology-page">
            <h2 className="section-title">🔬 评估方法论 v{methodology.version}</h2>
            <div className="meth-summary-card">
              <h3>⚡ 30秒理解我们的方法论</h3>
              <div className="meth-summary-grid">
                <div className="meth-summary-item"><span className="ms-num">5</span><span className="ms-label">个评分因子</span></div>
                <div className="meth-summary-item"><span className="ms-num">6</span><span className="ms-label">大生活维度</span></div>
                <div className="meth-summary-item"><span className="ms-num">{totalPolicies}</span><span className="ms-label">条权威政策</span></div>
                <div className="meth-summary-item"><span className="ms-num">3</span><span className="ms-label">大国际框架</span></div>
              </div>
              <p className="ms-desc">我们融合 OECD 监管影响评估、PEST 宏观分析和利益相关者矩阵三套国际方法，
                对每条政策从"影响广度×深远程度×方向×确定性×时效"五个维度打分，生成 0-100 的影响力指数。
                {regionKey !== 'national' && <>当前展示 <b>{currentRegion.name}</b> 区域视角，综合国家政策和区域政策。</>}</p>
            </div>

            <Collapsible title="一、方法论框架（三大国际方法融合）" defaultOpen={false}>
              <div className="framework-grid">
                {methodology.frameworks.map((f, i) => (
                  <div key={i} className="framework-item"><div className="fw-name">{f.name}</div><div className="fw-desc">{f.desc}</div></div>
                ))}
              </div>
            </Collapsible>
            <Collapsible title="二、核心评分公式" defaultOpen={false}>
              <div className="formula">{methodology.formula.split('\n').map((line, i) => <div key={i}>{line}</div>)}</div>
              <table className="level-table">
                <thead><tr><th>参数</th><th>名称</th><th>取值范围</th><th>说明</th></tr></thead>
                <tbody>{methodology.params.map((p, i) => (
                  <tr key={i}><td><code>{p.key}</code></td><td><b>{p.label}</b></td><td>{p.range}</td><td>{p.desc}</td></tr>
                ))}</tbody>
              </table>
            </Collapsible>
            <Collapsible title="三、评分标尺（Rubric）" defaultOpen>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>每条政策按以下标尺打分，确保评分可复现</p>
              {['breadth', 'depth'].map(param => (
                <div key={param} className="rubric-section">
                  <h4>{param === 'breadth' ? '影响广度 Rubric' : '深远程度 Rubric'}</h4>
                  <table className="level-table">
                    <thead><tr><th>分数</th><th>标准</th><th>示例</th></tr></thead>
                    <tbody>{rubric[param].map((r, i) => (
                      <tr key={i}><td><b>{r.score}</b></td><td>{r.criteria}</td><td style={{ color: '#666' }}>{r.example}</td></tr>
                    ))}</tbody>
                  </table>
                </div>
              ))}
            </Collapsible>
            <Collapsible title="四、等级划分标准" defaultOpen>
              <table className="level-table">
                <thead><tr><th>分数区间</th><th>等级</th><th>标识</th><th>通俗含义</th></tr></thead>
                <tbody>{methodology.levels.map((l, i) => (
                  <tr key={i}>
                    <td><b>{l.min}–{i === 0 ? 100 : methodology.levels[i-1].min - 1}</b></td>
                    <td style={{ color: l.color, fontWeight: 700 }}>{l.label}</td>
                    <td>{l.icon}</td><td>{l.plain}</td>
                  </tr>
                ))}</tbody>
              </table>
            </Collapsible>
            <Collapsible title="五、置信度说明" defaultOpen={false}>
              <table className="level-table">
                <thead><tr><th>等级</th><th>含义</th><th>说明</th></tr></thead>
                <tbody>{methodology.confidence.map((c, i) => (
                  <tr key={i}><td><span className="conf-stars">{c.level}</span></td><td><b>{c.label}</b></td><td>{c.desc}</td></tr>
                ))}</tbody>
              </table>
            </Collapsible>
            <Collapsible title="六、多区域架构" defaultOpen={false}>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
                本平台覆盖国家政策（基座层）和区域政策（区域层），区域指数 = 国家政策分 × 0.4 + 区域政策分 × 0.6。
              </p>
              <div className="region-arch-info">
                {regions.map(r => (
                  <div key={r.key} className={`region-arch-item ${r.comingSoon ? 'disabled' : ''}`}>
                    <span className="ra-icon">{r.icon}</span>
                    <b>{r.name}</b>：{r.subtitle}
                    {r.comingSoon && <span className="ra-soon">（即将上线）</span>}
                  </div>
                ))}
              </div>
            </Collapsible>
            <Collapsible title="七、用户画像与维度权重" defaultOpen={false}>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>不同身份的用户，各维度对综合指数的贡献权重不同。</p>
              <table className="level-table">
                <thead><tr><th>画像</th>{currentDims.map(d => <th key={d.key}>{d.icon}{d.name}</th>)}</tr></thead>
                <tbody>{personas.map(p => (
                  <tr key={p.key}><td><b>{p.icon} {p.label}</b></td>{currentDims.map(d => <td key={d.key}>{Math.round((p.weights[d.key] ?? 1/6)*100)}%</td>)}</tr>
                ))}</tbody>
              </table>
            </Collapsible>
            <Collapsible title="八、数据来源" defaultOpen={false}>
              <ul className="source-list">{methodology.sources.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </Collapsible>
            <Collapsible title="九、免责声明" defaultOpen={false}>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8 }}>
                本评估仅供信息参考，不构成任何投资建议或法律意见。评分基于公开信息的主观评估，
                不同评估者可能得出不同结论。建议在做出重大决策前咨询专业人士。
              </p>
            </Collapsible>
          </div>
        )}

        {/* ════════ DASHBOARD ════════ */}
        {activeTab === 'dashboard' && (
          <>
          <Dashboard personaKey={personaKey} regionKey={regionKey} bookmarks={bookmarks}
            onSwitchTab={(tab) => { setActiveTab(tab); setTabKey(k => k+1); window.scrollTo({top:0,behavior:"smooth"}) }} />
            <InvitePanel />
            <PremiumTeaser />
          </>
        )}

        {/* ════════ MONITOR ════════ */}
        {activeTab === 'monitor' && (
          <div className="tab-content-wrap">
            <PolicyMonitor />
          </div>
        )}

        {/* ════════ GRAPH ════════ */}
        {activeTab === 'graph' && (
          <div className="tab-content-wrap">
            <PolicyGraph />
          </div>
        )}

        {/* ════════ API ════════ */}
        {activeTab === 'api' && (
          <div className="tab-content-wrap">
            <ApiDocs />
          </div>
        )}

        {/* ════════ ABOUT ════════ */}
        {activeTab === 'about' && (
          <div className="tab-content-wrap">
            <AboutPage totalPolicies={totalPolicies} />
          </div>
        )}
      </main>

      <footer className="footer">
        <TrustBadges />
        <div className="footer-nav">
          <span className="footer-brand">🧭 策查查</span>
          <div className="footer-links">
            <button className="footer-link" onClick={() => { setActiveTab("overview"); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:"smooth"}) }}>首页</button>
            <button className="footer-link" onClick={() => { setActiveTab("monitor"); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:"smooth"}) }}>监控</button>
            <button className="footer-link" onClick={() => { setActiveTab("graph"); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:"smooth"}) }}>图谱</button>
            <button className="footer-link" onClick={() => { setActiveTab("api"); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:"smooth"}) }}>API</button>
            <button className="footer-link" onClick={() => { setActiveTab("dashboard"); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:"smooth"}) }}>我的</button>
            <button className="footer-link" onClick={() => { setShowFeedback(true) }}>💬 反馈</button>
            <button className="footer-link" onClick={() => { setShowPrivacy(true) }}>🔒 隐私</button>
          </div>
        </div>
        <p className="footer-info">读懂政策，做对决策 · 数据更新至 {DATA_LAST_UPDATED} · 方法论v{methodology.version} · {currentRegion.name} · {totalPolicies}条政策</p>
        <p className="footer-contact">📧 {CONTACT_EMAIL} · 数据来源均为政府官方网站 · 仅供参考</p>
        <p className="footer-legal">© 2026 策查查 · 不构成投资建议或法律意见</p>
      </footer>
    </div>
      </ErrorBoundary>
  )
}


/* ═══════ 信任增强组件 ═══════ */

/* P0-1: 社会证明数据栏 */
function PolicyStatsBar({ totalPolicies }) {
  const stats = [
    { icon: '📋', num: totalPolicies, label: '条权威政策' },
    { icon: '🌏', num: regions.length, label: '大经济区域' },
    { icon: '👥', num: personas.length, label: '类用户画像' },
    { icon: '🔬', num: 3, label: '大国际评估框架' },
  ]
  return (
    <div className="trust-stats-bar">
      {stats.map((s, i) => (
        <div key={i} className="ts-item">
          <span className="ts-icon">{s.icon}</span>
          <span className="ts-num">{s.num}</span>
          <span className="ts-label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}

/* P0-3: 反馈模态框 */
function FeedbackModal({ onClose }) {
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const handleSubmit = () => {
    if (!text.trim()) return
    window.open(`mailto:${CONTACT_EMAIL}?subject=策查查反馈&body=${encodeURIComponent(text)}`)
    setSent(true)
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>💬 反馈建议</h3>
        {sent ? (
          <div className="feedback-sent">
            <p>✅ 感谢你的反馈！邮件客户端已打开，发送即可。</p>
            <button className="btn-primary" onClick={onClose}>关闭</button>
          </div>
        ) : (
          <>
            <p className="feedback-desc">帮助我们做得更好，你的每一条建议都非常重要。</p>
            <textarea className="feedback-textarea" placeholder="请描述你的建议、遇到的问题或功能需求…" value={text} onChange={e => setText(e.target.value)} rows={5} />
            <div className="feedback-actions">
              <button className="btn-secondary" onClick={onClose}>取消</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={!text.trim()}>📤 提交反馈</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* P1-2: 隐私政策模态框 */
function PrivacyModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="privacy-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>🔒 隐私政策</h3>
        <div className="privacy-content">
          <h4>1. 数据收集</h4>
          <p>策查查仅在本地浏览器存储以下数据：用户画像选择、区域偏好、主题偏好、书签收藏、界面主题设置。所有数据均存储在浏览器的 localStorage 中，不会上传至服务器。</p>
          <h4>2. 数据使用</h4>
          <p>收集的数据仅用于提供个性化的政策推荐和界面体验优化。我们不会将你的数据分享给任何第三方。</p>
          <h4>3. Cookie / 本地存储</h4>
          <p>本应用使用浏览器 localStorage 存储你的偏好设置，不使用第三方追踪 Cookie。你可以随时通过浏览器设置清除这些数据。</p>
          <h4>4. 数据安全</h4>
          <p>由于数据仅保存在你的本地设备上，不存在服务器端数据泄露风险。但我们建议在共享设备上使用时注意清除浏览数据。</p>
          <h4>5. 联系我们</h4>
          <p>如你有任何隐私相关的疑问，请发送邮件至 {CONTACT_EMAIL}</p>
        </div>
        <button className="btn-primary" onClick={onClose} style={{ marginTop: 16 }}>我知道了</button>
      </div>
    </div>
  )
}

/* P2-1: 用户案例墙 */
function TestimonialWall() {
  const testimonials = [
    { icon: '🏠', role: '准备买房的深圳程序员', age: '28岁', quote: '用了策查查才知道深圳公积金可以贷到126万，比预想多了40万。还发现了人才引进补贴，总计省了近10万。', result: '节省约10万元', dim: 'housing' },
    { icon: '👶', role: '计划二胎的杭州妈妈', age: '32岁', quote: '生育计算器帮我算出了产假天数和津贴金额，还看到了各个区的托育补贴政策。三个工具一对比，选定了现在住的地方。', result: '多领津贴2.3万/年', dim: 'elderly' },
    { icon: '🚀', role: '准备返乡创业的成都青年', age: '35岁', quote: '行业维度的创业扶持政策一目了然，从税收优惠到场地补贴都有覆盖。雷达图让我看到了被忽略的就业培训补贴。', result: '发现5项适用补贴', dim: 'industry' },
  ]
  return (
    <div className="testimonial-wall">
      <h3 className="tw-title">💡 他们正在用策查查做决策</h3>
      <div className="tw-scroll">
        {testimonials.map((t, i) => (
          <div key={i} className="tw-card">
            <div className="tw-header">
              <span className="tw-icon">{t.icon}</span>
              <div>
                <span className="tw-role">{t.role}</span>
                <span className="tw-age">{t.age}</span>
              </div>
            </div>
            <p className="tw-quote">"{t.quote}"</p>
            <div className="tw-result">
              <span className="tw-result-label">决策收益</span>
              <span className="tw-result-val">{t.result}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* P2-2: 合作/认证展示 */
function TrustBadges() {
  const badges = [
    { name: 'OECD 监管影响评估', icon: '🏛️', desc: '国际通行的政策影响评估框架' },
    { name: 'PEST 宏观分析', icon: '📊', desc: '政治·经济·社会·技术四维分析' },
    { name: '利益相关者矩阵', icon: '🤝', desc: '多维利益相关者影响评估' },
  ]
  return (
    <div className="trust-badges">
      <span className="tb-label">评估框架基于</span>
      <div className="tb-list">
        {badges.map((b, i) => (
          <div key={i} className="tb-item" title={b.desc}>
            <span className="tb-icon">{b.icon}</span>
            <span className="tb-name">{b.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* P1-1: 关于我们页面 */
function AboutPage({ totalPolicies }) {
  const roadmap = [
    { stage: 'v1.0', title: '基础版', done: true, items: ['六大维度政策雷达', '基础评分体系', '政策库搜索'] },
    { stage: 'v2.0', title: '区域版', done: true, items: ['多区域架构（5大经济区）', '跨区域对比', '区域政策数据'] },
    { stage: 'v3.0', title: '个人版', done: true, items: ['用户画像体系', '个人权益计算器', '个性化推荐', '安家综合评估'] },
    { stage: 'v4.0', title: '智能版（规划中）', done: false, items: ['AI政策问答', '政策变化实时推送', '社区讨论', '移动端APP'] },
  ]
  return (
    <div className="about-page">
      <div className="about-hero">
        <h2>🧭 关于策查查</h2>
        <p className="about-mission">把政策翻译成决策力</p>
        <p className="about-desc">
          策查查是一个面向普通人的政策决策辅助工具。我们专注于将宏观政策转化为可操作的个人决策参考，
          帮助你在买房、就业、生育、教育、养老等人生重大决策中做出更明智的选择。
        </p>
      </div>

      <div className="about-section">
        <h3>🎯 我们的使命</h3>
        <p>政策信息不应该只是专家的专利。我们的目标是通过系统化的评估框架和通俗化的解读，
        让每一个普通人都能看懂政策对自己意味着什么，从而做出更好的决策。</p>
      </div>

      <div className="about-section">
        <h3>🔬 方法论</h3>
        <p>我们融合了 <strong>OECD 监管影响评估</strong>、<strong>PEST 宏观分析</strong> 和 <strong>利益相关者矩阵</strong> 三套国际通行的评估框架，
        从"影响广度 × 深远程度 × 方向 × 确定性 × 时效"五个维度对每条政策进行打分，确保评估结果的客观性和可复现性。
        当前方法论版本为 <strong>v{methodology.version}</strong>。</p>
      </div>

      <div className="about-section">
        <h3>📊 覆盖规模</h3>
        <div className="about-stats">
          <div className="about-stat"><span className="as-num">{totalPolicies}</span><span className="as-label">条政策</span></div>
          <div className="about-stat"><span className="as-num">{regions.length}</span><span className="as-label">个区域</span></div>
          <div className="about-stat"><span className="as-num">{personas.length}</span><span className="as-label">种画像</span></div>
          <div className="about-stat"><span className="as-num">6</span><span className="as-label">大维度</span></div>
        </div>
      </div>

      <div className="about-section">
        <h3>🗺️ 发展路线图</h3>
        <div className="about-roadmap">
          {roadmap.map((r, i) => (
            <div key={i} className={`ar-item ${r.done ? 'ar-done' : 'ar-future'}`}>
              <div className="ar-hd">
                <span className="ar-stage">{r.stage}</span>
                <span className="ar-title">{r.title}</span>
                {r.done ? <span className="ar-badge ar-badge-done">✓ 已上线</span> : <span className="ar-badge ar-badge-future">规划中</span>}
              </div>
              <ul className="ar-items">{r.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>

      <div className="about-section">
        <h3>📬 联系我们</h3>
        <p>邮箱：<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
        <p>数据更新至 {DATA_LAST_UPDATED_CN} · 方法论 v{methodology.version}</p>
      </div>
    </div>
  )
}

const RatingBar = memo(function RatingBar({ value, max = 10, color = '#3498db' }) {
  return (
    <div className="rating-bar">
      <div className="rating-bar-bg"><div className="rating-bar-fill" style={{ width: `${(value/max)*100}%`, background: color }} /></div>
      <span className="rating-bar-val">{value}</span>
    </div>
  )
});

export default App
