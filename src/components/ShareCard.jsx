import { useRef, useEffect } from 'react'
import { personas, regions, calcOverallIndex, getIndexLevel, calcDimensionScore, getDimensionsForRegion, policyDividends } from '../data/impactData'

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath()
}

export default function ShareCard({ personaKey, regionKey, onClose }) {
  const canvasRef = useRef(null)
  const persona = personas.find(p => p.key === personaKey)
  const region = regions.find(r => r.key === regionKey)
  const dims = getDimensionsForRegion(regionKey)
  const overallIndex = calcOverallIndex(personaKey, regionKey)
  const overallLevel = getIndexLevel(overallIndex)
  const dimScores = dims.map(d => ({ ...d, idx: calcDimensionScore(d) }))

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); const W = 750, H = 1200
    canvas.width = W; canvas.height = H
    // 背景渐变
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#0f1729'); grad.addColorStop(1, '#1a2744')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)
    // 品牌渐变顶线
    const topGrad = ctx.createLinearGradient(0, 0, W, 0)
    topGrad.addColorStop(0, '#2D5BFF'); topGrad.addColorStop(1, '#6366F1')
    ctx.fillStyle = topGrad; ctx.fillRect(0, 0, W, 5)
    // 标题区
    ctx.fillStyle = '#fff'; ctx.font = 'bold 30px sans-serif'
    ctx.fillText('🧭 我的政策红利报告', 40, 55)
    ctx.font = '15px sans-serif'; ctx.fillStyle = '#8899bb'
    ctx.fillText(`${region?.name || '全国'} · ${persona ? persona.icon + ' ' + persona.label : ''} · ${new Date().toISOString().slice(0, 10)}`, 40, 85)
    // 红利总额区
    const dividends = policyDividends[personaKey] || policyDividends['worker']
    const totalValue = dividends.reduce((s, d) => s + Math.max(0, d.amount), 0)
    ctx.fillStyle = '#8899bb'; ctx.font = '16px sans-serif'
    ctx.fillText('当前政策环境下，我每年可享受的红利约', 40, 140)
    ctx.fillStyle = '#4ade80'; ctx.font = 'bold 64px sans-serif'
    ctx.fillText(`¥${totalValue.toLocaleString()}`, 40, 215)
    ctx.fillStyle = '#8899bb'; ctx.font = '14px sans-serif'
    ctx.fillText('/年', 40 + ctx.measureText(`¥${totalValue.toLocaleString()}`).width + 10, 215)
    // 红利明细
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(40, 245); ctx.lineTo(W - 40, 245); ctx.stroke()
    const topDividends = dividends.filter(d => d.amount > 0).slice(0, 4)
    topDividends.forEach((d, i) => {
      const y = 285 + i * 45
      ctx.fillStyle = '#ccd6e6'; ctx.font = '16px sans-serif'
      ctx.fillText(d.label, 40, y)
      ctx.fillStyle = '#4ade80'; ctx.font = 'bold 18px sans-serif'
      ctx.fillText(`¥${d.amount.toLocaleString()}/年`, 550, y)
    })
    // 社交参照
    const peerY = 285 + topDividends.length * 45 + 20
    ctx.fillStyle = 'rgba(255,122,0,0.1)'; roundRect(ctx, 30, peerY, W - 60, 50, 10); ctx.fill()
    ctx.fillStyle = '#ff7a00'; ctx.font = 'bold 15px sans-serif'
    ctx.fillText('👥 同类人中，仅 31% 已完整享受这些红利', 50, peerY + 32)
    // 政策影响力指数
    const idxY = peerY + 80
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(40, idxY); ctx.lineTo(W - 40, idxY); ctx.stroke()
    ctx.fillStyle = '#8899bb'; ctx.font = '14px sans-serif'
    ctx.fillText('政策影响力指数', 40, idxY + 35)
    ctx.fillStyle = overallLevel.color; ctx.font = 'bold 56px sans-serif'
    ctx.fillText(String(overallIndex), 40, idxY + 95)
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText(overallLevel.icon + ' ' + overallLevel.label, 160, idxY + 85)
    // 维度条形图
    const barY = idxY + 120
    dimScores.slice(0, 6).forEach((d, i) => {
      const y = barY + i * 55; const lvl = getIndexLevel(d.idx)
      ctx.fillStyle = '#ccd6e6'; ctx.font = '15px sans-serif'
      ctx.fillText(d.icon + ' ' + d.name, 40, y + 5)
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; roundRect(ctx, 220, y - 10, 380, 18, 9); ctx.fill()
      ctx.fillStyle = d.color; roundRect(ctx, 220, y - 10, 380 * d.idx / 100, 18, 9); ctx.fill()
      ctx.fillStyle = lvl.color; ctx.font = 'bold 18px sans-serif'
      ctx.fillText(String(d.idx), 630, y + 5)
    })
    // 底部信息
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, H - 80, W, 80)
    ctx.fillStyle = '#667799'; ctx.font = '13px sans-serif'
    const totalPolicies = dims.reduce((a, d) => a + d.scores.length, 0)
    ctx.fillText(`基于 ${totalPolicies} 条权威政策 · 来源均为政府官网 · OECD RIA + PEST 评估框架`, 40, H - 48)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif'
    ctx.fillText('策查查 · 读懂政策，做对决策', 40, H - 22)
    ctx.fillStyle = '#667799'; ctx.font = '13px sans-serif'
    ctx.fillText('扫码查看你的专属政策红利报告 →', W - 280, H - 22)
  }, [personaKey, regionKey])

  const downloadImage = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const link = document.createElement('a')
    link.download = '策查查_我的政策红利报告.png'
    link.href = canvas.toDataURL('image/png'); link.click()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-card-modal" onClick={e => e.stopPropagation()}>
        <h3>📤 我的政策红利报告</h3>
        <canvas ref={canvasRef} style={{ width: '100%', borderRadius: 12, maxWidth: 375 }} />
        <div className="share-actions">
          <button className="btn-primary" onClick={downloadImage}>💾 保存图片</button>
          <button className="btn-secondary" onClick={() => { navigator.clipboard.writeText(window.location.href) }}>📋 复制链接</button>
          <a className="btn-secondary" href={`https://service.weibo.com/share/share.php?title=${encodeURIComponent("我的政策影响力指数是" + calcOverallIndex(personaKey, regionKey) + "分，来看看你的！")}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener" style={{ textDecoration: "none" }}>📢 微博</a>
          <div className="share-wechat-hint"><small>💡 保存图片后可直接发到微信群/朋友圈</small></div>
          <button className="btn-secondary" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  )
}