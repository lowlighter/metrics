/**Mocked data */
  export default function({faker, query, login = faker.internet.userName()}) {
    console.debug("metrics/compute/mocks > mocking graphql api result > notable/contributions")
    return /after: "MOCKED_CURSOR"/m.test(query) ? ({
      user:{
        repositoriesContributedTo:{
          edges:[],
        },
      },
    }) : ({
      user:{
        repositoriesContributedTo:{
          edges:[
            {
              cursor:"MOCKED_CURSOR",
              node:{
                isInOrganization:true,
                owner:{
                  login:faker.internet.userName(),
                  avatarUrl:null,
                },
              },
            },
          ],
        },
      },
    })
  }
