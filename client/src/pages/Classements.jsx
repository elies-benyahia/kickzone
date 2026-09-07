// ============================================================================
//  Classements — classement d'un championnat, avec des onglets pour changer
//  de compétition. Le tableau lui-même est le composant <StandingsTable/>.
// ============================================================================

import { useState } from 'react';
import { useStandings } from '../hooks/api';
import StandingsTable from '../components/StandingsTable';
import styles from './Classements.module.css';

// Onglets : id = identifiant de la ligue dans l'API-Football.
const LEAGUES = [
  { id: 61,  label: 'Ligue 1',         flag: '🇫🇷' },
  { id: 39,  label: 'Premier League',  flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 140, label: 'La Liga',         flag: '🇪🇸' },
  { id: 78,  label: 'Bundesliga',      flag: '🇩🇪' },
  { id: 135, label: 'Serie A',         flag: '🇮🇹' },
  { id: 2,   label: 'Champions League', flag: '🏆' },
];

export default function Classements() {
  const [active, setActive] = useState(61);                 // ligue affichée (Ligue 1 par défaut)
  const { data: standings, isLoading } = useStandings(active); // recharge à chaque changement d'onglet

  return (
    <div className="container" style={{ padding: '1.5rem var(--gutter)' }}>
      <h1 className={styles.title}>Classements</h1>

      {/* Onglets de compétitions */}
      <div className={styles.tabs}>
        {LEAGUES.map(l => (
          <button
            key={l.id}
            className={`${styles.tab} ${active === l.id ? styles.tabActive : ''}`}
            onClick={() => setActive(l.id)}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>

      {/* Tableau (ou "Chargement..." le temps de la requête) */}
      <div className={styles.tableWrap}>
        {isLoading && <div className={styles.loading}>Chargement...</div>}
        {!isLoading && <StandingsTable standings={standings} />}
      </div>

      <div className={styles.legend}>
        <span className={styles.legendPromo}>■ Promotion / UCL</span>
        <span className={styles.legendRelegate}>■ Relégation</span>
      </div>
    </div>
  );
}
