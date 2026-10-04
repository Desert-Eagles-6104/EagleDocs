# אתר התיעוד

<!-- markdownlint-disable MD033 -->

<a id="website"></a>

האתר נבנה באמצעות [Docusaurus](https://docusaurus.io/), כלי מודרני ליצירת אתרים סטטיים.

<a id="installation"></a>

## התקנה

כדי להתקין את התלויות הנדרשות, הריצו את הפקודה הבאה:

```bash
yarn install
```

<a id="local-development"></a>

## פיתוח מקומי

<a id="start-development-server"></a>

### הפעלת שרת הפיתוח

כדי להפעיל את שרת הפיתוח, ודאו שיש הרשאת הרצה לסקריפט `fetch-javadoc.sh`, ואז הריצו:

```bash
chmod +x scripts/fetch-javadoc.sh
npm run start
```

שרת הפיתוח יהיה זמין בכתובת `http://localhost:3000`.

<a id="stop-development-server"></a>

### עצירת שרת הפיתוח

כדי לעצור את שרת הפיתוח, הריצו את הפקודה הבאה:

```bash
kill -9 $(lsof -t -i :3000)
```

<a id="restart-development-server"></a>

### הפעלה מחדש של שרת הפיתוח

כדי להפעיל מחדש את שרת הפיתוח, הריצו את הפקודות הבאות:

```bash
kill -9 $(lsof -t -i :3000)
npm run start
```

<a id="building-the-website"></a>

## בניית האתר

כדי לבנות את הגרסה הסטטית של האתר, הריצו:

```bash
npm run build
```

קובצי הפלט ייווצרו בתיקייה `build`.

<a id="deployment"></a>

## פריסה

כדי לפרוס את האתר, אפשר להריץ את הפקודה הבאה:

```bash
npm run deploy
```

ודאו שההרשאות וההגדרות הנדרשות לפריסה מוגדרות מראש.
