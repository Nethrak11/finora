export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate')

  // City gold premium passed from frontend (default 40)
  const cityPremium = parseInt(req.query.cityPremium || '40')

  try {
    const symbols = ['^NSEI', '^BSESN', 'GC=F', 'SI=F']
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const json = await response.json()
    const quotes = json.quoteResponse?.result || []
    const find = (sym) => quotes.find(q => q.symbol === sym)

    const nifty = find('^NSEI')
    const sensex = find('^BSESN')
    const gold = find('GC=F')
    const silver = find('SI=F')

    // USD per troy oz → INR per gram
    const usdInr = 83.5
    const ozToGram = 31.1035

    const goldUsd = gold?.regularMarketPrice || 2320
    const silverUsd = silver?.regularMarketPrice || 27.5
    const goldBase = (goldUsd * usdInr) / ozToGram
    const silverBase = (silverUsd * usdInr) / ozToGram

    // Apply city-specific premium + 3% GST
    const goldFinal = (goldBase + cityPremium) * 1.03
    const silverFinal = silverBase * 1.03

    return res.status(200).json({
      nifty: {
        value: nifty?.regularMarketPrice ? Math.round(nifty.regularMarketPrice).toLocaleString('en-IN') : '22,415',
        change: nifty?.regularMarketChangePercent ? parseFloat(nifty.regularMarketChangePercent).toFixed(2) : '0.80',
        raw: nifty?.regularMarketPrice || 22415
      },
      sensex: {
        value: sensex?.regularMarketPrice ? Math.round(sensex.regularMarketPrice).toLocaleString('en-IN') : '73,961',
        change: sensex?.regularMarketChangePercent ? parseFloat(sensex.regularMarketChangePercent).toFixed(2) : '0.60',
        raw: sensex?.regularMarketPrice || 73961
      },
      gold: {
        value: Math.round(goldFinal).toLocaleString('en-IN'),
        change: gold?.regularMarketChangePercent ? parseFloat(gold.regularMarketChangePercent).toFixed(2) : '-0.20',
        raw: Math.round(goldFinal)
      },
      silver: {
        value: Math.round(silverFinal).toLocaleString('en-IN'),
        change: silver?.regularMarketChangePercent ? parseFloat(silver.regularMarketChangePercent).toFixed(2) : '1.10',
        raw: Math.round(silverFinal)
      },
      timestamp: Date.now()
    })
  } catch (e) {
    const goldFallback = (7240 + cityPremium) * 1.03
    return res.status(200).json({
      nifty: { value: '22,415', change: '0.80', raw: 22415 },
      sensex: { value: '73,961', change: '0.60', raw: 73961 },
      gold: { value: Math.round(goldFallback).toLocaleString('en-IN'), change: '-0.20', raw: Math.round(goldFallback) },
      silver: { value: '89', change: '1.10', raw: 89 },
      timestamp: Date.now(), fallback: true
    })
  }
}
