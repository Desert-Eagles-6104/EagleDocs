import React, {useState} from 'react';
import CodeBlock from '@theme/CodeBlock';
import styles from './styles.module.css';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/**
 * hints: Array of strings or React elements.
 * solution: Optional string (code) or React element.
 * solutionLanguage: Syntax highlighting language for string solutions.
 * multipleSolutions: Boolean indicating if multiple solutions are possible.
 */
export default function ExerciseHelp({
  hints = [],
  solution,
  solutionLanguage = 'java',
  multipleSolutions = false,
}) {
  const [revealedHints, setRevealedHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const hasSolution = solution !== undefined && solution !== null;
  const hintCount = hints.length;
  const hasMoreHints = revealedHints < hintCount;

  if (hintCount === 0 && !hasSolution) {
    return null;
  }

  const revealNextHint = () => {
    setRevealedHints((current) => Math.min(hintCount, current + 1));
  };

  const reset = () => {
    setRevealedHints(0);
    setShowSolution(false);
  };

  const hasRevealedContent = revealedHints > 0 || showSolution;

  return (
    <section
      className={styles.card}
      aria-label="רמזים ופתרון התרגיל"
      dir="rtl"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.icon} aria-hidden="true">
            💡
          </span>

          <div>
            <strong>רמזים ופתרון</strong>
            <div className={styles.subheading}>
              אפשר להיעזר ברמזים או לבדוק את הפתרון שלכם.
            </div>
          </div>
        </div>

        <span className={styles.tag}>
          {hintCount > 0 && `${hintCount} רמזים`}
          {hintCount > 0 && hasSolution && ' + '}
          {hasSolution && 'פתרון'}
        </span>
      </header>

      {hintCount > 0 && (
        <div
          className={styles.progress}
          role="progressbar"
          aria-label="התקדמות בחשיפת הרמזים"
          aria-valuemin={0}
          aria-valuemax={hintCount}
          aria-valuenow={revealedHints}
        >
          {hints.map((_, index) => (
            <span
              key={index}
              className={`${styles.segment} ${
                index < revealedHints ? styles.active : ''
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      <div className={styles.content}>
        {!hasRevealedContent && (
          <p className={styles.intro}>
            מומלץ לנסות לפתור בעצמכם לפני שמסתכלים על הפתרון.
          </p>
        )}

        {hints.slice(0, revealedHints).map((hint, index) => (
          <div className={styles.hint} key={index}>
            <strong className={styles.hintTitle}>
              רמז {index + 1}
            </strong>

            <div className={styles.hintBody}>
              {hint}
            </div>
          </div>
        ))}

        {showSolution && (
          <div className={styles.solution}>
            <strong className={styles.solutionTitle}>
              {multipleSolutions ? 'פתרון אפשרי' : 'פתרון'}
            </strong>

            {typeof solution === 'string' ? (
              solutionLanguage === 'text' ? (
                <div className={styles.solutionBody}>
                  <ReactMarkdown
                    remarkPlugins={[remarkBreaks, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {solution}
                  </ReactMarkdown>
                </div>
              ) : (
                <CodeBlock language={solutionLanguage}>
                  {solution}
                </CodeBlock>
              )
            ) : (
              <div className={styles.solutionBody}>
                {solution}
              </div>
            )}

            <p className={styles.reflection}>
              {multipleSolutions ? (
                <>
                  הפתרון שלכם יכול להיות שונה ועדיין להיות נכון.
                  השוו את הדרך שלכם וודאו שאתם מבינים איך ולמה הפתרון עובד.
                </>
              ) : (
                <>
                  <strong>בדקו את עצמכם:</strong> האם הגעתם לתשובה הנכונה?
                  ודאו שאתם מבינים איך ולמה מגיעים אליה.
                </>
              )}
            </p>
          </div>
        )}

        {hintCount > 0 &&
          revealedHints === hintCount &&
          !hasSolution && (
            <p className={styles.endMessage}>
              הגעתם לרמז האחרון. נסו לשלב את הרמזים
              ולמצוא פתרון משלכם.
            </p>
          )}
      </div>

      <footer className={styles.actions}>
        <div className={styles.mainActions}>
          {hasMoreHints && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={revealNextHint}
            >
              {revealedHints === 0
                ? 'הצגת רמז ראשון'
                : 'הרמז הבא'}
              {' ←'}
            </button>
          )}

          {hasSolution && (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setShowSolution((current) => !current)}
              aria-expanded={showSolution}
            >
              {showSolution
                ? 'הסתרת הפתרון'
                : 'הצגת הפתרון'}
            </button>
          )}
        </div>

        {hasRevealedContent && (
          <button
            type="button"
            className={styles.resetButton}
            onClick={reset}
          >
            איפוס ↺
          </button>
        )}
      </footer>
    </section>
  );
}
