import { useState } from 'react'
import { useThemeStore, useTransactionStore, useAuthStore } from '../store'
import { supabase } from '../lib/supabase'

const catIcons = { Food:'🍔',Transport:'🚗',Shopping:'🛒',Bills:'💡',Health:'🏥',Entertainment:'🎬',Education:'📚',Investment:'📈',Income:'💰',Transfer:'🔄',Other:'📦' }

const DEFAULT_CATS = ['Food','Transport','Shopping','Bills','Health','Entertainment','Education','Investment','Income','Transfer','Other']

export default function TransactionHistory() {
  const { theme } = useThemeStore()
  const { transactions, updateTransaction, deleteTransaction } = useTransactionStore()
  const { user } = useAuthStore()
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = transactions.filter(t => {
    const matchType = filter === 'all' || t.type === filter
    const matchSearch = search === '' || 
      t.note?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const startEdit = (t) => {
    setEditingId(t.id)
    setEditData({ amount: String(t.amount), category: t.category, note: t.note || '', date: t.date, type: t.type })
  }

  const saveEdit = async () => {
    updateTransaction(editingId, {
      amount: parseFloat(editData.amount),
      category: editData.category,
      note: editData.note,
      date: editData.date,
      type: editData.type
    })
    if (user?.id && user.id !== 'demo') {
      await supabase.from('transactions').update({
        amount: parseFloat(editData.amount),
        category: editData.category,
        note: editData.note,
        date: editData.date,
        type: editData.type
      }).eq('id', editingId)
    }
    setEditingId(null)
  }

  const confirmDelete = async (id) => {
    deleteTransaction(id)
    if (user?.id && user.id !== 'demo') {
      await supabase.from('transactions').delete().eq('id', id)
    }
    setDeleteConfirm(null)
  }

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Note', 'Amount (₹)']
    const rows = transactions.map(t => [
      t.date, t.type, t.category, `"${(t.note || '').replace(/"/g, '""')}"`, t.amount
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finora-transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalSpent = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)

  const inp = (val, onChange, type='text', placeholder='') => ({
    value: val, onChange: e => onChange(e.target.value), type, placeholder,
    style: { width: '100%', padding: '8px 10px', background: theme.inputBg,
      border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 12,
      color: theme.text, outline: 'none', boxSizing: 'border-box' }
  })

  return (
    <div className="screen-enter" style={{ background: theme.bg, minHeight: '100%', paddingBottom: 32 }}>
      <div style={{ background: theme.topbar, borderBottom: `1px solid ${theme.topbarBorder}`,
        padding: '12px 16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>All transactions</div>
          <button onClick={exportCSV} style={{ background: theme.accent, color: '#fff', border: 'none',
            borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            Export CSV
          </button>
        </div>
      </div>

      <div style={{ padding: '12px 12px 0' }}>
        {/* Search */}
        <input placeholder="Search by note or category..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '11px 14px', background: theme.surface,
            border: `1.5px solid ${theme.border}`, borderRadius: 12, fontSize: 13,
            color: theme.text, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />

        {/* Filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, background: theme.surface,
          border: `1px solid ${theme.border}`, borderRadius: 10, padding: 4 }}>
          {['all','expense','income','transfer'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              flex: 1, padding: '7px 0', borderRadius: 7, border: 'none',
              background: filter === f ? theme.accent : 'transparent',
              color: filter === f ? '#fff' : theme.textSecondary,
              fontWeight: 700, fontSize: 11, cursor: 'pointer', textTransform: 'capitalize'
            }}>{f}</button>
          ))}
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '10px 14px' }}>
            <div style={{ fontSize: 9, color: theme.textMuted, marginBottom: 3 }}>TOTAL SPENT</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: theme.negative }}>₹{totalSpent.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '10px 14px' }}>
            <div style={{ fontSize: 9, color: theme.textMuted, marginBottom: 3 }}>TOTAL INCOME</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: theme.positive }}>₹{totalIncome.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div style={{ fontSize: 10, color: theme.textMuted, marginBottom: 8 }}>
          {filtered.length} transactions
        </div>
      </div>

      {/* Transaction list */}
      <div style={{ margin: '0 12px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: theme.textMuted, fontSize: 13 }}>
            No transactions found
          </div>
        ) : filtered.map((t, idx) => (
          <div key={t.id}>
            {editingId === t.id ? (
              // Edit mode
              <div style={{ padding: '14px 14px', borderBottom: idx < filtered.length - 1 ? `1px solid ${theme.border}` : 'none',
                background: theme.aiBg }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  {['expense','income','transfer'].map(tp => (
                    <button key={tp} onClick={() => setEditData(d => ({ ...d, type: tp }))} style={{
                      flex: 1, padding: '5px', borderRadius: 7, border: 'none',
                      background: editData.type === tp ? theme.accent : theme.surface,
                      color: editData.type === tp ? '#fff' : theme.textSecondary,
                      fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>{tp}</button>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
                  <input {...inp(editData.amount, v => setEditData(d => ({ ...d, amount: v })), 'tel', 'Amount')} />
                  <input {...inp(editData.date, v => setEditData(d => ({ ...d, date: v })), 'date', '')} />
                </div>
                <input {...inp(editData.note, v => setEditData(d => ({ ...d, note: v })), 'text', 'Note')} style={{ ...inp(editData.note, () => {}).style, marginBottom: 6 }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                  {DEFAULT_CATS.map(c => (
                    <button key={c} onClick={() => setEditData(d => ({ ...d, category: c }))} style={{
                      padding: '4px 10px', borderRadius: 20, border: `1px solid ${editData.category === c ? theme.accent : theme.border}`,
                      background: editData.category === c ? theme.aiBg : 'transparent',
                      color: editData.category === c ? theme.accent : theme.text,
                      fontSize: 11, cursor: 'pointer' }}>{c}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={saveEdit} style={{ flex: 1, padding: '9px', background: theme.accent,
                    color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: '9px', background: 'transparent',
                    color: theme.textMuted, border: `1px solid ${theme.border}`, borderRadius: 9, cursor: 'pointer', fontSize: 12 }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View mode
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                borderBottom: idx < filtered.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: theme.chipBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {catIcons[t.category] || '📦'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 2 }}>
                    {t.note || t.category}
                  </div>
                  <div style={{ fontSize: 10, color: theme.textMuted }}>
                    {t.category} · {t.date}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800,
                  color: t.type === 'income' ? theme.positive : t.type === 'transfer' ? theme.accent : theme.negative,
                  marginRight: 8 }}>
                  {t.type === 'income' ? '+' : t.type === 'transfer' ? '↔' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => startEdit(t)} style={{
                    width: 30, height: 30, borderRadius: 8, background: theme.chipBg,
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13 }}>✏️</button>
                  <button onClick={() => setDeleteConfirm(t.id)} style={{
                    width: 30, height: 30, borderRadius: 8, background: '#fee2e2',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13 }}>🗑️</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: theme.surface, borderRadius: 20, padding: 24, maxWidth: 300, width: '100%' }}>
            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: theme.text, textAlign: 'center', margin: '0 0 10px' }}>Delete transaction?</h3>
            <p style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', marginBottom: 20 }}>
              This cannot be undone.
            </p>
            <button onClick={() => confirmDelete(deleteConfirm)}
              style={{ width: '100%', padding: 12, background: '#dc2626', color: '#fff',
                border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 8, fontSize: 14 }}>
              Yes, delete
            </button>
            <button onClick={() => setDeleteConfirm(null)}
              style={{ width: '100%', padding: 12, background: 'transparent',
                color: theme.textMuted, border: 'none', cursor: 'pointer', fontSize: 13 }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
