import mod, { Renderer } from "@processors/render.content/mod.ts"
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

Deno.test(t(mod.meta, "renderer is a valid plugin"), { permissions: "none" }, () => {
  const renderer = new Renderer({} as test)
  expect((renderer as test).action()).to.be.fulfilled
})
