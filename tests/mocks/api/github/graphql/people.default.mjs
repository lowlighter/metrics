/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > people/default")
  const type = query.match(/(?<type>followers|following)[(]/)?.groups?.type ?? "(unknown type)"
  return /after: "MOCKED_CURSOR"/m.test(query)
    ? ({
      user: {
        [type]: {
          edges: [],
        },
      },
    })
    : ({
      user: {
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
    })
}
