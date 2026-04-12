import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore } from '../store'
import { THEMES } from '../themes'
import { requestPushPermission, registerServiceWorker } from '../lib/notifications'

const themeOrder = ['soft-cream', 'midnight-pro', 'forest', 'arctic-white', 'golden-hour']
const themePreview = {
  'soft-cream':   { bg: '#1a1007', accent: '#d97706', label: 'Soft Cream' },
  'midnight-pro': { bg: '#0f0f13', accent: '#8b5cf6', label: 'Midnight Pro' },
  'forest':       { bg: '#14532d', accent: '#16a34a', label: 'Forest' },
  'arctic-white': { bg: '#0f172a', accent: '#0ea5e9', label: 'Arctic White' },
  'golden-hour':  { bg: '#713f12', accent: '#eab308', label: 'Golden Hour' },
}

const PRIVACY_CONTENT = `FINORA PRIVACY POLICY — Last updated April 2025

1. DATA WE COLLECT
We collect your email, name, city, and transaction data you enter manually. We do not collect bank details, UPI passwords, or any sensitive financial credentials.

2. HOW WE USE YOUR DATA
Your data powers Finora's features — AI insights, spending analytics, and market summaries. We use Supabase (PostgreSQL) with Row Level Security. Your data belongs to you.

3. WE NEVER SELL YOUR DATA
Finora does not sell, share, or rent your personal data to any third party, advertiser, or data broker. Ever.

4. AI PROCESSING
When you use AI chat, your spending summary is sent to Groq/Gemini APIs to generate responses. No personally identifiable data is stored by these providers.

5. YOUR RIGHTS
Export all your data as CSV from Settings. Delete your account and all data permanently at any time.

6. CONTACT: hello@finora.in`

const TERMS_CONTENT = `FINORA TERMS OF SERVICE — Last updated April 2025

1. ACCEPTANCE
By using Finora, you agree to these terms.

2. SERVICE DESCRIPTION
Finora is a personal finance tracking tool. It is NOT a registered financial advisor. AI insights are for informational purposes only.

3. YOUR ACCOUNT
You are responsible for maintaining account confidentiality. Provide accurate information.

4. FREE SERVICE
Finora is currently free. Optional paid features may be introduced in future — existing free features remain free.

5. LIMITATION OF LIABILITY
Finora is provided as-is. We are not liable for financial decisions made based on the app's insights.

6. CONTACT: hello@finora.in`

function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: 46, height: 26, borderRadius: 13, cursor: 'pointer',
      background: on ? '#16a34a' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
      }} />
    </div>
  )
}

export default function Settings() {
  const { theme, themeKey, setTheme } = useThemeStore()
  const navigate = useNavigate()
  const [notifs, setNotifs] = useState({ ai: true, budget: true, market: false, txn: true })
  const [waFreq, setWaFreq] = useState('weekly')
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const toggle = (key) => setNotifs(n => ({ ...n, [key]: !n[key] }))

  const enablePush = async () => {
    await registerServiceWorker()
    const result = await requestPushPermission()
    if (result === 'granted') {
      setNotifs(n => ({ ...n, ai: true }))
      alert('✅ Notifications enabled!')
    } else {
      alert('Please allow notifications in your browser settings.')
    }
  }

  if (showPrivacy) return <LegalModal title="Privacy Policy" content={PRIVACY_CONTENT} onBack={() => setShowPrivacy(false)} theme={theme} />
  if (showTerms) return <LegalModal title="Terms of Service" content={TERMS_CONTENT} onBack={() => setShowTerms(false)} theme={theme} />

  return (
    <div className="screen-enter" style={{ background: theme.bg, minHeight: '100%', paddingBottom: 32 }}>
      <div style={{ background: theme.topbar, borderBottom: `1px solid ${theme.topbarBorder}`,
        padding: '12px 16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Settings</div>
      </div>

      {/* Theme hint */}
      <div style={{ background: theme.aiBg, borderLeft: `3px solid ${theme.accent}`,
        margin: '12px 12px 0', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: theme.aiText }}>
        💡 You can personalise Finora's look — choose from 5 themes below
      </div>

      <SLabel>CHOOSE YOUR THEME</SLabel>
      <div style={{ padding: '0 12px 4px', display: 'flex', gap: 12, overflowX: 'auto' }}>
        {themeOrder.map(key => {
          const p = themePreview[key]
          const active = themeKey === key
          return (
            <div key={key} onClick={() => setTheme(key)} style={{ flexShrink: 0, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: p.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 5,
                border: active ? `3px solid ${p.accent}` : '3px solid transparent',
                boxShadow: active ? `0 0 0 2px ${p.accent}40` : 'none', transition: 'all 0.15s' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: p.accent }} />
              </div>
              <div style={{ fontSize: 9, fontWeight: active ? 700 : 500,
                color: active ? theme.accent : theme.textMuted, whiteSpace: 'nowrap' }}>{p.label}</div>
              {active && <div style={{ width: 16, height: 3, background: theme.accent, borderRadius: 2, margin: '3px auto 0' }} />}
            </div>
          )
        })}
      </div>

      <SLabel>PUSH NOTIFICATIONS</SLabel>
      <div style={{ background: theme.surface, borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.border}`, margin: '0 12px' }}>
        <SRow label="Enable notifications" sub="Tap to allow from browser" theme={theme}
          right={<button onClick={enablePush} style={{ background: theme.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Enable</button>} />
        <SRow label="Daily AI insight" sub="Personalised tip every morning" theme={theme} right={<Toggle on={notifs.ai} onChange={() => toggle('ai')} />} />
        <SRow label="Budget warning" sub="Alert at 80% of monthly budget" theme={theme} right={<Toggle on={notifs.budget} onChange={() => toggle('budget')} />} />
        <SRow label="Market alerts" sub="Nifty/Gold sharp movements" theme={theme} right={<Toggle on={notifs.market} onChange={() => toggle('market')} />} />
        <SRow label="Transaction saved" sub="Confirmation after each entry" theme={theme} border={false} right={<Toggle on={notifs.txn} onChange={() => toggle('txn')} />} />
      </div>

      <SLabel>WHATSAPP DIGEST</SLabel>
      <div style={{ background: theme.surface, borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.border}`, margin: '0 12px', padding: 14 }}>
        <div style={{ fontSize: 12, color: theme.text, fontWeight: 600, marginBottom: 6 }}>🚧 Coming soon</div>
        <div style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.5 }}>
          WhatsApp weekly summaries are being set up. We'll notify you when it's live. You'll be able to choose Daily or Weekly frequency.
        </div>
      </div>

      <SLabel>DATA & PRIVACY</SLabel>
      <div style={{ background: theme.surface, borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.border}`, margin: '0 12px' }}>
        <SRow label="Export transactions" sub="Download all data as CSV" theme={theme}
          right={<button style={{ background: 'none', border: 'none', color: theme.accent, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Export</button>} />
        <SRow label="Privacy Policy" theme={theme} right={<span style={{ color: theme.accent, fontSize: 14, cursor: 'pointer' }} onClick={() => setShowPrivacy(true)}>View ›</span>} />
        <SRow label="Terms of Service" theme={theme} right={<span style={{ color: theme.accent, fontSize: 14, cursor: 'pointer' }} onClick={() => setShowTerms(true)}>View ›</span>} />
        <SRow label="Delete my account" sub="Permanently remove all data" theme={theme} border={false}
          right={<span style={{ color: '#dc2626', fontSize: 14, cursor: 'pointer' }} onClick={() => setShowDeleteConfirm(true)}>Delete ›</span>} />
      </div>

      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: theme.surface, borderRadius: 20, padding: 24, maxWidth: 320, width: '100%' }}>
            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: theme.text, textAlign: 'center', margin: '0 0 10px' }}>Delete account?</h3>
            <p style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
              This permanently deletes all your transactions, settings, and data. This cannot be undone.
            </p>
            <button style={{ width: '100%', padding: 13, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>
              Yes, delete everything
            </button>
            <button onClick={() => setShowDeleteConfirm(false)} style={{ width: '100%', padding: 13, background: 'transparent', color: theme.textMuted, border: 'none', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <SLabel>APP INFO</SLabel>
      <div style={{ background: theme.surface, borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.border}`, margin: '0 12px' }}>
        <SRow label="Version" theme={theme} right={<span style={{ fontSize: 12, color: theme.textMuted }}>1.0.0 Beta</span>} />
        <SRow label="Built by" theme={theme} right={<span style={{ fontSize: 12, color: theme.textMuted }}>Nethra K</span>} border={false} />
      </div>
    </div>
  )
}

function SLabel({ children }) {
  const { theme } = useThemeStore()
  return <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, letterSpacing: '.07em', padding: '14px 16px 6px' }}>{children}</div>
}

function SRow({ label, sub, right, border = true, theme }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 16px', borderBottom: border ? `1px solid ${theme.border}` : 'none', background: theme.surface }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: theme.text }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  )
}

function LegalModal({ title, content, onBack, theme }) {
  return (
    <div style={{ minHeight: '100dvh', background: theme.bg }}>
      <div style={{ background: theme.sidebar, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', padding: 0, lineHeight: 1 }}>‹</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{title}</span>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 20 }}>
          <p style={{ fontSize: 12, color: theme.text, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>{content}</p>
        </div>
      </div>
    </div>
  )
}
