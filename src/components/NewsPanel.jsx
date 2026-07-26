import { useState, useMemo } from 'react'
import { personas } from '../data/core'
import { deadlines } from '../data/content'
import { newsLianboUpdates, news30Updates, enrichNewsForPersona, getNewsForPersona, getNewsByDimension } from '../data/news'

/* ═══════ 新闻联播面板 ═══════ */
export default function NewsLianboPanel({ personaKey, stageKey, onNavigateDim, userProfile, lastVisit }) {
  const [activeTab, setActiveTab] = useState('foryou')
  const [srcFilter, setSrcFilter] = useState('all')
  const [selDim, setSelDim] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const dimMeta = { housing: { icon: '🏠', label: '住房' }, employment: { icon: '💼', label: '就业' }, education: { icon: '🎓', label: '教育' }, pension: { icon: '👴', label: '养老' }, elderly: { icon: '👴', label: '养老' }, finance: { icon: '💰', label: '金融' }, industry: { icon: '🏭', label: '产业' } }
  const sentColor = { '利好': '#27ae60', '利空': '#e74c3c', '中性': '#7f8c8d' }
  const sentBg = { '利好': '#eafaf1', '利空': '#fdedec', '中性': '#f0f0f0' }

  const forYou = useMemo(() => getNewsForPersona(personaKey || 'worker', 8, userProfile), [personaKey, JSON.stringify(userProfile || {})])
  const byDim = useMemo(() => getNewsByDimension(), [])
  const allNews = useMemo(() => [...newsLianboUpdates, ...news30Updates].sort((a,b) => b.date.localeCompare(a.date)).map(n => enrichNewsForPersona(n, personaKey || 'worker', userProfile)), [personaKey, JSON.stringify(userProfile || {})])

  const weeklyStats = useMemo(() => {
    const combined = [...newsLianboUpdates, ...news30Updates]
    const total = combined.length
    const利好 = combined.filter(n => n.sentiment === '利好').length
    const latest = combined.sort((a,b) => b.date.localeCompare(a.date))[0]
    return { total, 利好, 利好Pct: Math.round(利好 / total * 100), latestDate: latest?.date, latestTitle: latest?.title?.slice(0, 30) }
  }, [])

  const displayItems = useMemo(() => {
    let items = activeTab === 'foryou' ? forYou : selDim ? (byDim.find(g => g.dim === selDim)?.items || []) : allNews.slice(0, 20)
    if (srcFilter === 'lianbo') items = items.filter(n => (n.source || '').includes('新闻联播'))
    if (srcFilter === 'news30') items = items.filter(n => (n.source || '').includes('新闻30分'))
    return items
  }, [activeTab, selDim, srcFilter, forYou, byDim, allNews])

  return (
    <div className="lianbo-dashboard">
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

      <div className="lbd-tabs">
        <button className={`lbd-tab ${activeTab === 'foryou' ? 'active' : ''}`} onClick={() => { setActiveTab('foryou'); setSelDim(null) }}>🎯 与你相关</button>
        <button className={`lbd-tab ${activeTab === 'dims' ? 'active' : ''}`} onClick={() => setActiveTab('dims')}>📂 按维度浏览</button>
        <button className={`lbd-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => { setActiveTab('all'); setSelDim(null) }}>📋 全部动态</button>
      </div>

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

      <div className="lbd-news-list">
        <div className="lbd-source-filter">
          <button className={`lbd-src-btn ${srcFilter === 'all' ? 'active' : ''}`} onClick={() => setSrcFilter('all')}>全部</button>
          <button className={`lbd-src-btn ${srcFilter === 'lianbo' ? 'active' : ''}`} onClick={() => setSrcFilter('lianbo')}>📺 新闻联播</button>
          <button className={`lbd-src-btn ${srcFilter === 'news30' ? 'active' : ''}`} onClick={() => setSrcFilter('news30')}>📰 新闻30分</button>
        </div>
        {displayItems.map((item, i) => (
          <div key={i} className={`lbd-news-card ${expandedId === i ? 'expanded' : ''}`} onClick={() => setExpandedId(expandedId === i ? null : i)}>
            <div className="lbd-nc-header">
              <span className="lbd-nc-date">{item.date}</span>
              {lastVisit && item.date > lastVisit && <span className="new-badge">NEW</span>}
              <span className="lbd-nc-dim" onClick={e => { e.stopPropagation(); onNavigateDim?.(item.dim) }}>
                {item.dimIcon || dimMeta[item.dim]?.icon} {dimMeta[item.dim]?.label}
              </span>
              <span className="lbd-nc-sent" style={{ background: sentBg[item.sentiment], color: sentColor[item.sentiment] }}>{item.sentiment}</span>
              <span className={`lbd-nc-impact lbd-impact-${item.impact || '中'}`}>{item.impact === '高' ? '⚡高影响' : '📡关注'}</span>
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

      <div className="lbd-footer">
        <span>📡 数据来源：新闻联播官方摘要 · 每日更新</span>
        <span>💡 点击卡片展开操作建议</span>
      </div>
    </div>
  )
}

/* ═══════ 政策日历组件 ═══════ */
export function PolicyCalendar({ personaKey, compact = false, filterDims = null }) {
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
