import { useFixturesToday } from '../hooks/api';
import styles from './MatchTicker.module.css';

export default function MatchTicker() {
  const { data: fixtures } = useFixturesToday();
  if (!fixtures || fixtures.length === 0) return null;

  const items = [...fixtures, ...fixtures]; // duplicate for seamless loop

  return (
    <div className={styles.ticker}>
      <div className={styles.rail}>
        {items.map((f, i) => {
          const { fixture, teams, goals } = f;
          const status = fixture.status.short;
          const isLive = ['1H','2H','HT','ET','P'].includes(status);
          const isFinished = status === 'FT';
          return (
            <span key={`${fixture.id}-${i}`} className={styles.item}>
              {isLive && <span className={styles.liveDot} />}
              <span className={styles.teamName}>{teams.home.name}</span>
              <span className={styles.score}>
                {isLive || isFinished ? `${goals.home ?? 0}-${goals.away ?? 0}` : new Date(fixture.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
              </span>
              <span className={styles.teamName}>{teams.away.name}</span>
              <span className={styles.sep}>·</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
