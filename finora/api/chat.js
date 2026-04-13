export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  res.setHeader('Access-Control-Allow-Origin', '*')

  const { messages, context } = req.body
  const groqKey = process.env.GROQ_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY

  const niftyVal = context?.marketData?.nifty?.raw || context?.marketData?.nifty?.value || 'not available'
  const sensexVal = context?.marketData?.sensex?.raw || context?.marketData?.sensex?.value || 'not available'
  const niftyChg = context?.marketData?.nifty?.change || ''
  const sensexChg = context?.marketData?.sensex?.change || ''

  const systemPrompt = `You are Finora AI — a smart, warm, practical personal finance assistant for Indian users.

USER PROFILE:
- Name: ${context?.name || 'there'}
- City: ${context?.city || 'India'}
- Monthly budget (spending limit): ₹${context?.budget || 'not set yet'}
- This month spent: ₹${context?.spent || 0}
- This month income: ₹${context?.income || 0}
- Budget remaining: ₹${context?.budget ? (context.budget - (context?.spent || 0)) : 'N/A'}
- Life stage: ${context?.lifeStage || 'not set'}
- Financial goal: ${context?.goal || 'not set'}
- Top spending category: ${context?.topCategory || 'none yet'}

LIVE MARKET (today's actual data):
- Nifty 50: ${niftyVal} (${niftyChg}% change today)
- Sensex: ${sensexVal} (${sensexChg}% change today)

IMPORTANT RULES:
1. Use the user's ACTUAL numbers above — never say "I don't have access to your data"
2. When asked about Nifty/Sensex — quote the exact numbers above
3. Keep answers short — 2-4 sentences max unless asked for detail
4. Use ₹ for all currency
5. CRITICAL: You CANNOT add transactions or modify data. If user asks you to "add expense" or "record a transaction", tell them: "I can't add transactions directly — please use the + button in the sidebar or tap Add in the menu. I can help you with any questions about your finances though!"
6. Only suggest "consult a financial advisor" for investment decisions above ₹5 lakhs — not for basic questions
7. Be warm, specific, and actionable`

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 500,
    temperature: 0.7,
    stream: false
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000)
    })

    if (groqRes.ok) {
      const data = await groqRes.json()
      return res.status(200).json({ reply: data.choices[0].message.content, source: 'groq' })
    }
  } catch {}

  // Gemini fallback
  try {
    const lastMsg = messages[messages.length - 1]?.content || ''
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + '\n\nUser: ' + lastMsg }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        }),
        signal: AbortSignal.timeout(15000)
      }
    )
    if (geminiRes.ok) {
      const gd = await geminiRes.json()
      const reply = gd.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble connecting. Please try again."
      return res.status(200).json({ reply, source: 'gemini' })
    }
  } catch {}

  return res.status(200).json({ reply: "I'm having trouble connecting right now. Please check your internet and try again.", source: 'error' })
}
