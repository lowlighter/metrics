/**Mocked data */
  export default function({faker, query, login = faker.internet.userName()}) {
    console.debug("metrics/compute/mocks > mocking graphql api result > notable/organizations")
    return ({
      user:{
        organizations:{
          nodes:[{
            login:faker.internet.userName(),
            avatarUrl:null,
          }],
        },
      },
    })
  }
