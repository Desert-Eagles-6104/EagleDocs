import React from "react";
import { presets, presetDescriptions } from "./config/presets";
import { usePlayground } from "./hooks/usePlayground";
import { ExperimentView } from "./components/ExperimentView";
import styles from "./styles.module.css";

export default function ControlPlayground() {
  const experiment = usePlayground();
  const { chosenPreset, setChosenPreset, loadPreset, loadedPreset, reduced } =
    experiment;
  return (
    <div className={styles.playground} dir="rtl">
      <div className={styles.intro}>
        <h1>מגדירים מטרה. מודדים. מתקנים.</h1>
        <p>
          בוחרים מנגנון ומטרה, מכוונים את הבקרים ומשווים את התוצאות באותם תנאים.
        </p>
      </div>
      <details className={styles.card}>
        <summary>ניסויים מודרכים</summary>
        <label>
          מה רוצים לבדוק?
          <select
            value={chosenPreset}
            onChange={(event) => setChosenPreset(event.target.value)}
          >
            {Object.entries(presets).map(([key, preset]) => (
              <option key={key} value={key}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
        <p>{presetDescriptions[chosenPreset]}</p>
        <button onClick={() => loadPreset(chosenPreset)}>
          טעינת הניסוי וההגדרות שלו
        </button>
      </details>
      {loadedPreset && <p>{presetDescriptions[loadedPreset]}</p>}
      {reduced && (
        <p>
          העדפת תנועה מופחתת פעילה. אפשר להתקדם בצעדים או להפעיל אנימציה במפורש.
        </p>
      )}
      <ExperimentView experiment={experiment} />
    </div>
  );
}
