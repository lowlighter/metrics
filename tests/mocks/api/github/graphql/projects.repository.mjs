/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > projects/repository")
  return ({
    user: {
      repository: {
        project: {
          name: "Repository project example",
          updatedAt: `${faker.date.recent()}`,
          body: faker.lorem.paragraph(),
          progress: {
            doneCount: faker.datatype.number(10),
            inProgressCount: faker.datatype.number(10),
            todoCount: faker.datatype.number(10),
            enabled: true,
          },
        },
      },
    },
  })
}
