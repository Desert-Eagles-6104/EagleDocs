/* global window, requestAnimationFrame, cancelAnimationFrame */
import React, { useEffect, useRef, useState } from "react";
import {
  defaults,
  initial,
  step,
  DT,
  targetBounds,
  supports,
  supportedMethods,
  isDirect,
  isVelocity,
  type Config,
  type Controller,
} from "./engine";
import {
  methods,
  requests,
  presets,
  validate,
  readConfig,
  presetDescriptions,
} from "./config";
import { Help, MathText, hintFor } from "./Help";
import { Lesson, RequestLesson } from "./Teaching";
import { MechanismView, Graph, graphNames, type Sample } from "./Visuals";
import styles from "./styles.module.css";
function Slider({
  label,
  value,
  min = 0,
  max,
  step: increment = 0.1,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min?: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  return (
    <div className={styles.slider}>
      <span>
        <span>
          {label} <Help label={label} text={hint ?? hintFor(label)} />
        </span>{" "}
        <bdi>{value.toFixed(2)}</bdi>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={increment}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
function ControllerPanel({
  value,
  onChange,
  label,
  cfg,
}: {
  value: Controller;
  onChange: (c: Controller) => void;
  label: string;
  cfg: Config;
}) {
  const set = (p: Partial<Controller>) => onChange({ ...value, ...p });
  const m = value.method;
  const compatible = supports(cfg, value);
  const pid = ["pid", "combined", "profile"].includes(m),
    ff = ["ff", "combined", "profile"].includes(m);
  const q = cfg.mechanism === "elevator" ? "m" : "rad",
    e = isVelocity(cfg) ? q + "/s" : q;
  return (
    <fieldset className={styles.card}>
      <legend>{label}</legend>
      {
        <label>
          שיטת בקרה
          <select
            value={value.method}
            onChange={(e) =>
              set({ method: e.target.value as Controller["method"] })
            }
          >
            {Object.entries(methods).map(([k, v]) => (
              <option
                key={k}
                value={k}
                disabled={
                  !supportedMethods[cfg.request].includes(
                    k as Controller["method"],
                  )
                }
              >
                {v}
                {!supportedMethods[cfg.request].includes(
                  k as Controller["method"],
                )
                  ? " — לא נתמך בבקשה זו"
                  : ""}
              </option>
            ))}
          </select>
        </label>
      }
      {!compatible && (
        <p role="alert">
          {cfg.request === "magic" && value.profile === "direct"
            ? "בקשת Motion Magic דורשת פרופיל טרפז או S-curve; יעד מיידי אינו נתמך."
            : `השיטה ${methods[value.method]} אינה נתמכת בבקשת ${requests[cfg.request]}. בחרו שיטה זמינה.`}{" "}
          ההרצה חסומה עד לתיקון.
        </p>
      )}
      <details className={styles.explanation}>
        <summary>איך השיטה הזו עובדת?</summary>
        <Lesson method={m} />
      </details>
      {pid && (
        <>
          {(["p", "i", "d"] as const).map((term, i) => (
            <div key={term}>
              <label>
                <input
                  type="checkbox"
                  checked={value[term]}
                  onChange={(e) => set({ [term]: e.target.checked })}
                />{" "}
                הפעלת {term.toUpperCase()}
              </label>
              {value[term] && (
                <Slider
                  label={`k${term.toUpperCase()} (${["V/" + e, "V/(" + e + "·s)", "V·s/" + e][i]})`}
                  value={value[(["kp", "ki", "kd"] as const)[i]]}
                  max={[30, 20, 12][i]}
                  onChange={(n) =>
                    set({ [(["kp", "ki", "kd"] as const)[i]]: n })
                  }
                />
              )}
            </div>
          ))}
          <label title="עצירת צבירה כשהשגיאה מעמיקה רוויה">
            <input
              type="checkbox"
              checked={value.antiWindup}
              onChange={(e) => set({ antiWindup: e.target.checked })}
            />{" "}
            מניעת צבירה ברוויה
          </label>
          <Help
            label="מניעת צבירה ברוויה"
            text="עוצר את צבירת האינטגרל כשהפלט מוגבל והשגיאה הייתה מגדילה אותו עוד יותר. כך הבקר יכול להתאושש מהר יותר."
          />
        </>
      )}
      {ff &&
        (["ks", "kv", "ka", "kg"] as const)
          .filter((k) => k !== "kg" || cfg.mechanism !== "wheel")
          .map((k, i) => (
            <Slider
              key={k}
              label={`${{ ks: "kS", kv: "kV", ka: "kA", kg: "kG" }[k]} (${["V", `V·s/${q}`, `V·s²/${q}`, "V"][i]})`}
              value={value[k]}
              max={k === "kg" ? 6 : 4}
              onChange={(n) => set({ [k]: n })}
            />
          ))}
      {m === "bang" && (
        <>
          <Slider
            label="פלט נמוך (V)"
            min={-12}
            max={12}
            value={value.low}
            onChange={(n) => set({ low: n })}
          />
          <Slider
            label="פלט גבוה (V)"
            min={-12}
            max={12}
            value={value.high}
            onChange={(n) => set({ high: n })}
          />
          <Slider
            label={`חצי רוחב היסטרזיס (${e})`}
            max={2}
            value={value.hysteresis}
            onChange={(n) => set({ hysteresis: n })}
          />
        </>
      )}
      {(m === "profile" || cfg.request === "magic") && (
        <>
          <label>
            סוג פרופיל
            <select
              value={value.profile}
              onChange={(e) =>
                set({ profile: e.target.value as Controller["profile"] })
              }
            >
              <option value="direct" disabled={cfg.request === "magic"}>
                יעד מיידי
              </option>
              <option value="trapezoid">טרפז</option>
              <option value="scurve">S-curve מוגבל jerk</option>
            </select>
          </label>
          <Slider
            label={`מהירות מרבית (${q}/s)`}
            min={0.1}
            max={5}
            value={value.vmax}
            onChange={(n) => set({ vmax: n })}
          />
          <Slider
            label={`תאוצה מרבית (${q}/s²)`}
            min={0.1}
            max={10}
            value={value.amax}
            onChange={(n) => set({ amax: n })}
          />
          {value.profile === "scurve" && (
            <Slider
              label={`jerk מרבי (${q}/s³)`}
              min={0.1}
              max={40}
              value={value.jmax}
              onChange={(n) => set({ jmax: n })}
            />
          )}
        </>
      )}
      <details className={styles.explanation}>
        <summary>
          תנאי ניתוק הפלט{" "}
          <Help
            label="תנאי ניתוק הפלט"
            text="ניתוק הפלט אינו מקפיא את המנגנון ואינו מחזיק אותו במקום. אינרציה, חיכוך וכבידה ממשיכים לפעול. תנאי הגעה ליעד משתמש במדידה, גם אם הפלט עצמו מחושב בחוג פתוח."
          />
        </summary>
        <label>
          מתי מנתקים את פלט המנוע?
          <select
            value={value.stop}
            onChange={(e) =>
              set({ stop: e.target.value as Controller["stop"] })
            }
          >
            <option value="auto">
              לפי השיטה: הגנה לחוג פתוח ול־Feedforward
            </option>
            <option value="none">ללא ניתוק אוטומטי</option>
            <option value="time">לאחר זמן מוגדר</option>
            <option value="target" disabled={isDirect(cfg)}>
              בהגעה ליעד או לאחר הזמן המרבי
            </option>
          </select>
        </label>
        {value.stop !== "none" && (
          <Slider
            label="זמן מרבי לפלט (s)"
            min={0.1}
            max={60}
            value={value.stopAfter}
            onChange={(n) => set({ stopAfter: n })}
          />
        )}
        <p>
          {value.stop === "auto"
            ? ["open", "ff"].includes(m)
              ? isVelocity(cfg) || isDirect(cfg)
                ? "בשיטה זו הפלט ינותק בתום הזמן המרבי."
                : "בשיטה זו הפלט ינותק בהגעה ליעד או בתום הזמן המרבי — המוקדם מביניהם."
              : "בשיטה זו אין ניתוק אוטומטי; הבקר ממשיך לתקן עד סוף הניסוי."
            : "לאחר ניתוק, הפלט נשאר אפס עד תחילת ניסוי חדש. הגעה ליעד אינה מבטיחה עצירה או התייצבות."}
        </p>
      </details>
    </fieldset>
  );
}
export default function ControlPlayground() {
  const [cfg, setCfg] = useState<Config>(() => validate(defaults)),
    [running, setRunning] = useState(false),
    [history, setHistory] = useState<Sample[]>([]),
    [reduced, setReduced] = useState(false);
  const [chosenPreset, setChosenPreset] = useState("tuned");
  const [loadedPreset, setLoadedPreset] = useState("");
  const sim = useRef({
    a: initial(),
    b: initial(),
    ticks: 0,
    disturbanceUntil: 0,
  });
  const reset = () => {
    sim.current = { a: initial(), b: initial(), ticks: 0, disturbanceUntil: 0 };
    setHistory([]);
  };
  const update = (next: Config) => {
    setRunning(false);
    setCfg(validate(next));
    reset();
  };
  useEffect(() => {
    setCfg(readConfig(window.location.search));
    const preset = new window.URLSearchParams(window.location.search).get(
      "preset",
    );
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
      reset();
      setRunning(false);
    };
    window.addEventListener("popstate", pop);
    return () => {
      mq.removeEventListener("change", change);
      window.removeEventListener("popstate", pop);
    };
  }, []);
  const advance = (ticks: number) => {
    if (!supports(cfg, cfg.a) || (cfg.compare && !supports(cfg, cfg.b))) return;
    const samples: Sample[] = [];
    const s = sim.current;
    for (let n = 0; n < ticks; n++) {
      if (s.ticks >= Math.round(cfg.duration / DT)) {
        setRunning(false);
        break;
      }
      const force = s.a.t < s.disturbanceUntil ? cfg.disturbance : 0;
      s.a = step(s.a, cfg, cfg.a, force);
      if (cfg.compare) s.b = step(s.b, cfg, cfg.b, force);
      s.ticks++;
      if (s.ticks % 4 === 0) samples.push({ a: s.a, b: s.b });
    }
    if (
      s.ticks >= Math.round(cfg.duration / DT) &&
      samples.at(-1)?.a.t !== s.a.t
    )
      samples.push({ a: s.a, b: s.b });
    if (samples.length) setHistory((old) => [...old, ...samples].slice(-600));
  };
  useEffect(() => {
    if (!running) return;
    let id: number,
      last: number | undefined,
      accumulator = 0;
    const frame = (now: number) => {
      if (last !== undefined)
        accumulator += Math.min((now - last) / 1000, 0.1) * cfg.speed;
      last = now;
      const ticks = Math.floor(accumulator / DT);
      accumulator -= ticks * DT;
      if (ticks) advance(ticks);
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [running, cfg]); // Fixed physics steps; bounded catch-up after a background tab.
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
        <h1>מבקשים. מודדים. מתקנים.</h1>
        <p>
          שיטת בקרה קובעת <strong>איך מחשבים פלט</strong>. בקשת בקרה קובעת{" "}
          <strong>מה רוצים מהמנוע</strong>. בקשה אחת יכולה להפעיל כמה שיטות יחד.
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
        <h2>תנאי הסימולציה</h2>
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
          <label>
            בקשת בקרה
            <select
              value={cfg.request}
              onChange={(e) =>
                update({
                  ...cfg,
                  request: e.target.value as Config["request"],
                  graphs: ["duty", "voltage", "torque"].includes(e.target.value)
                    ? ["output", "velocity", "acceleration"]
                    : defaults.graphs,
                })
              }
            >
              {Object.entries(requests).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
        {
          <details>
            <summary>מה משמעות הבקשה?</summary>
            <RequestLesson request={cfg.request} />
            <p>
              השיטות הזמינות כאן הן שילובים במודל הלימודי. הן אינן רשימת
              האלגוריתמים הפנימיים הנתמכים בכל בקשת Phoenix. למשל, Bang-Bang
              מדגים בקר מהירות חיצוני.
            </p>
          </details>
        }
        {isDirect(cfg) && (
          <Slider
            label={`הפלט המבוקש (${cfg.request === "duty" ? "%" : cfg.request === "torque" ? "A" : "V"})`}
            min={
              cfg.request === "duty"
                ? -100
                : cfg.request === "torque"
                  ? -40
                  : -12
            }
            max={
              cfg.request === "duty" ? 100 : cfg.request === "torque" ? 40 : 12
            }
            value={cfg.demand}
            onChange={(n) => update({ ...cfg, demand: n })}
          />
        )}
      </section>
      <div className={styles.toolbar}>
        <button
          disabled={
            !compatible || (!running && current.a.t >= cfg.duration - DT / 2)
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
            !compatible || running || current.a.t >= cfg.duration - DT / 2
          }
          onClick={() => advance(4)}
        >
          צעד (20 ms)
        </button>
        <button
          onClick={() => {
            sim.current.disturbanceUntil = sim.current.a.t + 0.5;
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
      {!compatible && (
        <p role="alert">
          יש בקר שאינו תומך בבקשת הבקרה. עדכנו את השיטה בהגדרות הבקרים כדי
          להפעיל את הניסוי.
        </p>
      )}
      {!isDirect(cfg) && (
        <Slider
          label={`יעד (${targetUnit})`}
          min={targetBounds(cfg)[0]}
          max={targetBounds(cfg)[1]}
          step={0.05}
          value={cfg.target}
          onChange={(n) => update({ ...cfg, target: n })}
        />
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
                    <MathText>{String.raw`$e = ${current[key].error.toFixed(2)}\,\mathrm{${targetUnit}}$`}</MathText>
                  </span>
                )}
                <span>
                  פלט המנוע{" "}
                  <Help
                    label="פלט u"
                    text="הפקודה שהמנוע מקבל לאחר הגבלות הפלט ותנאי הניתוק. בדרך כלל בוולטים; בבקשת זרם מומנט באמפר."
                  />
                  <MathText>{String.raw`$u = ${current[key].output.toFixed(2)}\,\mathrm{${cfg.request === "torque" ? "A" : "V"}}$`}</MathText>
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
      <details className={styles.card}>
        <summary>תנאי ניסוי, הפרעות ורעש</summary>
        <Slider
          label="משך הניסוי (s)"
          min={1}
          max={60}
          value={cfg.duration}
          onChange={(n) => update({ ...cfg, duration: n })}
        />
        <Slider
          label={`סבילות שגיאה (${targetUnit})`}
          min={0.005}
          max={1}
          step={0.005}
          value={cfg.tolerance}
          onChange={(n) => update({ ...cfg, tolerance: n })}
        />
        <Slider
          label={`סבילות קצב שינוי (${targetUnit}/s)`}
          min={0.005}
          max={2}
          step={0.005}
          value={cfg.rateTolerance}
          onChange={(n) => update({ ...cfg, rateTolerance: n })}
        />
        <Slider
          label="משך אישור התייצבות (s)"
          min={0.1}
          max={3}
          value={cfg.dwell}
          onChange={(n) => update({ ...cfg, dwell: n })}
        />
        <Slider
          label="מגבלת מתח (V)"
          min={1}
          max={12}
          value={cfg.limit}
          onChange={(n) => update({ ...cfg, limit: n })}
        />
        <Slider
          label="מתח סוללה (V)"
          min={6}
          max={12}
          value={cfg.battery}
          onChange={(n) => update({ ...cfg, battery: n })}
        />
        <Slider
          label={
            cfg.mechanism === "elevator"
              ? "מסה שקולה (kg)"
              : "אינרציה שקולה (kg·m²)"
          }
          min={0.2}
          max={4}
          value={cfg.inertia}
          onChange={(n) => update({ ...cfg, inertia: n })}
        />
        <Slider
          label="ריסון שקול (כוח ליחידת מהירות)"
          max={3}
          value={cfg.damping}
          onChange={(n) => update({ ...cfg, damping: n })}
        />
        <Slider
          label="חיכוך שקול (N או N·m)"
          max={2}
          value={cfg.friction}
          onChange={(n) => update({ ...cfg, friction: n })}
        />
        <Slider
          label="כוח הפרעה (N או N·m)"
          min={-10}
          max={10}
          value={cfg.disturbance}
          onChange={(n) => update({ ...cfg, disturbance: n })}
        />
        <Slider
          label={`משרעת רעש מדידה (${targetUnit})`}
          max={0.1}
          step={0.005}
          value={cfg.noise}
          hint="אות דטרמיניסטי מהיר. הגדילו D כדי לראות רגישות לנגזרת."
          onChange={(n) => update({ ...cfg, noise: n })}
        />
      </details>
      <section aria-label="הגדרות הבקרים">
        <h2>מגדירים את הבקר</h2>
        <p>
          בחרו שיטת בקרה וכוונו את הפרמטרים. המנגנון ובקשת הבקרה משותפים לכל
          הבקרים.
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
