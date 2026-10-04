import Heading from '@theme/Heading';

import styles from './styles.module.css';
import Link from '@docusaurus/Link';

type FeatureCardProps = {
    title: string; 
    description: string; 
    href?: string; 
    cta?: string
}

export default function FeatureCard({title, description, href, cta}: FeatureCardProps) {
    const CardInner = (
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <Heading as="h3" className={styles.cardTitle}>
            {title}
          </Heading>
        </div>
        <p className={styles.cardDesc}>{description}</p>
        {href && (
          <div className={styles.cardFooter}>
            <span className={styles.cardCta}>{cta ?? "למידע נוסף ←"}</span>
          </div>
        )}
      </div>
    );
  
    return href ? (
      <Link className={styles.cardLink} to={href}>
        {CardInner}
      </Link>
    ) : (
      CardInner
    );
}
