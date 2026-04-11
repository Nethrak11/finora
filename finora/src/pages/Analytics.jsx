import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { useThemeStore, useTransactionStore } from '../store'

export default function Analytics() {
  const [period, setPeriod] = useState('monthly')
  const { theme } = useThemeStore()
  const { transactions, getCategoryBreakdown, getTotalSpent, getTotalIncome } = useTransactionStore()

  const categories = getCategoryBreakdown()
  const maxCat = categories[0]?.value || 1

  // Build monthly trend (last 6 months)
  const now = new Date()
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const label = d.toLocaleString('default', { month: 'short' })
    const total = transactions
      .filter(t => {
        const td = new Date(t.date)
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() && t.type === 'expense'
      })
      .reduce((s, t) => s + t.amount, 0)
    return { month: label, amount: total }
  })

  const totalSpent = getTotalSpent()
  const totalIncome = getTotalIncome()
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalSpent) / totalIncome) * 100).toFixed(1) : 0

  return (
    <div className="screen-enter" style={{ background: theme.bg, minHeight: '100%', paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ background: theme.topbar, borderBottom: `1px solid ${theme.topbarBorder}`,
        padding: '12px 16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Analytics</div>
        <div style={{ fontSize: 10, color: theme.textMuted, fontStyle: 'italic' }}>Finance that works for you</div>
      </div>

      <div style={{ padding: 12 }}>
        {/* Period selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, background: theme.surface,
          borderRadius: 12, padding: 4, border: `1px solid ${theme.border}` }}>
          {['weekly','monthly','yearly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              flex: 1, padding: '7px 0', borderRadius: 9, border: 'none',
              background: period === p ? theme.accent : 'transparent',
              color: period === p ? '#fff' : theme.textSecondary,
              fontWeight: 700, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize'
            }}>{p}</button>
          ))}
        </div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, color: theme.negative },
            { label: 'Income', value: `₹${totalIncome.toLocaleString('en-IN')}`, color: theme.positive },
            { label: 'Saved %', value: `${savingsRate}%`, color: theme.accent },
          ].map(stat => (
            <div key={stat.label} style={{ background: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: theme.textMuted, marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Trend chart */}
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`,
          borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: theme.text, marginBottom: 12 }}>Spending trend</div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: theme.textMuted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: theme.textMuted }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Spent']}
                contentStyle={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, fontSize: 11 }} />
              <Line type="monotone" dataKey="amount" stroke={theme.accent} strokeWidth={2.5} dot={{ r: 4, fill: theme.accent }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: theme.text, marginBottom: 12 }}>By category</div>
          {categories.length === 0 ? (
            <p style={{ color: theme.textMuted, fontSize: 12, textAlign: 'center', padding: '16px 0', margin: 0 }}>
              No expense data yet
            </p>
          ) : categories.map(cat => (
            <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: theme.textSecondary, width: 64, flexShrink: 0 }}>{cat.name}</div>
              <div style={{ flex: 1, background: theme.chipBg, borderRadius: 4, height: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: theme.accent, borderRadius: 4,
                  width: `${(cat.value / maxCat) * 100}%`, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, minWidth: 56, textAlign: 'right' }}>
                ₹{cat.value.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
