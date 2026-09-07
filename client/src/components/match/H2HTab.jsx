// H2HTab — onglet "H2H" : bilan + les 10 dernières confrontations entre les 2 équipes.

import { Link } from 'react-router-dom';
import styles from '../../pages/Match.module.css';

export default function H2HTab({ h2h, homeId }) {
  if (!h2h || h2h.length === 0) {
    return <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>Historique H2H indisponible.</p>;
  }

  const homeWins = h2h.filter((f) => (f.teams.home.id === homeId ? f.goals.home > f.goals.away : f.goals.away > f.goals.home)).length;
  const draws = h2h.filter((f) => f.goals.home === f.goals.away).length;
  const awayWins = h2h.length - homeWins - draws;

  return (
    <div>
      <div className={styles.h2hSummary}>
        <div className={styles.h2hStat}><span className={styles.h2hNum} style={{ color: 'var(--blue)' }}>{homeWins}</span><span>Victoires</span></div>
        <div className={styles.h2hStat}><span className={styles.h2hNum}>{draws}</span><span>Nuls</span></div>
        <div className={styles.h2hStat}><span className={styles.h2hNum} style={{ color: 'var(--orange)' }}>{awayWins}</span><span>Victoires</span></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {h2h.slice(0, 10).map((f, i) => {
          const w = f.goals.home > f.goals.away ? 'home' : f.goals.home < f.goals.away ? 'away' : 'draw';
          return (
            <Link to={`/match/${f.fixture.id}`} key={i} className={styles.h2hRow}>
              <span className={styles.h2hDate}>{new Date(f.fixture.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className={`${styles.h2hTeam} ${w === 'home' ? styles.h2hWinner : ''}`}>{f.teams.home.name}</span>
              <span className={styles.h2hScore}>{f.goals.home} – {f.goals.away}</span>
              <span className={`${styles.h2hTeam} ${w === 'away' ? styles.h2hWinner : ''}`}>{f.teams.away.name}</span>
              <span className={styles.h2hLeague}>{f.league.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
