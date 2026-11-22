import { defaults } from "../model/defaults";
import { clamp, demandBounds, targetBounds } from "../model/semantics";
import type { Config, Controller } from "../model/types";
import {
  ControlMethod,
  ControlRequest,
  GraphType,
  MechanismType,
  MotionProfile,
  StopCondition,
} from "../model/constants";
import {
  controllerRanges,
  experimentRanges,
  type NumericKey,
  type NumericRange,
} from "../model/constraints";
import { isEnumValue, typedEntries } from "../model/guards";
import { angleUnits, lengthUnits } from "../model/units";
import type { FieldChoice, FieldSelection } from "../model/interface";
import { experimentFields, controllerFields } from "./fields";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
function finiteNumber(
  value: unknown,
  fallback: number,
  [min, max]: NumericRange,
) {
  return typeof value === "number" && Number.isFinite(value)
    ? clamp(value, min, max)
    : fallback;
}
function validateController(value: unknown, fallback: Controller): Controller {
  const input = record(value);
  const result = { ...fallback };
  for (const [key, range] of typedEntries(controllerRanges))
    result[key] = finiteNumber(input[key], result[key], range);
  for (const key of ["p", "i", "d", "antiWindup"] as const)
    if (typeof input[key] === "boolean") result[key] = input[key];
  if (isEnumValue(ControlMethod, input.method)) result.method = input.method;
  if (isEnumValue(MotionProfile, input.profile)) result.profile = input.profile;
  if (isEnumValue(StopCondition, input.stop)) result.stop = input.stop;
  return result;
}

function selection<K extends string>(
  value: unknown,
  keys: K[],
  fallback: FieldSelection<K>,
): FieldSelection<K> {
  if (value === "all") return "all";
  if (!Array.isArray(value)) return fallback === "all" ? "all" : [...fallback];
  return value.flatMap<FieldChoice<K>>((item) => {
    if (typeof item === "string" && keys.includes(item as K))
      return [item as K];
    const field = record(item);
    if (
      keys.includes(field.key as K) &&
      field.as === "toggle" &&
      typeof field.on === "number" &&
      Number.isFinite(field.on)
    ) {
      return [{ key: field.key as K, as: "toggle" as const, on: field.on }];
    }
    return [];
  });
}
export function validate(value: unknown): Config {
  const input = record(value);
  const result: Config = {
    ...defaults,
    a: validateController(input.a, defaults.a),
    b: validateController(input.b, defaults.b),
    graphs: [...defaults.graphs],
    units: { ...defaults.units },
    view: { ...defaults.view },
    controls: { ...defaults.controls },
  };
  if (isEnumValue(MechanismType, input.mechanism))
    result.mechanism = input.mechanism;
  if (isEnumValue(ControlRequest, input.request))
    result.request = input.request;
  if (typeof input.compare === "boolean") result.compare = input.compare;
  const units = record(input.units);
  if (typeof units.angle === "string" && Object.hasOwn(angleUnits, units.angle))
    result.units.angle = units.angle as Config["units"]["angle"];
  if (
    typeof units.length === "string" &&
    Object.hasOwn(lengthUnits, units.length)
  )
    result.units.length = units.length as Config["units"]["length"];
  const view = record(input.view);
  for (const key of Object.keys(result.view) as (keyof Config["view"])[]) {
    if (typeof view[key] === "boolean") result.view[key] = view[key];
  }
  const controls = record(input.controls);
  result.controls.experiment = selection(
    controls.experiment,
    Object.keys(experimentFields) as (keyof typeof experimentFields)[],
    defaults.controls.experiment,
  );
  for (const key of ["a", "b"] as const) {
    result.controls[key] = selection(
      controls[key],
      Object.keys(controllerFields) as (keyof Controller)[],
      defaults.controls[key],
    );
  }
  const ranges = {
    ...experimentRanges,
    target: targetBounds(result),
  } satisfies Record<NumericKey<Config>, NumericRange>;
  for (const [key, range] of typedEntries(ranges))
    result[key] = finiteNumber(input[key], result[key], range);
  result.target = clamp(result.target, ...targetBounds(result));
  result.demand = clamp(result.demand, ...demandBounds(result));
  if (Array.isArray(input.graphs)) {
    const selected = input.graphs;
    result.graphs = Object.values(GraphType).filter((kind) =>
      selected.includes(kind),
    );
  }
  return result;
}
