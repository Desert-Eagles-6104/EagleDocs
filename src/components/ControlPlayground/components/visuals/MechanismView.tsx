import React from "react";
import {
  bounds,
  isDirect,
  targetBounds,
  clamp,
  isVelocity,
} from "../../model/semantics";
import { measuredUnit, motionUnit } from "../../model/units";
import { type Config, type State } from "../../model/types";
import { RADIANS_PER_ROTATION } from "../../model/constants";
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
  const slideX = (position: number) => 30 + ((position - lo) / (hi - lo)) * 240;
  const showPositionTarget = !isDirect(cfg) && !isVelocity(cfg);
  const angle = state.x;
  const unit = motionUnit(cfg);
  const showSpeedGauge = cfg.mechanism === "wheel" && isVelocity(cfg);
  const actualSpeed = state.v * unit.factor;
  const requestedSpeed = cfg.target * unit.factor;
  const speedLabel =
    unit.symbol === "rev" ? "סיבובים לשנייה" : unit.symbol + "/s";
  const speedLimit = Math.max(1, 2 * Math.abs(requestedSpeed));
  const speedX = (speed: number) =>
    150 + (110 * clamp(speed, -speedLimit, speedLimit)) / speedLimit;
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
        aria-label={
          showSpeedGauge
            ? `${label}: מהירות ${actualSpeed.toFixed(2)} ${speedLabel}`
            : `${label}: מיקום ${(state.x * unit.factor).toFixed(2)} ${unit.symbol}, מהירות ${actualSpeed.toFixed(2)} ${speedLabel}`
        }
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
                : cfg.mechanism === "slide" && !isVelocity(cfg)
                  ? lo + ((x - 30) / 240) * (hi - lo)
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
            {showPositionTarget && (
              <path
                d={`M65 ${ty} H235`}
                stroke="#d97706"
                strokeDasharray="5 4"
                strokeWidth="3"
              />
            )}
          </>
        ) : cfg.mechanism === "slide" ? (
          <>
            <path d="M14 122 H286" stroke="currentColor" strokeWidth="4" />
            {showPositionTarget && (
              <path
                d={`M${slideX(cfg.target)} 60 V145`}
                stroke="#d97706"
                strokeDasharray="5 4"
                strokeWidth="3"
              />
            )}
            <rect
              x={slideX(state.x) - 14}
              y="94"
              width="28"
              height="26"
              rx="3"
              fill="var(--ifm-color-primary)"
            />
          </>
        ) : (
          <>
            <circle
              cx="150"
              cy={showSpeedGauge ? 87 : 110}
              r={showSpeedGauge ? 54 : cfg.mechanism === "wheel" ? 65 : 10}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
            />
            {showSpeedGauge ? (
              <>
                <path d="M150 20 V27" stroke="currentColor" strokeWidth="3" />
                <path
                  d="M150 40 V65"
                  transform={`rotate(${((angle % RADIANS_PER_ROTATION) / RADIANS_PER_ROTATION) * 360} 150 87)`}
                  stroke="var(--ifm-color-primary)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <g aria-label="מד מהירות">
                  <path
                    d="M40 170 H260 M150 162 V178"
                    stroke="currentColor"
                    strokeOpacity="0.3"
                    strokeWidth="2"
                  />
                  <path
                    d={`M150 170 H${speedX(actualSpeed)}`}
                    stroke="var(--ifm-color-primary)"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M${speedX(requestedSpeed)} 157 V183`}
                    stroke="#d97706"
                    strokeWidth="3"
                    strokeDasharray="4 3"
                  />
                </g>
              </>
            ) : (
              <path
                d={`M150 110 L${end.x} ${end.y}`}
                stroke="var(--ifm-color-primary)"
                strokeWidth="10"
              />
            )}
            {cfg.mechanism === "arm" && showPositionTarget && (
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
          {showSpeedGauge
            ? `${actualSpeed.toFixed(2)} ${speedLabel}`
            : cfg.mechanism === "wheel"
              ? "מהירות: " + actualSpeed.toFixed(2) + " " + speedLabel
              : "מיקום: " +
                (state.x * unit.factor).toFixed(2) +
                " " +
                unit.symbol}
        </text>
      </svg>
      <small>
        {isDirect(cfg)
          ? "בניסוי הזה קובעים את הפלט ובודקים את התנועה שמתקבלת."
          : interactive
            ? "גררו ושחררו לקביעת יעד; אפשר גם להשתמש במחוון היעד."
            : showSpeedGauge
              ? `מהירות יעד (${speedLabel}): ${Number(requestedSpeed.toFixed(2))}`
              : `יעד קבוע: ${Number((cfg.target * unit.factor).toFixed(2))} ${measuredUnit(cfg)}`}
      </small>
    </div>
  );
}
