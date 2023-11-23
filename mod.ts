import { Plugin } from "@engine/components/plugin.ts";

console.log(await Plugin.run({
  context: {
    id: "introduction",
    entity: "user",
    handle: "octocat",
    retries: {},
    mock: true
  }
}))