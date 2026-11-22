import type { ConfigInput } from "../model/config";
import { defaults } from "../model/defaults";
import { isDirect } from "../model/semantics";
import { type Config } from "../model/types";
import { presets } from "./presets";
import { validate } from "./validation";
import { experimentConfig } from "./experiment";

// Keep the public MDX API small, while sharing validation and physics with the
// full playground. Controller overrides merge with the preset field by field.
export function demoConfig(
  preset: string | undefined,
  overrides: ConfigInput = {},
): Config {
  if (preset && !Object.hasOwn(presets, preset))
    throw new Error(`Unknown ControlDemo preset: ${preset}`);
  const base = validate({
    ...defaults,
    ...(preset ? presets[preset].config : {}),
    view: {
      ...defaults.view,
      readout: false,
      settlingTime: false,
      speed: false,
      disturbance: false,
      graphSelection: false,
      explanations: false,
    },
    controls: { experiment: [], a: [], b: [] },
  });
  return experimentConfig(
    {
      ...overrides,
      graphs:
        overrides.graphs ??
        (isDirect({
          ...base,
          request: overrides.request ?? base.request,
        })
          ? ["output"]
          : ["response"]),
    },
    base,
  );
}
