import React from "react";
import {
  supports,
  supportedMethods,
  isDirect,
  isVelocity,
} from "../../model/semantics";
import { type Config, type Controller } from "../../model/types";
import { goals, methods } from "../../config/labels";
import { Help } from "../common/Help";
import { Lesson } from "../teaching/Teaching";
import { Slider } from "../controls/Slider";
import styles from "../../styles.module.css";

export function ControllerPanel({
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
  const method = value.method;
  const compatible = supports(cfg, value);
  const hasPid = ["pid", "combined", "profile"].includes(method),
    hasFeedforward = ["ff", "combined", "profile"].includes(method);
  const positionUnit = cfg.mechanism === "elevator" ? "m" : "rad";
  const errorUnit = isVelocity(cfg) ? positionUnit + "/s" : positionUnit;
  return (
    <fieldset className={styles.card}>
      <legend>{label}</legend>
      <label>
        איך הבקר ינסה להשיג את המטרה?
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
                ? " - לא מתאים למטרה זו"
                : ""}
            </option>
          ))}
        </select>
      </label>
      {!compatible && (
        <p role="alert">
          {cfg.request === "magic" && value.profile === "direct"
            ? "בקשת Motion Magic דורשת פרופיל טרפז או S-curve; יעד מיידי אינו נתמך."
            : `השיטה ${methods[value.method]} אינה מתאימה למטרה ״${goals[cfg.request]}״. בחרו שיטה זמינה.`}{" "}
          ההרצה חסומה עד לתיקון.
        </p>
      )}
      <details className={styles.explanation}>
        <summary>איך השיטה הזו עובדת?</summary>
        <Lesson method={method} />
      </details>
      {method === "open" && !isDirect(cfg) && (
        <>
          <Slider
            label="מתח קבוע (V)"
            min={-12}
            max={12}
            value={value.output}
            onChange={(output) => set({ output })}
          />
          <p>
            הבקר מפעיל מתח קבוע. הוא אינו מתקן שגיאה; אפשר לבדוק אם המתח שבחרתם
            מקרב את המנגנון ליעד.
          </p>
        </>
      )}
      {hasPid && (
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
                  label={`k${term.toUpperCase()} (${["V/" + errorUnit, "V/(" + errorUnit + "·s)", "V·s/" + errorUnit][i]})`}
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
      {hasFeedforward &&
        (["ks", "kv", "ka", "kg"] as const)
          .filter((k) => k !== "kg" || cfg.mechanism !== "wheel")
          .map((k, i) => (
            <Slider
              key={k}
              label={`${{ ks: "kS", kv: "kV", ka: "kA", kg: "kG" }[k]} (${["V", `V·s/${positionUnit}`, `V·s²/${positionUnit}`, "V"][i]})`}
              value={value[k]}
              max={k === "kg" ? 6 : 4}
              onChange={(n) => set({ [k]: n })}
            />
          ))}
      {method === "bang" && (
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
            label={`חצי רוחב היסטרזיס (${errorUnit})`}
            max={2}
            value={value.hysteresis}
            onChange={(n) => set({ hysteresis: n })}
          />
        </>
      )}
      {(method === "profile" || cfg.request === "magic") && (
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
            label={`מהירות מרבית (${positionUnit}/s)`}
            min={0.1}
            max={5}
            value={value.vmax}
            onChange={(n) => set({ vmax: n })}
          />
          <Slider
            label={`תאוצה מרבית (${positionUnit}/s²)`}
            min={0.1}
            max={10}
            value={value.amax}
            onChange={(n) => set({ amax: n })}
          />
          {value.profile === "scurve" && (
            <Slider
              label={`jerk מרבי (${positionUnit}/s³)`}
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
            ? ["open", "ff"].includes(method)
              ? isVelocity(cfg) || isDirect(cfg)
                ? "בשיטה זו הפלט ינותק בתום הזמן המרבי."
                : "בשיטה זו הפלט ינותק בהגעה ליעד או בתום הזמן המרבי - המוקדם מביניהם."
              : "בשיטה זו אין ניתוק אוטומטי; הבקר ממשיך לתקן עד סוף הניסוי."
            : "לאחר ניתוק, הפלט נשאר אפס עד תחילת ניסוי חדש. הגעה ליעד אינה מבטיחה עצירה או התייצבות."}
        </p>
      </details>
    </fieldset>
  );
}
