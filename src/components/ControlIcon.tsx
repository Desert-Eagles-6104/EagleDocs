import React from "react";

const paths = {
  play: "m8 5 11 7-11 7Z",
  pause: "M9 5v14M15 5v14",
  reset: "M4 10a8 8 0 1 1 1 7M4 4v6h6",
  step: "m5 5 10 7-10 7ZM19 5v14",
  stepBack: "m19 5-10 7 10 7ZM5 5v14",
  disturbance: "m13 2-9 12h7l-1 8 10-12h-7Z",
};

export default function ControlIcon({ name }: { name: keyof typeof paths }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
