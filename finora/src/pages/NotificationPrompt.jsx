import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store'

export default function NotificationPrompt() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()

  const allow = async () => {
    try {
      await Notification.requestPermission()
    } catch {}
    navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100dvh', background: theme.bg, display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: 80, height: 80, background: theme.accent, borderRadius: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M20 6C13.4 6 8 11.4 8 18v8l-2 4h28l-2-4v-8C32 11.4 26.6 6 20 6z" fill="white"/>
          <path d="M17 34a3 3 0 006 0" fill="white"/>
          <circle cx="28" cy="10" r="6" fill="#ef4444"/>
        </svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: theme.text, textAlign: 'center', marginBottom: 12 }}>
        Stay on top of your money
      </h2>
      <p style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 1.65, marginBottom: 32 }}>
        Get daily AI insights, budget warnings, and market alerts — so you never miss what matters financially.
      </p>
      <button onClick={allow} style={{
        width: '100%', padding: 15, background: theme.accent, color: '#fff',
        border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', marginBottom: 12
      }}>
        Allow notifications
      </button>
      <button onClick={() => navigate('/dashboard')} style={{
        background: 'none', border: 'none', color: theme.textMuted, fontSize: 13, cursor: 'pointer', padding: 10
      }}>
        Not now
      </button>
    </div>
  )
}
