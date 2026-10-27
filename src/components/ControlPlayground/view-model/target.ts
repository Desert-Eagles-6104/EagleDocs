import type { Config } from "../model/types";
import { ControlRequest } from "../model/constants";
import {
  demandBounds,
  demandUnit,
  isDirect,
  isVelocity,
  targetBounds,
  targetUnit,
} from "../model/semantics";

/** All labels, units and ranges needed to render a goal input. */
export function targetModel(config: Config) {
  const direct = isDirect(config);
  const [min, max] = direct ? demandBounds(config) : targetBounds(config);
  const unit = direct ? demandUnit(config) : targetUnit(config);
  const quantity = direct
    ? config.request === ControlRequest.Duty
      ? "עוצמת ההפעלה"
      : config.request === ControlRequest.Torque
        ? "זרם ההפעלה"
        : "מתח ההפעלה"
    : isVelocity(config)
      ? "מהירות היעד"
      : "מיקום היעד";
  return {
    direct,
    min,
    max,
    unit,
    value: direct ? config.demand : config.target,
    label: `${quantity} (${unit})`,
  };
}
