import { crossLinks } from '../data/impactData'

export default function PolicyCrossLinks() {
  return (
    <section className="cross-links">
      <h2 className="section-title">🔗 政策联动效应</h2>
      <p className="cross-desc">政策之间不是孤立的，以下是重要的传导链条</p>
      <div className="cross-list">
        {crossLinks.map((c, i) => (
          <div key={i} className="cross-item">
            <div className="cross-flow">
              <span className="cross-from">{c.from}</span>
              <span className="cross-arrow">→</span>
              <span className="cross-to">{c.to}</span>
            </div>
            <div className="cross-note">💡 {c.note}</div>
          </div>
        ))}
      </div>
    </section>
  )
}