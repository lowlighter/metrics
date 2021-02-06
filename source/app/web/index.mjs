//Imports
  import app from "./instance.mjs"

//Start app
  (async function() {
    await app({mock:process.env.USE_MOCKED_DATA, nosettings:process.env.NO_SETTINGS})
  })()
