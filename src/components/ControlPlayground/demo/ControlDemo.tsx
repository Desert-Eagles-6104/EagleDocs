import React, { useId, type ReactNode } from "react";
import type { Config } from "../model/types";
import type { ConfigInput } from "../model/config";
import { demoConfig } from "../config/demo";
import { useExperiment } from "../hooks/useExperiment";
import { ExperimentView } from "../components/ExperimentView";
import styles from "../styles.module.css";

export interface ControlDemoProps {
  title?: string;
  children?: ReactNode;
  preset?: string;
  config?: ConfigInput;
}

/** Lesson embeds use the same configuration, settings and renderer as the lab. */
export default function ControlDemo(props: ControlDemoProps) {
  let cfg: Config;
  try {
    cfg = demoConfig(props.preset, props.config);
  } catch {
    return (
      <p role="alert">
        לא ניתן לטעון את ההדגמה. בדקו את הקונפיגורציה ואת שם הניסוי.
      </p>
    );
  }
  return (
    <DemoSession key={JSON.stringify(cfg)} cfg={cfg} title={props.title}>
      {props.children}
    </DemoSession>
  );
}

function DemoSession({
  cfg,
  title = "הדגמת בקרה",
  children,
}: {
  cfg: Config;
  title?: string;
  children?: ReactNode;
}) {
  const id = useId();
  const experiment = useExperiment(cfg);
  return (
    <section
      className={`${styles.playground} ${styles.demo}`}
      dir="rtl"
      aria-labelledby={id}
    >
      <div className={styles.demoHeading} id={id}>
        {title}
      </div>
      {children && <div className={styles.demoPrompt}>{children}</div>}
      <ExperimentView experiment={experiment} />
    </section>
  );
}
