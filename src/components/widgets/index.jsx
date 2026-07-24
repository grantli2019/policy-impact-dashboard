import { useState, useEffect, useRef, memo } from 'react'

/* ═══════ 回到顶部 ═══════ */
export const BackToTop = memo(function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (!visible) return null
  return <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="回到顶部">↑</button>
})

/* ═══════ 可折叠区块 ═══════ */
export const Collapsible = memo(function Collapsible({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`collapsible ${open ? 'open' : ''}`}>
      <button className="collapsible-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className="collapsible-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  )
})

/* ═══════ 动画计数器 ═══════ */
const _counterAnimated = new Set()
export const AnimatedCounter = memo(function AnimatedCounter({ target, duration = 600 }) {
  const hasAnimated = _counterAnimated.has(target)
  const [value, setValue] = useState(hasAnimated ? target : 0)
  const prev = useRef(hasAnimated ? target : 0)
  useEffect(() => {
    if (hasAnimated) return
    const start = performance.now()
    const from = prev.current
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      const v = Math.round(from + (target - from) * ease)
      setValue(v)
      if (t < 1) requestAnimationFrame(tick)
      else { prev.current = target; _counterAnimated.add(target) }
    }
    requestAnimationFrame(tick)
  }, [target, duration, hasAnimated])
  return <>{value}</>
})

/* ═══════ 评分条 ═══════ */
export const RatingBar = memo(function RatingBar({ value, max = 10, color = '#3498db' }) {
  return (
    <div className="rating-bar">
      <div className="rating-bar-bg"><div className="rating-bar-fill" style={{ width: `${(value/max)*100}%`, background: color }} /></div>
      <span className="rating-bar-val">{value}</span>
    </div>
  )
})

/* ═══════ Before/After 对比 ═══════ */
export function BeforeAfterCompare({ currentScore, actionCount, doneCount }) {
  const boost = Math.min(15, Math.round(actionCount * 2.5))
  const afterScore = Math.min(100, currentScore + boost)
  return (
    <div className="ba-compare">
      <div className="ba-header">
        <span className="ba-label-before">当前</span>
        <span className="ba-arrow">→</span>
        <span className="ba-label-after">完成行动后</span>
      </div>
      <div className="ba-bars">
        <div className="ba-bar-wrap">
          <div className="ba-bar ba-before" style={{ width: `${currentScore}%` }}><span>{currentScore}</span></div>
        </div>
        <div className="ba-bar-wrap">
          <div className="ba-bar ba-after" style={{ width: `${afterScore}%` }}><span>{afterScore}</span></div>
        </div>
      </div>
      <p className="ba-text">完成全部行动后，你的指数可从 <b>{currentScore}</b> 提升至 <b style={{ color: "var(--success)" }}>{afterScore}</b>（+{boost}分）</p>
    </div>
  )
}
