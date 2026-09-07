// MegaMenu — panneau déroulant sous "Matchs" : liste de compétitions + raccourcis.

import { useNavigate } from 'react-router-dom';
import styles from '../Navbar.module.css';

const COMPETITIONS = [
  { name: 'Champions League', logo: 'https://media.api-sports.io/football/leagues/2.png', path: '/ligue-des-champions' },
  { name: 'Europa League', logo: 'https://media.api-sports.io/football/leagues/3.png', path: '/matches' },
  { name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png', path: '/matches' },
  { name: 'Ligue 1', logo: 'https://media.api-sports.io/football/leagues/61.png', path: '/matches' },
  { name: 'Bundesliga', logo: 'https://media.api-sports.io/football/leagues/78.png', path: '/matches' },
  { name: 'Serie A', logo: 'https://media.api-sports.io/football/leagues/135.png', path: '/matches' },
  { name: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png', path: '/matches' },
];

export default function MegaMenu({ onClose }) {
  const navigate = useNavigate();
  const go = (path) => { navigate(path); onClose(); };

  return (
    <div className={styles.megaMenu}>
      <div className={styles.megaInner}>
        <div className={styles.megaSection}>
          <div className={styles.megaLabel}>Compétitions populaires</div>
          <div className={styles.megaGrid}>
            {COMPETITIONS.map((c) => (
              <button key={c.name} className={styles.megaItem} onClick={() => go(c.path)}>
                <img src={c.logo} alt="" width={20} height={20} onError={(e) => (e.target.style.display = 'none')} />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className={styles.megaDivider} />
        <div className={styles.megaAside}>
          <div className={styles.megaLabel}>Explorer</div>
          <button className={styles.megaAsideItem} onClick={() => go('/matches')}>Tous les matchs</button>
          <button className={styles.megaAsideItem} onClick={() => go('/classements')}>Classements</button>
        </div>
      </div>
    </div>
  );
}
