import { profile, type Profile } from "./profiles";
export type Mechanism = "wheel" | "elevator" | "arm";
export type Method = "open" | "pid" | "ff" | "combined" | "bang" | "profile";
export type Request =
  | "duty"
  | "voltage"
  | "velocity"
  | "position"
  | "torque"
  | "magic";
export interface Controller {
  method: Method;
  kp: number;
  ki: number;
  kd: number;
  p: boolean;
  i: boolean;
  d: boolean;
  ks: number;
  kv: number;
  ka: number;
  kg: number;
  output: number;
  antiWindup: boolean;
  hysteresis: number;
  low: number;
  high: number;
  profile: Profile;
  vmax: number;
  amax: number;
  jmax: number;
  stop: "auto" | "none" | "time" | "target";
  stopAfter: number;
}
export interface Config {
  mechanism: Mechanism;
  target: number;
  a: Controller;
  b: Controller;
  compare: boolean;
  speed: number;
  limit: number;
  inertia: number;
  damping: number;
  friction: number;
  noise: number;
  disturbance: number;
  request: Request;
  demand: number;
  battery: number;
  graphs: string[];
  duration: number;
  tolerance: number;
  rateTolerance: number;
  dwell: number;
}
export const controller: Controller = {
  method: "pid",
  kp: 8,
  ki: 2,
  kd: 4,
  p: true,
  i: true,
  d: true,
  ks: 0.3,
  kv: 0.8,
  ka: 1,
  kg: 2,
  output: 3,
  antiWindup: true,
  hysteresis: 0,
  low: 0,
  high: 10,
  profile: "trapezoid",
  vmax: 1,
  amax: 2,
  jmax: 8,
  stop: "auto",
  stopAfter: 8,
};
export const defaults: Config = {
  mechanism: "elevator",
  target: 1.5,
  a: { ...controller },
  b: { ...controller, method: "combined" },
  compare: false,
  speed: 1,
  limit: 12,
  inertia: 1,
  damping: 0.8,
  friction: 0.3,
  noise: 0,
  disturbance: -4,
  request: "position",
  demand: 4,
  battery: 12,
  graphs: ["response", "error", "output"],
  duration: 15,
  tolerance: 0.03,
  rateTolerance: 0.05,
  dwell: 0.5,
};
export const DT = 0.005;
export const isVelocity = (cfg: Config) => cfg.request === "velocity";
export const isDirect = (cfg: Config) =>
  ["duty", "voltage", "torque"].includes(cfg.request);
export const supportedMethods: Record<Request, readonly Method[]> = {
  duty: ["open"],
  voltage: ["open"],
  torque: ["open"],
  velocity: ["pid", "ff", "combined", "bang"],
  position: ["pid", "combined", "profile"],
  magic: ["pid", "ff", "combined", "profile"],
};
export function supports(cfg: Config, c: Controller) {
  return (
    supportedMethods[cfg.request].includes(c.method) &&
    !(cfg.request === "magic" && c.profile === "direct")
  );
}
export const targetBounds = (cfg: Config): [number, number] =>
  isVelocity(cfg) ? [-20, 20] : (bounds(cfg.mechanism) as [number, number]);
export const bounds = (m: Mechanism) =>
  m === "elevator" ? [0, 3] : m === "arm" ? [-1.4, 1.4] : [0, 20];
export const clamp = (x: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, x));
export interface State {
  t: number;
  x: number;
  v: number;
  acceleration: number;
  integral: number;
  previous: number;
  on: boolean;
  error: number;
  p: number;
  i: number;
  d: number;
  ff: number;
  output: number;
  raw: number;
  reference: number;
  rv: number;
  ra: number;
  stoppedAt: number;
  settledSince: number;
  settledAt: number;
}
export function initial(): State {
  return {
    t: 0,
    x: 0,
    v: 0,
    acceleration: 0,
    integral: 0,
    previous: 0,
    on: false,
    error: 0,
    p: 0,
    i: 0,
    d: 0,
    ff: 0,
    output: 0,
    raw: 0,
    reference: 0,
    rv: 0,
    ra: 0,
    stoppedAt: -1,
    settledSince: -1,
    settledAt: -1,
  };
}
export function feedforward(
  c: Controller,
  v: number,
  a: number,
  angle: number,
  m: Mechanism,
) {
  return (
    c.ks * Math.sign(v) +
    c.kv * v +
    c.ka * a +
    (m === "wheel" ? 0 : c.kg * (m === "arm" ? Math.cos(angle) : 1))
  );
}
export function pid(
  c: Controller,
  error: number,
  derivative: number,
  integral: number,
  ff: number,
  limit: number,
) {
  let next = c.i ? integral + error * DT : 0;
  const p = c.p ? c.kp * error : 0,
    d = c.d ? c.kd * derivative : 0;
  const raw = p + c.ki * next + d + ff;
  if (c.antiWindup && Math.abs(raw) > limit && error * raw > 0) next = integral;
  return { p, i: c.i ? c.ki * next : 0, d, integral: next };
}
export function step(
  s: State,
  cfg: Config,
  selected: Controller,
  disturbance = 0,
): State {
  if (!supports(cfg, selected))
    throw new Error("Unsupported control method for request");
  const c = selected;
  const velocity = isVelocity(cfg);
  const ref =
    (c.method === "profile" || cfg.request === "magic") && !velocity
      ? profile(c.profile, cfg.target, s.t + DT, c.vmax, c.amax, c.jmax)
      : { p: cfg.target, v: 0, a: 0 };
  const measured =
    (velocity ? s.v : s.x) + cfg.noise * Math.sin((s.t + DT) * 173);
  const error = ref.p - measured;
  const ff = ["ff", "combined", "profile"].includes(c.method)
    ? feedforward(
        c,
        velocity ? cfg.target : ref.v,
        ref.a,
        velocity ? s.x : ref.p,
        cfg.mechanism,
      )
    : 0;
  const limit = Math.min(cfg.limit, cfg.battery);
  const terms = ["pid", "combined", "profile"].includes(c.method)
    ? pid(c, error, s.t ? (error - s.previous) / DT : 0, s.integral, ff, limit)
    : { p: 0, i: 0, d: 0, integral: 0 };
  let on = s.on;
  if (error > c.hysteresis) on = true;
  else if (error < -c.hysteresis || c.hysteresis === 0) on = false;
  let raw =
    c.method === "open"
      ? c.output
      : c.method === "bang"
        ? on
          ? c.high
          : c.low
        : c.method === "ff"
          ? ff
          : terms.p + terms.i + terms.d + ff;
  const torque = cfg.request === "torque";
  if (isDirect(cfg))
    raw =
      cfg.request === "duty" ? (cfg.demand / 100) * cfg.battery : cfg.demand;
  const stopMode =
    c.stop === "auto"
      ? ["open", "ff"].includes(c.method)
        ? velocity || isDirect(cfg)
          ? "time"
          : "target"
        : "none"
      : c.stop;
  const reached =
    Math.abs(cfg.target - measured) <= cfg.tolerance ||
    (cfg.target !== 0 &&
      measured * Math.sign(cfg.target) >= Math.abs(cfg.target));
  const shouldStop =
    stopMode !== "none" &&
    (s.t >= c.stopAfter ||
      (stopMode === "target" && !isDirect(cfg) && reached));
  const stoppedAt = s.stoppedAt >= 0 ? s.stoppedAt : shouldStop ? s.t : -1;
  const output =
    stoppedAt >= 0 ? 0 : clamp(raw, torque ? -40 : -limit, torque ? 40 : limit);
  // Voltage model: generalized drive force = voltage; torque model: force = 0.25 * current.
  const gravity =
    cfg.mechanism === "wheel"
      ? 0
      : 2 * (cfg.mechanism === "arm" ? Math.cos(s.x) : 1);
  const force =
    (torque ? output * 0.25 : output) -
    cfg.damping * s.v -
    gravity +
    disturbance;
  const friction =
    Math.abs(s.v) < 0.001
      ? clamp(force, -cfg.friction, cfg.friction)
      : Math.sign(s.v) * cfg.friction;
  const acceleration = (force - friction) / cfg.inertia;
  let v = s.v + acceleration * DT,
    x = s.x + v * DT;
  if (cfg.mechanism !== "wheel") {
    const [lo, hi] = bounds(cfg.mechanism);
    if (x < lo || x > hi) {
      x = clamp(x, lo, hi);
      v = 0;
    }
  }
  const actualAcceleration = (v - s.v) / DT;
  const settling = isDirect(cfg)
    ? { settledSince: -1, settledAt: -1 }
    : settlingStatus(
        s,
        cfg,
        velocity ? v : x,
        velocity ? actualAcceleration : v,
      );
  return {
    t: s.t + DT,
    x,
    v,
    acceleration: (v - s.v) / DT,
    previous: error,
    on,
    error,
    ...(stoppedAt >= 0 ? { p: 0, i: 0, d: 0, integral: 0 } : terms),
    ff: stoppedAt >= 0 ? 0 : ff,
    raw: stoppedAt >= 0 ? 0 : raw,
    output,
    reference: ref.p,
    rv: velocity ? cfg.target : ref.v,
    ra: ref.a,
    stoppedAt,
    ...settling,
  };
}

// Online observation: revoke the result if the response leaves the band again.
export function settlingStatus(
  s: State,
  cfg: Config,
  actual: number,
  rate: number,
) {
  const inside =
    Math.abs(cfg.target - actual) <= cfg.tolerance &&
    Math.abs(rate) <= cfg.rateTolerance;
  const settledSince = inside
    ? s.settledSince >= 0
      ? s.settledSince
      : s.t + DT
    : -1;
  return {
    settledSince,
    settledAt:
      settledSince >= 0 && s.t + DT - settledSince >= cfg.dwell - 1e-9
        ? settledSince
        : -1,
  };
}
