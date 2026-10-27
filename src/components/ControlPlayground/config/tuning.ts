import type { TuningParameter, TuningDefinition } from "../model/demo";
import { controllerRanges } from "../model/constraints";
export const tuningParameters = {
  kp: {
    label: "kP",
    min: controllerRanges.kp[0],
    max: controllerRanges.kp[1],
    step: 0.1,
  },
  ki: {
    label: "kI",
    min: controllerRanges.ki[0],
    max: controllerRanges.ki[1],
    step: 0.1,
  },
  kd: {
    label: "kD",
    min: controllerRanges.kd[0],
    max: controllerRanges.kd[1],
    step: 0.1,
  },
  ks: {
    label: "kS",
    min: controllerRanges.ks[0],
    max: controllerRanges.ks[1],
    step: 0.1,
  },
  kv: {
    label: "kV",
    min: controllerRanges.kv[0],
    max: controllerRanges.kv[1],
    step: 0.1,
  },
  ka: {
    label: "kA",
    min: controllerRanges.ka[0],
    max: controllerRanges.ka[1],
    step: 0.1,
  },
  kg: {
    label: "kG",
    min: controllerRanges.kg[0],
    max: controllerRanges.kg[1],
    step: 0.1,
  },
  output: {
    label: "מתח קבוע (V)",
    min: controllerRanges.output[0],
    max: controllerRanges.output[1],
    step: 0.1,
  },
  hysteresis: {
    label: "חצי רוחב היסטרזיס",
    min: controllerRanges.hysteresis[0],
    max: controllerRanges.hysteresis[1],
    step: 0.05,
  },
  low: {
    label: "פלט נמוך (V)",
    min: controllerRanges.low[0],
    max: controllerRanges.low[1],
    step: 0.1,
  },
  high: {
    label: "פלט גבוה (V)",
    min: controllerRanges.high[0],
    max: controllerRanges.high[1],
    step: 0.1,
  },
  vmax: {
    label: "מהירות מרבית",
    min: controllerRanges.vmax[0],
    max: controllerRanges.vmax[1],
    step: 0.1,
  },
  amax: {
    label: "תאוצה מרבית",
    min: controllerRanges.amax[0],
    max: controllerRanges.amax[1],
    step: 0.1,
  },
  jmax: {
    label: "jerk מרבי",
    min: controllerRanges.jmax[0],
    max: controllerRanges.jmax[1],
    step: 0.1,
  },
} satisfies Record<TuningParameter, TuningDefinition>;
