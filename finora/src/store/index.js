import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { THEMES } from '../themes'

const DEFAULT_THEME = 'forest'

export const useThemeStore = create(persist(
  (set) => ({
    themeKey: DEFAULT_THEME,
    theme: THEMES[DEFAULT_THEME],
    setTheme: (key) => { if (THEMES[key]) set({ themeKey: key, theme: THEMES[key] }) }
  }),
  { name: 'finora-theme' }
))

export const useAuthStore = create(persist(
  (set) => ({
    user: null, session: null,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    logout: () => set({ user: null, session: null })
  }),
  { name: 'finora-auth' }
))

export const useTransactionStore = create(persist(
  (set, get) => ({
    transactions: [],
    setTransactions: (txns) => set({ transactions: txns }),
    addTransaction: (txn) => set((s) => ({
      transactions: [{ ...txn, id: txn.id || Date.now().toString(), created_at: new Date().toISOString() }, ...s.transactions]
    })),
    updateTransaction: (id, updates) => set((s) => ({
      transactions: s.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
    })),
    deleteTransaction: (id) => set((s) => ({
      transactions: s.transactions.filter(t => t.id !== id)
    })),
    getMonthTransactions: () => {
      const now = new Date()
      return get().transactions.filter(t => {
        const d = new Date(t.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
    },
    getTotalSpent: () => get().getMonthTransactions().filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    getTotalIncome: () => get().getMonthTransactions().filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
    getCategoryBreakdown: () => {
      const map = {}
      get().getMonthTransactions().filter(t => t.type === 'expense').forEach(t => {
        map[t.category] = (map[t.category] || 0) + Number(t.amount)
      })
      return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    }
  }),
  { name: 'finora-transactions' }
))

export const useMarketStore = create((set, get) => ({
  data: null, lastFetched: null,
  setData: (data) => set({ data, lastFetched: Date.now() }),
  isStale: () => !get().lastFetched || Date.now() - get().lastFetched > 5 * 60 * 1000 // 5 min for market data
}))

export const useChatStore = create((set) => ({
  messages: [], loading: false,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setLoading: (v) => set({ loading: v }),
  clearChat: () => set({ messages: [] })
}))

export const useProfileStore = create(persist(
  (set) => ({
    city: '',
    budget: 0,  // NO default — user must set this
    cityGoldPremium: 40,
    lifeStage: '',
    goal: '',
    profession: '',
    phone: '',
    whatsapp: '',
    name: '',
    customCategories: [],
    setProfile: (data) => set((s) => ({ ...s, ...data })),
    addCustomCategory: (cat) => set((s) => ({
      customCategories: [...s.customCategories.filter(c => c !== cat), cat]
    })),
    removeCustomCategory: (cat) => set((s) => ({
      customCategories: s.customCategories.filter(c => c !== cat)
    }))
  }),
  { name: 'finora-profile' }
))
