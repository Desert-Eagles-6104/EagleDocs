import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

export type DemoStep = {
  label: string;
  message: string;
};

type DemoScenario<Step extends DemoStep> = {
  id: string;
  label: string;
  steps: readonly [Step, ...Step[]];
};

export type CommandLifecycleDemoProps<Step extends DemoStep> = {
  title: string;
  scenarios: readonly [DemoScenario<Step>, ...DemoScenario<Step>[]];
  renderMechanism: (step: Step, playing: boolean) => ReactNode;
  renderSequence?: (step: Step, visibleSteps: readonly Step[]) => ReactNode;
};

export function DemoStepList({ steps }: { steps: readonly DemoStep[] }) {
  return (
    <ol className={styles.steps}>
      {steps.map(({ label }, index) => (
        <li
          key={index}
          aria-current={index === steps.length - 1 ? "step" : undefined}
        >
          <bdi>{label}</bdi>
        </li>
      ))}
    </ol>
  );
}

export default function CommandLifecycleDemo<Step extends DemoStep>({
  title,
  scenarios,
  renderMechanism,
  renderSequence,
}: CommandLifecycleDemoProps<Step>) {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const scenario =
    scenarios.find(({ id }) => id === scenarioId) ?? scenarios[0];
  const lastIndex = scenario.steps.length - 1;
  const index = Math.min(stepIndex, lastIndex);
  const step = scenario.steps[index];
  const finished = index === lastIndex;

  useEffect(() => {
    if (!playing || finished) return;

    const nextIndex = index + 1;
    const timer = globalThis.setTimeout(() => {
      setStepIndex(nextIndex);
      if (nextIndex === lastIndex) setPlaying(false);
    }, 800);
    return () => globalThis.clearTimeout(timer);
  }, [finished, index, lastIndex, playing]);

  function stepBy(offset: number) {
    setPlaying(false);
    setStepIndex(Math.max(0, Math.min(index + offset, lastIndex)));
  }

  function togglePlayback() {
    if (finished) setStepIndex(0);
    setPlaying(!playing);
  }

  return (
    <section className={styles.demo} dir="rtl" aria-label={title}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.controls}>
        {scenarios.length > 1 && (
          <label className={styles.scenario}>
            תרחיש
            <select
              value={scenario.id}
              onChange={(event) => {
                setPlaying(false);
                setStepIndex(0);
                setScenarioId(event.target.value);
              }}
            >
              {scenarios.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className={styles.actions}>
          <button
            className="button button--primary"
            type="button"
            onClick={togglePlayback}
            disabled={lastIndex === 0}
          >
            {playing ? "עצור הרצה" : finished ? "הפעל שוב" : "הפעל"}
          </button>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => stepBy(-1)}
            disabled={index === 0}
          >
            צעד קודם
          </button>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => stepBy(1)}
            disabled={finished}
          >
            צעד הבא
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        {renderMechanism(step, playing)}
        <div>
          <div className={styles.detail} aria-live="polite" aria-atomic="true">
            {renderSequence ? (
              <span className={styles.srOnly}>{step.label}. </span>
            ) : (
              <strong className={styles.stepLabel}>
                <bdi>{step.label}</bdi>
              </strong>
            )}
            {step.message}
          </div>
          {renderSequence?.(step, scenario.steps.slice(0, index + 1))}
        </div>
      </div>
    </section>
  );
}
