import { useState, useMemo } from 'react'
import { getDailyQuizQuestions, getFullQuizQuestions, getRegionQuizQuestions, getQuizHistory, recordQuizAttempt, getQuizStats, scoreSelfTest } from '../data/quiz'
import { submitDailyChallenge, submitInsightVote, updateUserTier, getNotificationCount, getStreak, addWrongAnswer } from '../data/gamification'

/* ═══════ 每日洞察挑战弹窗 v2 ═══════ */
export function DailyChallengeModal({ show, onClose, challenge, personaKey, userProfile, setNotifCount }) {
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [votes, setVotes] = useState(null)
  const [expandedAngle, setExpandedAngle] = useState(null)
  const [expandedStep, setExpandedStep] = useState(0)
  if (!show || !challenge) return null

  const mode = challenge.mode

  const handleImpactSubmit = () => {
    submitDailyChallenge(challenge.id, 0, true)
    updateUserTier(1, 1)
    setResult({ type:'impact' })
    setNotifCount?.(getNotificationCount())
  }

  const handleForecastSubmit = () => {
    if (selected===null) return
    const updated = submitInsightVote(challenge.id, selected)
    setVotes(updated)
    submitDailyChallenge(challenge.id, 0, true)
    updateUserTier(1, 1)
    setResult({ type:'forecast', selected })
    setNotifCount?.(getNotificationCount())
  }

  const handleConnectSubmit = () => {
    submitDailyChallenge(challenge.id, 0, true)
    updateUserTier(1, 1)
    setResult({ type:'connect' })
    setNotifCount?.(getNotificationCount())
  }

  const voteData = votes || challenge.votes

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content dc-modal-v2" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {!result ? (
          <>
            <div className="dcv-mode-tag">
              {mode==='impact' && '🎯 个人关联'}
              {mode==='forecast' && '🔮 趋势预判'}
              {mode==='connect' && '🔗 连接生活'}
            </div>
            <h3 className="dcv-title">{challenge.title}</h3>
            <p className="dcv-hook">{challenge.hook}</p>

            {mode === 'impact' && (
              <>
                <div className={`dcv-impact-match ${challenge.personalMatch ? 'match-yes' : 'match-else'}`}>
                  <span className="dcv-im-icon">{challenge.personalMatch ? '✅' : '💡'}</span>
                  <span>{challenge.personalReason}</span>
                </div>
                {challenge.personalCalc && (
                  <div className="dcv-impact-calc">
                    <span className="dcv-ic-label">预估影响</span>
                    <span className="dcv-ic-val">¥{challenge.personalCalc.save?.toLocaleString?.() || challenge.personalCalc.save} {challenge.personalCalc.unit}</span>
                  </div>
                )}
                <button className="btn-primary" onClick={handleImpactSubmit} style={{width:'100%',marginTop:16}}>已了解，打卡完成</button>
              </>
            )}

            {mode === 'forecast' && (
              <>
                <p className="dcv-prompt">你怎么看？选择你的判断（无标准答案）</p>
                <div className="dcv-options">
                  {challenge.options.map(opt => (
                    <label key={opt.key} className={`dcv-option ${selected===opt.key?'selected':''}`}
                      onClick={()=>{setSelected(opt.key); setExpandedAngle(opt.key===expandedAngle?null:opt.key)}}>
                      <span className="dcv-radio">{selected===opt.key?'●':'○'}</span>
                      <div className="dcv-opt-body">
                        <span className="dcv-opt-label">{opt.label}</span>
                        <span className="dcv-opt-sectors">{opt.sectors} {opt.indicator}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {expandedAngle && (()=>{
                  const opt = challenge.options.find(o=>o.key===expandedAngle)
                  return opt ? <div className="dcv-angle"><span className="dcv-angle-label">📝 分析视角</span><p>{opt.angle}</p></div> : null
                })()}
                <button className="btn-primary" disabled={selected===null} onClick={handleForecastSubmit} style={{width:'100%',marginTop:12}}>提交我的判断</button>
              </>
            )}

            {mode === 'connect' && (
              <>
                <p className="dcv-prompt">跟着这条影响链，一步步看清对你意味着什么</p>
                <div className="dcv-chain">
                  {challenge.exploreSteps?.map((step, si) => (
                    <div key={si} className={`dcv-chain-step ${expandedStep>=si?'expanded':''}`}
                      onClick={()=>setExpandedStep(expandedStep>=si?si-1:si)}>
                      <div className="dcv-cs-header">
                        <span className="dcv-cs-num">{si+1}</span>
                        <span className="dcv-cs-label">{step.label}</span>
                        <span className="dcv-cs-arrow">{expandedStep>=si?'▾':'▸'}</span>
                      </div>
                      {expandedStep >= si && <p className="dcv-cs-detail">{step.detail}</p>}
                    </div>
                  ))}
                </div>
                <button className="btn-primary" onClick={handleConnectSubmit} style={{width:'100%',marginTop:12}}>懂了，打卡完成</button>
              </>
            )}
          </>
        ) : (
          <>
            <div className="dcv-result-banner correct">🎉 今日洞察完成！</div>
            {result.type === 'forecast' && voteData && (
              <div className="dcv-vote-result">
                <p className="dcv-vr-title">社群判断分布</p>
                <div className="dcv-vr-bars">
                  {challenge.options.map(opt => {
                    const count = voteData[opt.key] || 0
                    const pct = voteData.total > 0 ? Math.round(count/voteData.total*100) : 0
                    const isUser = voteData.userVote === opt.key
                    return (
                      <div key={opt.key} className={`dcv-vr-bar ${isUser?'is-user':''}`}>
                        <span className="dcv-vrb-label">{opt.key}. {opt.label.slice(0,10)}{opt.label.length>10?'…':''}</span>
                        <div className="dcv-vrb-track"><div className="dcv-vrb-fill" style={{width:`${pct}%`}}>{pct>0 && <span>{pct}%</span>}</div></div>
                        {isUser && <span className="dcv-vrb-you">你</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            {challenge.personalConnect && (
              <div className="dcv-connect-box">
                <span className="dcv-cb-label">📌 跟你有什么关系</span>
                <p>{challenge.personalConnect}</p>
              </div>
            )}
            {mode === 'impact' && challenge.personalCalc && (
              <div className="dcv-connect-box">
                <span className="dcv-cb-label">💰 预估影响</span>
                <p className="dcv-cb-val">¥{challenge.personalCalc.save?.toLocaleString?.() || challenge.personalCalc.save} {challenge.personalCalc.unit}</p>
              </div>
            )}
            <div className="dcv-streak-info">🔥 连续打卡 <strong>{getStreak()}</strong> 天</div>
            <button className="btn-primary" onClick={onClose} style={{width:'100%',marginTop:8}}>明天继续</button>
          </>
        )}
      </div>
    </div>
  )
}

/* ═══════ 政策盲区自测 ═══════ */
export function SelfTestQuiz({ show, onClose }) {
  const [mode, setMode] = useState(null)
  const [region, setRegion] = useState('beijing')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [historyView, setHistoryView] = useState(false)
  const quizStats = useMemo(() => { try { return getQuizStats() } catch { return { total:0,done:0,undone:0,accuracy:0,totalAttempts:0 } } }, [show])
  const quizHistory = useMemo(() => { try { return getQuizHistory() } catch { return [] } }, [show])

  const startQuiz = (m) => {
    let qs = []
    if (m === 'daily') qs = getDailyQuizQuestions(3)
    else if (m === 'full') qs = getFullQuizQuestions(15)
    else if (m === 'region') qs = getRegionQuizQuestions(region, 5)
    else qs = getFullQuizQuestions(5)
    setQuestions(qs)
    setMode(m)
    setAnswers({})
    setSubmitted(false)
    setCurrentQ(0)
  }

  const submitQuiz = () => {
    const objAnswers = {}
    questions.forEach(q => { objAnswers[q.id] = answers[q.id] ?? -1 })
    questions.forEach(q => {
      recordQuizAttempt(q.id, answers[q.id] === q.correct)
      if (answers[q.id] !== q.correct) {
        addWrongAnswer(q.question, q.options[answers[q.id] ?? -1] || '未作答', q.options[q.correct], q.explanation, q.dim)
      }
    })
    updateUserTier(scoreSelfTest(objAnswers, questions).score, questions.length)
    setSubmitted(true)
  }

  const handleClose = () => { if (mode && !submitted && questions.length>0) { setMode(null); setAnswers({}); setCurrentQ(0) } else { onClose(); setMode(null); setAnswers({}); setSubmitted(false); setCurrentQ(0) } }

  if (!show) return null
  const result = submitted && questions.length > 0 ? scoreSelfTest(answers, questions) : null

  const RegionPicker = ({ value, onChange }) => {
    const regions = [{key:'beijing',label:'北京'},{key:'shanghai',label:'上海'},{key:'shenzhen',label:'深圳'},{key:'guangzhou',label:'广州'}]
    return (
      <div className="region-picker" onClick={e=>e.stopPropagation()}>
        {regions.map(r => <span key={r.key} className={`rp-chip ${value===r.key?'active':''}`} onClick={()=>onChange(r.key)}>{r.label}</span>)}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content quiz-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>✕</button>
        {!mode ? (<>
          <h3>🎮 政策盲区自测</h3>
          <p className="quiz-intro">每日检测政策感知力，发现忽略的政策盲区。题库持续扩充中。</p>
          {quizStats.totalAttempts > 0 && (
            <div className="quiz-stats-bar">
              <div className="qsb-item"><span className="qsb-num">{quizStats.total}</span><span className="qsb-label">题库</span></div>
              <div className="qsb-item"><span className="qsb-num">{quizStats.done}</span><span className="qsb-label">已做</span></div>
              <div className="qsb-item"><span className={`qsb-num ${quizStats.undone>0?'qsb-new':''}`}>{quizStats.undone}</span><span className="qsb-label">未做</span></div>
              <div className="qsb-item"><span className="qsb-num">{quizStats.accuracy}%</span><span className="qsb-label">正确率</span></div>
            </div>
          )}
          <div className="quiz-mode-grid">
            <div className="quiz-mode-card qmc-daily" onClick={()=>startQuiz('daily')}>
              <span className="qmc-icon">📅</span><span className="qmc-title">每日3题</span>
              <span className="qmc-desc">优先错题和新题 · 2分钟搞定</span>
            </div>
            <div className="quiz-mode-card qmc-full" onClick={()=>startQuiz('full')}>
              <span className="qmc-icon">📝</span><span className="qmc-title">完整测试</span>
              <span className="qmc-desc">15题全面检测 · 5分钟完成</span>
            </div>
            <div className="quiz-mode-card qmc-region" onClick={e=>e.stopPropagation()}>
              <span className="qmc-icon">📍</span><span className="qmc-title">地区专项</span>
              <span className="qmc-desc">聚焦你关心城市的政策差异</span>
              <RegionPicker value={region} onChange={setRegion} />
              <button className="qmc-start-btn" onClick={()=>startQuiz('region')}>开始 →</button>
            </div>
            <div className="quiz-mode-card qmc-quick" onClick={()=>startQuiz('quick')}>
              <span className="qmc-icon">⚡</span><span className="qmc-title">快速5题</span>
              <span className="qmc-desc">随机5题 · 1分钟速测</span>
            </div>
          </div>
          {quizHistory.length > 0 && (
            <div className="quiz-history-section">
              <div className="qhs-header" onClick={()=>setHistoryView(!historyView)}>
                <span>📋 答题记录（{quizHistory.length}次）</span>
                <span className="qhs-toggle">{historyView?'收起 ▲':'展开 ▼'}</span>
              </div>
              {historyView && (
                <div className="qhs-list">{quizHistory.slice(-20).reverse().map((h,i) => (
                  <div key={i} className={`qhs-item ${h.correct?'correct':'wrong'}`}>
                    <span className="qhs-mark">{h.correct?'✅':'❌'}</span>
                    <span className="qhs-date">{h.date}</span>
                  </div>
                ))}</div>
              )}
            </div>
          )}
        </>) : (<>
          <div className="quiz-header-bar">
            <button className="qh-back" onClick={()=>{setMode(null);setAnswers({});setSubmitted(false);setCurrentQ(0)}}>← 返回</button>
            <span className="qh-mode-label">{{daily:'每日3题',full:'完整测试',region:'地区专项',quick:'快速5题'}[mode]}</span>
            <span className="qh-progress">{currentQ+1}/{questions.length}</span>
          </div>
          {!submitted ? (<>
            <div className="quiz-progress-bar"><div className="qpb-fill" style={{width:`${((currentQ+1)/questions.length)*100}%`}} /></div>
            {questions.map((q,qi) => (
              <div key={q.id} className={`quiz-question ${currentQ===qi?'':'quiz-hidden'}`}>
                <div className="qqb-meta">
                  <span className={`qqb-diff qqb-${q.difficulty||'easy'}`}>{(q.difficulty||'easy')==='easy'?'⭐':q.difficulty==='medium'?'⭐⭐':'⭐⭐⭐'}</span>
                  {q.region!=='national' && <span className="qqb-tag qqb-region">📍{(q.region==='beijing'?'北京':q.region==='shanghai'?'上海':q.region==='shenzhen'?'深圳':q.region)}</span>}
                  <span className="qqb-tag qqb-dim">{q.dim==='housing'?'🏠':q.dim==='employment'?'💼':q.dim==='education'?'🎓':q.dim==='elderly'?'👴':q.dim==='finance'?'💰':'🏭'}</span>
                </div>
                <p className="qq-text">{q.question}</p>
                <div className="qq-options">
                  {q.options.map((opt,oi) => (
                    <label key={oi} className={`qq-option ${answers[q.id]===oi?'selected':''}`} onClick={()=>setAnswers({...answers,[q.id]:oi})}>
                      <span className="qq-radio">{answers[q.id]===oi?'●':'○'}</span><span className="qqo-text">{opt}</span>
                      {answers[q.id]===oi && <span className="qqo-check">✓</span>}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="quiz-nav">
              <button className="btn-secondary" disabled={currentQ===0} onClick={()=>setCurrentQ(Math.max(0,currentQ-1))}>上一题</button>
              {currentQ<questions.length-1 ? (
                <button className="btn-primary" disabled={answers[questions[currentQ]?.id]===undefined} onClick={()=>setCurrentQ(currentQ+1)}>下一题</button>
              ) : (
                <button className="btn-primary" onClick={submitQuiz}>✅ 提交答案</button>
              )}
            </div>
          </>) : result && (<>
            <div className="quiz-result">
              <div className="qr-header-new">
                <span className="qr-h-icon">{result.pct>=80?'🏆':result.pct>=60?'📚':'💡'}</span>
                <div>
                  <span className="qr-h-score" style={{color:result.pct>=80?'#27ae60':result.pct>=60?'#e67e22':'#e74c3c'}}>{result.score}/{result.total}</span>
                  <span className="qr-h-level">{result.level.icon} {result.level.label}</span>
                  <span className="qr-h-pct">{result.pct}分</span>
                </div>
              </div>
              {result.missedCount>0 ? (
                <div className="qr-cost-banner">
                  <span>💸 答错的盲区可能让你损失 <strong>¥{result.missedCost.min.toLocaleString()}-{result.missedCost.max.toLocaleString()}</strong></span>
                </div>
              ) : (
                <div className="qr-perfect"><span>🎉 全部正确！你是真正的政策达人！</span></div>
              )}
              <div className="qr-answers">{questions.map(q => {
                const isCorrect = answers[q.id] === q.correct
                return (
                  <div key={q.id} className={`qr-answer ${isCorrect?'correct':'wrong'}`}>
                    <div className="qra-head">
                      <span>{isCorrect?'✅':'❌'}</span>
                      <span className="qr-a-text">{q.question}</span>
                    </div>
                    {!isCorrect && (
                      <div className="qra-detail">
                        <span className="qra-yours">你的答案：{q.options[answers[q.id] ?? -1] || '未作答'}</span>
                        <span className="qra-right">正确：{q.options[q.correct]}</span>
                        <span className="qra-exp">💡 {q.explanation}</span>
                        {q.region!=='national' && <span className="qra-region-note">📍 此题为{q.region==='beijing'?'北京':q.region==='shanghai'?'上海':q.region==='shenzhen'?'深圳':q.region}地区政策，其他城市可能不同</span>}
                      </div>
                    )}
                  </div>
                )
              })}</div>
            </div>
            <div className="quiz-result-actions">
              <button className="btn-secondary" onClick={()=>{setMode(null);setAnswers({});setSubmitted(false);setCurrentQ(0)}}>← 返回选题</button>
              <button className="btn-primary" onClick={()=>startQuiz(mode)}>🔄 再做一组新题</button>
            </div>
          </>)}
        </>)}
      </div>
    </div>
  )
}
