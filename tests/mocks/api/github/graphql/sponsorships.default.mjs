/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > sponsorships/default")
  return ({
    user: {
      totalSponsorshipAmountAsSponsorInCents:faker.datatype.number(100000),
      sponsorshipsAsSponsor:{
        nodes:[{createdAt: `${faker.date.recent()}`}]
      }
    },
  })
}
