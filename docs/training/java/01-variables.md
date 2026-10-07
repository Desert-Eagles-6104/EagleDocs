---
sidebar_position: 1
title: משתנים
---

בשיעור הזה נלמד איך לשמור ערכים בקוד, לשנות אותם ולהשתמש בהם.

בקוד של רובוט כמעט כל דבר נשמר במשתנים:

- מהירות של מנוע
- מיקום של מנגנון
- מספר הכדורים שנורו
- האם המצלמה מזהה מטרה?

## מה זה משתנה?

משתנה הוא מקום שבו התוכנית יכולה לשמור ערך ולתת לו שם.

במקום לזכור שהמספר `6104` מייצג את מספר הקבוצה שלנו, אפשר לשמור אותו במשתנה בשם `teamNumber`:

```java
int teamNumber = 6104;
```

כאשר נגדיר משתנה ב-Java, הצורה הכללית שלו תיראה כך:

![מבנה של משתנה ב-Java](./variable-example.png)

לכל משתנה יש שלושה חלקים עיקריים:

- **סוג (`type`)** - איזה סוג מידע המשתנה יכול לשמור.
- **שם (`name`)** - השם שבו נשתמש כדי לגשת למשתנה.
- **ערך (`value`)** - המידע שנשמר בתוך המשתנה.

לדוגמה:

```java
int teamNumber = 6104;
```

כאן:

- `int` הוא סוג המשתנה.
- `teamNumber` הוא שם המשתנה.
- `6104` הוא הערך שלו.

## למה בכלל צריך משתנים?

נניח שאנחנו רוצים להדפיס את מספר הקבוצה כמה פעמים:

```java
System.out.println(6104);
System.out.println(6104);
System.out.println(6104);
```

זה עובד, אבל אם מספר הקבוצה היה משתנה היינו צריכים לעבור ולשנות אותו בכל מקום.

במקום זאת אפשר לעשות:

```java
int teamNumber = 6104;

System.out.println(teamNumber);
System.out.println(teamNumber);
System.out.println(teamNumber);
```

עכשיו הערך נמצא במקום אחד בלבד.

אם נשנה:

```java
int teamNumber = 6105;
```

כל המקומות שמשתמשים ב-`teamNumber` יקבלו את הערך החדש.

## סוגי משתנים בסיסיים

ב-Java יש כמה סוגי נתונים שנשתמש בהם הרבה.

### `int` - מספר שלם

```java
int teamNumber = 6104;
int fuelCount = 8;
int motorCount = 4;
```

`int` משמש למספרים שלמים, כלומר ללא נקודה עשרונית.

### `double` - מספר עשרוני

```java
double motorSpeed = 0.5;
double distance = 2.35;
```

`double` מאפשר לשמור מספרים עם חלק עשרוני.

למשל, מהירות מנוע יכולה להיות `0.5`, ולכן `int` לא יתאים כאן.

### `boolean` - אמת או שקר

```java
boolean seesTarget = true;
boolean hasFuel = false;
```

ל-`boolean` יכולים להיות רק שני ערכים:

```java
true
false
```

הוא שימושי מאוד לדברים כמו:

- האם חיישן מופעל?
- האם הרובוט מחזיק Fuel?
- האם המצלמה רואה מטרה?
- האם האוטונומי הסתיים?

### `String` - טקסט

```java
String teamName = "Desert Eagles";
String robotName = "Eagle";
```

טקסט נכתב בתוך מרכאות `" "`.

:::note
שימו לב ש-`String` מתחיל באות גדולה, בניגוד ל-`int`, `double` ו-`boolean`.

נבין בהמשך למה.
:::

## שינוי ערך של משתנה

משתנה יכול לקבל ערך חדש לאחר שיצרנו אותו.

לדוגמה:

```java
int fuelCount = 5;

fuelCount = 8;
```

בהתחלה הערך של `fuelCount` הוא `5`.

לאחר השורה:

```java
fuelCount = 8;
```

הערך הקודם מוחלף, ועכשיו `fuelCount` מכיל `8`.

שימו לב שלא כתבנו שוב `int`.

כותבים את סוג המשתנה רק כאשר **יוצרים** אותו:

```java
int fuelCount = 5;
```

לאחר מכן משתמשים רק בשם שלו:

```java
fuelCount = 8;
```

## שימוש במשתנה

אפשר להשתמש בערך של משתנה בדיוק כמו שהיינו משתמשים בערך עצמו.

לדוגמה:

```java
int fuelCount = 8;

System.out.println(fuelCount);
```

התוצאה תהיה:

```text
8
```

אפשר גם להשתמש במשתנים בחישובים:

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

## שמות של משתנים

כדאי לתת למשתנים שמות שמתארים מה הם שומרים.

עדיף:

```java
double motorSpeed = 0.5;
```

ולא:

```java
double x = 0.5;
```

ב-Java נהוג להשתמש בשיטת כתיבה שנקראת **camelCase**.

המילה הראשונה מתחילה באות קטנה, וכל מילה נוספת מתחילה באות גדולה:

```java
teamNumber
motorSpeed
fuelCount
distanceFromTarget
```

## תרגול

### תרגיל 1 - יצירת משתנים

צרו את המשתנים הבאים:

- `teamNumber` שמכיל `6104`
- `motorSpeed` שמכיל `0.75`
- `seesTarget` שמכיל `true`
- `teamName` שמכיל `"Desert Eagles"`

### תרגיל 2 - מצאו את הטעות

איזו שורה לא תקינה? נסו להבין למה לפני שאתם מריצים.

```java
int fuelCount = 8;
double motorSpeed = 0.6;
boolean seesTarget = "true";
String robotName = "Eagle";
```

<details>
<summary>פתרון</summary>

השורה:

```java
boolean seesTarget = "true";
```

לא תקינה.

`boolean` מקבל את הערכים `true` או `false` ללא מרכאות:

```java
boolean seesTarget = true;
```

</details>

### תרגיל 3 - שינוי ערך

מה יודפס בסוף?

```java
int fuelCount = 5;

fuelCount = 10;
fuelCount = 3;

System.out.println(fuelCount);
```

נסו לענות לפני שאתם מריצים.

<details>
<summary>פתרון</summary>

```text
3
```

כל השמה חדשה מחליפה את הערך הקודם.

</details>

### תרגיל 4 - כתבו לבד

כתבו תוכנית ששומרת:

- את מספר הקבוצה שלכם
- את שם הקבוצה
- מהירות מנוע כלשהי
- האם הרובוט מופעל

ולאחר מכן מדפיסה את כל המשתנים.