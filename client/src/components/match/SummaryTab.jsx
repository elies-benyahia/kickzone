// SummaryTab — onglet "Résumé" : timeline des événements (buts, cartons, remplacements).

import styles from '../../pages/Match.module.css';

const iconFor = (type, detail) => {
  if (type === 'Goal') return detail?.includes('Missed Penalty') ? '❌' : '⚽';
  if (type === 'Card') return detail?.includes('Yellow') ? '🟨' : '🟥';
  if (type === 'subst') return '🔄';
  return '•';
};

export default function SummaryTab({ events, fixture }) {
  const allEvents = events ?? fixture?.events ?? [];
  if (allEvents.length === 0) {
    return <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>Pas d'événements disponibles pour ce match.</p>;
  }
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
