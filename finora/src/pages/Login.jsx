import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore } from '../store'
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../lib/supabase'

export default function LoginScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { setUser, setSession } = useAuthStore()

  const handleGoogle = async () => {
    if (mode === 'signup' && !agreed) return setError('Please agree to the Terms and Privacy Policy first')
    setLoading(true)
    setError('')
    const { error } = await signInWithGoogle()
    if (error) setError('Google login not configured yet. Please use email login.')
    setLoading(false)
  }

  const handleEmail = async () => {
    if (!email || !password) return setError('Please fill all fields')
    if (mode === 'signup' && !name) return setError('Please enter your name')
    if (mode === 'signup' && !agreed) return setError('Please agree to the Terms and Privacy Policy')
    setLoading(true)
    setError('')
    const fn = mode === 'login' ? signInWithEmail : signUpWithEmail
    const { data, error: err } = await fn(email, password, name)
    if (err) { setError(err.message); setLoading(false); return }
    if (data?.user) {
      setUser(data.user)
      setSession(data.session)
      navigate('/onboarding-questions')
    }
    setLoading(false)
  }

  if (showPrivacy) return <LegalPage title="Privacy Policy" onBack={() => setShowPrivacy(false)} theme={theme} content={privacyContent} />
  if (showTerms) return <LegalPage title="Terms of Service" onBack={() => setShowTerms(false)} theme={theme} content={termsContent} />

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
        <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: -1 }}>Finora</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, fontStyle: 'italic' }}>
          Because your money deserves intelligence
        </p>
      </div>

      <div style={{ flex: 1, padding: '24px 20px' }}>
        <div style={{ display: 'flex', background: theme.inputBg, borderRadius: 14, padding: 4,
          border: `1px solid ${theme.border}`, marginBottom: 24 }}>
          {['login','signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '10px 0', borderRadius: 11, border: 'none',
              background: mode === m ? theme.accent : 'transparent',
              color: mode === m ? '#fff' : theme.textSecondary,
              fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s'
            }}>
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {mode === 'signup' && (
          <input placeholder="Your full name" value={name} onChange={e => setName(e.target.value)}
            style={inputStyle(theme)} />
        )}
        <input placeholder="Email address" type="email" value={email}
          onChange={e => setEmail(e.target.value)} style={inputStyle(theme)} />
        <input placeholder="Password" type="password" value={password}
          onChange={e => setPassword(e.target.value)} style={inputStyle(theme)} />

        {mode === 'signup' && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
            <div onClick={() => setAgreed(!agreed)} style={{
              width: 20, height: 20, borderRadius: 6, border: `2px solid ${agreed ? theme.accent : theme.border}`,
              background: agreed ? theme.accent : 'transparent', flexShrink: 0, marginTop: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              {agreed && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>}
            </div>
            <p style={{ fontSize: 12, color: theme.textSecondary, margin: 0, lineHeight: 1.6 }}>
              I agree to Finora's{' '}
              <span onClick={() => setShowTerms(true)} style={{ color: theme.accent, fontWeight: 700, cursor: 'pointer' }}>Terms of Service</span>
              {' '}and{' '}
              <span onClick={() => setShowPrivacy(true)} style={{ color: theme.accent, fontWeight: 700, cursor: 'pointer' }}>Privacy Policy</span>
            </p>
          </div>
        )}

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10,
            padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#dc2626' }}>
            {error}
          </div>
        )}

        <button onClick={handleEmail} disabled={loading} style={{
          width: '100%', padding: 15, background: theme.accent, color: '#fff', border: 'none',
          borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1, marginBottom: 12
        }}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: theme.border }} />
          <span style={{ fontSize: 12, color: theme.textMuted }}>or</span>
          <div style={{ flex: 1, height: 1, background: theme.border }} />
        </div>

        <button onClick={handleGoogle} style={{
          width: '100%', padding: 14, background: '#fff', color: '#1a1a1a',
          border: '1.5px solid #e0e0e0', borderRadius: 14, fontSize: 14, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2a10 10 0 00-.16-1.79H9v3.38h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92a8.78 8.78 0 002.68-6.57z" fill="#4285F4"/>
            <path d="M9 18a8.59 8.59 0 005.96-2.18l-2.91-2.26a5.43 5.43 0 01-8.09-2.85H.96v2.33A9 9 0 009 18z" fill="#34A853"/>
            <path d="M3.96 10.71a5.41 5.41 0 010-3.42V4.96H.96a9 9 0 000 8.08l3-2.33z" fill="#FBBC05"/>
            <path d="M9 3.58a4.86 4.86 0 013.44 1.35L14.55 2.8A8.65 8.65 0 009 0 9 9 0 00.96 4.96l3 2.33A5.36 5.36 0 019 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {mode === 'login' && (
          <p style={{ textAlign: 'center', fontSize: 12, color: theme.textMuted, marginTop: 20 }}>
            By signing in you agree to our{' '}
            <span onClick={() => setShowTerms(true)} style={{ color: theme.accent, cursor: 'pointer', fontWeight: 600 }}>Terms</span>
            {' '}and{' '}
            <span onClick={() => setShowPrivacy(true)} style={{ color: theme.accent, cursor: 'pointer', fontWeight: 600 }}>Privacy Policy</span>
          </p>
        )}
      </div>
    </div>
  )
}

function inputStyle(theme) {
  return {
    width: '100%', padding: '13px 16px', background: theme.inputBg,
    border: `1.5px solid ${theme.border}`, borderRadius: 12, fontSize: 14,
    color: theme.text, marginBottom: 14, outline: 'none', display: 'block',
    WebkitAppearance: 'none', boxSizing: 'border-box'
  }
}

function LegalPage({ title, content, onBack, theme }) {
  return (
    <div style={{ minHeight: '100dvh', background: theme.bg }}>
      <div style={{ background: theme.sidebar, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', padding: 0 }}>‹</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{title}</span>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 20 }}>
          <p style={{ fontSize: 12, color: theme.text, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>{content}</p>
        </div>
      </div>
    </div>
  )
}

const privacyContent = `Last updated: April 2025

FINORA PRIVACY POLICY

1. DATA WE COLLECT
We collect your email, name, and transaction data you enter manually. We do not collect bank details, UPI passwords, or any sensitive financial credentials.

2. HOW WE USE YOUR DATA
Your data is used solely to provide Finora's features — AI insights, spending analytics, and WhatsApp summaries. We use Supabase (PostgreSQL) with Row Level Security to store your data.

3. WE NEVER SELL YOUR DATA
Finora does not sell, share, or rent your personal data to any third party, advertiser, or data broker. Ever.

4. AI PROCESSING
When you use the AI chat, your spending summary is sent to Groq/Gemini APIs to generate responses. No personally identifiable data is stored by these providers beyond the request.

5. DATA SECURITY
All data is encrypted in transit (HTTPS) and at rest. Row Level Security ensures no user can access another user's data.

6. YOUR RIGHTS
You can export all your data as CSV from Settings. You can permanently delete your account and all associated data at any time from Settings.

7. CONTACT
For privacy concerns: hello@finora.in`

const termsContent = `Last updated: April 2025

FINORA TERMS OF SERVICE

1. ACCEPTANCE
By using Finora, you agree to these terms. If you disagree, please do not use the app.

2. USE OF SERVICE
Finora is a personal finance tracking tool. It is not a registered financial advisor. AI insights are for informational purposes only — not professional financial advice. Consult a certified financial advisor for major investment decisions.

3. YOUR ACCOUNT
You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information.

4. FREE SERVICE
Finora is currently free to use. We may introduce optional paid features in the future — existing free features will remain free.

5. PROHIBITED USE
You may not use Finora to violate any laws, infringe on others' rights, or attempt to breach our security systems.

6. LIMITATION OF LIABILITY
Finora is provided "as is". We are not liable for any financial decisions made based on the app's insights or data.

7. CHANGES TO TERMS
We may update these terms. Continued use after changes means acceptance of the new terms.

8. CONTACT
hello@finora.in`
