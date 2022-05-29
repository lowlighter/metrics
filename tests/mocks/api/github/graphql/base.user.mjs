/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > base/user")
  return ({
    user: {
      databaseId: faker.datatype.number(10000000),
      name: faker.name.findName(),
      login,
      createdAt: `${faker.date.past(10)}`,
      avatarUrl: faker.image.people(),
      websiteUrl: faker.internet.url(),
      twitterUsername: login,
    },
  })
}
