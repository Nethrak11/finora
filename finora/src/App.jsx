import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
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
  const { setUser, setSession, user } = useAuthStore()
  const { theme } = useThemeStore()
  const { setTransactions } = useTransactionStore()
  const { setProfile, setNewUser, isNewUser } = useProfileStore()

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', theme.accent)
    registerServiceWorker()
  }, [theme])

  useEffect(() => {
    // Restore session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setSession(session)
        restoreData(session.user.id)
      }
    })

    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        setSession(session)
        await restoreData(session.user.id)
      } else {
        setUser(null)
        setSession(null)
      }
    })

    // Cross-device sync: refetch when user returns to tab
    const handleFocus = () => {
      if (user?.id) restoreData(user.id)
    }
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && user?.id) restoreData(user.id)
    })

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  async function restoreData(userId) {
    // Pull latest from Supabase — ensures cross-device sync
    const { data: txns } = await fetchTransactions(userId)
    if (txns?.length) setTransactions(txns)

    const { data: profile } = await fetchUserProfile(userId)
    if (profile) {
      const isNew = !profile.city && !profile.life_stage && !profile.goal
      setNewUser(isNew)
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
    } else {
      // No profile in DB yet = new user
      setNewUser(true)
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
