import React, { memo } from "react";
import { type Config, type Sample } from "../../model/types";
import styles from "../../styles.module.css";
import { Help } from "../common/Help";

import { graphModel } from "../../view-model/graphs";
import { type GraphKind } from "../../model/constants";
export const graphNames: Record<GraphKind, string> = {
  response: "יעד ומדידה",
  error: "שגיאת עקיבה",
  output: "פלט הבקר",
  velocity: "מהירות וייחוס",
  acceleration: "תאוצה וייחוס",
  terms: "תרומות הבקר הראשון",
};
const graphHints: Record<GraphKind, string> = {
  response:
    "משווים את התנועה שנמדדה ליעד הבקר. בפרופיל תנועה היעד משתנה לאורך המסלול.",
  error: "ההפרש בין יעד הבקר למדידה. אפס פירושו שאין שגיאת עקיבה באותו רגע.",
  output: "הפלט שהגיע למנוע לאחר רוויה או ניתוק לפי תנאי העצירה.",
  velocity:
    "מהירות המנגנון לצד מהירות הייחוס של הפרופיל. ביעד מיקום מיידי אין מסלול מהירות מתוכנן.",
  acceleration:
    "קצב שינוי המהירות לצד תאוצת הייחוס. ביעד מיקום מיידי אין מסלול תאוצה מתוכנן.",
  terms:
    "כמה תורם כל איבר של הבקר הראשון לפלט, לפני רוויה. P מגיב לשגיאה, I לצבירה, D לקצב השינוי ו־FF למודל.",
};
export const Graph = memo(function Graph({
  history,
  kind,
  cfg,
  showTolerance,
}: {
  history: Sample[];
  kind: GraphKind;
  cfg: Config;
  showTolerance?: boolean;
}) {
  const { series, min, max, unit, suffix, toleranceBand } = graphModel(
    history,
    kind,
    cfg,
    showTolerance,
  );
  const plotY = (value: number) => 15 + ((max - value) / (max - min)) * 130;
  return (
    <figure className={styles.graph}>
      <figcaption>
        <strong>{graphNames[kind]}</strong>{" "}
        <Help label={graphNames[kind]} text={graphHints[kind]} />
        <bdi>
          {unit}
          {suffix}
        </bdi>
      </figcaption>
      <svg
        viewBox="0 0 560 180"
        role="img"
        aria-label={`${graphNames[kind]}, טווח ${min.toFixed(1)} עד ${max.toFixed(1)}`}
      >
        {toleranceBand && (
          <rect
            x="48"
            y={plotY(toleranceBand.high)}
            width="497"
            height={plotY(toleranceBand.low) - plotY(toleranceBand.high)}
            fill="#d97706"
            fillOpacity="0.25"
          />
        )}
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <path
              d={`M48 ${15 + f * 130} H545`}
              stroke="currentColor"
              opacity="0.15"
            />
            <text
              x="44"
              y={19 + f * 130}
              textAnchor="end"
              fill="currentColor"
              fontSize="11"
            >
              {(max - f * (max - min)).toFixed(1)}
            </text>
          </g>
        ))}
        {series.map((s) => (
          <polyline
            key={s.label}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeDasharray={s.dash ? "6 4" : undefined}
            points={s.values
              .map(
                (v, i) =>
                  `${48 + (i / Math.max(1, history.length - 1)) * 497},${plotY(v)}`,
              )
              .join(" ")}
          />
        ))}
        <text x="48" y="170" fill="currentColor" fontSize="11">
          {(history[0]?.a.t ?? 0).toFixed(1)} s
        </text>
        <text
          x="545"
          y="170"
          textAnchor="end"
          fill="currentColor"
          fontSize="11"
        >
          {(history.at(-1)?.a.t ?? 0).toFixed(1)} s
        </text>
      </svg>
      <div className={styles.legend}>
        {toleranceBand && (
          <span style={{ borderBottom: "3px solid #d9770640" }}>
            תחום סבילות{" "}
            <bdi>
              ±{cfg.tolerance} {unit}
              {suffix}
            </bdi>
          </span>
        )}
        {series.map((s) => (
          <span
            key={s.label}
            style={{
              borderBottom: `3px ${s.dash ? "dashed" : "solid"} ${s.color}`,
            }}
          >
            {s.label}
          </span>
        ))}
      </div>
    </figure>
  );
});
