import { Link } from 'react-router-dom';
import styles from './ArticleCard.module.css';

const CATEGORY_COLOR = {
  TRANSFERT: '#f59e0b',
  ACTU: '#8b5cf6',
  ANALYSE: '#1a56db',
  INTERVIEW: '#16a34a',
  RESULTATS: '#ef4444',
};

const relativeDate = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d);
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'il y a moins d\'1h';
  if (h < 24) return `il y a ${h}h`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'hier';
  if (days < 30) return `il y a ${days} j`;
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const readTime = (a) => {
  const words = ((a.content ?? '') + (a.summary ?? '')).split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min`;
};

function CardInner({ article }) {
  const catColor = CATEGORY_COLOR[article.category] ?? '#1a56db';
  const isRss = !article.slug;

  return (
    <>
      <div className={styles.imgWrap}>
        {article.imageUrl && (
          <img src={article.imageUrl} alt={article.title} className={styles.img} loading="lazy"
            onError={e => { e.target.style.display = 'none'; }} />
        )}
        {!article.imageUrl && (
          <div className={styles.imgPlaceholder}
            style={{ background: `linear-gradient(135deg, ${catColor}22 0%, ${catColor}08 100%)` }} />
        )}
        {article.category && (
          <span className={styles.catBadge} style={{ background: catColor }}>
            {article.category}
          </span>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{article.title}</h3>
        <div className={styles.meta}>
          {article.sourceLogo && (
            <img src={article.sourceLogo} alt="" className={styles.sourceLogo}
              onError={e => e.target.style.display = 'none'} />
          )}
          {(article.sourceName || article.author) && (
            <span className={styles.sourceName}>{article.sourceName || article.author}</span>
          )}
          {(article.publishedAt || article.createdAt) && (
            <>
              <span className={styles.sep}>·</span>
              <span className={styles.date}>{relativeDate(article.publishedAt || article.createdAt)}</span>
            </>
          )}
          {!isRss && <span className={styles.readTime}>{readTime(article)}</span>}
          {article.views > 0 && (
            <span className={styles.views}>{article.views >= 1000 ? `${(article.views / 1000).toFixed(1)}k` : article.views} vues</span>
          )}
        </div>
      </div>
    </>
  );
}

export default function ArticleCard({ article }) {
  if (article.slug) {
    return (
      <Link to={`/article/${article.slug}`} className={styles.card}>
        <CardInner article={article} />
      </Link>
    );
  }

  return (
    <a href={article.link} target="_blank" rel="noopener noreferrer" className={styles.card}>
      <CardInner article={article} />
    </a>
  );
}
