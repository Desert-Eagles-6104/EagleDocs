import React, {useState} from 'react';
import CodeBlock from '@theme/CodeBlock';
import styles from './styles.module.css';

/**
 * hints: strings or React elements.
 * solution: optional string (code) or React element.
 * solutionLanguage: syntax highlighting language for string solutions.
 */
export default function ExerciseHelp({
  hints = [],
  solution,
  solutionLanguage = 'java',
}) {
  const [revealed, setRevealed] = useState(0);
  const hasSolution = solution !== undefined && solution !== null;
  const total = hints.length + (hasSolution ? 1 : 0);
  const solutionVisible = hasSolution && revealed > hints.length;
  const finished = revealed >= total;

  if (!total) return null;

  const nextLabel =
    revealed === 0
      ? 'קבלת רמז ראשון'
      : revealed < hints.length
        ? 'הרמז הבא'
        : 'הצגת הפתרון';

  return (
    <section className={styles.card} aria-label="עזרה בתרגיל" dir="rtl">
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.icon} aria-hidden="true">💡</span>
          <div>
            <strong>צריך עזרה?</strong>
            <div className={styles.subheading}>נסו לבד לפני שתבקשו רמז.</div>
          </div>
        </div>
        <span className={styles.tag}>
          {hints.length} רמזים{hasSolution ? ' + פתרון' : ' · ללא פתרון'}
        </span>
      </header>

      <div className={styles.progress} aria-label={`נחשפו ${revealed} מתוך ${total} שלבים`}>
        {Array.from({length: total}, (_, index) => (
          <span
            key={index}
            className={`${styles.segment} ${index < revealed ? styles.active : ''}`}
          />
        ))}
      </div>

      <div className={styles.content} aria-live="polite" aria-atomic="false">
        {revealed === 0 && (
          <p className={styles.intro}>
            לא חייבים להצליח בניסיון הראשון. אפשר להיעזר ברמזים בלי לחשוף מיד את התשובה.
          </p>
        )}
        {hints.slice(0, Math.min(revealed, hints.length)).map((hint, index) => (
          <div className={styles.hint} key={index}>
            <strong className={styles.hintTitle}>רמז {index + 1}</strong>
            <div className={styles.hintBody}>{hint}</div>
          </div>
        ))}
        {solutionVisible && (
          <div className={styles.solution}>
            <strong className={styles.solutionTitle}>✓ פתרון מלא</strong>
            {typeof solution === 'string' ? (
              <CodeBlock language={solutionLanguage}>{solution}</CodeBlock>
            ) : (
              <div className={styles.solutionBody}>{solution}</div>
            )}
            <p className={styles.reflection}>
              לפני שממשיכים: ודאו שאתם מסוגלים להסביר למה הפתרון עובד.
            </p>
          </div>
        )}
        {finished && !hasSolution && (
          <p className={styles.endMessage}>
            הגעתם לרמז האחרון. עכשיו נסו לחבר את כל הרמזים לפתרון משלכם.
          </p>
        )}
      </div>

      <footer className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => setRevealed((value) => Math.max(0, value - 1))}
          disabled={revealed === 0}
        >
          הקודם
        </button>
        {!finished ? (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => setRevealed((value) => Math.min(total, value + 1))}
          >
            {nextLabel} ←
          </button>
        ) : (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setRevealed(0)}
          >
            התחלה מחדש ↺
          </button>
        )}
      </footer>
    </section>
  );
}
