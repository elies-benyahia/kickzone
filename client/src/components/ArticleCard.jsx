import { Link } from 'react-router-dom';
import styles from './ArticleCard.module.css';

const CATEGORY_LABELS = { TRANSFERT:'Transfert', ACTU:'Actu', ANALYSE:'Analyse', INTERVIEW:'Interview', RESULTATS:'Résultats' };
const CATEGORY_CLASS  = { TRANSFERT:'badge-orange', ACTU:'badge-blue', ANALYSE:'badge-gray', INTERVIEW:'badge-gray', RESULTATS:'badge-green' };

export default function ArticleCard({ article }) {
  const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR', { day:'numeric', month:'long' }) : '';

  return (
    <Link to={`/article/${article.slug}`} className={styles.card}>
      <div className={styles.img} style={{ backgroundImage: article.imageUrl ? `url(${article.imageUrl})` : undefined }}>
        <span className={`badge ${CATEGORY_CLASS[article.category] || 'badge-gray'}`}>
          {CATEGORY_LABELS[article.category] || article.category}
        </span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{article.title}</h3>
        {article.summary && <p className={styles.summary}>{article.summary}</p>}
        <span className={styles.date}>{date}</span>
      </div>
    </Link>
  );
}
