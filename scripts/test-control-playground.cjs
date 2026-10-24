const ts = require("typescript");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { test } = require("node:test");
// Compile only the pure modules in memory; no generated files or extra dependency.
const cache = {};
function load(name) {
  if (cache[name]) return cache[name].exports;
  const filename = path.join(
    __dirname,
    "../src/components/ControlPlayground",
    name + ".ts",
  );
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const mod = { exports: {} };
  cache[name] = mod;
  new Function("require", "module", "exports", code)(
    (s) => load(s.replace("./", "")),
    mod,
    mod.exports,
  );
  return mod.exports;
}
const { controller, defaults, initial, step, pid, feedforward, DT } =
  load("engine");
const { profile } = load("profiles");
const { validate, serialize, readConfig, presets } = load("config");
test("output cutoff latches without freezing motion or claiming settling", () => {
  const cfg = { ...defaults, target: 1, friction: 0 };
  const c = {
    ...controller,
    method: "combined",
    stop: "target",
    stopAfter: 2,
    output: 5,
  };
  let s = step({ ...initial(), x: 1.1, v: 1 }, cfg, c);
  assert.equal(s.output, 0);
  assert.equal(s.stoppedAt, 0);
  assert.ok(s.x > 1.1);
  assert.equal(s.settledAt, -1);
  s = step({ ...s, x: 0.8 }, cfg, c);
  assert.equal(s.output, 0);
  const negative = step(
    { ...initial(), x: -0.9 },
    { ...cfg, mechanism: "arm", target: -0.8 },
    c,
  );
  assert.equal(negative.output, 0);
  const timed = step({ ...initial(), t: 2 }, cfg, { ...c, stop: "time" });
  assert.equal(timed.output, 0);
  const free = step({ ...initial(), t: 2 }, cfg, { ...c, stop: "none" });
  assert.ok(free.output > 0);
  const autoFF = step(
    { ...initial(), t: 8 },
    { ...cfg, request: "velocity" },
    {
      ...controller,
      method: "ff",
    },
  );
  assert.equal(autoFF.output, 0);
  assert.equal(initial().stoppedAt, -1);
});
test("settling requires final-target accuracy, slow motion and continuous dwell; excursions revoke it", () => {
  const { settlingStatus } = load("engine");
  let s = initial();
  for (let i = 0; i < 120; i++) {
    const result = settlingStatus(s, defaults, defaults.target, 0);
    s = { ...s, ...result, t: s.t + DT };
    if (i < 100) assert.equal(s.settledAt, -1);
  }
  assert.ok(Math.abs(s.settledAt - DT) < 1e-9);
  assert.equal(
    settlingStatus(s, defaults, defaults.target + 0.1, 0).settledAt,
    -1,
  );
  assert.equal(settlingStatus(s, defaults, defaults.target, 0.2).settledAt, -1);
  assert.equal(settlingStatus(initial(), defaults, 0, 0).settledAt, -1);
  const velocityCfg = { ...defaults, mechanism: "wheel", target: 8 };
  assert.equal(settlingStatus(s, velocityCfg, 8, 1).settledAt, -1);
});
test("new experiment settings round-trip and legacy URLs get safe defaults", () => {
  const cfg = validate({
    ...defaults,
    compare: true,
    duration: 20,
    tolerance: 0.05,
    rateTolerance: 0.1,
    dwell: 1,
    a: { ...controller, stop: "target", stopAfter: 3 },
    b: { ...controller, stop: "time", stopAfter: 5 },
  });
  assert.deepEqual(readConfig(serialize(cfg)), cfg);
  assert.equal(validate({}).compare, false);
  assert.equal(
    validate({ a: { stop: "bad", stopAfter: -4 }, duration: Infinity }).a
      .stopAfter,
    0.1,
  );
  assert.equal(readConfig("?preset=profiles").compare, true);
  assert.equal(readConfig("?preset=tuned").compare, false);
});
test("every teaching preset remains finite and identical controllers stay synchronized", () => {
  for (const preset of Object.values(presets)) {
    const cfg = validate({ ...defaults, ...preset.config });
    let a = initial(),
      b = initial();
    for (let i = 0; i < 4000; i++) {
      a = step(a, cfg, cfg.a, i > 500 && i < 600 ? cfg.disturbance : 0);
      b = step(b, cfg, cfg.a, i > 500 && i < 600 ? cfg.disturbance : 0);
      assert.ok(
        Object.values(a).every(
          (v) => typeof v === "boolean" || Number.isFinite(v),
        ),
      );
    }
    assert.deepEqual(a, b);
  }
});
test("PID terms and conditional integration", () => {
  const c = { ...controller, kp: 2, ki: 3, kd: 4 };
  assert.deepEqual(pid(c, 1, 2, 0, 0, 12), {
    p: 2,
    i: 3 * DT,
    d: 8,
    integral: DT,
  });
  assert.equal(pid(c, 10, 0, 0, 0, 1).integral, 0);
  assert.equal(
    pid({ ...c, antiWindup: false }, 10, 0, 0, 0, 1).integral,
    10 * DT,
  );
  assert.equal(pid({ ...c, i: false }, 1, 0, 10, 0, 12).i, 0);
  assert.ok(pid(c, -1, 0, 10, 0, 1).integral < 10);
});
test("feedforward terms and angle-dependent gravity", () => {
  assert.equal(feedforward(controller, 2, 3, 0, "elevator"), 0.3 + 1.6 + 3 + 2);
  assert.ok(
    Math.abs(feedforward(controller, 0, 0, Math.PI / 2, "arm")) < 1e-12,
  );
  assert.ok(Math.abs(feedforward(controller, -2, 0, 0, "wheel") + 1.9) < 1e-12);
});
test("profile endpoints, velocity, acceleration and S-curve jerk constraints", () => {
  for (const kind of ["trapezoid", "scurve"])
    for (const distance of [0, 0.05, 2, -2, 20]) {
      let prev = profile(kind, distance, 0, 1, 2, 8);
      assert.ok(Math.abs(prev.p) < 1e-12);
      for (let t = DT; t < 50; t += DT) {
        const r = profile(kind, distance, t, 1, 2, 8);
        assert.ok(Math.abs(r.v) <= 1 + 1e-8);
        assert.ok(Math.abs(r.a) <= 2 + 1e-8);
        if (kind === "scurve")
          assert.ok(Math.abs(r.a - prev.a) / DT <= 8 + 1e-8);
        prev = r;
      }
      assert.equal(prev.p, distance);
      assert.ok(Math.abs(prev.v) < 1e-12);
      assert.ok(Math.abs(prev.a) < 1e-12);
    }
});
test("deterministic stepping, gravity, physical limits and output clamping", () => {
  function run() {
    let s = initial();
    for (let i = 0; i < 2000; i++)
      s = step(s, defaults, controller, i > 500 && i < 600 ? -4 : 0);
    return s;
  }
  assert.deepEqual(run(), run());
  assert.ok(Math.abs(run().x - defaults.target) < 0.12);
  let s = initial();
  for (let i = 0; i < 3000; i++) {
    s = step(
      s,
      { ...defaults, request: "voltage", demand: 30 },
      {
        ...controller,
        method: "open",
        output: 30,
        stop: "none",
      },
    );
    assert.ok(s.x >= 0 && s.x <= 3);
    assert.ok(s.output <= 12);
  }
  assert.equal(s.x, 3);
  const rest = { ...initial(), x: 1 };
  assert.ok(
    step(
      rest,
      { ...defaults, request: "voltage", demand: 0 },
      { ...controller, method: "open" },
    ).v < 0,
  );
});
test("bang-bang hysteresis remembers its previous state inside the band", () => {
  const cfg = {
    ...defaults,
    request: "velocity",
    mechanism: "wheel",
    target: 8,
  };
  const c = { ...controller, method: "bang", hysteresis: 0.5 };
  assert.equal(step({ ...initial(), v: 8, on: true }, cfg, c).output, c.high);
  assert.equal(step({ ...initial(), v: 8, on: false }, cfg, c).output, c.low);
  assert.equal(step({ ...initial(), v: 9, on: true }, cfg, c).output, c.low);
});
test("request quantities use distinct output semantics", () => {
  const cfg = {
    ...defaults,
    section: "requests",
    battery: 8,
    demand: 50,
    request: "duty",
  };
  const directController = { ...controller, method: "open" };
  assert.equal(step(initial(), cfg, directController).output, 4);
  assert.equal(
    step(
      initial(),
      { ...cfg, request: "voltage", demand: 12 },
      directController,
    ).output,
    8,
  );
  assert.equal(
    step(initial(), { ...cfg, request: "torque", demand: 20 }, directController)
      .output,
    20,
  );
});
test("shared URLs restore both controllers and reject malformed values", () => {
  const c = validate({
    ...defaults,
    graphs: ["terms", "velocity"],
    b: { ...controller, method: "profile", profile: "scurve" },
  });
  assert.deepEqual(readConfig(serialize(c)), c);
  assert.deepEqual(readConfig("?experiment=broken"), validate(defaults));
  assert.equal(
    validate({ a: { kp: Infinity, method: "__proto__" }, target: 999 }).target,
    3,
  );
  assert.equal(validate({ a: { kp: -100 } }).a.kp, 0);
  for (const key of Object.keys(presets))
    assert.deepEqual(
      readConfig("?preset=" + key),
      validate({ ...defaults, ...presets[key].config }),
    );
});

test("request controls compatibility while each controller keeps its algorithm", () => {
  const { supports, isVelocity, supportedMethods } = load("engine");
  const velocity = {
    ...defaults,
    request: "velocity",
    mechanism: "wheel",
    target: 8,
  };
  const a = { ...controller, method: "pid", kp: 0.5, ki: 0, kd: 0 };
  const b = { ...controller, method: "bang", high: 10 };
  assert.equal(step(initial(), velocity, a).output, 4);
  assert.equal(step(initial(), velocity, b).output, 10);
  const changed = validate({
    ...velocity,
    request: "position",
    a,
    b,
    compare: true,
  });
  assert.equal(changed.b.method, "bang");
  assert.equal(supports(changed, changed.b), false);
  assert.throws(() => step(initial(), changed, changed.b), /Unsupported/);
  assert.equal(
    isVelocity({ ...defaults, mechanism: "wheel", request: "position" }),
    false,
  );
  assert.equal(
    isVelocity({ ...defaults, mechanism: "elevator", request: "velocity" }),
    true,
  );
  for (const [request, methods] of Object.entries(supportedMethods))
    for (const method of methods) {
      assert.doesNotThrow(() =>
        step(initial(), { ...defaults, request }, { ...controller, method }),
      );
    }
  const magic = { ...defaults, request: "magic" };
  const p = step(initial(), magic, { ...controller, method: "pid" }),
    combined = step(initial(), magic, { ...controller, method: "combined" });
  assert.equal(p.reference, combined.reference);
  assert.notEqual(p.output, combined.output);
  assert.ok(p.reference < magic.target);
  assert.equal(supports(magic, { ...controller, profile: "direct" }), false);
  for (const preset of Object.values(presets)) {
    const cfg = validate({ ...defaults, ...preset.config });
    assert.ok(supports(cfg, cfg.a));
    if (cfg.compare) assert.ok(supports(cfg, cfg.b));
  }
});
