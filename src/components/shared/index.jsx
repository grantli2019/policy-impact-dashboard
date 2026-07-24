import { useState } from 'react'
import { personas, regions } from '../../data/impactData'

/* ═══════ 画像选择器 ═══════ */
export function PersonaModal({ onSelect, onSkip }) {
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

/* ═══════ 区域选择器 ═══════ */
export function RegionSelector({ value, onChange }) {
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

/* ═══════ 移动端政策卡片 ═══════ */
export function PolicyCards({ scores, dimKey, expandedRationale, setExpandedRationale }) {
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

/* ═══════ 本周更新条 ═══════ */
export function WeeklyUpdateBar({ lastVisit, weeklyUpdates }) {
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
