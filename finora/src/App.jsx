import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, useThemeStore, useTransactionStore, useProfileStore } from './store'
import { supabase, fetchTransactions, fetchUserProfile } from './lib/supabase'
import { registerServiceWorker } from './lib/notifications'
import Sidebar from './components/Sidebar'
import { SplashScreen, OnboardingScreen } from './pages/Splash'
import LoginScreen from './pages/Login'
import OnboardingQuestions from './pages/OnboardingQuestions'
import NotificationPrompt from './pages/NotificationPrompt'
import Dashboard from './pages/Dashboard'
import AIChat from './pages/AIChat'
import Analytics from './pages/Analytics'
import AddTransaction from './pages/AddTransaction'
import TransactionHistory from './pages/TransactionHistory'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import AboutUs from './pages/AboutUs'

function AppShell({ children }) {
  const { theme } = useThemeStore()
  return (
    <div className="app-shell" style={{ background: theme.bg }}>
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { setUser, setSession } = useAuthStore()
  const { theme } = useThemeStore()
  const { setTransactions } = useTransactionStore()
  const { setProfile } = useProfileStore()

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', theme.accent)
    registerServiceWorker()
  }, [theme])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); setSession(session); restoreData(session.user.id) }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) { setUser(session.user); setSession(session); restoreData(session.user.id) }
      else { setUser(null); setSession(null) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function restoreData(userId) {
    const { data: txns } = await fetchTransactions(userId)
    if (txns?.length) setTransactions(txns)
    const { data: profile } = await fetchUserProfile(userId)
    if (profile) {
      setProfile({
        city: profile.city || '',
        budget: profile.monthly_budget || 0,
        cityGoldPremium: profile.city_gold_premium || 40,
        lifeStage: profile.life_stage || '',
        goal: profile.goal || '',
        profession: profile.profession || '',
        phone: profile.phone || '',
        whatsapp: profile.whatsapp_number || '',
        name: profile.name || '',
      })
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/onboarding-questions" element={<OnboardingQuestions />} />
        <Route path="/notifications" element={<NotificationPrompt />} />
        <Route path="/dashboard" element={<ProtectedRoute><AppShell><Dashboard /></AppShell></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><AppShell><AIChat /></AppShell></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AppShell><Analytics /></AppShell></ProtectedRoute>} />
        <Route path="/add" element={<ProtectedRoute><AppShell><AddTransaction /></AppShell></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><AppShell><TransactionHistory /></AppShell></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppShell><Profile /></AppShell></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AppShell><Settings /></AppShell></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><AppShell><AboutUs /></AppShell></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
