// Exact replication of the uploaded Finora green logo
export function FinoraLogoMark({ size = 48, bg = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {bg && <rect width="100" height="100" rx="20" fill="#ffffff"/>}
      <rect x="10" y="62" width="18" height="28" rx="3" fill="#5cb800"/>
      <rect x="32" y="48" width="18" height="42" rx="3" fill="#6dd400"/>
      <rect x="54" y="34" width="18" height="56" rx="3" fill="#7ee800"/>
      <polyline points="14,58 36,42 58,28 80,10" fill="none" stroke="#4aa000" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <polygon points="80,10 68,8 78,20" fill="#4aa000"/>
    </svg>
  )
}

export function FinoraLogoFull({ height = 36 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <FinoraLogoMark size={height} bg={false} />
      <span style={{ fontSize: height * 0.75, fontWeight: 900, color: '#1a1a1a', letterSpacing: -0.5, fontFamily: 'sans-serif' }}>
        FINORA
      </span>
    </div>
  )
}

// Sidebar version — bars only on dark bg
export function FinoraSidebarIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect x="10" y="62" width="18" height="28" rx="3" fill="rgba(255,255,255,0.5)"/>
      <rect x="32" y="48" width="18" height="42" rx="3" fill="rgba(255,255,255,0.7)"/>
      <rect x="54" y="34" width="18" height="56" rx="3" fill="rgba(255,255,255,0.9)"/>
      <polyline points="14,58 36,42 58,28 80,10" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <polygon points="80,10 68,8 78,20" fill="white"/>
    </svg>
  )
}
