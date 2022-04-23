/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > sponsors/default")
  return ({
    user: {
      sponsorsListing: {
        fullDescription: faker.lorem.sentences(),
        activeGoal: {
          percentComplete: faker.datatype.number(100),
          title: faker.lorem.sentence(),
          description: faker.lorem.sentence(),
        },
      },
    },
  })
}
