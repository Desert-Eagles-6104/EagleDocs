import React from "react";
import { isDirect } from "../../model/semantics";
import type { Config, State } from "../../model/types";
import { DT } from "../../model/constants";
import { Help } from "../common/Help";
import styles from "../../styles.module.css";
export function ControllerReadout({
  cfg,
  state,
  time,
  targetUnit,
}: {
  cfg: Config;
  state: State;
  time: number;
  targetUnit: string;
}) {
  return (
    <>
      {" "}
      <div className={styles.readout}>
        {!isDirect(cfg) && (
          <span>
            שגיאה{" "}
            <Help
              label="שגיאה e"
              text="ההפרש בין יעד הבקר למדידה. בפרופיל תנועה זהו יעד הביניים; ההתייצבות נבדקת ביחס ליעד הסופי."
            />
            <bdi>
              e = {state.error.toFixed(2)} {targetUnit}
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
            u = {state.output.toFixed(2)} {cfg.request === "torque" ? "A" : "V"}
          </bdi>
        </span>
        {Math.abs(state.raw - state.output) > 0.01 ? " • רוויה" : ""}
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
            {state.settledAt >= 0
              ? `${state.settledAt.toFixed(2)} שניות`
              : time >= cfg.duration - DT / 2
                ? "לא התייצב במהלך הניסוי"
                : "טרם התייצב"}
          </strong>
        </p>
      )}
      {state.stoppedAt >= 0 && (
        <p className={styles.readout}>
          הפלט נותק אחרי {state.stoppedAt.toFixed(2)} שניות; המנגנון ממשיך לנוע
          לפי הפיזיקה.
        </p>
      )}
    </>
  );
}
