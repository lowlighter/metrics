import mock from "@processors/publish.git/tests/commit.graphql.ts"
import { expect, MetricsError, t } from "@engine/utils/testing.ts"

Deno.test(t(import.meta, '`commit.graphql` mock throws if `"unchanged"` is in path'), { permissions: "none" }, () => {
  expect(() => mock({ repository: "octocat/repo", branch: "branch", message: "", path: "file-unchanged", contents: "", head: "" })).to.throw(MetricsError, /expected .* to not be called/i)
})
