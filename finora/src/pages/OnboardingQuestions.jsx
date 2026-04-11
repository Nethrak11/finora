import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore } from '../store'
import { upsertUserProfile } from '../lib/supabase'

const steps = [
  {
    q: 'What best describes you?',
    key: 'life_stage',
    options: [
      { label: 'Student', icon: '🎓', sub: '16–22 years' },
      { label: 'Young Professional', icon: '💼', sub: 'First job, growing' },
      { label: 'Family', icon: '👨‍👩‍👧', sub: 'Managing household' },
      { label: 'Pre-retirement', icon: '🌅', sub: 'Planning ahead' },
    ]
  },
  {
    q: 'What is your monthly income?',
    key: 'income_range',
    options: [
      { label: 'Under ₹20,000', icon: '💰', sub: 'Getting started' },
      { label: '₹20k – ₹50k', icon: '💰', sub: 'Building up' },
      { label: '₹50k – ₹1L', icon: '💰', sub: 'Growing strong' },
      { label: 'Above ₹1L', icon: '💰', sub: 'High earner' },
    ]
  },
  {
    q: 'What is your main financial goal?',
    key: 'goal',
    options: [
      { label: 'Save more money', icon: '🏦', sub: 'Build my savings' },
      { label: 'Track spending', icon: '📊', sub: 'Know where it goes' },
      { label: 'Invest wisely', icon: '📈', sub: 'Grow my wealth' },
      { label: 'Get debt-free', icon: '✂️', sub: 'Clear my debts' },
    ]
  }
]

export default function OnboardingQuestions() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { user } = useAuthStore()

  const current = steps[step]

  const pick = async (value) => {
    const updated = { ...answers, [current.key]: value }
    setAnswers(updated)

    if (step < steps.length - 1) {
      setStep(s => s + 1)
    } else {
      setLoading(true)
      if (user?.id) {
        await upsertUserProfile({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || '',
          life_stage: updated.life_stage,
          income_range: updated.income_range,
          goal: updated.goal,
        })
      }
      setLoading(false)
      navigate('/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: theme.sidebar, padding: '40px 24px 28px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= step ? theme.accent : 'rgba(255,255,255,0.2)',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>
          Question {step + 1} of {steps.length}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.3 }}>
          {current.q}
        </h2>
      </div>

      <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {current.options.map(opt => (
          <button key={opt.label} onClick={() => pick(opt.label)} disabled={loading}
            style={{
              width: '100%', padding: '16px 18px', background: theme.surface,
              border: `1.5px solid ${theme.border}`, borderRadius: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
              transition: 'all 0.12s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = theme.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}
          >
            <span style={{ fontSize: 28 }}>{opt.icon}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 2 }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: theme.textMuted }}>{opt.sub}</div>
            </div>
            <svg style={{ marginLeft: 'auto' }} width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M6 4l5 5-5 5" stroke={theme.textMuted} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        ))}

        <button onClick={() => navigate('/dashboard')} style={{
          background: 'none', border: 'none', color: theme.textMuted,
          fontSize: 13, cursor: 'pointer', marginTop: 8, padding: 10
        }}>
          Skip for now
        </button>
      </div>
    </div>
  )
}
