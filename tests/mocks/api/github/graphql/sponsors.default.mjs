/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > sponsors/default")
  return ({
    user:{
      sponsorsListing:{
        fullDescription:faker.lorem.sentences(),
        activeGoal:{
          percentComplete:faker.datatype.number(100),
          title:faker.lorem.sentence(),
          description:faker.lorem.sentence(),
        }
      },
      sponsorshipsAsMaintainer:{
        totalCount:faker.datatype.number(100),
        nodes:new Array(10).fill(null).map(_ => ({
          sponsorEntity:{
            login:faker.internet.userName(),
            avatarUrl:null,
          },
          tier:{
            monthlyPriceInDollars:faker.datatype.number(10),
          }
        }))
      }
    },
  })
}