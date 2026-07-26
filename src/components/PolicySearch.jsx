import { useState, useRef, useEffect } from 'react'
import { dimensions, weeklyUpdates, keyFindings } from '../data/core'
import { searchScenes } from '../data/content'
import { specialTopics } from '../data/topics'
import { newsLianboUpdates, news30Updates } from '../data/news'

function getTier() { return localStorage.getItem('user_tier') || 'free' }
function isPremium() { return getTier() !== 'free' }

export default function PolicySearch({ onSwitchTab, variant, onNavigateDim }) {
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

  const SYNONYMS = { '买房': ['购房','房贷','公积金'], '卖房': ['售房','二手房','房产交易'], '换工作': ['跳槽','离职','辞职','灵活就业'], '生娃': ['生育','产假','托育'], '孩子': ['子女','学区','托育'], '退休': ['养老','延迟退休','养老金'], '存钱': ['存款','理财','利率'], '看病': ['医保','医疗','门诊','住院'], '开公司': ['创业','营商环境','小微企业'] }

  const searchTimer = useRef(null)
  const lastCountedQuery = useRef('')

  const doSearch = (q) => {
    setQuery(q)
    if (q.trim().length >= 2) {
      const kw = q.toLowerCase()
      const matched = searchScenes.find(s => s.label.toLowerCase().includes(kw) || s.keywords.some(k => k.toLowerCase().includes(kw) || kw.includes(k)))
      setSceneMatch(matched || null)
    } else {
      setSceneMatch(null)
    }
    if (!q.trim()) { setResults(null); setSceneMatch(null); lastCountedQuery.current = ''; return }
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => executeSearch(q), 400)
  }

  const executeSearch = (q) => {
    const today = new Date().toISOString().slice(0,10)
    const stats = (() => { try { return JSON.parse(localStorage.getItem('search_stats') || '{}') } catch { return {} } })()
    const count = stats.date === today ? stats.count : 0
    if (count >= FREE_LIMIT && !isPremium()) { setResults([]); return }
    const normalizedQ = q.trim().toLowerCase()
    if (normalizedQ !== lastCountedQuery.current) {
      localStorage.setItem('search_stats', JSON.stringify({ date: today, count: count + 1 }))
      setDailyCount(count + 1)
      lastCountedQuery.current = normalizedQ
    }

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
    news30Updates.forEach(n => {
      const nTitle = n.title.toLowerCase()
      const nSummary = n.summary.toLowerCase()
      if (allKw.some(k => nTitle.includes(k) || nSummary.includes(k))) {
        const dimMeta = { housing:'🏠', employment:'💼', education:'🎓', pension:'👴', finance:'💰', industry:'🏭' }
        res.push({ type: 'news', dim: n.dim, icon: dimMeta[n.dim] || '📺', dimLabel: '新闻30分', title: n.title, desc: n.summary?.slice(0,60), sentiment: n.sentiment, data: n.data, date: n.date })
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
    res.forEach(r => {
      const title = (r.title || '').toLowerCase()
      const desc = (r.desc || '').toLowerCase()
      let score = 0
      allKw.forEach(k => {
        if (title.includes(k)) score += 10
        if (desc.includes(k)) score += 3
      })
      if (r.type === 'policy') score += 5
      if (r.sentiment === '利好') score += 2
      r._score = score
    })
    res.sort((a, b) => b._score - a._score)
    setResults(res.slice(0, 20))
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
    try {
      const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]')
      const updated = [scene.label, ...recent.filter(s => s !== scene.label)].slice(0, 5)
      localStorage.setItem('recent_searches', JSON.stringify(updated))
      setRecentSearches(updated)
    } catch {}
  }

  const sentColor = s => s === '利好' || s === '偏利好' ? 'var(--success)' : s === '利空' || s === '偏利空' ? 'var(--danger)' : 'var(--text-secondary)'

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
                    {r.type === 'policy' && r.dim && (
                      <div className="ps-ri-action" onClick={e => { e.stopPropagation(); onSwitchTab('tools'); }}>
                        ⚡ 下一步：用计算器测算对你的具体影响 →
                      </div>
                    )}
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
