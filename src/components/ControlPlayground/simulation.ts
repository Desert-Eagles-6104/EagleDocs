import { DT, initial, step, supports, type Config, type State } from "./engine";

export type Sample = { a: State; b: State };
export const SAMPLE_TICKS = 4;
export const HISTORY_LIMIT = 600;
// Limit work after a stalled frame, even at the fastest playback speed.
export const MAX_FRAME_TICKS = 80;

export function createSimulation() {
  return { a: initial(), b: initial(), ticks: 0, disturbanceUntil: 0 };
}

export function advanceSimulation(
  simulation: ReturnType<typeof createSimulation>,
  cfg: Config,
  requestedTicks: number,
) {
  const samples: Sample[] = [];
  const totalTicks = Math.round(cfg.duration / DT);
  const compatible =
    supports(cfg, cfg.a) && (!cfg.compare || supports(cfg, cfg.b));
  if (!compatible) return { samples, finished: false, blocked: true };

  const ticks = Number.isFinite(requestedTicks)
    ? Math.min(MAX_FRAME_TICKS, Math.max(0, Math.floor(requestedTicks)))
    : 0;
  for (let tick = 0; tick < ticks && simulation.ticks < totalTicks; tick++) {
    const force =
      simulation.a.t < simulation.disturbanceUntil ? cfg.disturbance : 0;
    const a = step(simulation.a, cfg, cfg.a, force);
    const b = cfg.compare
      ? step(simulation.b, cfg, cfg.b, force)
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
