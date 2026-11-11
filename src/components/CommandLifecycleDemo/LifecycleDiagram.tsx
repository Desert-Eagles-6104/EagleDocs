import React from "react";
import styles from "./LifecycleDiagram.module.css";

export type LifecycleStage =
  | "create"
  | "init"
  | "cycle"
  | "execute"
  | "check"
  | "interrupt"
  | "end"
  | "free";
export type LifecycleRoute = "again" | "done" | "cancel" | "";

const returnPath =
  "M 68 100 H 13 Q 5 100 5 92 V 28 Q 5 20 13 20 H 66 M 59 15 L 66 20 L 59 25";

export default function LifecycleDiagram({
  stage,
  route,
  labels,
}: {
  stage: LifecycleStage;
  route: LifecycleRoute;
  labels: Record<LifecycleStage, string>;
}) {
  const current = (node: LifecycleStage): "step" | undefined =>
    stage === node ? "step" : undefined;

  return (
    <div className={styles.flow} data-route={route}>
      <div className={styles.creation} aria-current={current("create")}>
        {labels.create}
      </div>
      <div className={styles.node} aria-current={current("init")}>
        <code dir="ltr">{labels.init}</code>
      </div>
      <div className={styles.arrow} aria-hidden="true">
        ↓
      </div>
      <div className={styles.split}>
        <div className={styles.cycle}>
          <div className={styles.node} aria-current={current("cycle")}>
            {labels.cycle}
          </div>
          <div aria-hidden="true">↓</div>
          <div className={styles.node} aria-current={current("execute")}>
            <code dir="ltr">{labels.execute}</code>
          </div>
          <div aria-hidden="true">↓</div>
          <div className={styles.node} aria-current={current("check")}>
            <code dir="ltr">{labels.check}</code>
          </div>
        </div>
        <div
          className={styles.returnPath}
          role="img"
          aria-label="false חוזר לראש הלולאה"
        >
          <svg
            viewBox="0 0 70 120"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d={returnPath} />
            <path
              className={styles.returnProgress}
              pathLength={1}
              d={returnPath}
            />
          </svg>
          <code dir="ltr">false</code>
        </div>
      </div>
      <div className={`${styles.arrow} ${styles.normal}`}>
        <code dir="ltr">true</code> <span aria-hidden="true">↓</span>
      </div>
      <div className={styles.split}>
        <div className={styles.end} aria-current={current("end")}>
          <code dir="ltr">{labels.end}</code>
        </div>
        <div className={styles.external}>
          <span aria-hidden="true">→</span>
          <span aria-current={current("interrupt")}>{labels.interrupt}</span>
        </div>
      </div>
      <div className={styles.arrow} aria-hidden="true">
        ↓
      </div>
      <div className={styles.node} aria-current={current("free")}>
        {labels.free}
      </div>
    </div>
  );
}
