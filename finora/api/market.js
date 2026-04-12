export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')

  try {
    // Yahoo Finance — reliable for NSE indices
    const symbols = ['^NSEI', '^BSESN']
    const url = `https://query1.finance.yahoo.com/v8/finance/quote?symbols=${symbols.join(',')}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketChange`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    })
    
    if (!response.ok) throw new Error(`Yahoo Finance error: ${response.status}`)
    
    const json = await response.json()
    const result = json.quoteResponse?.result || []
    
    const niftyData = result.find(q => q.symbol === '^NSEI')
    const sensexData = result.find(q => q.symbol === '^BSESN')

    const fmt = (n) => n ? Math.round(n).toLocaleString('en-IN') : null
    const fmtChg = (n) => n ? parseFloat(n).toFixed(2) : '0.00'

    if (!niftyData && !sensexData) throw new Error('No data returned')

    return res.status(200).json({
      nifty: {
        value: fmt(niftyData?.regularMarketPrice) || '—',
        change: fmtChg(niftyData?.regularMarketChangePercent),
        raw: niftyData?.regularMarketPrice || 0,
        pointChange: fmtChg(niftyData?.regularMarketChange)
      },
      sensex: {
        value: fmt(sensexData?.regularMarketPrice) || '—',
        change: fmtChg(sensexData?.regularMarketChangePercent),
        raw: sensexData?.regularMarketPrice || 0,
        pointChange: fmtChg(sensexData?.regularMarketChange)
      },
      timestamp: Date.now(),
      source: 'yahoo-finance'
    })
  } catch (err) {
    // Try alternate Yahoo endpoint
    try {
      const res2 = await fetch(
        'https://query2.finance.yahoo.com/v7/finance/quote?symbols=%5ENSES,%5EBSESN&lang=en-US',
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      )
      const j2 = await res2.json()
      const r2 = j2.quoteResponse?.result || []
      const n2 = r2[0], s2 = r2[1]
      
      if (n2 || s2) {
        return res.status(200).json({
          nifty: { value: n2 ? Math.round(n2.regularMarketPrice).toLocaleString('en-IN') : '—', change: n2 ? n2.regularMarketChangePercent.toFixed(2) : '0', raw: n2?.regularMarketPrice || 0 },
          sensex: { value: s2 ? Math.round(s2.regularMarketPrice).toLocaleString('en-IN') : '—', change: s2 ? s2.regularMarketChangePercent.toFixed(2) : '0', raw: s2?.regularMarketPrice || 0 },
          timestamp: Date.now(), source: 'yahoo-v2'
        })
      }
    } catch {}

    // Final fallback with clear indication it's stale
    return res.status(200).json({
      nifty: { value: 'Updating...', change: '0.00', raw: 0 },
      sensex: { value: 'Updating...', change: '0.00', raw: 0 },
      timestamp: Date.now(),
      fallback: true,
      error: err.message
    })
  }
}
