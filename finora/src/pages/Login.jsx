import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore, useProfileStore } from '../store'
import { signInWithGoogle, signInWithEmail, signUpWithEmail, supabase, fetchUserProfile } from '../lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('detect')
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { setUser, setSession, user } = useAuthStore()
  const { setProfile, setNewUser } = useProfileStore()

  // If already logged in redirect
  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  // Listen for Google OAuth callback
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        setUser(session.user)
        setSession(session)
        // Check if new user
        const { data: profile } = await fetchUserProfile(session.user.id)
        const isNew = !profile || (!profile.city && !profile.life_stage)
        setNewUser(isNew)
        if (isNew) {
          // Pre-fill name from Google
          if (session.user.user_metadata?.full_name) {
            setProfile({ name: session.user.user_metadata.full_name })
          }
          navigate('/onboarding-questions')
        } else {
          navigate('/dashboard')
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    const { error } = await signInWithGoogle()
    if (error) {
      setError('Google login failed. Make sure Google is enabled in Supabase Auth settings.')
      setLoading(false)
    }
    // Success handled by onAuthStateChange above
  }

  const handleContinue = async () => {
    if (!email || !email.includes('@')) return setError('Enter a valid email')
    setMode('login') // Default to login, switches to signup if not found
    setError('')
  }

  const handleSubmit = async () => {
    if (!password) return setError('Enter your password')
    if (mode === 'signup') {
      if (!name) return setError('Enter your name')
      if (!agreed) return setError('Please agree to Terms and Privacy Policy')
    }
    setLoading(true)
    setError('')

    if (mode === 'signup') {
      const { data, error: err } = await signUpWithEmail(email, password, name)
      if (err) {
        if (err.message.toLowerCase().includes('already')) {
          setMode('login')
          setError('Account exists — signing you in')
        } else {
          setError(err.message)
        }
        setLoading(false)
        return
      }
      if (data?.user) {
        setUser(data.user)
        setSession(data.session)
        setNewUser(true)
        setProfile({ name })
        navigate('/onboarding-questions')
      }
    } else {
      const { data, error: err } = await signInWithEmail(email, password)
      if (err) {
        if (err.message.toLowerCase().includes('invalid') || err.message.toLowerCase().includes('not found')) {
          setMode('signup')
          setError("No account found with this email — let's create one")
        } else {
          setError(err.message)
        }
        setLoading(false)
        return
      }
      if (data?.user) {
        setUser(data.user)
        setSession(data.session)
        const { data: profile } = await fetchUserProfile(data.user.id)
        const isNew = !profile || (!profile.city && !profile.life_stage)
        setNewUser(isNew)
        navigate(isNew ? '/onboarding-questions' : '/dashboard')
      }
    }
    setLoading(false)
  }

  const inp = {
    width: '100%', padding: '13px 16px', background: theme.inputBg,
    border: `1.5px solid ${theme.border}`, borderRadius: 12, fontSize: 14,
    color: theme.text, marginBottom: 12, outline: 'none',
    WebkitAppearance: 'none', boxSizing: 'border-box', display: 'block'
  }

  if (showPrivacy) return <Legal title="Privacy Policy" onBack={() => setShowPrivacy(false)} theme={theme} type="privacy" />
  if (showTerms) return <Legal title="Terms of Service" onBack={() => setShowTerms(false)} theme={theme} type="terms" />

  return (
    <div style={{ minHeight: '100dvh', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: theme.sidebar, padding: '52px 24px 32px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: theme.accent, borderRadius: 18,
          margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="42" height="42" viewBox="0 0 62 62" fill="none">
            <rect x="6" y="40" width="12" height="16" rx="2.5" fill="rgba(255,255,255,0.35)"/>
            <rect x="22" y="30" width="12" height="26" rx="2.5" fill="rgba(255,255,255,0.6)"/>
            <rect x="38" y="18" width="12" height="38" rx="2.5" fill="rgba(255,255,255,0.9)"/>
            <line x1="8" y1="38" x2="46" y2="14" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
            <polyline points="38,11 49,12 48,22" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: -1 }}>Finora</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0, fontStyle: 'italic' }}>
          Because your money deserves intelligence
        </p>
      </div>

      <div style={{ flex: 1, padding: '28px 20px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text, margin: '0 0 20px' }}>
          {mode === 'signup' ? 'Create your account' : mode === 'login' ? 'Welcome back' : 'Get started'}
        </h2>

        <input placeholder="Email address" type="email" value={email}
          onChange={e => { setEmail(e.target.value); if (mode !== 'detect') setMode('detect') }}
          style={inp} />

        {mode !== 'detect' && (
          <>
            {mode === 'signup' && (
              <input placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} style={inp} />
            )}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input placeholder="Password" type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                style={{ ...inp, marginBottom: 0, paddingRight: 56 }} />
              <button onClick={() => setShowPass(v => !v)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: theme.textMuted, fontSize: 12, fontWeight: 700
              }}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
            {mode === 'signup' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                <div onClick={() => setAgreed(v => !v)} style={{
                  width: 22, height: 22, borderRadius: 6,
                  border: `2px solid ${agreed ? theme.accent : theme.border}`,
                  background: agreed ? theme.accent : 'transparent',
                  flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer'
                }}>
                  {agreed && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>}
                </div>
                <p style={{ fontSize: 12, color: theme.textSecondary, margin: 0, lineHeight: 1.6 }}>
                  I agree to Finora's{' '}
                  <span onClick={() => setShowTerms(true)} style={{ color: theme.accent, fontWeight: 700, cursor: 'pointer' }}>Terms</span>
                  {' '}and{' '}
                  <span onClick={() => setShowPrivacy(true)} style={{ color: theme.accent, fontWeight: 700, cursor: 'pointer' }}>Privacy Policy</span>
                </p>
              </div>
            )}
          </>
        )}

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10,
            padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#dc2626' }}>
            {error}
          </div>
        )}

        <button onClick={mode === 'detect' ? handleContinue : handleSubmit}
          disabled={loading}
          style={{ width: '100%', padding: 15, background: theme.accent, color: '#fff', border: 'none',
            borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, marginBottom: 12 }}>
          {loading ? 'Please wait...' : mode === 'detect' ? 'Continue →' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>

        {mode !== 'detect' && (
          <p style={{ textAlign: 'center', fontSize: 13, color: theme.textSecondary, marginBottom: 14 }}>
            {mode === 'login' ? "No account? " : 'Already have one? '}
            <span onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
              style={{ color: theme.accent, fontWeight: 700, cursor: 'pointer' }}>
              {mode === 'login' ? 'Create one' : 'Sign in instead'}
            </span>
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: theme.border }} />
          <span style={{ fontSize: 12, color: theme.textMuted }}>or</span>
          <div style={{ flex: 1, height: 1, background: theme.border }} />
        </div>

        <button onClick={handleGoogle} disabled={loading} style={{
          width: '100%', padding: 14, background: '#fff', color: '#1a1a1a',
          border: '1.5px solid #e0e0e0', borderRadius: 14, fontSize: 14, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          opacity: loading ? 0.7 : 1
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2a10 10 0 00-.16-1.79H9v3.38h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92a8.78 8.78 0 002.68-6.57z" fill="#4285F4"/>
            <path d="M9 18a8.59 8.59 0 005.96-2.18l-2.91-2.26a5.43 5.43 0 01-8.09-2.85H.96v2.33A9 9 0 009 18z" fill="#34A853"/>
            <path d="M3.96 10.71a5.41 5.41 0 010-3.42V4.96H.96a9 9 0 000 8.08l3-2.33z" fill="#FBBC05"/>
            <path d="M9 3.58a4.86 4.86 0 013.44 1.35L14.55 2.8A8.65 8.65 0 009 0 9 9 0 00.96 4.96l3 2.33A5.36 5.36 0 019 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: theme.textMuted, marginTop: 20, lineHeight: 1.5 }}>
          By continuing you agree to our{' '}
          <span onClick={() => setShowTerms(true)} style={{ color: theme.accent, cursor: 'pointer' }}>Terms</span>
          {' '}and{' '}
          <span onClick={() => setShowPrivacy(true)} style={{ color: theme.accent, cursor: 'pointer' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}

function Legal({ title, onBack, theme, type }) {
  const privacy = `FINORA PRIVACY POLICY — April 2025\n\n1. DATA WE COLLECT\nWe collect your email, name, city, and transaction data you enter. We do not collect bank credentials.\n\n2. HOW WE USE YOUR DATA\nYour data powers AI insights, analytics, and summaries. Stored in Supabase with Row Level Security.\n\n3. WE NEVER SELL YOUR DATA\nFinora does not sell, share, or rent your data to any third party. Ever.\n\n4. YOUR RIGHTS\nExport your data as CSV or delete your account anytime from Settings.\n\n5. CONTACT: hello@finora.in`
  const terms = `FINORA TERMS OF SERVICE — April 2025\n\n1. ACCEPTANCE\nBy using Finora you agree to these terms.\n\n2. SERVICE\nFinora is a personal finance tracker. It is NOT a registered financial advisor. AI insights are informational only.\n\n3. FREE SERVICE\nFinora is free. Optional paid features may come later — basics stay free.\n\n4. LIMITATIONS\nWe are not liable for financial decisions made using the app.\n\n5. CONTACT: hello@finora.in`

  return (
    <div style={{ minHeight: '100dvh', background: theme.bg }}>
      <div style={{ background: theme.sidebar, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', padding: 0 }}>‹</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{title}</span>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 20 }}>
          <p style={{ fontSize: 12, color: theme.text, lineHeight: 1.9, margin: 0, whiteSpace: 'pre-line' }}>
            {type === 'privacy' ? privacy : terms}
          </p>
        </div>
      </div>
    </div>
  )
}
