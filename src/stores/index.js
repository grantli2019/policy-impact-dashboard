import { create } from 'zustand'

/**
 * 策查查 — UI 状态管理
 * 收敛原 App.jsx 中 40+ 个 useState 布尔开关和 UI 状态
 */
export const useUIStore = create((set, get) => ({
  // 导航
  activeTab: 'overview',
  selectedDim: null,
  tabKey: 0,
  moreOpen: false,

  // 弹窗/面板开关（统一管理）
  modals: {
    persona: false,
    share: false,
    report: false,
    upgrade: false,
    feedback: false,
    privacy: false,
    healthCheck: false,
    quiz: false,
    ugc: false,
    subscription: false,
    weeklyDigest: false,
    notifPanel: false,
    valueDashboard: false,
    wrongBook: false,
    dailyChallenge: false,
    shareModal: false,
    timeMachine: false,
    decisionProject: false,
    profileCenter: false,
  },

  // 主题
  darkMode: (() => { try { return localStorage.getItem('theme') === 'dark' } catch { return false } })(),

  // 引导
  showTour: (() => { try { return !sessionStorage.getItem('tour_done') } catch { return false } })(),

  // 庆祝动画
  celebration: null,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedDim: (dim) => set({ selectedDim: dim }),
  incrementTabKey: () => set(s => ({ tabKey: s.tabKey + 1 })),
  setMoreOpen: (open) => set({ moreOpen: open }),

  openModal: (name) => set(s => ({ modals: { ...s.modals, [name]: true } })),
  closeModal: (name) => set(s => ({ modals: { ...s.modals, [name]: false } })),
  toggleModal: (name) => set(s => ({ modals: { ...s.modals, [name]: !s.modals[name] } })),
  closeAllModals: () => set(s => ({
    modals: Object.fromEntries(Object.keys(s.modals).map(k => [k, false]))
  })),

  toggleDarkMode: () => set(s => {
    const next = !s.darkMode
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '')
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch {}
    return { darkMode: next }
  }),

  setShowTour: (show) => set({ showTour: show }),
  setCelebration: (c) => set({ celebration: c }),
}))

/**
 * 策查查 — 用户状态管理
 */
export const useUserStore = create((set, get) => ({
  personaKey: (() => { try { return localStorage.getItem('persona') || null } catch { return null } })(),
  regionKey: (() => { try { return localStorage.getItem('region') || 'national' } catch { return 'national' } }),
  userCity: (() => { try { return localStorage.getItem('user_city') || '' } catch { return '' } })(),
  userAge: (() => { try { const a = localStorage.getItem('user_age'); return a ? +a : null } catch { return null } })(),
  bookmarks: (() => { try { return JSON.parse(localStorage.getItem('bookmarks') || '[]') } catch { return [] } })(),

  setPersona: (key) => {
    try { localStorage.setItem('persona', key) } catch {}
    set({ personaKey: key })
  },
  clearPersona: () => {
    try { localStorage.removeItem('persona') } catch {}
    set({ personaKey: null })
  },
  setRegion: (key) => {
    try { localStorage.setItem('region', key) } catch {}
    set({ regionKey: key, selectedDim: null })
  },
  setUserCity: (city) => {
    try { localStorage.setItem('user_city', city) } catch {}
    set({ userCity: city })
  },
  setUserAge: (age) => {
    try { localStorage.setItem('user_age', String(age)) } catch {}
    set({ userAge: age })
  },
  toggleBookmark: (policyName) => set(s => {
    const next = s.bookmarks.includes(policyName)
      ? s.bookmarks.filter(n => n !== policyName)
      : [...s.bookmarks, policyName]
    try { localStorage.setItem('bookmarks', JSON.stringify(next)) } catch {}
    return { bookmarks: next }
  }),
}))
