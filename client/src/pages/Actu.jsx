import { useState } from 'react';
import { useArticles } from '../hooks/api';
import ArticleCard from '../components/ArticleCard';
import styles from './Actu.module.css';

const FILTERS = [
  { key: null, label: 'Tous' }, { key:'TRANSFERT', label:'Transferts' },
  { key:'ANALYSE', label:'Analyses' }, { key:'INTERVIEW', label:'Interviews' }, { key:'RESULTATS', label:'Résultats' },
];

export default function Actu() {
  const [cat, setCat] = useState(null);
  const { data: articlesData, isLoading } = useArticles({ category: cat, limit: 30 });
  const articles = articlesData?.data ?? [];

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
      <div className={styles.grid}>
        {articles.map(a => <ArticleCard key={a.id} article={a} />)}
      </div>
    </div>
  );
}
