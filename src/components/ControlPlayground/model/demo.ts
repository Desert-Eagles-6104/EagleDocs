import type { Config, Controller } from "./types";
import type { Request, GraphKind } from "./constants";
import type { ControllerParameter } from "./constraints";
export type DemoConfig = Omit<
  Partial<Config>,
  "a" | "b" | "request" | "graphs"
> & {
  goal?: Exclude<Request, "magic">;
  a?: Partial<Controller>;
  b?: Partial<Controller>;
};

export type DemoGraph = GraphKind;
export type TuningParameter = Exclude<ControllerParameter, "stopAfter">;
export type DemoTuning =
  | TuningParameter[]
  | { a?: TuningParameter[]; b?: TuningParameter[] };

export interface TuningDefinition {
  label: string;
  min: number;
  max: number;
  step: number;
}
