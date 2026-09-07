// ============================================================================
//  Matches — calendrier des matchs : un sélecteur de date (±10 jours) et un
//  filtre par compétition. Les matchs sont regroupés par ligue.
// ============================================================================

import { useState, useRef, useEffect } from 'react';
import { useFixturesByDate } from '../hooks/api';
import MatchCard from '../components/MatchCard';
import styles from './Matches.module.css';

// Ligues affichées en premier (les autres passent après).
const PRIORITY_LEAGUES = new Set([2, 3, 39, 61, 78, 135, 140]);
// Onglets du filtre (null = toutes les compétitions).
const LEAGUES = [
  { id: null,  label: 'Toutes' },
  { id: 2,     label: 'Champions League' },
  { id: 3,     label: 'Europa League' },
  { id: 39,    label: 'Premier League' },
  { id: 61,    label: 'Ligue 1' },
  { id: 78,    label: 'Bundesliga' },
  { id: 135,   label: 'Serie A' },
  { id: 140,   label: 'La Liga' },
];

const fmt = (d) => d.toISOString().split('T')[0]; // Date -> "2026-09-08"

export default function Matches() {
  const [date, setDate]   = useState(new Date()); // date sélectionnée
  const [filter, setFilter] = useState(null);     // ligue filtrée (null = toutes)
  const dateStr = fmt(date);
  const { data: fixtures, isLoading } = useFixturesByDate(dateStr); // recharge à chaque date
  const today = fmt(new Date());
  const todayBtnRef = useRef(null);

  // Au chargement : fait défiler le sélecteur de dates pour centrer "aujourd'hui".
  useEffect(() => {
    todayBtnRef.current?.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  }, []);

  // Applique le filtre puis met les compétitions prioritaires en tête.
  const filtered = (fixtures ?? [])
    .filter(f => !filter || f.league.id === filter)
    .sort((a, b) => {
      const pa = PRIORITY_LEAGUES.has(a.league.id) ? 0 : 1;
      const pb = PRIORITY_LEAGUES.has(b.league.id) ? 0 : 1;
      return pa - pb;
    });

  // Regroupe les matchs par ligue : { [id]: { name, logo, matches: [...] } }
  const grouped = {};
  filtered.forEach(f => {
    const key = f.league.id;
    if (!grouped[key]) grouped[key] = { name: f.league.name, logo: f.league.logo, matches: [] };
    grouped[key].matches.push(f);
  });

  // Fenêtre glissante : 10 jours avant / 10 jours après aujourd'hui
  const days = [];
  for (let i = -10; i <= 10; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Matchs</h1>
      </div>

      {/* Date picker (OneFootball style) */}
      <div className={styles.datePicker}>
        {days.map(d => {
          const ds = fmt(d);
          const isToday = ds === today;
          const isSelected = ds === dateStr;
          return (
            <button
              key={ds}
              ref={isToday ? todayBtnRef : null}
              className={`${styles.dayBtn} ${isSelected ? styles.daySelected : ''} ${isToday && !isSelected ? styles.dayToday : ''}`}
              onClick={() => setDate(new Date(d))}
            >
              <span className={styles.dayName}>{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
              <span className={styles.dayNum}>{d.getDate()}</span>
              {isToday && <span className={styles.dayTodayDot} />}
            </button>
          );
        })}
      </div>

      {/* Filtre ligues */}
      <div className={styles.leagueFilter}>
        {LEAGUES.map(l => (
          <button
            key={l.id ?? 'all'}
            className={`${styles.filterChip} ${filter === l.id ? styles.filterActive : ''}`}
            onClick={() => setFilter(l.id)}
          >
            {l.id && (
              <img src={`https://media.api-sports.io/football/leagues/${l.id}.png`} alt="" width={14} height={14}
                onError={e => e.target.style.display = 'none'} />
            )}
            {l.label}
          </button>
        ))}
      </div>

      {/* Matchs */}
      <div className={styles.content}>
        {isLoading && (
          Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8, marginBottom: 6 }} />
          ))
        )}
        {!isLoading && Object.keys(grouped).length === 0 && (
          <div className={styles.empty}>Aucun match trouvé pour cette date.</div>
        )}
        {Object.values(grouped).map(group => (
          <div key={group.name} className={styles.group}>
            <div className={styles.groupHeader}>
              <img src={group.logo} alt="" width={18} height={18} onError={e => e.target.style.display = 'none'} />
              <span className={styles.groupName}>{group.name}</span>
              <span className={styles.groupCount}>{group.matches.length} match{group.matches.length > 1 ? 's' : ''}</span>
            </div>
            <div className={styles.matchList}>
              {group.matches.map(f => <MatchCard key={f.fixture.id} fixture={f} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
