/**Mocked data */
export default function({ faker, query, login = faker.internet.userName() }) {
  console.debug("metrics/compute/mocks > mocking graphql api result > sponsors/all")
  return ({
    user: {
      sponsorsActivities: {
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
