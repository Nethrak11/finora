import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { THEMES, DEFAULT_THEME } from '../themes'

export const useThemeStore = create(persist(
  (set, get) => ({
    themeKey: DEFAULT_THEME,
    theme: THEMES[DEFAULT_THEME],
    setTheme: (key) => {
      if (THEMES[key]) set({ themeKey: key, theme: THEMES[key] })
    }
  }),
  { name: 'finora-theme' }
))

export const useAuthStore = create(persist(
  (set) => ({
    user: null,
    session: null,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    logout: () => set({ user: null, session: null })
  }),
  { name: 'finora-auth' }
))

export const useTransactionStore = create(persist(
  (set, get) => ({
    transactions: [],
    loading: false,
    setTransactions: (txns) => set({ transactions: txns }),
    addTransaction: (txn) => set((s) => ({
      transactions: [{ ...txn, id: Date.now().toString(), created_at: new Date().toISOString() }, ...s.transactions]
    })),
    getMonthTransactions: () => {
      const now = new Date()
      return get().transactions.filter(t => {
        const d = new Date(t.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
    },
    getTotalSpent: () => {
      const month = get().getMonthTransactions()
      return month.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    },
    getTotalIncome: () => {
      const month = get().getMonthTransactions()
      return month.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    },
    getCategoryBreakdown: () => {
      const month = get().getMonthTransactions().filter(t => t.type === 'expense')
      const map = {}
      month.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount })
      return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    }
  }),
  { name: 'finora-transactions' }
))

export const useMarketStore = create((set, get) => ({
  data: null,
  lastFetched: null,
  setData: (data) => set({ data, lastFetched: Date.now() }),
  isStale: () => {
    const { lastFetched } = get()
    return !lastFetched || Date.now() - lastFetched > 15 * 60 * 1000
  }
}))

export const useChatStore = create((set) => ({
  messages: [],
  loading: false,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setLoading: (v) => set({ loading: v }),
  clearChat: () => set({ messages: [] })
}))
