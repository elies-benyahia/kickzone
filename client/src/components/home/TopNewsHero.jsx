// TopNewsHero (accueil) — 1 grande actu + 1 actu secondaire.

import { Link } from 'react-router-dom';
import styles from '../../pages/Home.module.css';

// Lien interne si l'article vient de notre base (slug), lien externe sinon.
const HeroLink = ({ article, children, className }) =>
  article.slug
    ? <Link to={`/article/${article.slug}`} className={className}>{children}</Link>
    : <a href={article.link} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;

export default function TopNewsHero({ articles }) {
  if (!articles || articles.length === 0) return null;
  const [featured, side] = articles;

  return (
    <div className={styles.topNewsHero}>
      <HeroLink article={featured} className={styles.heroArticle}>
        {featured.imageUrl
          ? <img src={featured.imageUrl} alt={featured.title} className={styles.heroImg} onError={(e) => (e.target.style.display = 'none')} />
          : <div className={styles.heroImgPlaceholder} />}
        <div className={styles.heroOverlay}>
          <div className={styles.heroMeta}>
            <span className={styles.heroSource}>{featured.sourceName || featured.author || 'KickZone'}</span>
          </div>
          <h2 className={styles.heroTitle}>{featured.title}</h2>
        </div>
      </HeroLink>

      {side && (
        <HeroLink article={side} className={styles.sideArticle}>
          {side.imageUrl
            ? <img src={side.imageUrl} alt={side.title} className={styles.sideImg} onError={(e) => (e.target.style.display = 'none')} />
            : <div className={styles.sideImgPlaceholder} />}
          <div className={styles.sideBody}>
            <span className={styles.heroSource}>{side.sourceName || side.author || 'KickZone'}</span>
            <h3 className={styles.sideTitle}>{side.title}</h3>
          </div>
        </HeroLink>
      )}
    </div>
  );
}
