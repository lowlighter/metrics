/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > achievements/metrics")
  return ({
    user: {
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
      pullRequests: {
        nodes: [
          {
            createdAt: faker.date.recent(),
            title: faker.lorem.sentence(),
            repository: {nameWithOwner: `${faker.internet.userName()}/${faker.lorem.slug()}`},
          },
        ],
        totalCount: faker.datatype.number(50000),
      },
      contributionsCollection: {
        pullRequestReviewContributions: {
          nodes: [
            {
              occurredAt: faker.date.recent(),
              pullRequest: {
                title: faker.lorem.sentence(),
                number: faker.datatype.number(1000),
                repository: {nameWithOwner: `${faker.internet.userName()}/${faker.lorem.slug()}`},
              },
            },
          ],
          totalCount: faker.datatype.number(1000),
        },
      },
      projects: {totalCount: faker.datatype.number(100)},
      packages: {totalCount: faker.datatype.number(100)},
      organizations: {nodes: [], totalCount: faker.datatype.number(5)},
      gists: {
        nodes: [{createdAt: faker.date.recent(), name: faker.lorem.slug()}],
        totalCount: faker.datatype.number(1000),
      },
      starredRepositories: {totalCount: faker.datatype.number(1000)},
      followers: {totalCount: faker.datatype.number(10000)},
      following: {totalCount: faker.datatype.number(10000)},
      bio: faker.lorem.sentence(),
      status: {message: faker.lorem.paragraph()},
      sponsorshipsAsSponsor: {totalCount: faker.datatype.number(100)},
      discussionsStarted: {totalCount: faker.datatype.number(1000)},
      discussionsComments: {totalCount: faker.datatype.number(1000)},
      discussionAnswers: {totalCount: faker.datatype.number(1000)},
    },
  })
}
