import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore, useProfileStore } from '../store'
import { signOut, upsertUserProfile } from '../lib/supabase'

export default function Profile() {
  const { theme } = useThemeStore()
  const { user, logout } = useAuthStore()
  const { city, budget, lifeStage, goal, phone, whatsapp, name: storedName, setProfile } = useProfileStore()
  const navigate = useNavigate()

  const [name, setName] = useState(storedName || user?.user_metadata?.full_name || '')
  const [phoneVal, setPhoneVal] = useState(phone || '')
  const [waVal, setWaVal] = useState(whatsapp || '')
  const [budgetVal, setBudgetVal] = useState(budget > 0 ? String(budget) : '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Sync from store when component mounts
  useEffect(() => {
    setName(storedName || user?.user_metadata?.full_name || '')
    setPhoneVal(phone || '')
    setWaVal(whatsapp || '')
    setBudgetVal(budget > 0 ? String(budget) : '')
  }, [storedName, phone, whatsapp, budget])

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'

  const handleSave = async () => {
    setSaving(true)
    const budgetNum = budgetVal ? parseFloat(budgetVal) : 0

    // Update local store immediately
    setProfile({
      name,
      phone: phoneVal,
      whatsapp: waVal,
      budget: budgetNum,
    })

    // Sync to Supabase
    if (user?.id && user.id !== 'demo') {
      await upsertUserProfile({
        id: user.id,
        email: user.email,
        name,
        phone: phoneVal,
        whatsapp_number: waVal,
        monthly_budget: budgetNum,
      })
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

  const inp = {
    width: '100%', padding: '13px 16px', background: theme.inputBg,
    border: `1.5px solid ${theme.border}`, borderRadius: 12, fontSize: 14,
    color: theme.text, marginBottom: 12, outline: 'none',
    WebkitAppearance: 'none', boxSizing: 'border-box', display: 'block'
  }

  return (
    <div className="screen-enter" style={{ background: theme.bg, minHeight: '100%', paddingBottom: 32 }}>
      <div style={{ background: theme.sidebar, padding: '32px 16px 24px', textAlign: 'center' }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: theme.accent,
          margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 800, color: '#fff', border: '2px solid rgba(255,255,255,0.2)' }}>
          {initials}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{name || 'Your name'}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{user?.email || ''}</div>
        {city && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{city}</div>}
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, letterSpacing: '.07em', marginBottom: 8 }}>PERSONAL INFO</div>

        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={inp} />
        <input value={user?.email || ''} disabled placeholder="Email"
          style={{ ...inp, opacity: 0.5, cursor: 'not-allowed' }} />
        <input value={phoneVal} onChange={e => setPhoneVal(e.target.value)}
          placeholder="Phone number" type="tel" style={inp} />
        <input value={waVal} onChange={e => setWaVal(e.target.value)}
          placeholder="WhatsApp number (for digest)" type="tel" style={inp} />

        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, letterSpacing: '.07em', margin: '4px 0 8px' }}>
          MONTHLY BUDGET (₹)
        </div>
        <input value={budgetVal} onChange={e => setBudgetVal(e.target.value.replace(/\D/g, ''))}
          placeholder="e.g. 25000" type="tel" style={inp} />
        {budgetVal && <div style={{ fontSize: 11, color: theme.textMuted, marginTop: -8, marginBottom: 12 }}>
          ₹{parseInt(budgetVal||0).toLocaleString('en-IN')} per month
        </div>}

        {city && (
          <div style={{ background: theme.aiBg, border: `1px solid ${theme.aiBorder}`, borderRadius: 10,
            padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: theme.aiText }}>📍 {city} — your city</span>
            <button onClick={() => navigate('/onboarding-questions')} style={{
              background: 'none', border: 'none', color: theme.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              Change
            </button>
          </div>
        )}

        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', padding: 14, background: theme.accent, color: '#fff',
          border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 800, cursor: 'pointer', marginBottom: 16,
          opacity: saving ? 0.6 : 1
        }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save changes'}
        </button>

        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, letterSpacing: '.07em', marginBottom: 8 }}>ACCOUNT</div>
        <div style={{ background: theme.surface, borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.border}` }}>
          {[
            { label: 'Life stage', value: lifeStage || '—' },
            { label: 'Goal', value: goal || '—' },
            { label: 'Member since', value: 'April 2025' },
            { label: 'Plan', value: 'Free' },
          ].map((r, i, arr) => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px',
              borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : 'none', background: theme.surface }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: theme.text }}>{r.label}</span>
              <span style={{ fontSize: 12, color: r.label === 'Plan' ? theme.accent : theme.textMuted, fontWeight: r.label === 'Plan' ? 700 : 400 }}>{r.value}</span>
            </div>
          ))}
        </div>

        <button onClick={handleLogout} style={{
          width: '100%', padding: 14, background: '#fee2e2', color: '#dc2626',
          border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 20
        }}>
          Sign out
        </button>
      </div>
    </div>
  )
}
