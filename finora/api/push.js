export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { subscription, title, body, url } = req.body

  // Using Web Push via VAPID
  // For now we send directly - in production use web-push npm package
  try {
    // Store subscription in Supabase via direct fetch
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY

    if (supabaseKey && subscription) {
      await fetch(`${supabaseUrl}/rest/v1/push_subscriptions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ subscription: JSON.stringify(subscription), created_at: new Date().toISOString() })
      })
    }

    return res.status(200).json({ ok: true, message: 'Push subscription saved' })
  } catch (err) {
    return res.status(200).json({ ok: false, message: err.message })
  }
}
