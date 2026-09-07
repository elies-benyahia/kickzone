// StatsTab — onglet "Statistiques" : barre comparative (possession, tirs...) entre les 2 équipes.

import styles from '../../pages/Match.module.css';

export default function StatsTab({ stats, teams }) {
  if (!stats || stats.length === 0) {
    return <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>Statistiques non disponibles.</p>;
  }
  const home = stats[0]?.statistics ?? [];
  const away = stats[1]?.statistics ?? [];

  return (
    <div>
      <div className={styles.statsTeams}>
        <div className={styles.statsTeamName}>
          <img src={teams.home.logo} alt="" width={20} height={20} onError={(e) => (e.target.style.display = 'none')} />
          {teams.home.name}
        </div>
        <div className={styles.statsTeamName} style={{ textAlign: 'right' }}>
          {teams.away.name}
          <img src={teams.away.logo} alt="" width={20} height={20} onError={(e) => (e.target.style.display = 'none')} />
        </div>
      </div>

      <div className={styles.statsWrap}>
        {home.map((s, i) => {
          const hv = s.value, av = away[i]?.value;
          const hNum = parseFloat(String(hv).replace('%', '')) || 0;
          const aNum = parseFloat(String(av).replace('%', '')) || 0;
          const total = String(hv).includes('%') ? 100 : (hNum + aNum) || 1;
          const hBar = Math.round((hNum / total) * 100);
          return (
            <div key={i} className={styles.statRow}>
              <span className={styles.statVal} style={{ color: 'var(--blue)', fontWeight: 700 }}>{hv ?? 0}</span>
              <div className={styles.statMid}>
                <div className={styles.statBarWrap}>
                  <div className={styles.statBarBlue} style={{ width: `${hBar}%` }} />
                  <div className={styles.statBarOrange} style={{ width: `${100 - hBar}%` }} />
                </div>
                <span className={styles.statLabel}>{s.type}</span>
              </div>
              <span className={styles.statVal} style={{ color: 'var(--orange)', fontWeight: 700 }}>{av ?? 0}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
