/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > achievements/organizations")
  return ({
    organization: {
      repositories: {
        nodes: [
          {
            createdAt: faker.date.recent(),
            nameWithOwner: `${faker.internet.userName()}/${faker.lorem.slug()}`,
          },
        ],
        totalCount: faker.datatype.number(100),
      },
      forks: {
        nodes: [
          {
            createdAt: faker.date.recent(),
            nameWithOwner: `${faker.internet.userName()}/${faker.lorem.slug()}`,
          },
        ],
        totalCount: faker.datatype.number(100),
      },
      popular: {
        nodes: [{stargazers: {totalCount: faker.datatype.number(50000)}}],
      },
      projects: {totalCount: faker.datatype.number(100)},
      packages: {totalCount: faker.datatype.number(100)},
      membersWithRole: {totalCount: faker.datatype.number(100)},
      sponsorshipsAsSponsor: {totalCount: faker.datatype.number(100)},
    },
  })
}
