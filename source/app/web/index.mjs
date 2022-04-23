import app from "./instance.mjs"
;(async function() {
  await app({sandbox: process.env.SANDBOX})
})()
