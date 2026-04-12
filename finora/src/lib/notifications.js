export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    return reg
  } catch (e) {
    console.log('SW registration failed:', e)
    return null
  }
}

export async function requestPushPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  const result = await Notification.requestPermission()
  return result
}

export async function sendLocalNotification(title, body) {
  if (Notification.permission !== 'granted') return
  try {
    const reg = await navigator.serviceWorker.ready
    reg.showNotification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
    })
  } catch {
    new Notification(title, { body })
  }
}

// Schedule daily insight notification (uses setTimeout, resets on app open)
export function scheduleDailyInsight(insightText) {
  const now = new Date()
  const target = new Date()
  target.setHours(9, 0, 0, 0) // 9am
  if (target <= now) target.setDate(target.getDate() + 1)
  const ms = target - now

  setTimeout(() => {
    sendLocalNotification('Finora Daily Insight 💡', insightText || 'Open Finora to see today\'s financial tip')
  }, Math.min(ms, 2147483647)) // Max setTimeout value
}
