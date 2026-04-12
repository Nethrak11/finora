export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { token, title, body, data } = req.body
  const fcmKey = process.env.FCM_SERVER_KEY

  if (!fcmKey) return res.status(200).json({ ok: false, reason: 'FCM not configured' })
  if (!token) return res.status(400).json({ error: 'No FCM token' })

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${fcmKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: token,
        notification: { title, body, icon: '/favicon.svg', badge: '/favicon.svg' },
        data: data || {}
      })
    })
    const result = await response.json()
    return res.status(200).json({ ok: true, result })
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message })
  }
}
