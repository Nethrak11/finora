import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore, useProfileStore } from '../store'
import { signOut, upsertUserProfile, supabase } from '../lib/supabase'

const LIFE_STAGES = ['Student', 'Young Professional', 'Family', 'Pre-retirement']
const GOALS = ['Save more money', 'Track spending', 'Invest wisely', 'Get debt-free']
const PROFESSIONS = ['Student', 'Salaried Employee', 'Business Owner', 'Freelancer', 'Other']

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
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved | error
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
    setSaveStatus('saving')
    const budgetNum = budget ? parseFloat(budget) : 0
    setProfile({ name, phone, whatsapp: waNum, budget: budgetNum, lifeStage, goal, profession })
    try {
      if (user?.id) {
        await upsertUserProfile({
          id: user.id, email: user.email, name, phone,
          whatsapp_number: waNum, monthly_budget: budgetNum,
          life_stage: lifeStage, goal, profession
        })
      }
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
    setTimeout(() => setSaveStatus('idle'), 2500)
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      logout()
      // Clear local storage
      localStorage.removeItem('finora-auth')
      localStorage.removeItem('finora-transactions')
      localStorage.removeItem('finora-profile')
      navigate('/login', { replace: true })
      window.location.reload() // Force clean state
    } catch (e) {
      // Force logout even on error
      logout()
      navigate('/login', { replace: true })
      window.location.reload()
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      if (user?.id) {
        // Delete all user data from Supabase
        await supabase.from('transactions').delete().eq('user_id', user.id)
        await supabase.from('ai_conversations').delete().eq('user_id', user.id)
        await supabase.from('tips_log').delete().eq('user_id', user.id)
        await supabase.from('users').delete().eq('id', user.id)
        await supabase.auth.signOut()
      }
      // Clear all local data
      localStorage.clear()
      logout()
      navigate('/login', { replace: true })
      window.location.reload()
    } catch (e) {
      // Force clear even if DB fails
      localStorage.clear()
      logout()
      navigate('/login', { replace: true })
      window.location.reload()
    }
  }

  const handleChangeAccount = async () => {
    try {
      await supabase.auth.signOut()
      logout()
      localStorage.removeItem('finora-auth')
    } catch {}
    navigate('/login', { replace: true })
    window.location.reload()
  }

  const inp = {
    width: '100%', padding: '12px 14px', background: theme.inputBg,
    border: `1.5px solid ${theme.border}`, borderRadius: 12, fontSize: 14,
    color: theme.text, marginBottom: 12, outline: 'none',
    WebkitAppearance: 'none', boxSizing: 'border-box', display: 'block'
  }
  const sel = { ...inp, cursor: 'pointer' }
  const SL = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, letterSpacing: '.07em', margin: '12px 0 7px' }}>
      {children}
    </div>
  )

  const saveLabel = saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved!' : saveStatus === 'error' ? '✗ Error — try again' : 'Save changes'
  const saveBg = saveStatus === 'saved' ? '#16a34a' : saveStatus === 'error' ? '#dc2626' : theme.accent

  return (
    <div className="screen-enter" style={{ background: theme.bg, minHeight: '100%', paddingBottom: 32 }}>
      <div style={{ background: theme.sidebar, padding: '28px 16px 22px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: theme.accent,
          margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 800, color: '#fff', border: '2px solid rgba(255,255,255,0.2)' }}>
          {initials}
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{name || 'Your name'}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{user?.email || ''}</div>
      </div>

      <div style={{ padding: 16 }}>
        <SL>PERSONAL INFO</SL>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={inp} />
        <input value={user?.email || ''} disabled style={{ ...inp, opacity: 0.4, cursor: 'not-allowed' }} />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" type="tel" style={inp} />
        <input value={waNum} onChange={e => setWaNum(e.target.value)} placeholder="WhatsApp number" type="tel" style={inp} />

        <SL>MONTHLY SPENDING BUDGET (₹)</SL>
        <input value={budget} onChange={e => setBudget(e.target.value.replace(/\D/g, ''))}
          placeholder="e.g. 25000" type="tel" style={inp} />
        {budget && <div style={{ fontSize: 11, color: theme.textMuted, marginTop: -8, marginBottom: 12 }}>
          ₹{parseInt(budget || 0).toLocaleString('en-IN')} per month
        </div>}

        <SL>LIFE STAGE</SL>
        <select value={lifeStage} onChange={e => setLifeStage(e.target.value)} style={sel}>
          <option value="">Select...</option>
          {LIFE_STAGES.map(s => <option key={s}>{s}</option>)}
        </select>

        <SL>FINANCIAL GOAL</SL>
        <select value={goal} onChange={e => setGoal(e.target.value)} style={sel}>
          <option value="">Select...</option>
          {GOALS.map(g => <option key={g}>{g}</option>)}
        </select>

        <SL>PROFESSION</SL>
        <select value={profession} onChange={e => setProfession(e.target.value)} style={sel}>
          <option value="">Select...</option>
          {PROFESSIONS.map(p => <option key={p}>{p}</option>)}
        </select>

        <button onClick={handleSave} disabled={saveStatus === 'saving'} style={{
          width: '100%', padding: 14, background: saveBg, color: '#fff', border: 'none',
          borderRadius: 13, fontSize: 14, fontWeight: 800, cursor: 'pointer', marginTop: 8, marginBottom: 20,
          transition: 'background 0.2s'
        }}>
          {saveLabel}
        </button>

        <SL>ACCOUNT ACTIONS</SL>
        <div style={{ background: theme.surface, borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: `1px solid ${theme.border}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Switch account</div>
              <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>Log in with a different account</div>
            </div>
            <button onClick={handleChangeAccount} style={{ background: theme.chipBg, border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: theme.text }}>Switch</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>Delete account</div>
              <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>Permanently delete all data</div>
            </div>
            <button onClick={() => setShowDeleteConfirm(true)} style={{ background: '#fee2e2', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#dc2626' }}>Delete</button>
          </div>
        </div>

        <button onClick={handleSignOut} style={{
          width: '100%', padding: 14, background: '#1a1a1a', color: '#fff',
          border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 14
        }}>
          Sign out
        </button>
      </div>

      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
          <div style={{ background: theme.surface, borderRadius: 20, padding: 28, maxWidth: 320, width: '100%' }}>
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 14 }}>⚠️</div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: theme.text, textAlign: 'center', margin: '0 0 10px' }}>
              Delete your account?
            </h3>
            <p style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
              This permanently deletes all your transactions, profile, and data from Finora. This <strong>cannot</strong> be undone.
            </p>
            <button onClick={handleDeleteAccount} disabled={deleting} style={{
              width: '100%', padding: 14, background: '#dc2626', color: '#fff',
              border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', marginBottom: 10, fontSize: 14
            }}>
              {deleting ? 'Deleting...' : 'Yes, delete everything'}
            </button>
            <button onClick={() => setShowDeleteConfirm(false)} style={{
              width: '100%', padding: 12, background: 'transparent', color: theme.textMuted,
              border: 'none', cursor: 'pointer', fontSize: 13
            }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
