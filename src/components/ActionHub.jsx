import { useState } from 'react'
import { actionPlans, policyDividends, deadlines } from '../data/impactData'

/* ═══════ A1: 行动成果可视化 (Savings Dashboard) ═══════ */
export function SavingsDashboard({ personaKey }) {
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

/* ═══════ 行动中枢（Action Hub） ═══════ */
export default function ActionHub({ personaKey, onSwitchTab }) {
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

  const confirmedTotal = dividends.filter(d => d.confirmed && d.amount > 0).reduce((a, d) => a + d.amount, 0)
  const riskTotal = dividends.filter(d => d.isRisk && d.amount < 0).reduce((a, d) => a + d.amount, 0)
  const netTotal = confirmedTotal + riskTotal

  const urgencyLabel = u => u === 'immediate' ? '立即行动' : u === 'soon' ? '尽快办理' : '持续关注'
  const urgencyClass = u => u === 'immediate' ? 'urg-red' : u === 'soon' ? 'urg-orange' : 'urg-green'

  if (plans.length === 0) return null

  return (
    <div className="action-hub">
      <SavingsDashboard personaKey={personaKey} />
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
