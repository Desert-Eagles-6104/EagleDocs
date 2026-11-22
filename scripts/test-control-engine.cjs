const assert = require("node:assert/strict");
const { test } = require("node:test");
const load = require("./helpers/load-control-module.cjs");
const baseline = require("./fixtures/control-simulation.json");
const { defaults } = load("model/defaults");
const { initial, step } = load("engine/step");
const { presets } = load("config/presets");
const { validate } = load("config/validation");
const { readConfig, serialize } = load("config/url");

test("all teaching experiments preserve their pre-refactor trajectories", () => {
  for (const [name, preset] of Object.entries(presets)) {
    const cfg = validate({ ...defaults, ...preset.config });
    let a = initial();
    let b = initial();
    const samples = [];
    for (let tick = 1; tick <= 2000; tick++) {
      const disturbance = tick > 500 && tick < 600 ? cfg.disturbance : 0;
      a = step(a, cfg, cfg.a, disturbance);
      if (cfg.compare) b = step(b, cfg, cfg.b, disturbance);
      if ([1, 200, 600, 2000].includes(tick)) samples.push({ a, b });
    }
    // JSON fixtures canonicalize signed zero, but preserve every other value.
    assert.deepEqual(JSON.parse(JSON.stringify(samples)), baseline[name], name);
  }
});

test("URL configurations preserve both controllers and preset links", () => {
  for (const [name, preset] of Object.entries(presets)) {
    const cfg = validate({ ...defaults, ...preset.config });
    assert.deepEqual(readConfig(serialize(cfg)), cfg);
    assert.deepEqual(readConfig("?preset=" + name), cfg);
    assert.deepEqual(
      readConfig("?experiment=" + encodeURIComponent(JSON.stringify(cfg))),
      cfg,
    );
  }
  assert.deepEqual(readConfig("?experiment=broken"), validate(defaults));
  assert.deepEqual(
    readConfig("?experiment=" + "x".repeat(40000)),
    validate(defaults),
  );
});
