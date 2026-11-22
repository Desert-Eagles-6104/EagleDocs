import type { Config, Controller } from "./types";

export type NumericKey<T> = {
  [Key in keyof T]: T[Key] extends number ? Key : never;
}[keyof T];
export type ControllerParameter = NumericKey<Controller>;
export type NumericRange = [min: number, max: number];

export const controllerRanges = {
  kp: [0, 30],
  ki: [0, 20],
  kd: [0, 12],
  ks: [0, 3],
  kv: [0, 4],
  ka: [0, 4],
  kg: [0, 6],
  output: [-12, 12],
  hysteresis: [0, 2],
  low: [-12, 12],
  high: [-12, 12],
  vmax: [0.1, 5],
  amax: [0.1, 10],
  jmax: [0.1, 40],
  stopAfter: [0.1, 60],
} satisfies Record<ControllerParameter, NumericRange>;

export const experimentRanges = {
  target: [-20, 20],
  speed: [0.25, 4],
  limit: [1, 12],
  inertia: [0.2, 4],
  damping: [0, 3],
  friction: [0, 2],
  noise: [0, 0.1],
  disturbance: [-10, 10],
  demand: [-100, 100],
  battery: [6, 12],
  duration: [1, 60],
  tolerance: [0.005, 1],
  rateTolerance: [0.005, 2],
  dwell: [0.1, 3],
  initialVelocity: [-20, 20],
} satisfies Record<NumericKey<Config>, NumericRange>;
