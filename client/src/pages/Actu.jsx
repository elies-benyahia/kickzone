import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useArticles } from '../hooks/api';
import ArticleCard from '../components/ArticleCard';
import styles from './Actu.module.css';

const FILTERS = [
  { key: null,        label: 'Tous' },
  { key: 'TRANSFERT', label: 'Transferts' },
  { key: 'ANALYSE',   label: 'Analyses' },
  { key: 'INTERVIEW', label: 'Interviews' },
  { key: 'RESULTATS', label: 'Résultats' },
  { key: 'ACTU',      label: 'Actu' },
];

const CATEGORY_COLOR = {
  TRANSFERT:'var(--orange)', ANALYSE:'var(--blue)', ACTU:'#8b5cf6',
  INTERVIEW:'var(--green-live)', RESULTATS:'#dc2626',
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
  return new Date(d).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' });
};

const readTime = (a) => {
  const words = ((a.content ?? '') + (a.summary ?? '')).split(/\s+/).length;
  return `${Math.max(1, Math.round(words/200))} min`;
};

function FeaturedCard({ article }) {
  const color = CATEGORY_COLOR[article.category] ?? 'var(--blue)';
  return (
    <Link to={`/article/${article.slug}`} className={styles.featured}>
      <div className={styles.featuredImg} style={{
        backgroundImage: article.imageUrl ? `url(${article.imageUrl})` : undefined,
        background: article.imageUrl ? undefined : `linear-gradient(135deg, ${color}33, ${color}11)`,
      }}>
        <div className={styles.featuredOverlay} />
        <div className={styles.featuredContent}>
          <span className={styles.catBadge} style={{background:color}}>{article.category}</span>
          <h2 className={styles.featuredTitle}>{article.title}</h2>
          {article.summary && <p className={styles.featuredSummary}>{article.summary}</p>}
          <div className={styles.featuredMeta}>
            {article.author && <span>{article.author}</span>}
            <span>{relativeDate(article.publishedAt)}</span>
            <span>{readTime(article)}</span>
            {article.views > 0 && <span>👁 {article.views >= 1000 ? `${(article.views/1000).toFixed(1)}k` : article.views}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Actu() {
  const [cat, setCat] = useState(null);
  const { data: articlesData, isLoading } = useArticles({ category: cat, limit: 30 });
  const articles = articlesData?.data ?? [];
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="container" style={{padding:'1.5rem var(--gutter)'}}>
      <h1 className={styles.title}>Actualités</h1>
      <div className={styles.filters}>
        {FILTERS.map(f => (
          <button key={f.key ?? 'all'} className={`${styles.filter} ${cat === f.key ? styles.filterActive : ''}`} onClick={() => setCat(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <div className={styles.empty}>Chargement...</div>}
      {!isLoading && articles.length === 0 && <div className={styles.empty}>Aucun article dans cette catégorie.</div>}

      {featured && !cat && <FeaturedCard article={featured} />}

      <div className={styles.grid}>
        {(cat ? articles : rest).map(a => <ArticleCard key={a.id} article={a} />)}
      </div>
    </div>
  );
}
