import type { Controller } from "./types";

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
