/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > followup/repository")
  return ({
    repository:{
      issues_open:{totalCount:faker.datatype.number(100)},
      issues_closed:{totalCount:faker.datatype.number(100)},
    },
  })
}
