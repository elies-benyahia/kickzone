// Pronos — liste publique des pronostics + statistiques (taux de réussite).
// Le formulaire de création est dans components/PronoForm.jsx.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePronostics } from '../hooks/api';
import { useAuth } from '../contexts/AuthContext';
import PronoCard from '../components/PronoCard';
import PronoForm from '../components/PronoForm';
import styles from './Pronos.module.css';

// Onglets de filtre. "all" = tout, null = en attente de résultat.
const FILTERS = [
  { key: 'all',     label: 'Tous' },
  { key: 'CORRECT', label: '✅ Corrects' },
  { key: 'RATE',    label: '❌ Ratés' },
  { key: null,      label: '⏳ En attente' },
];

export default function Pronos() {
  const { data: pronostics, isLoading } = usePronostics();
  const { user } = useAuth();                 // pour afficher (ou non) le bouton "Nouveau prono"
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

  // Statistiques globales de la communauté.
  const total   = pronostics?.length ?? 0;
  const correct = pronostics?.filter(p => p.result === 'CORRECT').length ?? 0;
  const rate    = total > 0 ? Math.round(correct / total * 100) : 0;

  // Applique le filtre d'onglet.
  const filtered = (pronostics ?? []).filter(p => {
    if (filter === 'all') return true;
    if (filter === null) return p.result === 'EN_ATTENTE' || !p.result;
    return p.result === filter;
  });

  const rateColor = rate >= 60 ? 'var(--green-live)' : rate >= 40 ? 'var(--blue)' : 'var(--orange)';

  return (
    <div className="container" style={{ padding: '1.5rem var(--gutter)' }}>
      {showForm && <PronoForm onClose={() => setShowForm(false)} />}

      <div className={styles.headerTop}>
        <div>
          <h1 className={styles.title}>Pronostics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            Les pronostics de la communauté KickZone
          </p>
        </div>
        {user ? (
          <button className={styles.newPronoBtn} onClick={() => setShowForm(true)}>
            + Nouveau prono
          </button>
        ) : (
          <Link to="/connexion" className={styles.newPronoBtn}>
            Se connecter pour pronostiquer
          </Link>
        )}
      </div>

      {total > 0 && (
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{ color: rateColor }}>{rate}%</span>
            <span className={styles.statLbl}>Taux de réussite</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{ color: 'var(--green-live)' }}>{correct}</span>
            <span className={styles.statLbl}>Corrects</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{ color: 'var(--orange)' }}>{pronostics?.filter(p => p.result === 'RATE').length ?? 0}</span>
            <span className={styles.statLbl}>Ratés</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{total}</span>
            <span className={styles.statLbl}>Total</span>
          </div>
          <div className={styles.progressWrap}>
            <div className={styles.progressBar} style={{ width: `${rate}%`, background: rateColor }} />
          </div>
        </div>
      )}

      <div className={styles.filters}>
        {FILTERS.map(f => (
          <button key={String(f.key)}
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.key)}>
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
