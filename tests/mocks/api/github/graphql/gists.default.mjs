/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > gists/default")
  return /after: "MOCKED_CURSOR"/m.test(query)
    ? ({
      user: {
        gists: {
          edges: [],
          nodes: [],
        },
      },
    })
    : ({
      user: {
        gists: {
          edges: [
            {
              cursor: "MOCKED_CURSOR",
            },
          ],
          totalCount: faker.number.int(100),
          nodes: [
            {
              stargazerCount: faker.number.int(10),
              isFork: false,
              forks: {totalCount: faker.number.int(10)},
              files: [{name: faker.system.fileName()}],
              comments: {totalCount: faker.number.int(10)},
            },
            {
              stargazerCount: faker.number.int(10),
              isFork: false,
              forks: {totalCount: faker.number.int(10)},
              files: [{name: faker.system.fileName()}],
              comments: {totalCount: faker.number.int(10)},
            },
          ],
        },
      },
    })
}
