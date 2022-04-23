//Imports
import urls from "url"

/**Mocked data */
export default function({faker, url, body, login = faker.internet.userName()}) {
  if (/^https:..accounts.spotify.com.api.token.*$/.test(url)) {
    //Access token generator
    const params = new urls.URLSearchParams(body)
    if ((params.get("grant_type") === "refresh_token") && (params.get("client_id") === "MOCKED_CLIENT_ID") && (params.get("client_secret") === "MOCKED_CLIENT_SECRET") && (params.get("refresh_token") === "MOCKED_REFRESH_TOKEN")) {
      console.debug(`metrics/compute/mocks > mocking spotify api result > ${url}`)
      return ({
        status: 200,
        data: {
          access_token: "MOCKED_TOKEN_ACCESS",
          token_type: "Bearer",
          expires_in: 3600,
          scope: "user-read-recently-played user-read-private",
        },
      })
    }
  }
}
