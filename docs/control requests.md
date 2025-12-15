---
title: Control requests
---

## Open-loop

- **`DutyCycleOut`**

  - What: Percent output of the H-bridge, from −1 to +1.
  - Feels like: “Power level.”
  - Notes: Scales with battery voltage; can add `.withEnableFOC(true)` for better behavior.
  - Use when: Simple teleop control, intake rollers, quick tests.

- **`VoltageOut`**

  - What: Direct voltage command in volts (e.g., `6`, `12`).
  - Feels like: “Give me exactly this many volts,” less affected by battery sag.
  - Notes: Still open-loop (no PID). You can also `.withEnableFOC(true)`.
  - Use when: You want consistent output across battery conditions but don’t need regulation to a target.

## Closed-loop (PID)

- **`PositionVoltage`**

  - What: Position PID to a target **position** (in **rotations** of the sensor).
  - Notes: Uses your configured PID slot (default slot 0; change with `.withSlot(n)`). Accepts optional `.withFeedForward(volts)`.
  - Use when: Arms, elevators, steer motors — “go to and hold this angle/position.”

- **`VelocityVoltage`**

  - What: Velocity PID to a target **speed** (in **rotations/second**).
  - Notes: Uses velocity gains in the selected slot. Optional `.withFeedForward(volts)` for kS/kV/kA style FF.
  - Use when: Shooter wheels, swerve drive wheels — “spin and hold this speed.”

### Closed-loop + profiling (Motion Magic)

- **`MotionMagicVoltage`**

  - What: Position control with **built-in trapezoid/S-curve motion profiling** to your target position.
  - Notes: Follows your Motion Magic configs (cruise velocity, acceleration, jerk). Still uses a PID slot for the inner loop.
  - Use when: You want smooth, controlled moves to a position (arms/elevators) without writing your own planner.

- **`MotionMagicVelocityVoltage`**

  - What: Velocity control with **Motion Magic ramping** (respects accel/jerk) to reach/hold a target speed.
  - Notes: Great for limiting current spikes and smoothing spin-ups.
  - Use when: Shooters/flywheels/swerve drive where you want a **gentle ramp to a velocity setpoint**.

---

## Tiny “when to pick what” cheat sheet

- Just drive it: **`DutyCycleOut`**
- Consistent manual power (independent of battery): **`VoltageOut`**
- Go/hold angle or position: **`PositionVoltage`**
- Go/hold speed: **`VelocityVoltage`**
- Smooth move to a position (no jerk): **`MotionMagicVoltage`**
- Smooth ramp to a speed (no jerk): **`MotionMagicVelocityVoltage`**

## Example snippets

```java
// Open-loop percent
fx.setControl(new DutyCycleOut(0.35).withEnableFOC(true));

// Open-loop volts
fx.setControl(new VoltageOut(6.0).withEnableFOC(true));

// Position PID to 10 rotations, using slot 1
fx.setControl(new PositionVoltage(10.0).withSlot(1));

// Velocity PID to 80 rps, slot 0, with a little extra FF
fx.setControl(new VelocityVoltage(80.0).withSlot(0).withFeedForward(0.3));

// Motion Magic (position) to 15 rotations, slot 1
fx.setControl(new MotionMagicVoltage(15.0).withSlot(1));

// Motion Magic (velocity) to 70 rps, slot 0
fx.setControl(new MotionMagicVelocityVoltage(70.0).withSlot(0));
```

## Gotchas / tips

- **Units**: Phoenix 6 uses **rotations** and **rotations/second** for the integrated sensor by default.
- **Slots**: Make sure you put the right PID gains in the slot you’re commanding with `.withSlot(n)`.
- **Motion Magic configs**: Set cruise velocity / acceleration / jerk in your `TalonFXConfiguration.MotionMagic` section, or you won’t see profiling.
- **Feedforward**: You can use `.withFeedForward(...)` per command, and/or bake kS/kV/kA into your slot’s FF. For gravity-loaded mechanisms, include kG in your position loop.
