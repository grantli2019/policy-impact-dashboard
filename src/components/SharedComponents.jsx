/**
 * 策查查 — 共享UI组件
 * 从 App.jsx 提取的独立展示组件
 */
import { regions, personas } from '../data/impactData'

/* 信任框架徽章 */
export function TrustBadges() {
  const badges = [
    { name: 'OECD 监管影响评估', icon: '🏛️', desc: '国际通行的政策影响评估框架' },
    { name: 'PEST 宏观分析', icon: '📊', desc: '政治·经济·社会·技术四维分析' },
    { name: '利益相关者矩阵', icon: '🤝', desc: '多维利益相关者影响评估' },
  ]
  return (
    <div className="trust-badges">
      <span className="tb-label">评估框架基于</span>
      <div className="tb-list">
        {badges.map((b, i) => (
          <div key={i} className="tb-item" title={b.desc}>
            <span className="tb-icon">{b.icon}</span>
            <span className="tb-name">{b.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* 政策数据统计栏 */
export function PolicyStatsBar({ totalPolicies }) {
  const stats = [
    { icon: '📋', num: totalPolicies, label: '条权威政策' },
    { icon: '🌏', num: regions.length, label: '大经济区域' },
    { icon: '👥', num: personas.length, label: '类用户画像' },
    { icon: '🔬', num: 3, label: '大国际评估框架' },
  ]
  return (
    <div className="trust-stats-bar">
      {stats.map((s, i) => (
        <div key={i} className="ts-item">
          <span className="ts-icon">{s.icon}</span>
          <span className="ts-num">{s.num}</span>
          <span className="ts-label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}

/* 庆祝Toast */
export function CelebrationToast({ celebration, onClose }) {
  if (!celebration) return null
  return (
    <div className="celebration-toast" onClick={onClose}>
      <span className="celeb-icon">{celebration.icon}</span>
      <span className="celeb-msg">{celebration.msg}</span>
    </div>
  )
}
