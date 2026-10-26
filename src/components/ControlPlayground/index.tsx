/* global window */
import React, { useEffect, useState } from "react";
import {
  defaults,
  initial,
  DT,
  supports,
  isDirect,
  isVelocity,
  type Config,
} from "./engine";
import {
  methods,
  presets,
  validate,
  readConfig,
  presetDescriptions,
  MAX_QUERY_LENGTH,
} from "./config";
import { Help, MathText } from "./Help";
import { MechanismView, Graph, graphNames } from "./Visuals";
import { GoalSettings } from "./GoalSettings";
import { ExperimentSettings } from "./ExperimentSettings";
import { ControllerPanel } from "./ControllerPanel";
import { useSimulation } from "./useSimulation";
import styles from "./styles.module.css";
export default function ControlPlayground() {
  const [cfg, setCfg] = useState<Config>(() => validate(defaults));
  const [reduced, setReduced] = useState(false);
  const [chosenPreset, setChosenPreset] = useState("tuned");
  const [loadedPreset, setLoadedPreset] = useState("");
  const { running, setRunning, history, reset, advance, disturb, error } =
    useSimulation(cfg);
  const update = (next: Config) => {
    setRunning(false);
    setCfg(validate(next));
    setLoadedPreset("");
    reset();
  };
  useEffect(() => {
    setCfg(readConfig(window.location.search));
    const preset =
      window.location.search.length <= MAX_QUERY_LENGTH
        ? new window.URLSearchParams(window.location.search).get("preset")
        : null;
    if (preset && Object.hasOwn(presets, preset)) {
      setChosenPreset(preset);
      setLoadedPreset(preset);
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      setReduced(mq.matches);
      if (mq.matches) setRunning(false);
    };
    change();
    mq.addEventListener("change", change);
    const pop = () => {
      setCfg(readConfig(window.location.search));
      setLoadedPreset("");
      reset();
      setRunning(false);
    };
    window.addEventListener("popstate", pop);
    return () => {
      mq.removeEventListener("change", change);
      window.removeEventListener("popstate", pop);
    };
  }, []);
  const compatible =
    supports(cfg, cfg.a) && (!cfg.compare || supports(cfg, cfg.b));
  const visibleGraphs = cfg.graphs.filter(
    (k) => !isDirect(cfg) || !["response", "error", "terms"].includes(k),
  );
  const current = history.at(-1) ?? { a: initial(), b: initial() };
  const targetUnit =
    (cfg.mechanism === "elevator" ? "m" : "rad") +
    (isVelocity(cfg) ? "/s" : "");
  const loadPreset = (key: string) => {
    update({ ...defaults, ...presets[key].config });
    setLoadedPreset(key);
    setRunning(false);
  };
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
        <summary>ניסויים מודרכים — בוחרים שאלה ובודקים אותה</summary>
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
        <h2>תנאי הסימולציה — המערכת והמטרה</h2>
        <div className={styles.toolbar}>
          <label>
            סוג המנגנון
            <select
              value={cfg.mechanism}
              onChange={(e) => {
                const mechanism = e.target.value as Config["mechanism"];
                update({
                  ...cfg,
                  mechanism,
                  target:
                    mechanism === "wheel" ? 8 : mechanism === "arm" ? 0.8 : 1.5,
                });
              }}
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
      <div className={styles.toolbar}>
        <button
          disabled={
            !!error ||
            !compatible ||
            (!running && current.a.t >= cfg.duration - DT / 2)
          }
          onClick={() => setRunning(!running)}
        >
          {running ? "השהיה" : "הפעלה"}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            reset();
          }}
        >
          איפוס
        </button>
        <button
          disabled={
            !!error ||
            !compatible ||
            running ||
            current.a.t >= cfg.duration - DT / 2
          }
          onClick={() => advance(4)}
        >
          צעד (20 ms)
        </button>
        <button
          onClick={() => {
            disturb();
          }}
        >
          הפרעה למשך 0.5 שניות
        </button>
        <label>
          מהירות הסימולציה
          <select
            value={cfg.speed}
            onChange={(e) => setCfg({ ...cfg, speed: Number(e.target.value) })}
          >
            {[0.25, 0.5, 1, 2, 4].map((n) => (
              <option key={n} value={n}>
                ×{n}
              </option>
            ))}
          </select>
        </label>
        <output>זמן: {current.a.t.toFixed(2)} s</output>
      </div>
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
        {(["a", ...(cfg.compare ? ["b"] : [])] as ("a" | "b")[]).map(
          (key, i) => (
            <div key={key}>
              <MechanismView
                label={`בקר ${i + 1} — ${methods[cfg[key].method]}`}
                state={current[key]}
                cfg={cfg}
                onTarget={(n) => update({ ...cfg, target: n })}
              />
              <div className={styles.readout}>
                {!isDirect(cfg) && (
                  <span>
                    שגיאה{" "}
                    <Help
                      label="שגיאה e"
                      text="ההפרש בין יעד הבקר למדידה. בפרופיל תנועה זהו יעד הביניים; ההתייצבות נבדקת ביחס ליעד הסופי."
                    />
                    <bdi>
                      e = {current[key].error.toFixed(2)} {targetUnit}
                    </bdi>
                  </span>
                )}
                <span>
                  פלט המנוע{" "}
                  <Help
                    label="פלט u"
                    text="הפקודה שהמנוע מקבל לאחר הגבלות הפלט ותנאי הניתוק. בדרך כלל בוולטים; בבקשת זרם מומנט באמפר."
                  />
                  <bdi>
                    u = {current[key].output.toFixed(2)}{" "}
                    {cfg.request === "torque" ? "A" : "V"}
                  </bdi>
                </span>
                {Math.abs(current[key].raw - current[key].output) > 0.01
                  ? " • רוויה"
                  : ""}
              </div>
              {!isDirect(cfg) && (
                <p className={styles.readout}>
                  זמן התייצבות{" "}
                  <Help
                    label="זמן התייצבות"
                    text={`הזמן מתחילת הניסוי לכניסה לתחום סביב היעד הסופי, לאחר שהייה רצופה של ${cfg.dwell} שניות גם בתחום קצב השינוי. אם המערכת יוצאת שוב מהתחום, התוצאה מתבטלת. זהו אומדן לפי התנועה שנצפתה עד עכשיו.`}
                  />
                  :{" "}
                  <strong>
                    {current[key].settledAt >= 0
                      ? `${current[key].settledAt.toFixed(2)} שניות`
                      : current.a.t >= cfg.duration - DT / 2
                        ? "לא התייצב במהלך הניסוי"
                        : "טרם התייצב"}
                  </strong>
                </p>
              )}
              {current[key].stoppedAt >= 0 && (
                <p className={styles.readout}>
                  הפלט נותק אחרי {current[key].stoppedAt.toFixed(2)} שניות;
                  המנגנון ממשיך לנוע לפי הפיזיקה.
                </p>
              )}
            </div>
          ),
        )}
      </div>
      <section aria-label="הגדרות הבקרים">
        <h2>מגדירים את הבקר</h2>
        <p>
          המערכת והמטרה משותפות לכולם. בכל בקר בוחרים שיטת בקרה, פרופיל תנועה
          ופרמטרים, ובודקים איך הוא מנסה להשיג את המטרה.
        </p>
        <div className={cfg.compare ? styles.columns : styles.single}>
          {(["a", ...(cfg.compare ? ["b"] : [])] as ("a" | "b")[]).map(
            (key, i) => (
              <ControllerPanel
                key={key}
                label={`בקר ${i + 1}`}
                cfg={cfg}
                value={cfg[key]}
                onChange={(c) => update({ ...cfg, [key]: c })}
              />
            ),
          )}
        </div>
        <button
          onClick={() =>
            update({
              ...cfg,
              compare: !cfg.compare,
              ...(!cfg.compare ? { b: { ...cfg.a } } : {}),
            })
          }
        >
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
          {Object.entries(graphNames)
            .filter(
              ([k]) =>
                !isDirect(cfg) || !["response", "error", "terms"].includes(k),
            )
            .map(([k, v]) => (
              <label key={k}>
                <input
                  type="checkbox"
                  checked={cfg.graphs.includes(k)}
                  onChange={(e) =>
                    setCfg({
                      ...cfg,
                      graphs: e.target.checked
                        ? [...cfg.graphs, k]
                        : cfg.graphs.filter((g) => g !== k),
                    })
                  }
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

      <details className={styles.card}>
        <summary>המתמטיקה והגבולות של המודל</summary>
        <MathText>{String.raw`$$u = k_P e + k_I \int e\,dt + k_D \frac{de}{dt} + k_S\operatorname{sgn}(v_r) + k_V v_r + k_A a_r + g$$

במעלית $g = k_G$; בזרוע $g = k_G\cos(\theta_r)$, כאשר אפס הוא אופקי. בגלגל אין כבידה. הנגזרת כאן היא נגזרת השגיאה ללא מסנן.`}</MathText>
        <p>
          צעד הפיזיקה הוא 5 ms. הכוח השקול ליחידת מתח הוא 1; כבידה מרבית 2 N או
          N·m. ריסון לינארי כולל בקירוב את השפעת המנוע, וחיכוך יבש מדמה התנגדות
          לתנועה. עצירות מכניות אינן אלסטיות. אין גמישות, השהיית CAN, חימום או
          מודל סוללה דינמי.
        </p>
        <p>
          פרופיל S-curve הוא פולינום ממעלה חמישית שמותאם בזמן למגבלות מהירות,
          תאוצה ו־jerk. הוא מתחיל ומסתיים במנוחה ואינו בהכרח המהיר ביותר. שינוי
          יעד מאתחל את הניסוי; אין תכנון מחדש תוך כדי תנועה. זה אינו מימוש פנימי
          של Motion Magic.
        </p>
        <p>
          בניסוי מהירות קבועה אין תאוצת ייחוס מתמשכת; כדי לחקור kA בחרו פרופיל
          תנועה במעלית. תרומות הבקר מוצגות לפני הגבלת הפלט. המדידות המספריות
          מוצגות גם מתחת למנגנונים.
        </p>
      </details>
    </div>
  );
}
