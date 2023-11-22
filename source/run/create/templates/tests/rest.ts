import { mock, Status } from "@engine/utils/testing.ts"

export default {
  "/zen": mock({}, () => ({
    status: Status.OK,
    data: new TextEncoder().encode("Anything added dilutes everything else."),
  })),
}
