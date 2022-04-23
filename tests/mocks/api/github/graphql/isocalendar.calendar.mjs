/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > isocalendar/calendar")
  //Generate calendar
  const date = new Date(query.match(/from: "(?<date>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)"/)?.groups?.date)
  const to = new Date(query.match(/to: "(?<date>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)"/)?.groups?.date)
  const weeks = []
  let contributionDays = []
  for (; date <= to; date.setDate(date.getDate() + 1)) {
    //Create new week on sunday
    if (date.getDay() === 0) {
      weeks.push({contributionDays})
      contributionDays = []
    }
    //Random contributions
    const contributionCount = Math.min(10, Math.max(0, faker.datatype.number(14) - 4))
    contributionDays.push({
      contributionCount,
      color: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"][Math.ceil(contributionCount / 10 / 0.25)],
      date: date.toISOString().substring(0, 10),
    })
  }
  return ({
    user: {
      calendar: {
        contributionCalendar: {
          weeks,
        },
      },
    },
  })
}
