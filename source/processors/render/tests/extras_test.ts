import mod from "@processors/render/mod.ts"
import { expect, t, test } from "@engine/utils/testing.ts"

class Processor extends mod {
  constructor(context = {} as test) {
    super(context)
  }
}

Deno.test(t(mod.meta, "handles unexisting templates gracefully"), { permissions: "none" }, () => {
  const processor = new Processor()
  expect((processor as test).load("test", "unexisting_path")).to.be.eventually.equal("")
})
