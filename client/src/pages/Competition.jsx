import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStandings, useFixturesByDate, useNewsLatest } from '../hooks/api';
import MatchCard from '../components/MatchCard';
import ArticleCard from '../components/ArticleCard';
import styles from './Competition.module.css';

const COMPETITION_INFO = {
  1:   { name: 'Coupe du Monde',   logo: 'https://media.api-sports.io/football/leagues/1.png',   color: '#1a56db' },
  2:   { name: 'Champions League', logo: 'https://media.api-sports.io/football/leagues/2.png',   color: '#1a56db' },
  3:   { name: 'Europa League',    logo: 'https://media.api-sports.io/football/leagues/3.png',   color: '#f59e0b' },
  39:  { name: 'Premier League',   logo: 'https://media.api-sports.io/football/leagues/39.png',  color: '#8b5cf6' },
  61:  { name: 'Ligue 1',          logo: 'https://media.api-sports.io/football/leagues/61.png',  color: '#1a56db' },
  78:  { name: 'Bundesliga',       logo: 'https://media.api-sports.io/football/leagues/78.png',  color: '#ef4444' },
  135: { name: 'Serie A',          logo: 'https://media.api-sports.io/football/leagues/135.png', color: '#1a56db' },
  140: { name: 'La Liga',          logo: 'https://media.api-sports.io/football/leagues/140.png', color: '#ef4444' },
};

const TABS = ['Matchs', 'Résultats', 'Classement', 'News'];

const fmt = (d) => d.toISOString().split('T')[0];

export default function Competition() {
  const { id } = useParams();
  const leagueId = parseInt(id);
  const [tab, setTab] = useState('Matchs');
  const info = COMPETITION_INFO[leagueId] ?? { name: `Compétition #${leagueId}`, logo: null, color: '#1a56db' };

  const today = fmt(new Date());
  const { data: fixtures, isLoading: loadingFixtures } = useFixturesByDate(today);
  const { data: standings, isLoading: loadingStandings } = useStandings(leagueId);
  const { data: news } = useNewsLatest(20);

  const leagueFixtures = (fixtures ?? []).filter(f => f.league.id === leagueId);
  const liveFixtures   = leagueFixtures.filter(f => ['1H','2H','HT','ET','P'].includes(f.fixture.status.short));
  const upcoming       = leagueFixtures.filter(f => f.fixture.status.short === 'NS');
  const finished       = leagueFixtures.filter(f => ['FT','AET','PEN'].includes(f.fixture.status.short));

  const relatedNews = (news ?? []).filter(a => {
    const compName = info.name.toLowerCase();
    return a.title.toLowerCase().includes(compName.split(' ')[0]);
  }).slice(0, 8);

  const table = Array.isArray(standings)
    ? standings
    : standings?.league?.standings?.[0] ?? [];

  return (
    <div className={styles.page}>
      {/* Hero header (style OneFootball) */}
      <div className={styles.hero} style={{ '--comp-color': info.color }}>
        <div className={styles.heroGlow} style={{ background: `radial-gradient(circle at 20% 50%, ${info.color}30 0%, transparent 60%)` }} />
        <div className={styles.heroContent}>
          {info.logo && <img src={info.logo} alt={info.name} className={styles.heroLogo} onError={e => e.target.style.display='none'} />}
          <h1 className={styles.heroTitle}>{info.name}</h1>
          {liveFixtures.length > 0 && (
            <div className={styles.heroBadge}>
              <span className="live-dot" />
              {liveFixtures.length} match{liveFixtures.length > 1 ? 's' : ''} en direct
            </div>
          )}
        </div>
        <Link to="/matches" className={styles.heroBack}>Tous les matchs</Link>
      </div>

      {/* Onglets */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
        {leagueId === 1 && (
          <Link to="/coupe-du-monde" className={`${styles.tab}`}>
            Phase Finale
          </Link>
        )}
      </div>

      <div className={styles.content}>
        {/* MATCHS */}
        {tab === 'Matchs' && (
          <div className={styles.section}>
            {loadingFixtures && <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />}

            {liveFixtures.length > 0 && (
              <div className={styles.group}>
                <div className={styles.groupLabel}>En direct</div>
                {liveFixtures.map(f => <MatchCard key={f.fixture.id} fixture={f} />)}
              </div>
            )}

            {upcoming.length > 0 && (
              <div className={styles.group}>
                <div className={styles.groupLabel}>A venir aujourd'hui</div>
                {upcoming.map(f => <MatchCard key={f.fixture.id} fixture={f} />)}
              </div>
            )}

            {finished.length > 0 && (
              <div className={styles.group}>
                <div className={styles.groupLabel}>Terminés</div>
                {finished.map(f => <MatchCard key={f.fixture.id} fixture={f} />)}
              </div>
            )}

            {!loadingFixtures && leagueFixtures.length === 0 && (
              <div className={styles.empty}>Aucun match aujourd'hui pour cette compétition.</div>
            )}
          </div>
        )}

        {/* RÉSULTATS */}
        {tab === 'Résultats' && (
          <div className={styles.section}>
            {finished.length === 0 ? (
              <div className={styles.empty}>Aucun résultat disponible aujourd'hui.</div>
            ) : (
              finished.map(f => <MatchCard key={f.fixture.id} fixture={f} />)
            )}
          </div>
        )}

        {/* CLASSEMENT */}
        {tab === 'Classement' && (
          <div className={styles.section}>
            {loadingStandings && <div className="skeleton" style={{ height: 400, borderRadius: 8 }} />}
            {!loadingStandings && table.length === 0 && (
              <div className={styles.empty}>Classement non disponible pour cette compétition.</div>
            )}
            {table.length > 0 && (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th className={styles.thTeam}>Équipe</th>
                      <th>J</th>
                      <th>V</th>
                      <th>N</th>
                      <th>D</th>
                      <th>Buts</th>
                      <th>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.map(row => (
                      <tr key={row.team.id} className={row.rank <= 4 ? styles.rowQualified : row.rank >= table.length - 2 ? styles.rowRelegate : ''}>
                        <td className={styles.rank}>{row.rank}</td>
                        <td className={styles.tdTeam}>
                          <img src={row.team.logo} alt="" width={18} height={18} onError={e => e.target.style.display='none'} />
                          <span>{row.team.name}</span>
                        </td>
                        <td>{row.all.played}</td>
                        <td>{row.all.win}</td>
                        <td>{row.all.draw}</td>
                        <td>{row.all.lose}</td>
                        <td>{row.all.goals.for}:{row.all.goals.against}</td>
                        <td className={styles.pts}>{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* NEWS */}
        {tab === 'News' && (
          <div className={styles.section}>
            {relatedNews.length === 0 ? (
              <div className={styles.empty}>Aucune actualité disponible.</div>
            ) : (
              <div className={styles.newsGrid}>
                {relatedNews.map((a, i) => <ArticleCard key={a.id || i} article={a} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
