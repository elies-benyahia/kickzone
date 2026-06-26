import styles from './StandingsTable.module.css';

export default function StandingsTable({ standings, compact = false }) {
  if (!standings || !standings[0]) return <p style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>Classement indisponible.</p>;
  const table = standings[0].league?.standings?.[0] || [];
  const rows = compact ? table.slice(0, 5) : table;

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Équipe</th>
            <th>Pts</th>
            {!compact && <><th>MJ</th><th>V</th><th>N</th><th>D</th><th>Diff</th></>}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const isPromo = row.rank <= 2;
            const isRelegate = row.rank >= table.length - 2;
            return (
              <tr key={row.rank} className={isPromo ? styles.promo : isRelegate ? styles.relegate : ''}>
                <td className={styles.rank}>{row.rank}</td>
                <td className={styles.teamCell}>
                  <img src={row.team.logo} alt="" width={18} height={18} onError={e=>e.target.style.display='none'}/>
                  <span>{row.team.name}</span>
                </td>
                <td className={styles.pts}>{row.points}</td>
                {!compact && <><td>{row.all.played}</td><td>{row.all.win}</td><td>{row.all.draw}</td><td>{row.all.lose}</td><td>{row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}</td></>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
