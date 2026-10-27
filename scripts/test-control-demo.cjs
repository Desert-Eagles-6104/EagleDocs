const assert = require("node:assert/strict");
const { test } = require("node:test");
const load = require("./helpers/load-control-module.cjs");

const { demoConfig } = load("config/demo");
const { defaults } = load("model/defaults");
const { supports } = load("model/semantics");
const { createSimulation, advanceSimulation } = load("engine/simulation");

test("partial overrides preserve teaching presets and defaults", () => {
  const cfg = demoConfig("gravity", { duration: 10, a: { kp: 3 } });
  assert.equal(cfg.mechanism, "arm");
  assert.equal(cfg.compare, true);
  assert.equal(cfg.a.kp, 3);
  assert.equal(cfg.a.i, false);
  assert.equal(cfg.b.method, "combined");
  assert.equal(defaults.a.kp, 8);
});

test("public goal selects the quantity and direct experiments default to an output graph", () => {
  const cfg = demoConfig(undefined, {
    goal: "velocity",
    mechanism: "wheel",
    target: 8,
    a: { method: "bang" },
  });
  assert.ok(supports(cfg, cfg.a));
  assert.equal(cfg.request, "velocity");
  assert.deepEqual(cfg.graphs, ["response"]);
  assert.deepEqual(demoConfig("open").graphs, ["output"]);
  assert.deepEqual(demoConfig("open", {}, []).graphs, []);
});

test("instances own independent controller and graph settings", () => {
  const first = demoConfig("p");
  const second = demoConfig("p");
  first.a.kp = 20;
  first.graphs.push("output");
  assert.equal(second.a.kp, 8);
  assert.deepEqual(second.graphs, ["response"]);
  assert.equal(demoConfig("p").a.kp, 8);
});

test("embedded examples finish with finite states and reject unknown presets", () => {
  for (const cfg of [
    demoConfig("gravity", { duration: 10 }),
    demoConfig("p", { duration: 8, a: { kp: 2 } }),
  ]) {
    const simulation = createSimulation();
    let result;
    do {
      result = advanceSimulation(simulation, cfg, 80);
    } while (!result.finished && !result.blocked);
    assert.equal(result.finished, true);
    assert.ok(
      Object.values(simulation.a).every(
        (value) => typeof value === "boolean" || Number.isFinite(value),
      ),
    );
  }
  assert.throws(() => demoConfig("missing"), /Unknown ControlDemo preset/);
  assert.equal(
    demoConfig(undefined, { duration: Infinity, a: { kp: -10 } }).a.kp,
    0,
  );
});
