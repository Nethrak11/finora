import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore, useTransactionStore, useMarketStore, useProfileStore } from '../store'

const catIcons = { Food:'🍔',Transport:'🚗',Shopping:'🛒',Bills:'💡',Health:'🏥',Entertainment:'🎬',Education:'📚',Investment:'📈',Income:'💰',Other:'📦' }

export default function Dashboard() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const { transactions, getTotalSpent, getTotalIncome, getCategoryBreakdown } = useTransactionStore()
  const { data: market, setData, isStale } = useMarketStore()
  const { city, budget, cityGoldPremium, lifeStage, goal } = useProfileStore()
  const [aiInsight, setAiInsight] = useState('')
  const [insightLoaded, setInsightLoaded] = useState(false)

  const spent = getTotalSpent()
  const income = getTotalIncome()
  const balance = income - spent
  const userBudget = budget || 0
  const recent = transactions.slice(0, 5)
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => { if (isStale()) fetchMarket() }, [])
  useEffect(() => { if (!insightLoaded) generateInsight() }, [])

  async function fetchMarket() {
    try {
      const res = await fetch('/api/market')
      const data = await res.json()
      setData(data)
    } catch {}
  }

  async function generateInsight() {
    const top = getCategoryBreakdown()[0]
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Give me one short personalised financial insight for this month in 1-2 sentences.' }],
          context: { name: userName, city, budget: userBudget, spent, income, topCategory: top?.name, lifeStage, goal, marketData: market }
        })
      })
      const data = await res.json()
      if (data.reply) { setAiInsight(data.reply); setInsightLoaded(true) }
    } catch {
      setAiInsight(spent > 0
        ? `You've spent ₹${spent.toLocaleString('en-IN')} this month. Keep tracking!`
        : 'Add your first transaction to get personalised AI insights.')
      setInsightLoaded(true)
    }
  }

  const budgetPct = userBudget > 0 ? Math.min(100, Math.round((spent / userBudget) * 100)) : 0
  const budgetColor = budgetPct >= 80 ? '#dc2626' : budgetPct >= 60 ? '#f59e0b' : theme.positive

  const tips = [
    { badge: 'FOR YOU', badgeBg: theme.chipBg, badgeColor: theme.chipText, borderColor: theme.accent,
      text: getCategoryBreakdown()[0]
        ? `Top spend: ${getCategoryBreakdown()[0].name} (₹${getCategoryBreakdown()[0].value.toLocaleString('en-IN')}). Small cuts here add up.`
        : 'Start tracking — even small expenses matter over time.' },
    { badge: 'MARKET', badgeBg: '#FEF9EC', badgeColor: '#854F0B', borderColor: '#EF9F27',
      text: market && market.nifty?.value !== 'Updating...'
        ? `Nifty ${market.nifty?.value} (${parseFloat(market.nifty?.change) >= 0 ? '+' : ''}${market.nifty?.change}%). Sensex ${market.sensex?.value}.`
        : 'Fetching live market data...' },
    { badge: 'LEARN', badgeBg: '#ECFDF5', badgeColor: '#065f46', borderColor: '#10b981',
      text: '50-30-20 rule: 50% needs, 30% wants, 20% savings. Great starting point for any income.' },
  ]

  return (
    <div className="screen-enter" style={{ background: theme.bg, minHeight: '100%', paddingBottom: 80 }}>
      <div style={{ background: theme.topbar, borderBottom: `1px solid ${theme.topbarBorder}`,
        padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.textMuted }}>{greeting}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>{userName}</div>
        </div>
        <div onClick={() => navigate('/profile')} style={{ width: 36, height: 36, borderRadius: '50%',
          background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
          {userName[0]?.toUpperCase() || 'U'}
        </div>
      </div>

      {/* Balance card */}
      <div style={{ background: theme.balanceCard, margin: '12px 12px 0', borderRadius: 16, padding: 18 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Total balance</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: -1, marginBottom: 14 }}>
          ₹{balance.toLocaleString('en-IN')}
        </div>
        <div style={{ display: 'flex', gap: 20, marginBottom: userBudget > 0 ? 14 : 0 }}>
          <div><div style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>SPENT</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f87171' }}>₹{spent.toLocaleString('en-IN')}</div></div>
          <div><div style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>INCOME</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#34d399' }}>₹{income.toLocaleString('en-IN')}</div></div>
          {city && <div><div style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>CITY</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{city}</div></div>}
        </div>
        {userBudget > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>BUDGET {budgetPct}% USED</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>₹{(userBudget - spent).toLocaleString('en-IN')} left</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: budgetColor, borderRadius: 4, width: `${budgetPct}%`, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        )}
        {!userBudget && (
          <div onClick={() => navigate('/profile')} style={{ marginTop: 10, fontSize: 11,
            color: 'rgba(255,255,255,0.5)', cursor: 'pointer', textDecoration: 'underline' }}>
            + Set your monthly budget →
          </div>
        )}
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 10, fontStyle: 'italic' }}>
          Your financial life, simplified
        </div>
      </div>

      {/* Nifty & Sensex only */}
      {market && (
        <div style={{ display: 'flex', gap: 8, padding: '10px 12px 0' }}>
          {[
            { label: 'NIFTY 50', v: market.nifty },
            { label: 'SENSEX', v: market.sensex },
          ].map(m => (
            <div key={m.label} style={{ flex: 1, background: theme.chipBg, borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: theme.chipText, marginBottom: 3 }}>{m.label}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: theme.text }}>{m.v?.value || '—'}</div>
              <div style={{ fontSize: 10, marginTop: 2, fontWeight: 700,
                color: parseFloat(m.v?.change) >= 0 ? theme.positive : theme.negative }}>
                {m.v?.change ? (parseFloat(m.v.change) >= 0 ? '▲ +' : '▼ ') + Math.abs(parseFloat(m.v.change)).toFixed(2) + '%' : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Insight */}
      <div style={{ margin: '10px 12px 0', background: theme.aiBg,
        borderLeft: `3px solid ${theme.aiBorder}`, borderRadius: 12, padding: '12px 14px' }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: theme.accent, letterSpacing: '.06em', marginBottom: 5 }}>AI INSIGHT</div>
        <p style={{ fontSize: 12, color: theme.aiText, lineHeight: 1.55, margin: 0 }}>
          {aiInsight || 'Loading your personalised insight...'}
        </p>
      </div>

      {/* Tips strip */}
      <div style={{ padding: '12px 12px 0' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: theme.textMuted, letterSpacing: '.06em', marginBottom: 8 }}>TIPS & INSIGHTS</div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {tips.map((t, i) => (
            <div key={i} style={{ flexShrink: 0, minWidth: 180, maxWidth: 200, background: theme.surface,
              border: `1px solid ${theme.border}`, borderRadius: 14, padding: '12px 13px',
              borderLeft: `3px solid ${t.borderColor}` }}>
              <div style={{ display: 'inline-block', fontSize: 8, fontWeight: 800, padding: '2px 8px',
                borderRadius: 20, background: t.badgeBg, color: t.badgeColor, marginBottom: 7 }}>
                {t.badge}
              </div>
              <p style={{ fontSize: 11, color: theme.text, lineHeight: 1.5, margin: 0 }}>{t.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{ margin: '12px 12px 0', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: theme.text }}>RECENT TRANSACTIONS</div>
          <button onClick={() => navigate('/transactions')} style={{ background: 'none', border: 'none', color: theme.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>See all →</button>
        </div>
        {recent.length === 0 ? (
          <div style={{ padding: '20px 14px', textAlign: 'center', color: theme.textMuted, fontSize: 12 }}>
            No transactions yet — tap + to add your first one.
          </div>
        ) : recent.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderTop: `1px solid ${theme.border}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: theme.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              {catIcons[t.category] || '📦'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{t.note || t.category}</div>
              <div style={{ fontSize: 10, color: theme.textMuted }}>{t.category} · {t.date}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: t.type === 'income' ? theme.positive : theme.negative }}>
              {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <div onClick={() => navigate('/add')} style={{
        position: 'fixed', bottom: 24, right: 24, width: 52, height: 52, borderRadius: '50%',
        background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 100 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="5" y1="12" x2="19" y2="12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  )
}
