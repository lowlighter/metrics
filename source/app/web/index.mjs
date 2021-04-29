import app from "./instance.mjs"
;(async function() {
  await app({mock:process.env.USE_MOCKED_DATA, nosettings:process.env.NO_SETTINGS})
})()
