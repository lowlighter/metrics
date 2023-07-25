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
        totalCount: faker.number.int(100),
      },
      forks: {
        nodes: [
          {
            createdAt: faker.date.recent(),
            nameWithOwner: `${faker.internet.userName()}/${faker.lorem.slug()}`,
          },
        ],
        totalCount: faker.number.int(100),
      },
      popular: {
        nodes: [{stargazers: {totalCount: faker.number.int(50000)}}],
      },
      pullRequests: {
        nodes: [
          {
            createdAt: faker.date.recent(),
            title: faker.lorem.sentence(),
            repository: {nameWithOwner: `${faker.internet.userName()}/${faker.lorem.slug()}`},
          },
        ],
        totalCount: faker.number.int(50000),
      },
      contributionsCollection: {
        pullRequestReviewContributions: {
          nodes: [
            {
              occurredAt: faker.date.recent(),
              pullRequest: {
                title: faker.lorem.sentence(),
                number: faker.number.int(1000),
                repository: {nameWithOwner: `${faker.internet.userName()}/${faker.lorem.slug()}`},
              },
            },
          ],
          totalCount: faker.number.int(1000),
        },
      },
      projects: {totalCount: faker.number.int(100)},
      packages: {totalCount: faker.number.int(100)},
      organizations: {nodes: [], totalCount: faker.number.int(5)},
      gists: {
        nodes: [{createdAt: faker.date.recent(), name: faker.lorem.slug()}],
        totalCount: faker.number.int(1000),
      },
      starredRepositories: {totalCount: faker.number.int(1000)},
      followers: {totalCount: faker.number.int(10000)},
      following: {totalCount: faker.number.int(10000)},
      bio: faker.lorem.sentence(),
      status: {message: faker.lorem.paragraph()},
      sponsorshipsAsSponsor: {totalCount: faker.number.int(100)},
      discussionsStarted: {totalCount: faker.number.int(1000)},
      discussionsComments: {totalCount: faker.number.int(1000)},
      discussionAnswers: {totalCount: faker.number.int(1000)},
    },
  })
}
