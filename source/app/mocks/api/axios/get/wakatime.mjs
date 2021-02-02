/** Mocked data */
  export default function ({faker, url, options, login = faker.internet.userName()}) {
    //Wakatime api
      if (/^https:..wakatime.com.api.v1.users.current.stats.*$/.test(url)) {
        //Get user profile
          if (/api_key=MOCKED_TOKEN/.test(url)) {
            console.debug(`metrics/compute/mocks > mocking wakatime api result > ${url}`)
            const stats = (array) => {
              const elements = []
              let result = new Array(4+faker.random.number(2)).fill(null).map(_ => ({
                get digital() { return `${this.hours}:${this.minutes}` },
                hours:faker.random.number(1000), minutes:faker.random.number(1000),
                name:array ? faker.random.arrayElement(array) : faker.lorem.words(),
                percent:faker.random.number(100), total_seconds:faker.random.number(1000000),
              }))
              return result.filter(({name}) => elements.includes(name) ? false : (elements.push(name), true))
            }
            return ({
                status:200,
                data:{
                  data:{
                    best_day:{
                      created_at:faker.date.recent(),
                      date:`${faker.date.recent()}`.substring(0, 10),
                      total_seconds:faker.random.number(1000000),
                    },
                    categories:stats(),
                    daily_average:faker.random.number(1000000000),
                    daily_average_including_other_language:faker.random.number(1000000000),
                    dependencies:stats(),
                    editors:stats(["VS Code", "Chrome", "IntelliJ", "PhpStorm", "WebStorm", "Android Studio", "Visual Studio", "Sublime Text", "PyCharm", "Vim", "Atom", "Xcode"]),
                    languages:stats(["JavaScript", "TypeScript", "PHP", "Java", "Python", "Vue.js", "HTML", "C#", "JSON", "Dart", "SCSS", "Kotlin", "JSX", "Go", "Ruby", "YAML"]),
                    machines:stats(),
                    operating_systems:stats(["Mac", "Windows", "Linux"]),
                    project:null,
                    projects:stats(),
                    total_seconds:faker.random.number(1000000000),
                    total_seconds_including_other_language:faker.random.number(1000000000),
                  },
                }
            })
          }
      }
  }