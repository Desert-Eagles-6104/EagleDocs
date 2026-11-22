import type { Config, Controller } from "./types";
export type ConfigInput = Omit<
  Partial<Config>,
  "a" | "b" | "units" | "view" | "controls"
> & {
  a?: Partial<Controller>;
  b?: Partial<Controller>;
  units?: Partial<Config["units"]>;
  view?: Partial<Config["view"]>;
  controls?: Partial<Config["controls"]>;
};
