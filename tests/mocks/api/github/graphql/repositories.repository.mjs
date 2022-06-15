/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > repositories/repository")
  return ({
    repository: {
      createdAt: faker.date.past(),
      description: "📊 An image generator with 20+ metrics about your GitHub account such as activity, community, repositories, coding habits, website performances, music played, starred topics, etc. that you can put on your profile or elsewhere !",
      forkCount: faker.datatype.number(100),
      isFork: false,
      issues: {
        totalCount: faker.datatype.number(100),
      },
      nameWithOwner: "lowlighter/metrics",
      openGraphImageUrl: "https://repository-images.githubusercontent.com/293860197/7fd72080-496d-11eb-8fe0-238b38a0746a",
      pullRequests: {
        totalCount: faker.datatype.number(100),
      },
      stargazerCount: faker.datatype.number(10000),
      licenseInfo: {
        nickname: null,
        name: "MIT License",
      },
      primaryLanguage: {
        color: "#f1e05a",
        name: "JavaScript",
      },
    },
  })
}
