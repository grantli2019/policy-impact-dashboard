import { useState, useEffect } from 'react'
import {
  lifeRadar, personas, calcDimensionScore, getIndexLevel,
  getUnifiedActions, toggleUnifiedAction,
} from '../data/impactData'

/* ═══════ 雷达扫描逻辑 ═══════ */
function runRadarScan(stageKey, currentDims) {
  const stage = lifeRadar.stages.find(s => s.key === stageKey)
  if (!stage) return { opportunities: [], blindSpots: [], risks: [], radarScore: 0, topActions: [], dimScores: {} }

  const matched = lifeRadar.signals.filter(s => s.stageMatch.includes(stageKey))

  const opportunities = matched.filter(s => s.type === 'opportunity').sort((a,b) => (b.priority==='high'?1:0) - (a.priority==='high'?1:0))
  const blindSpots = matched.filter(s => s.type === 'blindspot').sort((a,b) => (b.priority==='high'?1:0) - (a.priority==='high'?1:0))
  const risks = matched.filter(s => s.type === 'risk').sort((a,b) => (b.priority==='high'?1:0) - (a.priority==='high'?1:0))

  const dimScores = {}
  currentDims.forEach(dim => {
    dimScores[dim.key] = calcDimensionScore(dim)
  })

  let radarScore = 0
  Object.entries(stage.weights).forEach(([dimKey, weight]) => {
    radarScore += (dimScores[dimKey] || 0) * weight
  })
  radarScore = Math.round(radarScore)

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

  const allOpportunities = [...opportunities]
  extraOpportunities.forEach(e => {
    if (!allOpportunities.find(o => o.title.includes(e.title) || e.title.includes(o.title))) {
      allOpportunities.push(e)
    }
  })

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

  const getPoint = (i, radius) => {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
  }

  const gridLevels = [0.25, 0.5, 0.75, 1.0]
  const gridPaths = gridLevels.map(level => {
    const pts = dimKeys.map((_, i) => getPoint(i, r * level))
    return pts.map(p => `${p.x},${p.y}`).join(' ')
  })

  const dataPts = dimKeys.map((key, i) => {
    const score = (dimScores[key] || 0) / 100
    const weight = weights[key] || 0
    const displayScore = Math.min(1, score * (0.6 + weight * 2))
    return getPoint(i, r * displayScore)
  })
  const dataPath = dataPts.map(p => `${p.x},${p.y}`).join(' ')

  const axes = dimKeys.map((_, i) => {
    const p = getPoint(i, r)
    return { x1: cx, y1: cy, x2: p.x, y2: p.y }
  })

  const labels = dimKeys.map((key, i) => {
    const p = getPoint(i, r + 22)
    const weight = weights[key] || 0
    return { x: p.x, y: p.y, key, label: dimLabels[key], icon: dimIcons[key], weight, isHigh: weight >= 0.25 }
  })

  return (
    <div className="radar-chart-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="radar-svg">
        {gridPaths.map((path, i) => (
          <polygon key={i} points={path} fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" opacity={0.4 + i * 0.15} />
        ))}
        {axes.map((a, i) => (
          <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="var(--border-subtle)" strokeWidth="0.5" opacity="0.4" />
        ))}
        <polygon points={dataPath} fill="rgba(22,119,255,0.15)" stroke="#1677ff" strokeWidth="2" className="radar-polygon" />
        {dataPts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#1677ff" className="radar-dot" />
        ))}
        <line x1={cx} y1={cy} x2={cx} y2={cy - r} stroke="#1677ff" strokeWidth="1" opacity="0.6" className="radar-sweep" />
      </svg>
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
export default function LifeRadar({ currentDims, personaKey, onNavigateDim, onSwitchTab }) {
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
    if (!current.includes(actionIdx)) {
      setFloatText('+1 行动力')
      setTimeout(() => setFloatText(null), 1200)
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

  useEffect(() => {
    if (stageKey && !scanDone && !scanning) {
      setScanning(true)
      setTimeout(() => { setScanning(false); setScanDone(true) }, 1500)
    }
  }, [])

  const result = stageKey ? runRadarScan(stageKey, currentDims) : null
  const currentStage = lifeRadar.stages.find(s => s.key === stageKey)

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

      {scanning && (
        <div className="radar-scanning">
          <div className="radar-scanning-ring">
            <div className="radar-scanning-sweep" />
          </div>
          <p className="radar-scanning-text">正在扫描「{currentStage?.label}」相关的政策信号...</p>
        </div>
      )}

      {scanDone && result && (
        <div className="radar-result">
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

          {(() => {
            const unifiedAll = getUnifiedActions(personaKey, stageKey || '')
            if (!unifiedAll.length && result.topActions.length === 0) return null
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
