export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { image } = req.body
  if (!image) return res.status(400).json({ error: 'No image provided' })

  const geminiKey = process.env.GEMINI_API_KEY

  try {
    // Extract base64 data from data URL
    const base64Data = image.includes(',') ? image.split(',')[1] : image
    const mimeType = image.includes('data:') ? image.split(';')[0].split(':')[1] : 'image/jpeg'

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              },
              {
                text: `Look at this image of a bill, receipt, or payment screenshot. Extract:
1. Total amount paid (number only, no currency symbol)
2. Merchant or vendor name (short name like "Swiggy" not full address)
3. Best category from: Food, Transport, Shopping, Bills, Health, Entertainment, Education, Investment, Other

Reply ONLY with valid JSON, no markdown, no explanation:
{"amount": 480, "merchant": "Swiggy", "category": "Food"}

If you cannot read the amount clearly, use null for amount.`
              }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 200 }
        })
      }
    )

    if (!response.ok) throw new Error(`Gemini error: ${response.status}`)

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return res.status(200).json({
      amount: parsed.amount || null,
      merchant: parsed.merchant || '',
      category: parsed.category || 'Other'
    })
  } catch (err) {
    return res.status(200).json({ amount: null, merchant: '', category: 'Other', error: err.message })
  }
}
