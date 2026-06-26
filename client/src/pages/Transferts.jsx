import { useState } from 'react';
import { useArticles, useLatestTransfers } from '../hooks/api';
import ArticleCard from '../components/ArticleCard';
import styles from './Transferts.module.css';

export default function Transferts() {
  const [search, setSearch] = useState('');
  const { data: articlesData } = useArticles({ category:'TRANSFERT', limit:20 });
  const { data: transfers } = useLatestTransfers();
  const articles = articlesData?.data ?? [];
  const filtered = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container" style={{padding:'1.5rem var(--gutter)'}}>
      <div className={styles.ticker}>
        {(transfers ?? []).slice(0, 8).map((t, i) => {
          const tr = t.transfers?.[0];
          return (
            <span key={i} className={styles.tickerItem}>
              🔴 <strong>{t.player?.name}</strong> → {tr?.teams?.in?.name} {tr?.fee ? `pour ${tr.fee}` : ''}
            </span>
          );
        })}
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Transferts</h1>
        <input className={styles.search} placeholder="Rechercher un joueur ou club..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className={styles.grid}>
        {filtered.length > 0
          ? filtered.map(a => <ArticleCard key={a.id} article={a} />)
          : <p className={styles.empty}>Aucun article transfert trouvé.</p>
        }
      </div>
    </div>
  );
}
