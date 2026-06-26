import { useState } from 'react';
import { useFixturesByDate } from '../hooks/api';
import MatchCard from '../components/MatchCard';
import styles from './Matches.module.css';

const LEAGUES = [
  { id: null, label: 'Toutes' }, { id: 2, label: 'UCL' }, { id: 61, label: 'Ligue 1' },
  { id: 39, label: 'PL' }, { id: 140, label: 'Liga' }, { id: 78, label: 'Bundesliga' }, { id: 135, label: 'Serie A' },
];

const fmt = (d) => d.toISOString().split('T')[0];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

export default function Matches() {
  const [date, setDate] = useState(new Date());
  const [leagueFilter, setLeagueFilter] = useState(null);
  const dateStr = fmt(date);
  const { data: fixtures, isLoading } = useFixturesByDate(dateStr);

  const filtered = leagueFilter ? (fixtures ?? []).filter(f => f.league.id === leagueFilter) : (fixtures ?? []);
  const grouped = {};
  filtered.forEach(f => {
    const name = f.league.name;
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(f);
  });

  const days = Array.from({length:15}, (_, i) => addDays(new Date(), i - 7));

  return (
    <div className="container" style={{padding:'1.5rem var(--gutter)'}}>
      <h1 className={styles.title}>Calendrier des matchs</h1>

      <div className={styles.datePicker}>
        {days.map(d => {
          const ds = fmt(d);
          const isToday = ds === fmt(new Date());
          const isSelected = ds === dateStr;
          return (
            <button key={ds} className={`${styles.dayBtn} ${isSelected ? styles.daySelected : ''} ${isToday ? styles.dayToday : ''}`} onClick={() => setDate(d)}>
              <span className={styles.dayName}>{d.toLocaleDateString('fr-FR',{weekday:'short'})}</span>
              <span className={styles.dayNum}>{d.getDate()}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.leagueFilter}>
        {LEAGUES.map(l => (
          <button key={l.id ?? 'all'} className={`${styles.filterBtn} ${leagueFilter === l.id ? styles.filterActive : ''}`} onClick={() => setLeagueFilter(l.id)}>
            {l.label}
          </button>
        ))}
      </div>

      {isLoading && <div className={styles.loading}>Chargement...</div>}
      {!isLoading && Object.keys(grouped).length === 0 && <div className={styles.empty}>Aucun match trouvé pour cette date.</div>}
      {Object.entries(grouped).map(([league, matches]) => (
        <div key={league} className={styles.group}>
          <div className={styles.groupHeader}>
            <img src={matches[0].league.logo} alt="" width={20} height={20} onError={e=>e.target.style.display='none'} />
            <span>{league}</span>
          </div>
          <div className={styles.matchList}>
            {matches.map(f => <MatchCard key={f.fixture.id} fixture={f} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
