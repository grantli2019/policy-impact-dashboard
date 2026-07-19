/**
 * 策查查 — 模态框组件
 * FeedbackModal + PrivacyModal
 */
import { useState } from 'react'

const CONTACT_EMAIL = 'contact@cechacha.com'

/* 反馈模态框 */
export function FeedbackModal({ onClose }) {
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const handleSubmit = () => {
    if (!text.trim()) return
    window.open(`mailto:${CONTACT_EMAIL}?subject=策查查反馈&body=${encodeURIComponent(text)}`)
    setSent(true)
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>💬 反馈建议</h3>
        {sent ? (
          <div className="feedback-sent">
            <p>✅ 感谢你的反馈！邮件客户端已打开，发送即可。</p>
            <button className="btn-primary" onClick={onClose}>关闭</button>
          </div>
        ) : (
          <>
            <p className="feedback-desc">帮助我们做得更好，你的每一条建议都非常重要。</p>
            <textarea className="feedback-textarea" placeholder="请描述你的建议、遇到的问题或功能需求…" value={text} onChange={e => setText(e.target.value)} rows={5} />
            <div className="feedback-actions">
              <button className="btn-secondary" onClick={onClose}>取消</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={!text.trim()}>📤 提交反馈</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* 隐私政策模态框 */
export function PrivacyModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="privacy-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>🔒 隐私政策</h3>
        <div className="privacy-content">
          <h4>1. 数据收集</h4>
          <p>策查查仅在本地浏览器存储以下数据：用户画像选择、区域偏好、主题偏好、书签收藏、界面主题设置。所有数据均存储在浏览器的 localStorage 中，不会上传至服务器。</p>
          <h4>2. 数据使用</h4>
          <p>收集的数据仅用于提供个性化的政策推荐和界面体验优化。我们不会将你的数据分享给任何第三方。</p>
          <h4>3. Cookie / 本地存储</h4>
          <p>本应用使用浏览器 localStorage 存储你的偏好设置，不使用第三方追踪 Cookie。你可以随时通过浏览器设置清除这些数据。</p>
          <h4>4. 数据安全</h4>
          <p>由于数据仅保存在你的本地设备上，不存在服务器端数据泄露风险。但我们建议在共享设备上使用时注意清除浏览数据。</p>
          <h4>5. 联系我们</h4>
          <p>如你有任何隐私相关的疑问，请发送邮件至 {CONTACT_EMAIL}</p>
        </div>
        <button className="btn-primary" onClick={onClose} style={{ marginTop: 16 }}>我知道了</button>
      </div>
    </div>
  )
}
