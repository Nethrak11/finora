import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore } from '../store'
import { upsertUserProfile } from '../lib/supabase'

const CITIES = [
  'Chennai','Mumbai','Delhi','Hyderabad','Bangalore','Kolkata','Pune','Ahmedabad',
  'Jaipur','Lucknow','Coimbatore','Kochi','Chandigarh','Bhopal','Surat','Other'
]

// Gold premium over base IBJA rate by city (approximate ₹ per gram)
const CITY_GOLD_PREMIUM = {
  Chennai: 90, Coimbatore: 85, Kochi: 80,
  Mumbai: 45, Pune: 48, Ahmedabad: 42, Surat: 40,
  Delhi: 38, Jaipur: 42, Lucknow: 36, Chandigarh: 35, Bhopal: 34,
  Hyderabad: 55, Bangalore: 58,
  Kolkata: 50, Other: 40
}

const steps = [
  { id: 'name', type: 'text', q: "What's your name?", placeholder: 'Your full name', key: 'name' },
  { id: 'city', type: 'city', q: 'Which city are you in?', sub: 'Gold & silver prices vary by city — we\'ll show you the right rate', key: 'city' },
  {
    id: 'stage', type: 'options', q: 'What best describes you?', key: 'life_stage',
    options: [
      { label: 'Student', icon: '🎓', sub: '16–22 years' },
      { label: 'Young Professional', icon: '💼', sub: 'First job, growing' },
      { label: 'Family', icon: '👨‍👩‍👧', sub: 'Managing household' },
      { label: 'Pre-retirement', icon: '🌅', sub: 'Planning ahead' },
    ]
  },
  {
    id: 'income', type: 'options', q: 'What is your monthly income?', key: 'income_range',
    options: [
      { label: 'Under ₹20,000', icon: '💰', sub: 'Getting started' },
      { label: '₹20k – ₹50k', icon: '💵', sub: 'Building up' },
      { label: '₹50k – ₹1L', icon: '💳', sub: 'Growing strong' },
      { label: 'Above ₹1L', icon: '🏦', sub: 'High earner' },
    ]
  },
  { id: 'budget', type: 'amount', q: 'Set your monthly budget', sub: 'How much do you plan to spend each month?', key: 'monthly_budget', placeholder: 'e.g. 25000' },
  {
    id: 'goal', type: 'options', q: 'What is your main financial goal?', key: 'goal',
    options: [
      { label: 'Save more money', icon: '🏦', sub: 'Build my savings' },
      { label: 'Track spending', icon: '📊', sub: 'Know where it goes' },
      { label: 'Invest wisely', icon: '📈', sub: 'Grow my wealth' },
      { label: 'Get debt-free', icon: '✂️', sub: 'Clear my debts' },
    ]
  },
  {
    id: 'profession', type: 'options', q: 'What is your profession?', key: 'profession',
    options: [
      { label: 'Student', icon: '🎓', sub: '' },
      { label: 'Salaried Employee', icon: '💼', sub: '' },
      { label: 'Business Owner', icon: '🏢', sub: '' },
      { label: 'Freelancer', icon: '💻', sub: '' },
    ]
  },
]

export default function OnboardingQuestions() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [textVal, setTextVal] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { user, setUser } = useAuthStore()

  const current = steps[step]

  const next = async (value) => {
    const updated = { ...answers, [current.key]: value }
    setAnswers(updated)
    setTextVal('')
    setCitySearch('')

    if (step < steps.length - 1) {
      setStep(s => s + 1)
    } else {
      setLoading(true)
      const cityPremium = CITY_GOLD_PREMIUM[updated.city] || 40
      const budgetNum = parseFloat(updated.monthly_budget) || 0
      if (user?.id) {
        await upsertUserProfile({
          id: user.id,
          email: user.email,
          name: updated.name || user.user_metadata?.full_name || '',
          city: updated.city,
          city_gold_premium: cityPremium,
          life_stage: updated.life_stage,
          income_range: updated.income_range,
          monthly_budget: budgetNum,
          goal: updated.goal,
          profession: updated.profession,
        })
      }
      setLoading(false)
      navigate('/notifications')
    }
  }

  const filteredCities = CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))

  const inp = {
    width: '100%', padding: '14px 16px', background: theme.inputBg,
    border: `1.5px solid ${theme.border}`, borderRadius: 12, fontSize: 16,
    color: theme.text, outline: 'none', WebkitAppearance: 'none', boxSizing: 'border-box'
  }

  return (
    <div style={{ minHeight: '100dvh', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: theme.sidebar, padding: '40px 24px 28px' }}>
        <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2,
              background: i <= step ? theme.accent : 'rgba(255,255,255,0.2)', transition: 'background 0.3s' }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>
          {step + 1} of {steps.length}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.3 }}>
          {current.q}
        </h2>
        {current.sub && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '8px 0 0' }}>{current.sub}</p>}
      </div>

      <div style={{ flex: 1, padding: '24px 20px' }}>
        {current.type === 'text' && (
          <>
            <input value={textVal} onChange={e => setTextVal(e.target.value)}
              placeholder={current.placeholder} style={inp}
              onKeyDown={e => e.key === 'Enter' && textVal.trim() && next(textVal.trim())} />
            <button onClick={() => textVal.trim() && next(textVal.trim())}
              style={{ width: '100%', padding: 15, background: theme.accent, color: '#fff',
                border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 12 }}>
              Continue
            </button>
          </>
        )}

        {current.type === 'amount' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 8 }}>Amount in ₹</div>
              <input value={textVal} onChange={e => setTextVal(e.target.value.replace(/\D/g, ''))}
                placeholder="0" type="tel" style={{ ...inp, fontSize: 32, fontWeight: 900, textAlign: 'center', border: 'none', background: 'transparent' }} />
              {textVal && <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 4 }}>
                ₹{parseInt(textVal).toLocaleString('en-IN')} per month
              </div>}
            </div>
            <button onClick={() => textVal && next(textVal)}
              style={{ width: '100%', padding: 15, background: theme.accent, color: '#fff',
                border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
              Set budget
            </button>
          </>
        )}

        {current.type === 'city' && (
          <>
            <input value={citySearch} onChange={e => setCitySearch(e.target.value)}
              placeholder="Search your city..." style={{ ...inp, marginBottom: 12 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
              {filteredCities.map(city => (
                <button key={city} onClick={() => next(city)} style={{
                  width: '100%', padding: '14px 18px', background: theme.surface,
                  border: `1.5px solid ${theme.border}`, borderRadius: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left'
                }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>{city}</span>
                  <span style={{ fontSize: 11, color: theme.textMuted }}>
                    +₹{CITY_GOLD_PREMIUM[city] || 40}/g premium
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {current.type === 'options' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {current.options.map(opt => (
              <button key={opt.label} onClick={() => next(opt.label)} disabled={loading}
                style={{ width: '100%', padding: '16px 18px', background: theme.surface,
                  border: `1.5px solid ${theme.border}`, borderRadius: 16, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
                <span style={{ fontSize: 26 }}>{opt.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>{opt.label}</div>
                  {opt.sub && <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{opt.sub}</div>}
                </div>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M6 4l5 5-5 5" stroke={theme.textMuted} strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            ))}
            <button onClick={() => navigate('/dashboard')} style={{
              background: 'none', border: 'none', color: theme.textMuted,
              fontSize: 13, cursor: 'pointer', padding: 10, marginTop: 4 }}>
              Skip this question
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
