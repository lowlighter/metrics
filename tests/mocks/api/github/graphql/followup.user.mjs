/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > followup/user")
  return ({
    issues_open: {issueCount: faker.number.int(100)},
    issues_drafts: {issueCount: faker.number.int(100)},
    issues_skipped: {issueCount: faker.number.int(100)},
    issues_closed: {issueCount: faker.number.int(100)},
    pr_open: {issueCount: faker.number.int(100)},
    pr_drafts: {issueCount: faker.number.int(100)},
    pr_closed: {issueCount: faker.number.int(100)},
    pr_merged: {issueCount: faker.number.int(100)},
  })
}
