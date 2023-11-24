/// <reference lib="dom" />
/** Resize SVG height */
export default function () {
  const svg = document.querySelector("main svg")!
  const { y: height, width } = svg.querySelector("#metrics-end")!.getBoundingClientRect()
  svg.setAttribute("height", `${height}`)
  return { processed: new XMLSerializer().serializeToString(svg), height, width }
}
