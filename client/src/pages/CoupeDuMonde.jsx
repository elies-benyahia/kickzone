import { useState } from 'react';
import styles from './CoupeDuMonde.module.css';

/* ─── Données Coupe du Monde 2026 ──────────────────────────── */

const GROUPS = [
  {
    id: 'A',
    teams: [
      { name: 'Mexique',    flag: 'MX', pts: 9, j: 3, v: 3, n: 0, d: 0, gf: 7, ga: 2, qualified: true,  winner: true },
      { name: 'Équateur',   flag: 'EC', pts: 6, j: 3, v: 2, n: 0, d: 1, gf: 5, ga: 3, qualified: true,  winner: false },
      { name: 'Suisse',     flag: 'CH', pts: 3, j: 3, v: 1, n: 0, d: 2, gf: 4, ga: 5, qualified: false, winner: false },
      { name: 'Curaçao',    flag: 'CW', pts: 0, j: 3, v: 0, n: 0, d: 3, gf: 1, ga: 7, qualified: false, winner: false },
    ],
  },
  {
    id: 'B',
    teams: [
      { name: 'Portugal',   flag: 'PT', pts: 7, j: 3, v: 2, n: 1, d: 0, gf: 6, ga: 2, qualified: true,  winner: true },
      { name: 'Canada',     flag: 'CA', pts: 4, j: 3, v: 1, n: 1, d: 1, gf: 4, ga: 4, qualified: true,  winner: false },
      { name: 'Afrique du Sud', flag: 'ZA', pts: 4, j: 3, v: 1, n: 1, d: 1, gf: 3, ga: 3, qualified: false, winner: false },
      { name: 'Qatar',      flag: 'QA', pts: 0, j: 3, v: 0, n: 0, d: 3, gf: 1, ga: 5, qualified: false, winner: false },
    ],
  },
  {
    id: 'C',
    teams: [
      { name: 'Espagne',    flag: 'ES', pts: 7, j: 3, v: 2, n: 1, d: 0, gf: 8, ga: 2, qualified: true,  winner: true },
      { name: 'Allemagne',  flag: 'DE', pts: 7, j: 3, v: 2, n: 1, d: 0, gf: 7, ga: 2, qualified: true,  winner: false },
      { name: 'Écosse',     flag: 'GB-SCT', pts: 1, j: 3, v: 0, n: 1, d: 2, gf: 2, ga: 7, qualified: false, winner: false },
      { name: 'Haïti',      flag: 'HT', pts: 1, j: 3, v: 0, n: 1, d: 2, gf: 1, ga: 7, qualified: false, winner: false },
    ],
  },
  {
    id: 'D',
    teams: [
      { name: 'États-Unis', flag: 'US', pts: 9, j: 3, v: 3, n: 0, d: 0, gf: 8, ga: 1, qualified: true,  winner: true },
      { name: 'Pays-Bas',   flag: 'NL', pts: 6, j: 3, v: 2, n: 0, d: 1, gf: 6, ga: 3, qualified: true,  winner: false },
      { name: 'Turquie',    flag: 'TR', pts: 3, j: 3, v: 1, n: 0, d: 2, gf: 3, ga: 5, qualified: false, winner: false },
      { name: 'Pérou',      flag: 'PE', pts: 0, j: 3, v: 0, n: 0, d: 3, gf: 1, ga: 9, qualified: false, winner: false },
    ],
  },
  {
    id: 'E',
    teams: [
      { name: 'Japon',      flag: 'JP', pts: 7, j: 3, v: 2, n: 1, d: 0, gf: 5, ga: 3, qualified: true,  winner: true },
      { name: 'Côte d\'Ivoire', flag: 'CI', pts: 4, j: 3, v: 1, n: 1, d: 1, gf: 4, ga: 4, qualified: true, winner: false },
      { name: 'Sénégal',    flag: 'SN', pts: 4, j: 3, v: 1, n: 1, d: 1, gf: 3, ga: 3, qualified: false, winner: false },
      { name: 'Curaçao',    flag: 'CW', pts: 0, j: 3, v: 0, n: 0, d: 3, gf: 0, ga: 2, qualified: false, winner: false },
    ],
  },
  {
    id: 'F',
    teams: [
      { name: 'Maroc',      flag: 'MA', pts: 7, j: 3, v: 2, n: 1, d: 0, gf: 5, ga: 1, qualified: true,  winner: true },
      { name: 'Belgique',   flag: 'BE', pts: 6, j: 3, v: 2, n: 0, d: 1, gf: 5, ga: 2, qualified: true,  winner: false },
      { name: 'Algérie',    flag: 'DZ', pts: 4, j: 3, v: 1, n: 1, d: 1, gf: 4, ga: 5, qualified: false, winner: false },
      { name: 'Tunisie',    flag: 'TN', pts: 0, j: 3, v: 0, n: 0, d: 3, gf: 1, ga: 7, qualified: false, winner: false },
    ],
  },
  {
    id: 'G',
    teams: [
      { name: 'Brésil',     flag: 'BR', pts: 9, j: 3, v: 3, n: 0, d: 0, gf: 8, ga: 2, qualified: true,  winner: true },
      { name: 'Ghana',      flag: 'GH', pts: 4, j: 3, v: 1, n: 1, d: 1, gf: 4, ga: 4, qualified: true,  winner: false },
      { name: 'Nouvelle-Zélande', flag: 'NZ', pts: 2, j: 3, v: 0, n: 2, d: 1, gf: 2, ga: 4, qualified: false, winner: false },
      { name: 'Iran',       flag: 'IR', pts: 1, j: 3, v: 0, n: 1, d: 2, gf: 1, ga: 5, qualified: false, winner: false },
    ],
  },
  {
    id: 'H',
    teams: [
      { name: 'France',     flag: 'FR', pts: 9, j: 3, v: 3, n: 0, d: 0, gf: 10, ga: 2, qualified: true,  winner: true },
      { name: 'Suède',      flag: 'SE', pts: 4, j: 3, v: 1, n: 1, d: 1, gf: 5,  ga: 5, qualified: true,  winner: false },
      { name: 'Uruguay',    flag: 'UY', pts: 3, j: 3, v: 1, n: 0, d: 2, gf: 3,  ga: 6, qualified: false, winner: false },
      { name: 'Arabie Saoudite', flag: 'SA', pts: 0, j: 3, v: 0, n: 0, d: 3, gf: 2, ga: 7, qualified: false, winner: false },
    ],
  },
  {
    id: 'I',
    teams: [
      { name: 'Angleterre', flag: 'GB', pts: 7, j: 3, v: 2, n: 1, d: 0, gf: 7, ga: 2, qualified: true,  winner: true },
      { name: 'Croatie',    flag: 'HR', pts: 5, j: 3, v: 1, n: 2, d: 0, gf: 4, ga: 3, qualified: true,  winner: false },
      { name: 'Rép. Dem. Congo', flag: 'CD', pts: 4, j: 3, v: 1, n: 1, d: 1, gf: 3, ga: 3, qualified: false, winner: false },
      { name: 'Irak',       flag: 'IQ', pts: 0, j: 3, v: 0, n: 0, d: 3, gf: 1, ga: 7, qualified: false, winner: false },
    ],
  },
  {
    id: 'J',
    teams: [
      { name: 'Argentine',  flag: 'AR', pts: 7, j: 3, v: 2, n: 1, d: 0, gf: 7, ga: 3, qualified: true,  winner: true },
      { name: 'Autriche',   flag: 'AT', pts: 5, j: 3, v: 1, n: 2, d: 0, gf: 5, ga: 4, qualified: true,  winner: false },
      { name: 'Jordanie',   flag: 'JO', pts: 1, j: 3, v: 0, n: 1, d: 2, gf: 2, ga: 5, qualified: false, winner: false },
      { name: 'Paraguay',   flag: 'PY', pts: 4, j: 3, v: 1, n: 1, d: 1, gf: 3, ga: 5, qualified: false, winner: false },
    ],
  },
  {
    id: 'K',
    teams: [
      { name: 'Australie',  flag: 'AU', pts: 6, j: 3, v: 2, n: 0, d: 1, gf: 5, ga: 3, qualified: true,  winner: true },
      { name: 'Corée du Sud', flag: 'KR', pts: 4, j: 3, v: 1, n: 1, d: 1, gf: 4, ga: 4, qualified: true, winner: false },
      { name: 'Ouzbékistan', flag: 'UZ', pts: 2, j: 3, v: 0, n: 2, d: 1, gf: 2, ga: 4, qualified: false, winner: false },
      { name: 'Tchéquie',   flag: 'CZ', pts: 1, j: 3, v: 0, n: 1, d: 2, gf: 2, ga: 2, qualified: false, winner: false },
    ],
  },
  {
    id: 'L',
    teams: [
      { name: 'Italie',     flag: 'IT', pts: 7, j: 3, v: 2, n: 1, d: 0, gf: 6, ga: 2, qualified: true,  winner: true },
      { name: 'Bosnie',     flag: 'BA', pts: 4, j: 3, v: 1, n: 1, d: 1, gf: 4, ga: 3, qualified: true,  winner: false },
      { name: 'Panama',     flag: 'PA', pts: 2, j: 3, v: 0, n: 2, d: 1, gf: 2, ga: 5, qualified: false, winner: false },
      { name: 'Norvège',    flag: 'NO', pts: 3, j: 3, v: 1, n: 0, d: 2, gf: 3, ga: 5, qualified: false, winner: false },
    ],
  },
];

const R32 = [
  { home: 'Canada',          away: 'Afrique du Sud', scoreHome: 1,    scoreAway: 0,    date: '28 Juin',  played: true },
  { home: 'Brésil',          away: 'Japon',          scoreHome: 2,    scoreAway: 1,    date: '29 Juin',  played: true },
  { home: 'Allemagne',       away: 'Paraguay',       scoreHome: null, scoreAway: null, date: '29 Juin',  played: false },
  { home: 'Pays-Bas',        away: 'Maroc',          scoreHome: null, scoreAway: null, date: '29 Juin',  played: false },
  { home: 'Côte d\'Ivoire',  away: 'Norvège',        scoreHome: null, scoreAway: null, date: '30 Juin',  played: false },
  { home: 'France',          away: 'Suède',          scoreHome: null, scoreAway: null, date: '30 Juin',  played: false },
  { home: 'Mexique',         away: 'Équateur',       scoreHome: null, scoreAway: null, date: '30 Juin',  played: false },
  { home: 'Angleterre',      away: 'Rép. Dem. Congo',scoreHome: null, scoreAway: null, date: '1er Juil', played: false },
  { home: 'Belgique',        away: 'Sénégal',        scoreHome: null, scoreAway: null, date: '1er Juil', played: false },
  { home: 'États-Unis',      away: 'Bosnie',         scoreHome: null, scoreAway: null, date: '1er Juil', played: false },
  { home: 'Espagne',         away: 'Algérie',        scoreHome: null, scoreAway: null, date: '2 Juil',  played: false },
  { home: 'Portugal',        away: 'Ghana',          scoreHome: null, scoreAway: null, date: '2 Juil',  played: false },
  { home: 'Argentine',       away: 'Autriche',       scoreHome: null, scoreAway: null, date: '2 Juil',  played: false },
  { home: 'Australie',       away: 'Corée du Sud',   scoreHome: null, scoreAway: null, date: '3 Juil',  played: false },
  { home: 'Italie',          away: 'Bosnie',         scoreHome: null, scoreAway: null, date: '3 Juil',  played: false },
  { home: 'Japon',           away: 'Suède',          scoreHome: null, scoreAway: null, date: '3 Juil',  played: false },
];

const FLAG_URL = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

function GroupTable({ group }) {
  return (
    <div className={styles.groupCard}>
      <div className={styles.groupHeader}>
        <span className={styles.groupLetter}>Groupe {group.id}</span>
        <span className={styles.groupQual}>2 qualifiés</span>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thTeam}>Équipe</th>
            <th>J</th><th>V</th><th>N</th><th>D</th>
            <th>+/-</th><th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {group.teams.map((t, i) => (
            <tr key={t.name} className={t.qualified ? styles.rowQual : styles.rowElim}>
              <td className={styles.tdTeam}>
                <span className={styles.rank}>{i + 1}</span>
                <img
                  src={FLAG_URL(t.flag)}
                  alt={t.name}
                  className={styles.flag}
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <span className={styles.teamName}>{t.name}</span>
                {t.winner && <span className={styles.badge1}>1er</span>}
              </td>
              <td>{t.j}</td>
              <td>{t.v}</td>
              <td>{t.n}</td>
              <td>{t.d}</td>
              <td className={t.gf - t.ga > 0 ? styles.posGD : styles.negGD}>
                {t.gf - t.ga > 0 ? '+' : ''}{t.gf - t.ga}
              </td>
              <td className={styles.pts}>{t.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatchRow({ match }) {
  return (
    <div className={`${styles.matchRow} ${match.played ? styles.matchPlayed : styles.matchUpcoming}`}>
      <span className={styles.matchDate}>{match.date}</span>
      <div className={styles.matchTeams}>
        <span className={styles.matchTeam}>{match.home}</span>
        <div className={styles.matchScore}>
          {match.played
            ? <><span>{match.scoreHome}</span><span className={styles.matchDash}>-</span><span>{match.scoreAway}</span></>
            : <span className={styles.matchVs}>vs</span>
          }
        </div>
        <span className={`${styles.matchTeam} ${styles.matchTeamRight}`}>{match.away}</span>
      </div>
      {match.played && (
        <span className={styles.matchResult}>
          {match.scoreHome > match.scoreAway ? match.home : match.scoreAway > match.scoreHome ? match.away : 'Nul'}
        </span>
      )}
    </div>
  );
}

export default function CoupeDuMonde() {
  const [tab, setTab] = useState('groupes');

  return (
    <div className="container" style={{ padding: '1.5rem var(--gutter)' }}>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroMeta}>Canada · Mexique · États-Unis · 11 Juin — 19 Juillet 2026</div>
        <h1 className={styles.heroTitle}>Coupe du Monde 2026</h1>
        <p className={styles.heroSub}>48 équipes · 104 matchs · Phase finale en cours</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {[
          { key: 'groupes', label: 'Phase de groupes' },
          { key: 'eliminatoires', label: 'Phase eliminatoire' },
        ].map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Groupes */}
      {tab === 'groupes' && (
        <div>
          <p className={styles.note}>Phase de groupes terminée · 27 Juin 2026 · 32 équipes qualifiées</p>
          <div className={styles.groupsGrid}>
            {GROUPS.map(g => <GroupTable key={g.id} group={g} />)}
          </div>
        </div>
      )}

      {/* Phase éliminatoire */}
      {tab === 'eliminatoires' && (
        <div>
          <h2 className={styles.roundTitle}>32es de finale</h2>
          <p className={styles.note}>28 Juin — 4 Juillet 2026</p>
          <div className={styles.matchGrid}>
            {R32.map((m, i) => <MatchRow key={i} match={m} />)}
          </div>

          <div className={styles.upcomingNote}>
            Les quarts de finale, demi-finales et la grande finale (19 juillet, MetLife Stadium) seront mis à jour au fil des résultats.
          </div>
        </div>
      )}
    </div>
  );
}
