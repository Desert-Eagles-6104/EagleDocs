import React from "react";
import {
  defaults,
  isDirect,
  isVelocity,
  targetBounds,
  type Config,
} from "./engine";
import { goals } from "./config";
import { Slider } from "./Slider";

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
  const unit =
    (cfg.mechanism === "elevator" ? "m" : "rad") +
    (isVelocity(cfg) ? "/s" : "");
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
      {isDirect(cfg) ? (
        <Slider
          label={`${goal === "duty" ? "עוצמת ההפעלה" : goal === "torque" ? "זרם ההפעלה" : "מתח ההפעלה"} (${goal === "duty" ? "%" : goal === "torque" ? "A" : "V"})`}
          min={goal === "duty" ? -100 : goal === "torque" ? -40 : -12}
          max={goal === "duty" ? 100 : goal === "torque" ? 40 : 12}
          value={cfg.demand}
          onChange={(demand) => update({ ...cfg, demand })}
        />
      ) : (
        <Slider
          label={`${isVelocity(cfg) ? "מהירות היעד" : "מיקום היעד"} (${unit})`}
          min={targetBounds(cfg)[0]}
          max={targetBounds(cfg)[1]}
          step={0.05}
          value={cfg.target}
          onChange={(target) => update({ ...cfg, target })}
        />
      )}
      <p>
        <small>
          פרופיל תנועה הוא דרך להגיע למיקום. בוחרים אותו בכל בקר בנפרד, מתחת
          לסימולציה.
        </small>
      </p>
    </div>
  );
}
