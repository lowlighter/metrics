/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > repositories/random")
  return ({
    user: {
      repositories: {
        nodes: [
          {nameWithOwner: "lowlighter/metrics"},
        ],
      },
    },
  })
}
