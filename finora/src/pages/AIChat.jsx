import { useState, useRef, useEffect } from 'react'
import { useThemeStore, useAuthStore, useTransactionStore, useMarketStore, useChatStore, useProfileStore } from '../store'

export default function AIChat() {
  const [input, setInput] = useState('')
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const { messages, loading, addMessage, setLoading, clearChat } = useChatStore()
  const { getTotalSpent, getTotalIncome, getCategoryBreakdown } = useTransactionStore()
  const { data: market } = useMarketStore()
  const profile = useProfileStore()
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const firstName = profile.name || user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  const context = {
    name: firstName,
    city: profile.city || 'India',
    budget: profile.budget || 0,
    spent: getTotalSpent(),
    income: getTotalIncome(),
    topCategory: getCategoryBreakdown()[0]?.name,
    lifeStage: profile.lifeStage,
    goal: profile.goal,
    marketData: market
  }

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    addMessage(userMsg)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg], context })
      })
      const data = await res.json()
      addMessage({ role: 'assistant', content: data.reply || 'Sorry, could not get a response. Please try again.' })
    } catch {
      addMessage({ role: 'assistant', content: "Connection issue. Please check your internet and try again." })
    }
    setLoading(false)
  }

  const suggestions = [
    `What is Nifty at today?`,
    'How much have I spent this month?',
    'Am I saving enough based on my budget?',
    'What is my biggest expense category?',
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg }}>
      {/* Header */}
      <div style={{ background: theme.topbar, borderBottom: `1px solid ${theme.topbarBorder}`,
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, background: theme.accent, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="1.4"/>
            <path d="M6 9L8 11L12 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: theme.text }}>Finora AI</div>
          <div style={{ fontSize: 10, color: theme.textMuted, fontStyle: 'italic' }}>Think money. Think Finora.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontSize: 10, color: theme.textMuted }}>Live</span>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} style={{ background: 'none', border: 'none', color: theme.textMuted,
            fontSize: 11, cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}>
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
              <p style={{ fontSize: 15, color: theme.text, fontWeight: 800, margin: '0 0 8px' }}>
                Hi {firstName}!
              </p>
              <p style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.6, margin: 0 }}>
                I know your spending, budget, and today's market data. Ask me anything about your money.
              </p>
              <div style={{ marginTop: 10, fontSize: 11, color: theme.textMuted, background: theme.aiBg,
                borderRadius: 10, padding: '8px 12px', textAlign: 'left' }}>
                Note: To add a transaction, use the + button in the sidebar. I can answer questions but cannot modify your data.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => setInput(s)} style={{
                  padding: '11px 14px', background: theme.surface, border: `1px solid ${theme.border}`,
                  borderRadius: 12, fontSize: 12, color: theme.text, textAlign: 'left', cursor: 'pointer', fontWeight: 500
                }}>{s}</button>
              ))}
            </div>
          </div>
        ) : messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '86%', padding: '10px 13px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? theme.accent : theme.surface,
              border: msg.role === 'assistant' ? `1px solid ${theme.border}` : 'none',
              fontSize: 13, color: msg.role === 'user' ? '#fff' : theme.text, lineHeight: 1.6
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex' }}>
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: '16px 16px 16px 4px', padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0,1,2].map(i => <div key={i} className="typing-dot" style={{ background: theme.accent }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', background: theme.topbar, borderTop: `1px solid ${theme.topbarBorder}`,
        display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about your money..."
          style={{ flex: 1, padding: '11px 16px', background: theme.inputBg,
            border: `1.5px solid ${theme.border}`, borderRadius: 24, fontSize: 13,
            color: theme.text, outline: 'none', WebkitAppearance: 'none' }} />
        <button onClick={send} disabled={loading || !input.trim()} style={{
          width: 40, height: 40, borderRadius: '50%', background: theme.accent, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          flexShrink: 0, opacity: (!input.trim() || loading) ? 0.5 : 1 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8L14 8M10 4L14 8L10 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
