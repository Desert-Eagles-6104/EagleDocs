/* global requestAnimationFrame, cancelAnimationFrame */
import { useCallback, useEffect, useRef, useState } from "react";
import { DT, DISTURBANCE_DURATION, HISTORY_LIMIT } from "../model/constants";
import { type Config, type Sample } from "../model/types";
import { advanceSimulation, createSimulation } from "../engine/simulation";

export function useSimulation(config: Config) {
  const simulation = useRef(createSimulation());
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<Sample[]>([]);
  const [error, setError] = useState("");

  const reset = useCallback(() => {
    simulation.current = createSimulation();
    setHistory([]);
    setError("");
  }, []);

  const advance = useCallback(
    (ticks: number) => {
      try {
        const { samples, finished, blocked } = advanceSimulation(
          simulation.current,
          config,
          ticks,
        );
        if (samples.length)
          setHistory((previous) =>
            [...previous, ...samples].slice(-HISTORY_LIMIT),
          );
        if (finished || blocked) setRunning(false);
        return !finished && !blocked;
      } catch {
        setRunning(false);
        setError(
          "הסימולציה נעצרה עקב שגיאה בחישוב. אפסו את הניסוי ושנו את הגדרות הבקר.",
        );
        return false;
      }
    },
    [config],
  );

  useEffect(() => {
    if (!running) return;
    let frameId: number;
    let previousTime: number | undefined;
    let accumulator = 0;
    const frame = (now: number) => {
      if (previousTime !== undefined)
        accumulator +=
          Math.min((now - previousTime) / 1000, 0.1) * config.speed;
      previousTime = now;
      const ticks = Math.floor(accumulator / DT);
      accumulator -= ticks * DT;
      if (ticks && !advance(ticks)) return;
      frameId = requestAnimationFrame(frame);
    };
    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [running, config.speed, advance]);

  const disturb = () => {
    simulation.current.disturbanceUntil =
      simulation.current.a.t + DISTURBANCE_DURATION;
  };

  return { running, setRunning, history, reset, advance, disturb, error };
}
