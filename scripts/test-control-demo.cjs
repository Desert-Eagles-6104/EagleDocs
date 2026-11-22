const assert = require("node:assert/strict");
const { test } = require("node:test");
const load = require("./helpers/load-control-module.cjs");

const { demoConfig } = load("config/demo");
const { defaults } = load("model/defaults");
const { supports } = load("model/semantics");
const { createSimulation, advanceSimulation } = load("engine/simulation");
const { step } = load("engine/step");
const { experimentConfig } = load("config/experiment");
const { serialize, readConfig } = load("config/url");
const { graphModel } = load("view-model/graphs");

test("author units convert gains, targets, damping and initial conditions together", () => {
  const rotation = 2 * Math.PI;
  const canonical = experimentConfig({
    mechanism: "wheel",
    request: "velocity",
    target: rotation,
    tolerance: 0.05 * rotation,
    noise: 0.01 * rotation,
    initialVelocity: 0.5 * rotation,
    damping: 0.6 / rotation,
    a: {
      kp: 2 / rotation,
      kv: 0.6 / rotation,
      i: false,
      d: false,
      method: "combined",
    },
  });
  const rotations = experimentConfig({
    mechanism: "wheel",
    request: "velocity",
    units: { angle: "rev" },
    target: 1,
    tolerance: 0.05,
    noise: 0.01,
    initialVelocity: 0.5,
    damping: 0.6,
    a: { kp: 2, kv: 0.6, i: false, d: false, method: "combined" },
  });
  for (const key of [
    "target",
    "noise",
    "initialVelocity",
    "tolerance",
    "damping",
  ]) {
    assert.ok(Math.abs(rotations[key] - canonical[key]) < 1e-12, key);
  }
  for (const key of ["kp", "kv"]) {
    assert.ok(Math.abs(rotations.a[key] - canonical.a[key]) < 1e-12, key);
  }
  const first = createSimulation(canonical.initialVelocity);
  const second = createSimulation(rotations.initialVelocity);
  advanceSimulation(first, canonical, 80);
  advanceSimulation(second, rotations, 80);
  assert.ok(Math.abs(first.a.v - second.a.v) < 1e-12);
  assert.ok(Math.abs(first.a.output - second.a.output) < 1e-12);
  assert.deepEqual(readConfig(serialize(rotations)), rotations);
  const graph = graphModel(
    [{ a: second.a, b: second.b }],
    "response",
    rotations,
  );
  assert.equal(graph.unit + graph.suffix, "rev/s");
  assert.equal(graph.series[1].values[0], 1);
});

test("centimetres and degrees preserve physical values, including feedforward coefficients", () => {
  const centimetres = experimentConfig({
    mechanism: "slide",
    units: { length: "cm" },
    target: 150,
    tolerance: 5,
    initialVelocity: 20,
    a: { kp: 0.08, kv: 0.006, ka: 0.01, vmax: 80, amax: 100 },
  });
  assert.equal(centimetres.target, 1.5);
  assert.equal(centimetres.tolerance, 0.05);
  assert.equal(centimetres.initialVelocity, 0.2);
  assert.equal(centimetres.a.kp, 8);
  assert.equal(centimetres.a.kv, 0.6);
  assert.equal(centimetres.a.ka, 1);
  assert.equal(centimetres.a.vmax, 0.8);
  const degrees = experimentConfig({
    mechanism: "arm",
    units: { angle: "deg" },
    target: 45,
  });
  assert.ok(Math.abs(degrees.target - Math.PI / 4) < 1e-12);
});

test("the config-only embed API exposes full settings and keeps instance state independent", () => {
  const options = {
    request: "velocity",
    mechanism: "wheel",
    units: { angle: "rev" },
    target: 1,
    controls: {
      experiment: "all",
      a: ["method", "p", "kp", "stop", "stopAfter"],
    },
    view: { graphSelection: true, disturbance: true },
    graphs: ["response", "output"],
  };
  const first = demoConfig(undefined, options);
  const second = demoConfig(undefined, options);
  assert.equal(first.target, 2 * Math.PI);
  assert.equal(first.controls.experiment, "all");
  assert.deepEqual(first.controls.a, options.controls.a);
  assert.deepEqual(first.graphs, options.graphs);
  assert.equal(first.view.disturbance, true);
  first.controls.a.push("kd");
  first.units.angle = "deg";
  first.view.mechanism = false;
  assert.deepEqual(second.controls.a, options.controls.a);
  assert.equal(second.units.angle, "rev");
  assert.equal(second.view.mechanism, true);
  const invalid = experimentConfig({
    units: { angle: "bogus" },
    controls: {
      a: ["notAControllerField", { key: "kp", as: "toggle", on: Infinity }],
    },
  });
  assert.equal(invalid.units.angle, "rad");
  assert.deepEqual(invalid.controls.a, []);
});

test("partial overrides preserve teaching presets and defaults", () => {
  const cfg = demoConfig("gravity", { duration: 10, a: { kp: 3 } });
  assert.equal(cfg.mechanism, "arm");
  assert.equal(cfg.compare, true);
  assert.equal(cfg.a.kp, 3);
  assert.equal(cfg.a.i, false);
  assert.equal(cfg.b.method, "combined");
  assert.equal(defaults.a.kp, 8);
});

test("request selects the quantity and direct experiments default to an output graph", () => {
  const cfg = demoConfig(undefined, {
    request: "velocity",
    mechanism: "wheel",
    target: 8,
    a: { method: "bang" },
  });
  assert.ok(supports(cfg, cfg.a));
  assert.equal(cfg.request, "velocity");
  assert.deepEqual(cfg.graphs, ["response"]);
  assert.deepEqual(demoConfig("open").graphs, ["output"]);
  assert.deepEqual(demoConfig("open", { graphs: [] }).graphs, []);
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
      request: "position",
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
