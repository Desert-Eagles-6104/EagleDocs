import { DemoTuning } from "./DemoTuning";
import React, { useId, type ReactNode } from "react";
import { type Config } from "../model/types";
import { methods } from "../config/labels";
import { demoConfig } from "../config/demo";
import type {
  DemoConfig,
  DemoGraph,
  DemoTuning as TuningOptions,
} from "../model/demo";
import { useExperiment } from "../hooks/useExperiment";
import { targetModel } from "../view-model/target";
import { SimulationControls } from "../components/controls/SimulationControls";
import { MechanismView } from "../components/visuals/MechanismView";
import { SettlingReadout } from "../components/visuals/ControllerReadout";
import { Graph } from "../components/visuals/Graph";
import { Slider } from "../components/controls/Slider";
import { positionUnit } from "../model/semantics";
import styles from "../styles.module.css";

export interface ControlDemoProps {
  title?: string;
  children?: ReactNode;
  preset?: string;
  config?: DemoConfig;
  graphs?: DemoGraph[];
  tune?: TuningOptions;
  adjustTarget?: boolean;
  showMechanism?: boolean;
  showStep?: boolean;
  showSpeed?: boolean;
  disturbance?: boolean;
  showTolerance?: boolean;
  showSettlingTime?: boolean;
  adjustInitialVelocity?: boolean;
}

/** Focused MDX simulation. Each instance owns its state and never reads the URL. */
export default function ControlDemo(props: ControlDemoProps) {
  let config: Config;
  try {
    config = demoConfig(props.preset, props.config, props.graphs);
  } catch {
    return (
      <p role="alert">לא ניתן לטעון את ההדגמה: בדקו את שם הניסוי ב־preset.</p>
    );
  }
  return (
    <DemoSession
      key={JSON.stringify(config)}
      {...props}
      initialConfig={config}
    />
  );
}

function DemoSession({
  initialConfig,
  title = "הדגמת בקרה",
  children,
  tune = [],
  adjustTarget = false,
  showMechanism = true,
  showStep = true,
  showSpeed = false,
  disturbance = false,
  showTolerance = false,
  showSettlingTime = false,
  adjustInitialVelocity = false,
}: ControlDemoProps & { initialConfig: Config }) {
  const id = useId();
  const {
    cfg,
    running,
    history,
    error,
    current,
    keys,
    compatible,
    update,
    toggleRunning,
    resetExperiment,
    advanceSample,
    disturb,
    setSpeed,
    initialVelocity,
    changeInitialVelocity,
  } = useExperiment(initialConfig);
  const target = targetModel(cfg);
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
      <SimulationControls
        running={running}
        blocked={!compatible || !!error}
        time={current.a.t}
        duration={cfg.duration}
        speed={cfg.speed}
        onToggle={toggleRunning}
        onReset={resetExperiment}
        onStep={advanceSample}
        onDisturbance={disturb}
        onSpeedChange={setSpeed}
        showStep={showStep}
        showSpeed={showSpeed}
        showDisturbance={disturbance}
      />
      {error && <p role="alert">{error}</p>}
      {!compatible && (
        <p role="alert">
          שיטת הבקר אינה מתאימה למטרת ההדגמה. יש לתקן את הגדרות ההדגמה בקובץ
          ה־MDX.
        </p>
      )}
      {adjustInitialVelocity && (
        <Slider
          label={`מהירות התחלתית (${positionUnit(cfg)}/s)`}
          min={0}
          max={6}
          step={0.1}
          value={initialVelocity}
          onChange={changeInitialVelocity}
        />
      )}
      {adjustTarget && (
        <Slider
          label={
            target.direct
              ? `פלט מבוקש (${target.unit})`
              : `יעד (${target.unit})`
          }
          min={target.min}
          max={target.max}
          step={0.05}
          value={target.value}
          onChange={(value) =>
            update({
              ...cfg,
              ...(target.direct ? { demand: value } : { target: value }),
            })
          }
        />
      )}
      {(showMechanism || showSettlingTime) && (
        <div className={cfg.compare ? styles.columns : styles.single}>
          {keys.map((key, index) => (
            <div key={key}>
              {showSettlingTime && (
                <SettlingReadout
                  cfg={cfg}
                  state={current[key]}
                  time={current.a.t}
                  label={
                    cfg.compare ? `זמן התייצבות של בקר ${index + 1}` : undefined
                  }
                />
              )}
              {showMechanism && (
                <MechanismView
                  label={`בקר ${index + 1} - ${methods[cfg[key].method]}`}
                  state={current[key]}
                  cfg={cfg}
                  interactive={adjustTarget}
                  onTarget={(target) => update({ ...cfg, target })}
                />
              )}
            </div>
          ))}
        </div>
      )}
      <DemoTuning cfg={cfg} keys={keys} tune={tune} update={update} />
      {cfg.graphs.length > 0 && (
        <div className={cfg.graphs.length > 1 ? styles.columns : undefined}>
          {cfg.graphs.map((kind) => (
            <Graph
              key={kind}
              kind={kind}
              cfg={cfg}
              history={history}
              showTolerance={showTolerance}
            />
          ))}
        </div>
      )}
    </section>
  );
}
