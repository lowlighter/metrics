/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > base/user")
  return ({
    user: {
      contributionsCollection: {
        totalRepositoriesWithContributedCommits: faker.datatype.number(100),
        totalCommitContributions: faker.datatype.number(10000),
        restrictedContributionsCount: faker.datatype.number(10000),
        totalIssueContributions: faker.datatype.number(100),
        totalPullRequestContributions: faker.datatype.number(1000),
        totalPullRequestReviewContributions: faker.datatype.number(1000),
      },
    },
  })
}
