import type { Config, Controller } from "../model/types";
import type { ExperimentField } from "../model/interface";
import {
  controllerRanges,
  experimentRanges,
  type NumericRange,
} from "../model/constraints";
import {
  demandBounds,
  hasFeedforward,
  hasGravity,
  hasPid,
  isDirect,
  isLinear,
  supportedMethods,
  targetBounds,
} from "../model/semantics";
import { measuredUnit, motionUnit } from "../model/units";
import { goals, methods } from "./labels";
import { targetModel } from "../view-model/target";

export interface FieldDefinition {
  kind: "number" | "boolean" | "select" | "units";
  label: (cfg: Config) => string;
  range?: (cfg: Config) => NumericRange;
  step?: number;
  hint?: string;
  advanced?: boolean;
  options?: (cfg: Config) => Record<string, string>;
  enabled?: (cfg: Config, value: string) => boolean;
  visible?: (cfg: Config, controller?: Controller) => boolean;
}

function number(
  label: string | ((cfg: Config) => string),
  range: NumericRange | ((cfg: Config) => NumericRange),
  step = 0.1,
): FieldDefinition {
  return {
    kind: "number",
    label: typeof label === "string" ? () => label : label,
    range: typeof range === "function" ? range : () => range,
    step,
  };
}
const boolean = (label: string): FieldDefinition => ({
  kind: "boolean",
  label: () => label,
});
const select = (
  label: string,
  options: Record<string, string>,
): FieldDefinition => ({
  kind: "select",
  label: () => label,
  options: () => options,
});

export const experimentFields: Record<ExperimentField, FieldDefinition> = {
  mechanism: select("סוג המנגנון", {
    elevator: "מעלית",
    slide: "קופסה על משטח אופקי",
    arm: "זרוע",
    wheel: "גלגל ירי",
  }),
  request: select("מה רוצים לעשות?", goals),
  units: { kind: "units", label: () => "יחידות" },
  target: {
    ...number((cfg) => targetModel(cfg).label, targetBounds, 0.05),
    visible: (cfg) => !isDirect(cfg),
  },
  demand: {
    ...number((cfg) => targetModel(cfg).label, demandBounds),
    visible: isDirect,
  },
  compare: boolean("השוואה לבקר נוסף"),
  initialVelocity: {
    ...number(
      (cfg) => `מהירות התחלתית (${motionUnit(cfg).symbol}/s)`,
      experimentRanges.initialVelocity,
    ),
    advanced: true,
  },
  duration: {
    ...number("משך הניסוי (s)", experimentRanges.duration),
    advanced: true,
  },
  speed: {
    ...number("מהירות ההרצה", experimentRanges.speed, 0.25),
    visible: (cfg) => !cfg.view.speed,
    advanced: true,
  },
  tolerance: {
    ...number(
      (cfg) => `סבילות שגיאה (${measuredUnit(cfg)})`,
      experimentRanges.tolerance,
      0.005,
    ),
    advanced: true,
  },
  rateTolerance: {
    ...number(
      (cfg) => `סבילות קצב שינוי (${measuredUnit(cfg)}/s)`,
      experimentRanges.rateTolerance,
      0.005,
    ),
    advanced: true,
  },
  dwell: {
    ...number("משך אישור התייצבות (s)", experimentRanges.dwell),
    advanced: true,
  },
  limit: { ...number("מגבלת מתח (V)", experimentRanges.limit), advanced: true },
  battery: {
    ...number("מתח סוללה (V)", experimentRanges.battery),
    advanced: true,
  },
  inertia: {
    ...number(
      (cfg) =>
        isLinear(cfg.mechanism) ? "מסה שקולה (kg)" : "אינרציה שקולה (kg·m²)",
      experimentRanges.inertia,
    ),
    advanced: true,
  },
  damping: {
    ...number(
      (cfg) =>
        `ריסון שקול (${isLinear(cfg.mechanism) ? "N" : "N·m"}·s/${motionUnit(cfg).symbol})`,
      experimentRanges.damping,
    ),
    advanced: true,
  },
  friction: {
    ...number("חיכוך שקול (N או N·m)", experimentRanges.friction),
    advanced: true,
  },
  disturbance: {
    ...number("כוח הפרעה (N או N·m)", experimentRanges.disturbance),
    advanced: true,
  },
  noise: {
    ...number(
      (cfg) => `משרעת רעש מדידה (${measuredUnit(cfg)})`,
      experimentRanges.noise,
      0.005,
    ),
    hint: "שינויים קטנים שהחיישן מדווח בנוסף לתנועה בפועל. משוב חזק יכול להגיב גם אליהם.",
    advanced: true,
  },
};

export const controllerFields: Record<keyof Controller, FieldDefinition> = {
  method: {
    ...select("איך הבקר ינסה להשיג את המטרה?", methods),
    enabled: (cfg, value) =>
      supportedMethods[cfg.request].includes(value as Controller["method"]),
  },
  p: boolean("הפעלת P"),
  i: boolean("הפעלת I"),
  d: boolean("הפעלת D"),
  kp: number((cfg) => `kP (V/${measuredUnit(cfg)})`, controllerRanges.kp),
  ki: number((cfg) => `kI (V/(${measuredUnit(cfg)}·s))`, controllerRanges.ki),
  kd: number((cfg) => `kD (V·s/${measuredUnit(cfg)})`, controllerRanges.kd),
  antiWindup: {
    ...boolean("מניעת צבירה ברוויה"),
    hint: "עוצר את צבירת האינטגרל כשהפלט מוגבל והשגיאה הייתה מגדילה אותו עוד יותר.",
    advanced: true,
  },
  ks: number("kS (V)", controllerRanges.ks),
  kv: number(
    (cfg) => `kV (V·s/${motionUnit(cfg).symbol})`,
    controllerRanges.kv,
  ),
  ka: number(
    (cfg) => `kA (V·s²/${motionUnit(cfg).symbol})`,
    controllerRanges.ka,
  ),
  kg: number("kG (V)", controllerRanges.kg),
  output: number("מתח קבוע (V)", controllerRanges.output),
  hysteresis: number(
    (cfg) => `חצי רוחב היסטרזיס (${measuredUnit(cfg)})`,
    controllerRanges.hysteresis,
    0.05,
  ),
  low: number("פלט נמוך (V)", controllerRanges.low),
  high: number("פלט גבוה (V)", controllerRanges.high),
  profile: {
    ...select("סוג פרופיל", {
      direct: "יעד מיידי",
      trapezoid: "טרפז",
      scurve: "S-curve מוגבל jerk",
    }),
    enabled: (cfg, value) => cfg.request !== "magic" || value !== "direct",
  },
  vmax: number(
    (cfg) => `מהירות מרבית (${motionUnit(cfg).symbol}/s)`,
    controllerRanges.vmax,
  ),
  amax: number(
    (cfg) => `תאוצה מרבית (${motionUnit(cfg).symbol}/s²)`,
    controllerRanges.amax,
  ),
  jmax: number(
    (cfg) => `jerk מרבי (${motionUnit(cfg).symbol}/s³)`,
    controllerRanges.jmax,
  ),
  stop: {
    ...select("מתי מנתקים את פלט המנוע?", {
      auto: "לפי השיטה",
      none: "ללא ניתוק אוטומטי",
      time: "לאחר זמן מוגדר",
      target: "בהגעה ליעד או לאחר הזמן המרבי",
    }),
    hint: "ניתוק הפלט משאיר את המנגנון לנוע לפי הפיזיקה. הוא אינו מקפיא את התנועה.",
    enabled: (cfg, value) => value !== "target" || !isDirect(cfg),
    advanced: true,
  },
  stopAfter: {
    ...number("זמן מרבי לפלט (s)", controllerRanges.stopAfter),
    advanced: true,
  },
};

/** Method compatibility is shared by the lab and every embedded settings panel. */
export function controllerFieldVisible(
  key: keyof Controller,
  cfg: Config,
  controller: Controller,
) {
  if (["p", "i", "d", "antiWindup"].includes(key))
    return hasPid(controller.method);
  if (["kp", "ki", "kd"].includes(key)) {
    const term = { kp: "p", ki: "i", kd: "d" }[key] as "p" | "i" | "d";
    return hasPid(controller.method) && controller[term];
  }
  if (["ks", "kv", "ka", "kg"].includes(key))
    return (
      hasFeedforward(controller.method) &&
      (key !== "kg" || hasGravity(cfg.mechanism))
    );
  if (["low", "high", "hysteresis"].includes(key))
    return controller.method === "bang";
  if (["profile", "vmax", "amax", "jmax"].includes(key))
    return (
      (controller.method === "profile" || cfg.request === "magic") &&
      (key !== "jmax" || controller.profile === "scurve")
    );
  if (key === "output") return controller.method === "open" && !isDirect(cfg);
  if (key === "stopAfter") return controller.stop !== "none";
  return true;
}
