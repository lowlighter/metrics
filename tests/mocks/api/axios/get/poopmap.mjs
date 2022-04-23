/**Mocked data */
export default function({faker, url, options, login = faker.internet.userName()}) {
  //Wakatime api
  if (/^https:..api.poopmap.net.*$/.test(url)) {
    //Get user profile
    if (/public_links\/MOCKED_TOKEN/.test(url)) {
      console.debug(`metrics/compute/mocks > mocking poopmap api result > ${url}`)
      return ({
        status: 200,
        data: {
          poops: new Array(12 + faker.datatype.number(6)).fill(null).map(_ => ({
            id: 79744699,
            latitude: faker.address.latitude(),
            longitude: faker.address.longitude(),
            created_at: faker.date.past().toISOString(),
            note: "",
            place: "",
            rating: faker.datatype.number(5),
            followers_count: faker.datatype.number(100),
            comments_count: faker.datatype.number(12),
          })),
        },
      })
    }
  }
}
