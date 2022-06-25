/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > discussions/categories")
  return /after: "MOCKED_CURSOR"/m.test(query)
    ? ({
      user: {
        repositoryDiscussions: {
          edges: [],
          nodes: [],
        },
      },
    })
    : ({
      user: {
        repositoryDiscussions: {
          edges: new Array(100).fill(null).map(_ => ({cursor: "MOCKED_CURSOR"})),
          nodes: new Array(100).fill(null).map(_ => ({
            category: {
              emoji: faker.helpers.arrayElement([":chart_with_upwards_trend:", ":chart_with_downwards_trend:", ":bar_char:"]),
              name: faker.lorem.slug(),
            },
          })),
        },
      },
    })
}
