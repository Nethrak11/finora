import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store'
import { requestPushPermission, registerServiceWorker } from '../lib/notifications'

export default function NotificationPrompt() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()

  const allow = async () => {
    await registerServiceWorker()
    await requestPushPermission()
    navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100dvh', background: theme.bg, display: 'flex',
      flexDirection: 'column', padding: 32 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <div style={{ width: 88, height: 88, background: theme.accent, borderRadius: 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
            <path d="M23 7C16.4 7 11 12.4 11 19v9l-3 5h30l-3-5v-9C35 12.4 29.6 7 23 7z" fill="white"/>
            <path d="M20 39a3 3 0 006 0" fill="white"/>
            <circle cx="33" cy="11" r="7" fill="#ef4444"/>
            <text x="33" y="15" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">3</text>
          </svg>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: theme.text, marginBottom: 12, letterSpacing: -0.5 }}>
            Stay on top of your money
          </h2>
          <p style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 1.7, margin: 0 }}>
            Finora will send you smart alerts so you never miss what matters:
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '💡', text: 'Daily AI insight — personalised to your spending' },
            { icon: '⚠️', text: 'Budget warning when you hit 80% of your limit' },
            { icon: '📈', text: 'Market alerts when Nifty or gold moves sharply' },
            { icon: '✅', text: 'Transaction confirmation after each entry' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12,
              background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '12px 14px' }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: theme.text, fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ paddingTop: 24 }}>
        <button onClick={allow} style={{
          width: '100%', padding: 16, background: theme.accent, color: '#fff',
          border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: 'pointer', marginBottom: 12
        }}>
          Allow notifications
        </button>
        <button onClick={() => navigate('/dashboard')} style={{
          width: '100%', padding: 13, background: 'transparent', color: theme.textMuted,
          border: 'none', fontSize: 14, cursor: 'pointer', fontWeight: 500
        }}>
          Maybe later
        </button>
      </div>
    </div>
  )
}
