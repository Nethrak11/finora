import { useThemeStore } from '../store'

const promises = [
  'We will never sell your data to anyone, ever.',
  'We will never show you random ads.',
  'Your money data stays encrypted and private.',
  'AI insights are tailored to you — not generic advice.',
  'Finora will always have a free tier. No paywall for basics.',
  'We are fully transparent about how your data is used.',
  'You can delete your account and all data anytime, instantly.',
]

export default function AboutUs() {
  const { theme } = useThemeStore()
  return (
    <div className="screen-enter" style={{ background: theme.bg, minHeight: '100%', paddingBottom: 32 }}>
      <div style={{ background: theme.sidebar, padding: '36px 20px 28px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: theme.accent, borderRadius: 18,
          margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="42" height="42" viewBox="0 0 62 62" fill="none">
            <rect x="6" y="40" width="12" height="16" rx="2.5" fill="rgba(255,255,255,0.35)"/>
            <rect x="22" y="30" width="12" height="26" rx="2.5" fill="rgba(255,255,255,0.6)"/>
            <rect x="38" y="18" width="12" height="38" rx="2.5" fill="rgba(255,255,255,0.9)"/>
            <line x1="8" y1="38" x2="46" y2="14" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
            <polyline points="38,11 49,12 48,22" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: -0.5 }}>Finora</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 6px', fontStyle: 'italic' }}>
          Because your money deserves intelligence
        </p>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', borderRadius: 20,
          padding: '4px 14px', fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
          Made in India 🇮🇳 · For India
        </div>
      </div>

      <div style={{ padding: '0 12px' }}>
        <SL theme={theme}>WHO WE ARE</SL>
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 16, marginBottom: 4 }}>
          <p style={{ fontSize: 13, color: theme.text, lineHeight: 1.7, margin: 0 }}>
            Finora is built with a vision to make intelligent financial management accessible to every Indian — not just the wealthy. We believe your money deserves the same smart attention that big investors get.
          </p>
        </div>

        <SL theme={theme}>OUR PROMISES TO YOU</SL>
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden' }}>
          {promises.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px',
              borderBottom: i < promises.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.accent, marginTop: 5, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: theme.text, margin: 0, lineHeight: 1.6 }}>{p}</p>
            </div>
          ))}
        </div>

        <SL theme={theme}>OUR TAGLINES</SL>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
          {[
            { text: 'Because your money deserves intelligence', where: 'Splash' },
            { text: 'Your financial life, simplified', where: 'Dashboard' },
            { text: 'Finance that works for you', where: 'Analytics' },
            { text: 'Think money. Think Finora.', where: 'AI Chat' },
          ].map(t => (
            <div key={t.text} style={{ background: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: theme.text, fontStyle: 'italic', flex: 1, marginRight: 12 }}>"{t.text}"</div>
              <div style={{ fontSize: 9, color: theme.textMuted, flexShrink: 0 }}>{t.where}</div>
            </div>
          ))}
        </div>

        <SL theme={theme}>APP INFO</SL>
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden' }}>
          {[
            { label: 'Version', value: '1.0.0 Beta' },
            { label: 'Developer', value: 'Nethra K' },
            { label: 'GitHub', value: 'Nethrak11' },
            { label: 'Contact', value: 'hello@finora.in' },
          ].map((r, i, arr) => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : 'none',
              background: theme.surface }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: theme.text }}>{r.label}</span>
              <span style={{ fontSize: 12, color: theme.textMuted }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SL({ children, theme }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, letterSpacing: '.07em', padding: '14px 4px 6px' }}>{children}</div>
}
