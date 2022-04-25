/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > sponsors/default")
  return /after: "MOCKED_CURSOR"/m.test(query)
    ? ({
      user: {
        sponsorshipsAsMaintainer: {
          edges: [],
          nodes: [],
        },
      },
    })
    : ({
      user: {
        sponsorshipsAsMaintainer: {
          edges: new Array(10).fill("MOCKED_CURSOR"),
          nodes: new Array(10).fill(null).map(_ => ({
            privacyLevel: faker.random.arrayElement(["PUBLIC", "PRIVATE"]),
            sponsorEntity: {
              login: faker.internet.userName(),
              avatarUrl: null,
            },
            tier: {
              monthlyPriceInDollars: faker.datatype.number(10),
            },
          })),
        },
      },
    })
}
