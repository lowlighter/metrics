/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > base/user")
  return ({
    user: {
      packages: {totalCount: faker.number.int(10)},
      starredRepositories: {totalCount: faker.number.int(1000)},
      watching: {totalCount: faker.number.int(100)},
      sponsorshipsAsSponsor: {totalCount: faker.number.int(10)},
      sponsorshipsAsMaintainer: {totalCount: faker.number.int(10)},
      repositoriesContributedTo: {totalCount: faker.number.int(100)},
      followers: {totalCount: faker.number.int(1000)},
      following: {totalCount: faker.number.int(1000)},
      issueComments: {totalCount: faker.number.int(1000)},
      organizations: {totalCount: faker.number.int(10)},
    },
  })
}
