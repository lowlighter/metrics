/**Mocked data */
export default function({faker, url, body, login = faker.internet.userName()}) {
  if (/^https:..api.hashnode.com.*$/.test(url)) {
    console.debug(`metrics/compute/mocks > mocking hashnode result > ${url}`)
    return ({
      status: 200,
      data: {
        data: {
          user: {
            publication: {
              posts: new Array(30).fill(null).map(_ => ({
                title: faker.lorem.sentence(),
                brief: faker.lorem.paragraph(),
                coverImage: null,
                dateAdded: faker.date.recent(),
              })),
            },
          },
        },
      },
    })
  }
}
