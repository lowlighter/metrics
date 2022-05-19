/**Mocked data */
export default function({faker, url, options, login = faker.internet.userName()}) {
  //Wakatime api
  if (/^https:..yh-finance.p.rapidapi.com.stock.v2.*$/.test(url)) {
    //Get company profile
    if (/get-profile/.test(url)) {
      console.debug(`metrics/compute/mocks > mocking yahoo finance api result > ${url}`)
      return ({
        status: 200,
        data: {
          price: {
            marketCap: {
              raw: faker.datatype.number(1000000000),
            },
            symbol: "OCTO",
          },
          quoteType: {
            shortName: faker.company.companyName(),
            longName: faker.company.companyName(),
            exchangeTimezoneName: faker.address.timeZone(),
            symbol: "OCTO",
          },
          calendarEvents: {},
          summaryDetail: {},
          symbol: "OCTO",
          assetProfile: {
            fullTimeEmployees: faker.datatype.number(10000),
            city: faker.address.city(),
            country: faker.address.country(),
          },
        },
      })
    }
    //Get stock chart
    if (/get-chart/.test(url)) {
      console.debug(`metrics/compute/mocks > mocking yahoo finance api result > ${url}`)
      return ({
        status: 200,
        data: {
          chart: {
            result: [
              {
                meta: {
                  currency: "USD",
                  symbol: "OCTO",
                  regularMarketPrice: faker.datatype.number(10000) / 100,
                  chartPreviousClose: faker.datatype.number(10000) / 100,
                  previousClose: faker.datatype.number(10000) / 100,
                },
                timestamp: new Array(1000).fill(Date.now()).map((x, i) => x + i * 60000),
                indicators: {
                  quote: [
                    {
                      close: new Array(1000).fill(null).map(_ => faker.datatype.number(10000) / 100),
                      get low() {
                        return this.close
                      },
                      get high() {
                        return this.close
                      },
                      get open() {
                        return this.close
                      },
                      volume: [],
                    },
                  ],
                },
              },
            ],
          },
        },
      })
    }
  }
}
