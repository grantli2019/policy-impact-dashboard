/**
 * 策查查 — 拆分模块单元测试
 * 覆盖：hooks、stores、utils、widgets 组件
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { timeAgo, safeSetItem, migrateDataVersion, DATA_VERSION } from '../src/utils/helpers'

/* ═══════ utils/helpers 测试 ═══════ */
describe('utils/helpers', () => {
  describe('timeAgo', () => {
    it('应返回"今天"', () => {
      const today = new Date().toISOString().slice(0, 10)
      expect(timeAgo(today)).toBe('今天')
    })

    it('应返回"昨天"', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      expect(timeAgo(yesterday)).toBe('昨天')
    })

    it('应返回"N天前"', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10)
      expect(timeAgo(threeDaysAgo)).toBe('3天前')
    })

    it('应返回"N周前"', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10)
      expect(timeAgo(twoWeeksAgo)).toBe('2周前')
    })

    it('应返回"N个月前"', () => {
      const twoMonthsAgo = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10)
      expect(timeAgo(twoMonthsAgo)).toBe('2个月前')
    })
  })

  describe('safeSetItem', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('应正常存储值', () => {
      const result = safeSetItem('test_key', 'test_value')
      expect(result).toBe(true)
      expect(localStorage.getItem('test_key')).toBe('test_value')
    })

    it('应处理 QuotaExceededError', () => {
      // 模拟 QuotaExceededError
      const original = Storage.prototype.setItem
      const error = new DOMException('quota exceeded', 'QuotaExceededError')
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw error })
      
      const result = safeSetItem('test_key', 'test_value')
      expect(result).toBe(false)
      
      Storage.prototype.setItem = original
    })
  })

  describe('migrateDataVersion', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('首次运行应设置版本号', () => {
      migrateDataVersion()
      expect(localStorage.getItem('data_version')).toBe(DATA_VERSION)
    })

    it('版本变更时应清理过期缓存', () => {
      localStorage.setItem('data_version', '1.0.0')
      localStorage.setItem('recent_searches', '["test"]')
      localStorage.setItem('search_stats', '{}')
      
      migrateDataVersion()
      
      expect(localStorage.getItem('data_version')).toBe(DATA_VERSION)
      expect(localStorage.getItem('recent_searches')).toBeNull()
      expect(localStorage.getItem('search_stats')).toBeNull()
    })

    it('版本相同时不应清理', () => {
      localStorage.setItem('data_version', DATA_VERSION)
      localStorage.setItem('recent_searches', '["test"]')
      
      migrateDataVersion()
      
      expect(localStorage.getItem('recent_searches')).toBe('["test"]')
    })
  })
})

/* ═══════ stores 测试 ═══════ */
describe('stores', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('useUIStore 应有正确的初始状态', async () => {
    const { useUIStore } = await import('../src/stores')
    const state = useUIStore.getState()
    
    expect(state.activeTab).toBeDefined()
    expect(state.tabKey).toBeDefined()
    expect(state.moreOpen).toBe(false)
    expect(state.modals).toBeDefined()
    expect(Object.keys(state.modals).length).toBeGreaterThan(10)
  })

  it('useUIStore.setActiveTab 应更新 activeTab', async () => {
    const { useUIStore } = await import('../src/stores')
    useUIStore.getState().setActiveTab('tools')
    expect(useUIStore.getState().activeTab).toBe('tools')
    // 重置
    useUIStore.getState().setActiveTab('overview')
  })

  it('useUIStore.openModal/closeModal 应正确切换', async () => {
    const { useUIStore } = await import('../src/stores')
    useUIStore.getState().openModal('share')
    expect(useUIStore.getState().modals.share).toBe(true)
    
    useUIStore.getState().closeModal('share')
    expect(useUIStore.getState().modals.share).toBe(false)
  })

  it('useUIStore.closeAllModals 应关闭所有弹窗', async () => {
    const { useUIStore } = await import('../src/stores')
    useUIStore.getState().openModal('share')
    useUIStore.getState().openModal('report')
    useUIStore.getState().closeAllModals()
    
    const modals = useUIStore.getState().modals
    expect(Object.values(modals).every(v => v === false)).toBe(true)
  })

  it('useUserStore 应有正确的初始结构', async () => {
    const { useUserStore } = await import('../src/stores')
    const state = useUserStore.getState()
    
    expect(typeof state.setPersona).toBe('function')
    expect(typeof state.setRegion).toBe('function')
    expect(typeof state.toggleBookmark).toBe('function')
    expect(Array.isArray(state.bookmarks)).toBe(true)
  })

  it('useUserStore.setPersona 应更新并持久化', async () => {
    const { useUserStore } = await import('../src/stores')
    useUserStore.getState().setPersona('worker')
    
    expect(useUserStore.getState().personaKey).toBe('worker')
    expect(localStorage.getItem('persona')).toBe('worker')
    
    // 清理
    useUserStore.getState().clearPersona()
    expect(useUserStore.getState().personaKey).toBeNull()
  })

  it('useUserStore.toggleBookmark 应切换收藏', async () => {
    const { useUserStore } = await import('../src/stores')
    useUserStore.getState().toggleBookmark('测试政策')
    expect(useUserStore.getState().bookmarks).toContain('测试政策')
    
    useUserStore.getState().toggleBookmark('测试政策')
    expect(useUserStore.getState().bookmarks).not.toContain('测试政策')
  })
})
