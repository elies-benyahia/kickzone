import { Link } from 'react-router-dom';
import styles from './ArticleCard.module.css';

const CATEGORY_COLOR = {
  TRANSFERT: 'var(--orange)', ACTU: '#8b5cf6', ANALYSE: 'var(--blue)',
  INTERVIEW: 'var(--green-live)', RESULTATS: '#dc2626',
};
const CATEGORY_LABEL = {
  TRANSFERT:'Transfert', ACTU:'Actu', ANALYSE:'Analyse', INTERVIEW:'Interview', RESULTATS:'Résultats',
};

const relativeDate = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d);
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'il y a moins d\'1h';
  if (h < 24) return `il y a ${h}h`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'hier';
  if (days < 30) return `il y a ${days} jours`;
  return new Date(d).toLocaleDateString('fr-FR', { day:'numeric', month:'short' });
};

const readTime = (a) => {
  const words = ((a.content ?? '') + (a.summary ?? '')).split(/\s+/).length;
  return `${Math.max(1, Math.round(words/200))} min`;
};

export default function ArticleCard({ article }) {
  const color = CATEGORY_COLOR[article.category] ?? 'var(--blue)';
  return (
    <Link to={`/article/${article.slug}`} className={styles.card}>
      <div className={styles.img} style={{
        backgroundImage: article.imageUrl ? `url(${article.imageUrl})` : undefined,
        background: article.imageUrl ? undefined : `linear-gradient(135deg, ${color}22, ${color}11)`,
      }}>
        <span className={styles.catBadge} style={{background:color}}>
          {CATEGORY_LABEL[article.category] ?? article.category}
        </span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{article.title}</h3>
        {article.summary && <p className={styles.summary}>{article.summary}</p>}
        <div className={styles.footer}>
          <span className={styles.date}>{relativeDate(article.publishedAt)}</span>
          <span className={styles.readTime}>{readTime(article)}</span>
          {article.views > 0 && <span className={styles.views}>👁 {article.views >= 1000 ? `${(article.views/1000).toFixed(1)}k` : article.views}</span>}
        </div>
      </div>
    </Link>
  );
}
