import { ControlMethod, ControlRequest } from "../model/constants";
import { profile } from "./profiles";
import { advanceMechanism } from "./physics";
import {
  feedforward,
  pid,
  controllerOutput,
  outputStoppedAt,
} from "./controllers";
import { DT } from "../model/constants";
import {
  isVelocity,
  isDirect,
  supports,
  clamp,
  hasFeedforward,
  hasPid,
} from "../model/semantics";
import { type Config, type Controller, type State } from "../model/types";
export function initial(): State {
  return {
    t: 0,
    x: 0,
    v: 0,
    acceleration: 0,
    integral: 0,
    previous: 0,
    on: false,
    error: 0,
    p: 0,
    i: 0,
    d: 0,
    ff: 0,
    output: 0,
    raw: 0,
    reference: 0,
    rv: 0,
    ra: 0,
    stoppedAt: -1,
    settledSince: -1,
    settledAt: -1,
  };
}
export function step(
  state: State,
  config: Config,
  selected: Controller,
  disturbance = 0,
): State {
  if (!supports(config, selected))
    throw new Error("Unsupported control method for request");
  const controllerSettings = selected;
  const velocity = isVelocity(config);
  const reference =
    (controllerSettings.method === ControlMethod.Profile ||
      config.request === ControlRequest.MotionMagic) &&
    !velocity
      ? profile(
          controllerSettings.profile,
          config.target,
          state.t + DT,
          controllerSettings.vmax,
          controllerSettings.amax,
          controllerSettings.jmax,
        )
      : { p: config.target, v: 0, a: 0 };
  const measured =
    (velocity ? state.v : state.x) +
    config.noise * Math.sin((state.t + DT) * 173);
  const error = reference.p - measured;
  const ff = hasFeedforward(controllerSettings.method)
    ? feedforward(
        controllerSettings,
        velocity ? config.target : reference.v,
        reference.a,
        velocity ? state.x : reference.p,
        config.mechanism,
      )
    : 0;
  const limit = Math.min(config.limit, config.battery);
  const terms = hasPid(controllerSettings.method)
    ? pid(
        controllerSettings,
        error,
        state.t ? (error - state.previous) / DT : 0,
        state.integral,
        ff,
        limit,
      )
    : { p: 0, i: 0, d: 0, integral: 0 };
  let on = state.on;
  if (error > controllerSettings.hysteresis) on = true;
  else if (
    error < -controllerSettings.hysteresis ||
    controllerSettings.hysteresis === 0
  )
    on = false;
  let raw = controllerOutput(controllerSettings, terms, ff, on);
  const torque = config.request === ControlRequest.Torque;
  if (isDirect(config))
    raw =
      config.request === ControlRequest.Duty
        ? (config.demand / 100) * config.battery
        : config.demand;
  const stoppedAt = outputStoppedAt(
    state,
    config,
    controllerSettings,
    measured,
  );
  const output =
    stoppedAt >= 0 ? 0 : clamp(raw, torque ? -40 : -limit, torque ? 40 : limit);
  const {
    x,
    v,
    acceleration: actualAcceleration,
  } = advanceMechanism(state, config, output, disturbance);
  const settling = isDirect(config)
    ? { settledSince: -1, settledAt: -1 }
    : settlingStatus(
        state,
        config,
        velocity ? v : x,
        velocity ? actualAcceleration : v,
      );
  return {
    t: state.t + DT,
    x,
    v,
    acceleration: (v - state.v) / DT,
    previous: error,
    on,
    error,
    ...(stoppedAt >= 0 ? { p: 0, i: 0, d: 0, integral: 0 } : terms),
    ff: stoppedAt >= 0 ? 0 : ff,
    raw: stoppedAt >= 0 ? 0 : raw,
    output,
    reference: reference.p,
    rv: velocity ? config.target : reference.v,
    ra: reference.a,
    stoppedAt,
    ...settling,
  };
}

// Online observation: revoke the result if the response leaves the band again.
export function settlingStatus(
  state: State,
  config: Config,
  actual: number,
  rate: number,
) {
  const inside =
    Math.abs(config.target - actual) <= config.tolerance &&
    Math.abs(rate) <= config.rateTolerance;
  const settledSince = inside
    ? state.settledSince >= 0
      ? state.settledSince
      : state.t + DT
    : -1;
  return {
    settledSince,
    settledAt:
      settledSince >= 0 && state.t + DT - settledSince >= config.dwell - 1e-9
        ? settledSince
        : -1,
  };
}
