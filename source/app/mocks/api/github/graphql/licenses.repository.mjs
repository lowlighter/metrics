/**Mocked data */
  export default function({faker, query, login = faker.internet.userName()}) {
    console.debug("metrics/compute/mocks > mocking graphql api result > licenses/repository")
    return ({
      user:{
        repository:{
          licenseInfo:{name:"MIT License"},
          url:"https://github.com/lowlighter/metrics",
          databaseId:293860197,
        },
      },
    })
  }
