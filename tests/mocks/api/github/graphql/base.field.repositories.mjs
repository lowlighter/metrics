/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > base/user")
  return ({
    user: {
      repositories: {totalCount: faker.number.int(100), totalDiskUsage: faker.number.int(100000)},
    },
  })
}
