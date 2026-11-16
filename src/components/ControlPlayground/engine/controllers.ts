import {
  MechanismType,
  ControlMethod,
  StopCondition,
} from "../model/constants";
import { hasGravity, isVelocity, isDirect } from "../model/semantics";
import type { Config, State, PidTerms } from "../model/types";
import { DT, type Mechanism } from "../model/constants";
import { type Controller } from "../model/types";
export function feedforward(
  controllerSettings: Controller,
  v: number,
  a: number,
  angle: number,
  m: Mechanism,
) {
  return (
    controllerSettings.ks * Math.sign(v) +
    controllerSettings.kv * v +
    controllerSettings.ka * a +
    (hasGravity(m)
      ? controllerSettings.kg * (m === MechanismType.Arm ? Math.cos(angle) : 1)
      : 0)
  );
}
export function pid(
  controllerSettings: Controller,
  error: number,
  derivative: number,
  integral: number,
  ff: number,
  limit: number,
) {
  let next = controllerSettings.i ? integral + error * DT : 0;
  const p = controllerSettings.p ? controllerSettings.kp * error : 0,
    d = controllerSettings.d ? controllerSettings.kd * derivative : 0;
  const raw = p + controllerSettings.ki * next + d + ff;
  if (controllerSettings.antiWindup && Math.abs(raw) > limit && error * raw > 0)
    next = integral;
  return {
    p,
    i: controllerSettings.i ? controllerSettings.ki * next : 0,
    d,
    integral: next,
  };
}

export function controllerOutput(
  settings: Controller,
  terms: PidTerms,
  feedforward: number,
  on: boolean,
): number {
  switch (settings.method) {
    case ControlMethod.Open:
      return settings.output;
    case ControlMethod.BangBang:
      return on ? settings.high : settings.low;
    case ControlMethod.Feedforward:
      return feedforward;
    default:
      return terms.p + terms.i + terms.d + feedforward;
  }
}
export function outputStoppedAt(
  state: State,
  config: Config,
  controllerSettings: Controller,
  measured: number,
): number {
  const velocity = isVelocity(config);
  const stopMode =
    controllerSettings.stop === StopCondition.Auto
      ? [ControlMethod.Open, ControlMethod.Feedforward].some(
          (method) => method === controllerSettings.method,
        )
        ? velocity || isDirect(config)
          ? StopCondition.Time
          : StopCondition.Target
        : StopCondition.None
      : controllerSettings.stop;
  const reached =
    Math.abs(config.target - measured) <= config.tolerance ||
    (config.target !== 0 &&
      measured * Math.sign(config.target) >= Math.abs(config.target));
  const shouldStop =
    stopMode !== StopCondition.None &&
    (state.t >= controllerSettings.stopAfter ||
      (stopMode === StopCondition.Target && !isDirect(config) && reached));
  return state.stoppedAt >= 0 ? state.stoppedAt : shouldStop ? state.t : -1;
}
