import React from "react";
import type { Config } from "../../model/types";
import { isLinear } from "../../model/semantics";
import { angleUnits, lengthUnits } from "../../model/units";

export function UnitsSettings({
  cfg,
  update,
}: {
  cfg: Config;
  update: (next: Config) => void;
}) {
  const dimension = isLinear(cfg.mechanism) ? "length" : "angle";
  const choices = dimension === "length" ? lengthUnits : angleUnits;
  return (
    <div>
      <label>
        יחידות התנועה
        <select
          aria-label="יחידות התנועה"
          value={cfg.units[dimension]}
          onChange={(event) =>
            update({
              ...cfg,
              units: { ...cfg.units, [dimension]: event.target.value },
            })
          }
        >
          {Object.entries(choices).map(([value, unit]) => (
            <option key={value} value={value}>
              {unit.label} ({value})
            </option>
          ))}
        </select>
      </label>
      <p>
        {dimension === "length"
          ? "מטר אחד הוא 100 סנטימטרים."
          : "סיבוב אחד הוא 360 מעלות, או כ־6.28 רדיאנים."}{" "}
        מהירות היא המרחק או הזווית שעוברים בשנייה. הבחירה ממירה יחד את הקלט,
        הגרפים והמקדמים. התנועה הפיזית נשארת זהה.
      </p>
    </div>
  );
}
