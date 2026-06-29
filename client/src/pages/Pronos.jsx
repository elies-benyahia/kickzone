import { useState } from 'react';
import { usePronostics } from '../hooks/api';
import PronoCard from '../components/PronoCard';
import styles from './Pronos.module.css';

const FILTERS = [
  { key: 'all',    label: 'Tous' },
  { key: 'CORRECT', label: '✅ Corrects' },
  { key: 'RATE',   label: '❌ Ratés' },
  { key: null,     label: '⏳ En attente' },
];

export default function Pronos() {
  const { data: pronostics, isLoading } = usePronostics();
  const [filter, setFilter] = useState('all');

  const total   = pronostics?.length ?? 0;
  const correct = pronostics?.filter(p => p.result === 'CORRECT').length ?? 0;
  const rate    = total > 0 ? Math.round(correct / total * 100) : 0;

  const filtered = (pronostics ?? []).filter(p => {
    if (filter === 'all') return true;
    if (filter === null) return p.result === null;
    return p.result === filter;
  });

  const rateColor = rate >= 60 ? 'var(--green-live)' : rate >= 40 ? 'var(--blue)' : 'var(--orange)';

  return (
    <div className="container" style={{padding:'1.5rem var(--gutter)'}}>
      <div className={styles.headerTop}>
        <h1 className={styles.title}>Mes Pronostics</h1>
      </div>

      {total > 0 && (
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{color:rateColor}}>{rate}%</span>
            <span className={styles.statLbl}>Taux de réussite</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{color:'var(--green-live)'}}>{correct}</span>
            <span className={styles.statLbl}>Corrects</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{color:'var(--orange)'}}>{pronostics?.filter(p => p.result === 'RATE').length ?? 0}</span>
            <span className={styles.statLbl}>Ratés</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{pronostics?.filter(p => !p.result).length ?? 0}</span>
            <span className={styles.statLbl}>En attente</span>
          </div>
          <div className={styles.progressWrap}>
            <div className={styles.progressBar} style={{width:`${rate}%`, background:rateColor}} />
          </div>
        </div>
      )}

      <div className={styles.filters}>
        {FILTERS.map(f => (
          <button
            key={String(f.key)}
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <div className={styles.empty}>Chargement...</div>}
      {!isLoading && filtered.length === 0 && (
        <div className={styles.empty}>Aucun pronostic dans cette catégorie.</div>
      )}
      <div className={styles.grid}>
        {filtered.map(p => <PronoCard key={p.id} prono={p} />)}
      </div>
    </div>
  );
}
