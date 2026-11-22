import { RADIANS_PER_ROTATION } from "./constants";
import type { Config } from "./types";
import { isLinear, isVelocity } from "./semantics";

export const lengthUnits = {
  m: { label: "מטרים", factor: 1 },
  cm: { label: "סנטימטרים", factor: 100 },
} as const;
export const angleUnits = {
  rad: { label: "רדיאנים", factor: 1 },
  rev: { label: "סיבובים", factor: 1 / RADIANS_PER_ROTATION },
  deg: { label: "מעלות", factor: 180 / Math.PI },
} as const;
export interface Units {
  length: keyof typeof lengthUnits;
  angle: keyof typeof angleUnits;
}

/** The engine always uses metres and radians. Only inputs and readouts convert. */
export function motionUnit(cfg: Config) {
  const linear = isLinear(cfg.mechanism);
  const symbol = linear ? cfg.units.length : cfg.units.angle;
  const definition = linear
    ? lengthUnits[cfg.units.length]
    : angleUnits[cfg.units.angle];
  return { symbol, ...definition };
}

export function fieldScale(cfg: Config, key: string): number {
  const factor = motionUnit(cfg).factor;
  if (["kp", "ki", "kd", "kv", "ka", "damping"].includes(key))
    return 1 / factor;
  if (
    [
      "target",
      "tolerance",
      "rateTolerance",
      "noise",
      "initialVelocity",
      "hysteresis",
      "vmax",
      "amax",
      "jmax",
    ].includes(key)
  )
    return factor;
  return 1;
}

export function measuredUnit(cfg: Config) {
  return motionUnit(cfg).symbol + (isVelocity(cfg) ? "/s" : "");
}
