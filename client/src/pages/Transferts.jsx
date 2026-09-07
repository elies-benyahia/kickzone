// Transferts — page mercato : brèves RSS, stats, liste des transferts (src/data/transfers.js), articles.

import { useState } from 'react';
import { useArticles, useTransferNews } from '../hooks/api';
import ArticleCard from '../components/ArticleCard';
import PlayerCard from '../components/PlayerCard';
import { DEALS } from '../data/transfers';
import styles from './Transferts.module.css';

export default function Transferts() {
  const [search, setSearch] = useState('');                                    // texte de recherche
  const { data: articlesData } = useArticles({ category: 'TRANSFERT', limit: 20 }); // articles de la base
  const { data: news, isLoading: newsLoading } = useTransferNews();            // brèves RSS
  const articles = articlesData?.data ?? [];

  // Filtre la liste des transferts sur le nom du joueur ou d'un des deux clubs.
  const filtered = DEALS.filter(d =>
    d.player.toLowerCase().includes(search.toLowerCase()) ||
    d.from.toLowerCase().includes(search.toLowerCase()) ||
    d.to.toLowerCase().includes(search.toLowerCase())
  );
  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '1.5rem var(--gutter)' }}>

      {/* Ticker RSS */}
      {news && news.length > 0 && (
        <div className={styles.ticker}>
          {news.slice(0, 12).map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className={styles.tickerItem}>
              <strong>{item.source}</strong> — {item.title}
            </a>
          ))}
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.main}>

          {/* Header */}
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.title}>Mercato Été 2026</h1>
              <p className={styles.subtitle}>
                Les transferts officiels du mercato estival · complété par les brèves RSS en direct
              </p>
            </div>
            <input
              className={styles.search}
              placeholder="Chercher joueur, club..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Stats rapides */}
          <div className={styles.stats}>
            <div className={styles.statBox}>
              <span className={styles.statNum}>{DEALS.filter(d => d.official).length}</span>
              <span className={styles.statLabel}>Transferts officiels</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNum}>{DEALS.filter(d => !d.official).length}</span>
              <span className={styles.statLabel}>Rumeurs à suivre</span>
            </div>
            <div className={styles.statBox}>
              {/* Somme des montants : on ignore "Libre" et les montants estimés "~90M€" */}
              <span className={styles.statNum}>
                {DEALS.filter(d => d.official && d.fee !== 'Libre' && !d.fee.includes('~')).reduce((acc, d) => acc + parseInt(d.fee), 0)}M€
              </span>
              <span className={styles.statLabel}>Volume officiel</span>
            </div>
          </div>

          {/* Grille des deals */}
          <div>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>
                Officiels — {filtered.filter(d => d.official).length} transferts
              </h2>
            </div>
            <div className={styles.dealsGrid}>
              {filtered.filter(d => d.official).map((d, i) => (
                <PlayerCard key={i} deal={d} />
              ))}
            </div>
          </div>

          {filtered.filter(d => !d.official).length > 0 && (
            <div>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>
                  Rumeurs — {filtered.filter(d => !d.official).length} dossiers
                </h2>
              </div>
              <div className={styles.dealsGrid}>
                {filtered.filter(d => !d.official).map((d, i) => (
                  <PlayerCard key={i} deal={d} />
                ))}
              </div>
            </div>
          )}

          {/* Articles */}
          {filteredArticles.length > 0 && (
            <div>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Articles de la rédaction</h2>
              </div>
              <div className={styles.grid}>
                {filteredArticles.map(a => <ArticleCard key={a.id} article={a} />)}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Brèves mercato</h2>
          {newsLoading && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chargement...</p>}
          {(news ?? []).map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className={styles.newsItem}>
              <div className={styles.newsMeta}>
                <span className={styles.newsSource}>{item.source}</span>
                <span className={styles.newsDate}>{new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
              </div>
              <p className={styles.newsTitle}>{item.title}</p>
            </a>
          ))}
          {!newsLoading && (!news || news.length === 0) && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Aucune actualité disponible.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
