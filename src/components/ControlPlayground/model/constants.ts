// String constants also accept plain strings in MDX props and saved URLs.
export const MechanismType = {
  Wheel: "wheel",
  Elevator: "elevator",
  Slide: "slide",
  Arm: "arm",
} as const;
export type Mechanism = (typeof MechanismType)[keyof typeof MechanismType];
export const ControlMethod = {
  Open: "open",
  Pid: "pid",
  Feedforward: "ff",
  Combined: "combined",
  BangBang: "bang",
  Profile: "profile",
} as const;
export type Method = (typeof ControlMethod)[keyof typeof ControlMethod];
export const ControlRequest = {
  Duty: "duty",
  Voltage: "voltage",
  Velocity: "velocity",
  Position: "position",
  Torque: "torque",
  MotionMagic: "magic",
} as const;
export type Request = (typeof ControlRequest)[keyof typeof ControlRequest];
export const MotionProfile = {
  Direct: "direct",
  Trapezoid: "trapezoid",
  SCurve: "scurve",
} as const;
export type Profile = (typeof MotionProfile)[keyof typeof MotionProfile];
export const StopCondition = {
  Auto: "auto",
  None: "none",
  Time: "time",
  Target: "target",
} as const;
export type StopMode = (typeof StopCondition)[keyof typeof StopCondition];
export const GraphType = {
  Response: "response",
  Error: "error",
  Output: "output",
  Velocity: "velocity",
  Acceleration: "acceleration",
  Terms: "terms",
} as const;
export type GraphKind = (typeof GraphType)[keyof typeof GraphType];
export const DT = 0.005;
export const RADIANS_PER_ROTATION = 2 * Math.PI;
export const SAMPLE_TICKS = 4;
export const HISTORY_LIMIT = 600;
export const MAX_FRAME_TICKS = 80;
export const DISTURBANCE_DURATION = 0.5;
export const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 2, 4] as const;
