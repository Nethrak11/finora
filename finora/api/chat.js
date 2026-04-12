export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { messages, context } = req.body
  const groqKey = process.env.GROQ_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY

  // Extract raw values from market data objects safely
  const niftyVal = context?.marketData?.nifty?.raw || context?.marketData?.nifty?.value || 'not available'
  const sensexVal = context?.marketData?.sensex?.raw || context?.marketData?.sensex?.value || 'not available'
  const goldVal = context?.marketData?.gold?.raw || context?.marketData?.gold?.value || 'not available'
  const silverVal = context?.marketData?.silver?.raw || context?.marketData?.silver?.value || 'not available'
  const niftyChange = context?.marketData?.nifty?.change || ''
  const sensexChange = context?.marketData?.sensex?.change || ''

  const systemPrompt = `You are Finora AI — a smart, warm, and direct personal finance assistant for Indian users.

USER PROFILE:
- Name: ${context?.name || 'there'}
- City: ${context?.city || 'India'}
- Monthly budget: ₹${context?.budget || 'not set'}
- This month spent: ₹${context?.spent || 0}
- This month income: ₹${context?.income || 0}
- Life stage: ${context?.lifeStage || 'not set'}
- Goal: ${context?.goal || 'not set'}
- Top spending category: ${context?.topCategory || 'none yet'}

LIVE MARKET DATA (today):
- Nifty 50: ${niftyVal} (${niftyChange}% today)
- Sensex: ${sensexVal} (${sensexChange}% today)
- Gold: ₹${goldVal} per gram (in ${context?.city || 'their city'})
- Silver: ₹${silverVal} per gram

RULES:
1. Be specific — use the user's actual numbers above, never say "data not available" if you have it
2. Keep answers short and clear — 2-4 sentences max unless they ask for detail
3. Use ₹ for all amounts
4. Only say "consult a financial advisor" for questions about specific stock picks, legal tax advice, or major investment decisions above ₹5L — not for basic questions
5. When asked about Nifty/Sensex/Gold/Silver — quote the exact numbers from the market data above
6. Be encouraging and practical — give actionable advice
7. If budget is not set, gently remind them to set it in their profile`

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
      body: JSON.stringify(payload)
    })

    if (groqRes.ok) {
      const data = await groqRes.json()
      return res.status(200).json({ reply: data.choices[0].message.content, source: 'groq' })
    }

    // Gemini fallback
    const lastMsg = messages[messages.length - 1]?.content || ''
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt + '\n\nUser asks: ' + lastMsg }] }] })
      }
    )
    const gemData = await geminiRes.json()
    const reply = gemData.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble right now. Please try again."
    return res.status(200).json({ reply, source: 'gemini' })

  } catch (err) {
    return res.status(500).json({ reply: "Connection issue. Please check your internet and try again.", error: err.message })
  }
}
