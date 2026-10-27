import { MechanismType, ControlRequest } from "../model/constants";
import { DT } from "../model/constants";
import { bounds, clamp } from "../model/semantics";
import { type Config, type State } from "../model/types";
export function advanceMechanism(
  state: State,
  config: Config,
  output: number,
  disturbance: number,
) {
  const torque = config.request === ControlRequest.Torque;
  // Voltage model: generalized drive force = voltage; torque model: force = 0.25 * current.
  const gravity =
    config.mechanism === MechanismType.Wheel
      ? 0
      : 2 * (config.mechanism === MechanismType.Arm ? Math.cos(state.x) : 1);
  const force =
    (torque ? output * 0.25 : output) -
    config.damping * state.v -
    gravity +
    disturbance;
  const friction =
    Math.abs(state.v) < 0.001
      ? clamp(force, -config.friction, config.friction)
      : Math.sign(state.v) * config.friction;
  const acceleration = (force - friction) / config.inertia;
  let v = state.v + acceleration * DT,
    x = state.x + v * DT;
  if (config.mechanism !== MechanismType.Wheel) {
    const [lo, hi] = bounds(config.mechanism);
    if (x < lo || x > hi) {
      x = clamp(x, lo, hi);
      v = 0;
    }
  }
  const actualAcceleration = (v - state.v) / DT;
  return { x, v, acceleration: actualAcceleration };
}
