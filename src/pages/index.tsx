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
            <span className={styles.badge}>Fast</span>
            <span className={styles.badge}>Searchable</span>
            <span className={styles.badge}>Team-friendly</span>
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
              Quick start
            </Heading>
            <p className={styles.sectionSubtitle}>
              Jump into the docs, browse API references, or find team guides.
            </p>
          </div>

          <div className={styles.grid}>
            <FeatureCard
              title="Documentation"
              description="Guides, setup steps, conventions, and workflows in one place."
              href="/docs/intro"
              cta="Go to docs →"
            />
            <FeatureCard
              title="Javadoc / API"
              description="Browse generated API docs for DELib and robot code."
              href="/javadoc"
              cta="Open Javadoc →"
            />
            <FeatureCard
              title="Tools & Tips"
              description="Commands, scripts, and debugging notes for faster iteration."
              href="/docs/category/tools"
              cta="See tools →"
            />
          </div>
        </div>
      </main>
    </Layout>
  );
}