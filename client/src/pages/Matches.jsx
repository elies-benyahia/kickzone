/* Matches.jsx — OneFootball style redesign */
import { useState } from 'react';
import { useFixturesByDate } from '../hooks/api';
import MatchCard from '../components/MatchCard';
import styles from './Matches.module.css';

const PRIORITY_LEAGUES = new Set([1, 2, 3, 39, 61, 78, 135, 140]);
const LEAGUES = [
  { id: null,  label: 'Toutes' },
  { id: 1,     label: 'Coupe du Monde' },
  { id: 2,     label: 'Champions League' },
  { id: 3,     label: 'Europa League' },
  { id: 39,    label: 'Premier League' },
  { id: 61,    label: 'Ligue 1' },
  { id: 78,    label: 'Bundesliga' },
  { id: 135,   label: 'Serie A' },
  { id: 140,   label: 'La Liga' },
];

const fmt = (d) => d.toISOString().split('T')[0];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

export default function Matches() {
  const [date, setDate]   = useState(new Date());
  const [filter, setFilter] = useState(null);
  const dateStr = fmt(date);
  const { data: fixtures, isLoading } = useFixturesByDate(dateStr);
  const today = fmt(new Date());

  const filtered = (fixtures ?? [])
    .filter(f => !filter || f.league.id === filter)
    .sort((a, b) => {
      const pa = PRIORITY_LEAGUES.has(a.league.id) ? 0 : 1;
      const pb = PRIORITY_LEAGUES.has(b.league.id) ? 0 : 1;
      if (pa !== pb) return pa - pb;
      if (a.league.id === 1) return -1;
      if (b.league.id === 1) return 1;
      return 0;
    });

  const grouped = {};
  filtered.forEach(f => {
    const key = f.league.id;
    if (!grouped[key]) grouped[key] = { name: f.league.name, logo: f.league.logo, matches: [] };
    grouped[key].matches.push(f);
  });

  const days = Array.from({ length: 15 }, (_, i) => addDays(new Date(), i - 7));

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
              className={`${styles.dayBtn} ${isSelected ? styles.daySelected : ''} ${isToday && !isSelected ? styles.dayToday : ''}`}
              onClick={() => setDate(d)}
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
