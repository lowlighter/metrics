import { is, mock } from "@testing"

export default {
  "/gists/{gist_id}": mock({ gist_id: is.string(), files: is.record(is.object({ content: is.string() })) }, () => ({
    status: 200,
    data: {},
  })),
}
