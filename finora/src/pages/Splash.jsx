import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore } from '../store'

const Logo = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 62 62" fill="none">
    <rect x="6" y="40" width="12" height="16" rx="2.5" fill="rgba(255,255,255,0.35)"/>
    <rect x="22" y="30" width="12" height="26" rx="2.5" fill="rgba(255,255,255,0.6)"/>
    <rect x="38" y="18" width="12" height="38" rx="2.5" fill="rgba(255,255,255,0.9)"/>
    <line x1="8" y1="38" x2="46" y2="14" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
    <polyline points="38,11 49,12 48,22" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const slides = [
  {
    title: 'Track every rupee',
    sub: 'Scan bills, upload screenshots, or add manually. AI categorises everything for you.',
    icon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        <rect x="8" y="16" width="56" height="44" rx="8" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
        <rect x="16" y="44" width="10" height="10" rx="2" fill="rgba(255,255,255,0.5)"/>
        <rect x="30" y="36" width="10" height="18" rx="2" fill="rgba(255,255,255,0.7)"/>
        <rect x="44" y="28" width="10" height="26" rx="2" fill="rgba(255,255,255,0.9)"/>
        <path d="M16 38 L34 26 L50 20" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    title: 'AI that knows your money',
    sub: 'Ask anything — "Am I saving enough?" or "Should I invest in gold?" Your AI answers using your real data.',
    icon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        <circle cx="36" cy="36" r="28" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
        <circle cx="36" cy="36" r="18" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
        <path d="M24 36 L32 44 L48 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    )
  },
  {
    title: 'Weekly digest on WhatsApp',
    sub: 'Get a smart summary of your spending sent to WhatsApp every week — or daily if you prefer.',
    icon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        <rect x="12" y="12" width="48" height="48" rx="12" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
        <path d="M20 32 Q20 24 28 24 L44 24 Q52 24 52 32 L52 40 Q52 48 44 48 L28 50 L20 56 L20 40 Q20 40 20 40 L20 32Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
        <path d="M28 36 L32 40 L44 28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    )
  }
]

export function SplashScreen() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) { navigate('/dashboard'); return }
    const t = setTimeout(() => navigate('/onboarding'), 2200)
    return () => clearTimeout(t)
  }, [user])

  return (
    <div style={{
      height: '100dvh', background: theme.sidebar,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20
    }}>
      <div style={{
        width: 80, height: 80, background: theme.accent, borderRadius: 22,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        <Logo size={52} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: -1, margin: 0 }}>Finora</h1>
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

  const next = () => slide < slides.length - 1 ? setSlide(s => s + 1) : navigate('/login')

  return (
    <div style={{
      height: '100dvh', background: theme.sidebar,
      display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 24 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {slides.map((_, i) => (
            <div key={i} style={{
              height: 4, borderRadius: 2,
              width: i === slide ? 24 : 8,
              background: i === slide ? theme.accent : 'rgba(255,255,255,0.25)',
              transition: 'all 0.3s'
            }} />
          ))}
        </div>
        <div style={{ animation: 'slideIn 0.3s ease' }}>
          {slides[slide].icon}
        </div>
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
        <button onClick={next} style={{
          padding: 15, background: theme.accent, color: '#fff',
          border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer'
        }}>
          {slide < slides.length - 1 ? 'Next' : 'Get started'}
        </button>
        <button onClick={() => navigate('/login')} style={{
          padding: 12, background: 'transparent', color: 'rgba(255,255,255,0.4)',
          border: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 500
        }}>
          Skip
        </button>
      </div>
      <style>{`@keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  )
}
