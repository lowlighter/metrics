//Imports
  import path from "path"
  import fs from "fs"
  import build from "../utils/build.mjs"
  import url from "url"

//Initialization
  const __dirname =  path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..", "action")
  process.on("unhandledRejection", error => { throw error })

/** Test function */
  export default async function test() {
    //Perform tests
      await test.build()
  }

/** Build test */
  test.build = async function () {
    //Ensure that action has been rebuild
      console.log("### Checking that code has been rebuild")
      const action = `${await fs.promises.readFile(`${__dirname}/dist/index.js`)}`
      const code = await build()
      if (action !== code)
        throw new Error(`GitHub Action has not been rebuild. Run "npm run build" to solve this issue`)
  }

//Main
  if (/metrics.mjs/.test(process.argv[1])) {
    //Test
      await test()
      console.log("Test success !")
  }
