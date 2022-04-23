/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > reactions/default")
  const type = query.match(/(?<type>issues|issueComments)[(]/)?.groups?.type ?? "(unknown type)"
  return /after: "MOCKED_CURSOR"/m.test(query)
    ? ({
      user: {
        [type]: {
          edges: [],
          nodes: [],
        },
      },
    })
    : ({
      user: {
        [type]: {
          edges: new Array(100).fill(null).map(_ => ({
            cursor: "MOCKED_CURSOR",
            node: {
              createdAt: faker.date.recent(),
              reactions: {
                nodes: new Array(50).fill(null).map(_ => ({
                  user: {login: faker.internet.userName()},
                  content: faker.random.arrayElement(["HEART", "THUMBS_UP", "THUMBS_DOWN", "LAUGH", "CONFUSED", "EYES", "ROCKET", "HOORAY"]),
                })),
              },
            },
          })),
        },
      },
    })
}
