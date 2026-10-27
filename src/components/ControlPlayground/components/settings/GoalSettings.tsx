import { targetModel } from "../../view-model/target";
import React from "react";
import { defaults } from "../../model/defaults";
import { isDirect } from "../../model/semantics";
import { type Config } from "../../model/types";
import { goals } from "../../config/labels";
import { Slider } from "../controls/Slider";

const goalDescriptions = {
  position:
    "להגיע למיקום מסוים ולהישאר בו. כל בקר מנסה להגיע לאותו יעד בדרך שלו.",
  velocity: "להגיע למהירות מסוימת ולשמור עליה, גם כשהעומס משתנה.",
  voltage: "להפעיל מתח קבוע ולראות איזו תנועה מתקבלת, בלי יעד מיקום או מהירות.",
  torque:
    "להפעיל זרם קבוע שמייצר כוח או מומנט. כאן קובעים את הזרם; אין יעד כוח נמדד או בקר כוח נפרד.",
  duty: "להפעיל את המנוע בעוצמה קבועה באחוזים ולראות איך הוא מסתובב. המהירות שתתקבל תלויה במתח הסוללה ובעומס.",
};

export function GoalSettings({
  cfg,
  update,
}: {
  cfg: Config;
  update: (next: Config) => void;
}) {
  // Motion Magic in old links is a position goal with a profiled controller.
  const goal = cfg.request === "magic" ? "position" : cfg.request;
  const target = targetModel(cfg);
  return (
    <div>
      <label>
        מה רוצים לעשות?
        <select
          value={goal}
          onChange={(event) => {
            const request = event.target.value as Config["request"];
            update({
              ...cfg,
              request,
              graphs: isDirect({ ...cfg, request })
                ? ["output", "velocity", "acceleration"]
                : defaults.graphs,
            });
          }}
        >
          {Object.entries(goals)
            .filter(([key]) => key !== "magic")
            .map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
        </select>
      </label>
      <p>{goalDescriptions[goal]}</p>
      <Slider
        label={target.label}
        min={target.min}
        max={target.max}
        step={target.direct ? 0.1 : 0.05}
        value={target.value}
        onChange={(value) =>
          update({
            ...cfg,
            ...(target.direct ? { demand: value } : { target: value }),
          })
        }
      />
      <p>
        <small>
          פרופיל תנועה הוא דרך להגיע למיקום. בוחרים אותו בכל בקר בנפרד, מתחת
          לסימולציה.
        </small>
      </p>
    </div>
  );
}
