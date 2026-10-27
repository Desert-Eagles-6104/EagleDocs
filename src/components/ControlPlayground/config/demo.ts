import type { DemoConfig, DemoGraph } from "../model/demo";
import { defaults } from "../model/defaults";
import { isDirect } from "../model/semantics";
import { type Config } from "../model/types";
import { presets } from "./presets";
import { validate } from "./validation";

// Keep the public MDX API small, while sharing validation and physics with the
// full playground. Controller overrides merge with the preset field by field.
export function demoConfig(
  preset: string | undefined,
  overrides: DemoConfig = {},
  graphs?: DemoGraph[],
): Config {
  if (preset && !Object.hasOwn(presets, preset))
    throw new Error(`Unknown ControlDemo preset: ${preset}`);
  const base = validate({
    ...defaults,
    ...(preset ? presets[preset].config : {}),
  });
  const { goal, a, b, ...shared } = overrides;
  return validate({
    ...base,
    ...shared,
    request: goal ?? base.request,
    a: { ...base.a, ...a },
    b: { ...base.b, ...b },
    graphs:
      graphs ??
      (isDirect({ ...base, request: goal ?? base.request })
        ? ["output"]
        : ["response"]),
  });
}
