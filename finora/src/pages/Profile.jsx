import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore, useProfileStore } from '../store'
import { signOut, upsertUserProfile } from '../lib/supabase'

const LIFE_STAGES = ['Student', 'Young Professional', 'Family', 'Pre-retirement']
const GOALS = ['Save more money', 'Track spending', 'Invest wisely', 'Get debt-free']
const PROFESSIONS = ['Student', 'Salaried Employee', 'Business Owner', 'Freelancer']

export default function Profile() {
  const { theme } = useThemeStore()
  const { user, logout } = useAuthStore()
  const profile = useProfileStore()
  const { setProfile } = useProfileStore()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [waNum, setWaNum] = useState('')
  const [budget, setBudget] = useState('')
  const [lifeStage, setLifeStage] = useState('')
  const [goal, setGoal] = useState('')
  const [profession, setProfession] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load from store on mount
  useEffect(() => {
    setName(profile.name || user?.user_metadata?.full_name || '')
    setPhone(profile.phone || '')
    setWaNum(profile.whatsapp || '')
    setBudget(profile.budget > 0 ? String(profile.budget) : '')
    setLifeStage(profile.lifeStage || '')
    setGoal(profile.goal || '')
    setProfession(profile.profession || '')
  }, [])

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'

  const handleSave = async () => {
    setSaving(true)
    const budgetNum = budget ? parseFloat(budget) : 0

    // Update Zustand store immediately so home screen reflects changes
    setProfile({
      name, phone, whatsapp: waNum, budget: budgetNum,
      lifeStage, goal, profession
    })

    if (user?.id && user.id !== 'demo') {
      await upsertUserProfile({
        id: user.id, email: user.email,
        name, phone, whatsapp_number: waNum,
        monthly_budget: budgetNum,
        life_stage: lifeStage,
        goal, profession
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
    width: '100%', padding: '12px 14px', background: theme.inputBg,
    border: `1.5px solid ${theme.border}`, borderRadius: 12, fontSize: 14,
    color: theme.text, marginBottom: 12, outline: 'none',
    WebkitAppearance: 'none', boxSizing: 'border-box', display: 'block'
  }

  const selStyle = {
    ...inp, cursor: 'pointer'
  }

  const SL = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, letterSpacing: '.07em', margin: '14px 0 8px' }}>
      {children}
    </div>
  )

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
        {profile.city && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>📍 {profile.city}</div>}
      </div>

      <div style={{ padding: 16 }}>
        <SL>PERSONAL INFO</SL>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={inp} />
        <input value={user?.email || ''} disabled style={{ ...inp, opacity: 0.45, cursor: 'not-allowed' }} />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" type="tel" style={inp} />
        <input value={waNum} onChange={e => setWaNum(e.target.value)} placeholder="WhatsApp number" type="tel" style={inp} />

        <SL>MONTHLY BUDGET (₹) — how much you plan to spend</SL>
        <input value={budget} onChange={e => setBudget(e.target.value.replace(/\D/g, ''))}
          placeholder="e.g. 25000" type="tel" style={inp} />
        {budget && <div style={{ fontSize: 11, color: theme.textMuted, marginTop: -8, marginBottom: 12 }}>
          ₹{parseInt(budget || 0).toLocaleString('en-IN')} per month spending limit
        </div>}

        <SL>LIFE STAGE</SL>
        <select value={lifeStage} onChange={e => setLifeStage(e.target.value)} style={selStyle}>
          <option value="">Select life stage...</option>
          {LIFE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <SL>FINANCIAL GOAL</SL>
        <select value={goal} onChange={e => setGoal(e.target.value)} style={selStyle}>
          <option value="">Select your goal...</option>
          {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <SL>PROFESSION</SL>
        <select value={profession} onChange={e => setProfession(e.target.value)} style={selStyle}>
          <option value="">Select profession...</option>
          {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        {profile.city && (
          <div style={{ background: theme.aiBg, border: `1px solid ${theme.aiBorder}`, borderRadius: 10,
            padding: '10px 14px', margin: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: theme.aiText }}>📍 City: {profile.city}</span>
            <button onClick={() => navigate('/onboarding-questions')} style={{
              background: 'none', border: 'none', color: theme.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              Change city
            </button>
          </div>
        )}

        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', padding: 14, background: theme.accent, color: '#fff',
          border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 800, cursor: 'pointer',
          marginTop: 8, marginBottom: 16, opacity: saving ? 0.6 : 1
        }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save changes'}
        </button>

        <SL>ACCOUNT</SL>
        <div style={{ background: theme.surface, borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.border}` }}>
          {[
            { label: 'Member since', value: 'April 2025' },
            { label: 'Plan', value: 'Free', accent: true },
          ].map((r, i, arr) => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px',
              borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : 'none', background: theme.surface }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: theme.text }}>{r.label}</span>
              <span style={{ fontSize: 12, color: r.accent ? theme.accent : theme.textMuted, fontWeight: r.accent ? 700 : 400 }}>{r.value}</span>
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
