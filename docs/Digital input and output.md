---
title: Digital input and output
tags: [DigitalInput, DigitalOutput, roboRIO, boolean signal, sensors, beam break, limit switches, hall-effect sensors, LEDs, relays, circuits]
keywords: [DigitalInput, DigitalOutput, boolean signal, HIGH, LOW, beam break sensor, active-low, roboRIO, Java, WPILib]
---
## DigitalInput

* A `DigitalInput` is for reading a **boolean signal** coming into the roboRIO (or a coprocessor).
* The pin only has two states: **`true` or `false`** (HIGH or LOW).
* Typical use: beam break sensors, limit switches, hall-effect sensors.

Example:

```java
import edu.wpi.first.wpilibj.DigitalInput;

DigitalInput beamBreak = new DigitalInput(0); // plugged into DIO 0

boolean isBroken = !beamBreak.get(); // .get() returns true if signal HIGH
```

filed Here:

* If the beam is blocked → the sensor changes the signal → `.get()` flips.
* Often people use `!beamBreak.get()` because many sensors are **active-low** (they return `false` when triggered).

---

## DigitalOutput

* A `DigitalOutput` is for sending a **boolean signal out** from the roboRIO.
* You control whether the pin is **HIGH (true / 5V)** or **LOW (false / 0V)**.
* Typical use: controlling LEDs, triggering relays, turning external circuits on/off.

Example:

```java
import edu.wpi.first.wpilibj.DigitalOutput;

DigitalOutput led = new DigitalOutput(1); // pin DIO 1

led.set(true);  // turn ON (send 5V out)
led.set(false); // turn OFF (0V)
```

## Key Difference

* **DigitalInput** = *listen* (you’re reading the outside world: switches, sensors, beam-breaks).
* **DigitalOutput** = *talk* (you’re sending a simple ON/OFF command to something).

### beam break sensor

* You’d use a **DigitalInput** to read whether the beam is broken.
* A **DigitalOutput** would only be used if you wanted to *send* a signal (like light up an indicator LED when the beam is broken).
