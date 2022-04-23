/**Mocked data */
export default function({faker, url, options, login = faker.internet.userName()}) {
  //Wakatime api
  if (/^https:..wakatime.com.api.v1.users..*.stats.*$/.test(url)) {
    //Get user profile
    if (/api_key=MOCKED_TOKEN/.test(url)) {
      console.debug(`metrics/compute/mocks > mocking wakatime api result > ${url}`)
      const stats = array => {
        const elements = []
        let results = new Array(4 + faker.datatype.number(2)).fill(null).map(_ => ({
          get digital() {
            return `${this.hours}:${this.minutes}`
          },
          hours: faker.datatype.number(1000),
          minutes: faker.datatype.number(1000),
          name: array ? faker.random.arrayElement(array) : faker.random.words(2).replace(/ /g, "-").toLocaleLowerCase(),
          percent: 0,
          total_seconds: faker.datatype.number(1000000),
        }))
        results = results.filter(({name}) => elements.includes(name) ? false : (elements.push(name), true))
        let percents = 100
        for (const result of results) {
          result.percent = 1 + faker.datatype.number(percents - 1)
          percents -= result.percent
        }
        return results
      }
      return ({
        status: 200,
        data: {
          data: {
            best_day: {
              created_at: faker.date.recent(),
              date: `${faker.date.recent()}`.substring(0, 10),
              total_seconds: faker.datatype.number(1000000),
            },
            categories: stats(),
            daily_average: faker.datatype.number(12 * 60 * 60),
            daily_average_including_other_language: faker.datatype.number(12 * 60 * 60),
            dependencies: stats(),
            editors: stats(["VS Code", "Chrome", "IntelliJ", "PhpStorm", "WebStorm", "Android Studio", "Visual Studio", "Sublime Text", "PyCharm", "Vim", "Atom", "Xcode"]),
            languages: stats(["JavaScript", "TypeScript", "PHP", "Java", "Python", "Vue.js", "HTML", "C#", "JSON", "Dart", "SCSS", "Kotlin", "JSX", "Go", "Ruby", "YAML"]),
            machines: stats(),
            operating_systems: stats(["Mac", "Windows", "Linux"]),
            project: null,
            projects: /api_key=MOCKED_TOKEN_NO_PROJECTS/.test(url) ? null : stats(),
            total_seconds: faker.datatype.number(1000000000),
            total_seconds_including_other_language: faker.datatype.number(1000000000),
          },
        },
      })
    }
  }
}
