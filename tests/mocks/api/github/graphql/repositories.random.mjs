/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > repositories/randodm")
  return ({
    user: {
      repositories: {
        nodes: [
          {nameWithOwner: "lowlighter/metrics"},
        ]
      }
    },
  })
}
