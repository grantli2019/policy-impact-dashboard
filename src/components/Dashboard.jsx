import { useState } from 'react'
import {
  personas, actionPlans, policyDividends,
  getDimensionsForRegion, calcDimensionScore, calcOverallIndex, getIndexLevel,
} from '../data/impactData'

/* ═══════ B3: 个人仪表盘 ═══════ */
export default function Dashboard({ personaKey, regionKey, bookmarks, onSwitchTab, userCity, userRegion, RegionComparisonPanel, PolicyCalendar }) {
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

      <div className="dash-stats">
        <div className="dash-stat"><span className="ds-num">{visits.count || 1}</span><span className="ds-label">访问次数</span></div>
        <div className="dash-stat"><span className="ds-num">{done.length}/{plans.length}</span><span className="ds-label">行动完成</span></div>
        <div className="dash-stat"><span className="ds-num">+{(confirmedTotal/10000).toFixed(1)}万</span><span className="ds-label">已确认红利</span></div>
        <div className="dash-stat"><span className="ds-num">{bookmarks.length}</span><span className="ds-label">收藏政策</span></div>
      </div>

      {RegionComparisonPanel && <RegionComparisonPanel regionKey={regionKey} userCity={userCity} />}

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
                const isDone = settlementDone.includes(a.id)
                return (
                  <div key={a.id} className={`sal-item ${isDone ? 'sal-done' : ''}`}>
                    <span className="sal-check" onClick={() => {
                      const next = isDone ? settlementDone.filter(x => x !== a.id) : [...settlementDone, a.id]
                      setSettlementDone(next)
                      try { localStorage.setItem('settlement_actions_done', JSON.stringify(next)) } catch {}
                    }}>{isDone ? '✅' : '⬜'}</span>
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

      <div className="dash-mini-radar" onClick={() => onSwitchTab('radar')}>
        <span className="dmr-icon">📡</span>
        <span className="dmr-text">人生雷达 — 扫描政策机会和盲区</span>
        <span className="dmr-arrow">开启 →</span>
      </div>

      {PolicyCalendar && (
        <div className="dash-inline-calendar">
          <span className="dic-label">📅 即将到来</span>
          <PolicyCalendar personaKey={personaKey} compact={true} />
        </div>
      )}
    </div>
  )
}
