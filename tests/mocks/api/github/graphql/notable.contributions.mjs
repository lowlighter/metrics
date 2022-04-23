/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > notable/contributions")
  return /after: "MOCKED_CURSOR"/m.test(query)
    ? ({
      user: {
        repositoriesContributedTo: {
          edges: [],
        },
      },
    })
    : ({
      user: {
        repositoriesContributedTo: {
          edges: [
            {
              cursor: "MOCKED_CURSOR",
              node: {
                isInOrganization: true,
                owner: {
                  login: faker.internet.userName(),
                  avatarUrl: null,
                },
                nameWithOwner: `${faker.internet.userName()}/${faker.lorem.slug()}`,
                stargazers: {totalCount: faker.datatype.number(1000)},
                watchers: {totalCount: faker.datatype.number(1000)},
                forks: {totalCount: faker.datatype.number(1000)},
                issues: {totalCount: faker.datatype.number(1000)},
                pullRequests: {totalCount: faker.datatype.number(1000)},
              },
            },
          ],
        },
      },
    })
}
