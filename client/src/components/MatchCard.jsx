import { Link } from 'react-router-dom';
import LiveBadge from './LiveBadge';
import styles from './MatchCard.module.css';

export default function MatchCard({ fixture }) {
  const { fixture: f, teams, goals, league } = fixture;
  const status = f.status.short;
  const isLive = ['1H','2H','HT','ET','P'].includes(status);
  const isFinished = status === 'FT';
  const kickoff = new Date(f.date).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });

  return (
    <Link to={`/match/${f.id}`} className={styles.card}>
      <div className={styles.team}>
        <img src={teams.home.logo} alt={teams.home.name} width={24} height={24} onError={e => e.target.style.display='none'} />
        <span className={styles.name}>{teams.home.name}</span>
      </div>

      <div className={styles.center}>
        {isLive ? (
          <LiveBadge minute={f.status.elapsed} />
        ) : isFinished ? (
          <span className={styles.score}>{goals.home ?? 0} – {goals.away ?? 0}</span>
        ) : (
          <span className={styles.time}>{kickoff}</span>
        )}
      </div>

      <div className={`${styles.team} ${styles.teamRight}`}>
        <span className={styles.name}>{teams.away.name}</span>
        <img src={teams.away.logo} alt={teams.away.name} width={24} height={24} onError={e => e.target.style.display='none'} />
      </div>
    </Link>
  );
}
