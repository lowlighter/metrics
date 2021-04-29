/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > base/user")
  return ({
    user:{
      databaseId:faker.datatype.number(10000000),
      name:faker.name.findName(),
      login,
      createdAt:`${faker.date.past(10)}`,
      avatarUrl:faker.image.people(),
      websiteUrl:faker.internet.url(),
      isHireable:faker.datatype.boolean(),
      twitterUsername:login,
      repositories:{totalCount:faker.datatype.number(100), totalDiskUsage:faker.datatype.number(100000), nodes:[]},
      packages:{totalCount:faker.datatype.number(10)},
      starredRepositories:{totalCount:faker.datatype.number(1000)},
      watching:{totalCount:faker.datatype.number(100)},
      sponsorshipsAsSponsor:{totalCount:faker.datatype.number(10)},
      sponsorshipsAsMaintainer:{totalCount:faker.datatype.number(10)},
      contributionsCollection:{
        totalRepositoriesWithContributedCommits:faker.datatype.number(100),
        totalCommitContributions:faker.datatype.number(10000),
        restrictedContributionsCount:faker.datatype.number(10000),
        totalIssueContributions:faker.datatype.number(100),
        totalPullRequestContributions:faker.datatype.number(1000),
        totalPullRequestReviewContributions:faker.datatype.number(1000),
      },
      calendar:{
        contributionCalendar:{
          weeks:[
            {
              contributionDays:[
                {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
              ],
            },
            {
              contributionDays:[
                {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
              ],
            },
            {
              contributionDays:[
                {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
              ],
            },
          ],
        },
      },
      repositoriesContributedTo:{totalCount:faker.datatype.number(100)},
      followers:{totalCount:faker.datatype.number(1000)},
      following:{totalCount:faker.datatype.number(1000)},
      issueComments:{totalCount:faker.datatype.number(1000)},
      organizations:{totalCount:faker.datatype.number(10)},
    },
  })
}
