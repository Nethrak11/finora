export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate')

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

    // Correct: USD per troy oz → INR per gram (1 troy oz = 31.1035g, USD/INR ≈ 83.5)
    const usdInr = 83.5
    const ozToGram = 31.1035
    const goldInr = ((gold?.regularMarketPrice || 2320) * usdInr) / ozToGram
    const silverInr = ((silver?.regularMarketPrice || 27.5) * usdInr) / ozToGram

    return res.status(200).json({
      nifty: { value: nifty?.regularMarketPrice ? Math.round(nifty.regularMarketPrice).toLocaleString('en-IN') : '22,415', change: (nifty?.regularMarketChangePercent || 0.8).toFixed(2) },
      sensex: { value: sensex?.regularMarketPrice ? Math.round(sensex.regularMarketPrice).toLocaleString('en-IN') : '73,961', change: (sensex?.regularMarketChangePercent || 0.6).toFixed(2) },
      gold: { value: Math.round(goldInr).toLocaleString('en-IN'), change: (gold?.regularMarketChangePercent || -0.2).toFixed(2) },
      silver: { value: Math.round(silverInr).toLocaleString('en-IN'), change: (silver?.regularMarketChangePercent || 1.1).toFixed(2) },
      timestamp: Date.now()
    })
  } catch {
    return res.status(200).json({
      nifty: { value: '22,415', change: '0.8' }, sensex: { value: '73,961', change: '0.6' },
      gold: { value: '7,350', change: '-0.2' }, silver: { value: '88', change: '1.1' },
      timestamp: Date.now(), fallback: true
    })
  }
}
