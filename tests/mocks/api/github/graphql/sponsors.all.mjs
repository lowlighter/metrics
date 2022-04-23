/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > sponsors/all")
  return /after: "MOCKED_CURSOR"/m.test(query)
    ? ({
      user: {
        sponsorsActivities: {
          edges: [],
          nodes: [],
        },
      },
    })
    : ({
      user: {
        sponsorsActivities: {
          edges: new Array(10).fill("MOCKED_CURSOR"),
          nodes: new Array(10).fill(null).map(_ => ({
            sponsor: {
              login: faker.internet.userName(),
              avatarUrl: null,
            },
            sponsorsTier: {
              monthlyPriceInDollars: faker.datatype.number(10),
            },
          })),
        },
      },
    })
}
