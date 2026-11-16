const assert = require("node:assert/strict");
const { test } = require("node:test");
const load = require("./helpers/load-control-module.cjs");

const { demoConfig } = load("config/demo");
const { defaults } = load("model/defaults");
const { supports } = load("model/semantics");
const { createSimulation, advanceSimulation } = load("engine/simulation");
const { step } = load("engine/step");

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

test("initial speed changes position but not the first P correction", () => {
  const cfg = demoConfig("p", {
    mechanism: "slide",
    target: 1.5,
    a: { kp: 2 },
  });
  const atRest = createSimulation();
  const moving = createSimulation(3);
  assert.equal(atRest.a.x, moving.a.x);
  assert.equal(moving.a.v, 3);
  const restStep = step(atRest.a, cfg, cfg.a);
  const movingStep = step(moving.a, cfg, cfg.a);
  assert.equal(restStep.output, 3);
  assert.equal(movingStep.output, restStep.output);
  assert.ok(movingStep.x > restStep.x);
});

test("the horizontal slide illustrates cutoff, P tuning, and D damping", () => {
  function run(a, tolerance = 0.05) {
    const cfg = demoConfig(undefined, {
      mechanism: "slide",
      goal: "position",
      target: 1.5,
      tolerance,
      duration: 8,
      damping: 1.2,
      friction: 0.1,
      a: { p: true, i: false, d: true, ...a },
    });
    const simulation = createSimulation();
    const states = [];
    let result;
    do {
      result = advanceSimulation(simulation, cfg, 80);
      states.push(...result.samples.map((sample) => sample.a));
    } while (!result.finished && !result.blocked);
    return { states, final: simulation.a };
  }

  const unpowered = run({ kp: 0, kd: 0 });
  assert.equal(unpowered.final.x, 0);
  assert.equal(unpowered.final.settledAt, -1);
  const fixed = run({ method: "open", output: 3, stop: "target" }, 0.005);
  const cutoff = fixed.states.find((state) => state.stoppedAt >= 0);
  assert.ok(cutoff.x >= 1.495 && cutoff.x <= 1.55);
  assert.equal(cutoff.output, 0);
  assert.ok(fixed.final.x > 1.55);

  const p = run({ kp: 8, kd: 0 });
  const lowP = run({ kp: 0.8, kd: 0 });
  const firstEntry = (states) => states.find((state) => state.x >= 1.45).t;
  assert.ok(firstEntry(lowP.states) > firstEntry(p.states));
  assert.ok(lowP.states.every((state) => state.x <= 1.55));
  assert.ok(
    lowP.final.settledAt > 0 && lowP.final.settledAt < p.final.settledAt,
  );
  const pd = run({ kp: 8, kd: 3 });
  const pdEntry = firstEntry(pd.states);
  assert.ok(p.states.some((state) => state.x > 1.55));
  assert.ok(pd.states.every((state) => state.x <= 1.55));
  assert.ok(pdEntry < firstEntry(lowP.states));
  assert.ok(
    pd.final.settledAt > 0 && pd.final.settledAt < lowP.final.settledAt,
  );
  assert.ok(pd.states.every((state) => state.t < pdEntry || state.x >= 1.45));
});
