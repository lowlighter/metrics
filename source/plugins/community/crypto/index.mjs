//Setup
export default async function({login, q, imports, data, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q.crypto) || (!imports.metadata.plugins.crypto.enabled(enabled, {extras})))
      return null

    //Load inputs
    let {id, days, vs_currency, precision} = imports.metadata.plugins.crypto.inputs({data, account, q})
    if (!id)
      throw {error: {message: "Crypto currency id is not set"}}

    console.debug(`metrics/compute/${login}/plugins > crypto > querying api for crypto`)

    const {
      data: coin,
    } = await imports.axios.get(`https://api.coingecko.com/api/v3/coins/${id}`, {
      params: {
        market_data: true,
      },
    })

    if (!coin)
      throw {error: {message: "Crypto currency not found"}}

    const {
      data: {prices},
    } = await imports.axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
      params: {
        vs_currency,
        days,
        precision,
      },
    })

    const chart = imports.Graph.timeline(
      prices.map((y, _) => ({x: new Date(y[0]), y: y[1]})),
      {
        low: Math.min(...prices.map((y, _) => y[1])),

        high: Math.max(...prices.map((y, _) => y[1])),

        points: false,
        text: false,
        width: 480 * (1 + data.large),
        height: 200,
      },
    )

    //Results
    return {
      chart,
      id,
      precision,
      days: {"1": "Today", "14": "2 Weeks", "30": "1 Month", max: "All-time"}[days],
      symbol: coin.symbol,
      name: coin.name,
      current_price: coin.market_data.current_price[vs_currency],
      price_change_percentage_24h: coin.market_data.price_change_percentage_24h,
      vs_currency,
      logo: coin.image.small,
    }
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
