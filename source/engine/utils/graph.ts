// Imports
import * as d3 from "y/d3@7.8.5?pin=v133"
import { DOMParser } from "y/linkedom@0.16.4?pin=v133"

/** Graph */
export class Graph {
  /** Create a D3 SVG */
  private static svg({ width, height }: { width: number; height: number }) {
    const body = d3.select(new DOMParser().parseFromString(`<!DOCTYPE html><html><body></body></html>`, "text/html")!.body)
    const svg = body.append("svg")
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("width", `${width}`)
      .attr("height", `${height}`)
      .attr("class", "graph")
    return svg
  }

  /** Configuration */
  static readonly config = {
    width: 480,
    height: 315,
    title: {
      color: "var(--color-title)",
      fontsize: 14,
    },
    axis: {
      color: "rgba(127, 127, 127, .8)",
      fontsize: 12,
      opacity: 0.5,
    },
    legend: {
      width: 80,
      rect: [20, 10],
      fontsize: 12,
      margin: 2,
    },
    lines: {
      width: 2,
    },
    areas: {
      opacity: 0.1,
    },
    points: {
      radius: 2,
    },
    texts: {
      fontsize: 10,
    },
    margin: { top: 10, left: 10, right: 10, bottom: 45 },
  }

  /** Generate a random color for a given seed */
  private static color(seed: string) {
    let hex = 9
    for (let i = 0; i < seed.length;) {
      hex = Math.imul(hex ^ seed.charCodeAt(i++), 9 ** 9)
    }
    hex = hex ^ hex >>> 9
    const r = (hex & 0xff0000) >> 8 * 2
    const g = (hex & 0x00ff00) >> 8 * 1
    const b = (hex & 0x0000ff) >> 8 * 0
    return `rgb(${r}, ${g}, ${b})`
  }

  /** Create a time graph */
  static time(datalist: datalist, options?: options) {
    return this.graph("time", datalist, options)
  }

  /** Create a line graph */
  static line(datalist: datalist, options?: options) {
    return this.graph("line", datalist, options)
  }

  /** Create a generic graph */
  private static graph(type: string, datalist: datalist, { width = this.config.width, height = this.config.height, ...options }: options = {}) {
    // Create SVG
    const margin = this.config.margin
    const svg = this.svg({ width, height })

    // Prepare data
    const V = Object.values(datalist).flatMap(({ data }) => data.map(({ x, y }) => ({ x, y })))
    const start = Math.min(...V.map(({ x }) => Number(x)))
    const end = Math.max(...V.map(({ x }) => Number(x)))
    const extremum = Math.max(...V.map(({ y }) => y))
    const max = !Number.isNaN(Number(options.max)) ? options.max! : extremum
    const min = !Number.isNaN(Number(options.min)) ? options.min! : 0

    // X axis
    const x = ((type === "time" ? d3.scaleTime().domain([new Date(start), new Date(end)]) : d3.scaleLinear().domain([start, end])) as ReturnType<typeof d3.scaleLinear<number, number>>)
      .range([margin.top, width - margin.left - margin.right])
    let ticks = d3.axisBottom(x)
    if (options.ticks) {
      ticks = ticks.ticks(options.ticks)
    }
    if (options.labels) {
      ticks = ticks.tickFormat((_, i) => `${options.labels?.[i] ?? ""}`)
    }
    // @ts-ignore: type inference is too deep
    svg.append("g")
      .attr("transform", `translate(${margin.left},${height - margin.bottom})`)
      .call(ticks)
      .call((g: d3select) => g.select(".domain").attr("stroke", this.config.axis.color))
      .call((g: d3select) => g.selectAll(".tick line").attr("stroke-opacity", this.config.axis.opacity))
      .selectAll("text")
      .attr("transform", "translate(-5,5) rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", `${this.config.axis.fontsize}px`)
      .attr("fill", this.config.axis.color)

    // Y axis
    const y = d3.scaleLinear()
      .domain([max, min])
      .range([margin.left, height - margin.top - margin.bottom])
    // @ts-ignore: type inference is too deep
    svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .call(d3.axisRight(y).ticks(Math.round(height / 50)).tickSize(width - margin.left - margin.right))
      .call((g: d3select) => g.select(".domain").remove())
      .call((g: d3select) => g.selectAll(".tick line").attr("stroke-opacity", this.config.axis.opacity).attr("stroke-dasharray", "2,2"))
      .call((g: d3select) => g.selectAll(".tick text").attr("x", 0).attr("dy", -4))
      .selectAll("text")
      .style("font-size", `${this.config.axis.fontsize}px`)
      .attr("fill", this.config.axis.color)

    // Title
    if (options.title) {
      svg.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", this.config.title.fontsize)
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("stroke", "rgba(88, 166, 255, .05)")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 4)
        .attr("paint-order", "stroke fill")
        .style("font-size", `${this.config.title.fontsize}px`)
        .attr("fill", this.config.title.color)
        .text(options.title)
    }

    // Legend
    if (options.legend) {
      const config = this.config
      svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - margin.right - config.legend.width},${margin.top})`)
        .selectAll("g")
        .data(Object.entries(datalist).map(([name, { color = this.color(name) }]) => ({ name, color })))
        .enter()
        .each(function (this: d3arg, d: d3data, i: number) {
          d3.select(this)
            .append("rect")
            .attr("x", 0)
            .attr("y", i * (config.legend.fontsize + config.legend.margin) + (config.legend.fontsize - config.legend.rect[1]) / 2)
            .attr("width", config.legend.rect[0])
            .attr("height", config.legend.rect[1])
            .attr("stroke", d.color)
            .attr("fill", d.color)
            .attr("fill-opacity", config.areas.opacity)
          d3.select(this)
            .append("text")
            .attr("x", config.legend.rect[0] + 5)
            .attr("y", i * (config.legend.fontsize + config.legend.margin))
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "hanging")
            .attr("fill", d.color)
            .style("font-size", `${config.legend.fontsize}px`)
            .text(d.name)
        })
    }

    // Render series
    for (const [name, { color = this.color(name), lines = true, areas = true, points = true, texts = true, data }] of Object.entries(datalist)) {
      const X = data.map(({ x }) => x)
      const Y = data.map(({ y }) => y)
      const T = data.map(({ text }, i) => text ?? Y[i])
      const D = Y.map((y, i) => [X[i], y])
      const DT = Y.map((y, i) => [X[i], y, T[i]])

      // Graph lines
      if (lines) {
        svg.append("path")
          .datum(D)
          .attr("transform", `translate(${margin.left},${margin.top})`)
          .attr("d", d3.line().curve(d3.curveLinear).x((d) => x(d[0])).y((d) => y(d[1])) as d3arg)
          .attr("fill", "transparent")
          .attr("stroke", color)
          .attr("stroke-width", this.config.lines.width)
      }

      // Graph areas
      if (areas) {
        svg.append("path")
          .datum(D)
          .attr("transform", `translate(${margin.left},${margin.top})`)
          .attr("d", d3.area().curve(d3.curveLinear).x((d) => x(d[0])).y0((d) => y(d[1])).y1(() => y(min)) as d3arg)
          .attr("fill", color)
          .attr("fill-opacity", this.config.areas.opacity)
      }

      // Graph points
      if (points) {
        svg.append("g")
          .selectAll("circle")
          .data(DT)
          .join("circle")
          .attr("transform", `translate(${margin.left},${margin.top})`)
          .attr("cx", (d: d3data) => x(+d[0]))
          .attr("cy", (d: d3data) => y(+d[1]))
          .attr("r", this.config.points.radius)
          .attr("fill", color)
      }

      // Graph texts
      if (texts) {
        svg.append("g")
          .attr("fill", "currentColor")
          .attr("text-anchor", "middle")
          .attr("font-family", "sans-serif")
          .attr("font-size", `${this.config.texts.fontsize}px`)
          .attr("stroke", "rgba(88, 166, 255, .05)")
          .attr("stroke-linejoin", "round")
          .attr("stroke-width", 4)
          .attr("paint-order", "stroke fill")
          .selectAll("text")
          .data(DT)
          .join("text")
          .attr("transform", `translate(${margin.left},${margin.top - 4})`)
          .attr("x", (d: d3data) => x(+d[0]))
          .attr("y", (d: d3data) => y(+Number(d[1])))
          .text((d: d3data) => d[2])
          .attr("fill", this.config.axis.color)
      }
    }

    // SVG render
    return svg.node()!.outerHTML
  }

  /** Create a pie graph */
  static pie(
    datalist: Record<PropertyKey, { color?: string; data: number }>,
    { width = this.config.width, height = this.config.height, ...options }: Pick<options, "width" | "height" | "legend"> = {},
  ) {
    //Generate SVG
    const margin = this.config.margin
    const radius = Math.min(width, height) / 2
    const svg = this.svg({ width, height })

    // Prepare data
    const K = Object.keys(datalist)
    const V = Object.values(datalist)
    const I = d3.range(K.length).filter((i) => !Number.isNaN(V[i].data))
    const D = d3.pie().padAngle(1 / radius).sort(null).value((i) => V[+i].data)(I)
    const labels = d3.arc().innerRadius(radius / 2).outerRadius(radius / 2)

    // Graph areas
    svg.append("g")
      .attr("transform", `translate(${(width - (options.legend ? this.config.legend.width : 0)) / 2},${height / 2})`)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .selectAll("path")
      .data(D)
      .join("path")
      .attr("fill", (d: d3data) => V[+d.data].color ?? this.color(K[+d.data]))
      .attr("d", d3.arc().innerRadius(0).outerRadius(radius) as d3arg)
      .append("title")
      .text((d: d3data) => `${K[+d.data]}\n${V[+d.data].data}`)

    // Graph texts
    svg.append("g")
      .attr("transform", `translate(${(width - (options.legend ? this.config.legend.width : 0)) / 2},${height / 2})`)
      .attr("font-family", "sans-serif")
      .attr("font-size", `${this.config.texts.fontsize}px`)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("stroke", "rbga(0,0,0,.9)")
      .attr("paint-order", "stroke fill")
      .selectAll("text")
      .data(D)
      .join("text")
      .attr("transform", (d: d3data) => `translate(${labels.centroid(d)})`)
      .selectAll("tspan")
      .data((d: d3data) => {
        const lines = `${K[+d.data]}\n${V[+d.data].data}`.split(/\n/)
        return (d.endAngle - d.startAngle) > 0.25 ? lines : lines.slice(0, 1)
      })
      .join("tspan")
      .attr("x", 0)
      .attr("y", (_: unknown, i: number) => `${i * 1.1}em`)
      .attr("font-weight", (_: unknown, i: number) => i ? null : "bold")
      .text((d: d3data) => d)

    // Legend
    if (options.legend) {
      const config = this.config.legend
      svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - margin.right - config.width},${margin.top})`)
        .selectAll("g")
        .data(Object.keys(datalist).map(([name]) => ({ name, value: datalist[name].data, color: datalist[name].color ?? this.color(name) })))
        .enter()
        .each(function (this: d3arg, d: d3data, i: number) {
          d3.select(this)
            .append("rect")
            .attr("x", 0)
            .attr("y", i * (config.fontsize + config.margin) + (config.fontsize - config.rect[1]) / 2)
            .attr("width", config.rect[0])
            .attr("height", config.rect[1])
            .attr("fill", d.color)
          d3.select(this)
            .append("text")
            .attr("x", config.rect[0] + 5)
            .attr("y", i * (config.fontsize + config.margin))
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "hanging")
            .attr("fill", d.color)
            .style("font-size", `${config.fontsize}px`)
            .text(`${d.name} (${d.value})`)
        })
    }

    // SVG render
    return svg.node()!.outerHTML
  }

  /** Create a diff graph */
  static diff(
    datalist: Record<PropertyKey, { data: { date: Date; added: number; deleted: number; changed: number }[] }>,
    { title = "", opacity = this.config.areas.opacity, width = this.config.width, height = this.config.height } = {},
  ) {
    // Create SVG
    const margin = 5, offset = 34
    const svg = this.svg({ width, height })

    // Prepare data
    const K = Object.keys(datalist)
    const V = Object.values(datalist).flatMap(({ data }) => data)
    const start = new Date(Math.min(...V.map(({ date }) => Number(date))))
    const end = new Date(Math.max(...V.map(({ date }) => Number(date))))
    const extremum = Math.max(...V.flatMap(({ added, deleted, changed }) => [added + changed, deleted + changed]))

    // X axis
    const x = d3.scaleTime()
      .domain([start, end])
      .range([margin + offset, width - (offset + margin)])
    svg.append("g")
      .attr("transform", `translate(0,${height - (offset + margin)})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-5,5) rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", `${this.config.axis.fontsize}px`)

    // Y axis
    const y = d3.scaleLinear()
      .domain([extremum, -extremum])
      .range([margin, height - (offset + margin)])
    svg.append("g")
      .attr("transform", `translate(${margin + offset},0)`)
      .call(d3.axisLeft(y).tickFormat(d3.format(".2s")))
      .selectAll("text")
      .style("font-size", `${this.config.axis.fontsize}px`)

    // Graph areas
    for (const { type, sign, fill } of [{ type: "added", sign: +1, fill: "var(--diff-addition)" }, { type: "deleted", sign: -1, fill: "var(--diff-deletion)" }] as const) {
      const values = Object.entries(datalist).flatMap(([name, { data }]) => data.flatMap(({ date, ...diff }) => ({ date, [name]: sign * (diff[type] + diff.changed) })))
      svg
        .append("g")
        .selectAll("g")
        .data(d3.stack().keys(K)(values as d3arg))
        .join("path")
        .attr("d", d3.area().x((d) => x((d as d3arg).data.date)).y0((d) => y(d[0] || 0)).y1((d) => y(d[1] || 0)) as d3arg)
        .attr("fill", fill)
        .attr("fill-opacity", opacity)
    }

    // Title
    if (title) {
      svg.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", this.config.title.fontsize)
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("stroke", "rgba(88, 166, 255, .05)")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 4)
        .attr("paint-order", "stroke fill")
        .style("font-size", `${this.config.title.fontsize}px`)
        .attr("fill", this.config.title.color)
        .text(title)
    }

    // SVG render
    return svg.node()!.outerHTML
  }
}

/** D3 argument */
// deno-lint-ignore no-explicit-any
type d3arg = any

/** D3 data */
type d3data = d3arg

/** D3 selection */
type d3select = ReturnType<typeof d3.select>

/** Datalist */
type datalist<T = number> = Record<PropertyKey, {
  color?: string
  data: data<T>[]
  lines?: boolean
  areas?: boolean
  points?: boolean
  texts?: boolean
}>

/** Data */
type data<T = number> = {
  x: number | Date
  y: T
  text?: string
}

/** Graph options */
type options = {
  width?: number
  height?: number
  max?: number
  min?: number
  labels?: Record<PropertyKey, number | string>
  ticks?: number
  legend?: boolean
  title?: string
}
