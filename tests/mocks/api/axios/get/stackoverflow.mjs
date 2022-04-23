/**Mocked data */
export default function({faker, url, options, login = faker.internet.userName()}) {
  //Stackoverflow api
  if (/^https:..api.stackexchange.com.2.2.*$/.test(url)) {
    //Extract user id
    const user_id = url.match(/[/]users[/](?<id>\d+)/)?.groups?.id ?? NaN
    const pagesize = Number(url.match(/pagesize=(?<pagesize>\d+)/)?.groups?.pagesize) || 30
    //User account
    if (/users[/]\d+[/][?]site=stackoverflow$/.test(url)) {
      console.debug(`metrics/compute/mocks > mocking stackoverflow api result > ${url}`)
      return ({
        status: 200,
        data: {
          items: [
            {
              badge_counts: {bronze: faker.datatype.number(500), silver: faker.datatype.number(300), gold: faker.datatype.number(100)},
              accept_rate: faker.datatype.number(100),
              answer_count: faker.datatype.number(1000),
              question_count: faker.datatype.number(1000),
              view_count: faker.datatype.number(10000),
              creation_date: faker.date.past(),
              display_name: faker.internet.userName(),
              user_id,
              reputation: faker.datatype.number(100000),
            },
          ],
          has_more: false,
          quota_max: 300,
          quota_remaining: faker.datatype.number(300),
        },
      })
    }
    //Total metrics
    if (/[?]site=stackoverflow&filter=total$/.test(url)) {
      console.debug(`metrics/compute/mocks > mocking stackoverflow api result > ${url}`)
      return ({
        status: 200,
        data: {
          total: faker.datatype.number(10000),
        },
      })
    }
    //Questions
    if ((/questions[?]site=stackoverflow/.test(url)) || (/questions[/][\d;]+[?]site=stackoverflow/.test(url))) {
      console.debug(`metrics/compute/mocks > mocking stackoverflow api result > ${url}`)
      return ({
        status: 200,
        data: {
          items: new Array(pagesize).fill(null).map(_ => ({
            tags: new Array(5).fill(null).map(_ => faker.lorem.slug()),
            owner: {display_name: faker.internet.userName()},
            is_answered: faker.datatype.boolean(),
            view_count: faker.datatype.number(10000),
            accepted_answer_id: faker.datatype.number(1000000),
            answer_count: faker.datatype.number(100),
            score: faker.datatype.number(1000),
            creation_date: faker.time.recent(),
            down_vote_count: faker.datatype.number(1000),
            up_vote_count: faker.datatype.number(1000),
            comment_count: faker.datatype.number(1000),
            favorite_count: faker.datatype.number(1000),
            title: faker.lorem.sentence(),
            body_markdown: faker.lorem.paragraphs(),
            link: faker.internet.url(),
            question_id: faker.datatype.number(1000000),
          })),
          has_more: false,
          quota_max: 300,
          quota_remaining: faker.datatype.number(300),
        },
      })
    }
    //Answers
    if ((/answers[?]site=stackoverflow/.test(url)) || (/answers[/][\d;]+[?]site=stackoverflow/.test(url))) {
      console.debug(`metrics/compute/mocks > mocking stackoverflow api result > ${url}`)
      return ({
        status: 200,
        data: {
          items: new Array(pagesize).fill(null).map(_ => ({
            owner: {display_name: faker.internet.userName()},
            link: faker.internet.url(),
            is_accepted: faker.datatype.boolean(),
            score: faker.datatype.number(1000),
            down_vote_count: faker.datatype.number(1000),
            up_vote_count: faker.datatype.number(1000),
            comment_count: faker.datatype.number(1000),
            creation_date: faker.time.recent(),
            question_id: faker.datatype.number(1000000),
            body_markdown: faker.lorem.paragraphs(),
            answer_id: faker.datatype.number(1000000),
          })),
          has_more: false,
          quota_max: 300,
          quota_remaining: faker.datatype.number(300),
        },
      })
    }
  }
}
