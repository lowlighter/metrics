//Imports
import listEventsForAuthenticatedUser from "./listEventsForAuthenticatedUser.mjs"

/**Mocked data */
export default async function({faker}, target, that, [{username: login, page, per_page}]) {
  console.debug("metrics/compute/mocks > mocking rest api result > rest.activity.listRepoEvents")
  return listEventsForAuthenticatedUser(...arguments)
}
