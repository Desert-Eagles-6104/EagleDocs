import React, { Fragment } from "react";
import styles from "./RollerView.module.css";

type Track = {
  label: string;
  elapsedMs: number;
};

type RollerViewProps = {
  running: boolean;
  playing: boolean;
  output: string;
  status: readonly string[];
  timeline?: {
    durationMs: number;
    input: Track;
    output: Track;
  };
};

const tickPositions = [0, 0.25, 0.5, 0.75, 1];

export default function RollerView({
  running,
  playing,
  output,
  status,
  timeline,
}: RollerViewProps) {
  return (
    <div className={styles.rollerView}>
      <div
        className={styles.wheel}
        data-running={running}
        data-playing={playing}
        aria-hidden="true"
      >
        <div className={styles.spokes} />
        <div className={styles.hub} />
      </div>
      <div className={styles.status}>
        <strong>{output}</strong>
        {status.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
      {timeline && (
        <div
          className={styles.timeline}
          role="img"
          aria-label={`${timeline.input.label} למשך ${timeline.input.elapsedMs / 1000} שניות. ${timeline.output.label} למשך ${timeline.output.elapsedMs / 1000} שניות.`}
        >
          {[
            { ...timeline.input, fill: styles.buttonFill },
            { ...timeline.output, fill: styles.rollerFill },
          ].map(({ label, elapsedMs, fill }) => (
            <Fragment key={fill}>
              <span>{label}</span>
              <div className={styles.track} dir="ltr">
                <div
                  className={fill}
                  style={{
                    width: `${(elapsedMs / timeline.durationMs) * 100}%`,
                  }}
                />
              </div>
            </Fragment>
          ))}
          <span>שניות</span>
          <div className={styles.ticks} dir="ltr">
            {tickPositions.map((position) => (
              <span key={position}>
                {(position * timeline.durationMs) / 1000}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
