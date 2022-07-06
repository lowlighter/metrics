//Setup
export default async function({login, q, data, imports, graphql, queries, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.calendar) || (!imports.metadata.plugins.calendar.extras("enabled", {extras})))
      return null

    //Load inputs
    let {limit} = imports.metadata.plugins.calendar.inputs({data, account, q})

    //Compute boundaries
    const registration = new Date(data.user.createdAt)
    const end = new Date().getFullYear()
    const start = (limit > 0 ? new Date(end - limit + 1, 0) : limit < 0 ? new Date(new Date(registration).setFullYear(registration.getFullYear() + limit)) : registration).getFullYear()

    //Load contribution calendar
    console.debug(`metrics/compute/${login}/plugins > calendar > processing years ${start} to ${end}`)
    const calendar = {years: []}
    for (let year = start; year <= end; year++) {
      console.debug(`metrics/compute/${login}/plugins > calendar > processing year ${year}`)
      const weeks = []
      const newyear = new Date(year, 0, 1)
      const endyear = (year === end) ? new Date() : new Date(year, 11, 31)
      for (let from = new Date(newyear); from < endyear;) {
        //Set date range and ensure we start on sundays
        let to = new Date(from)
        to.setUTCHours(+4 * 7 * 24)
        if (to.getUTCDay())
          to.setUTCHours(-to.getUTCDay() * 24)
        if (to > endyear)
          to = endyear

        //Ensure that date ranges are not overlapping by setting it to previous day at 23:59:59.999
        const dto = new Date(to)
        dto.setUTCHours(-1)
        dto.setUTCMinutes(59)
        dto.setUTCSeconds(59)
        dto.setUTCMilliseconds(999)
        //Fetch data from api
        console.debug(`metrics/compute/${login}/plugins > calendar > loading calendar from "${from.toISOString()}" to "${dto.toISOString()}"`)
        const {user: {calendar: {contributionCalendar}}} = await graphql(queries.isocalendar.calendar({login, from: from.toISOString(), to: dto.toISOString()}))
        weeks.push(...contributionCalendar.weeks)
        //Set next date range start
        from = new Date(to)
      }
      calendar.years.unshift({year, weeks})
    }

    //Results
    return calendar
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
