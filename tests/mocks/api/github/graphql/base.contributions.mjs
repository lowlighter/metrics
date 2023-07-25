/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > base/user")
  return ({
    user: {
      contributionsCollection: {
        totalRepositoriesWithContributedCommits: faker.number.int(100),
        totalCommitContributions: faker.number.int(10000),
        restrictedContributionsCount: faker.number.int(10000),
        totalIssueContributions: faker.number.int(100),
        totalPullRequestContributions: faker.number.int(1000),
        totalPullRequestReviewContributions: faker.number.int(1000),
      },
    },
  })
}
