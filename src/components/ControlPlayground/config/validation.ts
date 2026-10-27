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
  type NumericKey,
  type NumericRange,
} from "../model/constraints";
import { isEnumValue, typedEntries } from "../model/guards";

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
export function validate(value: unknown): Config {
  const input = record(value);
  const result: Config = {
    ...defaults,
    a: validateController(input.a, defaults.a),
    b: validateController(input.b, defaults.b),
    graphs: [...defaults.graphs],
  };
  if (isEnumValue(MechanismType, input.mechanism))
    result.mechanism = input.mechanism;
  if (isEnumValue(ControlRequest, input.request))
    result.request = input.request;
  if (typeof input.compare === "boolean") result.compare = input.compare;
  const ranges = {
    target: targetBounds(result),
    speed: [0.25, 4],
    limit: [1, 12],
    inertia: [0.2, 4],
    damping: [0, 3],
    friction: [0, 2],
    noise: [0, 0.1],
    disturbance: [-10, 10],
    demand: [-100, 100],
    battery: [6, 12],
    duration: [1, 60],
    tolerance: [0.005, 1],
    rateTolerance: [0.005, 2],
    dwell: [0.1, 3],
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
