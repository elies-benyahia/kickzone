import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFixturesToday, useArticles, useStandings, useLatestTransfers, usePronostics } from '../hooks/api';
import MatchCard from '../components/MatchCard';
import ArticleCard from '../components/ArticleCard';
import StandingsTable from '../components/StandingsTable';
import PronoCard from '../components/PronoCard';
import styles from './Home.module.css';

function LeftSidebar({ fixtures }) {
  if (!fixtures) return <SidebarSkeleton />;
  const sorted = [...fixtures].sort((a, b) => {
    if (a.league.id === 1) return -1;
    if (b.league.id === 1) return 1;
    return 0;
  });
  const grouped = {};
  sorted.forEach(f => {
    const name = f.league.name;
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(f);
  });
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.sidebarTitle}>Matchs du jour</h2>
      {Object.entries(grouped).map(([league, matches]) => (
        <div key={league} className={styles.leagueGroup}>
          <div className={styles.leagueName}>
            <img src={matches[0].league.logo} alt="" width={16} height={16} onError={e=>e.target.style.display='none'} />
            {league}
          </div>
          {matches.map(f => <MatchCard key={f.fixture.id} fixture={f} />)}
        </div>
      ))}
      {Object.keys(grouped).length === 0 && <p className={styles.empty}>Aucun match aujourd'hui.</p>}
    </aside>
  );
}

function RightSidebar({ transfers }) {
  const [activeLeague, setActiveLeague] = useState(61);
  const { data: standings } = useStandings(activeLeague);
  const tabs = [{ id:61, label:'L1' }, { id:39, label:'PL' }, { id:140, label:'Liga' }];

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.sidebarTitle}>Classements</h2>
      <div className={styles.tabs}>
        {tabs.map(t => (
          <button key={t.id} className={`${styles.tab} ${activeLeague === t.id ? styles.tabActive : ''}`} onClick={() => setActiveLeague(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <StandingsTable standings={standings} compact />
      <Link to="/classements" className={styles.seeAll}>Voir le classement complet →</Link>

      <h2 className={styles.sidebarTitle} style={{marginTop:'1.5rem'}}>Transferts chauds 🔥</h2>
      {transfers?.slice(0, 5).map((t, i) => (
        <div key={i} className={styles.transferItem}>
          <span className={styles.transferPlayer}>{t.player?.name ?? 'Joueur'}</span>
          <span className={styles.transferArrow}>{t.transfers?.[0]?.teams?.in?.name ?? '?'}</span>
        </div>
      ))}
    </aside>
  );
}

function SidebarSkeleton() {
  return <div style={{display:'flex',flexDirection:'column',gap:8}}>{Array.from({length:6},(_,i)=><div key={i} style={{height:50,background:'#e5e7eb',borderRadius:8,animation:'pulse 1.5s infinite'}}/>)}</div>;
}

export default function Home() {
  const { data: fixtures } = useFixturesToday();
  const { data: articlesData } = useArticles({ limit: 6 });
  const { data: transfers } = useLatestTransfers();
  const { data: pronostics } = usePronostics();
  const articles = articlesData?.data ?? [];

  return (
    <div className={styles.layout}>
      <LeftSidebar fixtures={fixtures} />

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>KickZone</h1>
          <p className={styles.heroSub}>Toute l'actualité football en direct</p>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>À la une</h2>
            <Link to="/actu" className={styles.seeAll}>Voir tout</Link>
          </div>
          {articles.length > 0 ? (
            <div className={styles.featuredGrid}>
              <ArticleCard article={articles[0]} />
              <div className={styles.featuredSide}>
                {articles.slice(1, 3).map(a => <ArticleCard key={a.id} article={a} />)}
              </div>
            </div>
          ) : <EmptyArticles />}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Derniers transferts</h2>
            <Link to="/transferts" className={styles.seeAll}>Voir tout</Link>
          </div>
          <div className={styles.transferList}>
            {(transfers ?? []).slice(0, 5).map((t, i) => {
              const tr = t.transfers?.[0];
              return (
                <div key={i} className={styles.transferRow}>
                  <span className={styles.tPlayer}>{t.player?.name ?? 'Joueur'}</span>
                  <span className={styles.tFrom}>{tr?.teams?.out?.name ?? '?'}</span>
                  <span className={styles.tArrow}>→</span>
                  <span className={styles.tTo}>{tr?.teams?.in?.name ?? '?'}</span>
                  {tr?.fee && <span className={styles.tFee}>{tr.fee}</span>}
                </div>
              );
            })}
            {(!transfers || transfers.length === 0) && <p className={styles.empty}>Aucun transfert récent.</p>}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Mes pronos du jour</h2>
            <Link to="/pronos" className={styles.seeAll}>Voir tout</Link>
          </div>
          <div className={styles.pronoGrid}>
            {(pronostics ?? []).slice(0, 3).map(p => <PronoCard key={p.id} prono={p} />)}
            {(!pronostics || pronostics.length === 0) && <p className={styles.empty}>Aucun pronostic pour le moment.</p>}
          </div>
        </section>
      </main>

      <RightSidebar transfers={transfers} />
    </div>
  );
}

function EmptyArticles() {
  return (
    <div style={{background:'var(--bg-card)',borderRadius:'var(--radius)',padding:'2rem',textAlign:'center',color:'var(--text-muted)'}}>
      Aucun article publié pour le moment.
    </div>
  );
}
