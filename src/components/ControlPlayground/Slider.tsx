import React from "react";
import { Help, hintFor } from "./Help";
import styles from "./styles.module.css";

export function Slider({
  label,
  value,
  min = 0,
  max,
  step: increment = 0.1,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min?: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  return (
    <div className={styles.slider}>
      <span>
        <span>
          {label} <Help label={label} text={hint ?? hintFor(label)} />
        </span>{" "}
        <bdi>{value.toFixed(2)}</bdi>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={increment}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
