/// <reference lib="dom" />
/** Inject scoped CSS */
export default function (scope: string, style: string) {
  // List CSS rules
  const virtual = document.implementation.createHTMLDocument(""), tag = document.createElement("style")
  tag.textContent = style
  virtual.body.appendChild(tag)
  let styled = ""
  for (const { selectorText: selectors, cssText: rule } of Object.values(tag.sheet!.cssRules) as CSSStyleRule[]) {
    const parsed = selectors.split(",").map((selector: string) => selector.trim()) as string[]
    styled += rule.replace(selectors, parsed.flatMap((selector) => [`[${scope}]${selector}`, `[${scope}] ${selector}`]).join(","))
  }
  tag.textContent = styled
  // Inject CSS
  const main = document.querySelector("main")!
  main.appendChild(tag)
  document.querySelectorAll("main > *:not(style)").forEach((element) => element.setAttribute(scope, "true"))
  return main.innerHTML
}
