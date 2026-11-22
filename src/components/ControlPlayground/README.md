# Control Playground

The feature has two public entry points. Keep these paths stable:

- `index.tsx`: the complete playground used by the Docusaurus page.
- `ControlDemo.tsx`: the focused MDX component and its public prop types.

Both entry points delegate to their implementations. Existing MDX imports and
saved experiment URLs continue to work after internal files move.

## Structure

| Directory        | Responsibility                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `model/`         | Domain types, string constants, defaults, ranges, compatibility and units.                |
| `engine/`        | Pure control laws, motion profiles, physical integration and bounded simulation stepping. |
| `config/`        | Presets, translated labels, runtime validation, URL persistence and MDX configuration.    |
| `hooks/`         | React state, playback scheduling and browser integration.                                 |
| `view-model/`    | Pure conversion of simulation state into chart data and input models.                     |
| `components/`    | Controls, settings, visuals, help and teaching UI.                                        |
| `demo/`          | Composition of the focused MDX demonstration and its tuning inputs.                       |
| `Playground.tsx` | Composition of the full playground.                                                       |

## Boundaries

- `model/` and `engine/` do not import React, CSS or browser APIs.
- Configuration validation uses domain constants and shared field keys, never translated labels.
- `useSimulation` owns animation frames and bounded history; `useExperiment`
  shares reset, tuning and playback behavior between both interfaces.
- `usePlayground` alone restores URL state and observes reduced-motion settings.
  Embedded demos are isolated and do not read or update the URL.
- Chart calculation belongs in `view-model/graphs.ts`; SVG markup belongs in
  `components/visuals/Graph.tsx`.
- Numeric controller ranges live in `model/constraints.ts`. Validation and MDX
  tuning inputs use the same limits.

## Shared configuration and interface

`components/ExperimentView.tsx` renders both the lab and MDX experiments.
`config/fields.ts` defines every editable experiment and controller field,
including labels, ranges, units and method compatibility. The shared
`SettingsFields` renderer exposes the fields selected by `config.controls`.
Add a setting there once to make it available in both entry points.
Fields marked `advanced` are collapsed when the selection is `"all"`.
Explicit field lists stay visible, so focused lessons expose their exercise controls.

`config.view` selects the visible controls, readouts and explanations.
The lab defaults to all settings. Embeds default to locked settings and opt in
through `config.controls`, with `"all"` available for a full lab inside a page.
MDX embeds accept only the shared `config`; settings and view options have no separate props.

`model/units.ts` owns display conversions. The engine and validated runtime
`Config` always contain metres and radians. Author-facing `ConfigInput` uses
the units selected in `config.units`; `experimentConfig` converts explicit
inputs once and merges them with canonical defaults or presets. UI changes
convert back to canonical values. Changing units must preserve targets,
controller output, trajectories, tolerances and initial conditions.
Saved URLs contain canonical runtime values plus the unit selection, so restoring
them must use `validate`, without a second input-unit conversion.

## Types and constants

`model/constants.ts` exports named values such as `ControlMethod.Pid`,
`MotionProfile.SCurve` and `GraphType.Response`. Their types are derived from
the values with `as const`, so MDX authors can still write `method: "pid"`.
The wire values are unchanged, preserving saved links.

`Config`, `Controller`, `State`, `Simulation`, `ControllerKey` and `Sample`
are defined in `model/types.ts`. `Config.graphs` uses `GraphKind[]`, not arbitrary
strings. Numeric parameter keys are derived from the controller type.

## Verification

Run `npm test` and `npm run typecheck`. Tests cover MDX configuration merging,
instance isolation and URL compatibility. `scripts/fixtures/control-simulation.json`
contains trajectories captured before the module split, with and without a
disturbance, so moving code cannot silently change the physics or control output.
JSON fixtures normalize signed zero.

For a new control method, update the domain values, compatibility rules, control
law, labels and relevant settings UI. Add behavioral tests for the new method;
do not regenerate the existing trajectory fixture to conceal a regression.

MDX usage examples are in `docs/training/robot/control-demo.mdx`.
