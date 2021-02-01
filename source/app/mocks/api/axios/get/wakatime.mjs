/** Mocked data */
  export default function ({faker, url, options, login = faker.internet.userName()}) {
    //Wakatime api
      if (/^https:..wakatime.com.api.v1.users.current.stats.*$/.test(url)) {
        //Get user profile
          if (/api_key=MOCKED_TOKEN/.test(url)) {
            console.debug(`metrics/compute/mocks > mocking wakatime api result > ${url}`)
            const username = url.match(/username[/](?<username>.*?)[?]/)?.groups?.username ?? faker.internet.userName()
            return ({
                status:200,
                data:{
                  data:{
                    best_day:null,
                    categories:[],
                    daily_average:faker.random.number(1000000000),
                    daily_average_including_other_language:faker.random.number(1000000000),
                    dependencies:[],
                    editors:[],
                    languages:[],
                    machines:[],
                    operating_systems:[],
                    project:null,
                    projects:[],
                    total_seconds:faker.random.number(1000000000),
                    total_seconds_including_other_language:faker.random.number(1000000000),
                  },
                }
            })
          }
      }
  }