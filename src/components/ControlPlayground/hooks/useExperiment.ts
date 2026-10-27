import { SAMPLE_TICKS } from "../model/constants";
import { useCallback, useState } from "react";
import { initial } from "../engine/step";
import type { Config, Controller, ControllerKey } from "../model/types";
import { controllerKeys, isCompatible, targetUnit } from "../model/semantics";
import { validate } from "../config/validation";
import { useSimulation } from "./useSimulation";

/** Shared experiment state for the full playground and isolated MDX demos. */
export function useExperiment(initialConfig: Config) {
  const [cfg, setCfg] = useState(() => validate(initialConfig));
  const simulation = useSimulation(cfg);
  const { reset, setRunning } = simulation;
  const update = useCallback(
    (next: Config) => {
      setRunning(false);
      setCfg(validate(next));
      reset();
    },
    [reset, setRunning],
  );
  const resetExperiment = useCallback(() => {
    setRunning(false);
    reset();
  }, [reset, setRunning]);
  const setSpeed = (speed: number) =>
    setCfg((previous) => validate({ ...previous, speed }));
  const setTarget = (target: number) => update({ ...cfg, target });
  const setDemand = (demand: number) => update({ ...cfg, demand });
  const updateController = (key: ControllerKey, changes: Partial<Controller>) =>
    update({
      ...cfg,
      [key]: { ...cfg[key], ...changes },
    });
  return {
    ...simulation,
    cfg,
    update,
    resetExperiment,
    setSpeed,
    setTarget,
    setDemand,
    updateController,
    current: simulation.history.at(-1) ?? { a: initial(), b: initial() },
    keys: controllerKeys(cfg),
    compatible: isCompatible(cfg),
    unit: targetUnit(cfg),
    toggleRunning: () => setRunning((previous) => !previous),
    advanceSample: () => simulation.advance(SAMPLE_TICKS),
    setGraphs: (graphs: Config["graphs"]) =>
      setCfg((previous) => validate({ ...previous, graphs })),
  };
}
