import { mock, Status, is } from "@engine/utils/testing.ts"

export default {
  "/users/{username}": mock({username: is.string()}, ({username:login}) => ({
    status: Status.OK,
    data: {
      login,
      type: {github:"Organization"}[login] ?? "User",
      blog: "https://github.blog",
      twitter_username: "github",
      created_at: "2020-01-01T00:00:00Z",
    }
  })),
}
