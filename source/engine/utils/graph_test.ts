import { expect, t } from "@engine/utils/testing.ts"
import { Graph } from "@engine/utils/graph.ts"

const svg = /^<svg.*?>[\s\S]+<\/svg>$/

Deno.test(t(import.meta, "`.line()` returns a graph"), { permissions: "none" }, () => {
  expect(Graph.line({
    A: {
      data: [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 3, y: 4 }],
    },
    B: {
      data: [{ x: 0.5, y: 1.5, text: "B0" }, { x: 2.5, y: 2, text: "B1" }],
    },
  })).to.match(svg)
  expect(Graph.line({
    A: {
      data: [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 3, y: 4 }],
    },
    B: {
      data: [{ x: 0.5, y: 1.5, text: "B0" }, { x: 2.5, y: 2, text: "B1" }],
    },
  }, { min: 0, max: 5, ticks: 4, labels: { 0: "0" }, legend: true, title: "title" })).to.match(svg)
})

Deno.test(t(import.meta, "`.time()` returns a graph"), { permissions: "none" }, () => {
  expect(Graph.time({
    A: {
      data: [{ x: new Date("2000"), y: 1 }, { x: new Date("2010"), y: 2 }, { x: new Date("2020"), y: 1 }, { x: new Date("2030"), y: 4 }],
    },
    B: {
      data: [{ x: new Date("2005"), y: 1.5, text: "B0" }, { x: new Date("2025"), y: 2, text: "B1" }],
    },
  })).to.match(svg)
})

Deno.test(t(import.meta, "`.pie()` returns a graph"), { permissions: "none" }, () => {
  expect(Graph.pie({
    A: { data: 0.6 },
    B: { data: 0.2 },
    C: { data: 0.1 },
  }, { legend: true })).to.match(svg)
  expect(Graph.pie({
    A: { data: 0.6 },
    B: { data: 0.2 },
    C: { data: 0.9999 },
    D: { data: 0.0001 },
  }, { legend: false })).to.match(svg)
})

Deno.test(t(import.meta, "`.diff()` returns a graph"), { permissions: "none" }, () => {
  expect(Graph.diff({
    A: { data: [{ date: new Date("2019"), added: 100, deleted: 20, changed: 12 }] },
    B: { data: [{ date: new Date("2020"), added: 40, deleted: 23, changed: 20 }, { date: new Date("2021"), added: 54, deleted: 12, changed: 30 }] },
    C: { data: [{ date: new Date("2021"), added: 0, deleted: 30, changed: 10 }] },
  })).to.match(svg)
})
