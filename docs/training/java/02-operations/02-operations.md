---
sidebar_position: 2
title: פעולות וחישובים
---

עד עכשיו למדנו איך לשמור ערכים בתוך משתנים.

לדוגמה:

```java
int fuelCount = 8;
double motorSpeed = 0.5;
```

אבל ברוב התוכניות לא מספיק רק לשמור ערכים - אנחנו רוצים גם **לעשות איתם פעולות**.

## פעולות חשבון

ב-Java אפשר לבצע פעולות חשבון בצורה דומה למתמטיקה רגילה.

```java
int a = 10;
int b = 5;
```

### חיבור

```java
int result = a + b;
```

הערך של `result` יהיה:

```text
15
```

### חיסור

```java
int result = a - b;
```

התוצאה:

```text
5
```

### כפל

```java
int result = a * b;
```

התוצאה:

```text
50
```

### חילוק

```java
int result = a / b;
```

התוצאה:

```text
2
```

ב-Java משתמשים בסימנים הבאים:

| פעולה | סימן |
|---|---|
| חיבור | `+` |
| חיסור | `-` |
| כפל | `*` |
| חילוק | `/` |

## שימוש במשתנים בחישובים

אפשר להשתמש במשתנים כחלק מחישוב.

```java
int fuelCount = 8;
int addedFuel = 3;

int totalFuel = fuelCount + addedFuel;

System.out.println(totalFuel);
```

התוצאה:

```text
11
```

אפשר גם להשתמש במספרים ישירות:

```java
int total = fuelCount + 5;
```

## שינוי ערך בעזרת הערך הקודם

נניח שיש לנו:

```java
int fuelCount = 5;
```

ואנחנו רוצים להוסיף עוד Fuel אחד.

אפשר לכתוב:

```java
fuelCount = fuelCount + 1;
```

מה קורה כאן?

Java קודם מחשבת את הצד הימני:

```java
fuelCount + 1
```

כלומר:

```text
5 + 1
```

ואז שומרת את התוצאה בחזרה בתוך `fuelCount`.

לכן עכשיו:

```java
fuelCount == 6
```

:::note
הסימן `=` ב-Java לא אומר "שווה" כמו במתמטיקה.

הוא אומר:

**שמור את הערך שבצד ימין בתוך המשתנה שבצד שמאל.**
:::

## קיצורי כתיבה

הפעולה הזו:

```java
fuelCount = fuelCount + 1;
```

יכולה להיכתב גם כך:

```java
fuelCount += 1;
```

באותה צורה:

```java
fuelCount -= 2;
```

שקול ל:

```java
fuelCount = fuelCount - 2;
```

וגם:

```java
motorSpeed *= 2;
```

שקול ל:

```java
motorSpeed = motorSpeed * 2;
```

הקיצורים הנפוצים הם:

| קיצור | משמעות |
|---|---|
| `+=` | הוספה |
| `-=` | חיסור |
| `*=` | כפל |
| `/=` | חילוק |

## `++` ו-`--`

כאשר רוצים להוסיף או להוריד בדיוק `1`, יש קיצור נוסף.

במקום:

```java
fuelCount = fuelCount + 1;
```

אפשר לכתוב:

```java
fuelCount++;
```

ובמקום:

```java
fuelCount = fuelCount - 1;
```

אפשר לכתוב:

```java
fuelCount--;
```

נשתמש בזה הרבה בהמשך בשביל מונים.

לדוגמה:

```java
int shotCount = 0;

shotCount++;
shotCount++;
shotCount++;

System.out.println(shotCount);
```

התוצאה:

```text
3
```

## סדר פעולות

Java פועלת לפי סדר פעולות חשבון.

לדוגמה:

```java
int result = 2 + 3 * 4;
```

הכפל מתבצע קודם:

```text
2 + 12
```

ולכן התוצאה היא:

```text
14
```

אם אנחנו רוצים שהחיבור יתבצע קודם, משתמשים בסוגריים:

```java
int result = (2 + 3) * 4;
```

עכשיו התוצאה תהיה:

```text
20
```

כמו במתמטיקה, עדיף להשתמש בסוגריים כשזה הופך את הקוד לברור יותר.

## חילוק עם `int`

יש משהו חשוב שצריך לדעת כשמחלקים מספרים מסוג `int`.

לדוגמה:

```java
int result = 5 / 2;
```

אפשר לצפות שהתוצאה תהיה:

```text
2.5
```

אבל `int` יכול לשמור רק מספרים שלמים.

לכן התוצאה תהיה:

```text
2
```

Java פשוט מורידה את החלק העשרוני.

אם אנחנו רוצים תוצאה עשרונית, לפחות אחד המספרים צריך להיות `double`.

```java
double result = 5.0 / 2.0;
```

התוצאה:

```text
2.5
```

או:

```java
double result = 5 / 2.0;
```

גם כאן התוצאה תהיה:

```text
2.5
```

## דוגמה מרובוט

נניח שאנחנו סופרים כמה פעמים הרובוט ירה:

```java
int shotCount = 0;

shotCount++;
shotCount++;
shotCount++;

System.out.println(shotCount);
```

או שאנחנו רוצים לחשב מרחק:

```java
double startPosition = 2.0;
double endPosition = 5.5;

double distance = endPosition - startPosition;

System.out.println(distance);
```

התוצאה:

```text
3.5
```

## תרגול

### תרגיל 1 - חישוב פשוט

מה יודפס?

```java
int a = 4;
int b = 3;

int result = a + b * 2;

System.out.println(result);
```

נסו לענות לפני שאתם מריצים.

<details>
<summary>פתרון</summary>

```text
10
```

הכפל מתבצע קודם:

```text
3 * 2 = 6
4 + 6 = 10
```

</details>

### תרגיל 2 - שינוי משתנה

מה יהיה הערך של `fuelCount` בסוף?

```java
int fuelCount = 5;

fuelCount += 3;
fuelCount--;
fuelCount *= 2;
```

<details>
<summary>פתרון</summary>

בהתחלה:

```text
5
```

אחרי:

```java
fuelCount += 3;
```

נקבל:

```text
8
```

אחרי:

```java
fuelCount--;
```

נקבל:

```text
7
```

ואחרי:

```java
fuelCount *= 2;
```

נקבל:

```text
14
```

</details>

### תרגיל 3 - מה הבעיה?

מה יודפס כאן?

```java
int result = 7 / 2;

System.out.println(result);
```

<details>
<summary>פתרון</summary>

```text
3
```

מכיוון ששני המספרים הם `int`, Java מבצעת חילוק של מספרים שלמים.

אם רוצים לקבל `3.5`:

```java
double result = 7.0 / 2.0;
```

</details>

### תרגיל 4 - כתיבה עצמאית

צרו את המשתנים:

```java
int autoScore = 12;
int teleopScore = 35;
```

צרו משתנה חדש בשם:

```java
totalScore
```

שישמור את סכום שניהם.

הדפיסו אותו למסך.

<details>
<summary>פתרון</summary>

```java
int autoScore = 12;
int teleopScore = 35;

int totalScore = autoScore + teleopScore;

System.out.println(totalScore);
```

</details>

### תרגיל 5 - אתגר קטן

הרובוט מתחיל עם:

```java
int gamePieceCount = 10;
```

לאחר מכן:

- הוא אוסף 5 חלקי משחק
- יורה 3
- אוסף עוד 2

כתבו קוד שמעדכן את `gamePieceCount` בהתאם ומדפיס את הכמות הסופית.

<details>
<summary>פתרון</summary>

```java
int gamePieceCount = 10;

gamePieceCount += 5;
gamePieceCount -= 3;
gamePieceCount += 2;

System.out.println(gamePieceCount);
```

התוצאה:

```text
14
```

</details>

## סיכום

בשיעור הזה למדנו:

- לבצע חיבור, חיסור, כפל וחילוק.
- להשתמש במשתנים בתוך חישובים.
- לעדכן ערך של משתנה.
- להשתמש ב-`+=`, `-=`, `*=`, `/=`.
- להשתמש ב-`++` ו-`--`.
- את סדר הפעולות.
- את ההבדל בין חילוק של `int` לחילוק של `double`.