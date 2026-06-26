import { useState } from 'react';
import { useStandings } from '../hooks/api';
import StandingsTable from '../components/StandingsTable';
import styles from './Classements.module.css';

const LEAGUES = [
  { id:61,  label:'Ligue 1',      flag:'🇫🇷' },
  { id:39,  label:'Premier League', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id:140, label:'La Liga',      flag:'🇪🇸' },
  { id:78,  label:'Bundesliga',   flag:'🇩🇪' },
  { id:135, label:'Serie A',      flag:'🇮🇹' },
  { id:2,   label:'Champions League', flag:'🏆' },
];

export default function Classements() {
  const [active, setActive] = useState(61);
  const { data: standings, isLoading } = useStandings(active);

  return (
    <div className="container" style={{padding:'1.5rem var(--gutter)'}}>
      <h1 className={styles.title}>Classements</h1>
      <div className={styles.tabs}>
        {LEAGUES.map(l => (
          <button key={l.id} className={`${styles.tab} ${active === l.id ? styles.tabActive : ''}`} onClick={() => setActive(l.id)}>
            {l.flag} {l.label}
          </button>
        ))}
      </div>
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
