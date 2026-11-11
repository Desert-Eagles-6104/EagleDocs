import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import ControlIcon from "../ControlIcon";
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
  const playbackLabel = playing ? "השהיה" : finished ? "הפעל שוב" : "הפעל";

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

  function resetPlayback() {
    setPlaying(false);
    setStepIndex(0);
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
                resetPlayback();
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
        <div className={styles.actions} role="group" aria-label="פקדי ההדגמה">
          <button
            className={`button button--primary ${styles.iconButton}`}
            type="button"
            onClick={togglePlayback}
            disabled={lastIndex === 0}
            aria-label={playbackLabel}
            title={playbackLabel}
          >
            <ControlIcon name={playing ? "pause" : "play"} />
          </button>
          <button
            className={`button button--secondary ${styles.iconButton}`}
            type="button"
            onClick={resetPlayback}
            disabled={index === 0 && !playing}
            aria-label="איפוס"
            title="איפוס"
          >
            <ControlIcon name="reset" />
          </button>
          <button
            className={`button button--secondary ${styles.iconButton}`}
            type="button"
            onClick={() => stepBy(1)}
            disabled={finished}
            aria-label="צעד הבא"
            title="צעד הבא"
          >
            <ControlIcon name="step" />
          </button>
          <button
            className={`button button--secondary ${styles.iconButton}`}
            type="button"
            onClick={() => stepBy(-1)}
            disabled={index === 0}
            aria-label="צעד קודם"
            title="צעד קודם"
          >
            <ControlIcon name="stepBack" />
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
