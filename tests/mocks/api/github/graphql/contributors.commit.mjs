/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > contributors/commit")
  return ({
    repository: {
      object: {
        oid: "MOCKED_SHA",
        abbreviatedOid: "MOCKED_SHA",
        messageHeadline: faker.lorem.sentence(),
        committedDate: faker.date.recent(),
      },
    },
  })
}
