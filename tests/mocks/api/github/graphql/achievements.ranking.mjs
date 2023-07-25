/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > achievements/ranking")
  return ({
    repo_rank: {repositoryCount: faker.number.int(100000)},
    forks_rank: {repositoryCount: faker.number.int(100000)},
    created_rank: {userCount: faker.number.int(100000)},
    user_rank: {userCount: faker.number.int(100000)},
    repo_total: {repositoryCount: faker.number.int(100000)},
    user_total: {userCount: faker.number.int(100000)},
  })
}
