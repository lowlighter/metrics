/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > repositories/starred")
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
