/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > projects/repository.legacy")
  return ({
    user: {
      repository: {
        project: {
          name: "Repository project example",
          updatedAt: `${faker.date.recent()}`,
          body: faker.lorem.paragraph(),
          progress: {
            doneCount: faker.number.int(10),
            inProgressCount: faker.number.int(10),
            todoCount: faker.number.int(10),
            enabled: true,
          },
        },
      },
    },
  })
}
