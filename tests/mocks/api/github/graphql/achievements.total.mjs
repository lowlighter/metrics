/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > achievements/total")
  return ({
    repositories: {count: faker.number.int(100000)},
    issues: {count: faker.number.int(100000)},
    users: {count: faker.number.int(100000)},
  })
}
