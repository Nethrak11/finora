export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { messages, context } = req.body

  const groqKey = process.env.GROQ_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY

  const systemPrompt = `You are Finora AI — a warm, intelligent personal finance assistant for Indian users.
${context?.name ? `The user's name is ${context.name}.` : ''}
${context?.budget ? `Monthly budget: ₹${context.budget}.` : ''}
${context?.spent ? `This month spent: ₹${context.spent}.` : ''}
${context?.income ? `This month income: ₹${context.income}.` : ''}
${context?.topCategory ? `Top spending category: ${context.topCategory}.` : ''}
${context?.marketData ? `Live market: Nifty ${context.marketData.nifty}, Sensex ${context.marketData.sensex}, Gold ₹${context.marketData.gold}/g, Silver ₹${context.marketData.silver}/g.` : ''}

Rules:
- Be specific using the user's actual numbers
- Keep answers concise and clear
- For investments, always say "consult a financial advisor for major decisions"
- Respond in warm, friendly English
- Use ₹ for currency always
- If asked about spending, reference the user's actual data above`

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 400,
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
      return res.status(200).json({ reply: data.choices[0].message.content })
    }

    // Fallback to Gemini
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + '\n\nUser: ' + messages[messages.length - 1].content }] }]
        })
      }
    )
    const gemData = await geminiRes.json()
    const reply = gemData.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble connecting right now. Please try again."
    return res.status(200).json({ reply })

  } catch (err) {
    return res.status(500).json({ error: 'AI unavailable', reply: "I'm having trouble connecting. Please try again in a moment." })
  }
}
