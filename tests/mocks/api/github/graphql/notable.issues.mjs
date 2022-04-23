/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > notable/issues")
  return /after: "MOCKED_CURSOR"/m.test(query)
    ? ({
      user: {
        issues: {
          edges: [],
        },
        pullRequests: {
          edges: [],
        },
      },
    })
    : ({
      user: {
        issues: {
          totalCount: faker.datatype.number(1000),
          edges: [
            {
              cursor: "MOCKED_CURSOR",
              node: {
                repository: {
                  nameWithOwner: `${faker.internet.userName()}/${faker.lorem.slug()}`,
                },
              },
            },
          ],
        },
        get pullRequests() {
          return this.issues
        },
      },
    })
}
