import { useRef, useEffect } from 'react'
import { personas, regions, calcOverallIndex, getIndexLevel, calcDimensionScore, getDimensionsForRegion } from '../data/impactData'

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
    const ctx = canvas.getContext('2d'); const W = 750, H = 1100
    canvas.width = W; canvas.height = H
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#1a1a2e'); grad.addColorStop(1, '#16213e')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 32px sans-serif'
    ctx.fillText('🧭 策查查', 40, 60)
    ctx.font = '18px sans-serif'; ctx.fillStyle = '#aaa'
    ctx.fillText(`${region?.name || '全国'} · 征求意见稿跟踪${persona ? ' · ' + persona.icon + persona.label + '视角' : ''}`, 40, 95)
    ctx.fillText(new Date().toISOString().slice(0, 10), 40, 125)
    ctx.fillStyle = overallLevel.color; ctx.font = 'bold 100px sans-serif'
    ctx.fillText(overallIndex, 40, 250)
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText(overallLevel.icon + ' ' + overallLevel.label, 280, 240)
    ctx.font = '20px sans-serif'; ctx.fillStyle = '#ccc'
    ctx.fillText(overallLevel.plain, 280, 275)
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(40, 310); ctx.lineTo(W - 40, 310); ctx.stroke()
    dimScores.forEach((d, i) => {
      const y = 360 + i * 70; const lvl = getIndexLevel(d.idx)
      ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'
      ctx.fillText(d.icon + ' ' + d.name, 40, y)
      ctx.fillStyle = lvl.color; ctx.font = 'bold 28px sans-serif'
      ctx.fillText(d.idx, 650, y)
      ctx.fillStyle = '#333'; ctx.fillRect(300, y - 15, 300, 20)
      ctx.fillStyle = d.color; ctx.fillRect(300, y - 15, 300 * d.idx / 100, 20)
    })
    const qrX = W - 180, qrY = H - 190
    ctx.fillStyle = '#fff'; ctx.fillRect(qrX, qrY, 140, 140)
    ctx.fillStyle = '#1a1a2e'
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++)
      if ((r + c) % 2 === 0 || (r < 3 && c < 3) || (r < 3 && c > 3) || (r > 3 && c < 3))
        ctx.fillRect(qrX + 10 + c * 17, qrY + 10 + r * 17, 15, 15)
    ctx.fillStyle = '#aaa'; ctx.font = '13px sans-serif'
    ctx.fillText('扫码查看你的', qrX - 5, qrY - 15)
    ctx.fillText('专属政策分析', qrX - 5, qrY + 160)
    ctx.fillStyle = '#666'; ctx.font = 'bold 16px sans-serif'
    ctx.fillText('策查查', 40, H - 50)
    const totalPolicies = dims.reduce((a, d) => a + d.scores.length, 0)
    ctx.font = '14px sans-serif'
    ctx.fillText(`基于 OECD RIA + PEST + 利益相关者矩阵 · ${totalPolicies}条权威政策`, 40, H - 25)
    if (persona) {
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; roundRect(ctx, W - 220, 30, 180, 40, 20); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif'
      ctx.fillText(`${persona.icon} ${persona.label}视角`, W - 205, 58)
    }
  }, [personaKey, regionKey])

  const downloadImage = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const link = document.createElement('a')
    link.download = '策查查_分享卡片.png'
    link.href = canvas.toDataURL('image/png'); link.click()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-card-modal" onClick={e => e.stopPropagation()}>
        <h3>📤 分享卡片</h3>
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