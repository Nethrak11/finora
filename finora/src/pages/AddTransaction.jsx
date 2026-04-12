import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore, useTransactionStore, useProfileStore } from '../store'
import { insertTransaction } from '../lib/supabase'
import { sendLocalNotification } from '../lib/notifications'

const DEFAULT_CATS = [
  { name: 'Food', icon: '🍔' }, { name: 'Transport', icon: '🚗' },
  { name: 'Shopping', icon: '🛒' }, { name: 'Bills', icon: '💡' },
  { name: 'Health', icon: '🏥' }, { name: 'Entertainment', icon: '🎬' },
  { name: 'Education', icon: '📚' }, { name: 'Investment', icon: '📈' },
]

export default function AddTransaction() {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [scanning, setScanning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const fileRef = useRef(null)
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const { addTransaction } = useTransactionStore()
  const { customCategories, addCustomCategory } = useProfileStore()

  const allCats = [...DEFAULT_CATS, ...customCategories.map(c => ({ name: c, icon: '🏷️' }))]

  const handleImage = async (file) => {
    if (!file) return
    setScanning(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: `Look at this receipt/bill and extract: total amount paid, merchant name, and category. Reply ONLY as valid JSON like: {"amount": 480, "merchant": "Swiggy", "category": "Food"}. Categories available: Food, Transport, Shopping, Bills, Health, Entertainment, Education, Investment. Image data starts with: ${e.target.result.substring(0, 50)}` }],
              context: {}
            })
          })
          const data = await res.json()
          const text = data.reply?.replace(/```json|```/g, '').trim()
          const parsed = JSON.parse(text)
          if (parsed.amount) setAmount(String(parsed.amount))
          if (parsed.merchant) setNote(parsed.merchant)
          if (parsed.category) setCategory(parsed.category)
        } catch {}
        setScanning(false)
      }
      reader.readAsDataURL(file)
    } catch { setScanning(false) }
  }

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    setSaving(true)
    const txn = { user_id: user?.id || 'demo', type, amount: parseFloat(amount), category, note, date }
    addTransaction(txn)
    if (user?.id && user.id !== 'demo') await insertTransaction(txn)
    sendLocalNotification('Transaction saved ✅', `₹${parseFloat(amount).toLocaleString('en-IN')} — ${category}`)
    setSaving(false)
    setSuccess(true)
    setTimeout(() => navigate('/dashboard'), 900)
  }

  const addCat = () => {
    if (!newCatName.trim()) return
    addCustomCategory(newCatName.trim())
    setCategory(newCatName.trim())
    setNewCatName('')
    setShowAddCat(false)
  }

  if (success) return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', background: theme.bg, gap: 16 }}>
      <div style={{ fontSize: 56 }}>✅</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>Saved!</div>
      <div style={{ fontSize: 13, color: theme.textMuted }}>Going back...</div>
    </div>
  )

  return (
    <div className="screen-enter" style={{ background: theme.bg, minHeight: '100%', paddingBottom: 32 }}>
      <div style={{ background: theme.topbar, borderBottom: `1px solid ${theme.topbarBorder}`,
        padding: '12px 16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Add transaction</div>
      </div>

      <div style={{ padding: 14 }}>
        {/* Scan / Upload */}
        <div style={{ background: theme.aiBg, border: `2px dashed ${theme.aiBorder}`,
          borderRadius: 14, padding: 18, textAlign: 'center', marginBottom: 10, cursor: 'pointer' }}
          onClick={() => { const i = document.createElement('input'); i.type='file'; i.accept='image/*'; i.capture='environment'; i.onchange=e=>handleImage(e.target.files[0]); i.click() }}>
          <div style={{ width: 44, height: 44, background: theme.accent, borderRadius: 12,
            margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="6" width="18" height="13" rx="3" stroke="white" strokeWidth="1.5"/>
              <circle cx="11" cy="12" r="3.5" stroke="white" strokeWidth="1.5"/>
              <path d="M8 2h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.accent }}>
            {scanning ? '📷 Reading bill...' : '📷 Scan bill / receipt'}
          </div>
          <div style={{ fontSize: 10, color: theme.textSecondary, marginTop: 3 }}>AI auto-fills the amount and category</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
          background: theme.surface, border: `1px dashed ${theme.border}`, borderRadius: 12,
          padding: '10px 14px', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImage(e.target.files[0])} />
          <span style={{ fontSize: 18 }}>🖼️</span>
          <div style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 500 }}>Upload screenshot (PhonePe, GPay, bank SMS)</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0' }}>
          <div style={{ flex: 1, height: 1, background: theme.border }} />
          <span style={{ fontSize: 11, color: theme.textMuted }}>or enter manually</span>
          <div style={{ flex: 1, height: 1, background: theme.border }} />
        </div>

        {/* Type */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: theme.surface,
          border: `1px solid ${theme.border}`, borderRadius: 12, padding: 4 }}>
          {['expense','income','transfer'].map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              flex: 1, padding: '8px 0', borderRadius: 9, border: 'none',
              background: type === t ? theme.accent : 'transparent',
              color: type === t ? '#fff' : theme.textSecondary,
              fontWeight: 700, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize'
            }}>{t}</button>
          ))}
        </div>

        {/* Amount */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: theme.textMuted, marginBottom: 6 }}>AMOUNT (₹)</div>
          <input type="tel" value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="0"
            style={{ fontSize: 36, fontWeight: 900, color: theme.text, textAlign: 'center',
              background: 'transparent', border: 'none', width: '100%', outline: 'none', WebkitAppearance: 'none' }} />
          {amount && <div style={{ fontSize: 13, color: theme.textMuted }}>
            ₹{parseFloat(amount || 0).toLocaleString('en-IN')}
          </div>}
        </div>

        {/* Categories */}
        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, marginBottom: 8, letterSpacing: '.06em' }}>CATEGORY</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7, marginBottom: 10 }}>
          {allCats.map(c => (
            <button key={c.name} onClick={() => setCategory(c.name)} style={{
              padding: '10px 4px', borderRadius: 12,
              border: `1.5px solid ${category === c.name ? theme.accent : theme.border}`,
              background: category === c.name ? theme.aiBg : theme.surface,
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3
            }}>
              <span style={{ fontSize: 18 }}>{c.icon}</span>
              <span style={{ fontSize: 8.5, fontWeight: category === c.name ? 700 : 500,
                color: category === c.name ? theme.accent : theme.textSecondary,
                textAlign: 'center', lineHeight: 1.2 }}>{c.name}</span>
            </button>
          ))}
          <button onClick={() => setShowAddCat(true)} style={{
            padding: '10px 4px', borderRadius: 12, border: `1.5px dashed ${theme.border}`,
            background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3
          }}>
            <span style={{ fontSize: 18 }}>➕</span>
            <span style={{ fontSize: 8.5, color: theme.textMuted }}>Add new</span>
          </button>
        </div>

        {showAddCat && (
          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12,
            padding: 12, marginBottom: 12, display: 'flex', gap: 8 }}>
            <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
              placeholder="Category name..."
              style={{ flex: 1, padding: '10px 12px', border: `1px solid ${theme.border}`, borderRadius: 9,
                fontSize: 13, color: theme.text, background: theme.inputBg, outline: 'none' }}
              onKeyDown={e => e.key === 'Enter' && addCat()} />
            <button onClick={addCat} style={{ padding: '10px 16px', background: theme.accent,
              color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, cursor: 'pointer' }}>Add</button>
          </div>
        )}

        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, marginBottom: 6, letterSpacing: '.06em' }}>NOTE</div>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Swiggy dinner with friends"
          style={{ width: '100%', padding: '12px 14px', background: theme.surface,
            border: `1.5px solid ${theme.border}`, borderRadius: 12, fontSize: 13,
            color: theme.text, marginBottom: 12, outline: 'none', WebkitAppearance: 'none', boxSizing: 'border-box' }} />

        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, marginBottom: 6, letterSpacing: '.06em' }}>DATE</div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', background: theme.surface,
            border: `1.5px solid ${theme.border}`, borderRadius: 12, fontSize: 13,
            color: theme.text, marginBottom: 20, outline: 'none', WebkitAppearance: 'none', boxSizing: 'border-box' }} />

        <button onClick={handleSave} disabled={saving || !amount}
          style={{ width: '100%', padding: 15, background: theme.accent, color: '#fff',
            border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer',
            opacity: (!amount || saving) ? 0.5 : 1 }}>
          {saving ? 'Saving...' : 'Save transaction'}
        </button>
      </div>
    </div>
  )
}
