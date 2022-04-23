/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > base/user")
  return ({
    user: {
      packages: {totalCount: faker.datatype.number(10)},
      starredRepositories: {totalCount: faker.datatype.number(1000)},
      watching: {totalCount: faker.datatype.number(100)},
      sponsorshipsAsSponsor: {totalCount: faker.datatype.number(10)},
      sponsorshipsAsMaintainer: {totalCount: faker.datatype.number(10)},
      repositoriesContributedTo: {totalCount: faker.datatype.number(100)},
      followers: {totalCount: faker.datatype.number(1000)},
      following: {totalCount: faker.datatype.number(1000)},
      issueComments: {totalCount: faker.datatype.number(1000)},
      organizations: {totalCount: faker.datatype.number(10)},
    },
  })
}
