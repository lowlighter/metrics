/**Mocked data */
export default function({faker, url}) {
    //Last.fm api
      if (/^https:..testapp.herokuapp.com.*$/.test(url)) {
        //Get Nightscout Data
        console.debug(`metrics/compute/mocks > mocking nightscout api result > ${url}`)
        const lastInterval = Math.floor(new Date() / 300000) * 300000
        const directionArray = ["SingleUp", "DoubleUp", "FortyFiveUp", "Flat", "FortyFiveDown", "SingleDown", "DoubleDown"]
        return ({
            status:200,
            data:{
                data:[{
                    _id:faker.git.commitSha().substring(0, 23),
                    device:"xDrip-DexcomG5",
                    date:lastInterval,
                    dateString:new Date(lastInterval).toISOString(),
                    sgv:faker.random.number({min:40, max:400}),
                    delta:faker.random.number({min:-10, max:10}),
                    direction:directionArray[Math.floor(Math.random() * directionArray.length)],
                    type:"sgv",
                    filtered:0,
                    unfiltered:0,
                    rssi:100,
                    noise:1,
                    sysTime:new Date(lastInterval).toISOString(),
                    utcOffset:faker.random.number({min:-12, max:14})*60,
                }],
            },
        })
      }
  }