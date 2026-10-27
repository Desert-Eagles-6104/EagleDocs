import { ControllerReadout } from "./components/visuals/ControllerReadout";
import { ModelExplanation } from "./components/teaching/ModelExplanation";
import { isGraphAvailable } from "./model/semantics";
import { typedEntries } from "./model/guards";
import React from "react";
import { DT } from "./model/constants";
import { type Config } from "./model/types";
import { methods } from "./config/labels";
import { presets, presetDescriptions } from "./config/presets";
import { MechanismView } from "./components/visuals/MechanismView";
import { Graph, graphNames } from "./components/visuals/Graph";
import { GoalSettings } from "./components/settings/GoalSettings";
import { ExperimentSettings } from "./components/settings/ExperimentSettings";
import { ControllerPanel } from "./components/settings/ControllerPanel";
import { usePlayground } from "./hooks/usePlayground";
import { SimulationControls } from "./components/controls/SimulationControls";
import styles from "./styles.module.css";
export default function ControlPlayground() {
  const {
    cfg,
    update,
    reduced,
    chosenPreset,
    setChosenPreset,
    loadedPreset,
    running,
    history,
    error,
    current,
    keys,
    compatible,
    unit: targetUnit,
    loadPreset,
    visibleGraphs,
    toggleRunning,
    resetExperiment,
    advanceSample,
    disturb,
    setSpeed,
    setMechanism,
    toggleComparison,
    toggleGraph,
  } = usePlayground();
  return (
    <div className={styles.playground} dir="rtl">
      <div className={styles.intro}>
        <span className={styles.eyebrow}>מעבדת הבקרה • FRC</span>
        <h1>מגדירים מטרה. מודדים. מתקנים.</h1>
        <p>
          בוחרים <strong>מערכת ומטרה</strong>, ואז מגדירים בכל בקר{" "}
          <strong>איך לנסות להשיג אותה</strong>. אפשר להשוות כמה שיטות על אותו
          מנגנון ובאותם תנאים.
        </p>
      </div>
      <details className={styles.card}>
        <summary>ניסויים מודרכים - בוחרים שאלה ובודקים אותה</summary>
        <p>
          כל ניסוי טוען מנגנון והגדרות התחלה. ניסוי השוואתי מוסיף בקר שני עם
          שינוי מוגדר, כדי לראות מה משפיע על התגובה.
        </p>
        <label>
          מה רוצים לבדוק?
          <select
            value={chosenPreset}
            onChange={(e) => setChosenPreset(e.target.value)}
          >
            {Object.entries(presets).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <p>{presetDescriptions[chosenPreset]}</p>
        <button onClick={() => loadPreset(chosenPreset)}>
          טעינת הניסוי וההגדרות שלו
        </button>
      </details>
      {loadedPreset && (
        <p className={styles.card}>
          <strong>נקודת המוצא: {presets[loadedPreset].label}. </strong>
          {presetDescriptions[loadedPreset]}
        </p>
      )}
      <section className={styles.card} aria-label="תנאי הסימולציה">
        <h2>תנאי הסימולציה - המערכת והמטרה</h2>
        <div className={styles.toolbar}>
          <label>
            סוג המנגנון
            <select
              value={cfg.mechanism}
              onChange={(event) =>
                setMechanism(event.target.value as Config["mechanism"])
              }
            >
              <option value="elevator">מעלית</option>
              <option value="arm">זרוע</option>
              <option value="wheel">גלגל ירי</option>
            </select>
          </label>
        </div>
        <GoalSettings cfg={cfg} update={update} />
        <ExperimentSettings cfg={cfg} update={update} targetUnit={targetUnit} />
      </section>
      <SimulationControls
        running={running}
        blocked={!!error || !compatible}
        time={current.a.t}
        duration={cfg.duration}
        speed={cfg.speed}
        onToggle={toggleRunning}
        onReset={resetExperiment}
        onStep={advanceSample}
        onDisturbance={disturb}
        onSpeedChange={setSpeed}
      />
      {reduced && (
        <p>
          העדפת תנועה מופחתת פעילה: התחילו בצעדים בודדים או הפעילו אנימציה
          במפורש.
        </p>
      )}
      <p>
        <small>
          שינוי יעד או פרמטר מאתחל את כל הבקרים ממנוחה, כדי להשוות תנאים זהים.
          הגרפים שומרים את 12 השניות האחרונות.
        </small>
      </p>
      {error && <p role="alert">{error}</p>}
      {!compatible && (
        <p role="alert">
          יש בקר ששיטתו אינה מתאימה למטרה שנבחרה. עדכנו את השיטה בהגדרות הבקרים
          שמתחת לסימולציה כדי להפעיל את הניסוי.
        </p>
      )}
      {current.a.t >= cfg.duration - DT / 2 && (
        <p role="status">
          הניסוי הסתיים. אפשר לעיין בתוצאות או ללחוץ על איפוס כדי להתחיל מחדש.
        </p>
      )}
      <div className={cfg.compare ? styles.columns : styles.single}>
        {keys.map((key, i) => (
          <div key={key}>
            <MechanismView
              label={`בקר ${i + 1} - ${methods[cfg[key].method]}`}
              state={current[key]}
              cfg={cfg}
              onTarget={(n) => update({ ...cfg, target: n })}
            />
            <ControllerReadout
              cfg={cfg}
              state={current[key]}
              time={current.a.t}
              targetUnit={targetUnit}
            />
          </div>
        ))}
      </div>
      <section aria-label="הגדרות הבקרים">
        <h2>מגדירים את הבקר</h2>
        <p>
          המערכת והמטרה משותפות לכולם. בכל בקר בוחרים שיטת בקרה, פרופיל תנועה
          ופרמטרים, ובודקים איך הוא מנסה להשיג את המטרה.
        </p>
        <div className={cfg.compare ? styles.columns : styles.single}>
          {keys.map((key, i) => (
            <ControllerPanel
              key={key}
              label={`בקר ${i + 1}`}
              cfg={cfg}
              value={cfg[key]}
              onChange={(c) => update({ ...cfg, [key]: c })}
            />
          ))}
        </div>
        <button onClick={toggleComparison}>
          {cfg.compare
            ? "הסרת הבקר הנוסף"
            : "הוספת בקר נוסף לבדיקה מול הבקר הראשון"}
        </button>
        {!cfg.compare && (
          <p>
            <small>
              הבקר הנוסף יתחיל עם אותן הגדרות. שנו בו פרמטר אחד כדי לבדוק את
              ההשפעה.
            </small>
          </p>
        )}
      </section>
      <section aria-label="בחירת הגרפים">
        <div className={styles.toolbar}>
          {typedEntries(graphNames)
            .filter(([k]) => isGraphAvailable(cfg, k))
            .map(([k, v]) => (
              <label key={k}>
                <input
                  type="checkbox"
                  checked={cfg.graphs.includes(k)}
                  onChange={(event) => toggleGraph(k, event.target.checked)}
                />
                {v}
              </label>
            ))}
        </div>
      </section>
      <div className={styles.columns}>
        {visibleGraphs.map((k) => (
          <Graph key={k} kind={k} cfg={cfg} history={history} />
        ))}
      </div>

      <ModelExplanation />
    </div>
  );
}
