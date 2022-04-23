/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > achievements/metrics")
  return ({
    repository: {viewerHasStarred: faker.datatype.boolean()},
    viewer: {login},
  })
}
