export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  res.setHeader('Access-Control-Allow-Origin', '*')

  const { image } = req.body
  if (!image) return res.status(400).json({ error: 'No image provided' })

  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) return res.status(500).json({ error: 'Gemini key not configured' })

  try {
    // Clean base64 — remove data URL prefix if present
    const base64Data = image.includes(',') ? image.split(',')[1] : image
    const mimeMatch = image.match(/data:([^;]+);/)
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'

    const prompt = `You are reading a financial document — a receipt, bill, bank SMS, or payment screenshot.

Extract these fields:
1. Total amount paid (number only, no currency symbol, no commas)
2. Merchant/sender name (short — e.g. "Swiggy", "HDFC Bank", "Amazon")
3. Best category from ONLY these options: Food, Transport, Shopping, Bills, Health, Entertainment, Education, Investment, Income, Other

For bank SMS: look for "debited", "credited", "transferred", "paid" keywords and the amount after "Rs." or "INR".
For receipts: look for "Total", "Amount", "Grand Total".
For UPI/PhonePe/GPay screenshots: look for the transfer amount.

Reply ONLY with valid JSON, no explanation, no markdown fences:
{"amount": 480, "merchant": "Swiggy", "category": "Food"}

If you absolutely cannot find an amount, use null.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mimeType, data: base64Data } },
              { text: prompt }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 300 }
        })
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini error:', err)
      return res.status(200).json({ amount: null, merchant: '', category: 'Other', error: 'Vision API error' })
    }

    const data = await response.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // Clean and parse JSON — handle various formats
    const cleaned = rawText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{]*({.*})[^}]*$/s, '$1')
      .trim()

    const parsed = JSON.parse(cleaned)
    const amount = parsed.amount ? parseFloat(String(parsed.amount).replace(/[^0-9.]/g, '')) : null

    return res.status(200).json({
      amount: isNaN(amount) ? null : amount,
      merchant: parsed.merchant || '',
      category: parsed.category || 'Other'
    })
  } catch (err) {
    console.error('Scan error:', err.message)
    return res.status(200).json({ amount: null, merchant: '', category: 'Other', error: err.message })
  }
}
