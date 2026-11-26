import React, {type PropsWithChildren} from 'react';
import Link from '@docusaurus/Link';
import styles from './LessonVideos.module.css';

type LessonVideo = {
  href: string;
  channel: string;
};

type LessonVideosProps = PropsWithChildren<{
  english: LessonVideo;
  hebrew?: LessonVideo;
}>;

export default function LessonVideos({english, hebrew, children}: LessonVideosProps) {
  return (
    <details className={styles.card}>
      <summary className={styles.summary}>
        <span aria-hidden="true" className={styles.icon} />
        <span className={styles.heading}>
          <strong>סרטוני הסבר</strong>
          <span className={styles.subtitle}>צפייה לפי בחירה</span>
        </span>
        <span className={styles.action}>
          <span className={styles.show}>הצגת סרטונים</span>
          <span className={styles.hide}>הסתרת סרטונים</span>
        </span>
      </summary>
      <div className={styles.content}>
        <p>
          מומלץ לקרוא את ההסבר הכתוב בשיעור. הצפייה היא לבחירתכם, אם נוח לכם יותר ללמוד
          מסרטון או אם תרצו לשמוע הסבר נוסף.
        </p>
        <p>
          הסרטונים נוצרו על ידי יוצרים מחוץ לצוות. הם עשויים להרחיב לנושאים מעבר לחומר
          השיעור או לדלג על פרטים שנדרשים בתרגילים. היעזרו בהסבר הכתוב ובהוראות התרגיל
          כדי להשלים את הפרטים האלה.
        </p>
        <p><strong>את התרגילים בשיעור חובה לבצע בכל מקרה.</strong></p>
        {children}
        <ul>
          {hebrew && (
            <li>
              <Link href={hebrew.href}>לצפייה בעברית ב־YouTube</Link>
              {' · '}<bdi>{hebrew.channel}</bdi>
            </li>
          )}
          <li>
            <Link href={english.href}>לצפייה באנגלית ב־YouTube</Link>
            {' · '}<bdi>{english.channel}</bdi>
          </li>
        </ul>
      </div>
    </details>
  );
}
