import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore } from '../store'
import { signOut, upsertUserProfile } from '../lib/supabase'

export default function Profile() {
  const { theme } = useThemeStore()
  const { user, setUser, logout } = useAuthStore()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.user_metadata?.full_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [whatsapp, setWhatsapp] = useState('')
  const [budget, setBudget] = useState('30000')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'

  const handleSave = async () => {
    setSaving(true)
    if (user?.id && user.id !== 'demo') {
      await upsertUserProfile({ id: user.id, name, phone, whatsapp_number: whatsapp, monthly_budget: parseFloat(budget) })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = async () => {
    await signOut()
    logout()
    navigate('/login')
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: theme.inputBg,
    border: `1.5px solid ${theme.border}`, borderRadius: 12,
    fontSize: 13, color: theme.text, outline: 'none', marginBottom: 12
  }

  const rowStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '13px 16px', borderBottom: `1px solid ${theme.border}`, background: theme.surface
  }

  return (
    <div className="screen-enter" style={{ background: theme.bg, minHeight: '100%', paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ background: theme.sidebar, padding: '32px 16px 24px', textAlign: 'center' }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: theme.accent,
          margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 800, color: '#fff', border: '2px solid rgba(255,255,255,0.2)' }}>
          {initials}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{name || 'Your name'}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{user?.email || 'demo@finora.in'}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontStyle: 'italic' }}>
          Because your money deserves intelligence
        </div>
      </div>

      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, letterSpacing: '.07em', marginBottom: 8 }}>PERSONAL INFO</div>

        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={inputStyle} />
        <input value={user?.email || ''} disabled placeholder="Email" style={{ ...inputStyle, opacity: 0.5 }} />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" type="tel" style={inputStyle} />
        <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp number (for digest)" type="tel" style={inputStyle} />

        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, letterSpacing: '.07em', margin: '4px 0 8px' }}>MONTHLY BUDGET (₹)</div>
        <input value={budget} onChange={e => setBudget(e.target.value)} placeholder="30000" type="number" style={inputStyle} />

        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', padding: 14, background: theme.accent, color: '#fff',
          border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 800, cursor: 'pointer', marginBottom: 12,
          opacity: saving ? 0.6 : 1
        }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save changes'}
        </button>

        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, letterSpacing: '.07em', marginBottom: 8 }}>ACCOUNT</div>
        <div style={{ background: theme.surface, borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.border}` }}>
          <div style={rowStyle}>
            <span style={{ fontSize: 12, fontWeight: 500, color: theme.text }}>Member since</span>
            <span style={{ fontSize: 12, color: theme.textMuted }}>April 2025</span>
          </div>
          <div style={rowStyle}>
            <span style={{ fontSize: 12, fontWeight: 500, color: theme.text }}>Plan</span>
            <span style={{ fontSize: 12, color: theme.accent, fontWeight: 700 }}>Free</span>
          </div>
          <div style={{ ...rowStyle, borderBottom: 'none' }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: theme.text }}>Data export</span>
            <button style={{ fontSize: 12, color: theme.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Export CSV</button>
          </div>
        </div>

        <button onClick={handleLogout} style={{
          width: '100%', padding: 14, background: '#fee2e2', color: '#dc2626',
          border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 16
        }}>
          Sign out
        </button>
      </div>
    </div>
  )
}
