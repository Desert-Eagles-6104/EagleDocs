import React from "react";
import {
  bounds,
  isDirect,
  targetBounds,
  clamp,
  isVelocity,
} from "../../model/semantics";
import { type Config, type State } from "../../model/types";
import styles from "../../styles.module.css";
export function MechanismView({
  state,
  cfg,
  onTarget,
  label,
  interactive = true,
}: {
  state: State;
  cfg: Config;
  onTarget: (n: number) => void;
  label: string;
  interactive?: boolean;
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
        data-interactive={interactive && !isDirect(cfg)}
        viewBox="0 0 300 210"
        role="img"
        aria-label={`${label}: מיקום ${state.x.toFixed(2)}, מהירות ${state.v.toFixed(2)}`}
        onPointerDown={(e) => {
          if (!interactive || isDirect(cfg)) return;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          if (!interactive || isDirect(cfg)) return;
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
          : interactive
            ? "גררו ושחררו לקביעת יעד; אפשר גם להשתמש במחוון היעד."
            : `יעד קבוע: ${cfg.target} ${(cfg.mechanism === "elevator" ? "m" : "rad") + (isVelocity(cfg) ? "/s" : "")}`}
      </small>
    </div>
  );
}
