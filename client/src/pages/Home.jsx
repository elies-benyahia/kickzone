// Home — accueil 3 colonnes : matchs du jour (gauche), actus + pronos (centre), mercato (droite).
// Les 3 colonnes sont des composants dans components/home/.

import { Link } from 'react-router-dom';
import { useFixturesToday, useArticles, useNewsLatest, usePronostics } from '../hooks/api';
import ArticleCard from '../components/ArticleCard';
import PronoCard from '../components/PronoCard';
import LeftSidebar from '../components/home/LeftSidebar';
import RightSidebar from '../components/home/RightSidebar';
import TopNewsHero from '../components/home/TopNewsHero';
import { FALLBACK_ARTICLES } from '../data/homeContent';
import styles from './Home.module.css';

export default function Home() {
  // 4 sources de données chargées en parallèle par React Query.
  const { data: fixtures } = useFixturesToday();
  const { data: newsItems, isLoading: newsLoading } = useNewsLatest(20);
  const { data: articlesData } = useArticles({ limit: 8 });
  const { data: pronostics } = usePronostics();

  // Actus RSS + articles de la base ; si tout est vide, articles de secours.
  const fetched = [...(newsItems ?? []), ...(articlesData?.data ?? [])].slice(0, 20);
  const allArticles = !newsLoading && fetched.length === 0 ? FALLBACK_ARTICLES : fetched;

  const heroArticles = allArticles.slice(0, 2);   // bloc "Top News"
  const gridArticles = allArticles.slice(2, 14);  // grille en dessous

  return (
    <div className={styles.layout}>
      <LeftSidebar fixtures={fixtures} />

      <main className={styles.main}>
        {/* Mise en avant : Ligue des Champions */}
        <Link to="/ligue-des-champions" className={styles.uclBanner}>
          <img src="/images/ucl-logo.jpg" alt="Ligue des Champions" className={styles.uclLogo} />
          <div className={styles.uclText}>
            <span className={styles.uclKicker}>Nouveau · Phase de ligue 2026/2027</span>
            <span className={styles.uclTitle}>Ligue des Champions : classement des 36 & calendrier des 8 journées</span>
          </div>
          <span className={styles.uclCta}>Voir →</span>
        </Link>

        {/* Top News */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Top News</h2>
            <span className={styles.sectionLabel}>Football France & Monde</span>
          </div>
          {newsLoading ? (
            <div className={styles.topNewsHero}>
              <div className="skeleton" style={{ flex: '0 0 66%', height: 320, borderRadius: 8 }} />
              <div className="skeleton" style={{ flex: 1, height: 320, borderRadius: 8 }} />
            </div>
          ) : (
            <TopNewsHero articles={heroArticles} />
          )}
        </section>

        {/* Grille d'actualités */}
        {gridArticles.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Actualités</h2>
              <Link to="/actu" className={styles.seeAll}>Tout voir</Link>
            </div>
            <div className={styles.newsGrid}>
              {gridArticles.map((a, i) => <ArticleCard key={a.id || i} article={a} />)}
            </div>
          </section>
        )}

        {/* Derniers pronos */}
        {pronostics && pronostics.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Derniers pronos</h2>
              <Link to="/pronos" className={styles.seeAll}>Tout voir</Link>
            </div>
            <div className={styles.pronoGrid}>
              {pronostics.slice(0, 2).map((p) => <PronoCard key={p.id} prono={p} />)}
            </div>
          </section>
        )}
      </main>

      <RightSidebar />
    </div>
  );
}
