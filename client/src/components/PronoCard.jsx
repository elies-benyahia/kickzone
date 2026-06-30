import styles from './PronoCard.module.css';

const TeamLogo = ({ teamId, name }) => teamId ? (
  <img
    src={`https://media.api-sports.io/football/teams/${teamId}.png`}
    alt={name}
    width={28}
    height={28}
    className={styles.teamLogo}
    onError={e => { e.target.style.display = 'none'; }}
  />
) : null;

export default function PronoCard({ prono }) {
  const date = new Date(prono.matchDate).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const isPast   = new Date(prono.matchDate) < new Date();
  const confColor = prono.confidence >= 70 ? 'var(--green-live)'
                  : prono.confidence >= 40  ? 'var(--blue)'
                  : 'var(--orange)';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.league}>{prono.league}</span>
        <span className={styles.date}>{date}</span>
      </div>

      <div className={styles.match}>
        <div className={styles.team}>
          <TeamLogo teamId={prono.homeTeamId} name={prono.homeTeam} />
          <span>{prono.homeTeam}</span>
        </div>
        <div className={styles.scorePredict}>
          {prono.scoreHome !== null && prono.scoreHome !== undefined
            ? <><span className={styles.scoreNum}>{prono.scoreHome}</span>
                <span className={styles.scoreDash}>-</span>
                <span className={styles.scoreNum}>{prono.scoreAway}</span></>
            : <span className={styles.vs}>VS</span>
          }
        </div>
        <div className={`${styles.team} ${styles.teamRight}`}>
          <span>{prono.awayTeam}</span>
          <TeamLogo teamId={prono.awayTeamId} name={prono.awayTeam} />
        </div>
      </div>

      {prono.prediction && (
        <div className={styles.prediction}>
          <span className={styles.predLabel}>Analyse</span>
          <span className={styles.predValue}>{prono.prediction}</span>
        </div>
      )}

      <div className={styles.confidence}>
        <span className={styles.confLabel}>Confiance</span>
        <div className={styles.confBar}>
          <div className={styles.confFill} style={{ width: `${prono.confidence}%`, background: confColor }} />
        </div>
        <span className={styles.confPct} style={{ color: confColor }}>{prono.confidence}%</span>
      </div>

      {prono.username && (
        <div className={styles.pronoAuthor}>Par {prono.username}</div>
      )}

      {isPast && prono.result && prono.result !== 'EN_ATTENTE' && (
        <div className={`${styles.result} ${prono.result === 'CORRECT' ? styles.correct : styles.wrong}`}>
          {prono.result === 'CORRECT' ? '✅ CORRECT' : '❌ RATÉ'}
        </div>
      )}
      {(!prono.result || prono.result === 'EN_ATTENTE') && (
        <div className={styles.pending}>⏳ En attente du résultat</div>
      )}
    </div>
  );
}
