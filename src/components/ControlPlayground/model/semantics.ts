import type { Config, Controller, ControllerKey } from "./types";
import {
  ControlMethod,
  ControlRequest,
  GraphType,
  type GraphKind,
  MechanismType,
  MotionProfile,
  type Mechanism,
  type Method,
  type Request,
} from "./constants";
import type { NumericRange } from "./constraints";

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
export const isVelocity = (config: Config) =>
  config.request === ControlRequest.Velocity;
export const isDirect = (config: Config) =>
  config.request === ControlRequest.Duty ||
  config.request === ControlRequest.Voltage ||
  config.request === ControlRequest.Torque;
export const hasPid = (method: Method) =>
  method === ControlMethod.Pid ||
  method === ControlMethod.Combined ||
  method === ControlMethod.Profile;
export const hasFeedforward = (method: Method) =>
  method === ControlMethod.Feedforward ||
  method === ControlMethod.Combined ||
  method === ControlMethod.Profile;

export const supportedMethods: Record<Request, readonly Method[]> = {
  [ControlRequest.Duty]: [ControlMethod.Open],
  [ControlRequest.Voltage]: [ControlMethod.Open],
  [ControlRequest.Torque]: [ControlMethod.Open],
  [ControlRequest.Velocity]: [
    ControlMethod.Open,
    ControlMethod.Pid,
    ControlMethod.Feedforward,
    ControlMethod.Combined,
    ControlMethod.BangBang,
  ],
  [ControlRequest.Position]: [
    ControlMethod.Open,
    ControlMethod.Pid,
    ControlMethod.Feedforward,
    ControlMethod.Combined,
    ControlMethod.Profile,
  ],
  [ControlRequest.MotionMagic]: [
    ControlMethod.Pid,
    ControlMethod.Feedforward,
    ControlMethod.Combined,
    ControlMethod.Profile,
  ],
};
export function supports(config: Config, settings: Controller): boolean {
  return (
    supportedMethods[config.request].includes(settings.method) &&
    !(
      config.request === ControlRequest.MotionMagic &&
      settings.profile === MotionProfile.Direct
    )
  );
}
export function controllerKeys(config: Config): ControllerKey[] {
  return config.compare ? ["a", "b"] : ["a"];
}
export const isCompatible = (config: Config) =>
  controllerKeys(config).every((key) => supports(config, config[key]));
export const isGraphAvailable = (config: Config, kind: GraphKind) =>
  !isDirect(config) ||
  ![GraphType.Response, GraphType.Error, GraphType.Terms].some(
    (hidden) => hidden === kind,
  );
export const isLinear = (mechanism: Mechanism) =>
  mechanism === MechanismType.Elevator || mechanism === MechanismType.Slide;
export const hasGravity = (mechanism: Mechanism) =>
  mechanism === MechanismType.Elevator || mechanism === MechanismType.Arm;
export const bounds = (mechanism: Mechanism): NumericRange =>
  mechanism === MechanismType.Elevator
    ? [0, 3]
    : mechanism === MechanismType.Slide
      ? [-1, 4]
      : mechanism === MechanismType.Arm
        ? [-1.4, 1.4]
        : [0, 20];
export const targetBounds = (config: Config): NumericRange =>
  isVelocity(config) ? [-20, 20] : bounds(config.mechanism);
export const demandBounds = (config: Config): NumericRange =>
  config.request === ControlRequest.Duty
    ? [-100, 100]
    : config.request === ControlRequest.Torque
      ? [-40, 40]
      : [-12, 12];
export const outputUnit = (config: Config) =>
  config.request === ControlRequest.Torque ? "A" : "V";
export const demandUnit = (config: Config) =>
  config.request === ControlRequest.Duty ? "%" : outputUnit(config);
