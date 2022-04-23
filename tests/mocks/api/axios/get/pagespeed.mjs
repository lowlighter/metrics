/**Mocked data */
export default function({faker, url, options, login = faker.internet.userName()}) {
  //Tested url
  const tested = url.match(/&url=(?<tested>.*?)(?:&|$)/)?.groups?.tested ?? faker.internet.url()
  //Pagespeed api
  if (/^https:..www.googleapis.com.pagespeedonline.v5.*$/.test(url)) {
    //Pagespeed result
    if (/v5.runPagespeed.*&key=MOCKED_TOKEN/.test(url)) {
      console.debug(`metrics/compute/mocks > mocking pagespeed api result > ${url}`)
      return ({
        status: 200,
        data: {
          captchaResult: "CAPTCHA_NOT_NEEDED",
          id: tested,
          lighthouseResult: {
            requestedUrl: tested,
            finalUrl: tested,
            lighthouseVersion: "6.3.0",
            audits: {
              "final-screenshot": {
                id: "final-screenshot",
                title: "Final Screenshot",
                score: null,
                details: {
                  data: null,
                  type: "screenshot",
                  timestamp: Date.now(),
                },
              },
              metrics: {
                id: "metrics",
                title: "Metrics",
                score: null,
                details: {
                  items: [
                    {
                      observedFirstContentfulPaint: faker.datatype.number(500),
                      observedFirstVisualChangeTs: faker.time.recent(),
                      observedFirstContentfulPaintTs: faker.time.recent(),
                      firstContentfulPaint: faker.datatype.number(500),
                      observedDomContentLoaded: faker.datatype.number(500),
                      observedFirstMeaningfulPaint: faker.datatype.number(1000),
                      maxPotentialFID: faker.datatype.number(500),
                      observedLoad: faker.datatype.number(500),
                      firstMeaningfulPaint: faker.datatype.number(500),
                      observedCumulativeLayoutShift: faker.datatype.float({max: 1}),
                      observedSpeedIndex: faker.datatype.number(1000),
                      observedSpeedIndexTs: faker.time.recent(),
                      observedTimeOriginTs: faker.time.recent(),
                      observedLargestContentfulPaint: faker.datatype.number(1000),
                      cumulativeLayoutShift: faker.datatype.float({max: 1}),
                      observedFirstPaintTs: faker.time.recent(),
                      observedTraceEndTs: faker.time.recent(),
                      largestContentfulPaint: faker.datatype.number(2000),
                      observedTimeOrigin: faker.datatype.number(10),
                      speedIndex: faker.datatype.number(1000),
                      observedTraceEnd: faker.datatype.number(2000),
                      observedDomContentLoadedTs: faker.time.recent(),
                      observedFirstPaint: faker.datatype.number(500),
                      totalBlockingTime: faker.datatype.number(500),
                      observedLastVisualChangeTs: faker.time.recent(),
                      observedFirstVisualChange: faker.datatype.number(500),
                      observedLargestContentfulPaintTs: faker.time.recent(),
                      estimatedInputLatency: faker.datatype.number(100),
                      observedLoadTs: faker.time.recent(),
                      observedLastVisualChange: faker.datatype.number(1000),
                      firstCPUIdle: faker.datatype.number(1000),
                      interactive: faker.datatype.number(1000),
                      observedNavigationStartTs: faker.time.recent(),
                      observedNavigationStart: faker.datatype.number(10),
                      observedFirstMeaningfulPaintTs: faker.time.recent(),
                    },
                  ],
                },
              },
            },
            categories: {
              "best-practices": {
                id: "best-practices",
                title: "Best Practices",
                score: faker.datatype.float({max: 1}),
              },
              seo: {
                id: "seo",
                title: "SEO",
                score: faker.datatype.float({max: 1}),
              },
              accessibility: {
                id: "accessibility",
                title: "Accessibility",
                score: faker.datatype.float({max: 1}),
              },
              performance: {
                id: "performance",
                title: "Performance",
                score: faker.datatype.float({max: 1}),
              },
            },
          },
          analysisUTCTimestamp: `${faker.date.recent()}`,
        },
      })
    }
  }
}
