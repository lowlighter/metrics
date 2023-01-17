/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > sponsorships/all")
  return /after: "MOCKED_CURSOR"/m.test(query)
    ? ({
      user: {
        sponsorshipsAsSponsor: {
          edges: [],
          nodes: [],
        },
      },
    })
    : ({
      user: {
        sponsorshipsAsSponsor: {
          edges: new Array(10).fill("MOCKED_CURSOR"),
          nodes: new Array(10).fill(null).map(_ => ({
            createdAt: `${faker.date.recent()}`,
            isActive: faker.datatype.boolean(),
            isOneTimePayment: faker.datatype.boolean(),
            tier: {
              name: "$X a month",
            },
            privacyLevel: "PUBLIC",
            sponsorable: {
              login: faker.internet.userName(),
              avatarUrl: null,
            },
          })),
        },
      },
    })
}
