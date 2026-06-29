import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFixture, useLineups, useFixtureStats, useFixtureEvents, useH2H, useStandings } from '../hooks/api';
import LiveBadge from '../components/LiveBadge';
import StandingsTable from '../components/StandingsTable';
import styles from './Match.module.css';

const LIVE_STATUSES = ['1H','2H','HT','ET','P','LIVE','INT'];
const TABS = ['Résumé','Composition','Statistiques','H2H','Classement'];

export default function Match() {
  const { id } = useParams();
  const [tab, setTab] = useState(0);
  const { data: fixtures, isLoading } = useFixture(id);
  const fixture = fixtures?.[0];

  const homeId   = fixture?.teams?.home?.id;
  const awayId   = fixture?.teams?.away?.id;
  const leagueId = fixture?.league?.id;
  const status   = fixture?.fixture?.status?.short;
  const isLive   = LIVE_STATUSES.includes(status);

  const { data: events }    = useFixtureEvents(id);
  const { data: lineups }   = useLineups(tab === 1 ? id : null);
  const { data: stats }     = useFixtureStats(tab === 2 ? id : null);
  const { data: h2h }       = useH2H(tab === 3 && homeId ? homeId : null, tab === 3 && awayId ? awayId : null);
  const { data: standings } = useStandings(tab === 4 && leagueId ? leagueId : null);

  if (isLoading) return <div className={styles.loading}>Chargement du match...</div>;
  if (!fixture)  return <div className={styles.loading}>Match introuvable.</div>;

  const { teams, goals, fixture: f, league } = fixture;
  const isFinished = ['FT','AET','PEN'].includes(status);
  const date = new Date(f.date).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const time = new Date(f.date).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });

  return (
    <div className="container" style={{padding:'1.5rem var(--gutter)'}}>
      <div className={styles.header}>
        <div className={styles.competition}>
          <img src={league.logo} alt="" width={20} height={20} onError={e=>e.target.style.display='none'} />
          <Link to={`/classements`} className={styles.leagueLink}>{league.name} — J{league.round?.replace(/\D/g,'') || '?'}</Link>
          {isLive && <LiveBadge minute={f.status.elapsed} />}
        </div>

        <div className={styles.scoreboard}>
          <div className={styles.teamBlock}>
            <img src={teams.home.logo} alt={teams.home.name} className={styles.teamLogo} onError={e=>e.target.style.display='none'} />
            <span className={styles.teamName}>{teams.home.name}</span>
          </div>

          <div className={styles.scoreBlock}>
            {(isLive || isFinished)
              ? <span className={styles.score} style={{color: isLive ? 'var(--green-live)' : undefined}}>
                  {goals.home ?? 0} — {goals.away ?? 0}
                </span>
              : <>
                  <span className={styles.matchTime}>{time}</span>
                  <span className={styles.matchDate}>{date}</span>
                </>
            }
            {isFinished && <span className={styles.statusBadge}>Terminé</span>}
            {isLive && f.status.elapsed && <span className={styles.elapsed}>{f.status.elapsed}'</span>}
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
        {tab === 0 && <SummaryTab events={events} fixture={fixture} />}
        {tab === 1 && <LineupsTab lineups={lineups} />}
        {tab === 2 && <StatsTab stats={stats} teams={teams} />}
        {tab === 3 && <H2HTab h2h={h2h} homeId={homeId} />}
        {tab === 4 && <StandingsTab standings={standings} homeId={homeId} awayId={awayId} />}
      </div>
    </div>
  );
}

/* ---------- SUMMARY TAB ---------- */
function SummaryTab({ events, fixture }) {
  const allEvents = events ?? fixture?.events ?? [];
  if (allEvents.length === 0) {
    return <p style={{color:'var(--text-muted)',padding:'2rem',textAlign:'center'}}>Pas d'événements disponibles pour ce match.</p>;
  }
  const iconFor = (type, detail) => {
    if (type === 'Goal') return detail?.includes('Missed Penalty') ? '❌' : '⚽';
    if (type === 'Card') return detail?.includes('Yellow') ? '🟨' : '🟥';
    if (type === 'subst') return '🔄';
    return '•';
  };
  return (
    <div className={styles.timeline}>
      {allEvents.map((e, i) => (
        <div key={i} className={`${styles.event} ${e.team?.id === fixture?.teams?.home?.id ? styles.eventHome : styles.eventAway}`}>
          <span className={styles.eventMin}>{e.time?.elapsed}'</span>
          <span className={styles.eventIcon}>{iconFor(e.type, e.detail)}</span>
          <div className={styles.eventInfo}>
            <span className={styles.eventPlayer}>{e.player?.name}</span>
            {e.assist?.name && <span className={styles.eventAssist}>↪ {e.assist.name}</span>}
            <span className={styles.eventTeam}>{e.team?.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- LINEUPS / FORMATION TERRAIN ---------- */
const POSITIONS = {
  G: { top: '88%', positions: [{ left: '50%' }] },
  D: {
    top: '68%',
    positions: [
      { left: '12%' }, { left: '35%' }, { left: '65%' }, { left: '88%' },
      { left: '20%' }, { left: '50%' }, { left: '80%' },
      { left: '25%' }, { left: '50%' }, { left: '75%' },
    ],
  },
  M: {
    top: '48%',
    positions: [
      { left: '20%' }, { left: '40%' }, { left: '60%' }, { left: '80%' },
      { left: '25%' }, { left: '50%' }, { left: '75%' },
      { left: '33%' }, { left: '50%' }, { left: '67%' },
    ],
  },
  F: {
    top: '22%',
    positions: [
      { left: '25%' }, { left: '50%' }, { left: '75%' },
      { left: '33%' }, { left: '67%' },
    ],
  },
};

function FootballPitch({ players, formation, isHome }) {
  const byPos = { G: [], D: [], M: [], F: [] };
  players.forEach(p => {
    const pos = p.player?.pos || 'M';
    if (byPos[pos]) byPos[pos].push(p.player);
    else byPos.M.push(p.player);
  });

  const posGroups = [
    { key: 'G', top: isHome ? '82%' : '12%', players: byPos.G },
    { key: 'D', top: isHome ? '62%' : '30%', players: byPos.D },
    { key: 'M', top: isHome ? '42%' : '50%', players: byPos.M },
    { key: 'F', top: isHome ? '18%' : '72%', players: byPos.F },
  ];

  return (
    <div className={styles.pitchHalf}>
      {posGroups.map(({ key, top, players: pos }) => {
        const count = pos.length;
        return (
          <div key={key} className={styles.posRow} style={{ top }}>
            {pos.map((p, i) => (
              <div key={i} className={styles.playerDot} style={{ left: `${((i + 1) / (count + 1)) * 100}%` }}>
                <div className={styles.dotCircle} style={{ background: isHome ? 'var(--blue)' : 'var(--orange)' }}>
                  {p.number}
                </div>
                <span className={styles.dotName}>{p.name?.split(' ').pop()}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function LineupsTab({ lineups }) {
  const [view, setView] = useState('terrain');
  if (!lineups || lineups.length === 0) return (
    <p style={{color:'var(--text-muted)',padding:'2rem',textAlign:'center'}}>Compositions non disponibles (pas encore publiées).</p>
  );

  const home = lineups[0];
  const away = lineups[1] ?? lineups[0];

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:'1rem'}}>
        <button className={`${styles.tab} ${view==='terrain' ? styles.tabActive : ''}`} onClick={() => setView('terrain')}>⚽ Terrain</button>
        <button className={`${styles.tab} ${view==='liste' ? styles.tabActive : ''}`} onClick={() => setView('liste')}>📋 Liste</button>
      </div>

      {view === 'terrain' && (
        <div className={styles.pitch}>
          <svg viewBox="0 0 400 600" className={styles.pitchSvg} preserveAspectRatio="xMidYMid meet">
            <rect width="400" height="600" fill="#2d7a3a" />
            <rect x="20" y="20" width="360" height="560" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
            <line x1="20" y1="300" x2="380" y2="300" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
            <circle cx="200" cy="300" r="45" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
            <rect x="110" y="20" width="180" height="70" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <rect x="110" y="510" width="180" height="70" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <rect x="155" y="20" width="90" height="35" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <rect x="155" y="545" width="90" height="35" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <circle cx="200" cy="300" r="3" fill="white" />
          </svg>
          <div className={styles.pitchOverlay}>
            <div className={styles.formationLabel}>{away?.formation}</div>
            <FootballPitch players={away?.startXI ?? []} formation={away?.formation} isHome={false} />
            <div className={styles.midLine} />
            <FootballPitch players={home?.startXI ?? []} formation={home?.formation} isHome={true} />
            <div className={styles.formationLabel} style={{bottom:4,top:'auto'}}>{home?.formation}</div>
          </div>
          <div className={styles.pitchLegend}>
            <span><span className={styles.legendDot} style={{background:'var(--blue)'}} />{home?.team?.name}</span>
            <span><span className={styles.legendDot} style={{background:'var(--orange)'}} />{away?.team?.name}</span>
          </div>
        </div>
      )}

      {view === 'liste' && (
        <div className={styles.lineups}>
          {[home, away].map((team, i) => (
            <div key={i} className={styles.teamLineup}>
              <h3 className={styles.lineupTeam}>
                <img src={team?.team?.logo} alt="" width={20} height={20} onError={e=>e.target.style.display='none'} />
                {team?.team?.name}
                <span style={{fontWeight:400,color:'var(--text-muted)',fontSize:'0.9rem'}}>{team?.formation}</span>
              </h3>
              <div className={styles.playersList}>
                <div className={styles.playersSection}>Titulaires</div>
                {team?.startXI?.map((p, j) => (
                  <div key={j} className={styles.playerRow}>
                    <span className={styles.playerNum}>{p.player.number}</span>
                    <span className={styles.playerName}>{p.player.name}</span>
                    <span className={styles.playerPos} style={{color:p.player.pos==='G'?'var(--orange)':p.player.pos==='D'?'var(--blue)':p.player.pos==='M'?'var(--green-live)':'#dc2626'}}>{p.player.pos}</span>
                  </div>
                ))}
                <div className={styles.playersSection} style={{marginTop:8}}>Remplaçants</div>
                {team?.substitutes?.map((p, j) => (
                  <div key={j} className={styles.playerRow} style={{opacity:0.65}}>
                    <span className={styles.playerNum}>{p.player.number}</span>
                    <span className={styles.playerName}>{p.player.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- STATS TAB ---------- */
function StatsTab({ stats, teams }) {
  if (!stats || stats.length === 0) return (
    <p style={{color:'var(--text-muted)',padding:'2rem',textAlign:'center'}}>Statistiques non disponibles.</p>
  );
  const home = stats[0]?.statistics ?? [];
  const away = stats[1]?.statistics ?? [];

  return (
    <div>
      <div className={styles.statsTeams}>
        <div className={styles.statsTeamName}>
          <img src={teams.home.logo} alt="" width={20} height={20} onError={e=>e.target.style.display='none'} />
          {teams.home.name}
        </div>
        <div className={styles.statsTeamName} style={{textAlign:'right'}}>
          {teams.away.name}
          <img src={teams.away.logo} alt="" width={20} height={20} onError={e=>e.target.style.display='none'} />
        </div>
      </div>
      <div className={styles.statsWrap}>
        {home.map((s, i) => {
          const av = away[i]?.value;
          const hv = s.value;
          const hNum = parseFloat(String(hv).replace('%','')) || 0;
          const aNum = parseFloat(String(av).replace('%','')) || 0;
          const isPct = String(hv).includes('%');
          const total = isPct ? 100 : (hNum + aNum) || 1;
          const hBar = Math.round(hNum / total * 100);
          return (
            <div key={i} className={styles.statRow}>
              <span className={styles.statVal} style={{color:'var(--blue)',fontWeight:700}}>{hv ?? 0}</span>
              <div className={styles.statMid}>
                <div className={styles.statBarWrap}>
                  <div className={styles.statBarBlue} style={{width:`${hBar}%`}} />
                  <div className={styles.statBarOrange} style={{width:`${100-hBar}%`}} />
                </div>
                <span className={styles.statLabel}>{s.type}</span>
              </div>
              <span className={styles.statVal} style={{color:'var(--orange)',fontWeight:700}}>{av ?? 0}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- H2H TAB ---------- */
function H2HTab({ h2h, homeId }) {
  if (!h2h || h2h.length === 0) return (
    <p style={{color:'var(--text-muted)',padding:'2rem',textAlign:'center'}}>Historique H2H indisponible.</p>
  );
  const homeWins = h2h.filter(f => f.teams.home.id === homeId ? f.goals.home > f.goals.away : f.goals.away > f.goals.home).length;
  const draws = h2h.filter(f => f.goals.home === f.goals.away).length;
  const awayWins = h2h.length - homeWins - draws;

  return (
    <div>
      <div className={styles.h2hSummary}>
        <div className={styles.h2hStat}><span className={styles.h2hNum} style={{color:'var(--blue)'}}>{homeWins}</span><span>Victoires</span></div>
        <div className={styles.h2hStat}><span className={styles.h2hNum}>{draws}</span><span>Nuls</span></div>
        <div className={styles.h2hStat}><span className={styles.h2hNum} style={{color:'var(--orange)'}}>{awayWins}</span><span>Victoires</span></div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {h2h.slice(0, 10).map((f, i) => {
          const w = f.goals.home > f.goals.away ? 'home' : f.goals.home < f.goals.away ? 'away' : 'draw';
          return (
            <Link to={`/match/${f.fixture.id}`} key={i} className={styles.h2hRow}>
              <span className={styles.h2hDate}>{new Date(f.fixture.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}</span>
              <span className={`${styles.h2hTeam} ${w==='home'?styles.h2hWinner:''}`}>{f.teams.home.name}</span>
              <span className={styles.h2hScore}>{f.goals.home} – {f.goals.away}</span>
              <span className={`${styles.h2hTeam} ${w==='away'?styles.h2hWinner:''}`}>{f.teams.away.name}</span>
              <span className={styles.h2hLeague}>{f.league.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- STANDINGS TAB ---------- */
function StandingsTab({ standings, homeId, awayId }) {
  return <StandingsTable standings={standings} highlightIds={[homeId, awayId]} />;
}
