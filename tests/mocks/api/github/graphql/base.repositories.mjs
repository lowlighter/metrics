/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > base/repositories")
  return /after: "MOCKED_CURSOR"/m.test(query)
    ? ({
      user: {
        get repositoriesContributedTo() {
          return this.repositories
        },
        repositories: {
          edges: [],
          nodes: [],
        },
      },
    })
    : ({
      user: {
        get repositoriesContributedTo() {
          return this.repositories
        },
        repositories: {
          edges: [
            {
              cursor: "MOCKED_CURSOR",
            },
          ],
          nodes: [
            {
              name: faker.lorem.words(),
              watchers: {totalCount: faker.number.int(1000)},
              stargazers: {totalCount: faker.number.int(10000)},
              owner: {login},
              languages: {
                edges: [
                  {size: faker.number.int(100000), node: {color: faker.internet.color(), name: faker.lorem.word()}},
                  {size: faker.number.int(100000), node: {color: faker.internet.color(), name: faker.lorem.word()}},
                  {size: faker.number.int(100000), node: {color: faker.internet.color(), name: faker.lorem.word()}},
                  {size: faker.number.int(100000), node: {color: faker.internet.color(), name: faker.lorem.word()}},
                  {size: faker.number.int(100000), node: {color: faker.internet.color(), name: faker.lorem.word()}},
                  {size: faker.number.int(100000), node: {color: faker.internet.color(), name: faker.lorem.word()}},
                  {size: faker.number.int(100000), node: {color: faker.internet.color(), name: faker.lorem.word()}},
                ],
              },
              issues_open: {totalCount: faker.number.int(100)},
              issues_closed: {totalCount: faker.number.int(100)},
              pr_open: {totalCount: faker.number.int(100)},
              pr_closed: {totalCount: faker.number.int(100)},
              pr_merged: {totalCount: faker.number.int(100)},
              releases: {totalCount: faker.number.int(100)},
              forkCount: faker.number.int(100),
              licenseInfo: {spdxId: "MIT"},
              deployments: {totalCount: faker.number.int(100)},
              environments: {totalCount: faker.number.int(100)},
            },
          ],
        },
      },
    })
}
