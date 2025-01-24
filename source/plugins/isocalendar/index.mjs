async function loadNonGitHubContributionsFromSourceFile(options) {
  const { login: username } = options

  //load contributions from github public file

  let contributions = []
  try {
    const response = await fetch(`https://raw.githubusercontent.com/${username}/${username}/refs/heads/metrics-renders/.contributions/gitlab.json`)
    if (response.ok) {
      contributions = await response.json()
    }
  }
  catch (error) {
    console.error("Failed to fetch contributions from source file", error)
  }

  return {
    contributions,
    //eslint-disable-next-line object-shorthand
    getRange: function (from, to) {
      //create week chunks
      let chunks = []
      for (let start = new Date(from); start < to;) {
        const end = new Date(start)
        end.setUTCDate(end.getUTCDate() + 7)

        chunks.push(
          {
            contributionDays: [
              ...this.contributions.filter(entry => {
                const date = new Date(entry.date)

                return start <= date && date < end
              })
            ]
          }
        )

        start = end
      }

      return chunks
    },
  }
}

function findTopColorForDay(day, count) {
  return Object.keys(day).reduce((acc, key, idx) => {
    const { color, contributionCount } = day[key]
    if (count === 0 && idx === 0) {
      return color
    }
    if (count !== 0 && contributionCount === 0) {
      return acc
    }
    if (acc === "") {
      return color
    }

    return acc
  }, "")
}

//Setup
export default async function ({ login, data, graphql, q, imports, queries, account }, { enabled = false, extras = false } = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q.isocalendar) || (!imports.metadata.plugins.isocalendar.enabled(enabled, { extras })))
      return null

    //Load inputs
    let { duration } = imports.metadata.plugins.isocalendar.inputs({ data, account, q })

    //Compute start day
    const now = new Date()
    const start = new Date(now)
    if (duration === "full-year")
      start.setUTCFullYear(now.getUTCFullYear() - 1)
    else
      start.setUTCHours(-180 * 24)

    //Ensure start day is a sunday, and that time is set to 00:00:00.000
    if (start.getUTCDay()) {
      start.setUTCHours(-start.getUTCDay() * 24)
    }
    start.setUTCMilliseconds(0)
    start.setUTCSeconds(0)
    start.setUTCMinutes(0)
    start.setUTCHours(0)

    //Compute contribution calendar, highest contributions in a day, streaks and average commits per day
    console.debug(`metrics/compute/${login}/plugins > isocalendar > computing stats`)
    const calendar = { weeks: [] }

    const { streak, max, average } = await statistics({ login, graphql, queries, start, end: now, calendar })
    const reference = Math.max(
      ...calendar.weeks.flatMap(
        ({ contributionDays }) => {
          const val = contributionDays.map(day => Object.keys(day).map(key => day[key].contributionCount))

          return val.flat()
        })
    )

    //Compute SVG
    console.debug(`metrics/compute/${login}/plugins > isocalendar > computing svg render`)
    const size = 6;
    let i = 0;
    let j = 0;
    let svg = `
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" style="margin-top: -130px;" viewBox="0,0 480,${duration === "full-year" ? 270 : 170}">
        ${[1, 2].map(k => `
          <filter id="brightness${k}">
            <feComponentTransfer>
              ${[..."RGB"].map(channel => `<feFunc${channel} type="linear" slope="${1 - k * 0.4}" />`).join("")}
            </feComponentTransfer>
          </filter>`).join("")}
        <g transform="scale(4) translate(12, 0)">`;

    //Iterate through weeks
    for (const week of calendar.weeks) {
      svg += `<g transform="translate(${i * 1.7}, ${i})">`;
      j = 0;

      //Iterate through days
      for (const day of week.contributionDays) {
        const count = Object.keys(day).reduce((acc, key) => acc + day[key].contributionCount, 0);
        const ratio = (count / reference) || 0;

        svg += `<g transform="translate(${j * -1.7}, ${j + (1 - ratio) * size})">`;

        const topColor = findTopColorForDay(day, count);
        svg += `<path fill="${topColor}" d="M1.7,2 0,1 1.7,0 3.4,1 z" />`;

        let offset = 0;
        Object.keys(day).forEach((key, idx) => {
          const { color, contributionCount } = day[key];

          //Find ratio of key
          const r = contributionCount / reference || 0;
          const shiftBy = r * size;

          svg += `
            <path fill="${color}" filter="url(#brightness1)" d=" M   0,${1 + offset} 1.7,${2 + offset} 1.7,${2 + offset + shiftBy}   0,${1 + offset + shiftBy} z" />
            <path fill="${color}" filter="url(#brightness2)" d=" M 1.7,${2 + offset} 3.4,${1 + offset} 3.4,${1 + offset + shiftBy} 1.7,${2 + offset + shiftBy} z" />
          `;

          offset += shiftBy;
        });

        svg += "</g>";
        j++;
      }
      svg += "</g>";
      i++;
    }
    svg += "</g></svg>";

    //Results
    return { streak, max, average, svg, duration }
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}

/**
 * Compute max and current streaks
 * */
async function statistics({ login, graphql, queries, start, end, calendar }) {
  let average = 0, max = 0, streak = { max: 0, current: 0 }, values = []

  const extracontribs = await loadNonGitHubContributionsFromSourceFile({ login });

  //Load contribution calendar
  for (let from = new Date(start); from < end;) {
    //Set date range
    let to = new Date(from);
    to.setUTCHours(+4 * 7 * 24);
    if (to > end) {
      to = end;
    }

    //Ensure that date ranges are not overlapping by setting it to previous day at 23:59:59.999
    const dto = new Date(to);
    dto.setUTCHours(-1);
    dto.setUTCMinutes(59);
    dto.setUTCSeconds(59);
    dto.setUTCMilliseconds(999);

    //Fetch data from api
    console.debug(`metrics/compute/${login}/plugins > isocalendar > loading calendar from "${from.toISOString()}" to "${dto.toISOString()}"`);
    const { user: { calendar: { contributionCalendar: { weeks } } } } = await graphql(queries.isocalendar.calendar({ login, from: from.toISOString(), to: dto.toISOString() }));

    const extra = extracontribs.getRange(from, to);

    //Merge contributions
    const entries = weeks.reduce((weekAcc, week, i) => {
      const extraWeek = extra[i];
      if (!extraWeek) {
        weekAcc.push({ contributionDays: week.contributionDays.map(day => ({ github: day })) });
        return weekAcc;
      }

      weekAcc.push({
        contributionDays: [
          ...week.contributionDays.reduce((dayAcc, day, i) => {
            const extraDay = extraWeek.contributionDays[i];

            if (extraDay) {
              dayAcc.push({ github: day, gitlab: extraDay });
            }
            else {
              dayAcc.push({ github: day });
            }

            return dayAcc;
          }, [])
        ]
      });

      return weekAcc;
    }, [])

    calendar.weeks.push(...entries);

    //Set next date range start
    from = new Date(to);
  }

  //Compute streaks
  for (const week of calendar.weeks) {
    for (const day of week.contributionDays) {
      Object.keys(day).forEach(key => {
        values.push(day[key].contributionCount);
        max = Math.max(max, day[key].contributionCount);
        streak.current = day[key].contributionCount ? streak.current + 1 : 0;
        streak.max = Math.max(streak.max, streak.current);
      });
    }
  }

  //Compute average
  average = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2).replace(/[.]0+$/, "");

  return { streak, max, average };
}
