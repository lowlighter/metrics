/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > base/user")
  return ({
    user: {
      repositories: {totalCount: faker.datatype.number(100), totalDiskUsage: faker.datatype.number(100000)},
    },
  })
}
