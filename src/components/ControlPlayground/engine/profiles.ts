import { MotionProfile } from "../model/constants";
import { type Profile } from "../model/constants";
import { type Reference } from "../model/types";
// Rest-to-rest trajectories. S-curve is a time-scaled quintic, not CTRE firmware.
export function profile(
  kind: Profile,
  distance: number,
  t: number,
  vmax: number,
  amax: number,
  jmax: number,
): Reference {
  const d = Math.abs(distance),
    sign = Math.sign(distance);
  if (!d || kind === MotionProfile.Direct) return { p: distance, v: 0, a: 0 };
  if (kind === MotionProfile.SCurve) {
    const T = Math.max(
      (1.875 * d) / vmax,
      Math.sqrt((5.774 * d) / amax),
      Math.cbrt((60 * d) / jmax),
    );
    const state = Math.min(1, Math.max(0, t / T));
    return {
      p: distance * (10 * state ** 3 - 15 * state ** 4 + 6 * state ** 5),
      v: (distance / T) * (30 * state ** 2 - 60 * state ** 3 + 30 * state ** 4),
      a:
        (distance / T ** 2) *
        (60 * state - 180 * state ** 2 + 120 * state ** 3),
    };
  }
  const ramp = Math.min(vmax / amax, Math.sqrt(d / amax));
  const peak = amax * ramp,
    cruise = Math.max(0, d / peak - ramp),
    T = 2 * ramp + cruise;
  if (t >= T) return { p: distance, v: 0, a: 0 };
  if (t < ramp)
    return { p: (sign * amax * t * t) / 2, v: sign * amax * t, a: sign * amax };
  if (t < ramp + cruise)
    return {
      p: sign * ((peak * ramp) / 2 + peak * (t - ramp)),
      v: sign * peak,
      a: 0,
    };
  const left = T - t;
  return {
    p: distance - (sign * amax * left * left) / 2,
    v: sign * amax * left,
    a: -sign * amax,
  };
}
