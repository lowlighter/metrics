import { is, mock, Status } from "@utils/testing.ts"

export default {
  "/gists/{gist_id}": mock({ gist_id: is.string(), files: is.record(is.object({ content: is.string() })) }, () => ({
    status: Status.OK,
    data: {},
  })),
}
