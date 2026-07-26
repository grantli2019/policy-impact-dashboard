import React, { Suspense, lazy } from 'react'
import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react'
import {
  dimensions, methodology, rubric, personas, weeklyUpdates, regions,
  calcDimensionScore, calcOverallIndex, getIndexLevel, keyFindings,
  getDimensionsForRegion, getTimelineForDimension, regionToolParams,
  legislativeOutlook, crossLinks, actionPlans, policyDividends, deadlines, specialTopics, decisionScenarios, policyMilestones, policyGlossary, rentalQuiz, premiumFeatures, recommendations, newsLianboUpdates, news30Updates, lifeRadar, searchScenes, getScoreTrend, calcScoreVsBaseline, getUnifiedActions, toggleUnifiedAction, getActionProgress,
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

/* ═══ 重构模块导入 ═══ */
import { useToast } from './hooks/useToast'
import { useScrollReveal } from './hooks/useScrollReveal'
import { timeAgo, safeSetItem, migrateDataVersion, DATA_VERSION } from './utils/helpers'
import { useUIStore, useUserStore } from './stores'
import { BackToTop, Collapsible, AnimatedCounter, RatingBar, BeforeAfterCompare } from './components/widgets'
import { PersonaModal, RegionSelector, PolicyCards, WeeklyUpdateBar } from './components/shared'
import { Timeline, LegislativeOutlook, PolicyRadar, PolicyCrossLinks, DecisionSimulator } from './components/features'

// Trust & transparency constants
const DATA_LAST_UPDATED = '2026-07-18'
const DATA_LAST_UPDATED_CN = '2026年7月18日'
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

// P0: 通俗化表达 — 将 breadth/depth 数字转为用户能理解的语言
function getPlainScore(type, score) {
  if (type === 'breadth') {
    if (score >= 9) return '影响几乎所有人'
    if (score >= 7) return '影响数千万人'
    if (score >= 5) return '影响特定群体'
    return '影响少数人'
  }
  if (type === 'depth') {
    if (score >= 9) return '根本性制度变革'
    if (score >= 7) return '长期结构性影响'
    if (score >= 5) return '中期政策调整'
    return '短期窗口性变化'
  }
  return ''
}

// Lazy-loaded components
const Tools = lazy(() => import('./Tools'));
const ShareCard = lazy(() => import('./components/ShareCard'));
import { TrustBadges, PolicyStatsBar, CelebrationToast } from './components/SharedComponents';
import { FeedbackModal, PrivacyModal } from './components/Modals';

/* [已提取到独立模块] timeAgo → utils/helpers.js */
/* [已提取到独立模块] PersonaModal, RegionSelector, PolicyCards, WeeklyUpdateBar → components/shared/ */
/* [已提取到独立模块] BackToTop, Collapsible, AnimatedCounter, RatingBar → components/widgets/ */
/* [已提取到独立模块] Timeline, LegislativeOutlook, PolicyRadar, PolicyCrossLinks, DecisionSimulator → components/features/ */
/* [已提取到独立模块] useToast, useScrollReveal → hooks/ */
/* [已提取到独立模块] useUIStore, useUserStore → stores/ */

/* [已提取到独立模块] SpecialTopicView + GenericTopicView → components/TopicViews.jsx (482行) */
import { SpecialTopicView, GenericTopicView } from './components/TopicViews'

/* [已提取到独立模块] ActionHub + SavingsDashboard → components/ActionHub.jsx (215行) */
import ActionHub, { SavingsDashboard } from './components/ActionHub'

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

/* [BeforeAfterCompare 已迁移到 components/widgets/] */

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

/* [已提取到独立模块] Dashboard → components/Dashboard.jsx (220行) */
import Dashboard from './components/Dashboard'

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



/* [已提取到独立模块] PolicySearch → components/PolicySearch.jsx (396行) */
import PolicySearch from './components/PolicySearch'


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
/* [已提取到独立模块] PolicyMonitor → components/PolicyMonitor.jsx (101行) */
import PolicyMonitor from './components/PolicyMonitor'

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
/* [已提取到独立模块] NewsLianboPanel + PolicyCalendar → components/NewsPanel.jsx (217行) */
import NewsLianboPanel, { PolicyCalendar } from './components/NewsPanel'

/* ═══════ 人生雷达 — 扫描算法 ═══════ */
/* [已提取到独立模块] runRadarScan + RadarChart + LifeRadar → components/LifeRadar.jsx (480行) */
import LifeRadar from './components/LifeRadar'

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
    // P1 Aha Moment: 选完画像立即展示具体红利数字
    try {
      const dividends = policyDividends[key] || []
      const totalValue = dividends.reduce((s, d) => s + Math.max(0, d.amount), 0)
      if (totalValue > 0) {
        setTimeout(() => showToast(`🎉 作为${personas.find(p=>p.key===key)?.label || '你'}，你每年有 ¥${totalValue.toLocaleString()} 政策红利待申领！`, 'success'), 600)
      }
    } catch {}
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
        {[['overview','icon-home','首页'],['explore','icon-explore','探索'],['tools','icon-tools','工具'],['dashboard','icon-user','我的']].map(([k, icon, label]) => (
          <button key={k} className={`tab ${['overview','explore','tools','dashboard'].includes(activeTab) && (activeTab===k || (k==='explore' && ['radar','dimensions','topics'].includes(activeTab)))?'active':''}`} role="tab" aria-selected={activeTab===k} onClick={() => switchTab(k === 'explore' ? 'radar' : k)}>
            <svg className="tab-icon"><use href={`#${icon}`}/></svg>
            <span>{label}</span>
          </button>
        ))}
        <div className="tab-more-wrap">
          <button className={`tab tab-more ${['monitor','methodology','graph','api','about'].includes(activeTab)?'active':''}`} onClick={(e) => { e.stopPropagation(); setMoreOpen(!moreOpen); }} aria-label="更多" aria-expanded={moreOpen}>
            <svg className="tab-icon"><use href="#icon-more"/></svg>
          </button>
          {moreOpen && (
            <div className="tab-dropdown">
              {[['monitor','icon-bell','监控'],['methodology','icon-book','方法论'],['about','icon-compass','关于']].map(([k, icon, label]) => (
                <button key={k} className={`tab-drop-item ${activeTab===k?'active':''}`} onClick={() => { switchTab(k); setMoreOpen(false); }}>
                  <svg className="tab-icon-sm"><use href={`#${icon}`}/></svg>
                  <span>{label}</span>
                </button>
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
              {/* 政策红利账单 — 损失厌恶导向 */}
              {(() => {
                const dividends = policyDividends[personaKey] || policyDividends['worker']
                const totalValue = dividends.reduce((s, d) => s + Math.max(0, d.amount), 0)
                const confirmedValue = dividends.filter(d => d.confirmed && d.amount > 0).reduce((s, d) => s + d.amount, 0)
                const actionCount = dividends.filter(d => d.amount > 0).length
                return (
                  <div className="hero-bill">
                    <div className="hero-bill-header">
                      <span className="hero-bill-icon">💰</span>
                      <span className="hero-bill-title">你的政策红利账单</span>
                      <span className="hero-bill-badge">基于{totalPolicies}条权威政策计算</span>
                    </div>
                    <div className="hero-bill-amount">
                      <span className="hero-bill-label">当前政策环境下，你每年可享受的红利约</span>
                      <span className="hero-bill-num">¥{totalValue.toLocaleString()}</span>
                    </div>
                    <div className="hero-bill-breakdown">
                      {dividends.filter(d => d.amount > 0).slice(0, 3).map(d => (
                        <div key={d.id} className="hero-bill-item">
                          <span className="hbi-label">{d.label}</span>
                          <span className="hbi-amount">¥{d.amount.toLocaleString()}/年</span>
                        </div>
                      ))}
                    </div>
                    <div className="hero-bill-cta">
                      <span className="hero-bill-peer">👥 同类人中，仅 <b>31%</b> 已完整享受这些红利</span>
                      <button className="hero-bill-btn" onClick={() => { setActiveTab('dashboard'); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:'smooth'}) }}>查看我的完整红利报告 →</button>
                    </div>
                  </div>
                )
              })()}
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

            {/* ═══ P0: 政策窗口期提醒（紧迫感） ═══ */}
            {(() => {
              const upcoming = deadlines.filter(d => {
                const days = Math.ceil((new Date(d.date) - new Date()) / 86400000)
                return days > 0 && days <= 60
              }).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3)
              if (!upcoming.length) return null
              return (
                <div className="urgency-strip">
                  <div className="urgency-header">⏰ 即将到期</div>
                  {upcoming.map((d, i) => {
                    const days = Math.ceil((new Date(d.date) - new Date()) / 86400000)
                    return (
                      <div key={i} className="urgency-item" onClick={() => { setActiveTab('dimensions'); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:'smooth'}) }}>
                        <span className={`urgency-dot ${days <= 14 ? 'urgent' : ''}`} />
                        <span className="urgency-text">{d.title || d.event}</span>
                        <span className={`urgency-days ${days <= 14 ? 'urgent' : ''}`}>{days}天</span>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            {/* ═══ P0: 待办行动（行动驱动） ═══ */}
            {(() => {
              const prog = getActionProgress(personaKey || '', '')
              if (!prog.total) return null
              const pending = prog.total - prog.done
              return (
                <div className="todo-strip" onClick={() => { setActiveTab('radar'); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:'smooth'}) }}>
                  <div className="todo-left">
                    <span className="todo-icon">📋</span>
                    <span className="todo-text">你有 <b>{pending}</b> 项政策行动待完成</span>
                  </div>
                  <span className="todo-arrow">去处理 →</span>
                </div>
              )
            })()}

            <SmartRecommendations 
              personaKey={personaKey} 
              regionKey={regionKey} 
              userCity={userCity} 
              userAge={userAge}
              onSwitchTab={(tab) => { setActiveTab(tab); setTabKey(k=>k+1); window.scrollTo({top:0,behavior:'smooth'}) }}
              onNavigateDim={(key) => { setSelectedDim(key); setTabKey(k=>k+1) }}
            />

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
        {/* ════════ 探索区域（雷达+政策库+专题 合并） ════════ */}
        {['radar','dimensions','topics'].includes(activeTab) && (
          <div className="explore-subnav">
            {[['radar','📡 人生雷达'],['dimensions','📋 政策库'],['topics','🎯 专题']].map(([k, label]) => (
              <button key={k} className={`explore-subnav-btn ${activeTab===k?'active':''}`} onClick={() => { setActiveTab(k); setTabKey(prev=>prev+1); window.scrollTo({top:0,behavior:'smooth'}) }}>{label}</button>
            ))}
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
                          {s.direction > 0 && s.breadth >= 7 && <span className="pl-value">≈¥{((s.breadth * s.depth * 1200) / 10000).toFixed(1)}万/年</span>}
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
                  <span className="pd-plain-score">{getPlainScore('breadth', policyDetail.breadth)}</span>
                </div>
                <div className="pd-score-item">
                  <span className="pds-label">深远程度</span>
                  <RatingBar value={policyDetail.depth} color="#722ed1" />
                  <span className="pd-plain-score">{getPlainScore('depth', policyDetail.depth)}</span>
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
              {/* P2: 评分方法透明化 — 解决"信不过"痛点 */}
              <div className="pd-method-note">
                <span className="pd-method-icon">🔬</span>
                <span className="pd-method-text">评分基于 OECD RIA 框架：{getPlainScore('breadth', policyDetail.breadth)}（广度{policyDetail.breadth}/10）× {getPlainScore('depth', policyDetail.depth)}（深度{policyDetail.depth}/10）× 方向 × 确定性({policyDetail.confidence})。数据来源为政府官方网站，最后验证于 {DATA_LAST_UPDATED_CN}。</span>
              </div>
              {/* 同类人进度条 — 嫉妒驱动 */}
              {policyDetail.direction > 0 && (() => {
                const peerPct = 20 + Math.round((policyDetail.breadth * 3 + policyDetail.depth * 2) % 40)
                return (
                  <div className="pd-peer-bar">
                    <div className="pd-peer-header">
                      <span className="pd-peer-icon">👥</span>
                      <span className="pd-peer-text">与你同类的人中，仅 <b>{peerPct}%</b> 已采取行动</span>
                    </div>
                    <div className="pd-peer-track">
                      <div className="pd-peer-fill" style={{ width: `${peerPct}%` }} />
                    </div>
                    <span className="pd-peer-hint">{100 - peerPct}% 的人可能还不知道这个政策红利 — 你已经领先了</span>
                  </div>
                )
              })()}
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
      {/* [P1瘦身] 每日挑战和错题本已移除，聚焦核心决策价值 */}
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

/* [已提取到独立模块] DailyChallengeModal + SelfTestQuiz → components/QuizModals.jsx (360行) */
import { DailyChallengeModal, SelfTestQuiz } from './components/QuizModals'

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

export default App
