//Imports
  import build from "../utils/build.mjs"
  import colors from "colors"

//Initialization
  process.on("unhandledRejection", error => { throw error })
  colors.enable()

/** Test function */
  export default async function test() {
    //Perform tests
      await test.build()
  }

/** Build test */
  test.build = async function () {
    //Ensure that code has been rebuild
      console.log("TEST : build".cyan)
      await build({actions:["check"]})
  }

//Main
  if (/metrics.mjs/.test(process.argv[1])) {
    //Test
      await test()
      console.log("Test success !".green)
  }
