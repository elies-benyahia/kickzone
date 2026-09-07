// Match — détail d'un match (/match/:id) : 5 onglets (Résumé, Compo, Stats, H2H, Classement).
// Astuce : les données d'un onglet ne sont chargées que quand il est ouvert.
// Chaque onglet est un composant à part dans components/match/.

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFixture, useLineups, useFixtureStats, useFixtureEvents, useH2H, useStandings } from '../hooks/api';
import LiveBadge from '../components/LiveBadge';
import StandingsTable from '../components/StandingsTable';
import SummaryTab from '../components/match/SummaryTab';
import LineupsTab from '../components/match/LineupsTab';
import StatsTab from '../components/match/StatsTab';
import H2HTab from '../components/match/H2HTab';
import styles from './Match.module.css';

const LIVE_STATUSES = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'INT'];
const TABS = ['Résumé', 'Composition', 'Statistiques', 'H2H', 'Classement'];

export default function Match() {
  const { id } = useParams();
  const [tab, setTab] = useState(0);                // onglet actif (0 = Résumé)
  const { data: fixtures, isLoading } = useFixture(id);
  const fixture = fixtures?.[0];                    // l'API renvoie un tableau d'1 élément

  const homeId   = fixture?.teams?.home?.id;
  const awayId   = fixture?.teams?.away?.id;
  const leagueId = fixture?.league?.id;
  const status   = fixture?.fixture?.status?.short;
  const isLive   = LIVE_STATUSES.includes(status);

  // Chaque hook ne part que si son onglet est ouvert.
  const { data: events }    = useFixtureEvents(id);
  const { data: lineups }   = useLineups(tab === 1 ? id : null);
  const { data: stats }     = useFixtureStats(tab === 2 ? id : null);
  const { data: h2h }       = useH2H(tab === 3 ? homeId : null, tab === 3 ? awayId : null);
  const { data: standings } = useStandings(tab === 4 ? leagueId : null);

  if (isLoading) return <div className={styles.loading}>Chargement du match...</div>;
  if (!fixture)  return <div className={styles.loading}>Match introuvable.</div>;

  const { teams, goals, fixture: f, league } = fixture;
  const isFinished = ['FT', 'AET', 'PEN'].includes(status);
  const date = new Date(f.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const time = new Date(f.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="container" style={{ padding: '1.5rem var(--gutter)' }}>
      <div className={styles.header}>
        <div className={styles.competition}>
          <img src={league.logo} alt="" width={20} height={20} onError={(e) => (e.target.style.display = 'none')} />
          <Link to="/classements" className={styles.leagueLink}>{league.name}</Link>
          {isLive && <LiveBadge minute={f.status.elapsed} />}
        </div>

        <div className={styles.scoreboard}>
          <div className={styles.teamBlock}>
            <img src={teams.home.logo} alt={teams.home.name} className={styles.teamLogo} onError={(e) => (e.target.style.display = 'none')} />
            <span className={styles.teamName}>{teams.home.name}</span>
          </div>

          <div className={styles.scoreBlock}>
            {isLive || isFinished
              ? <span className={styles.score} style={{ color: isLive ? 'var(--green-live)' : undefined }}>{goals.home ?? 0} — {goals.away ?? 0}</span>
              : <><span className={styles.matchTime}>{time}</span><span className={styles.matchDate}>{date}</span></>}
            {isFinished && <span className={styles.statusBadge}>Terminé</span>}
            {isLive && f.status.elapsed && <span className={styles.elapsed}>{f.status.elapsed}'</span>}
          </div>

          <div className={`${styles.teamBlock} ${styles.teamRight}`}>
            <span className={styles.teamName}>{teams.away.name}</span>
            <img src={teams.away.logo} alt={teams.away.name} className={styles.teamLogo} onError={(e) => (e.target.style.display = 'none')} />
          </div>
        </div>

        {f.venue?.name && <p className={styles.venue}>🏟️ {f.venue.name}, {f.venue.city}</p>}
        {f.referee && <p className={styles.venue}>⚖️ {f.referee}</p>}
      </div>

      <div className={styles.tabs}>
        {TABS.map((t, i) => (
          <button key={t} className={`${styles.tab} ${tab === i ? styles.tabActive : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {/* On n'affiche que le sous-composant de l'onglet actif */}
      <div className={styles.content}>
        {tab === 0 && <SummaryTab events={events} fixture={fixture} />}
        {tab === 1 && <LineupsTab lineups={lineups} />}
        {tab === 2 && <StatsTab stats={stats} teams={teams} />}
        {tab === 3 && <H2HTab h2h={h2h} homeId={homeId} />}
        {tab === 4 && <StandingsTable standings={standings} highlightIds={[homeId, awayId]} />}
      </div>
    </div>
  );
}
