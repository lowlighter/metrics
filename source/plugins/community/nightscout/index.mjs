//Setup
export default async function({q, imports, data, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.nightscout) || (!imports.metadata.plugins.nightscout.extras("enabled", {extras})))
      return null

    //Load inputs
    let {url, datapoints, lowalert, highalert, urgentlowalert, urgenthighalert} = imports.metadata.plugins.nightscout.inputs({data, account, q})

    if (!url || url === "https://example.herokuapp.com")
      throw {error: {message: "Nightscout URL is not set"}}
    if (url.substring(url.length - 1) !== "/")
      url += "/"
    if (url.substring(0, 7) === "http://")
      url = `https://${url.substring(7)}`
    if (url.substring(0, 8) !== "https://")
      url = `https://${url}`
    if (datapoints <= 0)
      datapoints = 1
    //Get nightscout data from axios
    const resp = await imports.axios.get(`${url}api/v1/entries.json?count=${datapoints}`)
    for (let i = 0; i < resp.data.length; i++) {
      const {sgv} = resp.data[i]
      //Add human readable timestamps and arrows
      const date = new Date(resp.data[i].dateString)
      resp.data[i].arrowHumanReadable = directionArrow(resp.data[i].direction)
      resp.data[i].timeUTCHumanReadable = `${addZero(date.getUTCHours())}:${addZero(date.getUTCMinutes())}`
      /*
           * Add colors and alert names
           * TODO: Maybe make colors better themed instead of just the "github style" - red and yellow could fit better than darker shades of green
           */
      let color = "#40c463"
      let alertName = "Normal"
      if (sgv >= urgenthighalert || sgv <= urgentlowalert) {
        color = "#216e39"
        alertName = sgv >= urgenthighalert ? "Urgent High" : "Urgent Low"
      }
      else if (sgv >= highalert || sgv <= lowalert) {
        color = "#30a14e"
        alertName = sgv >= highalert ? "High" : "Low"
      }
      resp.data[i].color = color
      resp.data[i].alert = alertName
    }
    return {data: resp.data.reverse()}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}

function addZero(i) {
  if (i < 10)
    i = `0${i}`

  return i
}

function directionArrow(direction) {
  const dir = direction.toUpperCase()
  switch (dir) {
    case "NONE":
      return ""
    case "DOUBLEUP":
      return "↑↑"
    case "SINGLEUP":
      return "↑"
    case "FORTYFIVEUP":
      return "↗"
    case "FLAT":
      return "→"
    case "FORTYFIVEDOWN":
      return "↘"
    case "SINGLEDOWN":
      return "↓"
    case "DOUBLEDOWN":
      return "↓↓"
    case "NOT COMPUTABLE":
      return ""
    case "RATE OUT OF RANGE":
      return ""
    default:
      return ""
  }
}
