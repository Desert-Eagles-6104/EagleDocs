import type { Config } from "../model/types";
import type { ConfigInput } from "../model/config";
import { fieldScale } from "../model/units";
import { defaults } from "../model/defaults";
import { validate } from "./validation";

/**
 * Author-facing values use the selected units. Runtime values remain canonical,
 * so changing display units never changes the physical experiment.
 */
export function experimentConfig(
  input: ConfigInput = {},
  base: Config = defaults,
): Config {
  const merged = {
    ...base,
    ...input,
    a: { ...base.a, ...input.a },
    b: { ...base.b, ...input.b },
    units: { ...base.units, ...input.units },
    view: { ...base.view, ...input.view },
    controls: { ...base.controls, ...input.controls },
  };
  const context = validate(merged);
  const values: Record<string, unknown> = { ...merged };
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "number")
      values[key] = value / fieldScale(context, key);
  }
  for (const key of ["a", "b"] as const) {
    const settings = { ...merged[key] };
    for (const [field, value] of Object.entries(input[key] ?? {})) {
      if (typeof value === "number") {
        Object.assign(settings, {
          [field]: value / fieldScale(context, field),
        });
      }
    }
    values[key] = settings;
  }
  return validate(values);
}
