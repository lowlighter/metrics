/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > discussions/comments")
  return /after: "MOCKED_CURSOR"/m.test(query)
    ? ({
      user: {
        repositoryDiscussionsComments: {
          edges: [],
          nodes: [],
        },
      },
    })
    : ({
      user: {
        repositoryDiscussionsComments: {
          edges: new Array(100).fill(null).map(_ => ({cursor: "MOCKED_CURSOR"})),
          nodes: new Array(100).fill(null).map(_ => ({upvoteCount: faker.datatype.number(10)})),
        },
      },
    })
}
