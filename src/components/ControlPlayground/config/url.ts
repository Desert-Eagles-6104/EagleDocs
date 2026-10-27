/* global URLSearchParams */
import { defaults } from "../model/defaults";
import { type Config, type Controller } from "../model/types";
import { ControlMethod, ControlRequest } from "../model/constants";
import { isEnumValue } from "../model/guards";
import { presets } from "./presets";
import { validate } from "./validation";
export const MAX_QUERY_LENGTH = 36000;
export function readConfig(search: string): Config {
  try {
    // Check before parsing the query; old full-state links remain supported.
    if (search.length > MAX_QUERY_LENGTH) return validate(defaults);
    const q = new URLSearchParams(search),
      encoded = q.get("experiment");
    if (encoded && encoded.length <= 12000)
      return validate(JSON.parse(encoded));
    const preset = q.get("preset");
    let c = validate(
      preset && Object.hasOwn(presets, preset)
        ? { ...defaults, ...presets[preset].config }
        : defaults,
    );
    const method = q.get("method");
    if (isEnumValue(ControlMethod, method))
      c = validate({
        ...c,
        request:
          method === "open"
            ? "voltage"
            : method === "bang" || method === "ff"
              ? "velocity"
              : c.request,
        a: { ...c.a, method },
      });
    const request = q.get("request");
    if (isEnumValue(ControlRequest, request))
      c = validate({
        ...c,
        request,
        a: {
          ...c.a,
          method: ["duty", "voltage", "torque"].includes(request)
            ? "open"
            : request === "magic"
              ? "profile"
              : "pid",
        },
        mechanism: request === "velocity" ? "wheel" : c.mechanism,
      });
    return c;
  } catch {
    return validate(defaults);
  }
}
export function serialize(c: Config) {
  // Persist settings only. Frames, graph samples and runtime state never belong
  // in a URL. Omit defaults to keep links small even with both controllers.
  const validated = validate(c);
  const compact: Record<string, unknown> = {};
  for (const key of Object.keys(defaults) as (keyof Config)[]) {
    if (key === "a" || key === "b") {
      const changes = Object.fromEntries(
        Object.entries(validated[key]).filter(
          ([field, value]) =>
            value !== defaults[key][field as keyof Controller],
        ),
      );
      if (Object.keys(changes).length) compact[key] = changes;
    } else if (
      JSON.stringify(validated[key]) !== JSON.stringify(defaults[key])
    ) {
      compact[key] = validated[key];
    }
  }
  return "?experiment=" + encodeURIComponent(JSON.stringify(compact));
}
