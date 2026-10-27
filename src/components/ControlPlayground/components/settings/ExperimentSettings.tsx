import React from "react";
import { type Config } from "../../model/types";
import { Slider } from "../controls/Slider";
import styles from "../../styles.module.css";

export function ExperimentSettings({
  cfg,
  update,
  targetUnit,
}: {
  cfg: Config;
  update: (next: Config) => void;
  targetUnit: string;
}) {
  return (
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
  );
}
