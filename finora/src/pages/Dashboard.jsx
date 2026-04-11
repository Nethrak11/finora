import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore, useTransactionStore, useMarketStore } from '../store'

const categories = {
  Food: '🍔', Transport: '🚗', Shopping: '🛒', Bills: '💡',
  Health: '🏥', Entertainment: '🎬', Education: '📚',
  Investment: '📈', Income: '💰', Other: '📦'
}

function MarketChip({ label, value, change }) {
  const { theme } = useThemeStore()
  const pos = parseFloat(change) >= 0
  return (
    <div style={{ flexShrink: 0, background: theme.chipBg, borderRadius: 10, padding: '8px 12px', minWidth: 80 }}>
      <div style={{ fontSize: 8, fontWeight: 700, color: theme.chipText, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 800, color: theme.text }}>{value}</div>
      <div style={{ fontSize: 8, marginTop: 2, color: pos ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
        {pos ? '▲' : '▼'} {Math.abs(change)}%
      </div>
    </div>
  )
}

function TipCard({ badge, badgeBg, badgeColor, text, borderColor }) {
  const { theme } = useThemeStore()
  return (
    <div style={{ flexShrink: 0, minWidth: 180, maxWidth: 200, background: theme.surface,
      border: `1px solid ${theme.border}`, borderRadius: 14, padding: '12px 13px',
      borderLeft: `3px solid ${borderColor}` }}>
      <div style={{ display: 'inline-block', fontSize: 8, fontWeight: 800, padding: '2px 8px',
        borderRadius: 20, background: badgeBg, color: badgeColor, marginBottom: 7, letterSpacing: '.04em' }}>
        {badge}
      </div>
      <p style={{ fontSize: 11, color: theme.text, lineHeight: 1.5, margin: 0 }}>{text}</p>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const { transactions, getTotalSpent, getTotalIncome, getCategoryBreakdown } = useTransactionStore()
  const { data: market, setData, isStale } = useMarketStore()
  const [aiInsight, setAiInsight] = useState('Loading your AI insight...')
  const [insightLoaded, setInsightLoaded] = useState(false)

  const spent = getTotalSpent()
  const income = getTotalIncome()
  const balance = income - spent
  const recent = transactions.slice(0, 5)
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    if (isStale()) fetchMarket()
  }, [])

  useEffect(() => {
    if (!insightLoaded) generateInsight()
  }, [transactions])

  async function fetchMarket() {
    try {
      const res = await fetch('/api/market')
      const data = await res.json()
      setData(data)
    } catch { }
  }

  async function generateInsight() {
    if (insightLoaded) return
    const top = getCategoryBreakdown()[0]
    const context = { name: userName, spent, income, topCategory: top?.name, budget: 30000 }
    const prompt = `Give one short specific financial insight for this month in 1-2 sentences. Be helpful and warm.`
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], context })
      })
      const data = await res.json()
      if (data.reply) { setAiInsight(data.reply); setInsightLoaded(true) }
    } catch {
      setAiInsight(spent > 0
        ? `You've spent ₹${spent.toLocaleString('en-IN')} this month. Keep tracking to stay on budget!`
        : 'Add your first transaction to get personalised AI insights.')
      setInsightLoaded(true)
    }
  }

  const tips = [
    { badge: 'FOR YOU', badgeBg: theme.chipBg, badgeColor: theme.chipText, borderColor: theme.accent,
      text: spent > 0 ? `Your top spend is ${getCategoryBreakdown()[0]?.name || 'uncategorised'}. Small cuts here add up fast.` : 'Start tracking today — even small expenses matter over time.' },
    { badge: 'MARKET', badgeBg: '#FEF9EC', badgeColor: '#854F0B', borderColor: '#EF9F27',
      text: market ? `Nifty at ${market.nifty?.value} (${market.nifty?.change}%). Gold at ₹${market.gold?.value}/g.` : 'Fetching live market data...' },
    { badge: 'LEARN', badgeBg: '#ECFDF5', badgeColor: '#065f46', borderColor: '#10b981',
      text: '50-30-20 rule: 50% needs, 30% wants, 20% savings. Simple and effective for any salary.' },
  ]

  return (
    <div className="screen-enter" style={{ background: theme.bg, minHeight: '100%', paddingBottom: 24 }}>
      {/* Topbar */}
      <div style={{ background: theme.topbar, borderBottom: `1px solid ${theme.topbarBorder}`,
        padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.textMuted }}>{greeting}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>{userName}</div>
        </div>
        <div onClick={() => navigate('/profile')} style={{ width: 36, height: 36, borderRadius: '50%',
          background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
          {userName[0].toUpperCase()}
        </div>
      </div>

      {/* Balance card */}
      <div style={{ background: theme.balanceCard, margin: '12px 12px 0', borderRadius: 16, padding: 18 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Total balance</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: -1, marginBottom: 16 }}>
          ₹{balance.toLocaleString('en-IN')}
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div><div style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>SPENT</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f87171' }}>₹{spent.toLocaleString('en-IN')}</div></div>
          <div><div style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>INCOME</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#34d399' }}>₹{income.toLocaleString('en-IN')}</div></div>
          <div><div style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>THIS MONTH</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginTop: 2 }}>
              Your financial life, simplified
            </div>
          </div>
        </div>
      </div>

      {/* Market ticker */}
      <div className="market-ticker" style={{ padding: '10px 12px 0' }}>
        <MarketChip label="NIFTY" value={market?.nifty?.value || '—'} change={market?.nifty?.change || '0'} />
        <MarketChip label="SENSEX" value={market?.sensex?.value || '—'} change={market?.sensex?.change || '0'} />
        <MarketChip label="GOLD/g" value={`₹${market?.gold?.value || '—'}`} change={market?.gold?.change || '0'} />
        <MarketChip label="SILVER/g" value={`₹${market?.silver?.value || '—'}`} change={market?.silver?.change || '0'} />
      </div>

      {/* AI Insight */}
      <div style={{ margin: '10px 12px 0', background: theme.aiBg,
        borderLeft: `3px solid ${theme.aiBorder}`, borderRadius: 12, padding: '12px 14px' }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: theme.accent, letterSpacing: '.06em', marginBottom: 5 }}>AI INSIGHT</div>
        <p style={{ fontSize: 12, color: theme.aiText, lineHeight: 1.55, margin: 0 }}>{aiInsight}</p>
      </div>

      {/* Tips strip */}
      <div style={{ padding: '12px 12px 0' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: theme.textMuted, letterSpacing: '.06em', marginBottom: 8 }}>TIPS & INSIGHTS</div>
        <div className="tips-row">
          {tips.map((t, i) => <TipCard key={i} {...t} />)}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '12px 12px 0' }}>
        {getCategoryBreakdown().slice(0, 2).map(cat => (
          <div key={cat.name} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{categories[cat.name] || '📦'}</div>
            <div style={{ fontSize: 10, color: theme.textSecondary }}>{cat.name}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: theme.negative }}>₹{cat.value.toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div style={{ margin: '12px 12px 0', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: theme.text, letterSpacing: '.03em' }}>RECENT TRANSACTIONS</div>
          <button onClick={() => navigate('/analytics')} style={{ background: 'none', border: 'none', color: theme.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>See all</button>
        </div>
        {recent.length === 0 ? (
          <div style={{ padding: '20px 14px', textAlign: 'center', color: theme.textMuted, fontSize: 12 }}>
            No transactions yet. Tap + to add your first one.
          </div>
        ) : recent.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderTop: `1px solid ${theme.border}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: theme.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              {categories[t.category] || '📦'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{t.note || t.category}</div>
              <div style={{ fontSize: 10, color: theme.textMuted }}>{t.category} · {t.date}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: t.type === 'income' ? theme.positive : theme.negative }}>
              {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      {/* Quick add FAB */}
      <div onClick={() => navigate('/add')} style={{
        position: 'fixed', bottom: 24, right: 24,
        width: 52, height: 52, borderRadius: '50%', background: theme.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 100
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="5" y1="12" x2="19" y2="12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  )
}
