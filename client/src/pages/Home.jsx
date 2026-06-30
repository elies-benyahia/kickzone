import { Link } from 'react-router-dom';
import { useFixturesToday, useWorldCupFixtures, useArticles, useNewsLatest, usePronostics } from '../hooks/api';
import MatchCard from '../components/MatchCard';
import ArticleCard from '../components/ArticleCard';
import PronoCard from '../components/PronoCard';
import LiveBadge from '../components/LiveBadge';
import styles from './Home.module.css';

const LIVE_STATUSES = ['1H','2H','HT','ET','P','LIVE','INT'];

function WorldCupSection() {
  const { data: wcFixtures, isLoading } = useWorldCupFixtures();
  if (isLoading) return null;
  if (!wcFixtures || wcFixtures.length === 0) return null;

  const liveMatches = wcFixtures.filter(f => LIVE_STATUSES.includes(f.fixture.status.short));

  return (
    <section className={styles.wcSection}>
      <div className={styles.wcHeader}>
        <img src="https://media.api-sports.io/football/leagues/1.png" alt="" width={20} height={20} onError={e=>e.target.style.display='none'} />
        <span className={styles.wcTitle}>Coupe du Monde 2026</span>
        {liveMatches.length > 0 && (
          <span className={styles.wcLiveBadge}><span className="live-dot" /> {liveMatches.length} EN DIRECT</span>
        )}
        <Link to="/coupe-du-monde" className={styles.wcSeeAll}>Voir tout</Link>
      </div>
      <div className={styles.wcGrid}>
        {wcFixtures.slice(0, 4).map(f => <MatchCard key={f.fixture.id} fixture={f} />)}
      </div>
    </section>
  );
}

/* Ligues autorisées uniquement */
const ALLOWED_LEAGUES = new Set([
  1,   // FIFA World Cup
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

  const sorted = [...important].sort((a, b) => {
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

const SIDEBAR_DEALS = [
  { player: 'Anthony Gordon',  from: 'Newcastle', to: 'Barcelone',  fee: '80M€',   official: true },
  { player: 'Marc Cucurella',  from: 'Chelsea',   to: 'Real Madrid',fee: '55M€',   official: true },
  { player: 'Bernardo Silva',  from: 'Man City',  to: 'Real Madrid',fee: 'Libre',  official: true },
  { player: 'J. Jacquet',      from: 'Rennes',    to: 'Liverpool',  fee: '60M€',   official: true },
  { player: 'G. Quenda',       from: 'Sporting',  to: 'Chelsea',    fee: '52M€',   official: true },
  { player: 'Piero Hincapié',  from: 'Leverkusen',to: 'Arsenal',    fee: '35M€',   official: true },
  { player: 'Yan Diomandé',    from: 'Leipzig',   to: 'PSG',        fee: '~100M€', official: false },
];

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

const FALLBACK_ARTICLES = [
  { id: 'f1', title: 'Coupe du Monde 2026 : le tournoi bat des records d\'audience à travers le monde', link: 'https://www.lequipe.fr', sourceName: "L'Équipe", imageUrl: null, publishedAt: new Date() },
  { id: 'f2', title: 'Mercato : les plus grands transferts de l\'été 2026 décryptés', link: 'https://www.footmercato.net', sourceName: 'Foot Mercato', imageUrl: null, publishedAt: new Date() },
  { id: 'f3', title: 'Équipe de France : les convoqués pour le Mondial et les enjeux tactiques', link: 'https://rmcsport.bfmtv.com', sourceName: 'RMC Sport', imageUrl: null, publishedAt: new Date() },
  { id: 'f4', title: 'Champions League : le tirage au sort de la saison 2026-27 dévoilé', link: 'https://www.eurosport.fr', sourceName: 'Eurosport', imageUrl: null, publishedAt: new Date() },
];

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
        {/* Coupe du Monde */}
        <WorldCupSection />

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

