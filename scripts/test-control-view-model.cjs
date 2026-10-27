const assert = require("node:assert/strict");
const { test } = require("node:test");
const load = require("./helpers/load-control-module.cjs");
const { graphModel } = load("view-model/graphs");
const { targetModel } = load("view-model/target");
const { defaults } = load("model/defaults");
const { initial } = load("engine/step");

test("velocity plots compare measured speed with each controller's reference", () => {
  const state = { ...initial(), x: 2, v: 7, reference: 8 };
  const cfg = {
    ...defaults,
    mechanism: "wheel",
    request: "velocity",
    compare: true,
  };
  const graph = graphModel(
    [{ a: state, b: { ...state, v: 6 } }],
    "response",
    cfg,
  );
  assert.deepEqual(
    graph.series.map((series) => series.values),
    [[7], [6], [8], [8]],
  );
  assert.equal(graph.unit + graph.suffix, "rad/s");
  assert.ok(Number.isFinite(graph.min) && graph.max > graph.min);
});

test("empty charts remain renderable and torque goals use current units and limits", () => {
  const graph = graphModel([], "terms", defaults);
  assert.ok(graph.max > graph.min);
  assert.equal(graph.series.length, 4);
  const input = targetModel({ ...defaults, request: "torque", demand: 5 });
  assert.equal(input.direct, true);
  assert.equal(input.unit, "A");
  assert.deepEqual([input.min, input.max, input.value], [-40, 40, 5]);
});
