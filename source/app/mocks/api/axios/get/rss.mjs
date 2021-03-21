/**Mocked data */
  export default function({faker, url, options, login = faker.internet.userName()}) {
    //Stackoverflow api
      if (/^https:..example.org.rss$/.test(url)) {
        console.debug(`metrics/compute/mocks > mocking rss feed result > ${url}`)
        return ({
          status:200,
          data:{
            items:new Array(30).fill(null).map(_ => ({
              title:faker.lorem.sentence(),
              link:faker.internet.url(),
              content:faker.lorem.paragraphs(),
              contentSnippet:faker.lorem.paragraph(),
              isoDate:faker.date.recent(),
            })),
            title:faker.lorem.sentence(),
            description:faker.lorem.paragraph(),
            link:url,
          },
        })
      }
  }