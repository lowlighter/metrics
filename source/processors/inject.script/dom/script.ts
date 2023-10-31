/// <reference lib="dom" />
/** Executes script */
export default async function (script: string) {
  await new Function("document", `return (async () => { ${script} })()`)(document)
  return document.querySelector("main")!.innerHTML
}
