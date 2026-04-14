import { useNavigate, useLocation } from 'react-router-dom'
import { useThemeStore } from '../store'
import { FinoraSidebarIcon } from './FinoraLogo'

const navItems = [
  { path: '/dashboard', label: 'Home', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9"/><rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.4"/><rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.4"/><rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.4"/></svg> },
  { path: '/chat', label: 'AI', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1H6l-4 3V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" fill="none"/><circle cx="7" cy="9" r="1" fill="currentColor"/><circle cx="10" cy="9" r="1" fill="currentColor"/><circle cx="13" cy="9" r="1" fill="currentColor"/></svg> },
  { path: '/analytics', label: 'Stats', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="12" width="4" height="6" rx="1" fill="currentColor" opacity="0.5"/><rect x="8" y="8" width="4" height="10" rx="1" fill="currentColor" opacity="0.7"/><rect x="14" y="4" width="4" height="14" rx="1" fill="currentColor" opacity="0.95"/></svg> },
  { path: '/transactions', label: 'History', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="2" rx="1" fill="currentColor" opacity="0.9"/><rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor" opacity="0.6"/><rect x="3" y="14" width="10" height="2" rx="1" fill="currentColor" opacity="0.4"/></svg> },
  { path: '/add', label: 'Add', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4"/><line x1="10" y1="6" x2="10" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="6" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
]
const bottomItems = [
  { path: '/profile', label: 'Profile', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4"/><path d="M3 17c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/></svg> },
  { path: '/settings', label: 'Settings', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  { path: '/about', label: 'About', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4"/><line x1="10" y1="9" x2="10" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="10" cy="6.5" r="1" fill="currentColor"/></svg> },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme } = useThemeStore()

  const Item = ({ path, label, icon }) => {
    const active = location.pathname === path
    return (
      <button onClick={() => navigate(path)} style={{
        width: 48, height: 48, borderRadius: 12, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 3, cursor: 'pointer', border: 'none',
        background: active ? theme.sidebarActive : 'transparent',
        color: active ? '#fff' : 'rgba(255,255,255,0.45)',
        transition: 'all 0.12s',
      }}>
        {icon}
        <span style={{ fontSize: 7.5, fontWeight: active ? 700 : 500 }}>{label}</span>
      </button>
    )
  }

  return (
    <div className="sidebar" style={{ background: theme.sidebar }}>
      <div style={{ width: 42, height: 42, background: '#ffffff', borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, cursor: 'pointer',
        padding: 4 }}
        onClick={() => navigate('/dashboard')}>
        <FinoraSidebarIcon size={34} />
      </div>
      {navItems.map(item => <Item key={item.path} {...item} />)}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {bottomItems.map(item => <Item key={item.path} {...item} />)}
      </div>
    </div>
  )
}
