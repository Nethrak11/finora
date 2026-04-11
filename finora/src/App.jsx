import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, useThemeStore, useTransactionStore } from './store'
import { supabase, fetchTransactions } from './lib/supabase'
import Sidebar from './components/Sidebar'
import { SplashScreen, OnboardingScreen } from './pages/Splash'
import LoginScreen from './pages/Login'
import OnboardingQuestions from './pages/OnboardingQuestions'
import NotificationPrompt from './pages/NotificationPrompt'
import Dashboard from './pages/Dashboard'
import AIChat from './pages/AIChat'
import Analytics from './pages/Analytics'
import AddTransaction from './pages/AddTransaction'
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

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', theme.accent)
  }, [theme])

  useEffect(() => {
    // Restore session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setSession(session)
        restoreData(session.user.id)
      }
    })

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setSession(session)
        restoreData(session.user.id)
      } else {
        setUser(null)
        setSession(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function restoreData(userId) {
    // Pull all transactions from Supabase on login — data always restored
    const { data } = await fetchTransactions(userId)
    if (data && data.length > 0) {
      setTransactions(data)
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
        <Route path="/profile" element={<ProtectedRoute><AppShell><Profile /></AppShell></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AppShell><Settings /></AppShell></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><AppShell><AboutUs /></AppShell></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
