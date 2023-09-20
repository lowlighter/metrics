//Setup
export default async function({login, q, imports, data, account}, {enabled = false, extras = false, token} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q.stock) || (!imports.metadata.plugins.stock.enabled(enabled, {extras})))
      return null

    //Load inputs
    let {symbol, interval, duration} = imports.metadata.plugins.stock.inputs({data, account, q})
    if (!token)
      throw {error: {message: "API token is not set"}}
    if (!symbol)
      throw {error: {message: "Company stock symbol is not set"}}
    symbol = symbol.toLocaleUpperCase()

    //Query API for company informations
    console.debug(`metrics/compute/${login}/plugins > stock > querying api for company`)
    const {data: {quoteType: {shortName: company} = {shortName: symbol}}} = await imports.axios.get("https://yh-finance.p.rapidapi.com/stock/v2/get-profile", {
      params: {symbol, region: "US"},
      headers: {"x-rapidapi-key": token},
    })

    //Query API for stock charts
    console.debug(`metrics/compute/${login}/plugins > stock > querying api for stock`)
    const {data: {chart: {result: [{meta, timestamp, indicators: {quote: [{close}]}}]}}} = await imports.axios.get("https://yh-finance.p.rapidapi.com/stock/v2/get-chart", {
      params: {interval, symbol, range: duration, region: "US"},
      headers: {"x-rapidapi-key": token},
    })
    const {currency, regularMarketPrice: price, previousClose: previous} = meta

    //Generating chart
    console.debug(`metrics/compute/${login}/plugins > stock > generating chart`)
    const chart = imports.Graph.timeline(close.map((y, i) => ({x: new Date(timestamp[i] * 1000), y})), {low: Math.min(...close), high: Math.max(...close), points: false, text: false, width: 480 * (1 + data.large), height: 200})

    //Results
    return {chart, currency, price, previous, delta: price - previous, symbol, company, interval, duration}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
