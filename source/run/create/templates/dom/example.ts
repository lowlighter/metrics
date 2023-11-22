/// <reference lib="dom" />
/** Example function */
export default function (foo: string) {
  return { foo, main: document.querySelector("main")?.innerHTML }
}
