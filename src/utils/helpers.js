/**
 * 策查查 — 通用工具函数
 */

export function timeAgo(dateStr) {
  const now = new Date(), d = new Date(dateStr)
  const days = Math.floor((now - d) / 86400000)
  if (days === 0) return '今天'; if (days === 1) return '昨天'
  if (days <= 7) return `${days}天前`; if (days <= 30) return `${Math.floor(days/7)}周前`
  return `${Math.floor(days/30)}个月前`
}

export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && (k.startsWith('quiz_history') || k.startsWith('tool_result') || k.startsWith('growth_'))) {
          keysToRemove.push(k)
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k))
      try { localStorage.setItem(key, value); return true } catch { return false }
    }
    return false
  }
}

export const DATA_VERSION = '3.1.0'

export function migrateDataVersion() {
  const stored = localStorage.getItem('data_version')
  if (stored === DATA_VERSION) return
  if (stored && stored !== DATA_VERSION) {
    localStorage.removeItem('recent_searches')
    localStorage.removeItem('search_stats')
  }
  localStorage.setItem('data_version', DATA_VERSION)
}
