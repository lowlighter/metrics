/**Mocked data */
export default function({faker, url, body, login = faker.internet.userName()}) {
  if (/^https:..leetcode.com.graphql.*$/.test(url)) {
    const {query} = body
    //Languages query
    if (/^query Languages /.test(query)) {
      console.debug("metrics/compute/mocks > mocking leetcode api result > Languages")
      return ({
        status: 200,
        data: {
          data: {
            matchedUser: {
              languageProblemCount: new Array(6).fill(null).map(_ => ({
                languageName: faker.hacker.noun(),
                problemsSolved: faker.number.int(200),
              })),
            },
          },
        },
      })
    }
    //Skills query
    if (/^query Skills /.test(query)) {
      console.debug("metrics/compute/mocks > mocking leetcode api result > Skills")
      return ({
        status: 200,
        data: {
          data: {
            matchedUser: {
              tagProblemCounts: {
                advanced: new Array(6).fill(null).map(_ => ({
                  tagName: faker.hacker.noun(),
                  tagSlug: faker.lorem.slug(),
                  problemsSolved: faker.number.int(200),
                })),
                intermediate: new Array(6).fill(null).map(_ => ({
                  tagName: faker.hacker.noun(),
                  tagSlug: faker.lorem.slug(),
                  problemsSolved: faker.number.int(200),
                })),
                fundamental: new Array(6).fill(null).map(_ => ({
                  tagName: faker.hacker.noun(),
                  tagSlug: faker.lorem.slug(),
                  problemsSolved: faker.number.int(200),
                })),
              },
            },
          },
        },
      })
    }
    //Problems query
    if (/^query Problems /.test(query)) {
      console.debug("metrics/compute/mocks > mocking leetcode api result > Problems")
      return ({
        status: 200,
        data: {
          data: {
            allQuestionsCount: [
              {difficulty: "All", count: 2402},
              {difficulty: "Easy", count: 592},
              {difficulty: "Medium", count: 1283},
              {difficulty: "Hard", count: 527},
            ],
            matchedUser: {
              problemsSolvedBeatsStats: [
                {difficulty: "Easy", percentage: faker.datatype.float({max: 100})},
                {difficulty: "Medium", percentage: faker.datatype.float({max: 100})},
                {difficulty: "Hard", percentage: faker.datatype.float({max: 100})},
              ],
              submitStatsGlobal: {
                acSubmissionNum: [
                  {difficulty: "All", count: faker.number.int(2402)},
                  {difficulty: "Easy", count: faker.number.int(592)},
                  {difficulty: "Medium", count: faker.number.int(1283)},
                  {difficulty: "Hard", count: faker.number.int(527)},
                ],
              },
            },
          },
        },
      })
    }
    //Recent query
    if (/^query Recent /.test(query)) {
      console.debug("metrics/compute/mocks > mocking leetcode api result > Recent")
      return ({
        status: 200,
        data: {
          data: {
            recentAcSubmissionList: new Array(6).fill(null).map(_ => ({
              id: `${faker.number.int(10000)}`,
              title: faker.lorem.sentence(),
              titleSlug: faker.lorem.slug(),
              timestamp: `${Math.round(faker.date.recent().getTime() / 1000)}`,
            })),
          },
        },
      })
    }
  }
}
