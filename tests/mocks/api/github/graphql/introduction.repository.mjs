/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > introduction/repository")
  return ({
    repository: {
      description: faker.lorem.sentences(),
    },
  })
}
