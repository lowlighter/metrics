/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > base/user")
  return ({
    user: {
      calendar: {
        contributionCalendar: {
          weeks: [
            {
              contributionDays: [
                {color: faker.helpers.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color: faker.helpers.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color: faker.helpers.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color: faker.helpers.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color: faker.helpers.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
              ],
            },
            {
              contributionDays: [
                {color: faker.helpers.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color: faker.helpers.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color: faker.helpers.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color: faker.helpers.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color: faker.helpers.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color: faker.helpers.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color: faker.helpers.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
              ],
            },
            {
              contributionDays: [
                {color: faker.helpers.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color: faker.helpers.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color: faker.helpers.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
              ],
            },
          ],
        },
      },
    },
  })
}
