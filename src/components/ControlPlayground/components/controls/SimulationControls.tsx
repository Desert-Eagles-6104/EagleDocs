import React from "react";
import ControlIcon from "../../../ControlIcon";
import { DT, PLAYBACK_SPEEDS } from "../../model/constants";
import styles from "../../styles.module.css";

export function SimulationControls({
  running,
  blocked,
  time,
  duration,
  speed,
  onToggle,
  onReset,
  onStep,
  onDisturbance,
  onSpeedChange,
  showStep = true,
  showSpeed = true,
  showDisturbance = true,
}: {
  running: boolean;
  blocked: boolean;
  time: number;
  duration: number;
  speed: number;
  onToggle: () => void;
  onReset: () => void;
  onStep: () => void;
  onDisturbance: () => void;
  onSpeedChange: (speed: number) => void;
  showStep?: boolean;
  showSpeed?: boolean;
  showDisturbance?: boolean;
}) {
  const finished = time >= duration - DT / 2;
  const status = blocked
    ? "נדרש תיקון בהגדרות"
    : finished
      ? "הניסוי הסתיים"
      : running
        ? "הסימולציה פועלת"
        : time > 0
          ? "מושהה"
          : "מוכן להפעלה";
  return (
    <section className={styles.simulationControls} aria-label="פקדי הסימולציה">
      <div className={styles.controlHeader}>
        <div className={styles.runStatus} data-running={running}>
          <span className={styles.statusDot} aria-hidden="true" />
          <span>{status}</span>
        </div>
        <output className={styles.simulationClock} aria-label="זמן הסימולציה">
          <span>זמן</span>
          <bdi>
            <strong>{time.toFixed(2)}</strong>
            <span> / {duration.toFixed(2)} s</span>
          </bdi>
        </output>
      </div>
      <div className={styles.controlBody}>
        <div className={styles.transportControls}>
          <button
            type="button"
            className={styles.runButton}
            disabled={blocked || (!running && finished)}
            onClick={onToggle}
          >
            <ControlIcon name={running ? "pause" : "play"} />
            {running ? "השהיה" : time > 0 && !finished ? "המשך" : "הפעלה"}
          </button>
          {showStep && (
            <button
              type="button"
              disabled={blocked || running || finished}
              onClick={onStep}
              aria-label="צעד (20 ms)"
            >
              <ControlIcon name="step" />
              <span>
                צעד <bdi className={styles.controlHint}>20 ms</bdi>
              </span>
            </button>
          )}
          <button type="button" onClick={onReset}>
            <ControlIcon name="reset" />
            איפוס
          </button>
        </div>
        {(showSpeed || showDisturbance) && (
          <div className={styles.experimentControls}>
            {showSpeed && (
              <label className={styles.playbackSpeed}>
                מהירות
                <select
                  aria-label="מהירות הסימולציה"
                  value={speed}
                  onChange={(event) =>
                    onSpeedChange(Number(event.target.value))
                  }
                >
                  {PLAYBACK_SPEEDS.map((value) => (
                    <option key={value} value={value}>
                      ×{value}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {showDisturbance && (
              <button
                type="button"
                className={styles.disturbanceButton}
                onClick={onDisturbance}
                disabled={blocked || finished}
                aria-label="הפרעה למשך 0.5 שניות"
              >
                <ControlIcon name="disturbance" />
                <span>
                  הפרעה <span className={styles.controlHint}>0.5 שנ׳</span>
                </span>
              </button>
            )}
          </div>
        )}
      </div>
      <progress
        className={styles.simulationProgress}
        value={Math.min(time, duration)}
        max={duration}
        aria-label="התקדמות הניסוי"
      />
    </section>
  );
}
