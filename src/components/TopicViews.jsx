import { useState, useEffect } from 'react'
import { specialTopics, rentalQuiz } from '../data/impactData'

/* ═══════ 场景化专题（Special Topic） ═══════ */
export function SpecialTopicView({ topic, personaKey }) {
  const [activeTab, setActiveTab] = useState('paths')
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [doneActions, setDoneActions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('topic_progress') || '{}') } catch { return {} }
  })

  const topicDone = doneActions[topic.id] || []
  const toggleAction = (id) => {
    setDoneActions(prev => {
      const list = prev[topic.id] || []
      const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id]
      const updated = { ...prev, [topic.id]: next }
      localStorage.setItem('topic_progress', JSON.stringify(updated))
      return updated
    })
  }

  const difficultyStars = d => '★'.repeat(d) + '☆'.repeat(5 - d)
  const urgencyColor = u => u === 'immediate' ? '#e53935' : u === 'soon' ? '#ff9800' : '#4caf50'
  const urgencyLabel = u => u === 'immediate' ? '立即行动' : u === 'soon' ? '尽快办理' : '持续关注'

  const actionDone = topic.actionItems.filter(a => topicDone.includes(a.id)).length
  const actionTotal = topic.actionItems.length

  return (
    <div className="special-topic">
      <div className="topic-hero">
        <span className="topic-hero-icon">{topic.icon}</span>
        <div>
          <h2 className="topic-hero-title">{topic.title}</h2>
          <p className="topic-hero-sub">{topic.subtitle}</p>
          <div className="topic-tags">{topic.tags.map(t => <span key={t} className="topic-tag">{t}</span>)}</div>
        </div>
      </div>

      <div className="topic-tabs" role="tablist" aria-label="专题导航">
        {[
          ['paths', '🛤️ 落户路径'],
          ['enrollment', '🏫 入学条件'],
          ['points', '📊 积分计算'],
          ['timeline', '📅 时间节点'],
          ['action', '📝 行动清单'],
          ['faq', '❓ 常见问题'],
        ].map(([k, label]) => (
          <button key={k} className={`tab-btn topic-tab ${activeTab === k ? 'active' : ''}`} role="tab" aria-selected={activeTab === k} onClick={() => setActiveTab(k)}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'paths' && (
        <div className="topic-section">
          <h3 className="topic-section-title">🛤️ 上海落户五大路径对比</h3>
          <div className="paths-grid">
            {topic.hukouPaths.map((p, i) => (
              <div key={i} className="path-card">
                <div className="path-header">
                  <h4 className="path-name">{p.name}</h4>
                  <span className="path-difficulty" title={`难度 ${p.difficulty}/5`}>{difficultyStars(p.difficulty)}</span>
                </div>
                <div className="path-time">⏱️ {p.timeCost}</div>
                <div className="path-conditions">
                  {p.conditions.map((c, ci) => <div key={ci} className="path-cond">• {c}</div>)}
                </div>
                <div className="path-footer">
                  <span className="path-pro">✅ {p.pros}</span>
                  <span className="path-con">⚠️ {p.cons}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'enrollment' && (
        <div className="topic-section">
          <h3 className="topic-section-title">🏫 子女入学条件链（沪籍 vs 非沪籍）</h3>
          <div className="enrollment-table">
            <div className="enroll-header">
              <span className="enroll-col status">户籍状态</span>
              <span className="enroll-col stage">学段</span>
              <span className="enroll-col policy">政策</span>
              <span className="enroll-col tips">要点</span>
            </div>
            {topic.enrollmentChain.map((e, i) => (
              <div key={i} className={`enroll-row ${e.hukouStatus.includes('不足') ? 'enroll-warn' : e.hukouStatus === '沪籍' ? 'enroll-ok' : 'enroll-mid'}`}>
                <span className="enroll-col status">{e.hukouStatus}</span>
                <span className="enroll-col stage">{e.stage}</span>
                <span className="enroll-col policy">{e.policy}</span>
                <span className="enroll-col tips">{e.tips}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'points' && (
        <div className="topic-section">
          <h3 className="topic-section-title">📊 居住证积分计算要素</h3>
          <div className="points-info">
            <span className="points-passline">达标线：<b>{topic.pointsCalc.passLine}分</b></span>
            <span className="points-tip">💡 {topic.pointsCalc.tip}</span>
          </div>
          <div className="points-grid">
            {topic.pointsCalc.items.map((item, i) => (
              <div key={i} className="points-card">
                <div className="points-card-name">{item.name}</div>
                <div className="points-card-max">最高 {item.max} 分</div>
                <div className="points-card-detail">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="topic-section">
          <h3 className="topic-section-title">📅 关键时间节点</h3>
          <div className="topic-timeline">
            {topic.keyDates.map((d, i) => (
              <div key={i} className={`ktl-item ktl-${d.urgency}`}>
                <div className="ktl-date">{d.date}</div>
                <div className="ktl-info">
                  <span className="ktl-event">{d.event}</span>
                  <span className="ktl-action">{d.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'action' && (
        <div className="topic-section">
          <div className="topic-action-header">
            <h3 className="topic-section-title">📝 专题行动清单</h3>
            <span className="topic-action-progress">已完成 {actionDone}/{actionTotal} 项</span>
          </div>
          <div className="topic-action-list">
            {topic.actionItems.map(item => {
              const isChecked = topicDone.includes(item.id)
              return (
                <div key={item.id} className={`topic-action-item ${isChecked ? 'tai-done' : ''}`}>
                  <label className="tai-check" onClick={e => { e.stopPropagation(); toggleAction(item.id) }}>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleAction(item.id)} />
                    <span className="tai-visual">{isChecked ? '✓' : ''}</span>
                  </label>
                  <div className="tai-content">
                    <div className="tai-title-row">
                      <span className={`tai-title ${isChecked ? 'title-line' : ''}`}>{item.title}</span>
                      <span className="tai-urgency" style={{ color: urgencyColor(item.urgency), borderColor: urgencyColor(item.urgency) }}>
                        {urgencyLabel(item.urgency)}
                      </span>
                    </div>
                    <div className="tai-steps">{item.steps.map((s, si) => <div key={si} className="tai-step"><span className="tai-step-num">{si + 1}</span>{s}</div>)}</div>
                    {item.tips && <div className="tai-tips">💡 {item.tips}</div>}
                    {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="tai-link">🔗 打开官网</a>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="topic-section">
          <h3 className="topic-section-title">❓ 常见问题</h3>
          <div className="topic-faq-list">
            {topic.faq.map((f, i) => (
              <div key={i} className="faq-item">
                <div className="faq-q" onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <span className="faq-arrow">{expandedFaq === i ? '▲' : '▼'}</span>
                </div>
                {expandedFaq === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════ 通用专题视图（Generic Topic View） ═══════ */
export function GenericTopicView({ topic, EligibilityQuiz }) {
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [calcInputs, setCalcInputs] = useState({})
  const [calcResults, setCalcResults] = useState({})
  const [doneActions, setDoneActions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('topic_progress') || '{}') } catch { return {} }
  })

  const topicDone = doneActions[topic.id] || []
  const toggleAction = (id) => {
    setDoneActions(prev => {
      const list = prev[topic.id] || []
      const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id]
      const updated = { ...prev, [topic.id]: next }
      localStorage.setItem('topic_progress', JSON.stringify(updated))
      return updated
    })
  }

  const runCalc = (calcId, formula) => {
    const inputs = calcInputs[calcId] || {}
    const calc = topic.calculators.find(c => c.id === calcId)
    const values = {}
    calc.inputs.forEach(inp => { values[inp.key] = inputs[inp.key] !== undefined ? inputs[inp.key] : inp.default })
    setCalcResults(prev => ({ ...prev, [calcId]: formula(values) }))
  }

  useEffect(() => {
    if (!topic.calculators) return
    topic.calculators.forEach(calc => {
      if (calcInputs[calc.id]) runCalc(calc.id, calc.formula)
    })
  }, [calcInputs])

  const urgencyColor = u => u === 'immediate' ? '#e53935' : u === 'soon' ? '#ff9800' : '#4caf50'
  const urgencyLabel = u => u === 'immediate' ? '立即行动' : u === 'soon' ? '尽快办理' : '持续关注'

  return (
    <div className="special-topic">
      <div className="topic-hero">
        <span className="topic-hero-icon">{topic.icon}</span>
        <div>
          <h2 className="topic-hero-title">{topic.title}</h2>
          <p className="topic-hero-sub">{topic.subtitle}</p>
          <div className="topic-tags">{topic.tags.map(t => <span key={t} className="topic-tag">{t}</span>)}</div>
        </div>
      </div>

      {topic.id === 'rental_housing' && EligibilityQuiz && <EligibilityQuiz quiz={rentalQuiz} />}
      {topic.calculators && topic.calculators.map(calc => (
        <div key={calc.id} className="topic-section gt-calc-section">
          <h3 className="topic-section-title">🧮 {calc.title}</h3>
          <div className="gt-calc-form">
            {calc.inputs.map(inp => (
              <div key={inp.key} className="gt-calc-field">
                <label>{inp.label}</label>
                {inp.type === 'boolean' ? (
                  <label className="gt-toggle">
                    <input type="checkbox" checked={calcInputs[calc.id]?.[inp.key] ?? inp.default}
                      onChange={e => setCalcInputs(prev => ({ ...prev, [calc.id]: { ...(prev[calc.id]||{}), [inp.key]: e.target.checked } }))} />
                    <span>{(calcInputs[calc.id]?.[inp.key] ?? inp.default) ? '是' : '否'}</span>
                  </label>
                ) : (
                  <div className="gt-input-group">
                    <input type="number" value={calcInputs[calc.id]?.[inp.key] ?? inp.default}
                      onChange={e => setCalcInputs(prev => ({ ...prev, [calc.id]: { ...(prev[calc.id]||{}), [inp.key]: Number(e.target.value) } }))} />
                    <span className="gt-unit">{inp.unit}</span>
                  </div>
                )}
              </div>
            ))}
            <button className="gt-calc-btn" onClick={() => runCalc(calc.id, calc.formula)}>计算结果</button>
          </div>
          {calcResults[calc.id] && (
            <div className="gt-calc-result">
              {(() => {
                const r = calcResults[calc.id]
                if (calc.id === 'severance') return (
                  <>
                    <div className="gcr-big">应得赔偿：¥{r.total.toLocaleString()}</div>
                    <div className="gcr-detail">{r.breakdown}</div>
                    {r.note && <div className="gcr-note">⚠️ {r.note}</div>}
                  </>
                )
                if (calc.id === 'annual_leave') return (
                  <>
                    <div className="gcr-big">法定年假：{r.days} 天</div>
                    <div className="gcr-detail">{r.note}</div>
                  </>
                )
                if (calc.id === 'overtime') return (
                  <>
                    <div className="gcr-big">加班费合计：¥{r.total.toLocaleString()}</div>
                    <div className="gcr-detail">{r.breakdown}</div>
                    <div className="gcr-detail">时薪基数：¥{r.hourly}/小时</div>
                  </>
                )
                if (calc.id === 'unemployment') return (
                  <>
                    <div className="gcr-big">可领取：{r.months}个月 × ¥{r.monthly}/月 = ¥{r.total.toLocaleString()}</div>
                    <div className="gcr-detail">{r.note}</div>
                    <div className="gcr-conditions">申领条件：{r.conditions.join('、')}</div>
                  </>
                )
                if (calc.id === 'rent_savings') return (
                  <>
                    <div className="gcr-big">{r.name}月租：¥{r.protectedRent.toLocaleString()} <span className="gcr-vs">vs 市场¥{r.marketRent.toLocaleString()}</span></div>
                    <div className="gcr-detail">每月节省 ¥{r.monthlySaving.toLocaleString()} · {r.months}个月共省 ¥{r.totalSaving.toLocaleString()}</div>
                    <div className="gcr-detail">年省 ¥{r.annualSaving.toLocaleString()}（租金为市场的{r.rate}%）</div>
                    {r.note && <div className="gcr-note">💡 {r.note}</div>}
                  </>
                )
                return (
                  <div className="gcr-generic">
                    {Object.entries(r).filter(([k]) => !['note'].includes(k)).map(([k, v]) => (
                      <div key={k} className="gcr-row">
                        <span className="gcr-label">{k}</span>
                        <span className="gcr-value">{typeof v === 'number' ? v.toLocaleString() : String(v)}</span>
                      </div>
                    ))}
                    {r.note && <div className="gcr-note">💡 {r.note}</div>}
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      ))}

      {topic.relatedTopics && topic.relatedTopics.length > 0 && (
        <div className="topic-section related-topics-section">
          <h3 className="topic-section-title">🔗 相关专题</h3>
          <div className="related-topics-grid">
            {topic.relatedTopics.map(rtId => {
              const rt = specialTopics.find(t => t.id === rtId);
              if (!rt) return null;
              return (
                <div key={rtId} className="related-topic-card" onClick={() => {
                  const el = document.getElementById(`topic-${rtId}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <span className="rt-icon">{rt.icon}</span>
                  <div className="rt-info">
                    <span className="rt-title">{rt.title}</span>
                    <span className="rt-sub">{rt.subtitle}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {topic.sections && topic.sections.map((sec, si) => (
        <div key={si} className="topic-section">
          <h3 className="topic-section-title">{sec.title}</h3>

          {(sec.type === 'comparison' || sec.type === 'deductions' || sec.type === 'calc_table') && (
            <div className="enrollment-table">
              <div className="enroll-header">{sec.headers.map((h, hi) => <span key={hi} className="enroll-col">{h}</span>)}</div>
              {sec.rows.map((row, ri) => (
                <div key={ri} className="enroll-row">{row.map((cell, ci) => <span key={ci} className="enroll-col">{cell}</span>)}</div>
              ))}
              {sec.note && <div className="gt-table-note">💡 {sec.note}</div>}
            </div>
          )}

          {sec.type === 'detail' && (
            <div className="detail-card-list">
              {sec.items.map((item, ii) => (
                <div key={ii} className="detail-card">
                  <div className="detail-card-header">
                    <span className="detail-card-name">{item.name}</span>
                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="policy-source-link">查看政策原文 ↗</a>}
                  </div>
                  {item.conditions && (
                    <div className="detail-card-row">
                      <span className="detail-card-label">申请条件</span>
                      <ul className="detail-card-conditions">
                        {item.conditions.map((c, ci) => <li key={ci}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="detail-card-meta">
                    {item.rent && <div className="detail-meta-item"><span className="detail-meta-k">💰 租金</span><span className="detail-meta-v">{item.rent}</span></div>}
                    {item.area && <div className="detail-meta-item"><span className="detail-meta-k">📐 面积</span><span className="detail-meta-v">{item.area}</span></div>}
                    {item.term && <div className="detail-meta-item"><span className="detail-meta-k">📅 期限</span><span className="detail-meta-v">{item.term}</span></div>}
                    {item.apply && <div className="detail-meta-item"><span className="detail-meta-k">📝 申请</span><span className="detail-meta-v">{item.apply}</span></div>}
                  </div>
                  {item.note && <div className="detail-card-note">💡 {item.note}</div>}
                </div>
              ))}
            </div>
          )}

          {sec.type === 'process' && (
            <div className="topic-timeline">
              {sec.steps.map((s, i) => (
                <div key={i} className="ktl-item ktl-medium">
                  <div className="ktl-date">第{i+1}步</div>
                  <div className="ktl-info">
                    <span className="ktl-event">{s.title}</span>
                    <span className="ktl-action">{s.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sec.type === 'action_list' && (() => {
            const items = sec.items || []
            const done = items.filter(it => topicDone.includes(it.id)).length
            return (
              <div>
                <div className="topic-action-header">
                  <span className="topic-action-progress">已完成 {done}/{items.length} 项</span>
                </div>
                <div className="topic-action-list">
                  {items.map(item => {
                    const isChecked = topicDone.includes(item.id)
                    return (
                      <div key={item.id} className={`topic-action-item ${isChecked ? 'tai-done' : ''}`}>
                        <label className="tai-check" onClick={e => { e.stopPropagation(); toggleAction(item.id) }}>
                          <input type="checkbox" checked={isChecked} onChange={() => toggleAction(item.id)} />
                          <span className="tai-visual">{isChecked ? '✓' : ''}</span>
                        </label>
                        <div className="tai-content">
                          <div className="tai-title-row">
                            <span className={`tai-title ${isChecked ? 'title-line' : ''}`}>{item.title}</span>
                            <span className="tai-urgency" style={{ color: urgencyColor(item.urgency), borderColor: urgencyColor(item.urgency) }}>{urgencyLabel(item.urgency)}</span>
                          </div>
                          <div className="tai-steps">{item.steps.map((s, si) => <div key={si} className="tai-step"><span className="tai-step-num">{si+1}</span>{s}</div>)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {sec.type === 'tips' && (
            <div className="gt-tips-list">
              {sec.items.map((t, i) => (
                <div key={i} className="gt-tip-card">
                  <div className="gt-tip-title">💡 {t.title}</div>
                  <div className="gt-tip-content">{t.tip}</div>
                </div>
              ))}
            </div>
          )}

          {sec.type === 'faq' && (
            <div className="topic-faq-list">
              {sec.items.map((f, i) => {
                const faqKey = `${si}-${i}`
                return (
                  <div key={i} className="faq-item">
                    <div className="faq-q" onClick={() => setExpandedFaq(expandedFaq === faqKey ? null : faqKey)}>
                      <span>{f.q}</span>
                      <span className="faq-arrow">{expandedFaq === faqKey ? '▲' : '▼'}</span>
                    </div>
                    {expandedFaq === faqKey && <div className="faq-a">{f.a}</div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
