import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore, useTransactionStore } from '../store'
import { insertTransaction } from '../lib/supabase'

const CATS = [
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
  const fileRef = useRef(null)
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const { addTransaction } = useTransactionStore()

  const handleScan = () => {
    // Opens camera via file input with capture attribute
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e) => handleImage(e.target.files[0])
    input.click()
  }

  const handleImage = async (file) => {
    if (!file) return
    setScanning(true)
    try {
      // Use AI to extract amount from image
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1]
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{
                role: 'user',
                content: `Extract the total amount and merchant/vendor name from this receipt/bill image (base64: ${base64.substring(0, 100)}...). Reply ONLY as JSON: {"amount": number, "merchant": "string", "category": "Food|Transport|Shopping|Bills|Health|Entertainment|Education|Other"}`
              }],
              context: {}
            })
          })
          const data = await res.json()
          try {
            const parsed = JSON.parse(data.reply.replace(/```json|```/g, '').trim())
            if (parsed.amount) setAmount(parsed.amount.toString())
            if (parsed.merchant) setNote(parsed.merchant)
            if (parsed.category) setCategory(parsed.category)
          } catch { }
        } catch { }
        setScanning(false)
      }
      reader.readAsDataURL(file)
    } catch { setScanning(false) }
  }

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    setSaving(true)
    const txn = {
      user_id: user?.id || 'demo',
      type, amount: parseFloat(amount),
      category, note, date,
    }
    addTransaction(txn)
    if (user?.id !== 'demo') await insertTransaction(txn)
    setSaving(false)
    setSuccess(true)
    setTimeout(() => navigate('/dashboard'), 1000)
  }

  if (success) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', background: theme.bg, gap: 16 }}>
        <div style={{ fontSize: 48 }}>✅</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Transaction saved!</div>
        <div style={{ fontSize: 13, color: theme.textMuted }}>Going back to dashboard...</div>
      </div>
    )
  }

  return (
    <div className="screen-enter" style={{ background: theme.bg, minHeight: '100%', paddingBottom: 32 }}>
      <div style={{ background: theme.topbar, borderBottom: `1px solid ${theme.topbarBorder}`,
        padding: '12px 16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Add transaction</div>
      </div>

      <div style={{ padding: 14 }}>
        {/* Scan zone */}
        <div style={{ background: theme.aiBg, border: `2px dashed ${theme.aiBorder}`,
          borderRadius: 14, padding: 18, textAlign: 'center', marginBottom: 12, cursor: 'pointer' }}
          onClick={handleScan}>
          <div style={{ width: 44, height: 44, background: theme.accent, borderRadius: 12,
            margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="6" width="18" height="13" rx="3" stroke="white" strokeWidth="1.5"/>
              <circle cx="11" cy="12" r="3.5" stroke="white" strokeWidth="1.5"/>
              <path d="M8 2h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.accent, marginBottom: 3 }}>
            {scanning ? '📷 Reading bill...' : '📷 Scan bill / receipt'}
          </div>
          <div style={{ fontSize: 10, color: theme.textSecondary }}>Point camera at any bill to auto-fill</div>
        </div>

        {/* Upload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          background: theme.surface, border: `1px dashed ${theme.border}`, borderRadius: 12,
          padding: '10px 14px', cursor: 'pointer' }}
          onClick={() => fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImage(e.target.files[0])} />
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="16" height="12" rx="2" stroke={theme.textMuted} strokeWidth="1.3"/>
            <path d="M6 10l3-3 3 3M10 7v6" stroke={theme.textMuted} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
          </svg>
          <div style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 500 }}>Upload screenshot (PhonePe, GPay, etc.)</div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 1, background: theme.border }} />
          <div style={{ fontSize: 11, color: theme.textMuted }}>or enter manually</div>
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
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: theme.textMuted, marginBottom: 4 }}>AMOUNT (₹)</div>
          <input
            type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0"
            style={{ fontSize: 36, fontWeight: 900, color: theme.text, textAlign: 'center',
              background: 'transparent', border: 'none', width: '100%', outline: 'none' }}
          />
        </div>

        {/* Categories */}
        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, marginBottom: 8, letterSpacing: '.06em' }}>CATEGORY</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
          {CATS.map(c => (
            <button key={c.name} onClick={() => setCategory(c.name)} style={{
              padding: '10px 4px', borderRadius: 12, border: `1.5px solid ${category === c.name ? theme.accent : theme.border}`,
              background: category === c.name ? theme.aiBg : theme.surface,
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
            }}>
              <span style={{ fontSize: 18 }}>{c.icon}</span>
              <span style={{ fontSize: 9, fontWeight: category === c.name ? 700 : 500,
                color: category === c.name ? theme.accent : theme.textSecondary }}>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Note */}
        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, marginBottom: 6, letterSpacing: '.06em' }}>NOTE</div>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Swiggy dinner with friends"
          style={{ width: '100%', padding: '12px 14px', background: theme.surface,
            border: `1.5px solid ${theme.border}`, borderRadius: 12, fontSize: 13,
            color: theme.text, marginBottom: 14, outline: 'none' }} />

        {/* Date */}
        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, marginBottom: 6, letterSpacing: '.06em' }}>DATE</div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', background: theme.surface,
            border: `1.5px solid ${theme.border}`, borderRadius: 12, fontSize: 13,
            color: theme.text, marginBottom: 20, outline: 'none' }} />

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
