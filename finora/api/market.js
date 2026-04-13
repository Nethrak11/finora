export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Try multiple endpoints for reliability
  const endpoints = [
    `https://query1.finance.yahoo.com/v8/finance/quote?symbols=%5ENSES,%5EBSESN`,
    `https://query2.finance.yahoo.com/v8/finance/quote?symbols=%5ENSES,%5EBSESN`,
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5ENSES,%5EBSESN`,
  ]

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://finance.yahoo.com',
          'Origin': 'https://finance.yahoo.com'
        },
        signal: AbortSignal.timeout(8000)
      })

      if (!response.ok) continue

      const json = await response.json()
      const results = json.quoteResponse?.result || []

      if (!results.length) continue

      const nifty = results.find(q => q.symbol === '^NSEI') || results[0]
      const sensex = results.find(q => q.symbol === '^BSESN') || results[1]

      const fmt = (n) => n ? Math.round(n).toLocaleString('en-IN') : null
      const fmtChg = (n) => n != null ? parseFloat(n).toFixed(2) : '0.00'

      const nVal = fmt(nifty?.regularMarketPrice)
      const sVal = fmt(sensex?.regularMarketPrice)

      if (!nVal && !sVal) continue

      return res.status(200).json({
        nifty: {
          value: nVal || '22,415',
          change: fmtChg(nifty?.regularMarketChangePercent),
          raw: Math.round(nifty?.regularMarketPrice || 22415)
        },
        sensex: {
          value: sVal || '73,961',
          change: fmtChg(sensex?.regularMarketChangePercent),
          raw: Math.round(sensex?.regularMarketPrice || 73961)
        },
        timestamp: Date.now(),
        source: url.includes('query1') ? 'yahoo-q1' : 'yahoo-q2'
      })
    } catch (e) {
      continue
    }
  }

  // All endpoints failed — try NSE direct
  try {
    const nseRes = await fetch('https://www.nseindia.com/api/allIndices', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*',
        'Referer': 'https://www.nseindia.com',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': ''
      },
      signal: AbortSignal.timeout(6000)
    })
    if (nseRes.ok) {
      const nseData = await nseRes.json()
      const indices = nseData.data || []
      const nifty50 = indices.find(i => i.indexSymbol === 'NIFTY 50')
      const sensex = indices.find(i => i.indexSymbol === 'SENSEX')
      if (nifty50 || sensex) {
        return res.status(200).json({
          nifty: {
            value: nifty50 ? Math.round(nifty50.last).toLocaleString('en-IN') : '22,415',
            change: nifty50 ? parseFloat(nifty50.percentChange).toFixed(2) : '0.00',
            raw: Math.round(nifty50?.last || 22415)
          },
          sensex: {
            value: sensex ? Math.round(sensex.last).toLocaleString('en-IN') : '73,961',
            change: sensex ? parseFloat(sensex.percentChange).toFixed(2) : '0.00',
            raw: Math.round(sensex?.last || 73961)
          },
          timestamp: Date.now(),
          source: 'nse-direct'
        })
      }
    }
  } catch {}

  // Static fallback with clear flag
  return res.status(200).json({
    nifty: { value: '22,415', change: '0.00', raw: 22415 },
    sensex: { value: '73,961', change: '0.00', raw: 73961 },
    timestamp: Date.now(),
    fallback: true,
    note: 'Market data temporarily unavailable'
  })
}
