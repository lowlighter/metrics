//Imports
  import app from "./src/app.mjs"

//Start app
  await app({mock:process.env.USE_MOCKED_DATA})