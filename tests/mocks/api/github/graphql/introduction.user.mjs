/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > introduction/user")
  return ({
    user: {
      bio: faker.lorem.sentences(),
    },
  })
}
