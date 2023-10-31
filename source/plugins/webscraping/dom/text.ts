/// <reference lib="dom" />
/** Returns text from selected element */
export default function (selector: string) {
  return (document.querySelector(selector) as unknown as { innerText: string }).innerText
}
