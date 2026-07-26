import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  personas, regions, dimensions, crossLinks, actionPlans, policyDividends, premiumFeatures,
  getDimensionsForRegion, calcDimensionScore, calcOverallIndex, getIndexLevel,
  getSmartRecommendations, getRegionComparison,
} from '../data/impactData'

/* ═══════ A2: PDF 报告导出 ═══════ */
export function ReportExport({ personaKey, regionKey, onClose }) {
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
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H)
    const hGrad = ctx.createLinearGradient(0, 0, W, 100)
    hGrad.addColorStop(0, "#1a1a2e"); hGrad.addColorStop(1, "#16213e")
    ctx.fillStyle = hGrad; ctx.fillRect(0, 0, W, 100)
    ctx.fillStyle = "#fff"; ctx.font = "bold 28px sans-serif"
    ctx.fillText("🧭 策查查 · 个人政策影响报告", 30, 60)
    ctx.font = "14px sans-serif"; ctx.fillStyle = "#aaa"
    ctx.fillText(`${region?.name || "全国"} · ${persona ? persona.icon + persona.label : "未选择身份"} · 2026-07-12`, 30, 85)
    ctx.fillStyle = overallLevel.color; ctx.font = "bold 64px sans-serif"
    ctx.fillText(String(overallIndex), 30, 180)
    ctx.font = "bold 24px sans-serif"; ctx.fillText(overallLevel.icon + " " + overallLevel.label, 180, 170)
    ctx.font = "16px sans-serif"; ctx.fillStyle = "#666"; ctx.fillText(overallLevel.plain, 180, 200)
    ctx.strokeStyle = "#e0e0e0"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(30, 220); ctx.lineTo(W-30, 220); ctx.stroke()
    ctx.fillStyle = "#333"; ctx.font = "bold 18px sans-serif"; ctx.fillText("📈 六维度评分", 30, 260)
    dims.forEach((d, i) => {
      const y = 290 + i * 45; const idx = calcDimensionScore(d); const lvl = getIndexLevel(idx)
      ctx.fillStyle = "#333"; ctx.font = "16px sans-serif"; ctx.fillText(d.icon + " " + d.name, 40, y)
      ctx.fillStyle = "#e0e0e0"; ctx.fillRect(250, y - 12, 350, 16)
      ctx.fillStyle = lvl.color; ctx.fillRect(250, y - 12, 350 * idx / 100, 16)
      ctx.fillStyle = lvl.color; ctx.font = "bold 18px sans-serif"; ctx.fillText(String(idx), 630, y)
    })
    const ay = 290 + dims.length * 45 + 30
    ctx.fillStyle = "#333"; ctx.font = "bold 18px sans-serif"; ctx.fillText("📋 行动清单", 30, ay)
    plans.slice(0, 5).forEach((p, i) => {
      ctx.fillStyle = "#555"; ctx.font = "14px sans-serif"
      ctx.fillText(`${i+1}. ${p.title}${p.benefit > 0 ? " (+" + (p.benefit/10000).toFixed(1) + "万)" : ""}`, 40, ay + 30 + i * 28)
    })
    const dy = ay + 30 + Math.min(plans.length, 5) * 28 + 30
    ctx.fillStyle = "#333"; ctx.font = "bold 18px sans-serif"; ctx.fillText("💰 政策红利", 30, dy)
    ctx.fillStyle = "#27ae60"; ctx.font = "bold 22px sans-serif"; ctx.fillText(`已确认红利: +${confirmedTotal.toLocaleString()}元/年`, 40, dy + 35)
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

/* ═══════ A3: 高级功能锁 ═══════ */
export function PremiumTeaser() {
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

/* ═══════ B1: 首次访问引导 ═══════ */
export function OnboardingTour({ onClose }) {
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
export function RegionCompare({ personaKey, currentRegion, onSelectRegion }) {
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

/* ═══════ 地区政策差异速览面板 ═══════ */
export function RegionComparisonPanel({ regionKey, userCity }) {
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

/* ═══════ C2: 画像对比 ═══════ */
export function PersonaCompare({ currentPersonaKey }) {
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
export function InvitePanel() {
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

/* ═══════ 资格自测 Quiz ═══════ */
export function EligibilityQuiz({ quiz }) {
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
export class ErrorBoundary extends React.Component {
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

/* ═══════ P2: 付费墙 + 升级模态框 ═══════ */
export const TIERS = {
  free: { label: '免费版', price: '¥0', features: ['综合指数', '六维度概览', '每日3次搜索', '新闻联播速递'] },
  personal: { label: '个人版', price: '¥99/年', features: ['无限搜索', '完整行动清单', '政策红利账本', 'PDF报告', '关注5个关键词'] },
  pro: { label: '专业版', price: '¥299/年', features: ['个人版全部', '政策监控推送', '关系图谱', '决策模拟全场景', '无限关注'] },
}
export function getTier() { return localStorage.getItem('user_tier') || 'free' }
export function isPremium() { return getTier() !== 'free' }

export function UpgradeModal({ onClose }) {
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

export function PaywallGate({ feature, children }) {
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

/* ═══════ P4: 政策关系图谱 ═══════ */
export function PolicyGraph() {
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
export function ApiDocs() {
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

/* ═══════ SmartRecommendations: 首页智能推荐区 ═══════ */
export function SmartRecommendations({ personaKey, regionKey, userCity, userAge, onSwitchTab, onNavigateDim }) {
  const [recs, setRecs] = useState([])
  const [reasonTags, setReasonTags] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let viewHistory = []
    try { viewHistory = JSON.parse(localStorage.getItem('view_history') || '[]') } catch {}
    let settlementData = null
    try { settlementData = JSON.parse(localStorage.getItem('settlement_data')) } catch {}
    const params = { personaKey, city: userCity, regionKey, age: userAge, viewHistory, settlementData }
    const result = getSmartRecommendations(params)
    setRecs(result)
    const persona = personas.find(p => p.key === personaKey)
    const tags = []
    if (persona) tags.push(persona.label)
    if (userCity) tags.push(userCity.replace(/市$/, ''))
    if (viewHistory.length > 0) tags.push(`${viewHistory.length}条浏览`)
    setReasonTags(tags)
    setLoading(false)
  }, [personaKey, userCity, regionKey, userAge])
  const sentColor = s => s === '利好' ? 'var(--success)' : s === '利空' ? 'var(--danger)' : 'var(--text-secondary)'
  if (loading) return <div className="smart-rec"><div className="sr-loading">正在为你梳理相关政策…</div></div>
  if (recs.length === 0) return null
  return (
    <div className="smart-rec">
      <div className="sr-header">
        <h3 className="sr-title">🎯 为你推荐</h3>
        <div className="sr-tags">{reasonTags.map((t, i) => <span key={i} className="sr-tag">{t}</span>)}</div>
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
