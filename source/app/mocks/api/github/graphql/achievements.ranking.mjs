/**Mocked data */
  export default function({faker, query, login = faker.internet.userName()}) {
    console.debug("metrics/compute/mocks > mocking graphql api result > achievements/ranking")
    return ({
      repo_rank:{repositoryCount:faker.random.number(100000)},
      user_rank:{userCount:faker.random.number(100000)},
      repo_total:{repositoryCount:faker.random.number(100000)},
      user_total:{userCount:faker.random.number(100000)},
    })
  }
