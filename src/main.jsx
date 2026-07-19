import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/* ── 全局错误边界：防止白屏崩溃 ── */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('[策查查] 应用错误:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui', color: '#333', gap: '16px', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px' }}>🧭</div>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>策查查遇到了点小问题</h1>
          <p style={{ fontSize: '14px', color: '#666', maxWidth: '400px' }}>别担心，你的数据不会丢失。请尝试刷新页面，如果问题持续请清除浏览器缓存后重试。</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 24px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>刷新页面</button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

/* ── PWA: 注册 Service Worker ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
