// LeftSidebar (accueil) — matchs du jour des grandes ligues, regroupés par compétition.

import { Link } from 'react-router-dom';
import MatchCard from '../MatchCard';
import styles from '../../pages/Home.module.css';

// Ligues affichées ici (id API-Football) : C1/C3, 5 grands championnats + Coupes/sélections.
const ALLOWED_LEAGUES = new Set([
  2, 3, 848, 5, 6, 39, 40, 61, 62, 78, 79, 135, 136, 140, 141,
  88, 94, 144, 207, 253, 262, 4, 9, 13, 34, 32, 33,
]);

// Rectangles gris animés pendant le chargement.
function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />
      ))}
    </div>
  );
}

export default function LeftSidebar({ fixtures }) {
  if (!fixtures) return <Skeleton />;

  // Regroupe les matchs des grandes ligues par nom de compétition.
  const grouped = {};
  fixtures
    .filter((f) => ALLOWED_LEAGUES.has(f.league.id))
    .forEach((f) => {
      (grouped[f.league.name] ||= []).push(f);
    });

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Matchs du jour</h2>
        <Link to="/matches" className={styles.seeAll}>Voir tout</Link>
      </div>

      {Object.entries(grouped).map(([league, matches]) => (
        <div key={league} className={styles.leagueGroup}>
          <div className={styles.leagueName}>
            <img src={matches[0].league.logo} alt="" width={14} height={14} onError={(e) => (e.target.style.display = 'none')} />
            {league}
          </div>
          {matches.map((f) => <MatchCard key={f.fixture.id} fixture={f} />)}
        </div>
      ))}

      {Object.keys(grouped).length === 0 && (
        <p className={styles.empty}>Aucun match majeur aujourd'hui.</p>
      )}
    </aside>
  );
}
