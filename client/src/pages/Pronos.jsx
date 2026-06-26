import { usePronostics } from '../hooks/api';
import PronoCard from '../components/PronoCard';
import styles from './Pronos.module.css';

export default function Pronos() {
  const { data: pronostics, isLoading } = usePronostics();
  const total = pronostics?.length ?? 0;
  const correct = pronostics?.filter(p => p.result === 'CORRECT').length ?? 0;
  const rate = total > 0 ? Math.round(correct / total * 100) : 0;

  return (
    <div className="container" style={{padding:'1.5rem var(--gutter)'}}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mes Pronostics</h1>
        {total > 0 && (
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{correct}/{total}</span>
              <span className={styles.statLabel}>Pronostics corrects</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue} style={{color: rate >= 60 ? 'var(--green-live)' : rate >= 40 ? 'var(--blue)' : 'var(--orange)'}}>{rate}%</span>
              <span className={styles.statLabel}>Taux de réussite</span>
            </div>
          </div>
        )}
      </div>
      {isLoading && <div className={styles.empty}>Chargement...</div>}
      {!isLoading && (!pronostics || pronostics.length === 0) && (
        <div className={styles.empty}>Aucun pronostic pour le moment.</div>
      )}
      <div className={styles.grid}>
        {(pronostics ?? []).map(p => <PronoCard key={p.id} prono={p} />)}
      </div>
    </div>
  );
}
