import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore } from '../store'
import { FinoraLogoMark } from '../components/FinoraLogo'

const slides = [
  { title: 'Track every rupee', sub: 'Scan bills, upload screenshots, or add manually. AI categorises everything for you.', emoji: '📊' },
  { title: 'AI that knows your money', sub: 'Ask anything — "Am I saving enough?" Your AI answers using your real spending data.', emoji: '🤖' },
  { title: 'Weekly digest coming soon', sub: 'Smart spending summaries delivered to you automatically. No effort needed.', emoji: '📱' },
]

export function SplashScreen() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) { navigate('/dashboard'); return }
    const t = setTimeout(() => navigate('/onboarding'), 2000)
    return () => clearTimeout(t)
  }, [user])

  return (
    <div style={{ height: '100dvh', background: theme.sidebar, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <div style={{ animation: 'pulse 2s ease-in-out infinite' }}>
        <FinoraLogoMark size={90} bg={true} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: -1, margin: 0 }}>Finora</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '6px 0 0', fontStyle: 'italic' }}>
          Because your money deserves intelligence
        </p>
      </div>
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }`}</style>
    </div>
  )
}

export function OnboardingScreen() {
  const [slide, setSlide] = useState(0)
  const navigate = useNavigate()
  const { theme } = useThemeStore()

  return (
    <div style={{ height: '100dvh', background: theme.sidebar, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 24 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {slides.map((_, i) => (
            <div key={i} style={{ height: 4, borderRadius: 2, width: i === slide ? 24 : 8,
              background: i === slide ? theme.accent : 'rgba(255,255,255,0.25)', transition: 'all 0.3s' }} />
          ))}
        </div>
        <div style={{ fontSize: 52 }}>{slides[slide].emoji}</div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 12px', letterSpacing: -0.5 }}>
            {slides[slide].title}
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: 0 }}>
            {slides[slide].sub}
          </p>
        </div>
      </div>
      <div style={{ padding: '0 24px 40px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => slide < slides.length - 1 ? setSlide(s => s + 1) : navigate('/login')}
          style={{ padding: 15, background: theme.accent, color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          {slide < slides.length - 1 ? 'Next' : 'Get started'}
        </button>
        <button onClick={() => navigate('/login')} style={{ padding: 12, background: 'transparent', color: 'rgba(255,255,255,0.4)', border: 'none', fontSize: 13, cursor: 'pointer' }}>
          Skip
        </button>
      </div>
    </div>
  )
}
