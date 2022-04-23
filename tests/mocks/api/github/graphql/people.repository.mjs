/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > people/repository")
  const type = query.match(/(?<type>stargazers|watchers)[(]/)?.groups?.type ?? "(unknown type)"
  return /after: "MOCKED_CURSOR"/m.test(query)
    ? ({
      user: {
        repository: {
          [type]: {
            edges: [],
          },
        },
      },
    })
    : ({
      user: {
        repository: {
          [type]: {
            edges: new Array(Math.ceil(20 + 80 * Math.random())).fill(null).map((login = faker.internet.userName()) => ({
              cursor: "MOCKED_CURSOR",
              node: {
                login,
                avatarUrl: null,
              },
            })),
          },
        },
      },
    })
}
