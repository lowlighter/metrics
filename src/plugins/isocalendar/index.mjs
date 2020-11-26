//Setup
  export default async function ({login, graphql, q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.isocalendar))
            return null
        //Parameters override
          let {"isocalendar.duration":duration = "half-year"} = q
        //Duration in days
          const leap = (new Date(new Date().getYear(), 1, 29).getDate() === 29)
          const days = {"half-year":180, "full-year":365 + leap}[duration] ?? 180
        //Compute start day (to ensure last row is complete, we'll retrieve one more week that we'll shift later)
          const from = new Date(Date.now()-days*24*60*60*1000)
          from.setHours(-24*7)
        //Retrieve contribution calendar from graphql api
          const {user:{calendar:{contributionCalendar:calendar}}} = await graphql(`
              query Calendar {
                user(login: "${login}") {
                  calendar:contributionsCollection(from: "${from.toISOString()}", to: "${(new Date()).toISOString()}") {
                    contributionCalendar {
                      weeks {
                        contributionDays {
                          contributionCount
                          color
                          date
                        }
                      }
                    }
                  }
                }
              }
            `
          )
          calendar.weeks.shift()
        //Compute the highest contributions in a day, streaks and average commits per day
          let max = 0, streak = {max:0, current:0}, values = [], average = 0
          for (const week of calendar.weeks) {
            for (const day of week.contributionDays) {
              values.push(day.contributionCount)
              max = Math.max(max, day.contributionCount)
              streak.current = day.contributionCount ? streak.current+1 : 0
              streak.max = Math.max(streak.max, streak.current)
            }
          }
          average = (values.reduce((a, b) => a + b, 0)/values.length).toFixed(2).replace(/[.]0+$/, "")
        //Compute SVG
          const size = 6
          let i = 0, j = 0
          let svg = `
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" style="margin-top: -52px;" viewBox="0,0 480,${duration === "full-year" ? 270 : 170}">
              ${[1, 2].map(k => `
                <filter id="brightness${k}">
                  <feComponentTransfer>
                    ${[..."RGB"].map(channel => `<feFunc${channel} type="linear" slope="${1-k*0.4}" />`).join("")}
                  </feComponentTransfer>
                </filter>`
              ).join("")}
              <g transform="scale(4) translate(12, 0)">`
          //Iterate through weeks
            for (const week of calendar.weeks) {
              svg += `<g transform="translate(${i*1.7}, ${i})">`
              j = 0
              //Iterate through days
                for (const day of week.contributionDays) {
                  const ratio = day.contributionCount/max
                  svg += `
                    <g transform="translate(${j*-1.7}, ${j+(1-ratio)*size})">
                      <path fill="${day.color}" d="M1.7,2 0,1 1.7,0 3.4,1 z" />
                      <path fill="${day.color}" filter="url(#brightness1)" d="M0,1 1.7,2 1.7,${2+ratio*size} 0,${1+ratio*size} z" />
                      <path fill="${day.color}" filter="url(#brightness2)" d="M1.7,2 3.4,1 3.4,${1+ratio*size} 1.7,${2+ratio*size} z" />
                    </g>`
                  j++
                }
              svg += `</g>`
              i++
            }
          svg += `</g></svg>`
        //Results
          return {streak, max, average, svg, duration}
      }
    //Handle errors
      catch (error) {
        console.debug(error)
        throw {error:{message:`An error occured`}}
      }
  }