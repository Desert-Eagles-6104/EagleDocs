import React, { memo } from "react";
import {
  bounds,
  isDirect,
  targetBounds,
  clamp,
  isVelocity,
  type Config,
  type State,
} from "./engine";
import styles from "./styles.module.css";
import { Help } from "./Help";
import { type Sample } from "./simulation";
export function MechanismView({
  state,
  cfg,
  onTarget,
  label,
}: {
  state: State;
  cfg: Config;
  onTarget: (n: number) => void;
  label: string;
}) {
  const [lo, hi] = bounds(cfg.mechanism),
    y = 170 - ((state.x - lo) / (hi - lo)) * 140,
    ty = 170 - ((cfg.target - lo) / (hi - lo)) * 140;
  const angle = state.x;
  const point = (a: number) => ({
    x: 150 + 85 * Math.cos(a),
    y: 110 - 85 * Math.sin(a),
  });
  const end = point(angle),
    target = point(cfg.target);
  return (
    <div className={styles.mechanism}>
      <strong>{label}</strong>
      <svg
        viewBox="0 0 300 210"
        role="img"
        aria-label={`${label}: מיקום ${state.x.toFixed(2)}, מהירות ${state.v.toFixed(2)}`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          if (isDirect(cfg)) return;
          const matrix = e.currentTarget.getScreenCTM();
          if (!matrix) return;
          const point = e.currentTarget.createSVGPoint();
          point.x = e.clientX;
          point.y = e.clientY;
          const { x, y } = point.matrixTransform(matrix.inverse());
          onTarget(
            clamp(
              cfg.mechanism === "arm" && !isVelocity(cfg)
                ? Math.atan2(110 - y, x - 150)
                : targetBounds(cfg)[0] +
                    ((170 - y) / 140) *
                      (targetBounds(cfg)[1] - targetBounds(cfg)[0]),
              targetBounds(cfg)[0],
              targetBounds(cfg)[1],
            ),
          );
        }}
      >
        {cfg.mechanism === "elevator" ? (
          <>
            <path
              d="M95 20 V180 H205 V20 M110 20 V180 M190 20 V180"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
            />
            <rect
              x="115"
              y={y - 12}
              width="70"
              height="24"
              rx="6"
              fill="var(--ifm-color-primary)"
            />
            {!isDirect(cfg) && !isVelocity(cfg) && (
              <path
                d={`M65 ${ty} H235`}
                stroke="#d97706"
                strokeDasharray="5 4"
                strokeWidth="3"
              />
            )}
          </>
        ) : (
          <>
            <circle
              cx="150"
              cy="110"
              r={cfg.mechanism === "wheel" ? 65 : 10}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
            />
            <path
              d={`M150 110 L${end.x} ${end.y}`}
              stroke="var(--ifm-color-primary)"
              strokeWidth="10"
            />
            {cfg.mechanism === "arm" && !isDirect(cfg) && !isVelocity(cfg) && (
              <path
                d={`M150 110 L${target.x} ${target.y}`}
                stroke="#d97706"
                strokeWidth="3"
                strokeDasharray="5 4"
              />
            )}
          </>
        )}
        <text
          x="150"
          y="202"
          textAnchor="middle"
          fill="currentColor"
          fontSize="12"
        >
          {cfg.mechanism === "wheel"
            ? "מהירות: " + state.v.toFixed(2) + " rad/s"
            : "מיקום: " +
              state.x.toFixed(2) +
              (cfg.mechanism === "arm" ? " rad" : " m")}
        </text>
      </svg>
      <small>
        {isDirect(cfg)
          ? "בניסוי הזה קובעים את הפלט ובודקים את התנועה שמתקבלת."
          : "גררו ושחררו לקביעת יעד; אפשר גם להשתמש במחוון היעד."}
      </small>
    </div>
  );
}
export const graphNames: Record<string, string> = {
  response: "יעד ומדידה",
  error: "שגיאת עקיבה",
  output: "פלט הבקר",
  velocity: "מהירות וייחוס",
  acceleration: "תאוצה וייחוס",
  terms: "תרומות הבקר הראשון",
};
const graphHints: Record<string, string> = {
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
}: {
  history: Sample[];
  kind: string;
  cfg: Config;
}) {
  const velocity = isVelocity(cfg);
  const metric = (s: State) =>
    kind === "response"
      ? velocity
        ? s.v
        : s.x
      : kind === "error"
        ? s.error
        : kind === "output"
          ? s.output
          : kind === "velocity"
            ? s.v
            : s.acceleration;
  const series =
    kind === "terms"
      ? ["p", "i", "d", "ff"].map((k) => ({
          label: k,
          color: { p: "#0d9488", i: "#d97706", d: "#8b5cf6", ff: "#dc2626" }[k],
          values: history.map((h) => h.a[k as keyof State] as number),
          dash: false,
        }))
      : [
          {
            label: "בקר 1",
            color: "#0d9488",
            values: history.map((h) => metric(h.a)),
            dash: false,
          },
          ...(cfg.compare
            ? [
                {
                  label: "בקר 2",
                  color: "#8b5cf6",
                  values: history.map((h) => metric(h.b)),
                  dash: true,
                },
              ]
            : []),
        ];
  if (
    !isDirect(cfg) &&
    ["response", "velocity", "acceleration"].includes(kind)
  ) {
    for (const key of (cfg.compare ? ["a", "b"] : ["a"]) as ("a" | "b")[])
      series.push({
        label: "יעד בקר " + (key === "a" ? "1" : "2"),
        color: key === "a" ? "#d97706" : "#dc2626",
        dash: true,
        values: history.map((h) =>
          kind === "response"
            ? h[key].reference
            : kind === "velocity"
              ? h[key].rv
              : h[key].ra,
        ),
      });
  }
  let min = 0;
  let max = 1;
  for (const { values } of series)
    for (const value of values) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  const pad = (max - min) * 0.1;
  min -= pad;
  max += pad;
  const unit =
    kind === "output" || kind === "terms"
      ? cfg.request === "torque"
        ? "A"
        : "V"
      : cfg.mechanism === "elevator"
        ? "m"
        : "rad";
  const suffix =
    kind === "velocity" ||
    ((kind === "response" || kind === "error") && velocity)
      ? "/s"
      : kind === "acceleration"
        ? "/s²"
        : "";
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
                  `${48 + (i / Math.max(1, history.length - 1)) * 497},${15 + ((max - v) / (max - min)) * 130}`,
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
