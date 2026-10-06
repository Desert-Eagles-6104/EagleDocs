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

          <div className={styles.heroMeta}>
            <span className={styles.badge}>מהיר</span>
            <span className={styles.badge}>כולל חיפוש</span>
            <span className={styles.badge}>מותאם לעבודה קבוצתית</span>
          </div>
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
              קראו את התיעוד, עיינו בתיעוד ה־API או מצאו מדריכים לקבוצה.
            </p>
          </div>

          <div className={styles.grid}>
            {/* <FeatureCard
              title="תיעוד"
              description="מדריכים, הוראות התקנה, מוסכמות ותהליכי עבודה במקום אחד."
              href="/docs/intro"
              cta="לתיעוד ←"
            />
            <FeatureCard
              title="Javadoc / API"
              description="עיינו בתיעוד ה־API שנוצר אוטומטית עבור DELib וקוד הרובוט."
              href="/javadoc"
              cta="לפתיחת Javadoc ←"
            />
            <FeatureCard
              title="כלים וטיפים"
              description="פקודות, סקריפטים וטיפים לניפוי שגיאות שיעזרו לכם להתקדם מהר יותר."
              href="/docs/category/tools"
              cta="לכלים ←"
            /> */}
          </div>
        </div>
      </main>
    </Layout>
  );
}
