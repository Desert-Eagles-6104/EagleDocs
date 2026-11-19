import { DT, SAMPLE_TICKS, MAX_FRAME_TICKS } from "../model/constants";
import { initial, step } from "./step";
import { supports } from "../model/semantics";
import { type Config, type Sample, type Simulation } from "../model/types";
export function createSimulation(initialVelocity = 0): Simulation {
  const start = { ...initial(), v: initialVelocity };
  return {
    a: start,
    b: { ...start },
    ticks: 0,
    disturbanceUntil: 0,
  };
}

export function advanceSimulation(
  simulation: Simulation,
  config: Config,
  requestedTicks: number,
) {
  const samples: Sample[] = [];
  const totalTicks = Math.round(config.duration / DT);
  const compatible =
    supports(config, config.a) &&
    (!config.compare || supports(config, config.b));
  if (!compatible) return { samples, finished: false, blocked: true };

  const ticks = Number.isFinite(requestedTicks)
    ? Math.min(MAX_FRAME_TICKS, Math.max(0, Math.floor(requestedTicks)))
    : 0;
  for (let tick = 0; tick < ticks && simulation.ticks < totalTicks; tick++) {
    const force =
      simulation.a.t < simulation.disturbanceUntil ? config.disturbance : 0;
    const a = step(simulation.a, config, config.a, force);
    const b = config.compare
      ? step(simulation.b, config, config.b, force)
      : simulation.b;
    // Commit both controllers together, only after verifying the next state.
    if (
      ![a, b].every((state) =>
        Object.values(state).every(
          (value) => typeof value === "boolean" || Number.isFinite(value),
        ),
      )
    )
      throw new Error("Simulation produced a non-finite state");
    simulation.a = a;
    simulation.b = b;
    simulation.ticks++;
    if (
      simulation.ticks % SAMPLE_TICKS === 0 ||
      simulation.ticks === totalTicks
    )
      samples.push({ a, b });
  }
  return { samples, finished: simulation.ticks >= totalTicks, blocked: false };
}
