import { Link } from 'react-router-dom';
import { useFixturesToday, useArticles, useNewsLatest, usePronostics } from '../hooks/api';
import MatchCard from '../components/MatchCard';
import ArticleCard from '../components/ArticleCard';
import PronoCard from '../components/PronoCard';
import LiveBadge from '../components/LiveBadge';
import styles from './Home.module.css';
import { SIDEBAR_DEALS, FALLBACK_ARTICLES } from '../data/homeContent';

const LIVE_STATUSES = ['1H','2H','HT','ET','P','LIVE','INT'];

/* Ligues autorisées uniquement */
const ALLOWED_LEAGUES = new Set([
  2,   // UEFA Champions League
  3,   // UEFA Europa League
  848, // UEFA Conference League
  5,   // UEFA Nations League
  6,   // World: International Friendlies (majeures)
  39,  // Premier League
  40,  // Championship
  61,  // Ligue 1
  62,  // Ligue 2
  78,  // Bundesliga
  79,  // 2. Bundesliga
  135, // Serie A
  136, // Serie B
  140, // La Liga
  141, // La Liga 2
  88,  // Eredivisie
  94,  // Primeira Liga
  144, // Belgian Pro League
  207, // Super League Greece
  253, // MLS
  262, // Liga MX
  4,   // Euro
  9,   // Copa America
  13,  // AFC Asian Cup
  34,  // World Cup Qualifying
  32,  // World Cup Qualifying Europe
  33,  // World Cup Qualifying South America
]);

function LeftSidebar({ fixtures }) {
  if (!fixtures) return <SidebarSkeleton />;

  const important = fixtures.filter(f => ALLOWED_LEAGUES.has(f.league.id));

  const grouped = {};
  important.forEach(f => {
    const name = f.league.name;
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(f);
  });

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Matchs du jour</h2>
        <Link to="/matches" className={styles.seeAll}>Voir tout</Link>
      </div>
      {Object.entries(grouped).map(([league, matches]) => (
        <div key={league} className={styles.leagueGroup}>
          <div className={styles.leagueName}>
            <img src={matches[0].league.logo} alt="" width={14} height={14} onError={e=>e.target.style.display='none'} />
            {league}
          </div>
          {matches.map(f => <MatchCard key={f.fixture.id} fixture={f} />)}
        </div>
      ))}
      {Object.keys(grouped).length === 0 && (
        <p className={styles.empty}>Aucun match majeur aujourd'hui.</p>
      )}
    </aside>
  );
}

function RightSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Mercato 2026</h2>
        <Link to="/transferts" className={styles.seeAll}>Tout voir</Link>
      </div>
      {SIDEBAR_DEALS.map((d, i) => (
        <div key={i} className={styles.transferItem}>
          <div className={styles.transferInfo}>
            <span className={styles.transferPlayer}>{d.player}</span>
            <span className={styles.transferArrow}>{d.from} → {d.to}</span>
          </div>
          <span className={`${styles.transferFee} ${d.official ? styles.feeOfficial : styles.feePending}`}>{d.fee}</span>
        </div>
      ))}
    </aside>
  );
}

function SidebarSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />
      ))}
    </div>
  );
}

function TopNewsHero({ articles }) {
  if (!articles || articles.length === 0) return null;
  const featured = articles[0];
  const side = articles[1];

  const HeroLink = ({ article, children, className }) =>
    article.slug
      ? <Link to={`/article/${article.slug}`} className={className}>{children}</Link>
      : <a href={article.link} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;

  return (
    <div className={styles.topNewsHero}>
      <HeroLink article={featured} className={styles.heroArticle}>
        {featured.imageUrl && (
          <img src={featured.imageUrl} alt={featured.title} className={styles.heroImg}
            onError={e => e.target.style.display='none'} />
        )}
        {!featured.imageUrl && <div className={styles.heroImgPlaceholder} />}
        <div className={styles.heroOverlay}>
          <div className={styles.heroMeta}>
            <span className={styles.heroSource}>{featured.sourceName || featured.author || 'KickZone'}</span>
          </div>
          <h2 className={styles.heroTitle}>{featured.title}</h2>
        </div>
      </HeroLink>

      {side && (
        <HeroLink article={side} className={styles.sideArticle}>
          {side.imageUrl && (
            <img src={side.imageUrl} alt={side.title} className={styles.sideImg}
              onError={e => e.target.style.display='none'} />
          )}
          {!side.imageUrl && <div className={styles.sideImgPlaceholder} />}
          <div className={styles.sideBody}>
            <span className={styles.heroSource}>{side.sourceName || side.author || 'KickZone'}</span>
            <h3 className={styles.sideTitle}>{side.title}</h3>
          </div>
        </HeroLink>
      )}
    </div>
  );
}

export default function Home() {
  const { data: fixtures }  = useFixturesToday();
  const { data: newsItems, isLoading: newsLoading } = useNewsLatest(20);
  const { data: articlesData } = useArticles({ limit: 8 });
  const { data: pronostics }   = usePronostics();

  const rssNews    = newsItems ?? [];
  const dbArticles = articlesData?.data ?? [];
  const fetched    = [...rssNews, ...dbArticles].slice(0, 20);
  const allArticles = !newsLoading && fetched.length === 0 ? FALLBACK_ARTICLES : fetched;

  const heroArticles = allArticles.slice(0, 2);
  const gridArticles = allArticles.slice(2, 14);

  return (
    <div className={styles.layout}>
      <LeftSidebar fixtures={fixtures} />

      <main className={styles.main}>
        {/* Top News Hero */}
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

        {/* Grille d'actualités 4 colonnes */}
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

        {/* Pronos */}
        {pronostics && pronostics.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Derniers pronos</h2>
              <Link to="/pronos" className={styles.seeAll}>Tout voir</Link>
            </div>
            <div className={styles.pronoGrid}>
              {pronostics.slice(0, 2).map(p => <PronoCard key={p.id} prono={p} />)}
            </div>
          </section>
        )}
      </main>

      <RightSidebar />
    </div>
  );
}

