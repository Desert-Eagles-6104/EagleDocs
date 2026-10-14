---
title: קלט ופלט דיגיטליים
keywords: [DigitalInput, DigitalOutput, boolean signal, HIGH, LOW, beam break sensor, active-low, roboRIO, Java, WPILib]
unlisted: true
---
## DigitalInput

* `DigitalInput` משמש לקריאת **אות בוליאני** שמגיע אל ה־roboRIO (או אל מחשב עזר).
* לפין יש שני מצבים בלבד: **`true` או `false`** (HIGH או LOW).
* שימושים נפוצים: חיישני beam break לזיהוי חסימת קרן, מפסקי גבול וחיישני Hall effect.

דוגמה:

```java
import edu.wpi.first.wpilibj.DigitalInput;

DigitalInput beamBreak = new DigitalInput(0); // plugged into DIO 0

boolean isBroken = !beamBreak.get(); // .get() returns true if signal HIGH
```

כך זה עובד:

* כשחוסמים את הקרן, החיישן משנה את האות, והערך שמחזירה `.get()` מתהפך.
* נהוג להשתמש ב־`!beamBreak.get()` כי חיישנים רבים הם **active-low**: הם מחזירים `false` כשהם מופעלים.

---

## DigitalOutput

* `DigitalOutput` משמש לשליחת **אות בוליאני** מה־roboRIO החוצה.
* אתם קובעים אם הפין יהיה במצב **HIGH (`true` / 5V)** או **LOW (`false` / 0V)**.
* שימושים נפוצים: שליטה בנורות LED, הפעלת ממסרים והדלקה או כיבוי של מעגלים חיצוניים.

דוגמה:

```java
import edu.wpi.first.wpilibj.DigitalOutput;

DigitalOutput led = new DigitalOutput(1); // pin DIO 1

led.set(true);  // turn ON (send 5V out)
led.set(false); // turn OFF (0V)
```

## ההבדל המרכזי {#key-difference}

* **DigitalInput** = *הקשבה*: קריאת מידע מהעולם החיצוני, כמו מפסקים, חיישנים וחיישני beam break.
* **DigitalOutput** = *דיבור*: שליחת אות פשוט של הפעלה או כיבוי לרכיב.

### חיישן beam break {#beam-break-sensor}

* כדי לקרוא אם הקרן חסומה, משתמשים ב־**DigitalInput**.
* משתמשים ב־**DigitalOutput** רק אם רוצים *לשלוח* אות, למשל להדליק נורת חיווי כשהקרן חסומה.
