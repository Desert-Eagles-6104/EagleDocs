import React from "react";
import type { Config, ControllerKey } from "../model/types";
import type { DemoTuning as TuningOptions } from "../model/demo";
import { tuningParameters } from "../config/tuning";
import { Slider } from "../components/controls/Slider";
import { RADIANS_PER_ROTATION } from "../model/constants";
import styles from "../styles.module.css";
export function DemoTuning({
  cfg,
  keys,
  tune,
  update,
  showRotations = false,
}: {
  cfg: Config;
  keys: ControllerKey[];
  tune: TuningOptions;
  update: (config: Config) => void;
  showRotations?: boolean;
}) {
  return (
    <div className={cfg.compare ? styles.columns : styles.single}>
      {keys.map((key, index) => {
        const parameters = Array.isArray(tune) ? tune : (tune[key] ?? []);
        if (!parameters.length) return null;
        return (
          <fieldset key={key} className={styles.demoTuning}>
            <legend>
              {cfg.compare ? `כוונון בקר ${index + 1}` : "נסו לשנות"}
            </legend>
            {parameters
              .filter((parameter) => Object.hasOwn(tuningParameters, parameter))
              .map((parameter) => {
                const definition = tuningParameters[parameter];
                const scale =
                  showRotations &&
                  ["kp", "ki", "kd", "kv", "ka"].includes(parameter)
                    ? RADIANS_PER_ROTATION
                    : 1;
                return (
                  <Slider
                    key={parameter}
                    {...definition}
                    max={definition.max}
                    value={cfg[key][parameter] * scale}
                    onChange={(value) =>
                      update({
                        ...cfg,
                        [key]: { ...cfg[key], [parameter]: value / scale },
                      })
                    }
                  />
                );
              })}
          </fieldset>
        );
      })}
    </div>
  );
}
