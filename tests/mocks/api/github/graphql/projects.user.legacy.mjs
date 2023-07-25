/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > projects/user.legacy")
  return ({
    user: {
      projects: {
        totalCount: 1,
        nodes: [
          {
            name: "User-owned project",
            updatedAt: `${faker.date.recent()}`,
            body: faker.lorem.paragraph(),
            progress: {
              doneCount: faker.number.int(10),
              inProgressCount: faker.number.int(10),
              todoCount: faker.number.int(10),
              enabled: true,
            },
          },
        ],
      },
    },
  })
}
