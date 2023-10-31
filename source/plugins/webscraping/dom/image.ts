/// <reference lib="dom" />
/** Returns dimensions from selected element */
export default function (selector: string) {
  const { x, y, width, height } = document.querySelector(selector)!.getBoundingClientRect()
  return { x, y, width, height }
}
