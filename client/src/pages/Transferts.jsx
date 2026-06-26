import { useState } from 'react';
import { useArticles, useTransferNews } from '../hooks/api';
import ArticleCard from '../components/ArticleCard';
import styles from './Transferts.module.css';

export default function Transferts() {
  const [search, setSearch] = useState('');
  const { data: articlesData } = useArticles({ category: 'TRANSFERT', limit: 20 });
  const { data: news, isLoading: newsLoading } = useTransferNews();
  const articles = articlesData?.data ?? [];
  const filtered = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container" style={{ padding: '1.5rem var(--gutter)' }}>

      {/* Ticker RSS */}
      {news && news.length > 0 && (
        <div className={styles.ticker}>
          {news.slice(0, 12).map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className={styles.tickerItem}>
              🔴 <strong>{item.source}</strong> — {item.title}
            </a>
          ))}
        </div>
      )}

      <div className={styles.layout}>

        {/* Colonne principale : articles du site */}
        <div className={styles.main}>
          <div className={styles.header}>
            <h1 className={styles.title}>Transferts</h1>
            <input
              className={styles.search}
              placeholder="Rechercher un joueur ou club..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.grid}>
            {filtered.length > 0
              ? filtered.map(a => <ArticleCard key={a.id} article={a} />)
              : <p className={styles.empty}>Aucun article transfert trouvé.</p>
            }
          </div>
        </div>

        {/* Sidebar : actualités RSS */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Dernières infos</h2>
          {newsLoading && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chargement...</p>}
          {(news ?? []).map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className={styles.newsItem}>
              <div className={styles.newsMeta}>
                <span className={styles.newsSource}>{item.source}</span>
                <span className={styles.newsDate}>{new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
              </div>
              <p className={styles.newsTitle}>{item.title}</p>
              {item.summary && <p className={styles.newsSummary}>{item.summary.slice(0, 100)}...</p>}
            </a>
          ))}
          {!newsLoading && (!news || news.length === 0) && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Aucune actualité disponible pour le moment.</p>
          )}
        </aside>

      </div>
    </div>
  );
}
