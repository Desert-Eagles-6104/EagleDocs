import type { Config } from "../model/types";
import { fieldScale, measuredUnit } from "../model/units";
import { ControlRequest } from "../model/constants";
import {
  demandBounds,
  demandUnit,
  isDirect,
  isVelocity,
  targetBounds,
} from "../model/semantics";

/** All labels, units and ranges needed to render a goal input. */
export function targetModel(config: Config) {
  const direct = isDirect(config);
  const [min, max] = direct ? demandBounds(config) : targetBounds(config);
  const unit = direct ? demandUnit(config) : measuredUnit(config);
  const scale = direct ? 1 : fieldScale(config, "target");
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
    min: min * scale,
    max: max * scale,
    unit,
    value: direct ? config.demand : config.target * scale,
    label: `${quantity} (${unit})`,
  };
}
