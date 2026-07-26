import { useState } from 'react'
import { newsLianboUpdates } from '../data/impactData'

function getTier() { return localStorage.getItem('user_tier') || 'free' }

/* ═══════ 政策监控面板 ═══════ */
export default function PolicyMonitor() {
  const [keywords, setKeywords] = useState(() => { try { return JSON.parse(localStorage.getItem('monitor_keywords') || '[]') } catch { return [] } })
  const [input, setInput] = useState('')
  const tier = getTier()
  const maxKeywords = tier === 'free' ? 3 : tier === 'personal' ? 5 : 99

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
    const matches = newsLianboUpdates.filter(n => n.title.includes(keyword) || n.summary?.includes(keyword))
    if (matches.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('📺 策查查·监控提醒', { body: `"${keyword}"有${matches.length}条相关动态` })
    }
  }
  const removeKeyword = (kw) => {
    const next = keywords.filter(k => k !== kw)
    setKeywords(next)
    localStorage.setItem('monitor_keywords', JSON.stringify(next))
  }
  const requestNotify = () => { if ('Notification' in window) Notification.requestPermission() }

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
