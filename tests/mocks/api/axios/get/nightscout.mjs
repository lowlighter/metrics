/**Mocked data */
export default function({faker, url}) {
  //Last.fm api
  if (/^https:..testapp.herokuapp.com.*$/.test(url)) {
    //Get Nightscout Data
    console.debug(`metrics/compute/mocks > mocking nightscout api result > ${url}`)
    const lastInterval = Math.floor(new Date() / 300000) * 300000
    return ({
      status: 200,
      data: new Array(12).fill(null).map(_ => ({
        _id: faker.git.commitSha().substring(0, 23),
        device: "xDrip-DexcomG5",
        date: lastInterval,
        dateString: new Date(lastInterval).toISOString(),
        sgv: faker.datatype.number({min: 40, max: 400}),
        delta: faker.datatype.number({min: -10, max: 10}),
        direction: faker.random.arrayElement(["SingleUp", "DoubleUp", "FortyFiveUp", "Flat", "FortyFiveDown", "SingleDown", "DoubleDown"]),
        type: "sgv",
        filtered: 0,
        unfiltered: 0,
        rssi: 100,
        noise: 1,
        sysTime: new Date(lastInterval).toISOString(),
        utcOffset: faker.datatype.number({min: -12, max: 14}) * 60,
      })),
    })
  }
}
