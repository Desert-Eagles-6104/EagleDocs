import { SAMPLE_TICKS } from "../model/constants";
import { useCallback, useState } from "react";
import { createSimulation } from "../engine/simulation";
import type { Config } from "../model/types";
import { controllerKeys, isCompatible } from "../model/semantics";
import { validate } from "../config/validation";
import { useSimulation } from "./useSimulation";

/** Shared experiment state for the full playground and isolated MDX demos. */
export function useExperiment(initialConfig: Config) {
  const [cfg, setCfg] = useState(() => validate(initialConfig));
  const simulation = useSimulation(cfg);
  const { reset, setRunning } = simulation;
  const update = useCallback(
    (next: Config) => {
      const validated = validate(next);
      setRunning(false);
      setCfg(validated);
      reset(validated.initialVelocity);
    },
    [reset, setRunning],
  );
  const resetExperiment = useCallback(() => {
    setRunning(false);
    reset(cfg.initialVelocity);
  }, [cfg.initialVelocity, reset, setRunning]);
  const setSpeed = (speed: number) =>
    setCfg((previous) => validate({ ...previous, speed }));
  const setTarget = (target: number) => update({ ...cfg, target });
  return {
    ...simulation,
    cfg,
    update,
    resetExperiment,
    setSpeed,
    setTarget,
    current: simulation.history.at(-1) ?? createSimulation(cfg.initialVelocity),
    keys: controllerKeys(cfg),
    compatible: isCompatible(cfg),
    toggleRunning: () => setRunning((previous) => !previous),
    advanceSample: () => simulation.advance(SAMPLE_TICKS),
    setGraphs: (graphs: Config["graphs"]) =>
      setCfg((previous) => validate({ ...previous, graphs })),
  };
}
