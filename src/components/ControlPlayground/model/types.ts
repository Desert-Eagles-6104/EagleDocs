import {
  type Mechanism,
  type Method,
  type Request,
  type Profile,
  type StopMode,
  type GraphKind,
} from "./constants";
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
  stop: StopMode;
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
  graphs: GraphKind[];
  duration: number;
  tolerance: number;
  rateTolerance: number;
  dwell: number;
}
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
export interface Reference {
  p: number;
  v: number;
  a: number;
}

export type ControllerKey = "a" | "b";
export type Sample = { a: State; b: State };
export interface Simulation {
  a: State;
  b: State;
  ticks: number;
  disturbanceUntil: number;
}

export interface PidTerms {
  p: number;
  i: number;
  d: number;
  integral: number;
}
