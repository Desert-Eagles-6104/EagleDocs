---
sidebar_position: 3
title: תנאים
---

עד עכשיו למדנו איך לשמור מידע במשתנים ואיך לבצע עליו פעולות.

עכשיו נלמד איך לגרום לתוכנית **לקבל החלטות**.

לדוגמה:

- אם חיישן מזהה Game Piece - להפעיל מנגנון.
- אם הרובוט הגיע למיקום מסוים - לעצור.
- אם המצלמה רואה מטרה - לבצע פעולה.
- אם מהירות המנוע גבוהה מדי - להוריד אותה.

בשביל זה משתמשים ב**תנאים**.

## `if`

הצורה הבסיסית של תנאי ב-Java נראית כך:

```java
if (condition) {
    // code
}
```

אם התנאי שבתוך הסוגריים הוא `true`, הקוד שבתוך `{ }` ירוץ.

לדוגמה:

```java
boolean seesTarget = true;

if (seesTarget) {
    System.out.println("Target detected");
}
```

מכיוון שהערך של `seesTarget` הוא `true`, ההודעה תודפס.

אם נכתוב:

```java
boolean seesTarget = false;
```

הקוד שבתוך ה-`if` לא ירוץ.

## תנאים עם השוואות

ברוב המקרים התנאי שלנו לא יהיה פשוט משתנה מסוג `boolean`.

במקום זאת נרצה **להשוות בין ערכים**.

לדוגמה:

```java
int gamePieceCount = 3;

if (gamePieceCount > 0) {
    System.out.println("The robot has game pieces");
}
```

כאן Java בודקת האם:

```java
gamePieceCount > 0
```

אם התוצאה היא `true`, הקוד ירוץ.

## סימני השוואה

ב-Java משתמשים בסימנים הבאים:

| סימן | משמעות |
|---|---|
| `==` | שווה ל |
| `!=` | לא שווה ל |
| `>` | גדול מ |
| `<` | קטן מ |
| `>=` | גדול או שווה ל |
| `<=` | קטן או שווה ל |

לדוגמה:

```java
int mechanismPosition = 10;

if (mechanismPosition >= 10) {
    System.out.println("Position reached");
}
```

## `==` לעומת `=`

חשוב מאוד לא להתבלבל בין:

```java
=
```

לבין:

```java
==
```

`=` משמש כדי **לשמור ערך במשתנה**:

```java
int count = 5;
```

`==` משמש כדי **להשוות בין שני ערכים**:

```java
if (count == 5) {
    System.out.println("Count is 5");
}
```

:::warning
זו אחת הטעויות הנפוצות ביותר אצל מתחילים.

```java
count = 5;
```

זו השמה.

```java
count == 5;
```

זו השוואה.
:::

## `else`

לפעמים אנחנו רוצים לבצע פעולה אחת אם התנאי נכון, ופעולה אחרת אם הוא לא נכון.

בשביל זה משתמשים ב-`else`.

```java
boolean hasGamePiece = true;

if (hasGamePiece) {
    System.out.println("Ready");
} else {
    System.out.println("Waiting");
}
```

אם `hasGamePiece` הוא `true`, יודפס:

```text
Ready
```

אחרת יודפס:

```text
Waiting
```

## `else if`

לפעמים יש לנו יותר משתי אפשרויות.

לדוגמה, נניח שאנחנו רוצים לבדוק דירוג של חיישן:

```java
int signalStrength = 75;

if (signalStrength >= 90) {
    System.out.println("Excellent");
} else if (signalStrength >= 60) {
    System.out.println("Good");
} else {
    System.out.println("Weak");
}
```

Java בודקת את התנאים מלמעלה למטה.

ברגע שהיא מוצאת תנאי שהוא `true`, היא מריצה אותו ומפסיקה לבדוק את שאר התנאים.

## סדר התנאים חשוב

לדוגמה:

```java
int speed = 100;

if (speed > 50) {
    System.out.println("Fast");
} else if (speed > 90) {
    System.out.println("Very fast");
}
```

מה יודפס?

```text
Fast
```

למרות ש-`100` גדול גם מ-`90`.

למה?

כי התנאי הראשון:

```java
speed > 50
```

כבר היה `true`.

לכן Java לא ממשיכה לבדוק את התנאים הבאים.

במקרה הזה עדיף לכתוב:

```java
if (speed > 90) {
    System.out.println("Very fast");
} else if (speed > 50) {
    System.out.println("Fast");
}
```

## שילוב תנאים

לפעמים נרצה לבדוק יותר מתנאי אחד באותו זמן.

### וגם - `&&`

הסימן:

```java
&&
```

אומר ש**שני התנאים חייבים להיות נכונים**.

```java
boolean seesTarget = true;
boolean mechanismReady = true;

if (seesTarget && mechanismReady) {
    System.out.println("Ready to act");
}
```

הקוד ירוץ רק אם גם `seesTarget` וגם `mechanismReady` הם `true`.

## או - `||`

הסימן:

```java
||
```

אומר שמספיק ש**לפחות תנאי אחד יהיה נכון**.

```java
boolean leftSensor = false;
boolean rightSensor = true;

if (leftSensor || rightSensor) {
    System.out.println("Object detected");
}
```

מכיוון שאחד מהם הוא `true`, התנאי כולו הוא `true`.

## לא - `!`

הסימן:

```java
!
```

הופך ערך בוליאני.

לדוגמה:

```java
boolean hasGamePiece = false;

if (!hasGamePiece) {
    System.out.println("No game piece");
}
```

`!hasGamePiece` אומר:

```text
not hasGamePiece
```

אם `hasGamePiece` הוא `false`, אז:

```java
!hasGamePiece
```

יהיה `true`.

## סוגריים בתנאים

אפשר לשלב כמה תנאים יחד:

```java
if ((speed > 0.5 && seesTarget) || manualOverride) {
    System.out.println("Run mechanism");
}
```

כמו בחשבון, סוגריים עוזרים לקבוע את סדר הבדיקה וגם הופכים את הקוד לברור יותר.

## תנאים עם משתני `boolean`

אם כבר יש לנו משתנה מסוג `boolean`, אין צורך לכתוב:

```java
if (hasGamePiece == true) {
```

אפשר פשוט:

```java
if (hasGamePiece) {
```

ובמקום:

```java
if (hasGamePiece == false) {
```

עדיף:

```java
if (!hasGamePiece) {
```

זה קצר וברור יותר.

## דוגמה מרובוט

נניח שיש לנו חיישן שבודק האם יש Game Piece בתוך מנגנון:

```java
boolean hasGamePiece = true;

if (hasGamePiece) {
    System.out.println("Stop intake");
} else {
    System.out.println("Keep intake running");
}
```

או דוגמה עם מיקום:

```java
double mechanismPosition = 45.0;

if (mechanismPosition >= 40.0) {
    System.out.println("Target position reached");
}
```

## תרגול

### תרגיל 1 - מה יודפס?

```java
int gamePieceCount = 2;

if (gamePieceCount > 0) {
    System.out.println("Has game piece");
}
```

<details>
<summary>פתרון</summary>

יודפס:

```text
Has game piece
```

כי:

```java
2 > 0
```

הוא `true`.

</details>


### תרגיל 2 - `if` ו-`else`

מה יודפס?

```java
double speed = 0.4;

if (speed >= 0.5) {
    System.out.println("Fast");
} else {
    System.out.println("Slow");
}
```

<details>
<summary>פתרון</summary>

```text
Slow
```

כי:

```java
0.4 >= 0.5
```

הוא `false`.

</details>

### תרגיל 3 - מצאו את הטעות

מה לא נכון כאן?

```java
int count = 5;

if (count = 5) {
    System.out.println("Correct");
}
```

<details>
<summary>פתרון</summary>

השתמשנו ב-`=` במקום ב-`==`.

צריך להיות:

```java
if (count == 5) {
    System.out.println("Correct");
}
```

</details>

### תרגיל 4 - `else if`

כתבו קוד שבודק את הערך של:

```java
double batteryVoltage = 11.5;
```

אם המתח גדול או שווה ל-`12`, הדפיסו:

```text
Good
```

אם הוא גדול או שווה ל-`10`, הדפיסו:

```text
Low
```

אחרת הדפיסו:

```text
Critical
```

<details>
<summary>פתרון</summary>

```java
double batteryVoltage = 11.5;

if (batteryVoltage >= 12) {
    System.out.println("Good");
} else if (batteryVoltage >= 10) {
    System.out.println("Low");
} else {
    System.out.println("Critical");
}
```

</details>

### תרגיל 5 - שילוב תנאים

יש לנו:

```java
boolean seesTarget = true;
boolean mechanismReady = false;
```

כתבו תנאי שמדפיס:

```text
Ready
```

רק אם **שני המשתנים** הם `true`.

<details>
<summary>פתרון</summary>

```java
if (seesTarget && mechanismReady) {
    System.out.println("Ready");
}
```

</details>

### תרגיל 6 - `||`

יש שני חיישנים:

```java
boolean leftSensor = false;
boolean rightSensor = true;
```

כתבו תנאי שמדפיס:

```text
Detected
```

אם לפחות אחד מהם מזהה משהו.

<details>
<summary>פתרון</summary>

```java
if (leftSensor || rightSensor) {
    System.out.println("Detected");
}
```

</details>

### תרגיל 7 - אתגר

נתונים המשתנים:

```java
boolean hasGamePiece = true;
boolean seesTarget = true;
double mechanismSpeed = 0.8;
```

כתבו תנאי שמדפיס:

```text
Ready to score
```

רק אם:

- יש Game Piece
- המצלמה רואה מטרה
- מהירות המנגנון גדולה או שווה ל-`0.7`

<details>
<summary>פתרון</summary>

```java
if (hasGamePiece && seesTarget && mechanismSpeed >= 0.7) {
    System.out.println("Ready to score");
}
```

</details>

## סיכום

בשיעור הזה למדנו:

- להשתמש ב-`if`.
- להשתמש ב-`else`.
- להשתמש ב-`else if`.
- להשוות ערכים עם `==`, `!=`, `>`, `<`, `>=`, `<=`.
- לשלב תנאים עם `&&`.
- להשתמש ב-`||`.
- להפוך תנאי עם `!`.
- להבין למה סדר התנאים חשוב.