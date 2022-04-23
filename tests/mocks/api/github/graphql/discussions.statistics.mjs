/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > discussions/statistics")
  return ({
    user: {
      started: {totalCount: faker.datatype.number(1000)},
      comments: {totalCount: faker.datatype.number(1000)},
      answers: {totalCount: faker.datatype.number(1000)},
    },
  })
}
