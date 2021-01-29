/** Mocked data */
  export default function ({faker, query, login = faker.internet.userName()}) {
    console.debug(`metrics/compute/mocks > mocking graphql api result > base/repository`)
    return ({
      user:{
        repository:{
          name:"metrics",
          owner:{login},
          createdAt:new Date().toISOString(),
          diskUsage:Math.floor(Math.random()*10000),
          homepageUrl:faker.internet.url(),
          watchers:{totalCount:faker.random.number(1000)},
          stargazers:{totalCount:faker.random.number(10000)},
          languages:{
            edges:[
              {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
              {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
              {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
              {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
              {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
              {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
              {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
            ]
          },
          issues_open:{totalCount:faker.random.number(100)},
          issues_closed:{totalCount:faker.random.number(100)},
          pr_open:{totalCount:faker.random.number(100)},
          pr_merged:{totalCount:faker.random.number(100)},
          releases:{totalCount:faker.random.number(100)},
          forkCount:faker.random.number(100),
          licenseInfo:{spdxId:"MIT"}
        },
      }
    })
  }