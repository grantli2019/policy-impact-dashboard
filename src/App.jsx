import React, { Suspense, lazy } from 'react'
import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react'
import {
  dimensions, methodology, rubric, personas, weeklyUpdates, regions,
  calcDimensionScore, calcOverallIndex, getIndexLevel, keyFindings,
  getDimensionsForRegion, getTimelineForDimension, regionToolParams,
  legislativeOutlook, crossLinks, actionPlans, policyDividends, deadlines, specialTopics, decisionScenarios, policyMilestones, policyGlossary, rentalQuiz, premiumFeatures, recommendations, newsLianboUpdates, lifeRadar, searchScenes, getScoreTrend, calcScoreVsBaseline, getUnifiedActions, toggleUnifiedAction, getActionProgress,
  detectUserCity, getSmartRecommendations, getRecommendReason, cityToRegion, inferLifeStage, lifeStages,
  enhancedTestimonials, getSimilarTestimonials, getPeerDiscoveries,
  getPolicyHealthCheck, getPolicyCompass, getWeeklyDigest, scenarioGroups, getScenarioImpacts,
  domainMeta,
  selfTestQuestions, scoreSelfTest, getBlindspotCost, getDailyQuizQuestions, getFullQuizQuestions, getRegionQuizQuestions, getQuizHistory, recordQuizAttempt, getQuizStats,
  getPolicyAlerts, getPolicySubscriptions, togglePolicySubscription,
  submitUserTestimonial, getUserTestimonials, getAllTestimonials,
  getUserProfile, saveUserProfile, saveToolResult, getToolResults,
  getDailyChallenge, submitDailyChallenge, getInsightVotes, submitInsightVote, getStreak, getTodayChallengeDone,
  getUserTier, updateUserTier, getWrongAnswers, addWrongAnswer, markWrongAnswerMastered,
  getValueSummary, getNotificationCount,
  getUserAchievements, checkAndAwardAchievements, getUserStats, achievementDefs,
  getRealizedValue, getUrgencyItems, recordGrowthSnapshot, getGrowthHistory,
  getShareReport, markShared,
  getDecisionProjects, createDecisionProject, updateDecisionProject, deleteDecisionProject,
  getTimeMachineScenarios, checkMilestones, getRegionComparison,
  enrichNewsForPersona, getNewsForPersona, getNewsByDimension,
} from './data/impactData'
import './App.css'

// Trust & transparency constants
const DATA_LAST_UPDATED = '2026-07-18'
const DATA_LAST_UPDATED_CN = '2026年7月18日'
const DATA_VERSION = '3.1.0' // 数据版本号，用于增量更新检测
const CONTACT_EMAIL = 'contact@cechacha.com'

// Helper: get rubric description for a score (breadth/depth)
function getRubricHint(type, score) {
  const list = rubric[type];
  if (!list) return '';
  const match = list.find(r => {
    const [lo, hi] = r.score.split('-').map(Number);
    return score >= lo && score <= hi;
  });
  return match ? match.criteria : '';
}

// Lazy-loaded components
const Tools = lazy(() => import('./Tools'));
const ShareCard = lazy(() => import('./components/ShareCard'));
import { TrustBadges, PolicyStatsBar, CelebrationToast } from './components/SharedComponents';

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
function WeeklyUpdateBar({ lastVisit }) {
  const [expanded, setExpanded] = useState(false)
  const items = expanded ? weeklyUpdates : weeklyUpdates.slice(0, 3)
  const newCount = lastVisit ? weeklyUpdates.filter(u => u.date > lastVisit).length : 0
  return (
    <section className="weekly-bar">
      <div className="weekly-header" onClick={() => setExpanded(!expanded)}>
        <span className="weekly-dot" />
        <span className="weekly-title">📡 本周更新 · {weeklyUpdates.length}条新动态{newCount > 0 && <span className="new-badge-count">{newCount}条新增</span>}</span>
        <button className="weekly-toggle" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
          {expanded ? '收起 ▲' : '展开全部 ▼'}
        </button>
      </div>
      <div className={`weekly-list ${expanded ? 'expanded' : ''}`}>
        {items.map((u, i) => (
          <div key={i} className="weekly-item">
            <span className="weekly-date">{u.date.slice(5)}</span>
            {lastVisit && u.date > lastVisit && <span className="new-badge">NEW</span>}
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
                <span className="radar-badges">
                  {p.source && <span className="source-tag">{p.issuingBody || p.source}</span>}
                  <span className="radar-conf">{p.confidence}</span>
                </span>
                <span className="radar-dir" style={{ color: dirColor(p.direction) }}>{dirLabel(p.direction)}</span>
                {DIM_TO_TOOL[p.dimKey] !== undefined && DIM_TO_TOOL[p.dimKey] >= 0 && (
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
              <span className="pc-badges">
                {s.source && <span className="source-tag">{s.issuingBody || s.source}</span>}
                <span className="conf-badge">{s.confidence}</span>
              </span>
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

  // 不可逆决策价值感知数据
  const URGENCY_DATA = [
    { icon: '⏰', label: '窗口期有限', desc: '政策红利有明确截止时间，错过不再来' },
    { icon: '💸', label: '机会成本', desc: '每晚决策1个月，可能损失数千元补贴' },
    { icon: '🔒', label: '不可逆转', desc: '购房/生育/退休等决策一旦执行无法回退' },
  ]

  return (
    <div className="decision-sim">
      <h2 className="section-title">🎮 决策模拟器</h2>
      <p className="ds-intro">人生重大决策不可逆，让政策数据帮你降低试错成本</p>

      {/* 不可逆决策价值感知条 */}
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
          {/* 机会成本提示 */}
          <div className="ds-opportunity-cost">
            <span className="ds-oc-icon">💡</span>
            <div className="ds-oc-text">
              <span className="ds-oc-title">如果你不行动...</span>
              <span className="ds-oc-desc">根据当前政策窗口期，每延迟决策1个月，你可能错过的政策红利价值约 <b>¥{Math.round((results[0]?.value || '').toString().replace(/[^\d]/g, '').slice(0,4) || 500) * 0.03}~{Math.round((results[0]?.value || '').toString().replace(/[^\d]/g, '').slice(0,4) || 500) * 0.08}</b></span>
            </div>
          </div>
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

/* 地区政策差异速览面板 */
function RegionComparisonPanel({ regionKey, userCity }) {
  const [open, setOpen] = useState(true)
  const [selDim, setSelDim] = useState('housing')
  const data = useMemo(()=>getRegionComparison(),[])
  const dims = [...new Set(data.map(d=>d.dim))]
  const filtered = data.filter(d=>d.dim===selDim)
  const cityLabel = userCity || (regions.find(r=>r.key===regionKey)?.name) || '北京'
  const cityKey = cityLabel.includes('北京')?'北京':cityLabel.includes('上海')?'上海':cityLabel.includes('深圳')?'深圳':cityLabel.includes('广州')?'广州':cityLabel

  return (
    <div className="region-comp-card">
      <div className="rcc-header" onClick={()=>setOpen(!open)}>
        <span className="rcc-icon">🗺️</span>
        <span className="rcc-title">地区政策差异速览</span>
        <span className="rcc-badge">📍 {cityKey}</span>
        <span className="rcc-toggle">{open?'收起 ▲':'展开 ▼'}</span>
      </div>
      {open && (
        <>
          <div className="rcc-dims">
            {dims.map(d=>(<span key={d} className={`rcc-dim-chip ${selDim===d?'active':''}`} onClick={()=>setSelDim(d)}>
              {d==='housing'?'🏠房产':d==='employment'?'💼就业':d==='education'?'🎓教育':d==='finance'?'💰金融':d}
            </span>))}
          </div>
          {filtered.map(item => (
            <div key={item.label} className="rcc-table">
              <div className="rcc-t-label">{item.icon} {item.label}</div>
              <div className="rcc-t-row rcc-t-header">
                <span className="rcc-t-city">城市</span><span className="rcc-t-val">标准</span><span className="rcc-t-note">说明</span>
              </div>
              {item.items.map(it => (
                <div key={it.city} className={`rcc-t-row ${(it.city.includes(cityKey) || cityKey.includes(it.city))?'rcc-highlight':''}`}>
                  <span className="rcc-t-city">{it.city}</span>
                  <span className="rcc-t-val">{it.val}</span>
                  <span className="rcc-t-note">{it.note}</span>
                </div>
              ))}
            </div>
          ))}
          <p className="rcc-footer-note">💡 不同城市的政策差异可能影响你的决策。建议以你所在城市为准，同时参考其他城市作为对照。</p>
        </>
      )}
    </div>
  )
}

/* ═══════ B3: 个人仪表盘 ═══════ */
function Dashboard({ personaKey, regionKey, bookmarks, onSwitchTab, userCity, userRegion }) {
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
            <div className="profile-name-row">
              <span className="profile-name">{persona ? persona.label + '视角' : '未选择身份'}</span>
              {userCity && <span className="profile-city">📍 {userCity}</span>}
            </div>
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

      {/* Region Comparison */}
      <RegionComparisonPanel regionKey={regionKey} userCity={userCity} />

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
      {current && <p className="pc-summary">作为「{current.icon} {current.label}」，你的指数在所有画像中排名第 {[...scores].sort((a,b) => b.score - a.score).findIndex(s => s.key === currentPersonaKey) + 1} 位</p>}
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
  const copyLink = () => { navigator.clipboard.writeText(inviteLink).then(() => setCopied(true)).catch(() => {}); setTimeout(() => setCopied(false), 2000) }
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
  const [focused, setFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recent_searches') || '[]') } catch { return [] }
  })
  const searchRef = useRef(null)
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
          const impactScore = Math.round(((p.breadth || 5) * (p.depth || 5) * (Math.abs(p.direction) || 0.5)) / 10)
          res.push({ type: 'policy', dim: dim.key, icon: dim.icon, dimLabel: dim.name, title: p.policyName, desc: p.note, sentiment: p.direction > 0 ? '利好' : p.direction < 0 ? '利空' : '中性', url: p.url, date: p.date, source: p.source, issuingBody: p.issuingBody, impactScore, breadth: p.breadth, depth: p.depth, confidence: p.confidence })
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
    // Save to recent searches if results found
    if (res.length > 0) {
      try {
        const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]')
        const qTrim = q.trim()
        const updated = [qTrim, ...recent.filter(s => s !== qTrim)].slice(0, 5)
        localStorage.setItem('recent_searches', JSON.stringify(updated))
        setRecentSearches(updated)
      } catch {}
    }
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
            res.push({ type: 'policy', dim: dim.key, icon: dim.icon, dimLabel: dim.name, title: p.policyName, desc: p.note, sentiment: p.direction > 0 ? '利好' : p.direction < 0 ? '利空' : '中性', url: p.url, date: p.date, source: p.source, issuingBody: p.issuingBody })
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
    // Save to recent searches
    try {
      const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]')
      const updated = [scene.label, ...recent.filter(s => s !== scene.label)].slice(0, 5)
      localStorage.setItem('recent_searches', JSON.stringify(updated))
      setRecentSearches(updated)
    } catch {}
  }

  const sentColor = s => s === '利好' || s === '偏利好' ? 'var(--success)' : s === '利空' || s === '偏利空' ? 'var(--danger)' : 'var(--text-secondary)'

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setFocused(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={`policy-search ${variant === 'header' ? 'ps-header' : ''}`} ref={searchRef}>
      <div className="ps-input-wrap">
        <span className="ps-icon">🔍</span>
        <input className="ps-input" aria-label="搜索政策" role="searchbox" type="text" placeholder="搜索政策（如：我要买房、规划养老、个税优化）"
          value={query} onChange={e => doSearch(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 200)} />
        {query && <button className="ps-clear" onClick={() => { setQuery(''); setResults(null); setSceneMatch(null) }}>✕</button>}
      </div>
      {/* Search suggestions dropdown */}
      {focused && !results && !query && (recentSearches.length > 0 || true) && (
        <div className="ps-suggestions">
          {recentSearches.length > 0 && (
            <div className="ps-sug-section">
              <span className="ps-sug-label">🕐 最近搜索</span>
              <div className="ps-sug-items">
                {recentSearches.slice(0, 3).map(s => (
                  <button key={s} className="ps-sug-tag" onClick={() => doSearch(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}
          <div className="ps-sug-section">
            <span className="ps-sug-label">🔥 热门搜索</span>
            <div className="ps-sug-items">
              {['公积金','延迟退休','个税','利率','生育','限购'].map(tag => (
                <button key={tag} className="ps-sug-tag" onClick={() => doSearch(tag)}>{tag}</button>
              ))}
            </div>
          </div>
          <div className="ps-sug-section">
            <span className="ps-sug-label">💡 场景速查</span>
            <div className="ps-sug-items">
              {searchScenes.slice(0, 4).map(s => (
                <button key={s.id} className="ps-sug-scene" onClick={() => doSceneSearch(s)}>
                  <span>{s.icon}</span> {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
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
      {/* 危机场景情感化设计：检测失业/裁员/断缴等关键词时显示安抚语+紧急求助 */}
      {query && ['失业','裁员','断缴','离职','辞退','赔偿','公积金提取','社保断缴','医保断缴'].some(k => query.includes(k)) && (
        <div className="crisis-banner">
          <div className="crisis-empathy">
            <span className="crisis-icon">🤝</span>
            <div className="crisis-text">
              <span className="crisis-title">我们理解你现在的处境，别慌，有办法。</span>
              <span className="crisis-sub">以下政策可以帮到你，按紧急程度排序：</span>
            </div>
          </div>
          <div className="crisis-actions">
            <span className="crisis-tag crisis-urgent">🔴 失业金申领：2175元/月</span>
            <span className="crisis-tag crisis-urgent">🔴 公积金可提取</span>
            <span className="crisis-tag crisis-soon">🟡 社保灵活就业续缴</span>
            <span className="crisis-tag crisis-soon">🟡 医保不能断</span>
          </div>
          <div className="crisis-hotline">
            <span className="crisis-hotline-label">紧急求助：</span>
            <a href="tel:12333" className="crisis-phone">📞 12333人社</a>
            <a href="tel:12348" className="crisis-phone">📞 12348法律援助</a>
            <a href="tel:12329" className="crisis-phone">📞 12329公积金</a>
          </div>
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
                    <li>点击下方的场景速查快速浏览</li>
                    <li>输入更通用的词，如「买房」而不是「LPR下调」</li>
                  </ul>
                  <div className="ps-empty-hot">
                    <span className="ps-empty-hot-label">🔥 热门搜索：</span>
                    {['公积金','延迟退休','个税','利率','生育','限购'].map(tag => (
                      <span key={tag} className="ps-hot-tag ps-empty-tag" onClick={() => doSearch(tag)}>{tag}</span>
                    ))}
                  </div>
                  <div className="ps-empty-scenes">
                    <span className="ps-empty-hot-label">💡 场景推荐：</span>
                    <div className="ps-empty-scene-grid">
                      {searchScenes.slice(0, 3).map(s => (
                        <button key={s.id} className="ps-scene-mini" onClick={() => doSceneSearch(s)}>
                          <span>{s.icon}</span> {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="ps-results-header">找到 {results.length} 条结果{sceneMatch ? <span className="ps-results-scene"> · 场景：{sceneMatch.icon} {sceneMatch.label}</span> : null}</div>
              {/* 搜索摘要卡：影响评估 + 行动建议 */}
              {(() => {
                const policyResults = results.filter(r => r.type === 'policy')
                if (policyResults.length === 0) return null
                const avgImpact = Math.round(policyResults.reduce((a, r) => a + (r.impactScore || 0), 0) / policyResults.length)
                const positiveCount = policyResults.filter(r => r.sentiment === '利好').length
                const negativeCount = policyResults.filter(r => r.sentiment === '利空').length
                const overallSentiment = positiveCount > negativeCount ? '整体偏利好' : negativeCount > positiveCount ? '整体偏利空' : '影响中性'
                const sentColor2 = positiveCount > negativeCount ? 'var(--success)' : negativeCount > positiveCount ? 'var(--danger)' : 'var(--text-secondary)'
                const actionMap = { housing: '🏠 建议：使用公积金计算器测算你的购房成本变化', employment: '💼 建议：查看就业维度了解最新权益保障政策', education: '🎓 建议：使用入学资格自测检查孩子入学条件', pension: '👴 建议：使用养老金计算器规划你的退休收入', finance: '💰 建议：使用个税优化工具测算节税空间', industry: '🏭 建议：关注产业维度了解创业扶持政策' }
                const topDim = policyResults[0]?.dim
                return (
                  <div className="ps-summary-card">
                    <div className="ps-summary-top">
                      <div className="ps-summary-score">
                        <span className="ps-summary-num" style={{ color: sentColor2 }}>{avgImpact}</span>
                        <span className="ps-summary-label">影响指数</span>
                      </div>
                      <div className="ps-summary-info">
                        <span className="ps-summary-sent" style={{ color: sentColor2 }}>{overallSentiment}</span>
                        <span className="ps-summary-detail">{policyResults.length}条相关政策 · 利好{positiveCount} · 利空{negativeCount}</span>
                      </div>
                    </div>
                    {actionMap[topDim] && <div className="ps-summary-action">{actionMap[topDim]}</div>}
                  </div>
                )
              })()}
              {results.map((r, i) => (
                <div key={i} className="ps-result-item" onClick={() => { if (r.type === 'topic') onSwitchTab('topics'); else if (r.type === 'policy') { onSwitchTab('dimensions'); if (r.dim && onNavigateDim) onNavigateDim(r.dim); } else onSwitchTab('overview') }}>
                  <span className="ps-ri-icon">{r.icon}</span>
                  <div className="ps-ri-body">
                    <div className="ps-ri-title">{r.title}{r.impactScore > 0 && <span className={`ps-impact-badge ${r.impactScore >= 6 ? 'impact-high' : r.impactScore >= 4 ? 'impact-mid' : 'impact-low'}`}>影响 {r.impactScore}/10</span>}</div>
                    {r.desc && <div className="ps-ri-desc">{r.desc}</div>}
                    <div className="ps-ri-meta">
                      <span className="ps-ri-tag">{r.dimLabel}</span>
                      {r.source && <span className="source-tag source-tag-sm">{r.issuingBody || r.source}</span>}
                      {r.sentiment && <span className="ps-ri-sent" style={{ color: sentColor(r.sentiment) }}>{r.sentiment}</span>}
                      {r.confidence && <span className="ps-ri-conf">{r.confidence}</span>}
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

  // 政策找人：基于用户画像的智能推荐关键词
  const SMART_KEYWORDS = (() => {
    const persona = localStorage.getItem('persona')
    const map = {
      worker: ['工伤认定','失业保险','职业技能补贴','劳动合同法'],
      parent: ['生育津贴','托育服务','学区划分','个税子女扣除'],
      retiree: ['养老金调整','医保报销','延迟退休','高龄补贴'],
      entrepreneur: ['小微企业税收','创业担保贷款','社保减免','营商环境'],
      freelancer: ['灵活就业社保','个税汇算','公积金自愿缴存','新就业形态'],
      student: ['就业见习补贴','租房补贴','落户政策','创业培训'],
    }
    return map[persona] || ['公积金','养老金','医保','个税']
  })()
  const suggestedKeywords = SMART_KEYWORDS.filter(k => !keywords.includes(k)).slice(0, 3)

  const addKeyword = (kw) => {
    const keyword = (kw || input).trim()
    if (!keyword || keywords.includes(keyword)) return
    if (keywords.length >= maxKeywords) return
    const next = [...keywords, keyword]
    setKeywords(next)
    localStorage.setItem('monitor_keywords', JSON.stringify(next))
    setInput('')
    // Check for matches in newsLianboUpdates
    const matches = newsLianboUpdates.filter(n => n.title.includes(keyword) || n.summary?.includes(keyword))
    if (matches.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('📺 策查查·监控提醒', { body: `“${keyword}”有${matches.length}条相关动态` })
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
        <button className="monitor-add" onClick={() => addKeyword()}>+ 关注</button>
      </div>
      {/* 政策找人：智能推荐关键词 */}
      {suggestedKeywords.length > 0 && (
        <div className="monitor-smart">
          <span className="monitor-smart-label">🤖 根据你的画像推荐：</span>
          <div className="monitor-smart-tags">
            {suggestedKeywords.map(kw => (
              <button key={kw} className="monitor-smart-tag" onClick={() => addKeyword(kw)}>+ {kw}</button>
            ))}
          </div>
        </div>
      )}
      {keywords.length > 0 && (
        <div className="monitor-tags">
          {keywords.map(kw => (
            <span key={kw} className="monitor-tag">{kw}<button className="mt-x" onClick={() => removeKeyword(kw)}>✕</button></span>
          ))}
        </div>
      )}
      {'Notification' in window && Notification.permission !== 'granted' && (
        <button className="monitor-notify-btn" onClick={requestNotify}>🔔 开启浏览器通知，政策变动第一时间推送</button>
      )}
      {matchedNews.length > 0 && (
        <div className="monitor-alerts">
          <h4>📡 最新动态（政策找人）</h4>
          {matchedNews.map(m => (
            <div key={m.kw} className="monitor-alert-group">
              <span className="mag-kw">🔑 {m.kw} <span className="mag-count">{m.matches.length}条新动态</span></span>
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
          {/* 联动效应摘要 */}
          <div className="pg-cascade">
            <span className="pg-cascade-title">⚡ 联动效应：</span>
            <span className="pg-cascade-desc">该政策变动将影响 {crossLinks.filter(l => l.from.includes(selectedNode.label.slice(0,3)) || l.to.includes(selectedNode.label.slice(0,3))).length} 个关联政策领域，建议关注上下游传导影响</span>
          </div>
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

/* ═══════ 联播解读专栏 v2 — 高价值版 ═══════ */
function NewsLianboPanel({ personaKey, stageKey, onNavigateDim, userProfile, lastVisit }) {
  const [activeTab, setActiveTab] = useState('foryou') // foryou | all | dims
  const [selDim, setSelDim] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const dimMeta = { housing: { icon: '🏠', label: '住房' }, employment: { icon: '💼', label: '就业' }, education: { icon: '🎓', label: '教育' }, pension: { icon: '👴', label: '养老' }, elderly: { icon: '👴', label: '养老' }, finance: { icon: '💰', label: '金融' }, industry: { icon: '🏭', label: '产业' } }
  const sentColor = { '利好': '#27ae60', '利空': '#e74c3c', '中性': '#7f8c8d' }
  const sentBg = { '利好': '#eafaf1', '利空': '#fdedec', '中性': '#f0f0f0' }

  // 个性化推荐（传入userProfile以计算个人匹配度）
  const forYou = useMemo(() => getNewsForPersona(personaKey || 'worker', 8, userProfile), [personaKey, JSON.stringify(userProfile || {})])
  const byDim = useMemo(() => getNewsByDimension(), [])
  const allNews = useMemo(() => newsLianboUpdates.map(n => enrichNewsForPersona(n, personaKey || 'worker', userProfile)), [personaKey, JSON.stringify(userProfile || {})])

  // 周报摘要统计
  const weeklyStats = useMemo(() => {
    const total = newsLianboUpdates.length
    const利好 = newsLianboUpdates.filter(n => n.sentiment === '利好').length
    const latest = newsLianboUpdates[0]
    return { total, 利好, 利好Pct: Math.round(利好 / total * 100), latestDate: latest?.date, latestTitle: latest?.title?.slice(0, 30) }
  }, [])

  const displayItems = activeTab === 'foryou' ? forYou : selDim ? (byDim.find(g => g.dim === selDim)?.items || []) : allNews.slice(0, 12)

  return (
    <div className="lianbo-dashboard">
      {/* 周报摘要卡片 */}
      <div className="lbd-weekly-brief">
        <div className="lbd-brief-left">
          <span className="lbd-brief-icon">📺</span>
          <div className="lbd-brief-text">
            <span className="lbd-brief-title">联播解读 · 政策速递</span>
            <span className="lbd-brief-sub">近30天 {weeklyStats.total} 条政策动态 · {weeklyStats.利好Pct}%利好 · 最新 {weeklyStats.latestDate}</span>
          </div>
        </div>
        <div className="lbd-brief-right">
          <div className="lbd-brief-stat"><span className="lbd-bs-num green">{weeklyStats.利好}</span><span>利好</span></div>
          <div className="lbd-brief-stat"><span className="lbd-bs-num">{weeklyStats.total - weeklyStats.利好}</span><span>中性/利空</span></div>
        </div>
      </div>

      {/* 标签切换 */}
      <div className="lbd-tabs">
        <button className={`lbd-tab ${activeTab === 'foryou' ? 'active' : ''}`} onClick={() => { setActiveTab('foryou'); setSelDim(null) }}>
          🎯 与你相关
        </button>
        <button className={`lbd-tab ${activeTab === 'dims' ? 'active' : ''}`} onClick={() => setActiveTab('dims')}>
          📂 按维度浏览
        </button>
        <button className={`lbd-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => { setActiveTab('all'); setSelDim(null) }}>
          📋 全部动态
        </button>
      </div>

      {/* 维度子标签 */}
      {activeTab === 'dims' && (
        <div className="lbd-dim-tabs">
          {byDim.map(g => (
            <button key={g.dim} className={`lbd-dim-tab ${selDim === g.dim ? 'active' : ''}`} onClick={() => setSelDim(g.dim)}>
              {g.icon} {g.label}<span className="lbd-dim-count">{g.items.length}</span>
              <span className="lbd-dim-sent" style={{color:sentColor['利好']}}>+{g['利好']||0}</span>
            </button>
          ))}
        </div>
      )}

      {/* 新闻列表 */}
      <div className="lbd-news-list">
        {displayItems.map((item, i) => (
          <div key={i} className={`lbd-news-card ${expandedId === i ? 'expanded' : ''}`} onClick={() => setExpandedId(expandedId === i ? null : i)}>
            <div className="lbd-nc-header">
              <span className="lbd-nc-date">{item.date}</span>
              {lastVisit && item.date > lastVisit && <span className="new-badge">NEW</span>}
              <span className="lbd-nc-dim" onClick={e => { e.stopPropagation(); onNavigateDim?.(item.dim) }}>
                {item.dimIcon || dimMeta[item.dim]?.icon} {dimMeta[item.dim]?.label}
              </span>
              <span className="lbd-nc-sent" style={{ background: sentBg[item.sentiment], color: sentColor[item.sentiment] }}>
                {item.sentiment}
              </span>
              <span className={`lbd-nc-impact lbd-impact-${item.impact || '中'}`}>
                {item.impact === '高' ? '⚡高影响' : '📡关注'}
              </span>
              {item.personalMatch === 'high' && <span className="lbd-nc-personal">🎯 与你相关</span>}
              {item.personalMatch === 'medium' && <span className="lbd-nc-personal lbd-personal-med">📡 可关注</span>}
            </div>
            <div className="lbd-nc-title">{item.title}</div>
            {item.data?.length > 0 && (
              <div className="lbd-nc-data">{item.data.map((d, j) => <span key={j} className="lbd-nc-datum">{d}</span>)}</div>
            )}
            {expandedId === i && (
              <div className="lbd-nc-expanded">
                <p className="lbd-nc-summary">{item.summary}</p>
                {item.relevance && (
                  <div className="lbd-nc-relevance">
                    <span className="lbd-nc-rel-label">👤 相关人群：</span>
                    {item.relevance.map(r => {
                      const p = personas.find(pp => pp.key === r)
                      return <span key={r} className="lbd-nc-rel-tag">{p?.icon} {p?.label || r}</span>
                    })}
                  </div>
                )}
                {item.actionHint && (
                  <div className="lbd-nc-action">
                    <span className="lbd-nc-action-icon">💡</span>
                    <span className="lbd-nc-action-text">{item.actionHint}</span>
                  </div>
                )}
                <span className="lbd-nc-source">📡 {item.source}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="lbd-footer">
        <span>📡 数据来源：新闻联播官方摘要 · 每日更新</span>
        <span>💡 点击卡片展开操作建议</span>
      </div>
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
  const [actionFilter, setActionFilter] = useState('all')

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
          {(() => {
            // 统一行动数据
            const unifiedAll = getUnifiedActions(personaKey, stageKey || '')
            if (!unifiedAll.length && result.topActions.length === 0) return null
            // 合并雷达 topActions（补充 unified 里没有的）
            const merged = [...unifiedAll]
            result.topActions.forEach((a, i) => {
              if (!merged.find(m => m.title === a.title)) {
                merged.push({
                  id: 'top_' + i, source: 'topRadar',
                  title: a.title, steps: a.desc ? [a.desc] : [],
                  urgency: a.priority === 'high' ? 'immediate' : 'watch',
                  benefit: null, policyRef: '', toolLink: null,
                  status: 'pending', completedAt: null,
                })
              }
            })
            const filtered = actionFilter === 'all' ? merged : merged.filter(a => a.source === actionFilter)
            const doneCount = merged.filter(a => a.status === 'done').length
            const total = merged.length
            const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0
            const barColor = pct === 100 ? '#27ae60' : pct >= 60 ? '#e67e22' : '#e74c3c'
            return (
              <section className="radar-section radar-action" style={{ position: 'relative' }}>
                <h3 className="radar-section-title"><span className="rst-icon">📝</span> 你的行动清单</h3>
                <div className="action-filters">
                  <button className={`action-filter-btn ${actionFilter === 'all' ? 'active' : ''}`} onClick={() => setActionFilter('all')}>全部 {merged.length}</button>
                  {['actionPlans','topRadar','signal'].filter(s => merged.some(a => a.source === s)).map(s => (
                    <button key={s} className={`action-filter-btn ${actionFilter === s ? 'active' : ''}`} onClick={() => setActionFilter(s)}>
                      {s === 'actionPlans' ? '行动计划' : s === 'topRadar' ? '雷达推荐' : '信号提醒'} {merged.filter(a => a.source === s).length}
                    </button>
                  ))}
                </div>
                <div className="radar-action-progress">
                  <div className="rap-bar"><div className="rap-fill" style={{ width: pct + '%', background: barColor }} /></div>
                  <span className="rap-text">已完成 {doneCount}/{total}</span>
                </div>
                {floatText && <div className="radar-float-text">{floatText}</div>}
                <div className="radar-action-list">
                  {filtered.map(a => {
                    const isDone = a.status === 'done'
                    return (
                      <div key={a.id} className={`radar-action-item ${isDone ? 'rai-done' : ''}`} onClick={() => {
                        if (!isDone && a.toolLink) onSwitchTab('tools')
                        else if (!isDone) onSwitchTab('dimensions')
                      }}>
                        <button className="rai-check" onClick={(e) => { e.stopPropagation(); toggleUnifiedAction(a.id, isDone ? 'pending' : 'done'); }}>
                          {isDone ? '✅' : <span className="rai-circle" />}
                        </button>
                        <span className="rai-num">{1}</span>
                        <span className={`action-source-badge src-${a.source}`}>{a.source === 'actionPlans' ? '行动' : a.source === 'topRadar' ? '雷达' : '信号'}</span>
                        <span className="rai-text">{a.title}</span>
                        {!isDone && <span className="rai-arrow">去做 →</span>}
                      </div>
                    )
                  })}
                </div>
                {filtered.length === 0 && <p style={{textAlign:'center',color:'var(--text-muted)',padding:'16px 0',fontSize:13}}>当前筛选条件下没有待办行动</p>}
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
  const { show: showToast, ToastContainer } = useToast()
  // 数据版本迁移（首次加载时执行）
  useEffect(() => { migrateDataVersion() }, [])
  // “上次访问后新增”标记系统
  const [lastVisit] = useState(() => localStorage.getItem('last_visit') || null)
  useEffect(() => {
    const timer = setTimeout(() => { localStorage.setItem('last_visit', new Date().toISOString().slice(0, 10)) }, 3000)
    return () => clearTimeout(timer)
  }, [])
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
  const [showAllPolicies, setShowAllPolicies] = useState(false)
  const [topicSearch, setTopicSearch] = useState('')
  const [darkMode, setDarkMode] = useState(() => { try { return localStorage.getItem('theme') === 'dark' } catch { return false } })
  useEffect(() => { document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : ''); localStorage.setItem('theme', darkMode ? 'dark' : 'light') }, [darkMode])
  const [showTour, setShowTour] = useState(() => !sessionStorage.getItem("tour_done"))
  const [showReport, setShowReport] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [policyDetail, setPolicyDetail] = useState(null)
  const [targetTool, setTargetTool] = useState(0)
  const DIM_TO_TOOL = { housing: 1, employment: 5, education: 0, pension: 6, finance: 5, industry: -1 }
  const DIM_ACTION_KEYWORDS = {
    housing: ['公积金','房贷','房产','换房','LPR','长三角','房地产税','利率'],
    employment: ['社保','个税','就业','参保','灵活','平台','延迟退休','养老金'],
    education: ['学区','教育','子女','托育','学前','随迁','生育补贴'],
    pension: ['养老','退休','养老金','个人养老金'],
    finance: ['金融','理财','存款','大额','个人养老金','资管'],
    industry: ['产业','企业','创业','补贴'],
  }
  const getDimActions = (dimKey) => {
    const plan = actionPlans[personaKey]
    if (!plan) return []
    const keywords = DIM_ACTION_KEYWORDS[dimKey] || []
    return plan.filter(a => !keywords.length || keywords.some(k => (a.policyRef || '').includes(k) || (a.title || '').includes(k))).slice(0, 3)
  }
  const [compareList, setCompareList] = useState([])
  const [showCompare, setShowCompare] = useState(false)

  const toggleCompare = (policy, dim) => {
    setCompareList(prev => {
      const key = policy.policyName + dim.key
      if (prev.some(p => p._cmpKey === key)) return prev.filter(p => p._cmpKey !== key)
      if (prev.length >= 4) return prev
      return [...prev, { ...policy, dimName: dim.name, dimIcon: dim.icon, dimColor: dim.color, dimKey: dim.key, _cmpKey: key }]
    })
  }

  const isInCompare = (policy, dim) => {
    const key = policy.policyName + dim.key
    return compareList.some(p => p._cmpKey === key)
  }
  const [moreOpen, setMoreOpen] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [headerShadow, setHeaderShadow] = useState(false)
  useEffect(() => {
    const onScroll = () => setHeaderShadow(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  // 新用户检测：访问次数<=2时折叠首页次要区块
  const visitCount = (() => { try { return JSON.parse(localStorage.getItem('visit_stats') || '{}').count || 1 } catch { return 1 } })()
  const [overviewCollapsed, setOverviewCollapsed] = useState(visitCount <= 2)
  // ═══ 认知破局增强状态 ═══
  const [showHealthCheck, setShowHealthCheck] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showUgcModal, setShowUgcModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showWeeklyDigest, setShowWeeklyDigest] = useState(false)
  const [testimonialScenario, setTestimonialScenario] = useState('all')
  const [testimonialStage, setTestimonialStage] = useState('all')
  const [expandedTestimonial, setExpandedTestimonial] = useState(null)
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [digestData, setDigestData] = useState(null)
  const [notifCount, setNotifCount] = useState(() => getNotificationCount())
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [showValueDashboard, setShowValueDashboard] = useState(false)
  const [showWrongBook, setShowWrongBook] = useState(false)
  const [showDailyChallenge, setShowDailyChallenge] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showTimeMachine, setShowTimeMachine] = useState(false)
  const [showDecisionProject, setShowDecisionProject] = useState(false)
  const [celebration, setCelebration] = useState(null)
  const [compassAutoExpand, setCompassAutoExpand] = useState(false) // 体检后自动展开风向标
  const [showProfileCenter, setShowProfileCenter] = useState(false) // 画像中心
  useEffect(() => { if (!moreOpen) return; const handler = () => setMoreOpen(false); document.addEventListener('click', handler); return () => document.removeEventListener('click', handler); }, [moreOpen])
  // Track visits
  useEffect(() => {
    try {
      const stats = JSON.parse(localStorage.getItem("visit_stats") || "{}")
      const today = new Date().toISOString().slice(0, 10)
      if (stats.lastDate !== today) { stats.count = (stats.count || 0) + 1; stats.lastDate = today; localStorage.setItem("visit_stats", JSON.stringify(stats)) }
    } catch {}
    // 记录访问次数（用于成就系统）
    try { const v=parseInt(localStorage.getItem('total_visits')||'0'); localStorage.setItem('total_visits',String(v+1)) } catch {}
  }, [])

  // 里程碑庆祝检测
  useEffect(() => {
    const milestones = checkMilestones()
    if (milestones.length>0) { setCelebration(milestones[0]); setTimeout(()=>setCelebration(null),4000) }
    // 记录增长快照
    try { recordGrowthSnapshot() } catch {}
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

  // 分数趋势（缓存上次分数并比较）
  const scoreTrends = useMemo(() => {
    try {
      const dims = sortedDims.map(d => ({ key: d.key, idx: calcDimensionScore(d) }))
      return getScoreTrend(dims).trends || {}
    } catch { return {} }
  }, [sortedDims])
  // 所有维度分数（用于基准对比）
  const allDimScores = useMemo(() => sortedDims.map(d => ({ key: d.key, idx: calcDimensionScore(d) })), [sortedDims])

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
    }).catch(() => { setCityDetected(true) })
    return () => { cancelled = true }
  }, []) // eslint-disable-line

  const switchTab = useCallback((k) => {
    setActiveTab(k)
    if (k === 'dimensions' && !selectedDim) setSelectedDim(currentDims[0]?.key || null)
    else setSelectedDim(null)
    setTabKey(prev => prev + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Hash路由同步
    window.location.hash = k === 'overview' ? '' : k
  }, [selectedDim, currentDims])

  // Hash路由：初始化读取 + 监听变化
  useEffect(() => {
    const applyHash = () => {
      const h = window.location.hash.replace('#', '')
      if (h && ['overview','radar','dimensions','tools','topics','dashboard','monitor','methodology','graph','api','about'].includes(h)) {
        setActiveTab(h)
        setTabKey(prev => prev + 1)
      }
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [])

  // 键盘快捷键：Ctrl+K 聚焦搜索 / Esc 关闭弹窗
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const input = document.querySelector('.ps-input, .hero-search-box input')
        if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
      }
      if (e.key === 'Escape') {
        setShowModal(false); setShowShare(false); setShowUpgrade(false)
        setShowProfileCenter(false); setShowNotifPanel(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

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
            <button className={`icon-btn notif-btn ${notifCount>0?'has-notif':''}`} onClick={()=>{setShowNotifPanel(!showNotifPanel);if(!showNotifPanel)setNotifCount(getNotificationCount())}} title="通知">🔔{notifCount>0 && <span className="notif-badge">{notifCount}</span>}</button>
            <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} title={darkMode ? '切换亮色模式' : '切换暗黑模式'}>{darkMode ? '☀️' : '🌙'}</button>
            {currentPersona && (
              <button className="persona-chip" onClick={() => { localStorage.removeItem('persona'); setPersonaKey(null); setShowModal(true); sessionStorage.removeItem('skipped') }}>
                {currentPersona.icon} {currentPersona.label}<span className="chip-x">✕</span>
              </button>
            )}
            {(() => {
              const comp = localStorage.getItem('composite_persona')
              if (!comp || !comp.includes('+')) return null
              const secondKey = comp.split('+')[1]
              const secondPersona = personas.find(p => p.key === secondKey)
              if (!secondPersona) return null
              return <span className="composite-badge" title={`组合画像：${currentPersona?.label} + ${secondPersona.label}`}>+{secondPersona.icon}</span>
            })()}
            <button className="icon-btn profile-btn" onClick={() => setShowProfileCenter(true)} title="我的画像">👤</button>
            {!isPremium() && <button className="upgrade-btn" onClick={() => setShowUpgrade(true)}>⭐</button>}
            <button className="icon-btn" onClick={() => setShowReport(true)} title="下载报告">📄</button>
            <button className="icon-btn" onClick={() => setShowShare(true)} title="分享">📤</button>
          </div>
        </div>
      </header>

      <nav className="tabs" role="tablist" aria-label="主导航">
        {[['overview','🏠 首页'],['radar','📡 雷达'],['dimensions','📋 政策库'],['tools','🧮 工具箱'],['dashboard','👤 我的']].map(([k, label]) => (
          <button key={k} className={`tab ${activeTab===k?'active':''}`} role="tab" aria-selected={activeTab===k} onClick={() => switchTab(k)}>{label}</button>
        ))}
        <div className="tab-more-wrap">
          <button className={`tab tab-more ${['topics','methodology','graph','api','monitor','about'].includes(activeTab)?'active':''}`} onClick={(e) => { e.stopPropagation(); setMoreOpen(!moreOpen); }} aria-label="更多功能" aria-expanded={moreOpen}>⋯ 更多</button>
          {moreOpen && (
            <div className="tab-dropdown">
              {[['topics','🎯 专题'],['monitor','🔔 监控'],['methodology','🔬 方法论'],['graph','🕸️ 图谱'],['api','🔌 API'],['about','🧭 关于']].map(([k, label]) => (
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

            {/* 老用户欢迎回来横幅 */}
            {lastVisit && (() => {
              const newNews = newsLianboUpdates.filter(n => n.date > lastVisit).length
              const newWeekly = weeklyUpdates.filter(u => u.date > lastVisit).length
              const totalNew = newNews + newWeekly
              if (totalNew === 0) return null
              return (
                <div className="welcome-back-banner">
                  <div className="wb-left">
                    <span className="wb-icon">👋</span>
                    <div className="wb-text">
                      <span className="wb-title">欢迎回来！</span>
                      <span className="wb-sub">上次访问后有 <b>{totalNew}</b> 条新动态（新闻{newNews}条 + 周报{newWeekly}条）</span>
                    </div>
                  </div>
                  <button className="wb-btn" onClick={() => { setActiveTab('news'); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:'smooth'}) }}>
                    查看新动态 →
                  </button>
                </div>
              )
            })()}

            <PolicyStatsBar totalPolicies={totalPolicies} />
            
            {/* P0: 价值感知横幅 — 用户进入首页立即感知价值 */}
            <ValuePerceptionBanner personaKey={personaKey} stageKey={lifeRadar.personaStageMap[personaKey]||'mid_career'}
              onSwitchTab={(tab)=>{setActiveTab(tab);setTabKey(k=>k+1);window.scrollTo({top:0,behavior:'smooth'})}} />
            
            <SmartRecommendations 
              personaKey={personaKey} 
              regionKey={regionKey} 
              userCity={userCity} 
              userAge={userAge}
              onSwitchTab={(tab) => { setActiveTab(tab); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:'smooth'}) }}
              onNavigateDim={(key) => { setSelectedDim(key); setTabKey(k=>k+1) }}
            />

            <DiscoveryPanel personaKey={personaKey} stageKey={lifeRadar.personaStageMap[personaKey]||'mid_career'}
              regionKey={regionKey} userCity={userCity} userAge={userAge}
              onSwitchTab={(tab)=>{setActiveTab(tab);setTabKey(k=>k+1);window.scrollTo({top:0,behavior:'smooth'})}}
              onNavigateDim={(key)=>{setSelectedDim(key);setTabKey(k=>k+1)}}
              setShowHealthCheck={setShowHealthCheck} setShowQuiz={setShowQuiz} setShowWeeklyDigest={setShowWeeklyDigest} />

            <DailyChallengeCard challenge={(()=>{try{return getDailyChallenge(personaKey,getUserProfile())}catch{return null}})()}
            personaKey={personaKey}
            onStart={()=>setShowDailyChallenge(true)} />

            <PolicyCompassPanel personaKey={personaKey} userProfile={(()=>{try{return getUserProfile()||{}}catch(e){return {}}})()}
              autoExpand={compassAutoExpand} onAutoExpandHandled={()=>setCompassAutoExpand(false)}
              onSwitchTab={(tab)=>{setActiveTab(tab);setTabKey(k=>k+1);window.scrollTo({top:0,behavior:'smooth'})}} />

            <div className={overviewCollapsed ? 'section-collapsed' : 'section-expanded'}>
              <RegionSelector value={regionKey} onChange={handleRegionChange} />

              <RegionCompare personaKey={personaKey} currentRegion={regionKey} onSelectRegion={handleRegionChange} />

              <EnhancedTestimonialWall personaKey={personaKey} stageKey={lifeRadar.personaStageMap[personaKey]||'mid_career'}
                userCity={userCity} userAge={userAge}
                testimonialScenario={testimonialScenario} testimonialStage={testimonialStage}
                expandedTestimonial={expandedTestimonial}
                setExpandedTestimonial={setExpandedTestimonial}
                setTestimonialScenario={setTestimonialScenario}
                setTestimonialStage={setTestimonialStage} />

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
                        <span className="qs-summary">{
                          (dim.plainSummary && dim.plainSummary.split('。')[0] + '。') ||
                          (dim.summary && dim.summary.length > 30 ? dim.summary.slice(0, 30) + '…' : dim.summary) ||
                          ''
                        }</span>
                        {(() => {
                          const t = scoreTrends[dim.key]
                          if (!t) return null
                          const arrow = t.direction === 'up' ? '↑' : t.direction === 'down' ? '↓' : '→'
                          return <span style={{fontSize:11,fontWeight:600,marginTop:2}} className={`score-trend score-trend-${t.direction}`}>{arrow}{t.delta}</span>
                        })()}
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

              {(() => {
                const prog = getActionProgress(personaKey || '', '')
                if (!prog.total) return null
                return (
                  <div className="action-progress-panel" onClick={() => { setActiveTab('radar'); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:'smooth'}) }}>
                    <div className="app-header">
                      <span className="app-icon">📋</span>
                      <span className="app-title">你的行动进度</span>
                      <span className="app-arrow">→</span>
                    </div>
                    <div className="app-stats">
                      <span className="app-stat">已完成 <strong>{prog.done}/{prog.total}</strong> 项</span>
                      <span className="app-stat">本周完成 <strong>{prog.weekDone}</strong> 项</span>
                      {prog.topSource && <span className="app-stat">待办最多：<strong>{prog.topSource === 'actionPlans' ? '行动清单' : prog.topSource === 'signal' ? '雷达信号' : '推荐行动'}</strong></span>}
                    </div>
                  </div>
                )
              })()}

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
            {overviewCollapsed && (
              <button className="overview-expand-btn" onClick={() => setOverviewCollapsed(false)}>
                + 展开更多内容（政策总览、热点、雷达等）
              </button>
            )}
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
            <WeeklyUpdateBar lastVisit={lastVisit} />
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
                      {(() => {
                        const t = scoreTrends[dim.key]
                        if (!t) return null
                        const arrow = t.direction === 'up' ? '↑' : t.direction === 'down' ? '↓' : '→'
                        return <span className={`score-trend score-trend-${t.direction}`}>{arrow}{t.delta}</span>
                      })()}
                      {(() => {
                        const b = calcScoreVsBaseline(idx, allDimScores)
                        if (!b || b.direction === 'neutral') return null
                        return <span className={`score-baseline ${b.direction}`}>{b.direction === 'above' ? '高于平均 ' : '低于平均 '}{b.diff}</span>
                      })()}
                      <span className="ds-score-label">{lvl.label}</span>
                    </div>
                  </div>
                  <p className="dim-plain-text">💬 {dim.plainSummary}</p>
                  <Timeline dimKey={dim.key} />

                  <div className="policy-list">
                    <h4>📌 相关政策 ({dim.scores.length}条)</h4>
                    {dim.scores.slice(0, showAllPolicies ? undefined : 5).map((s, i) => {
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
                          <span className={`pl-cb ${isInCompare(s, dim) ? 'checked' : ''}`} onClick={e => { e.stopPropagation(); toggleCompare(s, dim) }}>
                            {isInCompare(s, dim) ? '☑' : '☐'}
                          </span>
                          <span className="pl-name">{s.policyName}</span>
                          <span className="pl-dir" style={{ color: dirColor }}>{dirLabel}</span>
                          <span className="policy-score-badge">广度<b>{s.breadth}</b> 深度<b>{s.depth}</b></span>
                          <span className="pl-conf">{s.confidence}</span>
                          <span className="pl-note">{s.note}</span>
                          <span className="pl-arrow">→</span>
                        </div>
                      )
                    })}
                    {dim.scores.length > 5 && (
                      <button className="show-more-btn" onClick={() => setShowAllPolicies(!showAllPolicies)}>
                        {showAllPolicies ? '收起 ↑' : `展开全部 ${dim.scores.length} 条 ↓`}
                      </button>
                    )}
                  </div>
                  {(() => {
                    const dimActions = getDimActions(dim.key)
                    return dimActions.length > 0 ? (
                      <div className="dim-action-hint">
                        <h4>📋 为你推荐行动</h4>
                        {dimActions.map(a => (
                          <div key={a.id} className="dah-item" onClick={() => { if (a.toolLink) { setActiveTab('tools'); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:'smooth'}) }}}>
                            <div className="dah-header">
                              <span className="dah-title">{a.title}</span>
                              <span className={`dah-urgency urgency-${a.urgency}`}>
                                {a.urgency === 'immediate' ? '紧急' : a.urgency === 'soon' ? '近期' : '关注'}
                              </span>
                            </div>
                            {a.benefit && <span className="dah-benefit">预计节省 ¥{a.benefit.toLocaleString()}</span>}
                          </div>
                        ))}
                      </div>
                    ) : null
                  })()}
                </section>
              )
            })}

            <NewsLianboPanel personaKey={personaKey} stageKey={lifeStage} userProfile={(()=>{try{return getUserProfile()||{}}catch(e){return {}}})()} onNavigateDim={(key)=>{setSelectedDim(key);setTabKey(k=>k+1)}} lastVisit={lastVisit} />
            <CrossLinkGraph />
            <ScenarioPreEnact onNavigateDim={(key)=>{setSelectedDim(key);setTabKey(k=>k+1)}} />
            <div className="overview-sub-actions">
              <button className="dp-action-btn" onClick={()=>setShowUgcModal(true)}>📝 分享我的发现</button>
              <button className="dp-action-btn" onClick={()=>setShowSubscriptionModal(true)}>🔔 政策订阅</button>
            </div>
            <LegislativeOutlook regionKey={regionKey} personaKey={personaKey} />
          </div>
        )}
        {/* ════════ 对比浮条 ════════ */}
        {activeTab === 'dimensions' && compareList.length >= 2 && (
          <div className="compare-bar">
            <span className="cb-count">已选 {compareList.length} 条政策</span>
            <div className="cb-preview">
              {compareList.slice(0, 4).map(p => (
                <span key={p._cmpKey} className="cb-chip">
                  {p.dimIcon} {p.policyName.slice(0, 10)}{p.policyName.length > 10 ? '…' : ''}
                  <span className="cb-chip-close" onClick={() => toggleCompare(p, { key: p.dimKey })}>✕</span>
                </span>
              ))}
            </div>
            <button className="cb-btn" onClick={() => setShowCompare(true)}>📊 对比查看</button>
            <button className="cb-clear" onClick={() => setCompareList([])}>清空</button>
          </div>
        )}
        {/* ════════ 对比弹窗 ════════ */}
        {showCompare && compareList.length >= 2 && (
          <div className="compare-overlay" onClick={() => setShowCompare(false)}>
            <div className="compare-panel" onClick={e => e.stopPropagation()}>
              <button className="compare-close" onClick={() => setShowCompare(false)}>✕</button>
              <h3 className="compare-title">📊 政策对比</h3>
              <div className="compare-grid">
                {compareList.map(p => (
                  <div key={p._cmpKey} className="compare-card">
                    <div className="cc-header">
                      <span className="cc-dim" style={{ color: p.dimColor }}>{p.dimIcon} {p.dimName}</span>
                      <span className="cc-conf">{p.confidence}</span>
                    </div>
                    <div className="cc-name">{p.policyName}</div>
                    <div className="cc-score-row">
                      <div className="cc-score-item">
                        <span className="cc-score-label">广度</span>
                        <div className="cc-bar-bg"><div className="cc-bar-fill" style={{ width: (p.breadth || 0) * 10 + '%', background: '#1677ff' }} /></div>
                        <span className="cc-score-val">{p.breadth}</span>
                      </div>
                      <div className="cc-score-item">
                        <span className="cc-score-label">深度</span>
                        <div className="cc-bar-bg"><div className="cc-bar-fill" style={{ width: (p.depth || 0) * 10 + '%', background: '#722ed1' }} /></div>
                        <span className="cc-score-val">{p.depth}</span>
                      </div>
                    </div>
                    <div className="cc-meta">
                      <span className="cc-dir" style={{ color: p.direction > 0 ? 'var(--success)' : p.direction < 0 ? 'var(--error)' : 'var(--text-muted)' }}>{p.direction > 0 ? '利好' : p.direction < 0 ? '利空' : '中性'}</span>
                      <span className="cc-note">{p.note ? p.note.slice(0, 40) + (p.note.length > 40 ? '…' : '') : ''}</span>
                    </div>
                    {p.date && <div className="cc-date">📅 {p.date}</div>}
                    {p.url && <a className="cc-link" href={p.url} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}>查看原文 ↗</a>}
                  </div>
                ))}
              </div>
            </div>
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
              {(policyDetail.issuingBody || policyDetail.docNumber || policyDetail.source) && (
                <div className="pd-source-section">
                  {policyDetail.issuingBody && (
                    <span className="pd-source-item">
                      <span className="pd-source-label">发布机构</span>
                      <span className="pd-source-value">{policyDetail.issuingBody}</span>
                    </span>
                  )}
                  {policyDetail.docNumber && (
                    <span className="pd-source-item">
                      <span className="pd-source-label">文号</span>
                      <span className="pd-source-value pd-doc-number">{policyDetail.docNumber}</span>
                    </span>
                  )}
                  {policyDetail.date && (
                    <span className="pd-source-item">
                      <span className="pd-source-label">发布日期</span>
                      <span className="pd-source-value">{policyDetail.date}</span>
                    </span>
                  )}
                  {policyDetail.source && (
                    <span className="pd-source-item">
                      <span className="pd-source-label">来源</span>
                      <span className="pd-source-value">{policyDetail.source}</span>
                    </span>
                  )}
                </div>
              )}
              <h2 className="pd-title">
                {policyDetail.url ? <a href={policyDetail.url} target="_blank" rel="noopener noreferrer">{policyDetail.policyName} ↗</a> : policyDetail.policyName}
              </h2>
              <div className="pd-scores">
                <div className="pd-score-item">
                  <span className="pds-label">影响广度</span>
                  <RatingBar value={policyDetail.breadth} color="#1677ff" />
                  <span className="pd-rubric-hint">{getRubricHint('breadth', policyDetail.breadth)}</span>
                </div>
                <div className="pd-score-item">
                  <span className="pds-label">深远程度</span>
                  <RatingBar value={policyDetail.depth} color="#722ed1" />
                  <span className="pd-rubric-hint">{getRubricHint('depth', policyDetail.depth)}</span>
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
              {(() => {
                const pname = policyDetail.policyName.replace(/[（(].*[）)]/g, '').trim()
                const relatedActions = (actionPlans[personaKey] || []).filter(a => a.policyRef && (pname.includes(a.policyRef) || a.policyRef.includes(pname)))
                return relatedActions.length > 0 ? (
                  <div className="pd-action-card">
                    <h4>📋 此政策相关的待办事项</h4>
                    {relatedActions.slice(0, 2).map(a => (
                      <div key={a.id} className="pd-action-item">
                        <div className="pd-ai-header">
                          <span className="pd-ai-title">{a.title}</span>
                          <span className={`dah-urgency urgency-${a.urgency}`}>
                            {a.urgency === 'immediate' ? '紧急' : a.urgency === 'soon' ? '近期' : '关注'}
                          </span>
                        </div>
                        <ol className="pd-ai-steps">{a.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
                      </div>
                    ))}
                  </div>
                ) : null
              })()}
              <div className="pd-report-link">
                <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('数据问题报告：' + policyDetail.policyName)}`} className="report-issue-link" onClick={e => e.stopPropagation()}>
                  📮 发现数据不准确？报告问题 →
                </a>
              </div>
              <div className="pd-actions">
                {DIM_TO_TOOL[policyDetail.dimKey] !== undefined && DIM_TO_TOOL[policyDetail.dimKey] >= 0 && (
                  <button className="btn-calc" onClick={() => { setPolicyDetail(null); setTargetTool(DIM_TO_TOOL[policyDetail.dimKey]); setActiveTab('tools'); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:'smooth'}) }}>
                    ⚡ 算算对你的影响
                  </button>
                )}
                <button className="btn-primary" onClick={() => { setPolicyDetail(null); setActiveTab('dimensions'); setSelectedDim(policyDetail.dimKey); setTabKey(k=>k+1) }}>
                  查看「{policyDetail.dimName}」全部政策
                </button>
                <button className="btn-secondary" onClick={() => setPolicyDetail(null)}>关闭</button>
              </div>
            </div>
          </div>
        )}
        {/* ════════ TOOLS ════════ */}
        {activeTab === 'tools' && <Suspense fallback={<div style={{padding:40,textAlign:'center',color:'var(--text-secondary)'}}>加载中...</div>}><Tools regionKey={regionKey} toolParams={regionToolParams[regionKey] || regionToolParams.national} onNavigateDim={(key) => { setActiveTab('dimensions'); setSelectedDim(key); setTabKey(k=>k+1) }} initialTool={targetTool} /></Suspense>}

        {/* ════════ TOPICS ════════ */}
        {activeTab === 'topics' && (
          <div className="topics-page">
            <h2 className="section-title">🎯 场景化专题</h2>
            
            {/* Policy Milestones Timeline */}
            <div className="topic-search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" className="topic-search-input" placeholder="搜索专题（如：租房、医保、个税…）" aria-label="搜索专题"
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
          <UserCabinet personaKey={personaKey} stageKey={lifeRadar.personaStageMap[personaKey]||'mid_career'}
            onSwitchTab={(tab)=>{setActiveTab(tab);setTabKey(k=>k+1);window.scrollTo({top:0,behavior:'smooth'})}}
            onNavigateDim={(key)=>{setSelectedDim(key);setTabKey(k=>k+1)}}
            setShowHealthCheck={setShowHealthCheck} setShowQuiz={setShowQuiz}
            setShowWrongBook={setShowWrongBook} setShowDailyChallenge={setShowDailyChallenge}
            setShowShareModal={setShowShareModal} setShowTimeMachine={setShowTimeMachine}
            setShowDecisionProject={setShowDecisionProject} />
          <AchievementWall personaKey={personaKey} stageKey={lifeRadar.personaStageMap[personaKey]||'mid_career'} />
          <Dashboard personaKey={personaKey} regionKey={regionKey} bookmarks={bookmarks}
            userCity={userCity} userRegion={regions.find(r=>r.key===regionKey)}
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

      {/* 认知破局弹窗 */}
      <PolicyHealthCheck show={showHealthCheck} onClose={(hadResult)=>{setShowHealthCheck(false);if(hadResult)setCompassAutoExpand(true)}}
        personaKey={personaKey} userAge={userAge} userCity={userCity} />
      <SelfTestQuiz show={showQuiz} onClose={()=>{setShowQuiz(false);setQuizAnswers({});setQuizSubmitted(false)}} />
      {showWeeklyDigest && (
        <div className="modal-overlay" onClick={()=>setShowWeeklyDigest(false)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <WeeklyDigestCard compact={false} data={digestData||getWeeklyDigest({personaKey:personaKey||'worker',stageKey:lifeRadar.personaStageMap[personaKey]||'mid_career',regionKey,userProfile:getUserProfile()})}
              onClose={()=>setShowWeeklyDigest(false)} />
          </div>
        </div>
      )}
      <SubscriptionModal show={showSubscriptionModal} onClose={()=>setShowSubscriptionModal(false)} />
      <UgcSubmitModal show={showUgcModal} onClose={()=>setShowUgcModal(false)} />
      <NotificationPanel notifCount={notifCount} show={showNotifPanel}
        onClose={()=>setShowNotifPanel(false)}
        personaKey={personaKey} stageKey={lifeRadar.personaStageMap[personaKey]||'mid_career'} regionKey={regionKey}
        onSwitchTab={(tab)=>{setActiveTab(tab);setTabKey(k=>k+1);window.scrollTo({top:0,behavior:'smooth'})}} />
      <DailyChallengeModal show={showDailyChallenge} onClose={()=>setShowDailyChallenge(false)}
        challenge={(()=>{try{return getDailyChallenge(personaKey,getUserProfile())}catch{return null}})()}
        personaKey={personaKey} userProfile={(()=>{try{return getUserProfile()||{}}catch{return {}}})()}
        setNotifCount={setNotifCount} />
      <WrongAnswerBook show={showWrongBook} onClose={()=>setShowWrongBook(false)} />
      <ShareReportModal show={showShareModal} onClose={()=>setShowShareModal(false)} />
      <TimeMachinePanel show={showTimeMachine} onClose={()=>setShowTimeMachine(false)} />
      <DecisionProjectPanel show={showDecisionProject} onClose={()=>setShowDecisionProject(false)} onSwitchTab={(tab)=>{setActiveTab(tab);setTabKey(k=>k+1)}} />
      <CelebrationToast celebration={celebration} onClose={()=>setCelebration(null)} />
      <ToastContainer />
      <ProfileCenterModal show={showProfileCenter} onClose={()=>setShowProfileCenter(false)} personaKey={personaKey} />

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

/* ═══════ P0/P1/P2 用户价值深化组件 ═══════ */

/* P0: 价值闭环面板 */
function ValueClosedLoop() {
  const rv = useMemo(() => getRealizedValue(), [])
  return (
    <div className="value-closed-loop">
      <h3 className="vcl-title">💎 你的决策价值</h3>
      <div className="vcl-main">
        <div className="vcl-ring">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#27ae60" strokeWidth="8" strokeDasharray={`${rv.realizedPct*2.64} 264`} strokeLinecap="round" transform="rotate(-90 50 50)" />
          </svg>
          <div className="vcl-ring-text"><span>{rv.realizedPct}%</span><span>已实现</span></div>
        </div>
        <div className="vcl-data">
          <div className="vcl-row"><span className="vcl-label">已落地价值</span><span className="vcl-val vcl-green">¥{rv.realizedMax.toLocaleString()}</span></div>
          <div className="vcl-row"><span className="vcl-label">潜在可挖掘</span><span className="vcl-val vcl-blue">¥{rv.potentialMax.toLocaleString()}</span></div>
          <div className="vcl-row"><span className="vcl-label">已完成行动</span><span className="vcl-val">{rv.doneCount}/{rv.doneCount+rv.pendingCount}</span></div>
        </div>
      </div>
      {rv.actionItems.length>0 && (
        <div className="vcl-actions">
          <span className="vcl-subtitle">🏆 已落地的行动</span>
          {rv.actionItems.map((a,i)=>(<div key={i} className="vcl-action-item"><span>{i+1}.</span><span>{a.title||a.id}</span><span className="vcl-cost">¥{a.cost.min.toLocaleString()}-{a.cost.max.toLocaleString()}</span></div>))}
        </div>
      )}
    </div>
  )
}

/* P0: 成就墙 */
function AchievementWall({ personaKey, stageKey }) {
  const stats = useMemo(() => getUserStats(), [])
  const result = useMemo(() => checkAndAwardAchievements(stats), [stats])
  const achievements = result.all
  const newAwards = result.new
  return (
    <div className="achievement-wall">
      <h3 className="aw-title">🏅 成就徽章</h3>
      {newAwards.length>0 && (
        <div className="aw-new-banner">
          🎉 新获得：{newAwards.map(a=>a.icon+a.label).join('、')}
        </div>
      )}
      <div className="aw-grid">
        {achievementDefs.map(def => {
          const earned = achievements.find(a=>a.id===def.id)
          return (
            <div key={def.id} className={`aw-badge ${earned?'aw-earned':'aw-locked'}`} title={earned?`获得于 ${earned.awardedAt?.slice(0,10)}`:'尚未解锁'}>
              <span className="aw-icon">{def.icon}</span>
              <span className="aw-label">{def.label}</span>
              <span className="aw-desc">{def.desc}</span>
            </div>
          )
        })}
      </div>
      <div className="aw-count">{achievements.length}/{achievementDefs.length} 已解锁</div>
    </div>
  )
}

/* P0: 关键时刻提醒条 */
function UrgencyBanner() {
  const items = useMemo(() => getUrgencyItems(), [])
  if (items.length===0) return null
  return (
    <div className="urgency-banner">
      <div className="ub-header">⏰ 关键时刻提醒</div>
      <div className="ub-scroll">
        {items.map((item,i) => (
          <div key={i} className={`ub-item ub-${item.severity}`}>
            <span className="ub-days">{item.daysLeft}天{item.severity==='critical'?'⚠️':item.severity==='high'?'⚡':''}</span>
            <span className="ub-title">{item.title}</span>
            <span className="ub-type">{item.type==='deadline'?'截止':'立法'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* P1: 增长曲线 */
function GrowthChart() {
  const history = useMemo(() => getGrowthHistory(), [])
  if (history.length<2) return null
  const maxVal = Math.max(...history.map(h=>h.tierPct), 1)
  const pts = history.map((h,i)=>({x:(i/(Math.max(history.length-1,1)))*100,y:100-(h.tierPct/maxVal)*100,v:h.tierPct}))
  const path = pts.map((p,i)=>`${i===0?'M':'L'}${p.x} ${p.y}`).join(' ')
  return (
    <div className="growth-chart">
      <h4 className="gc-title">📈 政策感知力趋势</h4>
      <div className="gc-container">
        <svg width="100%" height="80" viewBox="0 0 100 80" preserveAspectRatio="none">
          <path d={path} fill="none" stroke="var(--p-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {pts.filter((_,i)=>i===0||i===pts.length-1).map((p,i)=>(<circle key={i} cx={p.x} cy={p.y} r="2.5" fill="var(--p-500)" />))}
        </svg>
        <div className="gc-labels">
          <span>{history[0]?.date?.slice(5)||''}</span>
          <span className="gc-curr">{pts[pts.length-1]?.v||0}分</span>
          <span>{history[history.length-1]?.date?.slice(5)||''}</span>
        </div>
      </div>
    </div>
  )
}

/* P1: 分享卡片 */
function ShareReportModal({ show, onClose }) {
  const report = useMemo(() => getShareReport(), [show])
  const [copied, setCopied] = useState(false)
  if (!show) return null
  const shareText = `🧭 我的策查查政策感知力报告\n段位：${report.tier.label}\n感知力：${report.tierPct}分\n已发现价值：¥${report.realizedMax.toLocaleString()}\n已完成行动：${report.actionsDone}项\n成就：${report.totalAchievements}个\n连续打卡：${report.streak}天`
  const handleCopy = () => { navigator.clipboard.writeText(shareText).then(()=>{setCopied(true);markShared();setTimeout(()=>setCopied(false),2000)}).catch(()=>{}) }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>📤 分享你的政策感知力</h3>
        <div className="share-card">
          <div className="sc-header">🧭 策查查 · 政策感知力报告</div>
          <div className="sc-body">
            <div className="sc-tier">{report.tier.icon} {report.tier.label} · {report.tierPct}分</div>
            <div className="sc-value">已发现价值 <strong>¥{report.realizedMax.toLocaleString()}</strong>（{report.realizedLabel}）</div>
            <div className="sc-stats">
              <span>🔥 连续{report.streak}天</span>
              <span>✅ {report.actionsDone}项行动</span>
              <span>🏅 {report.totalAchievements}个成就</span>
            </div>
            {report.achievements.length>0 && <div className="sc-badges">{report.achievements.map((a,i)=><span key={i} className="sc-badge" title={a.desc}>{a.icon}{a.label}</span>)}</div>}
          </div>
          <div className="sc-footer">{report.date}</div>
        </div>
        <button className="btn-primary" onClick={handleCopy} style={{width:'100%',marginTop:12}}>{copied?'✅ 已复制！':'📋 复制分享文字'}</button>
      </div>
    </div>
  )
}

/* P2: 决策项目管理 */
function DecisionProjectPanel({ show, onClose, onSwitchTab, onNavigateDim }) {
  const [projects, setProjects] = useState(()=>getDecisionProjects())
  const [newName, setNewName] = useState('')
  const [newGoal, setNewGoal] = useState('')
  const [adding, setAdding] = useState(false)
  const dimIcons = {housing:'🏠',employment:'💼',education:'🎓',elderly:'👴',finance:'💰',industry:'🏭'}
  if (!show) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content dp-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>📋 我的决策项目</h3>
        {projects.length===0 && !adding && (
          <div className="dp-empty">
            <p>还没有决策项目。创建一个来追踪你的人生重大决策吧！</p>
            <button className="btn-primary" onClick={()=>setAdding(true)}>+ 创建决策项目</button>
          </div>
        )}
        {adding && (
          <div className="dp-add-form">
            <input className="dp-input" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="项目名称，如：北京购房" />
            <input className="dp-input" value={newGoal} onChange={e=>setNewGoal(e.target.value)} placeholder="目标，如：2026年底前完成落户+购房" />
            <div className="dp-add-btns">
              <button className="btn-secondary" onClick={()=>{setAdding(false);setNewName('');setNewGoal('')}}>取消</button>
              <button className="btn-primary" disabled={!newName} onClick={()=>{createDecisionProject(newName,newGoal,['housing']);setProjects(getDecisionProjects());setAdding(false);setNewName('');setNewGoal('');checkAndAwardAchievements(getUserStats())}}>创建</button>
            </div>
          </div>
        )}
        <div className="dp-list">
          {projects.map(p=>(
            <div key={p.id} className="dp-project">
              <div className="dpp-header">
                <span className="dpp-name">{p.name}</span>
                <span className={`dpp-status dpp-${p.status}`}>{p.status==='active'?'进行中':p.status==='done'?'已完成':'暂停'}</span>
                <button className="dpp-del" onClick={()=>{deleteDecisionProject(p.id);setProjects(getDecisionProjects())}}>🗑</button>
              </div>
              {p.goal && <p className="dpp-goal">🎯 {p.goal}</p>}
              <div className="dpp-progress-bar"><div className="dpp-progress-fill" style={{width:p.progress+'%'}} /></div>
              <span className="dpp-progress-text">{p.progress}%</span>
              <div className="dpp-actions-row">
                <button className="btn-sm btn-secondary" onClick={()=>{updateDecisionProject(p.id,{status:p.status==='active'?'done':'active'});setProjects(getDecisionProjects())}}>
                  {p.status==='active'?'标记完成':'重新激活'}</button>
              </div>
              <span className="dpp-date">创建于 {p.createdAt?.slice(0,10)}</span>
            </div>
          ))}
        </div>
        {projects.length>0 && !adding && <button className="btn-secondary" onClick={()=>setAdding(true)} style={{marginTop:8,width:'100%'}}>+ 新建项目</button>}
      </div>
    </div>
  )
}

/* P2: 时间机器面板 */
function TimeMachinePanel({ show, onClose }) {
  const scenarios = useMemo(()=>getTimeMachineScenarios(), [])
  const [selected, setSelected] = useState(null)
  const [results, setResults] = useState({})
  if (!show) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tm-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>⏳ 政策时间机器</h3>
        <p className="tm-intro">看看如果早一点行动，你能省下多少</p>
        <div className="tm-grid">
          {scenarios.map(s=>{
            const result = results[s.id]
            return (
              <div key={s.id} className={`tm-card ${selected===s.id?'tm-expanded':''}`}
                onClick={()=>{
                  if(selected!==s.id){setSelected(s.id);const r=s.calc();setResults({...results,[s.id]:r})}
                  else setSelected(null)
                }}>
                <div className="tm-card-hd">
                  <span className="tm-icon">{s.icon}</span>
                  <span className="tm-title">{s.title}</span>
                </div>
                {selected===s.id && result && (
                  <div className="tm-result">
                    <span className="tm-cost">💸 机会成本约</span>
                    <span className="tm-amount">¥{result.totalSaved.toLocaleString()}</span>
                    <span className="tm-detail">{result.detail}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <p className="tm-footer">💡 种一棵树最好的时间是十年前，其次是现在</p>
      </div>
    </div>
  )
}

/* ═══════ 用户粘性增强组件 ═══════ */

/* 通知面板 */
function NotificationPanel({ notifCount, show, onClose, personaKey, stageKey, regionKey, onSwitchTab }) {
  const alerts = useMemo(() => getPolicyAlerts(), [])
  const subs = useMemo(() => getPolicySubscriptions(), [])
  const todayDone = getTodayChallengeDone()
  if (!show) return null
  return (
    <div className="notif-panel">
      <div className="notif-header"><span>🔔 通知中心</span><button className="notif-close" onClick={onClose}>✕</button></div>
      <div className="notif-body">
        {!todayDone && <div className="notif-item notif-challenge" onClick={()=>{onClose();onSwitchTab?.('overview')}}>
          <span className="notif-dot" />📝 今日政策挑战尚未完成 <span className="notif-arrow">→</span></div>}
        {subs.length>0 && <div className="notif-item" onClick={()=>{onClose();onSwitchTab?.('dimensions')}}>
          <span className="notif-dot notif-blue" />🔔 已订阅{subs.length}项政策 <span className="notif-arrow">→</span></div>}
        {alerts.map((a,i) => (
          <div key={i} className="notif-item" onClick={()=>{onClose();onSwitchTab?.('dimensions')}}>
            <span className="notif-dot notif-orange" />{a.title} · {a.status} <span className="notif-arrow">→</span></div>
        ))}
        {notifCount===0 && <div className="notif-empty">暂无新通知</div>}
      </div>
    </div>
  )
}

/* 每日政策挑战 */
function DailyChallengeCard({ challenge, personaKey, onStart }) {
  const done = getTodayChallengeDone()
  const streak = getStreak()
  const modeIcons = { impact:'🎯', forecast:'🔮', connect:'🔗' }
  const modeLabels = { impact:'个人关联', forecast:'趋势预判', connect:'连接生活' }
  if (done) {
    return (
      <div className="daily-challenge done">
        <span className="dc-icon">✅</span>
        <div className="dc-body"><span className="dc-title">今日洞察已完成</span><span className="dc-sub">明天继续！连续打卡 {streak} 天 🔥</span></div>
      </div>
    )
  }
  if (!challenge) return null
  return (
    <div className="daily-challenge" onClick={onStart}>
      <span className="dc-icon">{modeIcons[challenge.mode] || '📰'}</span>
      <div className="dc-body">
        <span className="dc-title">每日洞察 · {modeLabels[challenge.mode] || '政策'}</span>
        <span className="dc-sub">{challenge.title.slice(0, 32)}{challenge.title.length>32?'…':''}</span>
        {challenge.mode==='impact' && challenge.personalMatch !== undefined && (
          <span className={`dc-match ${challenge.personalMatch?'match-yes':'match-no'}`}>
            {challenge.personalMatch?'✅ 与你高度相关':'🔍 了解也有价值'}
          </span>
        )}
        <span className="dc-streak">🔥 连续 {streak} 天</span>
      </div>
      <span className="dc-go">去看看 →</span>
    </div>
  )
}

/* 每日洞察挑战弹窗 v2 */
function DailyChallengeModal({ show, onClose, challenge, personaKey, userProfile, setNotifCount }) {
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [votes, setVotes] = useState(null)
  const [expandedAngle, setExpandedAngle] = useState(null)
  const [expandedStep, setExpandedStep] = useState(0)
  if (!show || !challenge) return null

  const profile = userProfile || {}
  const mode = challenge.mode

  // ── impact 提交 ──
  const handleImpactSubmit = () => {
    submitDailyChallenge(challenge.id, 0, true)
    updateUserTier(1, 1)
    setResult({ type:'impact' })
    setNotifCount?.(getNotificationCount())
  }

  // ── forecast 提交 ──
  const handleForecastSubmit = () => {
    if (selected===null) return
    const updated = submitInsightVote(challenge.id, selected)
    setVotes(updated)
    submitDailyChallenge(challenge.id, 0, true)
    updateUserTier(1, 1)
    setResult({ type:'forecast', selected })
    setNotifCount?.(getNotificationCount())
  }

  // ── connect 提交 ──
  const handleConnectSubmit = () => {
    submitDailyChallenge(challenge.id, 0, true)
    updateUserTier(1, 1)
    setResult({ type:'connect' })
    setNotifCount?.(getNotificationCount())
  }

  const voteData = votes || challenge.votes
  const maxVote = voteData ? Math.max(voteData.A||0, voteData.B||0, voteData.C||0, voteData.D||0) : 1

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content dc-modal-v2" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {!result ? (
          <>
            {/* ═══ 提问页 ═══ */}
            <div className="dcv-mode-tag">
              {mode==='impact' && '🎯 个人关联'}
              {mode==='forecast' && '🔮 趋势预判'}
              {mode==='connect' && '🔗 连接生活'}
            </div>
            <h3 className="dcv-title">{challenge.title}</h3>
            <p className="dcv-hook">{challenge.hook}</p>

            {/* impact 模式 */}
            {mode === 'impact' && (
              <>
                <div className={`dcv-impact-match ${challenge.personalMatch ? 'match-yes' : 'match-else'}`}>
                  <span className="dcv-im-icon">{challenge.personalMatch ? '✅' : '💡'}</span>
                  <span>{challenge.personalReason}</span>
                </div>
                {challenge.personalCalc && (
                  <div className="dcv-impact-calc">
                    <span className="dcv-ic-label">预估影响</span>
                    <span className="dcv-ic-val">¥{challenge.personalCalc.save?.toLocaleString?.() || challenge.personalCalc.save} {challenge.personalCalc.unit}</span>
                  </div>
                )}
                <button className="btn-primary" onClick={handleImpactSubmit} style={{width:'100%',marginTop:16}}>
                  已了解，打卡完成
                </button>
              </>
            )}

            {/* forecast 模式 */}
            {mode === 'forecast' && (
              <>
                <p className="dcv-prompt">你怎么看？选择你的判断（无标准答案）</p>
                <div className="dcv-options">
                  {challenge.options.map(opt => (
                    <label key={opt.key} className={`dcv-option ${selected===opt.key?'selected':''}`}
                      onClick={()=>{setSelected(opt.key); setExpandedAngle(opt.key===expandedAngle?null:opt.key)}}>
                      <span className="dcv-radio">{selected===opt.key?'●':'○'}</span>
                      <div className="dcv-opt-body">
                        <span className="dcv-opt-label">{opt.label}</span>
                        <span className="dcv-opt-sectors">{opt.sectors} {opt.indicator}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {expandedAngle && (()=>{
                  const opt = challenge.options.find(o=>o.key===expandedAngle)
                  return opt ? <div className="dcv-angle"><span className="dcv-angle-label">📝 分析视角</span><p>{opt.angle}</p></div> : null
                })()}
                <button className="btn-primary" disabled={selected===null} onClick={handleForecastSubmit} style={{width:'100%',marginTop:12}}>
                  提交我的判断
                </button>
              </>
            )}

            {/* connect 模式 */}
            {mode === 'connect' && (
              <>
                <p className="dcv-prompt">跟着这条影响链，一步步看清对你意味着什么</p>
                <div className="dcv-chain">
                  {challenge.exploreSteps?.map((step, si) => (
                    <div key={si} className={`dcv-chain-step ${expandedStep>=si?'expanded':''}`}
                      onClick={()=>setExpandedStep(expandedStep>=si?si-1:si)}>
                      <div className="dcv-cs-header">
                        <span className="dcv-cs-num">{si+1}</span>
                        <span className="dcv-cs-label">{step.label}</span>
                        <span className="dcv-cs-arrow">{expandedStep>=si?'▾':'▸'}</span>
                      </div>
                      {expandedStep >= si && <p className="dcv-cs-detail">{step.detail}</p>}
                    </div>
                  ))}
                </div>
                <button className="btn-primary" onClick={handleConnectSubmit} style={{width:'100%',marginTop:12}}>
                  懂了，打卡完成
                </button>
              </>
            )}
          </>
        ) : (
          <>
            {/* ═══ 结果页 ═══ */}
            <div className="dcv-result-banner correct">🎉 今日洞察完成！</div>

            {result.type === 'forecast' && voteData && (
              <div className="dcv-vote-result">
                <p className="dcv-vr-title">社群判断分布</p>
                <div className="dcv-vr-bars">
                  {challenge.options.map(opt => {
                    const count = voteData[opt.key] || 0
                    const pct = voteData.total > 0 ? Math.round(count/voteData.total*100) : 0
                    const isUser = voteData.userVote === opt.key
                    return (
                      <div key={opt.key} className={`dcv-vr-bar ${isUser?'is-user':''}`}>
                        <span className="dcv-vrb-label">{opt.key}. {opt.label.slice(0,10)}{opt.label.length>10?'…':''}</span>
                        <div className="dcv-vrb-track"><div className="dcv-vrb-fill" style={{width:`${pct}%`}}>{pct>0 && <span>{pct}%</span>}</div></div>
                        {isUser && <span className="dcv-vrb-you">你</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 个人连接 */}
            {challenge.personalConnect && (
              <div className="dcv-connect-box">
                <span className="dcv-cb-label">📌 跟你有什么关系</span>
                <p>{challenge.personalConnect}</p>
              </div>
            )}
            {mode === 'impact' && challenge.personalCalc && (
              <div className="dcv-connect-box">
                <span className="dcv-cb-label">💰 预估影响</span>
                <p className="dcv-cb-val">¥{challenge.personalCalc.save?.toLocaleString?.() || challenge.personalCalc.save} {challenge.personalCalc.unit}</p>
              </div>
            )}

            <div className="dcv-streak-info">🔥 连续打卡 <strong>{getStreak()}</strong> 天</div>
            <button className="btn-primary" onClick={onClose} style={{width:'100%',marginTop:8}}>明天继续</button>
          </>
        )}
      </div>
    </div>
  )
}

/* ═══ 政策风向标 v2 — 全画像影响评估 ═══ */
function PolicyCompassPanel({ personaKey, userProfile, onSwitchTab, autoExpand, onAutoExpandHandled }) {
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    if (autoExpand) { setExpanded(true); onAutoExpandHandled?.() }
  }, [autoExpand])
  const compass = useMemo(() => {
    try { return getPolicyCompass(personaKey, userProfile) } catch { return null }
  }, [personaKey, JSON.stringify(userProfile || {})])
  if (!compass || !compass.signals.length) return null

  const urgencyIcons = { immediate:'🔴', soon:'🟡', watch:'🔵' }
  const urgencyLabels = { immediate:'立即', soon:'尽快', watch:'关注' }
  const summary = compass.impactSummary
  const hasFinancial = summary.totalMin > 0

  return (
    <div className="policy-compass">
      <div className="pc-header" onClick={()=>setExpanded(!expanded)}>
        <span className="pc-header-icon">🧭</span>
        <div className="pc-header-text">
          <span className="pc-header-title">政策风向标 · 个人影响评估</span>
          <span className="pc-header-sub">
            {compass.matchedSignals}条信号匹配 · {compass.domains.length}个决策域
            {hasFinancial && <span className="pc-header-badge">影响约 ¥{(summary.totalMin/10000).toFixed(1)}-{(summary.totalMax/10000).toFixed(1)}万</span>}
          </span>
        </div>
        <span className="pc-header-arrow">{expanded?'▾':'▸'}</span>
      </div>
      {expanded && (
        <div className="pc-body">
          {/* 影响汇总仪表盘 */}
          <div className="pc-summary-dash">
            <div className="pcsd-item pcsd-total">
              <span className="pcsd-label">预估综合影响</span>
              <span className="pcsd-val">{hasFinancial?`¥${(summary.totalMin/10000).toFixed(1)}-${(summary.totalMax/10000).toFixed(1)}万`:'待评估'}</span>
            </div>
            <div className="pcsd-item pcsd-urgent">
              <span className="pcsd-label">需立即处理</span>
              <span className="pcsd-val">{summary.highCount}项</span>
            </div>
            <div className="pcsd-item pcsd-soon">
              <span className="pcsd-label">近期关注</span>
              <span className="pcsd-val">{summary.soonCount}项</span>
            </div>
          </div>
          {/* 决策域快速导航 */}
          <div className="pc-domains">
            {compass.domains.map(d => (
              <span key={d.key} className="pc-domain-chip" title={`${d.label}：${d.count}条信号`}>
                {d.icon} {d.label}×{d.count}
              </span>
            ))}
          </div>
          {/* 信号三层展示 */}
          <div className="pc-signals">
            {compass.signals.map(s => (
              <div key={s.id} className={`pc-signal pc-sig-${s.urgency}`}>
                {/* Layer 0: 元信息 */}
                <div className="pcs-meta">
                  <span className="pcs-domain-tag">{domainMeta[s.domain]?.icon} {domainMeta[s.domain]?.label}</span>
                  <span className={`pcs-urgency-tag pcs-urg-${s.urgency}`}>{urgencyIcons[s.urgency]} {urgencyLabels[s.urgency]}</span>
                  <span className={`pcs-conf-tag ${s.confidence}`}>{s.confidence==='high'?'高确定性':'参考'}</span>
                  {s._financial?.min>0 && <span className="pcs-cost-tag">影响 ¥{s._financial.min.toLocaleString()}+</span>}
                </div>
                {/* Layer 1: 政策变化 */}
                <div className="pcs-layer pcs-layer-change">
                  <span className="pcs-layer-label">📋 政策变化</span>
                  <p>{s.change}</p>
                </div>
                {/* Layer 2: 对你意味着什么 */}
                <div className="pcs-layer pcs-layer-impact">
                  <span className="pcs-layer-label">💡 {s._score>=70?'对你有显著影响':s._score>=40?'与你相关':'值得了解'}</span>
                  <p>{s.impactText}</p>
                  {s._financial?.min>0 && (
                    <div className="pcs-impact-estimate">
                      <span>💰 预估影响：¥{s._financial.min.toLocaleString()}-{s._financial.max.toLocaleString()} {s._financial.unit}</span>
                    </div>
                  )}
                </div>
                {/* Layer 3: 同类人怎么看 + 行动建议 */}
                {s.peerInsight && (
                  <div className="pcs-layer pcs-layer-peer">
                    <span className="pcs-layer-label">👥 同类人洞察</span>
                    <p>{s.peerInsight}</p>
                  </div>
                )}
                <div className="pcs-layer pcs-layer-action">
                  <span className="pcs-layer-label">→ 你的行动建议</span>
                  <p>{s.actionText}</p>
                  <button className="pcs-create-project" onClick={(e)=>{e.stopPropagation();createDecisionProject(s.change.slice(0,30),s.actionText,[s.domain]);}}>📋 加入决策项目</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* 优先行动清单 — 从风向标中提取3条最紧急信号 */
function PriorityActionList({ personaKey }) {
  const userProfile = useMemo(() => { try { return getUserProfile() } catch { return {} } }, [])
  const compass = useMemo(() => {
    try { return getPolicyCompass(personaKey, userProfile) } catch { return null }
  }, [personaKey, JSON.stringify(userProfile || {})])
  if (!compass || !compass.signals.length) return null

  const top3 = compass.signals.filter(s => s.urgency === 'immediate' || s.urgency === 'soon').slice(0, 3)
  if (!top3.length) return null

  const urgencyIcons = { immediate:'🔴', soon:'🟡' }
  const urgencyLabels = { immediate:'立即', soon:'尽快' }
  const totalMin = top3.reduce((sum, s) => sum + (s._financial?.min || 0), 0)
  const totalMax = top3.reduce((sum, s) => sum + (s._financial?.max || 0), 0)

  return (
    <div className="cabinet-priority">
      <div className="cpr-header">
        <span className="cpr-title">⚡ 优先行动清单</span>
        {totalMin > 0 && <span className="cpr-total">影响约 ¥{(totalMin/10000).toFixed(1)}-{(totalMax/10000).toFixed(1)}万</span>}
      </div>
      <div className="cpr-list">
        {top3.map((s, i) => (
          <div key={s.id} className={`cpr-item cpr-${s.urgency}`}>
            <span className="cpr-rank">{i + 1}</span>
            <span className="cpr-domain">{domainMeta[s.domain]?.icon}</span>
            <div className="cpr-body">
              <div className="cpr-action-text">{s.actionText.length > 60 ? s.actionText.slice(0, 60) + '...' : s.actionText}</div>
              <div className="cpr-meta-row">
                <span className={`cpr-urgency ${s.urgency}`}>{urgencyIcons[s.urgency]} {urgencyLabels[s.urgency]}</span>
                {s._financial?.min > 0 && <span className="cpr-impact">💰 ¥{s._financial.min.toLocaleString()}+</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* 用户驾驶舱（Dashboard增强） */
function UserCabinet({ personaKey, stageKey, onSwitchTab, onNavigateDim, setShowHealthCheck, setShowQuiz, setShowWrongBook, setShowDailyChallenge, setShowShareModal, setShowTimeMachine, setShowDecisionProject }) {
  const summary = useMemo(() => getValueSummary(personaKey||'', stageKey||''), [personaKey, stageKey])
  const tierData = useMemo(() => getUserTier(), [])
  const wrongs = useMemo(() => getWrongAnswers().filter(w=>!w.mastered), [])
  const tools = useMemo(() => getToolResults().slice(0, 5), [])
  const streak = getStreak()
  const todayDone = getTodayChallengeDone()

  return (
    <div className="user-cabinet">
      <h3 className="cabinet-title">🧭 我的决策驾驶舱</h3>
      
      {/* 收益总览卡 */}
      <div className="cabinet-value-card">
        <div className="cvc-header">
          <span className="cvc-icon">💰</span>
          <span className="cvc-title">策查查为你发现的潜在价值</span>
        </div>
        <div className="cvc-amount">
          <span className="cvc-min">¥{summary.potentialMin.toLocaleString()}</span>
          <span className="cvc-sep">-</span>
          <span className="cvc-max">¥{summary.potentialMax.toLocaleString()}</span>
          <span className="cvc-label">（{summary.potentialLabel}）</span>
        </div>
        <div className="cvc-stats">
          <div className="cvc-stat" onClick={()=>onSwitchTab?.('radar')}><span className="cvc-num">{summary.doneActions}</span><span className="cvc-desc">已完成行动</span></div>
          <div className="cvc-stat"><span className="cvc-num">{summary.actionPct}%</span><span className="cvc-desc">行动完成率</span></div>
          <div className="cvc-stat" onClick={()=>setShowWrongBook?.(true)}><span className="cvc-num">{wrongs.length}</span><span className="cvc-desc">待复习错题</span></div>
        </div>
      </div>

      {/* P0: 价值闭环 */}
      <ValueClosedLoop />

      {/* P0: 关键时刻提醒 */}
      <UrgencyBanner />

      {/* 段位+打卡+新功能入口 */}
      <div className="cabinet-row">
        <div className="cabinet-tier-card" onClick={()=>setShowQuiz?.(true)}>
          <span className="ctc-label">政策感知力 · 点击自测</span>
          <span className="ctc-tier">{summary.tier?.label || '🟤 小白'}</span>
          <span className="ctc-pct">{summary.tierPct}分</span>
          <div className="ctc-sub">题库33题 · 多模式</div>
        </div>
        <div className="cabinet-streak-card" onClick={()=>setShowDailyChallenge?.(true)}>
          <span className="csc-label">连续打卡</span>
          <span className="csc-days">{streak}天</span>
          <span className={`csc-status ${todayDone?'done':'pending'}`}>{todayDone?'今日已完成':'去答题'}</span>
        </div>
        <div className="cabinet-action-card" onClick={()=>setShowHealthCheck?.(true)}>
          <span className="cac-label">政策体检</span>
          <span className="cac-icon">🔍</span>
          <span className="cac-status">{summary.doneActions>0?'已体检':'去体检'}</span>
        </div>
      </div>

      {/* 优先行动清单 — 政策风向标精华 */}
      <PriorityActionList personaKey={personaKey} />

      {/* 知识树 */}
      <div className="knowledge-tree">
        <h4>🌳 你的政策知识树</h4>
        <div className="kt-dims">
          {[{key:'housing',icon:'🏠',label:'房产'},{key:'employment',icon:'💼',label:'就业'},{key:'education',icon:'🎓',label:'教育'},{key:'elderly',icon:'👴',label:'养老'},{key:'finance',icon:'💰',label:'金融'},{key:'industry',icon:'🏭',label:'产业'}].map(d => {
            const dimWrongs = wrongs.filter(w => w.dim === d.key)
            const score = Math.max(0, 100 - dimWrongs.length * 20)
            const barColor = score >= 80 ? '#27ae60' : score >= 50 ? '#e67e22' : '#e74c3c'
            return (
              <div key={d.key} className="kt-item" onClick={()=>{onNavigateDim?.(d.key);onSwitchTab?.('dimensions')}}>
                <span className="kt-icon">{d.icon}</span>
                <span className="kt-label">{d.label}</span>
                <div className="kt-bar"><div className="kt-fill" style={{width:score+'%',background:barColor}} /></div>
                <span className="kt-pct">{score}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* P1: 增长曲线 */}
      <GrowthChart />

      {/* 最近工具结果 */}
      {tools.length>0 && (
        <div className="cabinet-tools">
          <h4>🧮 最近计算结果</h4>
          <div className="ct-list">
            {tools.map(t => (
              <div key={t.id} className="ct-item" onClick={()=>onSwitchTab?.('tools')}>
                <span className="ct-tool-name">{t.tool}</span>
                <span className="ct-tool-date">{t.savedAt?.slice(0,10)}</span>
                <span className="ct-arrow">→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* P1: 分享 + P2: 时间机器 & 决策项目 */}
      <div className="cabinet-extra-actions">
        <button className="btn-secondary" onClick={()=>{setShowShareModal?.(true);markShared();checkAndAwardAchievements(getUserStats())}} style={{flex:1}}>📤 分享我的报告</button>
        <button className="btn-secondary" onClick={()=>setShowTimeMachine?.(true)} style={{flex:1}}>⏳ 时间机器</button>
        <button className="btn-secondary" onClick={()=>{setShowDecisionProject?.(true)}} style={{flex:1}}>📋 决策项目</button>
      </div>

      {summary.doneActions===0 && summary.potentialMax===0 && (
        <div className="cabinet-empty">
          <p>📡 还没有数据，开始探索吧！</p>
          <button className="btn-primary" onClick={()=>onSwitchTab?.('radar')}>开启人生雷达</button>
        </div>
      )}
    </div>
  )
}

/* 错题本弹窗 */
function WrongAnswerBook({ show, onClose }) {
  const [wrongs, setWrongs] = useState(() => getWrongAnswers())
  const active = wrongs.filter(w => !w.mastered)
  const mastered = wrongs.filter(w => w.mastered)
  if (!show) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wrong-book-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>📝 我的错题本</h3>
        <div className="wb-stats"><span>🟡 待复习 {active.length} 题</span><span>✅ 已掌握 {mastered.length} 题</span></div>
        {active.length===0 ? (
          <div className="wb-empty">🎉 没有待复习的错题！</div>
        ) : (
          <div className="wb-list">
            {active.map(w => (
              <div key={w.id} className="wb-item">
                <p className="wb-question">{w.question}</p>
                <div className="wb-answers">
                  <span className="wb-wrong">你的答案：{w.userAnswer}</span>
                  <span className="wb-correct">正确答案：{w.correctAnswer}</span>
                </div>
                <p className="wb-exp">{w.explanation}</p>
                <button className="btn-secondary btn-sm" onClick={()=>{markWrongAnswerMastered(w.id);setWrongs(getWrongAnswers())}}>我已掌握</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════ 价值感知横幅 — 首页高可见度 ═══════ */
function ValuePerceptionBanner({ personaKey, stageKey, onSwitchTab }) {
  const summary = useMemo(() => {
    try { return getValueSummary(personaKey || 'worker', stageKey || 'mid_career') } catch { return null }
  }, [personaKey, stageKey])
  const tier = summary?.tier
  const quizStats = useMemo(() => { try { return getQuizStats() } catch { return null } }, [])
  if (!summary || summary.potentialMax <= 0) return null
  return (
    <div className="value-banner" onClick={() => onSwitchTab?.('dashboard')}>
      <div className="vb-left">
        <span className="vb-icon">💎</span>
        <div className="vb-text">
          <span className="vb-title">策查查为你发现的潜在价值</span>
          <span className="vb-amount">¥{summary.potentialMax.toLocaleString()}</span>
          {summary.potentialMin > 0 && <span className="vb-range">（¥{summary.potentialMin.toLocaleString()} ~ ¥{summary.potentialMax.toLocaleString()}）</span>}
        </div>
      </div>
      <div className="vb-right">
        {tier && <span className="vb-tier" style={{color: tier.color}}>{tier.icon} {tier.label} · {summary.tierPct}分</span>}
        {quizStats && quizStats.done > 0 && <span className="vb-quiz">📝 已测{quizStats.done}/33题 · 正确率{quizStats.accuracy}%</span>}
        <span className="vb-arrow">查看驾驶舱 →</span>
      </div>
    </div>
  )
}

/* ═══════ 认知破局增强组件 ═══════ */

/* P0: 首页「你可能不知道」区块 */
function DiscoveryPanel({ personaKey, stageKey, regionKey, userCity, userAge, onSwitchTab, onNavigateDim, setShowHealthCheck, setShowQuiz, setShowWeeklyDigest }) {
  const [tab, setTab] = useState('blindspots')
  const digest = useMemo(() => getWeeklyDigest({ personaKey: personaKey||'worker', stageKey: stageKey||'mid_career', regionKey, viewHistory:[], userProfile: getUserProfile() }), [personaKey, stageKey, regionKey])
  const peers = useMemo(() => getPeerDiscoveries({ personaKey: personaKey||'worker', stageKey: stageKey||'mid_career' }), [personaKey, stageKey])
  return (
    <section className="discovery-panel" id="discovery-panel">
      <div className="dp-header">
        <h2 className="section-title">🎯 你可能不知道</h2>
        <div className="dp-tabs">
          <button className={`dp-tab ${tab==='blindspots'?'active':''}`} onClick={()=>setTab('blindspots')}>⚡盲区</button>
          <button className={`dp-tab ${tab==='peers'?'active':''}`} onClick={()=>setTab('peers')}>👥同路人</button>
          <button className={`dp-tab ${tab==='outlook'?'active':''}`} onClick={()=>setTab('outlook')}>📡前瞻</button>
          <button className={`dp-tab ${tab==='digest'?'active':''}`} onClick={()=>setTab('digest')}>📬周报</button>
        </div>
      </div>
      <div className="dp-body">
        {tab==='blindspots' && (
          <div className="dp-list">
            {digest.signals.map((s,i) => {
              const cost = s.cost
              return (
                <div key={i} className="dp-item" onClick={()=>onSwitchTab?.('radar')}>
                  <span className={s.type==='blindspot'?'dp-icon-warn':'dp-icon-opp'}>{s.type==='blindspot'?'⚠️':'✅'}</span>
                  <div className="dp-item-body">
                    <span className="dp-item-title">{s.title}</span>
                    <span className="dp-item-desc">{s.desc?.slice(0,40)}{s.desc?.length>40?'…':''}</span>
                    {cost && <span className="dp-item-cost">💸 影响 <strong>¥{cost.min.toLocaleString()}-{cost.max.toLocaleString()}</strong> {cost.unit}</span>}
                  </div>
                  <span className="dp-arrow">→</span>
                </div>
              )
            })}
            <button className="dp-more-btn" onClick={()=>onSwitchTab?.('radar')}>查看完整盲区清单 →</button>
          </div>
        )}
        {tab==='peers' && (
          <div className="dp-list">
            {peers.map((p,i) => (
              <div key={i} className="dp-item" onClick={()=>onSwitchTab?.('radar')}>
                <span className="dp-pct-badge">{p.pct}%</span>
                <div className="dp-item-body"><span className="dp-item-title">{p.title}</span><span className="dp-item-desc">{p.desc}</span></div>
                <span className="dp-arrow">→</span>
              </div>
            ))}
            <button className="dp-more-btn" onClick={()=>onSwitchTab?.('radar')}>发现更多同路人关注 →</button>
          </div>
        )}
        {tab==='outlook' && (
          <div className="dp-list">
            {digest.outlook.map((o,i) => (
              <div key={i} className="dp-item" onClick={()=>onNavigateDim?.(o.dim||'housing')}>
                <span className="dp-outlook-status" style={{background:o.status?.includes('审议')?'#e67e22':'#1a237e'}}>{o.status||'前瞻'}</span>
                <div className="dp-item-body"><span className="dp-item-title">{o.name||'政策前瞻'}</span><span className="dp-item-desc">{o.note?.slice(0,40)}{o.note?.length>40?'…':''}</span></div>
                <span className="dp-arrow">→</span>
              </div>
            ))}
            <button className="dp-more-btn" onClick={()=>onSwitchTab?.('dimensions')}>查看完整立法前瞻 →</button>
          </div>
        )}
        {tab==='digest' && <WeeklyDigestCard data={digest} />}
      </div>
      <div className="dp-actions">
        <button className="dp-action-btn" onClick={()=>setShowHealthCheck?.(true)}>🔍 政策体检</button>
        <button className="dp-action-btn" onClick={()=>setShowQuiz?.(true)}>🎮 盲区自测 · 33题多模式</button>
        <button className="dp-action-btn" onClick={()=>setShowWeeklyDigest?.(true)}>📬 本周简报</button>
      </div>
    </section>
  )
}

/* P0: 增强案例墙（动态筛选+详情+社交证明） */
function EnhancedTestimonialWall({ personaKey, stageKey, userCity, userAge, testimonialScenario, testimonialStage, expandedTestimonial, setExpandedTestimonial, setTestimonialScenario, setTestimonialStage }) {
  const filtered = useMemo(() => {
    let list = [...enhancedTestimonials]
    if (testimonialScenario!=='all') list = list.filter(t=>t.scenario===testimonialScenario)
    if (testimonialStage!=='all') list = list.filter(t=>t.stage===testimonialStage)
    if (testimonialScenario==='all'&&testimonialStage==='all'&&(personaKey||stageKey)) {
      const similar = getSimilarTestimonials({ personaKey: personaKey||'worker', age:userAge, city:userCity, stageKey: stageKey||'mid_career' })
      const ids = similar.map(s=>s.id)
      list.sort((a,b)=>{const ai=ids.indexOf(a.id),bi=ids.indexOf(b.id);if(ai>=0&&bi>=0)return ai-bi;if(ai>=0)return -1;if(bi>=0)return 1;return 0})
    }
    return list
  }, [testimonialScenario,testimonialStage,personaKey,stageKey,userCity,userAge])
  const scenarios = [...new Set(enhancedTestimonials.map(t=>t.scenario))]
  const stages = [...new Set(enhancedTestimonials.map(t=>t.stage))]
  const stageLabels = { young_single:'单身青年', newlywed:'新婚备孕', young_parent:'学龄家长', mid_career:'事业上升期', approaching_retire:'临近退休', entrepreneur:'创业者' }
  return (
    <div className="enhanced-testimonial-wall">
      <h3 className="tw-title">💡 他们正在用策查查做决策</h3>
      <div className="tw-filters">
        <select className="tw-filter" value={testimonialScenario} onChange={e=>setTestimonialScenario(e.target.value)}>
          <option value="all">全部场景</option>{scenarios.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <select className="tw-filter" value={testimonialStage} onChange={e=>setTestimonialStage(e.target.value)}>
          <option value="all">全部阶段</option>{stages.map(s=><option key={s} value={s}>{stageLabels[s]||s}</option>)}
        </select>
      </div>
      <div className="tw-scroll">
        {filtered.map(t => (
          <div key={t.id} className={`tw-card ${expandedTestimonial===t.id?'tw-card-expanded':''}`}
            onClick={()=>setExpandedTestimonial(expandedTestimonial===t.id?null:t.id)}>
            <div className="tw-header">
              <span className="tw-icon">{t.icon}</span>
              <div><span className="tw-role">{t.role}</span><span className="tw-age">{t.age}岁</span><span className="tw-city">{t.city}</span></div>
              <div className="tw-social"><span title="点赞">👍 {t.likes}</span><span title="有用">✅ {t.helpful}</span></div>
            </div>
            <p className="tw-quote">"{t.quote}"</p>
            <div className="tw-result"><span className="tw-result-label">决策收益</span><span className="tw-result-val">{t.result}</span></div>
            {expandedTestimonial===t.id && (
              <div className="tw-detail">
                <div className="tw-path"><span className="tw-path-label">决策路径</span><span className="tw-path-text">{t.path}</span></div>
                <div className="tw-tags"><span className="tw-tag">{t.scenario}</span><span className="tw-tag">{stageLabels[t.stage]||t.stage}</span><span className="tw-tag">{t.city}</span></div>
              </div>
            )}
          </div>
        ))}
      </div>
      {filtered.length===0 && <div className="tw-empty">当前筛选条件下没有案例</div>}
    </div>
  )
}

/* P1: 交互式传导图谱 */
function CrossLinkGraph() {
  const [selected, setSelected] = useState(null)
  const dimI = { housing:'🏠', employment:'💼', education:'🎓', elderly:'👴', finance:'💰', industry:'🏭' }
  return (
    <div className="cross-link-graph">
      <h3>🕸️ 政策传导图谱</h3>
      <p className="clg-desc">点击查看政策之间的联动链条</p>
      <div className="clg-grid">
        {crossLinks.map((l,i) => (
          <div key={i} className={`clg-item ${selected===i?'clg-selected':''}`} onClick={()=>setSelected(selected===i?null:i)}>
            <div className="clg-flow"><span className="clg-from"><span className="clg-dim-icon">{dimI[l.dim1]||'📋'}</span>{l.from}</span><span className="clg-arrow">→</span><span className="clg-to">{l.to}<span className="clg-dim-icon">{dimI[l.dim2]||'📋'}</span></span></div>
            {selected===i && <div className="clg-note">💡 {l.note}</div>}
            <div className="clg-dims"><span className="clg-dim-tag">{l.dim1}</span><span className="clg-connector">+</span><span className="clg-dim-tag">{l.dim2}</span></div>
          </div>
        ))}
      </div>
      <div className="clg-legend">共{crossLinks.length}条传导链 · 点击展开详情</div>
    </div>
  )
}

/* P2: 政策预演场景 */
function ScenarioPreEnact({ onNavigateDim }) {
  const [expanded, setExpanded] = useState(null)
  const impactColor = v => v==='利好'?'var(--success)':v==='利空'?'var(--error)':'var(--text-muted)'
  return (
    <div className="scenario-pre-enact">
      <h3>🔮 政策预演 · 以你的决策场景</h3>
      <p className="spe-desc">选择你正在考虑的事，看相关政策的综合影响</p>
      <div className="spe-grid">
        {scenarioGroups.map(sg => (
          <div key={sg.key} className={`spe-card ${expanded===sg.key?'spe-expanded':''}`}
            onClick={()=>setExpanded(expanded===sg.key?null:sg.key)}>
            <div className="spe-card-header">
              <span className="spe-icon">{sg.icon}</span>
              <div className="spe-card-info"><span className="spe-label">{sg.label}</span><span className="spe-desc-text">{sg.desc}</span></div>
              <span className="spe-count">{sg.policies.length}项</span><span className="spe-arrow">{expanded===sg.key?'▲':'▼'}</span>
            </div>
            {expanded===sg.key && (
              <div className="spe-policies">
                {sg.policies.map((p,pi) => (
                  <div key={pi} className="spe-policy" onClick={e=>{e.stopPropagation();onNavigateDim?.(sg.dims[0])}}>
                    <span className="spe-p-name">{p.title}</span>
                    <span className="spe-p-impact" style={{color:impactColor(p.impact)}}>{p.impact}</span>
                    <span className="spe-p-note">{p.note}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══ 画像中心 — 查看/编辑个人画像 ═══ */
function ProfileCenterModal({ show, onClose, personaKey }) {
  const [profile, setProfile] = useState(() => getUserProfile())
  const [saved, setSaved] = useState(false)
  if (!show) return null
  const persona = personas.find(p => p.key === personaKey)
  const updated = profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('zh-CN') : '尚未填写'
  const dataUsage = [
    { field: '年龄', uses: ['体检评分', '风向标紧急度', '养老/退休信号'] },
    { field: '性别', uses: ['退休年龄', '产假/生育津贴', '延迟退休'] },
    { field: '学历', uses: ['人才落户', '新质生产力适配', '个税税率'] },
    { field: '城市', uses: ['房价差异', '公积金政策', '保租房'] },
    { field: '房产', uses: ['LPR影响', '换房退税', '以旧换新'] },
    { field: '子女', uses: ['教育专业', '婴幼儿照护', '个税扣除'] },
    { field: '婚姻', uses: ['购房资格', '生育政策', '财产规划'] },
    { field: '就业', uses: ['灵活就业社保', '创业扶持', '失业保障'] },
  ]
  const handleSave = () => {
    saveUserProfile(profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-center-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>👤 我的画像中心</h3>
        <p className="pc-intro">你的画像数据决定了所有个性化分析的准确度。数据仅存储在本地浏览器。</p>

        {/* 当前身份 */}
        <div className="pc-persona-row">
          <span className="pc-persona-label">当前身份</span>
          <span className="pc-persona-val">{persona ? `${persona.icon} ${persona.label}` : '未选择'}</span>
        </div>

        {/* 画像表单 */}
        <div className="pc-form">
          <div className="pc-form-row">
            <label className="pc-field"><span>年龄</span><input type="number" value={profile.age||''} onChange={e=>setProfile({...profile,age:+e.target.value})} min={18} max={80} placeholder="如：30" /></label>
            <label className="pc-field"><span>性别</span>
              <select value={profile.gender||''} onChange={e=>setProfile({...profile,gender:e.target.value})}>
                <option value="">请选择</option><option value="男">男</option><option value="女">女</option>
              </select>
            </label>
          </div>
          <div className="pc-form-row">
            <label className="pc-field"><span>学历</span>
              <select value={profile.education||''} onChange={e=>setProfile({...profile,education:e.target.value})}>
                <option value="">请选择</option><option value="高中及以下">高中及以下</option><option value="大专">大专</option><option value="本科">本科</option><option value="硕士">硕士</option><option value="博士">博士</option>
              </select>
            </label>
            <label className="pc-field"><span>城市</span><input value={profile.city||''} onChange={e=>setProfile({...profile,city:e.target.value})} placeholder="如：上海" /></label>
          </div>
          <div className="pc-checks">
            <label className="pc-check"><input type="checkbox" checked={!!profile.hasHouse} onChange={e=>setProfile({...profile,hasHouse:e.target.checked})} />已有房产</label>
            <label className="pc-check"><input type="checkbox" checked={!!profile.hasChild} onChange={e=>setProfile({...profile,hasChild:e.target.checked})} />有子女</label>
            <label className="pc-check"><input type="checkbox" checked={!!profile.isMarried} onChange={e=>setProfile({...profile,isMarried:e.target.checked})} />已婚</label>
            <label className="pc-check"><input type="checkbox" checked={!!profile.isSelfEmployed} onChange={e=>setProfile({...profile,isSelfEmployed:e.target.checked})} />自由职业/创业</label>
          </div>
        </div>

        <button className="btn-primary" onClick={handleSave} style={{width:'100%',marginTop:12}}>{saved?'✅ 已保存':'保存画像'}</button>

        {/* 数据用途透明化 */}
        <div className="pc-usage">
          <h4>🔍 你的数据用在哪里？</h4>
          <div className="pc-usage-grid">
            {dataUsage.map(d => (
              <div key={d.field} className="pc-usage-item">
                <span className="pc-usage-field">{d.field}</span>
                <span className="pc-usage-uses">{d.uses.join(' · ')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pc-footer">
          <span className="pc-updated">📅 最后更新：{updated}</span>
          <button className="pc-clear" onClick={()=>{localStorage.removeItem('user_profile');setProfile({});setSaved(false)}}>清除数据</button>
        </div>
      </div>
    </div>
  )
}

/* P1: 政策体检诊断 */
function PolicyHealthCheck({ show, onClose, personaKey, userAge, userCity }) {
  const [form, setForm] = useState({ age:userAge||30, gender:'男', education:'本科', city:userCity||'', personaKey:personaKey||'worker', hasHouse:false, hasChild:false, isMarried:false, isSelfEmployed:false })
  const [result, setResult] = useState(null)
  const [filterDim, setFilterDim] = useState('all')
  if (!show) return null
  const maxDimScore = Math.max(...(result?.dimScores?.map(d=>d.score) || [0]), 1)
  const dims = result ? result.dimScores : []
  const filteredIssues = result ? (filterDim === 'all' ? result.issues : result.issues.filter(i => {
    const dim = dims.find(d => d.count > 0 && result.issues.filter(x => x.severity).includes(i))
    return i.id && dims.find(d => d.count > 0 && i.title && d.label && i.title.includes(d.label))
  }) || result.issues) : []
  // 更简单的按维度过滤
  const dimFiltered = !result ? [] : filterDim === 'all' ? result.issues : result.issues.filter(i => {
    const dimsOfIssues = {}
    result.dimScores.forEach(d => { dimsOfIssues[d.dim] = d.label })
    return true // 简化：全部显示，用tab高亮
  })
  const displayIssues = result ? result.issues : []
  const severityCounts = result ? `${result.highCount}高危 ${result.mediumCount}关注 ${result.lowCount}提示` : ''
  return (
    <div className="modal-overlay" onClick={()=>onClose(!!result)}>
      <div className="modal-content health-check-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={()=>onClose(!!result)}>✕</button>
        {!result ? (
          <>
            <h3>🔍 政策体检诊断</h3>
            <p className="health-intro">填写基本画像，AI 扫描你对政策的认知盲区</p>
            <div className="health-form">
              <div className="health-row">
                <label className="health-field health-field-half"><span>年龄</span><input type="number" value={form.age} onChange={e=>setForm({...form,age:+e.target.value})} min={18} max={80} /></label>
                <label className="health-field health-field-half"><span>性别</span>
                  <select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}>
                    <option value="男">男</option><option value="女">女</option>
                  </select>
                </label>
              </div>
              <div className="health-row">
                <label className="health-field health-field-half"><span>学历</span>
                  <select value={form.education} onChange={e=>setForm({...form,education:e.target.value})}>
                    <option value="高中及以下">高中及以下</option><option value="大专">大专</option><option value="本科">本科</option><option value="硕士">硕士</option><option value="博士">博士</option>
                  </select>
                </label>
                <label className="health-field health-field-half"><span>城市</span><input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} placeholder="如：上海" /></label>
              </div>
              <div className="health-checks">
                <label className="health-check"><input type="checkbox" checked={form.hasHouse} onChange={e=>setForm({...form,hasHouse:e.target.checked})} />已有房产</label>
                <label className="health-check"><input type="checkbox" checked={form.hasChild} onChange={e=>setForm({...form,hasChild:e.target.checked})} />有子女</label>
                <label className="health-check"><input type="checkbox" checked={form.isMarried} onChange={e=>setForm({...form,isMarried:e.target.checked})} />已婚</label>
                <label className="health-check"><input type="checkbox" checked={form.isSelfEmployed} onChange={e=>setForm({...form,isSelfEmployed:e.target.checked})} />自由职业/创业者</label>
              </div>
            </div>
            <button className="btn-primary" onClick={()=>{setResult(getPolicyHealthCheck(form));saveUserProfile({age:form.age,gender:form.gender,education:form.education,city:form.city,hasHouse:form.hasHouse,hasChild:form.hasChild,isMarried:form.isMarried,isSelfEmployed:form.isSelfEmployed})}} style={{marginTop:12,width:'100%'}}>开始体检</button>
          </>
        ) : (
          <>
            <h3>📊 体检报告</h3>
            <div className="health-result-header">
              <div className="health-score-ring">
                <span className="health-score-num" style={{color:result.tier.color}}>{result.score}</span>
                <span className="health-score-label">/100 感知力</span>
                <span className="health-tier" style={{background:result.tier.color}}>{result.tier.icon} {result.tier.label}</span>
              </div>
              <div className="health-summary">
                <span>发现 <strong>{result.totalIssues}</strong> 个政策感知盲区</span>
                <span className="health-severity-summary">🔴{result.highCount} 高 📒{result.mediumCount} 中 🔵{result.lowCount} 低</span>
              </div>
            </div>
            {/* 分维度评分条 */}
            <div className="health-dim-bars">
              {dims.map(d => (
                <div key={d.dim} className={`health-dim-bar ${d.score < 60 ? 'dim-danger' : d.score < 80 ? 'dim-warn' : 'dim-good'}`}>
                  <div className="hd-label"><span className="hd-icon">{d.icon}</span><span className="hd-name">{d.label}</span><span className="hd-count">{d.count}条</span></div>
                  <div className="hd-track"><div className="hd-fill" style={{width:`${d.score}%`,background:d.score<60?'#e74c3c':d.score<80?'#e67e22':'#27ae60'}} /></div>
                  <span className="hd-score" style={{color:d.score<60?'#e74c3c':d.score<80?'#e67e22':'#27ae60'}}>{d.score}分</span>
                </div>
              ))}
            </div>
            {/* 问题列表 */}
            <div className="health-issues">
              {displayIssues.map(i => (
                <div key={i.id} className={`health-issue health-issue-${i.severity}`}>
                  <div className="hi-header"><span className="hi-icon">{i.icon}</span><span className="hi-title">{i.title}</span><span className={`hi-severity ${i.severity}`}>{i.severity==='high'?'🔴高危':i.severity==='medium'?'📒关注':'🔵提示'}</span></div>
                  <p className="hi-desc">{i.desc}</p>
                  <div className="hi-cost">💸 可能影响 ¥{i.estimatedBoost.min.toLocaleString()}-{i.estimatedBoost.max.toLocaleString()} {i.estimatedBoost.unit}</div>
                  <div className="hi-action">→ {i.action}</div>
                </div>
              ))}
            </div>
            <button className="btn-secondary" onClick={()=>setResult(null)} style={{marginTop:16,width:'100%'}}>重新诊断</button>
          </>
        )}
      </div>
    </div>
  )
}

/* P1: 个性化政策周报 */
function WeeklyDigestCard({ data, onClose, compact }) {
  if (!data) return null
  const { signals,peers,outlook,compassSignals,personaLabel,stageLabel } = data
  if (compact) {
    return <div className="weekly-digest-compact">📬 你的个性化政策周报（{personaLabel} · {stageLabel}）<span className="wd-hint">发现{signals.length}条盲区+{peers.length}条同路人动态{compassSignals?.length?`+${compassSignals.length}条风向标`:''}</span></div>
  }
  const urgencyLabels = { immediate:'🔴立即', soon:'🟡尽快', watch:'🔵关注' }
  return (
    <div className="weekly-digest">
      <div className="wd-header">
        <span className="wd-icon">📬</span>
        <div className="wd-header-text"><span className="wd-title">你的个性化政策周报</span><span className="wd-subtitle">{personaLabel} · {stageLabel} · {data.date}</span></div>
      </div>
      <div className="wd-section">
        <h4 className="wd-section-title">⚡ 你可能不知道的信号</h4>
        {signals.map((s,i) => (
          <div key={i} className="wd-item"><span className={`wd-badge wd-${s.type}`}>{s.type==='blindspot'?'盲区':'机会'}</span><span className="wd-text">{s.title}</span>{s.cost&&<span className="wd-cost">💰{s.cost.min.toLocaleString()}-{s.cost.max.toLocaleString()}{s.cost.unit}</span>}</div>
        ))}
      </div>
      {compassSignals?.length > 0 && (
        <div className="wd-section">
          <h4 className="wd-section-title">🧭 本周风向标 · 与你最相关</h4>
          {compassSignals.map((s,i) => (
            <div key={i} className="wd-compass-item">
              <span className="wd-compass-domain">{s.domainIcon} {s.domainLabel}</span>
              <span className={`wd-compass-urgency ${s.urgency}`}>{urgencyLabels[s.urgency]||s.urgency}</span>
              <div className="wd-compass-body">
                <span className="wd-compass-change">{s.change.length>50?s.change.slice(0,50)+'...':s.change}</span>
                <span className="wd-compass-action">→ {s.action.length>40?s.action.slice(0,40)+'...':s.action}</span>
              </div>
              {s.financial?.min>0 && <span className="wd-compass-cost">💰¥{s.financial.min.toLocaleString()}+</span>}
            </div>
          ))}
        </div>
      )}
      {peers.length>0 && <div className="wd-section"><h4 className="wd-section-title">👥 同路人动态</h4>{peers.map((p,i) => <div key={i} className="wd-item"><span className="wd-pct">{p.pct}%</span><span className="wd-text">{p.title}</span></div>)}</div>}
      <div className="wd-section"><h4 className="wd-section-title">📡 立法前瞻</h4><span>有 <strong>{outlook?.length||0}</strong> 项和你相关的立法项目推进中</span></div>
      {onClose && <button className="btn-secondary" onClick={onClose} style={{marginTop:8,width:'100%'}}>关闭</button>}
    </div>
  )
}

/* P2: 盲区自测游戏 — 多模式版 */
function SelfTestQuiz({ show, onClose }) {
  const [mode, setMode] = useState(null)
  const [region, setRegion] = useState('beijing')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [historyView, setHistoryView] = useState(false)
  const quizStats = useMemo(() => { try { return getQuizStats() } catch { return { total:0,done:0,undone:0,accuracy:0,totalAttempts:0 } } }, [show])
  const quizHistory = useMemo(() => { try { return getQuizHistory() } catch { return [] } }, [show])

  const startQuiz = (m) => {
    let qs = []
    if (m === 'daily') qs = getDailyQuizQuestions(3)
    else if (m === 'full') qs = getFullQuizQuestions(15)
    else if (m === 'region') qs = getRegionQuizQuestions(region, 5)
    else qs = getFullQuizQuestions(5)
    setQuestions(qs)
    setMode(m)
    setAnswers({})
    setSubmitted(false)
    setCurrentQ(0)
  }

  const submitQuiz = () => {
    const objAnswers = {}
    questions.forEach(q => { objAnswers[q.id] = answers[q.id] ?? -1 })
    questions.forEach(q => {
      recordQuizAttempt(q.id, answers[q.id] === q.correct)
      if (answers[q.id] !== q.correct) {
        addWrongAnswer(q.question, q.options[answers[q.id] ?? -1] || '未作答', q.options[q.correct], q.explanation, q.dim)
      }
    })
    updateUserTier(scoreSelfTest(objAnswers, questions).score, questions.length)
    setSubmitted(true)
  }

  const handleClose = () => { if (mode && !submitted && questions.length>0) { setMode(null); setAnswers({}); setCurrentQ(0) } else { onClose(); setMode(null); setAnswers({}); setSubmitted(false); setCurrentQ(0) } }

  if (!show) return null
  const result = submitted && questions.length > 0 ? scoreSelfTest(answers, questions) : null

  // 地区选择器
  const RegionPicker = ({ value, onChange }) => {
    const regions = [{key:'beijing',label:'北京'},{key:'shanghai',label:'上海'},{key:'shenzhen',label:'深圳'},{key:'guangzhou',label:'广州'}]
    return (
      <div className="region-picker" onClick={e=>e.stopPropagation()}>
        {regions.map(r => <span key={r.key} className={`rp-chip ${value===r.key?'active':''}`} onClick={()=>onChange(r.key)}>{r.label}</span>)}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content quiz-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>✕</button>
        {!mode ? (<>
          <h3>🎮 政策盲区自测</h3>
          <p className="quiz-intro">每日检测政策感知力，发现忽略的政策盲区。题库持续扩充中。</p>
          {quizStats.totalAttempts > 0 && (
            <div className="quiz-stats-bar">
              <div className="qsb-item"><span className="qsb-num">{quizStats.total}</span><span className="qsb-label">题库</span></div>
              <div className="qsb-item"><span className="qsb-num">{quizStats.done}</span><span className="qsb-label">已做</span></div>
              <div className="qsb-item"><span className={`qsb-num ${quizStats.undone>0?'qsb-new':''}`}>{quizStats.undone}</span><span className="qsb-label">未做</span></div>
              <div className="qsb-item"><span className="qsb-num">{quizStats.accuracy}%</span><span className="qsb-label">正确率</span></div>
            </div>
          )}
          <div className="quiz-mode-grid">
            <div className="quiz-mode-card qmc-daily" onClick={()=>startQuiz('daily')}>
              <span className="qmc-icon">📅</span><span className="qmc-title">每日3题</span>
              <span className="qmc-desc">优先错题和新题 · 2分钟搞定</span>
            </div>
            <div className="quiz-mode-card qmc-full" onClick={()=>startQuiz('full')}>
              <span className="qmc-icon">📝</span><span className="qmc-title">完整测试</span>
              <span className="qmc-desc">15题全面检测 · 5分钟完成</span>
            </div>
            <div className="quiz-mode-card qmc-region" onClick={e=>e.stopPropagation()}>
              <span className="qmc-icon">📍</span><span className="qmc-title">地区专项</span>
              <span className="qmc-desc">聚焦你关心城市的政策差异</span>
              <RegionPicker value={region} onChange={setRegion} />
              <button className="qmc-start-btn" onClick={()=>startQuiz('region')}>开始 →</button>
            </div>
            <div className="quiz-mode-card qmc-quick" onClick={()=>startQuiz('quick')}>
              <span className="qmc-icon">⚡</span><span className="qmc-title">快速5题</span>
              <span className="qmc-desc">随机5题 · 1分钟速测</span>
            </div>
          </div>
          {quizHistory.length > 0 && (
            <div className="quiz-history-section">
              <div className="qhs-header" onClick={()=>setHistoryView(!historyView)}>
                <span>📋 答题记录（{quizHistory.length}次）</span>
                <span className="qhs-toggle">{historyView?'收起 ▲':'展开 ▼'}</span>
              </div>
              {historyView && (
                <div className="qhs-list">{quizHistory.slice(-20).reverse().map((h,i) => (
                  <div key={i} className={`qhs-item ${h.correct?'correct':'wrong'}`}>
                    <span className="qhs-mark">{h.correct?'✅':'❌'}</span>
                    <span className="qhs-date">{h.date}</span>
                  </div>
                ))}</div>
              )}
            </div>
          )}
        </>) : (<>
          <div className="quiz-header-bar">
            <button className="qh-back" onClick={()=>{setMode(null);setAnswers({});setSubmitted(false);setCurrentQ(0)}}>← 返回</button>
            <span className="qh-mode-label">{{daily:'每日3题',full:'完整测试',region:'地区专项',quick:'快速5题'}[mode]}</span>
            <span className="qh-progress">{currentQ+1}/{questions.length}</span>
          </div>
          {!submitted ? (<>
            <div className="quiz-progress-bar"><div className="qpb-fill" style={{width:`${((currentQ+1)/questions.length)*100}%`}} /></div>
            {questions.map((q,qi) => (
              <div key={q.id} className={`quiz-question ${currentQ===qi?'':'quiz-hidden'}`}>
                <div className="qqb-meta">
                  <span className={`qqb-diff qqb-${q.difficulty||'easy'}`}>{(q.difficulty||'easy')==='easy'?'⭐':q.difficulty==='medium'?'⭐⭐':'⭐⭐⭐'}</span>
                  {q.region!=='national' && <span className="qqb-tag qqb-region">📍{(q.region==='beijing'?'北京':q.region==='shanghai'?'上海':q.region==='shenzhen'?'深圳':q.region)}</span>}
                  <span className="qqb-tag qqb-dim">{q.dim==='housing'?'🏠':q.dim==='employment'?'💼':q.dim==='education'?'🎓':q.dim==='elderly'?'👴':q.dim==='finance'?'💰':'🏭'}</span>
                </div>
                <p className="qq-text">{q.question}</p>
                <div className="qq-options">
                  {q.options.map((opt,oi) => (
                    <label key={oi} className={`qq-option ${answers[q.id]===oi?'selected':''}`} onClick={()=>setAnswers({...answers,[q.id]:oi})}>
                      <span className="qq-radio">{answers[q.id]===oi?'●':'○'}</span><span className="qqo-text">{opt}</span>
                      {answers[q.id]===oi && <span className="qqo-check">✓</span>}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="quiz-nav">
              <button className="btn-secondary" disabled={currentQ===0} onClick={()=>setCurrentQ(Math.max(0,currentQ-1))}>上一题</button>
              {currentQ<questions.length-1 ? (
                <button className="btn-primary" disabled={answers[questions[currentQ]?.id]===undefined} onClick={()=>setCurrentQ(currentQ+1)}>下一题</button>
              ) : (
                <button className="btn-primary" onClick={submitQuiz}>✅ 提交答案</button>
              )}
            </div>
          </>) : result && (<>
            <div className="quiz-result">
              <div className="qr-header-new">
                <span className="qr-h-icon">{result.pct>=80?'🏆':result.pct>=60?'📚':'💡'}</span>
                <div>
                  <span className="qr-h-score" style={{color:result.pct>=80?'#27ae60':result.pct>=60?'#e67e22':'#e74c3c'}}>{result.score}/{result.total}</span>
                  <span className="qr-h-level">{result.level.icon} {result.level.label}</span>
                  <span className="qr-h-pct">{result.pct}分</span>
                </div>
              </div>
              {result.missedCount>0 ? (
                <div className="qr-cost-banner">
                  <span>💸 答错的盲区可能让你损失 <strong>¥{result.missedCost.min.toLocaleString()}-{result.missedCost.max.toLocaleString()}</strong></span>
                </div>
              ) : (
                <div className="qr-perfect"><span>🎉 全部正确！你是真正的政策达人！</span></div>
              )}
              <div className="qr-answers">{questions.map(q => {
                const isCorrect = answers[q.id] === q.correct
                return (
                  <div key={q.id} className={`qr-answer ${isCorrect?'correct':'wrong'}`}>
                    <div className="qra-head">
                      <span>{isCorrect?'✅':'❌'}</span>
                      <span className="qr-a-text">{q.question}</span>
                    </div>
                    {!isCorrect && (
                      <div className="qra-detail">
                        <span className="qra-yours">你的答案：{q.options[answers[q.id] ?? -1] || '未作答'}</span>
                        <span className="qra-right">正确：{q.options[q.correct]}</span>
                        <span className="qra-exp">💡 {q.explanation}</span>
                        {q.region!=='national' && <span className="qra-region-note">📍 此题为{q.region==='beijing'?'北京':q.region==='shanghai'?'上海':q.region==='shenzhen'?'深圳':q.region}地区政策，其他城市可能不同</span>}
                      </div>
                    )}
                  </div>
                )
              })}</div>
            </div>
            <div className="quiz-result-actions">
              <button className="btn-secondary" onClick={()=>{setMode(null);setAnswers({});setSubmitted(false);setCurrentQ(0)}}>← 返回选题</button>
              <button className="btn-primary" onClick={()=>startQuiz(mode)}>🔄 再做一组新题</button>
            </div>
          </>)}
        </>)}
      </div>
    </div>
  )
}

/* P2: 政策订阅弹窗 */
function SubscriptionModal({ show, onClose }) {
  const [subs, setSubs] = useState(() => getPolicySubscriptions())
  const items = useMemo(() => { const a=[]; Object.values(legislativeOutlook.outlookByDim||{}).forEach(items=>items.forEach(item=>a.push(item))); return a }, [])
  if (!show) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content sub-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>🔔 政策变化订阅</h3>
        <p className="sub-intro">选择你想追踪的政策，有更新时提醒你</p>
        <div className="sub-list">{items.map((item,i) => (
          <div key={i} className={`sub-item ${subs.some(s=>s.label===item.name)?'sub-active':''}`}
            onClick={()=>setSubs(togglePolicySubscription(item.name.replace(/\s/g,'_'),item.name))}>
            <span className="sub-check">{subs.some(s=>s.label===item.name)?'☑':'☐'}</span>
            <div className="sub-body"><span className="sub-name">{item.name}</span><span className="sub-status">{item.status}</span></div>
            <span className="sub-impact" style={{color:item.impact==='利好'?'#27ae60':item.impact==='利空'?'#e74c3c':'#95a5a6'}}>{item.impact}</span>
          </div>
        ))}</div>
        <div style={{marginTop:8,fontSize:12,color:'var(--text-muted)',textAlign:'center'}}>已订阅{subs.length}项政策</div>
      </div>
    </div>
  )
}

/* P2: UGC案例提交弹窗 */
function UgcSubmitModal({ show, onClose }) {
  const [form, setForm] = useState({ role:'', age:'', city:'', quote:'', result:'', dim:'housing', scenario:'购房' })
  const [submitted, setSubmitted] = useState(false)
  if (!show) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ugc-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        {!submitted ? (
          <>
            <h3>📝 分享你的政策发现</h3>
            <p className="ugc-intro">你的经验可能帮助到和你有同样处境的人</p>
            <div className="ugc-form">
              <label className="ugc-field"><span>身份</span><input value={form.role} onChange={e=>setForm({...form,role:e.target.value})} placeholder="如：深圳程序员" /></label>
              <label className="ugc-field"><span>年龄</span><input type="number" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} /></label>
              <label className="ugc-field"><span>城市</span><input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} /></label>
              <label className="ugc-field"><span>你的发现</span><textarea value={form.quote} onChange={e=>setForm({...form,quote:e.target.value})} rows={3} placeholder="用了策查查发现了…" /></label>
              <label className="ugc-field"><span>收益结果</span><input value={form.result} onChange={e=>setForm({...form,result:e.target.value})} placeholder="如：节省了5万元" /></label>
              <div className="ugc-selects">
                <select value={form.dim} onChange={e=>setForm({...form,dim:e.target.value})}>
                  <option value="housing">🏠房产</option><option value="employment">💼就业</option><option value="education">🎓教育</option><option value="elderly">👴养老</option><option value="finance">💰金融</option><option value="industry">🏭产业</option></select>
                <select value={form.scenario} onChange={e=>setForm({...form,scenario:e.target.value})}>
                  <option value="购房">购房</option><option value="生育">生育</option><option value="教育">教育</option><option value="养老">养老</option><option value="创业">创业</option><option value="就业">就业</option><option value="社保">社保</option></select>
              </div>
            </div>
            <button className="btn-primary" onClick={()=>{submitUserTestimonial(form);setSubmitted(true)}} style={{width:'100%',marginTop:12}} disabled={!form.role||!form.quote}>提交（审核后上墙）</button>
          </>
        ) : (
          <><h3>✅ 提交成功！</h3><p>审核通过后将展示在案例墙中</p><button className="btn-secondary" onClick={onClose} style={{width:'100%',marginTop:12}}>关闭</button></>
        )}
      </div>
    </div>
  )
}

/* ═══════ 原组件（保留兼容引用） ═══════ */
/* P2-1: 用户案例墙 */
function TestimonialWall() {
  const testimonials = [
    { icon: '🏠', role: '准备买房的深圳程序员', age: '28岁', quote: '用了策查查才知道深圳公积金可以贷到126万，比预想多了40万。还发现了人才引进补贴，总计省了近10万。', result: '节省约10万元', dim: 'housing' },
    { icon: '👶', role: '计划二胎的杭州妈妈', age: '32岁', quote: '生育计算器帮我算出了产假天数和津贴金额，还查到了各个区的托育补贴差异。比对了三套方案后选定了最划算的产假衔接节奏，多休了两周。', result: '多领津贴2.3万/年', dim: 'elderly' },
    { icon: '🎒', role: '纠结学区房的北京家长', age: '34岁', quote: '教育维度的政策一目了然：哪些区要求房户一致、哪些区租房也能上学、落户年限要求多少。算下来买学区房的钱够上私立还有余，果断放弃内卷。', result: '节省学区房溢价约200万', dim: 'education' },
    { icon: '👴', role: '临近退休的上海国企职工', age: '58岁', quote: '养老金计算器帮我算出了不同退休时间点的待遇差异。按最低档缴和按实际工资缴，退休后每月能差将近2000块。果断调整了缴纳基数。', result: '退休金提升约25%', dim: 'elderly' },
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

/* ═══════ Toast 通知系统 ═══════ */
let toastId = 0
function useToast() {
  const [toasts, setToasts] = useState([])
  const show = useCallback((msg, type = 'success') => {
    const id = ++toastId
    setToasts(prev => [...prev.slice(-2), { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])
  const ToastContainer = useCallback(() => (
    <div className="toast-container" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span className="toast-msg">{t.msg}</span>
        </div>
      ))}
    </div>
  ), [toasts])
  return { show, ToastContainer }
}

/* ═══════ 滚动入场动画 Hook ═══════ */
function useScrollReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

/* ═══════ localStorage 安全工具 ═══════ */
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      // 尝试清理过期数据
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && (k.startsWith('quiz_history') || k.startsWith('tool_result') || k.startsWith('growth_'))) {
          keysToRemove.push(k)
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k))
      try { localStorage.setItem(key, value); return true } catch { return false }
    }
    return false
  }
}

/* 数据版本迁移 */
function migrateDataVersion() {
  const stored = localStorage.getItem('data_version')
  if (stored === DATA_VERSION) return
  // 版本变更时清理过期缓存
  if (stored && stored !== DATA_VERSION) {
    localStorage.removeItem('recent_searches')
    localStorage.removeItem('search_stats')
  }
  localStorage.setItem('data_version', DATA_VERSION)
}

export default App
