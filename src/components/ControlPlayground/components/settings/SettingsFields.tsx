import React from "react";
import type { Config, ControllerKey } from "../../model/types";
import type { FieldChoice } from "../../model/interface";
import { fieldScale } from "../../model/units";
import {
  controllerFields,
  controllerFieldVisible,
  experimentFields,
  type FieldDefinition,
} from "../../config/fields";
import { defaults } from "../../model/defaults";
import { isDirect, supports } from "../../model/semantics";
import { Slider } from "../controls/Slider";
import { Help } from "../common/Help";
import { UnitsSettings } from "./UnitsSettings";
import { Lesson } from "../teaching/Teaching";
import styles from "../../styles.module.css";

/** One field renderer for every lab and lesson setting. */
export function SettingsFields({
  cfg,
  update,
  controllerKey,
}: {
  cfg: Config;
  update: (next: Config) => void;
  controllerKey?: ControllerKey;
}) {
  const controller = controllerKey ? cfg[controllerKey] : undefined;
  const definitions: Record<string, FieldDefinition> = controller
    ? controllerFields
    : experimentFields;
  const selection = cfg.controls[controllerKey ?? "experiment"];
  const fields: FieldChoice<string>[] =
    selection === "all" ? Object.keys(definitions) : selection;
  const values = controller ?? cfg;

  function change(key: string, value: number | string | boolean) {
    if (controllerKey) {
      update({
        ...cfg,
        [controllerKey]: { ...cfg[controllerKey], [key]: value },
      });
      return;
    }
    const next = { ...cfg, [key]: value };
    if (key === "request") {
      next.graphs = isDirect(next)
        ? ["output", "velocity", "acceleration"]
        : [...defaults.graphs];
    }
    if (key === "mechanism") {
      next.target = value === "wheel" ? 8 : value === "arm" ? 0.8 : 1.5;
    }
    if (key === "compare" && value) next.b = { ...cfg.a };
    update(next);
  }

  const visible = fields.filter((field) => {
    const key = typeof field === "string" ? field : field.key;
    const definition = definitions[key];
    return (
      definition &&
      (controller
        ? controllerFieldVisible(
            key as keyof typeof controllerFields,
            cfg,
            controller,
          )
        : (definition.visible?.(cfg) ?? true))
    );
  });
  if (visible.length === 0) return null;
  const isAdvanced = (field: FieldChoice<string>) =>
    selection === "all" &&
    definitions[typeof field === "string" ? field : field.key].advanced;
  const primary = visible.filter((field) => !isAdvanced(field));
  const advanced = visible.filter(isAdvanced);
  const renderField = (field: FieldChoice<string>) => {
    const key = typeof field === "string" ? field : field.key;
    const definition = definitions[key];
    const value = values[key as keyof typeof values] as
      | string
      | number
      | boolean;
    const label = definition.label(cfg);
    const scale = fieldScale(cfg, key);
    if (definition.kind === "units")
      return <UnitsSettings key={key} cfg={cfg} update={update} />;
    if (definition.kind === "boolean" || typeof field !== "string") {
      const toggle = typeof field !== "string" ? field : undefined;
      return (
        <label key={key}>
          <input
            type="checkbox"
            aria-label={toggle ? `הפעלת ${label}` : label}
            checked={toggle ? Number(value) !== 0 : Boolean(value)}
            onChange={(event) =>
              change(
                key,
                toggle
                  ? event.target.checked
                    ? toggle.on / scale
                    : 0
                  : event.target.checked,
              )
            }
          />{" "}
          {toggle && key === "noise" ? "הוספת רעש למדידה" : label}{" "}
          {definition.hint && <Help label={label} text={definition.hint} />}
        </label>
      );
    }
    if (definition.kind === "select") {
      return (
        <label key={key}>
          {label}
          <select
            aria-label={label}
            value={String(value)}
            onChange={(event) => change(key, event.target.value)}
          >
            {Object.entries(definition.options?.(cfg) ?? {}).map(
              ([option, text]) => (
                <option
                  key={option}
                  value={option}
                  disabled={
                    definition.enabled
                      ? !definition.enabled(cfg, option)
                      : false
                  }
                >
                  {text}
                </option>
              ),
            )}
          </select>
          {definition.hint && <Help label={label} text={definition.hint} />}
        </label>
      );
    }
    const [min, max] = definition.range!(cfg);
    const displayedValue = Number(value) * scale;
    // Gains retain a manageable teaching range, while existing larger values remain editable.
    const gain = scale !== 1 && ["kp", "ki", "kd", "kv", "ka"].includes(key);
    return (
      <Slider
        key={key}
        label={label}
        min={Math.min(min * scale, displayedValue)}
        max={Math.max(gain ? max : max * scale, displayedValue)}
        // Converted values need not lie on a native-unit step grid.
        step={scale !== 1 ? "any" : definition.step}
        value={displayedValue}
        hint={definition.hint}
        onChange={(next) => change(key, next / scale)}
      />
    );
  };
  return (
    <fieldset className={styles.card}>
      <legend>
        {controllerKey
          ? `כוונון בקר ${controllerKey === "a" ? 1 : 2}`
          : "הגדרות הניסוי"}
      </legend>
      {controller && !supports(cfg, controller) && (
        <p role="alert">
          שיטת הבקר אינה מתאימה למטרה. בחרו שיטה מתאימה כדי להפעיל את הניסוי.
        </p>
      )}
      {controller && cfg.view.explanations && (
        <details>
          <summary>איך השיטה הזו עובדת?</summary>
          <Lesson method={controller.method} />
        </details>
      )}
      {primary.map(renderField)}
      {advanced.length > 0 && (
        <details className={styles.advancedSettings}>
          <summary>הגדרות מתקדמות</summary>
          {advanced.map(renderField)}
        </details>
      )}
    </fieldset>
  );
}
