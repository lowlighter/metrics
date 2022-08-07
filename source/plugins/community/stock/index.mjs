//Setup
export default async function({login, q, imports, data, account}, {enabled = false, extras = false, token} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.stock) || (!imports.metadata.plugins.stock.extras("enabled", {extras})))
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
    const {data: {quoteType: {shortName: company}}} = await imports.axios.get("https://yh-finance.p.rapidapi.com/stock/v2/get-profile", {
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
    const chart = await imports.chartist("line", {
      width: 480 * (1 + data.large),
      height: 160,
      showPoint: false,
      axisX: {showGrid: false, labelInterpolationFnc: (value, index) => index % Math.floor(close.length / 4) === 0 ? value : null},
      axisY: {scaleMinSpace: 20},
      showArea: true,
    }, {
      labels: timestamp.map(timestamp => new Intl.DateTimeFormat("en-GB", {month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"}).format(new Date(timestamp * 1000))),
      series: [close],
    })

    //Results
    return {chart, currency, price, previous, delta: price - previous, symbol, company, interval, duration}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
