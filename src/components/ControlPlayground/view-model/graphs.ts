import type { GraphModel, GraphSeries } from "./graphTypes";
import { GraphType } from "../model/constants";
import { controllerKeys } from "../model/semantics";
import { isVelocity, isDirect } from "../model/semantics";
import { type Config, type State, type Sample } from "../model/types";
import { type GraphKind } from "../model/constants";
export function graphModel(
  history: Sample[],
  kind: GraphKind,
  cfg: Config,
): GraphModel {
  const velocity = isVelocity(cfg);
  const metric = (state: State): number => {
    switch (kind) {
      case GraphType.Response:
        return velocity ? state.v : state.x;
      case GraphType.Error:
        return state.error;
      case GraphType.Output:
        return state.output;
      case GraphType.Velocity:
        return state.v;
      default:
        return state.acceleration;
    }
  };
  const series: GraphSeries[] =
    kind === "terms"
      ? (["p", "i", "d", "ff"] as const).map((k) => ({
          label: k,
          color: { p: "#0d9488", i: "#d97706", d: "#8b5cf6", ff: "#dc2626" }[k],
          values: history.map((h) => h.a[k]),
          dash: false,
        }))
      : [
          {
            label: "בקר 1",
            color: "#0d9488",
            values: history.map((h) => metric(h.a)),
            dash: false,
          },
          ...(cfg.compare
            ? [
                {
                  label: "בקר 2",
                  color: "#8b5cf6",
                  values: history.map((h) => metric(h.b)),
                  dash: true,
                },
              ]
            : []),
        ];
  if (
    !isDirect(cfg) &&
    ["response", "velocity", "acceleration"].includes(kind)
  ) {
    for (const key of controllerKeys(cfg))
      series.push({
        label: "יעד בקר " + (key === "a" ? "1" : "2"),
        color: key === "a" ? "#d97706" : "#dc2626",
        dash: true,
        values: history.map((h) =>
          kind === "response"
            ? h[key].reference
            : kind === "velocity"
              ? h[key].rv
              : h[key].ra,
        ),
      });
  }
  let min = 0;
  let max = 1;
  for (const { values } of series)
    for (const value of values) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  const pad = (max - min) * 0.1;
  min -= pad;
  max += pad;
  const unit =
    kind === "output" || kind === "terms"
      ? cfg.request === "torque"
        ? "A"
        : "V"
      : cfg.mechanism === "elevator"
        ? "m"
        : "rad";
  const suffix =
    kind === "velocity" ||
    ((kind === "response" || kind === "error") && velocity)
      ? "/s"
      : kind === "acceleration"
        ? "/s²"
        : "";
  return { series, min, max, unit, suffix };
}
