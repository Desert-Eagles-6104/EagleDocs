import React from "react";
import type { useExperiment } from "../hooks/useExperiment";
import { DT } from "../model/constants";
import { isGraphAvailable } from "../model/semantics";
import { methods } from "../config/labels";
import { typedEntries } from "../model/guards";
import { SimulationControls } from "./controls/SimulationControls";
import { MechanismView } from "./visuals/MechanismView";
import {
  ControllerReadout,
  SettlingReadout,
} from "./visuals/ControllerReadout";
import { Graph, graphNames } from "./visuals/Graph";
import { SettingsFields } from "./settings/SettingsFields";
import { ModelExplanation } from "./teaching/ModelExplanation";
import styles from "../styles.module.css";

export function ExperimentView({
  experiment,
}: {
  experiment: ReturnType<typeof useExperiment>;
}) {
  const { cfg, update, current, running, history, error, compatible, keys } =
    experiment;
  const view = cfg.view;
  const columns = cfg.compare ? styles.columns : styles.single;
  return (
    <>
      <SettingsFields cfg={cfg} update={update} />
      <SimulationControls
        running={running}
        blocked={!!error || !compatible}
        time={current.a.t}
        duration={cfg.duration}
        speed={cfg.speed}
        onToggle={experiment.toggleRunning}
        onReset={experiment.resetExperiment}
        onStep={experiment.advanceSample}
        onDisturbance={experiment.disturb}
        onSpeedChange={experiment.setSpeed}
        showStep={view.step}
        showSpeed={view.speed}
        showDisturbance={view.disturbance}
      />
      {error && <p role="alert">{error}</p>}
      {!compatible && (
        <p role="alert">
          יש בקר ששיטתו אינה מתאימה למטרה. עדכנו את הגדרותיו כדי להפעיל.
        </p>
      )}
      {current.a.t >= cfg.duration - DT / 2 && (
        <p role="status">
          הניסוי הסתיים. אפשר לעיין בתוצאות או לאפס ולהתחיל מחדש.
        </p>
      )}
      <div className={columns}>
        {keys.map((key, index) => (
          <div key={key}>
            {view.settlingTime && (
              <SettlingReadout
                cfg={cfg}
                state={current[key]}
                time={current.a.t}
                label={
                  cfg.compare ? `זמן התייצבות של בקר ${index + 1}` : undefined
                }
              />
            )}
            {view.mechanism && (
              <MechanismView
                label={`בקר ${index + 1} - ${methods[cfg[key].method]}`}
                cfg={cfg}
                state={current[key]}
                interactive={
                  cfg.controls.experiment === "all" ||
                  cfg.controls.experiment.includes("target")
                }
                onTarget={experiment.setTarget}
              />
            )}
            {view.readout && (
              <ControllerReadout cfg={cfg} state={current[key]} />
            )}
          </div>
        ))}
      </div>
      <section className={columns} aria-label="הגדרות הבקרים">
        {keys.map((key) => (
          <SettingsFields
            key={key}
            controllerKey={key}
            cfg={cfg}
            update={update}
          />
        ))}
      </section>
      {view.graphSelection && (
        <section className={styles.toolbar} aria-label="בחירת הגרפים">
          {typedEntries(graphNames)
            .filter(([kind]) => isGraphAvailable(cfg, kind))
            .map(([kind, label]) => (
              <label key={kind}>
                <input
                  type="checkbox"
                  checked={cfg.graphs.includes(kind)}
                  onChange={(event) =>
                    experiment.setGraphs(
                      event.target.checked
                        ? [...cfg.graphs, kind]
                        : cfg.graphs.filter((graph) => graph !== kind),
                    )
                  }
                />
                {label}
              </label>
            ))}
        </section>
      )}
      <div className={cfg.graphs.length > 1 ? styles.columns : undefined}>
        {cfg.graphs
          .filter((kind) => isGraphAvailable(cfg, kind))
          .map((kind) => (
            <Graph key={kind} kind={kind} cfg={cfg} history={history} />
          ))}
      </div>
      {view.explanations && <ModelExplanation />}
    </>
  );
}
