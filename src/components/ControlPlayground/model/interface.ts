import type { Config, Controller } from "./types";

export type ExperimentField =
  | Exclude<keyof Config, "a" | "b" | "graphs" | "units" | "view" | "controls">
  | "units";
export type FieldChoice<K extends string> =
  | K
  | { key: K; as: "toggle"; on: number };
export type FieldSelection<K extends string> = "all" | FieldChoice<K>[];
export interface Controls {
  experiment: FieldSelection<ExperimentField>;
  a: FieldSelection<keyof Controller>;
  b: FieldSelection<keyof Controller>;
}
export interface View {
  mechanism: boolean;
  readout: boolean;
  settlingTime: boolean;
  step: boolean;
  speed: boolean;
  disturbance: boolean;
  tolerance: boolean;
  graphSelection: boolean;
  explanations: boolean;
}
