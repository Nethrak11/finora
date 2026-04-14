import { useState } from 'react'
import { useThemeStore, useTransactionStore } from '../store'
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

const PRIVACY = `FINORA PRIVACY POLICY — April 2025

1. DATA WE COLLECT
We collect your email, name, city, and transaction data you enter manually. We do not collect bank credentials or passwords.

2. HOW WE USE YOUR DATA
Your data powers AI insights, analytics, and summaries. Stored in Supabase with Row Level Security — only you can see your data.

3. WE NEVER SELL YOUR DATA
Finora does not sell, share, or rent your data to any third party. Ever.

4. AI PROCESSING
When you use AI chat, your spending summary is sent to Groq/Gemini APIs to generate responses. No personally identifiable data is stored by these providers.

5. YOUR RIGHTS
Export all your data as CSV. Delete your account and all data permanently anytime from Profile.

6. CONTACT: hello@finora.in`

const TERMS = `FINORA TERMS OF SERVICE — April 2025

1. ACCEPTANCE
By using Finora you agree to these terms.

2. SERVICE DESCRIPTION
Finora is a personal finance tracking tool. It is NOT a registered financial advisor. AI insights are informational only — not professional financial advice.

3. FREE SERVICE
Finora is currently free. Optional paid features may be introduced in future — free features remain free.

4. LIMITATION OF LIABILITY
Finora is provided as-is. We are not liable for financial decisions made using the app.

5. CONTACT: hello@finora.in`

function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: 46, height: 26, borderRadius: 13, cursor: 'pointer',
      background: on ? '#16a34a' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0
    }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

export default function Settings() {
  const { theme, themeKey, setTheme } = useThemeStore()
  const { transactions } = useTransactionStore()
  const [notifs, setNotifs] = useState({ ai: true, budget: true, market: false, txn: true })
  const [waFreq, setWaFreq] = useState('weekly')
  const [legalContent, setLegalContent] = useState(null)
  const [exportStatus, setExportStatus] = useState('idle')
  const toggle = (k) => setNotifs(n => ({ ...n, [k]: !n[k] }))

  const handleExport = () => {
    setExportStatus('exporting')
    try {
      const rows = [['Date','Type','Category','Note','Amount (INR)']]
      transactions.forEach(t => rows.push([
        t.date, t.type, t.category,
        `"${(t.note || '').replace(/"/g, '""')}"`,
        t.amount
      ]))
      const csv = rows.map(r => r.join(',')).join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `finora-transactions-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setExportStatus('done')
      setTimeout(() => setExportStatus('idle'), 2000)
    } catch (e) {
      setExportStatus('error')
      setTimeout(() => setExportStatus('idle'), 2000)
    }
  }

  const enablePush = async () => {
    await registerServiceWorker()
    const result = await requestPushPermission()
    if (result === 'granted') {
      setNotifs(n => ({ ...n, ai: true }))
      alert('Notifications enabled!')
    } else {
      alert('Please allow notifications in your browser/phone settings, then try again.')
    }
  }

  if (legalContent) return (
    <div style={{ minHeight: '100%', background: theme.bg }}>
      <div style={{ background: theme.sidebar, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setLegalContent(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>‹</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{legalContent.title}</span>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 20 }}>
          <p style={{ fontSize: 12, color: theme.text, lineHeight: 1.9, margin: 0, whiteSpace: 'pre-line' }}>{legalContent.text}</p>
        </div>
      </div>
    </div>
  )

  const SL = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, letterSpacing: '.07em', padding: '14px 16px 6px' }}>{children}</div>
  )
  const SR = ({ label, sub, right, border = true }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 16px', borderBottom: border ? `1px solid ${theme.border}` : 'none', background: theme.surface }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: theme.text }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  )

  return (
    <div className="screen-enter" style={{ background: theme.bg, minHeight: '100%', paddingBottom: 32 }}>
      <div style={{ background: theme.topbar, borderBottom: `1px solid ${theme.topbarBorder}`, padding: '12px 16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Settings</div>
      </div>

      <div style={{ background: theme.aiBg, borderLeft: `3px solid ${theme.accent}`, margin: '12px 12px 0', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: theme.aiText }}>
        Personalise Finora — choose from 5 themes below
      </div>

      <SL>CHOOSE YOUR THEME</SL>
      <div style={{ padding: '0 12px 4px', display: 'flex', gap: 12, overflowX: 'auto' }}>
        {themeOrder.map(key => {
          const p = themePreview[key]; const active = themeKey === key
          return (
            <div key={key} onClick={() => setTheme(key)} style={{ flexShrink: 0, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 5,
                border: active ? `3px solid ${p.accent}` : '3px solid transparent', transition: 'all 0.15s' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: p.accent }} />
              </div>
              <div style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? theme.accent : theme.textMuted, whiteSpace: 'nowrap' }}>{p.label}</div>
              {active && <div style={{ width: 16, height: 3, background: theme.accent, borderRadius: 2, margin: '3px auto 0' }} />}
            </div>
          )
        })}
      </div>

      <SL>PUSH NOTIFICATIONS</SL>
      <div style={{ background: theme.surface, borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.border}`, margin: '0 12px' }}>
        <SR label="Enable notifications" sub="Allow browser to send alerts" border right={
          <button onClick={enablePush} style={{ background: theme.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Enable</button>
        } />
        <SR label="Daily AI insight" sub="Personalised tip every morning" right={<Toggle on={notifs.ai} onChange={() => toggle('ai')} />} />
        <SR label="Budget warning" sub="Alert at 80% of monthly budget" right={<Toggle on={notifs.budget} onChange={() => toggle('budget')} />} />
        <SR label="Market alerts" sub="Nifty/Sensex sharp movements" right={<Toggle on={notifs.market} onChange={() => toggle('market')} />} />
        <SR label="Transaction saved" sub="Confirmation after each entry" border={false} right={<Toggle on={notifs.txn} onChange={() => toggle('txn')} />} />
      </div>

      <SL>WHATSAPP DIGEST</SL>
      <div style={{ background: theme.surface, borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.border}`, margin: '0 12px', padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, marginBottom: 5 }}>Coming soon</div>
        <div style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.5 }}>
          Weekly spending summaries on WhatsApp are being set up. We'll notify you when live. You'll choose Daily or Weekly frequency.
        </div>
      </div>

      <SL>DATA & PRIVACY</SL>
      <div style={{ background: theme.surface, borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.border}`, margin: '0 12px' }}>
        <SR label="Export transactions" sub={`${transactions.length} transactions · downloads as CSV`} right={
          <button onClick={handleExport} style={{ background: exportStatus === 'done' ? '#16a34a' : exportStatus === 'error' ? '#dc2626' : theme.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', minWidth: 70 }}>
            {exportStatus === 'done' ? '✓ Done' : exportStatus === 'error' ? 'Error' : exportStatus === 'exporting' ? '...' : 'Export'}
          </button>
        } />
        <SR label="Privacy Policy" right={<span style={{ color: theme.accent, fontSize: 13, cursor: 'pointer' }} onClick={() => setLegalContent({ title: 'Privacy Policy', text: PRIVACY })}>View ›</span>} />
        <SR label="Terms of Service" border={false} right={<span style={{ color: theme.accent, fontSize: 13, cursor: 'pointer' }} onClick={() => setLegalContent({ title: 'Terms of Service', text: TERMS })}>View ›</span>} />
      </div>

      <SL>APP INFO</SL>
      <div style={{ background: theme.surface, borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.border}`, margin: '0 12px' }}>
        <SR label="Version" right={<span style={{ fontSize: 12, color: theme.textMuted }}>1.0.0 Beta</span>} />
        <SR label="Built by" border={false} right={<span style={{ fontSize: 12, color: theme.textMuted }}>Nethra K</span>} />
      </div>
    </div>
  )
}
