//Setup
  export default async function ({login, graphql, q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.isocalendar))
            return null
        //Compute start day (need to )
          const from = new Date(Date.now()-180*24*60*60*1000)
          const day = from.getDay()||7
          if (day !== 1)
            from.setHours(-24*(day-1))
        //Retrieve more data from contribution calendar
          const {user:{calendar:{contributionCalendar:calendar}}} = await graphql(`
              query Calendar {
                user(login: $login) {
                  calendar:contributionsCollection(from: $calendar.from, to: $calendar.to) {
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
            .replace(/[$]login/, `"${login}"`)
            .replace(/[$]calendar.to/, `"${(new Date()).toISOString()}"`)
            .replace(/[$]calendar.from/, `"${from.toISOString()}"`)
          )
        //Compute max contribution per day to scale
          let max = 0, streak = {max:0, current:0}, values = [], average = 0
          for (const week of calendar.weeks) {
            for (const day of week.contributionDays) {
              values.push(day.contributionCount)
              max = Math.max(max, day.contributionCount)
              streak.current = day.contributionCount ? streak.current+1 : 0
              streak.max = Math.max(streak.max, streak.current)
            }
          }
          average = (values.reduce((a, b) => a + b, 0)/values.length).toFixed(2).replace(/.0+$/, "")
        //Compute SVG
          const size = 6
          let i = 0, j = 0
          let svg = `
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" style="margin-top: -52px;" viewBox="0,0 480,170">
              <filter id="brightness1">
                <feComponentTransfer>
                  <feFuncR type="linear" slope="0.6" />
                  <feFuncG type="linear" slope="0.6" />
                  <feFuncB type="linear" slope="0.6" />
                </feComponentTransfer>
              </filter>
              <filter id="brightness2">
                <feComponentTransfer>
                  <feFuncR type="linear" slope="0.2" />
                  <feFuncG type="linear" slope="0.2" />
                  <feFuncB type="linear" slope="0.2" />
                </feComponentTransfer>
              </filter>
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
          return {streak, max, average, svg}
      }
    //Handle errors
      catch (error) {
        console.debug(error)
        throw {error:{message:`An error occured`}}
      }
  }