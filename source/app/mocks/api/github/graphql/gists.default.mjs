/**Mocked data */
  export default function({faker, query, login = faker.internet.userName()}) {
    console.debug("metrics/compute/mocks > mocking graphql api result > gists/default")
    return /after: "MOCKED_CURSOR"/m.test(query) ? ({
      user:{
        gists:{
          edges:[],
          nodes:[],
        },
      },
    }) : ({
      user:{
        gists:{
          edges:[
            {
              cursor:"MOCKED_CURSOR",
            },
          ],
          totalCount:faker.random.number(100),
          nodes:[
            {
              stargazerCount:faker.random.number(10),
              isFork:false,
              forks:{totalCount:faker.random.number(10)},
              files:[{name:faker.system.fileName()}],
              comments:{totalCount:faker.random.number(10)},
            },
            {
              stargazerCount:faker.random.number(10),
              isFork:false,
              forks:{totalCount:faker.random.number(10)},
              files:[{name:faker.system.fileName()}],
              comments:{totalCount:faker.random.number(10)},
            },
          ],
        },
      },
    })
  }
