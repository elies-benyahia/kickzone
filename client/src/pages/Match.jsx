import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFixture, useLineups, useFixtureStats, useH2H, useStandings } from '../hooks/api';
import LiveBadge from '../components/LiveBadge';
import StandingsTable from '../components/StandingsTable';
import styles from './Match.module.css';

const TABS = ['Résumé', 'Composition', 'Stats', 'H2H', 'Classement'];

export default function Match() {
  const { id } = useParams();
  const [tab, setTab] = useState(0);
  const { data: fixtures, isLoading } = useFixture(id);
  const fixture = fixtures?.[0];

  const homeId = fixture?.teams?.home?.id;
  const awayId = fixture?.teams?.away?.id;
  const leagueId = fixture?.league?.id;

  const { data: lineups }  = useLineups(tab === 1 ? id : null);
  const { data: stats }    = useFixtureStats(tab === 2 ? id : null);
  const { data: h2h }      = useH2H(tab === 3 && homeId ? homeId : null, tab === 3 && awayId ? awayId : null);
  const { data: standings }= useStandings(tab === 4 && leagueId ? leagueId : null);

  if (isLoading) return <div className={styles.loading}>Chargement...</div>;
  if (!fixture) return <div className={styles.loading}>Match introuvable.</div>;

  const { teams, goals, fixture: f, league } = fixture;
  const status = f.status.short;
  const isLive = ['1H','2H','HT','ET','P'].includes(status);
  const isFinished = status === 'FT';
  const date = new Date(f.date).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const time = new Date(f.date).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });

  return (
    <div className="container" style={{padding:'1.5rem var(--gutter)'}}>
      <div className={styles.header}>
        <div className={styles.competition}>
          <img src={league.logo} alt="" width={24} height={24} onError={e=>e.target.style.display='none'} />
          <span>{league.name}</span>
          {isLive && <LiveBadge minute={f.status.elapsed} />}
        </div>
        <div className={styles.scoreboard}>
          <div className={styles.teamBlock}>
            <img src={teams.home.logo} alt={teams.home.name} className={styles.teamLogo} onError={e=>e.target.style.display='none'} />
            <span className={styles.teamName}>{teams.home.name}</span>
          </div>
          <div className={styles.scoreBlock}>
            {(isLive || isFinished)
              ? <span className={styles.score} style={{color: isLive ? 'var(--green-live)' : 'var(--text)'}}>{goals.home ?? 0} – {goals.away ?? 0}</span>
              : <><span className={styles.matchTime}>{time}</span><span className={styles.matchDate}>{date}</span></>
            }
            {isFinished && <span className={styles.status}>Terminé</span>}
          </div>
          <div className={`${styles.teamBlock} ${styles.teamRight}`}>
            <span className={styles.teamName}>{teams.away.name}</span>
            <img src={teams.away.logo} alt={teams.away.name} className={styles.teamLogo} onError={e=>e.target.style.display='none'} />
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

      <div className={styles.content}>
        {tab === 0 && <SummaryTab fixture={fixture} />}
        {tab === 1 && <LineupsTab lineups={lineups} />}
        {tab === 2 && <StatsTab stats={stats} teams={teams} />}
        {tab === 3 && <H2HTab h2h={h2h} />}
        {tab === 4 && <StandingsTable standings={standings} />}
      </div>
    </div>
  );
}

function SummaryTab({ fixture }) {
  const events = fixture.events ?? [];
  const goals = events.filter(e => e.type === 'Goal');
  return (
    <div className={styles.summary}>
      {goals.length === 0 && <p style={{color:'var(--text-muted)'}}>Pas d'événements disponibles.</p>}
      {goals.map((e, i) => (
        <div key={i} className={styles.event}>
          <span className={styles.eventMin}>{e.time.elapsed}'</span>
          <span className={styles.eventIcon}>⚽</span>
          <span className={styles.eventPlayer}>{e.player.name}</span>
          <span className={styles.eventTeam}>({e.team.name})</span>
          {e.assist.name && <span className={styles.eventAssist}>— Pass: {e.assist.name}</span>}
        </div>
      ))}
    </div>
  );
}

function LineupsTab({ lineups }) {
  if (!lineups || lineups.length === 0) return <p style={{color:'var(--text-muted)',padding:'1rem'}}>Compositions non disponibles.</p>;
  return (
    <div className={styles.lineups}>
      {lineups.map((team, i) => (
        <div key={i} className={styles.teamLineup}>
          <h3 className={styles.lineupTeam}>{team.team.name} <span style={{fontWeight:400,color:'var(--text-muted)'}}>({team.formation})</span></h3>
          <div className={styles.players}>
            <h4 className={styles.playersTitle}>Titulaires</h4>
            {team.startXI?.map((p, j) => (
              <div key={j} className={styles.player}>
                <span className={styles.playerNum}>{p.player.number}</span>
                <span>{p.player.name}</span>
                <span className={styles.playerPos}>{p.player.pos}</span>
              </div>
            ))}
            <h4 className={styles.playersTitle} style={{marginTop:'12px'}}>Remplaçants</h4>
            {team.substitutes?.slice(0,5).map((p, j) => (
              <div key={j} className={styles.player} style={{opacity:0.7}}>
                <span className={styles.playerNum}>{p.player.number}</span>
                <span>{p.player.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsTab({ stats, teams }) {
  if (!stats || stats.length === 0) return <p style={{color:'var(--text-muted)',padding:'1rem'}}>Stats non disponibles.</p>;
  const home = stats[0]?.statistics ?? [];
  const away = stats[1]?.statistics ?? [];
  return (
    <div className={styles.statsWrap}>
      {home.map((s, i) => {
        const av = away[i]?.value;
        const hv = s.value;
        const hPct = typeof hv === 'string' && hv.includes('%') ? parseFloat(hv) : null;
        const aPct = typeof av === 'string' && av?.includes('%') ? parseFloat(av) : null;
        const total = hPct !== null ? 100 : (Number(hv || 0) + Number(av || 0));
        const hBar = total > 0 ? (hPct ?? Number(hv || 0)) / total * 100 : 50;
        return (
          <div key={i} className={styles.statRow}>
            <span className={styles.statVal}>{hv ?? 0}</span>
            <div className={styles.statMid}>
              <div className={styles.statBar}>
                <div className={styles.statBarFill} style={{width:`${hBar}%`}} />
              </div>
              <span className={styles.statLabel}>{s.type}</span>
            </div>
            <span className={styles.statVal}>{av ?? 0}</span>
          </div>
        );
      })}
    </div>
  );
}

function H2HTab({ h2h }) {
  if (!h2h || h2h.length === 0) return <p style={{color:'var(--text-muted)',padding:'1rem'}}>Historique H2H indisponible.</p>;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      {h2h.slice(0, 5).map((f, i) => (
        <div key={i} className={styles.h2hRow}>
          <span className={styles.h2hDate}>{new Date(f.fixture.date).toLocaleDateString('fr-FR')}</span>
          <span className={styles.h2hTeam}>{f.teams.home.name}</span>
          <span className={styles.h2hScore}>{f.goals.home} – {f.goals.away}</span>
          <span className={styles.h2hTeam}>{f.teams.away.name}</span>
        </div>
      ))}
    </div>
  );
}
