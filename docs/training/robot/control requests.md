---
title: בקשות בקרה
unlisted: true
---

## בקרה בחוג פתוח (Open-loop) {#open-loop}

- **`DutyCycleOut`**

  - מה זה: פלט יחסי של גשר ה־H, בטווח שבין −1 ל־+1.
  - איך לחשוב על זה: ״רמת עוצמה״.
  - הערות: הפלט משתנה בהתאם למתח הסוללה; אפשר להוסיף `.withEnableFOC(true)` לשיפור ההתנהגות.
  - מתי להשתמש: שליטה פשוטה ב־teleop, גלילי intake ובדיקות מהירות.

- **`VoltageOut`**

  - מה זה: בקשת מתח ישירה בוולטים, למשל `6` או `12`.
  - איך לחשוב על זה: ״תן לי בדיוק את המתח הזה״. הפלט מושפע פחות מנפילות מתח בסוללה.
  - הערות: זו עדיין בקרה בחוג פתוח, ללא PID. אפשר להוסיף גם `.withEnableFOC(true)`.
  - מתי להשתמש: כשרוצים פלט עקבי במצבי סוללה שונים, בלי צורך בבקרה שמווסתת את המנגנון לערך יעד.

## בקרה בחוג סגור (PID) {#closed-loop-pid}

- **`PositionVoltage`**

  - מה זה: בקרת PID להגעה ל־**מיקום** יעד, ביחידות של **סיבובי החיישן**.
  - הערות: משתמשת ב־slot של ה־PID שהגדרתם. ברירת המחדל היא slot 0; משנים אותו עם `.withSlot(n)`. אפשר להוסיף `.withFeedForward(volts)`.
  - מתי להשתמש: זרועות, מעליות ומנועי היגוי, כשצריך ״להגיע לזווית או למיקום הזה ולהישאר שם״.

- **`VelocityVoltage`**

  - מה זה: בקרת PID להגעה ל־**מהירות** יעד, ביחידות של **סיבובים לשנייה**.
  - הערות: משתמשת במקדמי בקרת המהירות שב־slot הנבחר. אפשר להוסיף `.withFeedForward(volts)` עבור Feedforward בסגנון kS/kV/kA.
  - מתי להשתמש: גלגלי ירי וגלגלי הנעה של swerve, כשצריך ״להסתובב במהירות הזאת ולשמור עליה״.

### חוג סגור עם פרופיל תנועה (Motion Magic) {#closed-loop--profiling-motion-magic}

- **`MotionMagicVoltage`**

  - מה זה: בקרת מיקום עם **פרופיל תנועה מובנה בצורת טרפז או עקומת S**, להגעה למיקום היעד.
  - הערות: פועלת לפי הגדרות Motion Magic שלכם: מהירות שיוט, תאוצה ו־jerk (קצב שינוי התאוצה). החוג הפנימי עדיין משתמש ב־slot של PID.
  - מתי להשתמש: כשרוצים תנועה חלקה ומבוקרת למיקום מסוים, למשל בזרועות או במעליות, בלי לכתוב מתכנן תנועה משלכם.

- **`MotionMagicVelocityVoltage`**

  - מה זה: בקרת מהירות עם **שינוי הדרגתי באמצעות Motion Magic**, תוך עמידה במגבלות התאוצה וה־jerk, כדי להגיע למהירות יעד ולשמור עליה.
  - הערות: שימושית להגבלת קפיצות בזרם ולהאצה חלקה של מנגנונים מסתובבים.
  - מתי להשתמש: במנגנוני ירי, בגלגלי תנופה ובהנעת swerve, כשרוצים **עלייה הדרגתית למהירות היעד**.

---

## מדריך קצר לבחירת בקשת בקרה {#tiny-when-to-pick-what-cheat-sheet}

- הפעלה פשוטה של המנוע: **`DutyCycleOut`**
- פלט ידני עקבי, ללא תלות במתח הסוללה: **`VoltageOut`**
- הגעה לזווית או למיקום ושמירה עליהם: **`PositionVoltage`**
- הגעה למהירות ושמירה עליה: **`VelocityVoltage`**
- תנועה חלקה למיקום, ללא שינויי תאוצה חדים: **`MotionMagicVoltage`**
- מעבר הדרגתי למהירות, ללא שינויי תאוצה חדים: **`MotionMagicVelocityVoltage`**

## דוגמאות קוד {#example-snippets}

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

## דגשים וטיפים {#gotchas--tips}

- **יחידות**: כברירת מחדל, Phoenix 6 משתמש ב־**סיבובים** וב־**סיבובים לשנייה** עבור החיישן המובנה.
- **Slots**: ודאו שמקדמי ה־PID המתאימים מוגדרים ב־slot שאתם בוחרים באמצעות `.withSlot(n)`.
- **הגדרות Motion Magic**: הגדירו מהירות שיוט, תאוצה ו־jerk בתוך `TalonFXConfiguration.MotionMagic`; אחרת פרופיל התנועה לא יפעל.
- **Feedforward**: אפשר להשתמש ב־`.withFeedForward(...)` בכל בקשת בקרה, להגדיר kS/kV/kA ב־Feedforward של ה־slot, או לשלב בין השניים. במנגנונים שפועלים נגד כוח הכבידה, הוסיפו kG לחוג בקרת המיקום.
