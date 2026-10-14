import type {ReactNode} from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';
import FeatureCard from '../components/HomepageFeatures/FeatureCard';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx("hero", styles.heroBanner)}>
      <div className={clsx("container", styles.heroContainer)}>
        <div className={styles.heroContent}>
          <Heading as="h1" className={styles.heroTitle}>
            {siteConfig.title}
          </Heading>
          <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>

        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HomepageHeader />

      <main className={styles.main}>
        <div className={clsx("container", styles.section)}>
          <div className={styles.sectionHeader}>
            <Heading as="h2" className={styles.sectionTitle}>
              מתחילים כאן
            </Heading>
            <p className={styles.sectionSubtitle}>
              כל מה שצריך כדי להתחיל לתכנת, להכיר את קוד הרובוט
              ולהתקדם בצוות התוכנה.
            </p>
          </div>

          <div className={styles.grid}>
            <FeatureCard
            title="לימוד Java"
            description="מתחילים כאן: מכינים את סביבת העבודה, יוצרים תוכנית ראשונה ולומדים Java דרך תרגילים מעולם הרובוטיקה."
            href="/docs/training/java"
            cta="מתחילים כאן ←"
          />

            <FeatureCard
              title="תיעוד הקוד (Javadoc)"
              description="תיעוד המחלקות, המתודות והמערכות של DELib וקוד הרובוט, שנוצר ישירות מקוד המקור."
              href="pathname:///javadoc/"
              cta="לצפייה בתיעוד ←"
            />

            <FeatureCard
              title="קוד הרובוט"
              description="היכרות עם מבנה הפרויקט, מערכות הרובוט והאופן שבו הקוד שלנו עובד."
              href="/docs/training/robot"
              cta="להיכרות עם הרובוט ←"
            />
          </div>
        </div>
      </main>
    </Layout>
  );
}

//http://localhost:3000/docs/javadoc/
//http://localhost:3000/docs/javadoc/