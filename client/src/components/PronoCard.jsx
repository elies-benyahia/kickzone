import styles from './PronoCard.module.css';

export default function PronoCard({ prono }) {
  const date = new Date(prono.matchDate).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
  const isPast = new Date(prono.matchDate) < new Date();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.league}>{prono.league}</span>
        <span className={styles.date}>{date}</span>
      </div>
      <div className={styles.match}>{prono.homeTeam} <span>vs</span> {prono.awayTeam}</div>
      <div className={styles.prediction}>
        <span className={styles.label}>Ma prédiction</span>
        <span className={styles.value}>{prono.prediction}</span>
      </div>
      <div className={styles.confidence}>
        <span className={styles.label}>Confiance</span>
        <div className={styles.bar}>
          <div className={styles.fill} style={{ width:`${prono.confidence}%`, background: prono.confidence >= 70 ? 'var(--green-live)' : prono.confidence >= 40 ? 'var(--blue)' : 'var(--orange)' }}/>
        </div>
        <span className={styles.pct}>{prono.confidence}%</span>
      </div>
      {isPast && prono.result && (
        <div className={`${styles.result} ${prono.result === 'CORRECT' ? styles.correct : styles.wrong}`}>
          {prono.result === 'CORRECT' ? '✅ CORRECT' : '❌ RATÉ'} — {prono.result === 'CORRECT' ? 'Bien joué !' : 'Dommage'}
        </div>
      )}
    </div>
  );
}
