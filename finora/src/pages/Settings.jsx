import { useState } from 'react'
import { useThemeStore } from '../store'
import { THEMES } from '../themes'

const themeOrder = ['soft-cream', 'midnight-pro', 'forest', 'arctic-white', 'golden-hour']

const themePreview = {
  'soft-cream':    { bg: '#1a1007', accent: '#d97706', label: 'Soft Cream' },
  'midnight-pro':  { bg: '#0f0f13', accent: '#8b5cf6', label: 'Midnight Pro' },
  'forest':        { bg: '#14532d', accent: '#16a34a', label: 'Forest' },
  'arctic-white':  { bg: '#0f172a', accent: '#0ea5e9', label: 'Arctic White' },
  'golden-hour':   { bg: '#713f12', accent: '#eab308', label: 'Golden Hour' },
}

function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: 44, height: 26, borderRadius: 13, cursor: 'pointer',
      background: on ? '#16a34a' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0
    }}>
      <div style={{
        position: 'absolute', top: 3,
        left: on ? 21 : 3,
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
      }} />
    </div>
  )
}

function SettingRow({ label, sub, right, border = true, theme }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 16px', borderBottom: border ? `1px solid ${theme.border}` : 'none',
      background: theme.surface }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: theme.text }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  )
}

export default function Settings() {
  const { theme, themeKey, setTheme } = useThemeStore()
  const [notifs, setNotifs] = useState({ ai: true, budget: true, market: false, txn: true, whatsapp: false })
  const [waFreq, setWaFreq] = useState('weekly')

  const toggle = (key) => setNotifs(n => ({ ...n, [key]: !n[key] }))

  const SectionLabel = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, letterSpacing: '.07em',
      padding: '14px 16px 6px' }}>{children}</div>
  )

  return (
    <div className="screen-enter" style={{ background: theme.bg, minHeight: '100%', paddingBottom: 32 }}>
      <div style={{ background: theme.topbar, borderBottom: `1px solid ${theme.topbarBorder}`,
        padding: '12px 16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Settings</div>
      </div>

      {/* Theme picker */}
      <SectionLabel>CHOOSE YOUR THEME</SectionLabel>
      <div style={{ padding: '0 12px 4px', display: 'flex', gap: 10, overflowX: 'auto' }}>
        {themeOrder.map(key => {
          const p = themePreview[key]
          const active = themeKey === key
          return (
            <div key={key} onClick={() => setTheme(key)} style={{
              flexShrink: 0, cursor: 'pointer', textAlign: 'center'
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: p.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: active ? `3px solid ${p.accent}` : '3px solid transparent',
                transition: 'all 0.15s', marginBottom: 5,
                boxShadow: active ? `0 0 0 2px ${p.accent}40` : 'none'
              }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: p.accent }} />
              </div>
              <div style={{ fontSize: 9, fontWeight: active ? 700 : 500,
                color: active ? theme.accent : theme.textMuted, whiteSpace: 'nowrap' }}>
                {p.label}
              </div>
              {active && <div style={{ width: 16, height: 3, background: theme.accent, borderRadius: 2, margin: '3px auto 0' }} />}
            </div>
          )
        })}
      </div>

      {/* Notifications */}
      <SectionLabel>PUSH NOTIFICATIONS</SectionLabel>
      <div style={{ background: theme.surface, borderRadius: 14, overflow: 'hidden',
        border: `1px solid ${theme.border}`, margin: '0 12px' }}>
        <SettingRow label="Daily AI insight" sub="Your personalised tip every morning" right={<Toggle on={notifs.ai} onChange={() => toggle('ai')} />} theme={theme} />
        <SettingRow label="Budget warning" sub="Alert when 80% of budget is used" right={<Toggle on={notifs.budget} onChange={() => toggle('budget')} />} theme={theme} />
        <SettingRow label="Market alerts" sub="Nifty/Sensex ±2% movements" right={<Toggle on={notifs.market} onChange={() => toggle('market')} />} theme={theme} />
        <SettingRow label="Transaction saved" sub="Confirmation after each entry" right={<Toggle on={notifs.txn} onChange={() => toggle('txn')} />} theme={theme} border={false} />
      </div>

      {/* WhatsApp */}
      <SectionLabel>WHATSAPP DIGEST</SectionLabel>
      <div style={{ background: theme.surface, borderRadius: 14, overflow: 'hidden',
        border: `1px solid ${theme.border}`, margin: '0 12px' }}>
        <SettingRow label="Enable WhatsApp bot" sub="Get spending summaries on WhatsApp" right={<Toggle on={notifs.whatsapp} onChange={() => toggle('whatsapp')} />} theme={theme} />
        {notifs.whatsapp && (
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${theme.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, marginBottom: 8 }}>SEND FREQUENCY</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { key: 'daily', label: 'Daily — every morning at 8am' },
                { key: 'weekly', label: 'Weekly — every Monday' },
                { key: 'never', label: 'Never — I\'ll check the app' }
              ].map(opt => (
                <div key={opt.key} onClick={() => setWaFreq(opt.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    border: `1.5px solid ${waFreq === opt.key ? theme.accent : theme.border}`,
                    borderRadius: 10, cursor: 'pointer', background: waFreq === opt.key ? theme.aiBg : theme.surface }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%',
                    border: `2px solid ${waFreq === opt.key ? theme.accent : theme.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {waFreq === opt.key && <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.accent }} />}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: waFreq === opt.key ? 700 : 500, color: theme.text }}>{opt.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Data */}
      <SectionLabel>DATA & PRIVACY</SectionLabel>
      <div style={{ background: theme.surface, borderRadius: 14, overflow: 'hidden',
        border: `1px solid ${theme.border}`, margin: '0 12px' }}>
        <SettingRow label="Export transactions" sub="Download all your data as CSV" right={
          <button style={{ background: 'none', border: 'none', color: theme.accent, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Export</button>
        } theme={theme} />
        <SettingRow label="Privacy Policy" sub="" right={<span style={{ color: theme.textMuted, fontSize: 14 }}>›</span>} theme={theme} />
        <SettingRow label="Delete my account" sub="Permanently remove all data" right={<span style={{ color: '#dc2626', fontSize: 14 }}>›</span>} theme={theme} border={false} />
      </div>

      {/* App info */}
      <SectionLabel>APP INFO</SectionLabel>
      <div style={{ background: theme.surface, borderRadius: 14, overflow: 'hidden',
        border: `1px solid ${theme.border}`, margin: '0 12px' }}>
        <SettingRow label="Version" right={<span style={{ fontSize: 12, color: theme.textMuted }}>1.0.0 Beta</span>} theme={theme} />
        <SettingRow label="Built by" right={<span style={{ fontSize: 12, color: theme.textMuted }}>Nethra K</span>} theme={theme} border={false} />
      </div>
    </div>
  )
}
