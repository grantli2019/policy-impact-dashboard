import React from 'react'
import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react'
import {
  dimensions, methodology, rubric, personas, weeklyUpdates, regions,
  calcDimensionScore, calcOverallIndex, getIndexLevel, keyFindings,
  getDimensionsForRegion, getTimelineForDimension, regionToolParams,
  legislativeOutlook, crossLinks, actionPlans, policyDividends, deadlines, specialTopics, decisionScenarios, policyMilestones, policyGlossary, rentalQuiz, premiumFeatures, recommendations, dashboardRecommendations, newsLianboUpdates,
} from './data/impactData'
import './App.css'
import Tools from './Tools'

/* ═══════ 工具函数 ═══════ */
function timeAgo(dateStr) {
  const now = new Date('2026-07-12'), d = new Date(dateStr)
  const days = Math.floor((now - d) / 86400000)
  if (days === 0) return '今天'; if (days === 1) return '昨天'
  if (days <= 7) return `${days}天前`; if (days <= 30) return `${Math.floor(days/7)}周前`
  return `${Math.floor(days/30)}个月前`
}

/* ═══════ 画像选择器 ═══════ */
function PersonaModal({ onSelect, onSkip }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="选择用户画像" onClick={onSkip}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">🧭 欢迎来到政策罗盘</h2>
        <p className="modal-sub">选一个最符合你的身份，我们会根据你的身份调整各维度权重，让分析更贴合你的实际情况</p>
        <div className="persona-grid">
          {personas.map(p => (
            <button key={p.key} className="persona-btn" onClick={() => onSelect(p.key)}>
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

/* ═══════ 分享卡片 ═══════ */
function ShareCard({ personaKey, regionKey, onClose }) {
  const canvasRef = useRef(null)
  const persona = personas.find(p => p.key === personaKey)
  const region = regions.find(r => r.key === regionKey)
  const dims = getDimensionsForRegion(regionKey)
  const overallIndex = calcOverallIndex(personaKey, regionKey)
  const overallLevel = getIndexLevel(overallIndex)
  const dimScores = dims.map(d => ({ ...d, idx: calcDimensionScore(d) }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 750, H = 1100
    canvas.width = W; canvas.height = H
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#1a1a2e'); grad.addColorStop(1, '#16213e')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 32px sans-serif'
    ctx.fillText('🧭 政策罗盘', 40, 60)
    ctx.font = '18px sans-serif'; ctx.fillStyle = '#aaa'
    ctx.fillText(`${region?.name || '全国'} · 征求意见稿跟踪${persona ? ' · ' + persona.icon + persona.label + '视角' : ''}`, 40, 95)
    ctx.fillText('2026-07-12', 40, 125)
    ctx.fillStyle = overallLevel.color; ctx.font = 'bold 100px sans-serif'
    ctx.fillText(overallIndex, 40, 250)
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText(overallLevel.icon + ' ' + overallLevel.label, 280, 240)
    ctx.font = '20px sans-serif'; ctx.fillStyle = '#ccc'
    ctx.fillText(overallLevel.plain, 280, 275)
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(40, 310); ctx.lineTo(W - 40, 310); ctx.stroke()
    dimScores.forEach((d, i) => {
      const y = 360 + i * 70
      const lvl = getIndexLevel(d.idx)
      ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'
      ctx.fillText(d.icon + ' ' + d.name, 40, y)
      ctx.fillStyle = lvl.color; ctx.font = 'bold 28px sans-serif'
      ctx.fillText(d.idx, 650, y)
      ctx.fillStyle = '#333'; ctx.fillRect(300, y - 15, 300, 20)
      ctx.fillStyle = d.color; ctx.fillRect(300, y - 15, 300 * d.idx / 100, 20)
    })
    const qrX = W - 180, qrY = H - 190
    ctx.fillStyle = '#fff'; ctx.fillRect(qrX, qrY, 140, 140)
    ctx.fillStyle = '#1a1a2e'
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++)
      if ((r + c) % 2 === 0 || (r < 3 && c < 3) || (r < 3 && c > 3) || (r > 3 && c < 3))
        ctx.fillRect(qrX + 10 + c * 17, qrY + 10 + r * 17, 15, 15)
    ctx.fillStyle = '#aaa'; ctx.font = '13px sans-serif'
    ctx.fillText('扫码查看你的', qrX - 5, qrY - 15)
    ctx.fillText('专属政策分析', qrX - 5, qrY + 160)
    ctx.fillStyle = '#666'; ctx.font = 'bold 16px sans-serif'
    ctx.fillText('政策罗盘', 40, H - 50)
    const totalPolicies = dims.reduce((a, d) => a + d.scores.length, 0)
    ctx.font = '14px sans-serif'
    ctx.fillText(`基于 OECD RIA + PEST + 利益相关者矩阵 · ${totalPolicies}条权威政策`, 40, H - 25)
    if (persona) {
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; roundRect(ctx, W - 220, 30, 180, 40, 20); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif'
      ctx.fillText(`${persona.icon} ${persona.label}视角`, W - 205, 58)
    }
  }, [personaKey, regionKey])

  const downloadImage = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const link = document.createElement('a')
    link.download = '政策罗盘_分享卡片.png'
    link.href = canvas.toDataURL('image/png'); link.click()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-card-modal" onClick={e => e.stopPropagation()}>
        <h3>📤 分享卡片</h3>
        <canvas ref={canvasRef} style={{ width: '100%', borderRadius: 12, maxWidth: 375 }} />
        <div className="share-actions">
          <button className="btn-primary" onClick={downloadImage}>💾 保存图片</button>
          <button className="btn-secondary" onClick={() => { navigator.clipboard.writeText(window.location.href) }}>📋 复制链接</button>
          <a className="btn-secondary" href={`https://service.weibo.com/share/share.php?title=${encodeURIComponent("我的政策影响力指数是" + calcOverallIndex(personaKey, regionKey) + "分，来看看你的！")}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener" style={{ textDecoration: "none" }}>📢 微博</a>
          <div className="share-wechat-hint"><small>💡 保存图片后可直接发到微信群/朋友圈</small></div>
          <button className="btn-secondary" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  )
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath()
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
  const now = new Date('2026-07-12')
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
      const now = new Date('2026-07-12')
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
    ctx.fillText("🧭 政策罗盘 · 个人政策影响报告", 30, 60)
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
    ctx.fillText("政策罗盘 · 读懂政策，做对决策 · 基于 OECD RIA + PEST + 利益相关者矩阵", 30, H - 25)
    ctx.fillText("仅供参考，不构成投资建议", W - 200, H - 25)
  }, [personaKey, regionKey])

  const downloadReport = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const link = document.createElement("a")
    link.download = "政策罗盘_个人报告_2026-07-12.png"
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

/* ═══════ B3: 个人仪表盘 ═══════ */
function Dashboard({ personaKey, regionKey, bookmarks, onSwitchTab }) {
  const visits = (() => { try { return JSON.parse(localStorage.getItem("visit_stats") || "{}") } catch { return {} } })()
  const persona = personas.find(p => p.key === personaKey)
  const recs = dashboardRecommendations[personaKey] || { topics: [], scenarios: [] }
  const relatedTopics = specialTopics.filter(t => recs.topics.includes(t.id))
  const relatedScenarios = decisionScenarios.filter(s => recs.scenarios.includes(s.id))
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

      {/* Dividend Ledger */}
      <div className="dash-section">
        <h3>💰 我的政策红利账本</h3>
        <div className="ledger-grid">
          <div className="ledger-card ledger-confirm"><span className="lc-label">已确认红利</span><span className="lc-value">+{confirmedTotal.toLocaleString()}元/年</span></div>
          <div className="ledger-card ledger-risk"><span className="lc-label">潜在风险</span><span className="lc-value">{riskTotal.toLocaleString()}元/年</span></div>
          <div className="ledger-card ledger-action"><span className="lc-label">行动收益</span><span className="lc-value">+{(doneBenefit/10000).toFixed(1)}万</span></div>
          <div className="ledger-card ledger-net"><span className="lc-label">净收益</span><span className="lc-value">{(confirmedTotal+riskTotal>=0?'+':'')}{(confirmedTotal+riskTotal).toLocaleString()}元</span></div>
        </div>
      </div>

      {/* Action Progress */}
      {plans.length > 0 && (
        <div className="dash-section">
          <h3>📋 行动进度 ({done.length}/{plans.length})</h3>
          <div className="action-progress-list">
            {plans.map(p => (
              <div key={p.id} className={`apl-item ${done.includes(p.id) ? 'apl-done' : ''}`}>
                <span className="apl-check">{done.includes(p.id) ? '✅' : '⬜'}</span>
                <span className="apl-title">{p.title}</span>
                {p.benefit > 0 && <span className="apl-benefit">+{(p.benefit/10000).toFixed(1)}万</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <div className="dash-section">
          <h3>🔖 我收藏的政策</h3>
          <div className="dash-bookmarks">{bookmarks.map(b => <div key={b} className="dash-bm-item" onClick={() => onSwitchTab("dimensions")}>{b}</div>)}</div>
        </div>
      )}

      {/* Recommendations */}
      <div className="dash-section">
        <h3>🎯 为你推荐</h3>
        <div className="dash-recs">
          {relatedTopics.map(t => (
            <div key={t.id} className="dash-rec-card" onClick={() => onSwitchTab("topics")}>
              <span className="drc-icon">{t.icon}</span><span className="drc-title">{t.title}</span>
            </div>
          ))}
          {relatedScenarios.map(s => (
            <div key={s.id} className="dash-rec-card" onClick={() => onSwitchTab("topics")}>
              <span className="drc-icon">{s.icon}</span><span className="drc-title">{s.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════ B4: 智能推荐 ═══════ */
function SmartRecommendations({ personaKey, onSwitchTab }) {
  const recs = recommendations[personaKey] || []
  if (recs.length === 0) return null
  const typeIcon = { topic: "📖", scenario: "🎮", deadline: "⏰" }
  const typeTarget = { topic: "topics", scenario: "topics", deadline: "overview" }
  return (
    <div className="smart-recs">
      <h3 className="sr-title">💡 为你推荐</h3>
      <div className="sr-cards">
        {recs.map((r, i) => (
          <div key={i} className="sr-card" onClick={() => onSwitchTab(typeTarget[r.type])}>
            <span className="sr-type-icon">{typeIcon[r.type]}</span>
            <span className="sr-text">{r.text}</span>
            <span className="sr-go">→</span>
          </div>
        ))}
      </div>
    </div>
  )
}

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
      <p className="invite-desc">把政策罗盘分享给朋友，一起读懂政策、做对决策</p>
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
const AnimatedCounter = memo(function AnimatedCounter({ target, duration = 600 }) {
  const [value, setValue] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const start = performance.now()
    const from = prev.current
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      const v = Math.round(from + (target - from) * ease)
      setValue(v)
      if (t < 1) requestAnimationFrame(tick)
      else prev.current = target
    }
    requestAnimationFrame(tick)
  }, [target, duration])
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
function PolicySearch({ onSwitchTab, variant }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [dailyCount, setDailyCount] = useState(() => {
    try { const d = JSON.parse(localStorage.getItem('search_stats') || '{}'); const today = new Date().toISOString().slice(0,10); return d.date === today ? d.count : 0 } catch { return 0 }
  })
  const FREE_LIMIT = 3

  const doSearch = (q) => {
    setQuery(q)
    if (!q.trim()) { setResults(null); return }
    const today = new Date().toISOString().slice(0,10)
    const stats = (() => { try { return JSON.parse(localStorage.getItem('search_stats') || '{}') } catch { return {} } })()
    const count = stats.date === today ? stats.count : 0
    if (count >= FREE_LIMIT) { setResults([]); return }
    localStorage.setItem('search_stats', JSON.stringify({ date: today, count: count + 1 }))
    setDailyCount(count + 1)

    const kw = q.toLowerCase()
    const res = []
    // Search dimensions
    dimensions.forEach(dim => {
      dim.scores.forEach(p => {
        if (p.policyName.toLowerCase().includes(kw) || (p.note && p.note.toLowerCase().includes(kw))) {
          res.push({ type: 'policy', dim: dim.key, icon: dim.icon, dimLabel: dim.name, title: p.policyName, desc: p.note, sentiment: p.direction > 0 ? '利好' : p.direction < 0 ? '利空' : '中性', url: p.url, date: p.date })
        }
      })
    })
    // Search newsLianboUpdates
    newsLianboUpdates.forEach(n => {
      if (n.title.toLowerCase().includes(kw) || n.summary.toLowerCase().includes(kw)) {
        const dimMeta = { housing:'🏠', employment:'💼', education:'🎓', pension:'👴', finance:'💰', industry:'🏭' }
        res.push({ type: 'news', dim: n.dim, icon: dimMeta[n.dim] || '📺', dimLabel: '新闻联播', title: n.title, desc: n.summary?.slice(0,60), sentiment: n.sentiment, data: n.data, date: n.date })
      }
    })
    // Search weeklyUpdates
    weeklyUpdates.forEach(w => {
      if (w.text.toLowerCase().includes(kw)) {
        res.push({ type: 'weekly', dim: w.dim, icon: '📡', dimLabel: '本周更新', title: w.text, desc: '', sentiment: w.impact, date: w.date })
      }
    })
    // Search keyFindings
    keyFindings.forEach(k => {
      if (k.title.toLowerCase().includes(kw) || k.summary.toLowerCase().includes(kw)) {
        res.push({ type: 'finding', dim: '', icon: '🔑', dimLabel: '关键发现', title: k.title, desc: k.summary?.slice(0,60), sentiment: '', url: k.url })
      }
    })
    // Search specialTopics
    specialTopics.forEach(t => {
      if (t.title.toLowerCase().includes(kw) || t.subtitle.toLowerCase().includes(kw) || t.tags.some(tag => tag.toLowerCase().includes(kw))) {
        res.push({ type: 'topic', dim: '', icon: t.icon, dimLabel: '专题', title: t.title, desc: t.subtitle, sentiment: '' })
      }
    })
    setResults(res.slice(0, 20))
  }

  const sentColor = s => s === '利好' || s === '偏利好' ? 'var(--success)' : s === '利空' || s === '偏利空' ? 'var(--danger)' : 'var(--text-secondary)'

  return (
    <div className={`policy-search ${variant === 'header' ? 'ps-header' : ''}`}>
      <div className="ps-input-wrap">
        <span className="ps-icon">🔍</span>
        <input className="ps-input" aria-label="搜索政策" role="searchbox" type="text" placeholder="搜索政策（如：公积金、延迟退休、个税、AI教育）"
          value={query} onChange={e => doSearch(e.target.value)} />
        {query && <button className="ps-clear" onClick={() => { setQuery(''); setResults(null) }}>✕</button>}
      </div>
      <div className="ps-hint">
        <span>已搜索 {dailyCount}/{FREE_LIMIT} 次</span>
        {dailyCount >= FREE_LIMIT && <span className="ps-limit">今日免费次数已用完，升级专业版享无限搜索</span>}
      </div>
      {!results && <div className="ps-hot"><span className="ps-hot-label">热门：</span><span key="公积金" className="ps-hot-tag" onClick={() => doSearch('公积金')}>公积金</span><span key="延迟退休" className="ps-hot-tag" onClick={() => doSearch('延迟退休')}>延迟退休</span><span key="个税" className="ps-hot-tag" onClick={() => doSearch('个税')}>个税</span><span key="GDP" className="ps-hot-tag" onClick={() => doSearch('GDP')}>GDP</span><span key="利率" className="ps-hot-tag" onClick={() => doSearch('利率')}>利率</span><span key="AI教育" className="ps-hot-tag" onClick={() => doSearch('AI教育')}>AI教育</span><span key="医保" className="ps-hot-tag" onClick={() => doSearch('医保')}>医保</span><span key="购房" className="ps-hot-tag" onClick={() => doSearch('购房')}>购房</span></div>}
      {results && (
        <div className="ps-results">
          {results.length === 0 ? (
            <div className="ps-empty">{dailyCount >= FREE_LIMIT ? '🔒 今日免费搜索次数已用完' : '未找到相关政策'}</div>
          ) : (
            <>
              <div className="ps-results-header">找到 {results.length} 条结果</div>
              {results.map((r, i) => (
                <div key={i} className="ps-result-item" onClick={() => { if (r.type === 'topic') onSwitchTab('topics'); else if (r.type === 'policy') onSwitchTab('dimensions'); else onSwitchTab('overview') }}>
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
        <h3 className="upgrade-title">🚀 升级政策罗盘</h3>
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
      new Notification('📺 政策罗盘·监控提醒', { body: `"${kw}"有${matches.length}条相关动态` })
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

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDim, setSelectedDim] = useState(null)
  const [personaKey, setPersonaKey] = useState(() => localStorage.getItem('persona') || null)
  const [regionKey, setRegionKey] = useState(() => localStorage.getItem('region') || 'national')
  const [showModal, setShowModal] = useState(!personaKey && !sessionStorage.getItem('skipped'))
  const [showShare, setShowShare] = useState(false)
  const [expandedRationale, setExpandedRationale] = useState(null)
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
  const [moreOpen, setMoreOpen] = useState(false)
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

  const switchTab = useCallback((k) => {
    setActiveTab(k); setSelectedDim(null); setTabKey(prev => prev + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      {showShare && <ShareCard personaKey={personaKey} regionKey={regionKey} onClose={() => setShowShare(false)} />}
      {showReport && <ReportExport personaKey={personaKey} regionKey={regionKey} onClose={() => setShowReport(false)} />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      <BackToTop />

      <header className="header header-v2">
        <div className="header-inner header-inner-v2">
          <div className="logo-area logo-compact">
            <span className="logo-icon">🧭</span>
            <h1 className="logo-title">政策罗盘</h1>
          </div>
          <div className="header-search">
            <PolicySearch onSwitchTab={(tab) => { setActiveTab(tab); setTabKey(k => k+1); window.scrollTo({top:0,behavior:"smooth"}) }} variant="header" />
          </div>
          <div className="header-actions header-actions-v2">
            <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)} title={darkMode ? '切换亮色模式' : '切换暗黑模式'}>{darkMode ? '☀️' : '🌙'}</button>
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

      {/* 区域选择器 */}
      <RegionSelector value={regionKey} onChange={handleRegionChange} />

      <nav className="tabs tabs-v2" role="tablist" aria-label="主导航">
        {[['overview','🏠 首页'],['dimensions','📋 政策库'],['tools','🧮 工具箱'],['dashboard','👤 我的']].map(([k, label]) => (
          <button key={k} className={`tab ${activeTab===k?'active':''}`} role="tab" aria-selected={activeTab===k} onClick={() => switchTab(k)}>{label}</button>
        ))}
        <div className="tab-more-wrap">
          <button className={`tab tab-more ${['methodology','graph','api','topics','monitor'].includes(activeTab)?'active':''}`} onClick={(e) => { e.stopPropagation(); setMoreOpen(!moreOpen); }}>⋯ 更多</button>
          {moreOpen && (
            <div className="tab-dropdown">
              {[['topics','🎯 专题'],['methodology','🔬 方法论'],['monitor','🔔 监控'],['graph','🕸️ 图谱'],['api','🔌 API']].map(([k, label]) => (
                <button key={k} className={`tab-drop-item ${activeTab===k?'active':''}`} onClick={() => { switchTab(k); setMoreOpen(false); }}>{label}</button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="main tab-fade" key={tabKey}>

        {/* ════════ OVERVIEW ════════ */}
        {activeTab === 'overview' && (
          <div className="overview">
            <section className="overall-card">
              <div className="overall-left">
                <div className="overall-ring" style={{ '--pct': ringValue, '--clr': overallLevel.color }}>
                  <div className="ring-inner">
                    <span className="ring-num">{ringValue}</span>
                    <span className="ring-label">/ 100</span>
                  </div>
                </div>
                {currentPersona && <div className="persona-info">{currentPersona.icon} {currentPersona.label}视角</div>}
                {regionKey !== 'national' && <div className="region-info-chip">{currentRegion.icon} {currentRegion.name}</div>}
              </div>
              <div className="overall-right">
                <div className="overall-title">综合政策影响力指数</div>
                        <div className="overall-brand-tag">政策罗盘</div>
                <div className="overall-level" style={{ color: overallLevel.color }}>{overallLevel.icon} {overallLevel.label}</div>
                <div className="overall-plain main-plain">💬 <b>对你意味着：</b>{overallLevel.plain}</div>
                <Collapsible title="📐 我们怎么算的？" defaultOpen={false}>
                  <p className="overall-desc-detail">
                    基于近3年 <b>{totalPolicies}条</b> 权威政策（{regionKey === 'national' ? '国家层面' : `国家政策 + ${currentRegion.name}区域政策`}），
                    涵盖房产、就业、教育、养老、理财、行业六大维度，
                    采用 OECD 监管影响评估框架（RIA）+ PEST宏观分析 + 利益相关者矩阵综合计算。
                    {currentPersona && <>当前以「{currentPersona.label}」视角计算，权重已按你的身份调整。</>}
                  </p>
                </Collapsible>
                {currentPersona && (
                  <div className="weight-tags">
                    {currentDims.map(d => {
                      const w = Math.round((currentPersona.weights[d.key] ?? 1/6) * 100)
                      const isTop = topDimKeys.includes(d.key)
                      return <span key={d.key} className={`weight-tag ${isTop ? 'weight-top' : ''}`} style={{ borderColor: d.color }}>{d.icon}{d.name} <b>{w}%</b></span>
                    })}
                  </div>
                )}
              </div>
            </section>

            {currentPersona ? (
              <ActionHub personaKey={personaKey} onSwitchTab={(tab) => { setActiveTab(tab); setTabKey(k => k+1); window.scrollTo({top:0,behavior:'smooth'}) }} />
            ) : (
              <div className="empty-state">
                <span className="empty-state-icon">🧭</span>
                <div className="empty-state-title">选择身份，解锁专属行动清单</div>
                <div className="empty-state-desc">告诉我们你是谁（购房者/职场人/家长/投资者/自由职业者），<br/>我们会为你生成个性化的政策行动建议、红利计算和时间窗口提醒</div>
                <button className="empty-state-btn" onClick={() => setShowModal(true)}>👤 选择我的身份</button>
              </div>
            )}

            {/* Quick Stats Overview */}
            <div className="overview-quick-stats">
              {sortedDims.map(dim => {
                const idx = calcDimensionScore(dim)
                const lvl = getIndexLevel(idx)
                return (
                  <div key={dim.key} className="quick-stat" onClick={() => { setActiveTab('dimensions'); setSelectedDim(dim.key); setTabKey(k=>k+1) }} style={{ cursor: 'pointer' }}>
                    <span className="qs-icon">{dim.icon}</span>
                    <span className="qs-value" style={{ color: lvl.color }}><AnimatedCounter target={idx} /></span>
                    <span className="qs-label">{dim.name} · {lvl.label}</span>
                  </div>
                )
              })}
            </div>

            <section className="findings">
              <h2 className="section-title">🔑 关键发现{currentPersona ? ` · ${currentPersona.label}最该关注的` : ' · 与你最相关的'}</h2>
              <div className="findings-list">
                {filteredFindings.map((f, i) => (
                  <div key={i} className={`finding-card finding-${f.level} stagger-card`}>
                    <div className="finding-num">{i + 1}</div>
                    <div className="finding-body">
                      <div className="finding-title">
                        {f.url ? <a href={f.url} target="_blank" rel="noopener noreferrer" className="policy-source-link">{f.title}</a> : f.title}
                      </div>
                      <div className="finding-summary">{f.summary}</div>
                      <div className="finding-action">💡 建议：{f.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>




            {currentPersona && <BeforeAfterCompare currentScore={overallIndex} actionCount={(actionPlans[personaKey]||[]).length} doneCount={doneActions.length} />}
            {currentPersona && <SmartRecommendations personaKey={personaKey} onSwitchTab={(tab) => { setActiveTab(tab); setTabKey(k => k+1); window.scrollTo({top:0,behavior:"smooth"}) }} />}
            {/* TOP5政策雷达 */}
            <PolicyRadar personaKey={personaKey} regionKey={regionKey} />
          </div>
        )}

        {/* ════════ DIMENSIONS ════════ */}
        {activeTab === 'dimensions' && (
          <div className="dimensions-page">
            <WeeklyUpdateBar />
            <NewsLianboPanel />
            <div className="dim-pills">
              {currentDims.map(dim => {
                const isTop = topDimKeys.includes(dim.key)
                return (
                  <button key={dim.key}
                    className={`pill-btn dim-pill ${selectedDim===dim.key?'active':''} ${isTop ? 'pill-top' : ''}`}
                    style={selectedDim===dim.key ? { background: dim.color, borderColor: dim.color } : {}}
                    onClick={() => setSelectedDim(dim.key)}>
                    {dim.icon} {dim.name}
                    {isTop && !selectedDim && <span className="pill-star">★</span>}
                  </button>
                )
              })}
            </div>

            {currentDims.filter(d => !selectedDim || d.key===selectedDim).map(dim => {
              const idx = calcDimensionScore(dim)
              const lvl = getIndexLevel(idx)
              const nationalCount = (dimensions.find(d => d.key === dim.key)?.scores.length) ?? dim.scores.length
              const regionalCount = dim.scores.length - nationalCount
              return (
                <section key={dim.key} className="dim-detail" style={{ '--accent': dim.color }}>
                  <div className="dim-detail-header">
                    <span className="dim-detail-icon">{dim.icon}</span>
                    <div>
                      <h2>{dim.name}</h2>
                      <p className="dim-detail-sub">{dim.subtitle}</p>
                    </div>
                    <div className="dim-detail-score" style={{ color: lvl.color }}>
                      <span className="big-score">{idx}</span>
                      <span className="score-label">{lvl.icon} {lvl.label}</span>
                    </div>
                  </div>

                  {regionKey !== 'national' && regionalCount > 0 && (
                    <div className="region-data-badge">
                      📌 共 {dim.scores.length} 条政策（国家 {nationalCount} + {currentRegion.name} {regionalCount}）
                    </div>
                  )}

                  <div className="plain-box">💬 <b>通俗解读：</b>{dim.plainSummary}</div>
                  <div className="dim-summary">{dim.summary}</div>
                  <div className="dim-analysis"><h3>📋 深度分析</h3><p>{dim.analysis}</p></div>
                  {/* 维度常见误区 */}
                  {dim.tips && dim.tips.length > 0 && (
                    <div className="dim-tips-section">
                      <h3>⚠️ 常见误区</h3>
                      {dim.tips.map((t, ti) => (
                        <div key={ti} className="dim-tip-item">
                          <b>{t.title}</b>
                          <p>{t.tip}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 历史时间线 */}
                  <Timeline dimKey={dim.key} />

                  <div className="dim-policies">
                    <h3>📌 政策评分明细</h3>
                    <table className="policy-table desktop-only">
                      <thead>
                        <tr><th style={{width:30}}></th><th>政策名称</th><th>影响广度</th><th>深远程度</th><th>方向</th><th>置信度</th><th>评估说明</th></tr>
                      </thead>
                      <tbody>
                        {dim.scores.map((s, i) => {
                          const dirLabel = s.direction > 0 ? '利好' : s.direction < 0 ? '利空' : '中性'
                          const dirColor = s.direction > 0 ? '#27ae60' : s.direction < 0 ? '#e74c3c' : '#95a5a6'
                          const isExpanded = expandedRationale === `${dim.key}-${i}`
                          const isBookmarked = bookmarks.includes(s.policyName)
                          const isRegional = i >= nationalCount
                          return (
                            <tr key={i} className={`${isExpanded ? 'expanded-row' : ''} ${isRegional ? 'regional-row' : ''}`}>
                              <td>
                                <button className={`bookmark-btn ${isBookmarked?'bookmarked':''}`}
                                  onClick={e => { e.stopPropagation(); toggleBookmark(s.policyName) }}>
                                  {isBookmarked ? '★' : '☆'}
                                </button>
                              </td>
                              <td className="policy-name-cell">
                                {isRegional && <span className="region-tag">{currentRegion.name}</span>}
                                {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="policy-source-link" onClick={e => e.stopPropagation()}>{s.policyName}</a> : s.policyName}
                                <div className="conf-badge">{s.confidence}</div>
                                {s.rationale && (
                                  <button className="rationale-toggle" onClick={e => { e.stopPropagation(); setExpandedRationale(isExpanded ? null : `${dim.key}-${i}`) }}>
                                    {isExpanded ? '收起依据 ▲' : '查看依据 ▼'}
                                  </button>
                                )}
                              </td>
                              <td><RatingBar value={s.breadth} color="#3498db" /></td>
                              <td><RatingBar value={s.depth} color="#9b59b6" /></td>
                              <td><span style={{ color: dirColor, fontWeight: 700 }}>{dirLabel}</span></td>
                              <td><span className="conf-stars">{s.confidence}</span></td>
                              <td className="note-cell">
                                {s.note}
                                {isExpanded && s.rationale && (
                                  <div className="rationale-box"><b>📐 评分依据：</b>{s.rationale}</div>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    <div className="mobile-only">
                      <PolicyCards scores={dim.scores} dimKey={dim.key}
                        expandedRationale={expandedRationale} setExpandedRationale={setExpandedRationale} />
                    </div>
                  </div>
                </section>
              )
            })}
          </div>
        )}

        {/* ════════ TOOLS ════════ */}
        {activeTab === 'tools' && <Tools regionKey={regionKey} toolParams={regionToolParams[regionKey] || regionToolParams.national} onNavigateDim={(key) => { setActiveTab('dimensions'); setSelectedDim(key); setTabKey(k=>k+1) }} />}

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
      </main>

      <footer className="footer">
        <div className="footer-nav">
          <span className="footer-brand">🧭 政策罗盘</span>
          <div className="footer-links">
            <button className="footer-link" onClick={() => { setActiveTab("overview"); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:"smooth"}) }}>总览</button>
            <button className="footer-link" onClick={() => { setActiveTab("monitor"); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:"smooth"}) }}>政策监控</button>
            <button className="footer-link" onClick={() => { setActiveTab("graph"); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:"smooth"}) }}>关系图谱</button>
            <button className="footer-link" onClick={() => { setActiveTab("api"); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:"smooth"}) }}>API</button>
            <button className="footer-link" onClick={() => { setActiveTab("dashboard"); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:"smooth"}) }}>我的档案</button>
          </div>
        </div>
        <p className="footer-info">读懂政策，做对决策 · 数据更新至 2026-07-17 · 方法论v{methodology.version} · {currentRegion.name} · {totalPolicies}条政策</p>
        <p className="footer-legal">数据来源均为政府官方网站 · 仅供参考，不构成投资建议 · © 2026 政策罗盘</p>
      </footer>
    </div>
      </ErrorBoundary>
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
