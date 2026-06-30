import { useState } from 'react';
import styles from './CoupeDuMonde.module.css';

/* ─── Groupes (phase terminée le 27 Juin 2026) ──────────────── */

const GROUPS = [
  {
    id: 'A',
    teams: [
      { name: 'Mexique',    flag: 'mx', pts: 9, j: 3, v: 3, n: 0, d: 0, gf: 7, ga: 2, qualified: true,  winner: true },
      { name: 'Équateur',   flag: 'ec', pts: 6, j: 3, v: 2, n: 0, d: 1, gf: 5, ga: 3, qualified: true,  winner: false },
      { name: 'Jamaïque',   flag: 'jm', pts: 3, j: 3, v: 1, n: 0, d: 2, gf: 4, ga: 5, qualified: false, winner: false },
      { name: 'Curaçao',    flag: 'cw', pts: 0, j: 3, v: 0, n: 0, d: 3, gf: 1, ga: 7, qualified: false, winner: false },
    ],
  },
  {
    id: 'B',
    teams: [
      { name: 'Canada',         flag: 'ca', pts: 7, j: 3, v: 2, n: 1, d: 0, gf: 6, ga: 2, qualified: true,  winner: true },
      { name: 'Afrique du Sud', flag: 'za', pts: 5, j: 3, v: 1, n: 2, d: 0, gf: 4, ga: 3, qualified: true,  winner: false },
      { name: 'Pays-Bas',       flag: 'nl', pts: 3, j: 3, v: 1, n: 0, d: 2, gf: 3, ga: 4, qualified: false, winner: false },
      { name: 'Qatar',          flag: 'qa', pts: 0, j: 3, v: 0, n: 0, d: 3, gf: 1, ga: 7, qualified: false, winner: false },
    ],
  },
  {
    id: 'C',
    teams: [
      { name: 'Espagne',    flag: 'es', pts: 7, j: 3, v: 2, n: 1, d: 0, gf: 8, ga: 2, qualified: true,  winner: true },
      { name: 'Autriche',   flag: 'at', pts: 5, j: 3, v: 1, n: 2, d: 0, gf: 5, ga: 4, qualified: true,  winner: false },
      { name: 'Écosse',     flag: 'gb', pts: 2, j: 3, v: 0, n: 2, d: 1, gf: 2, ga: 6, qualified: false, winner: false },
      { name: 'Haïti',      flag: 'ht', pts: 1, j: 3, v: 0, n: 1, d: 2, gf: 1, ga: 7, qualified: false, winner: false },
    ],
  },
  {
    id: 'D',
    teams: [
      { name: 'États-Unis', flag: 'us', pts: 9, j: 3, v: 3, n: 0, d: 0, gf: 8, ga: 1, qualified: true,  winner: true },
      { name: 'Bosnie',     flag: 'ba', pts: 5, j: 3, v: 1, n: 2, d: 0, gf: 5, ga: 4, qualified: true,  winner: false },
      { name: 'Turquie',    flag: 'tr', pts: 3, j: 3, v: 1, n: 0, d: 2, gf: 3, ga: 5, qualified: false, winner: false },
      { name: 'Pérou',      flag: 'pe', pts: 0, j: 3, v: 0, n: 0, d: 3, gf: 1, ga: 9, qualified: false, winner: false },
    ],
  },
  {
    id: 'E',
    teams: [
      { name: 'Brésil',         flag: 'br', pts: 9, j: 3, v: 3, n: 0, d: 0, gf: 8, ga: 2, qualified: true,  winner: true },
      { name: 'Côte d\'Ivoire', flag: 'ci', pts: 5, j: 3, v: 1, n: 2, d: 0, gf: 4, ga: 3, qualified: true,  winner: false },
      { name: 'Japon',           flag: 'jp', pts: 3, j: 3, v: 1, n: 0, d: 2, gf: 4, ga: 4, qualified: false, winner: false },
      { name: 'Tanzanie',        flag: 'tz', pts: 0, j: 3, v: 0, n: 0, d: 3, gf: 0, ga: 7, qualified: false, winner: false },
    ],
  },
  {
    id: 'F',
    teams: [
      { name: 'France',      flag: 'fr', pts: 9, j: 3, v: 3, n: 0, d: 0, gf: 10, ga: 2, qualified: true,  winner: true },
      { name: 'Suède',       flag: 'se', pts: 4, j: 3, v: 1, n: 1, d: 1, gf: 5,  ga: 5, qualified: true,  winner: false },
      { name: 'Uruguay',     flag: 'uy', pts: 3, j: 3, v: 1, n: 0, d: 2, gf: 3,  ga: 6, qualified: false, winner: false },
      { name: 'A. Saoudite', flag: 'sa', pts: 0, j: 3, v: 0, n: 0, d: 3, gf: 2,  ga: 7, qualified: false, winner: false },
    ],
  },
  {
    id: 'G',
    teams: [
      { name: 'Paraguay',  flag: 'py', pts: 7, j: 3, v: 2, n: 1, d: 0, gf: 6, ga: 3, qualified: true,  winner: true },
      { name: 'Bolivie',   flag: 'bo', pts: 4, j: 3, v: 1, n: 1, d: 1, gf: 4, ga: 4, qualified: true,  winner: false },
      { name: 'Venezuela', flag: 've', pts: 2, j: 3, v: 0, n: 2, d: 1, gf: 2, ga: 4, qualified: false, winner: false },
      { name: 'Iran',      flag: 'ir', pts: 1, j: 3, v: 0, n: 1, d: 2, gf: 1, ga: 5, qualified: false, winner: false },
    ],
  },
  {
    id: 'H',
    teams: [
      { name: 'Angleterre',    flag: 'gb', pts: 7, j: 3, v: 2, n: 1, d: 0, gf: 7, ga: 2, qualified: true,  winner: true },
      { name: 'Rép. D. Congo', flag: 'cd', pts: 5, j: 3, v: 1, n: 2, d: 0, gf: 4, ga: 3, qualified: true,  winner: false },
      { name: 'Sénégal',       flag: 'sn', pts: 3, j: 3, v: 1, n: 0, d: 2, gf: 3, ga: 4, qualified: false, winner: false },
      { name: 'Irak',          flag: 'iq', pts: 0, j: 3, v: 0, n: 0, d: 3, gf: 1, ga: 6, qualified: false, winner: false },
    ],
  },
  {
    id: 'I',
    teams: [
      { name: 'Argentine', flag: 'ar', pts: 7, j: 3, v: 2, n: 1, d: 0, gf: 7, ga: 3, qualified: true,  winner: true },
      { name: 'Cap-Vert',  flag: 'cv', pts: 5, j: 3, v: 1, n: 2, d: 0, gf: 5, ga: 4, qualified: true,  winner: false },
      { name: 'Jordanie',  flag: 'jo', pts: 1, j: 3, v: 0, n: 1, d: 2, gf: 2, ga: 5, qualified: false, winner: false },
      { name: 'Cameroun',  flag: 'cm', pts: 1, j: 3, v: 0, n: 1, d: 2, gf: 1, ga: 5, qualified: false, winner: false },
    ],
  },
  {
    id: 'J',
    teams: [
      { name: 'Australie',   flag: 'au', pts: 6, j: 3, v: 2, n: 0, d: 1, gf: 5, ga: 3, qualified: true,  winner: true },
      { name: 'Égypte',      flag: 'eg', pts: 5, j: 3, v: 1, n: 2, d: 0, gf: 4, ga: 3, qualified: true,  winner: false },
      { name: 'Corée du Sud',flag: 'kr', pts: 2, j: 3, v: 0, n: 2, d: 1, gf: 2, ga: 4, qualified: false, winner: false },
      { name: 'Guinée Équ.', flag: 'gq', pts: 0, j: 3, v: 0, n: 0, d: 3, gf: 0, ga: 5, qualified: false, winner: false },
    ],
  },
  {
    id: 'K',
    teams: [
      { name: 'Portugal',  flag: 'pt', pts: 7, j: 3, v: 2, n: 1, d: 0, gf: 7, ga: 3, qualified: true,  winner: true },
      { name: 'Croatie',   flag: 'hr', pts: 5, j: 3, v: 1, n: 2, d: 0, gf: 5, ga: 4, qualified: true,  winner: false },
      { name: 'Danemark',  flag: 'dk', pts: 3, j: 3, v: 1, n: 0, d: 2, gf: 3, ga: 5, qualified: false, winner: false },
      { name: 'Panama',    flag: 'pa', pts: 0, j: 3, v: 0, n: 0, d: 3, gf: 1, ga: 5, qualified: false, winner: false },
    ],
  },
  {
    id: 'L',
    teams: [
      { name: 'Belgique', flag: 'be', pts: 7, j: 3, v: 2, n: 1, d: 0, gf: 6, ga: 2, qualified: true,  winner: true },
      { name: 'Suisse',   flag: 'ch', pts: 5, j: 3, v: 1, n: 2, d: 0, gf: 5, ga: 4, qualified: true,  winner: false },
      { name: 'Algérie',  flag: 'dz', pts: 3, j: 3, v: 1, n: 0, d: 2, gf: 3, ga: 4, qualified: false, winner: false },
      { name: 'Ghana',    flag: 'gh', pts: 1, j: 3, v: 0, n: 1, d: 2, gf: 2, ga: 6, qualified: false, winner: false },
    ],
  },
];

/* ─── 32es de finale (liste) ────────────────────────────────── */

const R32 = [
  { home: 'Canada',          away: 'Afrique du Sud',  scoreHome: 1,    scoreAway: 0,    pen: null,  date: '28 Juin',  played: true  },
  { home: 'Brésil',          away: 'Japon',           scoreHome: 2,    scoreAway: 1,    pen: null,  date: '29 Juin',  played: true  },
  { home: 'Paraguay',        away: 'Allemagne',       scoreHome: 1,    scoreAway: 1,    pen: '4-3', date: '29 Juin',  played: true  },
  { home: 'Maroc',           away: 'Pays-Bas',        scoreHome: 1,    scoreAway: 1,    pen: '3-2', date: '29 Juin',  played: true  },
  { home: 'Côte d\'Ivoire',  away: 'Norvège',         scoreHome: null, scoreAway: null, pen: null,  date: '30 Juin',  played: false },
  { home: 'France',          away: 'Suède',           scoreHome: null, scoreAway: null, pen: null,  date: '30 Juin',  played: false },
  { home: 'Mexique',         away: 'Équateur',        scoreHome: null, scoreAway: null, pen: null,  date: '30 Juin',  played: false },
  { home: 'Angleterre',      away: 'Rép. Dem. Congo', scoreHome: null, scoreAway: null, pen: null,  date: '1er Juil', played: false },
  { home: 'Belgique',        away: 'Sénégal',         scoreHome: null, scoreAway: null, pen: null,  date: '1er Juil', played: false },
  { home: 'États-Unis',      away: 'Bosnie',          scoreHome: null, scoreAway: null, pen: null,  date: '1er Juil', played: false },
  { home: 'Espagne',         away: 'Autriche',        scoreHome: null, scoreAway: null, pen: null,  date: '2 Juil',   played: false },
  { home: 'Portugal',        away: 'Croatie',         scoreHome: null, scoreAway: null, pen: null,  date: '2 Juil',   played: false },
  { home: 'Suisse',          away: 'Algérie',         scoreHome: null, scoreAway: null, pen: null,  date: '2 Juil',   played: false },
  { home: 'Australie',       away: 'Égypte',          scoreHome: null, scoreAway: null, pen: null,  date: '3 Juil',   played: false },
  { home: 'Argentine',       away: 'Cap-Vert',        scoreHome: null, scoreAway: null, pen: null,  date: '3 Juil',   played: false },
  { home: 'Colombie',        away: 'Ghana',           scoreHome: null, scoreAway: null, pen: null,  date: '3 Juil',   played: false },
];

/* ─── Arbre du tournoi ──────────────────────────────────────── */

const BRACKET_R32 = [
  { id: 1,  home: 'Canada',       away: 'Afrique du Sud', sh: 1,    sa: 0,    pen: null,  played: true,  winner: 'home', date: '28 Juin' },
  { id: 2,  home: 'Maroc',        away: 'Pays-Bas',       sh: 1,    sa: 1,    pen: '3-2', played: true,  winner: 'home', date: '29 Juin' },
  { id: 3,  home: 'Paraguay',     away: 'Allemagne',      sh: 1,    sa: 1,    pen: '4-3', played: true,  winner: 'home', date: '29 Juin' },
  { id: 4,  home: 'France',       away: 'Suède',          sh: null, sa: null, pen: null,  played: false, winner: null,   date: '30 Juin' },
  { id: 5,  home: 'Brésil',       away: 'Japon',          sh: 2,    sa: 1,    pen: null,  played: true,  winner: 'home', date: '29 Juin' },
  { id: 6,  home: 'Côte d\'Iv.',  away: 'Norvège',        sh: null, sa: null, pen: null,  played: false, winner: null,   date: '30 Juin' },
  { id: 7,  home: 'Mexique',      away: 'Équateur',       sh: null, sa: null, pen: null,  played: false, winner: null,   date: '30 Juin' },
  { id: 8,  home: 'Angleterre',   away: 'R.D. Congo',     sh: null, sa: null, pen: null,  played: false, winner: null,   date: '1er Juil' },
  { id: 9,  home: 'Belgique',     away: 'Sénégal',        sh: null, sa: null, pen: null,  played: false, winner: null,   date: '1er Juil' },
  { id: 10, home: 'Espagne',      away: 'Autriche',       sh: null, sa: null, pen: null,  played: false, winner: null,   date: '2 Juil' },
  { id: 11, home: 'Australie',    away: 'Égypte',         sh: null, sa: null, pen: null,  played: false, winner: null,   date: '3 Juil' },
  { id: 12, home: 'Argentine',    away: 'Cap-Vert',       sh: null, sa: null, pen: null,  played: false, winner: null,   date: '3 Juil' },
  { id: 13, home: 'États-Unis',   away: 'Bosnie',         sh: null, sa: null, pen: null,  played: false, winner: null,   date: '1er Juil' },
  { id: 14, home: 'Portugal',     away: 'Croatie',        sh: null, sa: null, pen: null,  played: false, winner: null,   date: '2 Juil' },
  { id: 15, home: 'Suisse',       away: 'Algérie',        sh: null, sa: null, pen: null,  played: false, winner: null,   date: '2 Juil' },
  { id: 16, home: 'Colombie',     away: 'Ghana',          sh: null, sa: null, pen: null,  played: false, winner: null,   date: '3 Juil' },
];

const BRACKET_R16 = [
  { id: 17, home: 'Canada',      away: 'Maroc',         sh: null, sa: null, pen: null, played: false, winner: null, date: '4 Juil' },
  { id: 18, home: 'Paraguay',    away: 'Fr. / Suède',   sh: null, sa: null, pen: null, played: false, winner: null, date: '4 Juil' },
  { id: 19, home: 'Brésil',      away: 'CIV / Norv.',   sh: null, sa: null, pen: null, played: false, winner: null, date: '5 Juil' },
  { id: 20, home: 'Mex./Équ.',   away: 'Ang./Congo',    sh: null, sa: null, pen: null, played: false, winner: null, date: '5 Juil' },
  { id: 21, home: 'Bel./Sén.',   away: 'USA/Bosnie',    sh: null, sa: null, pen: null, played: false, winner: null, date: '6 Juil' },
  { id: 22, home: 'Esp./Aut.',   away: 'Por./Cro.',     sh: null, sa: null, pen: null, played: false, winner: null, date: '6 Juil' },
  { id: 23, home: 'Aus./Égy.',   away: 'Arg./Cap-V.',   sh: null, sa: null, pen: null, played: false, winner: null, date: '7 Juil' },
  { id: 24, home: 'Sui./Alg.',   away: 'Col./Gha.',     sh: null, sa: null, pen: null, played: false, winner: null, date: '7 Juil' },
];

const BRACKET_QF = [
  { id: 25, home: 'Vainq. 8e-1', away: 'Vainq. 8e-2', sh: null, sa: null, pen: null, played: false, winner: null, date: '10 Juil' },
  { id: 26, home: 'Vainq. 8e-3', away: 'Vainq. 8e-4', sh: null, sa: null, pen: null, played: false, winner: null, date: '11 Juil' },
  { id: 27, home: 'Vainq. 8e-5', away: 'Vainq. 8e-6', sh: null, sa: null, pen: null, played: false, winner: null, date: '12 Juil' },
  { id: 28, home: 'Vainq. 8e-7', away: 'Vainq. 8e-8', sh: null, sa: null, pen: null, played: false, winner: null, date: '12 Juil' },
];

const BRACKET_SF = [
  { id: 29, home: 'Vainq. QF 1', away: 'Vainq. QF 2', sh: null, sa: null, pen: null, played: false, winner: null, date: '15 Juil' },
  { id: 30, home: 'Vainq. QF 3', away: 'Vainq. QF 4', sh: null, sa: null, pen: null, played: false, winner: null, date: '16 Juil' },
];

const BRACKET_FINAL = [
  { id: 31, home: 'Vainqueur Demi 1', away: 'Vainqueur Demi 2', sh: null, sa: null, pen: null, played: false, winner: null, date: '19 Juil — MetLife Stadium' },
];

const TOTAL_H = 16 * 70; // 1120px — hauteur totale commune à toutes les colonnes
const FLAG_URL = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

/* ─── Composant tableau de groupe ───────────────────────────── */

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
                <img src={FLAG_URL(t.flag)} alt={t.name} className={styles.flag}
                  onError={e => { e.target.style.display = 'none'; }} />
                <span className={styles.teamName}>{t.name}</span>
                {t.winner && <span className={styles.badge1}>1er</span>}
              </td>
              <td>{t.j}</td><td>{t.v}</td><td>{t.n}</td><td>{t.d}</td>
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

/* ─── Composant ligne match (vue liste) ─────────────────────── */

function MatchRow({ match }) {
  const getPenWinner = (pen) => {
    if (!pen) return null;
    const [a, b] = pen.split('-').map(Number);
    return a > b ? match.home : match.away;
  };
  const winnerName = match.played
    ? (match.scoreHome > match.scoreAway ? match.home
      : match.scoreAway > match.scoreHome ? match.away
      : getPenWinner(match.pen) ?? 'Nul')
    : null;

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
      <div className={styles.matchRowRight}>
        {match.pen && match.played && <span className={styles.matchPen}>{match.pen} tab</span>}
        {winnerName && <span className={styles.matchResult}>{winnerName}</span>}
      </div>
    </div>
  );
}

/* ─── Composants Bracket (arbre visuel) ─────────────────────── */

function BracketCard({ match, isFinal }) {
  const { home, away, sh, sa, pen, played, winner, date } = match;
  return (
    <div className={`${styles.bCard} ${played ? styles.bCardPlayed : ''} ${isFinal ? styles.bCardFinal : ''}`}>
      <div className={`${styles.bTeamRow} ${winner === 'home' ? styles.bWinner : winner === 'away' ? styles.bLoser : ''}`}>
        <span className={styles.bName}>{home}</span>
        {played && <span className={styles.bScore}>{sh}</span>}
      </div>
      <div className={`${styles.bTeamRow} ${styles.bTeamBorder} ${winner === 'away' ? styles.bWinner : winner === 'home' ? styles.bLoser : ''}`}>
        <span className={styles.bName}>{away}</span>
        {played && <span className={styles.bScore}>{sa}</span>}
      </div>
      <div className={styles.bDateRow}>
        {pen && played && <span className={styles.bPen}>{pen} tab · </span>}
        {date}
      </div>
    </div>
  );
}

function BracketConnector({ fromCount, fromSlotH }) {
  const totalH = fromCount * fromSlotH;
  const W = 24;
  const hw = W / 2;
  const lines = [];
  for (let i = 0; i < fromCount; i += 2) {
    const y1 = i * fromSlotH + fromSlotH / 2;
    const y2 = (i + 1) * fromSlotH + fromSlotH / 2;
    const yM = (y1 + y2) / 2;
    lines.push(
      <g key={i}>
        <line x1={0} y1={y1} x2={hw} y2={y1} />
        <line x1={hw} y1={y1} x2={hw} y2={y2} />
        <line x1={0} y1={y2} x2={hw} y2={y2} />
        <line x1={hw} y1={yM} x2={W} y2={yM} />
      </g>
    );
  }
  return (
    <svg
      width={W}
      height={totalH}
      style={{ flexShrink: 0, overflow: 'visible', alignSelf: 'flex-start', marginTop: 28 }}
      stroke="var(--border)"
      strokeWidth={1.5}
      fill="none"
    >
      {lines}
    </svg>
  );
}

function BracketColumn({ label, matches, slotH, isFinal }) {
  return (
    <div className={styles.bCol}>
      <div className={styles.bRoundLabel}>{label}</div>
      <div style={{ position: 'relative', height: TOTAL_H }}>
        {matches.map((m, i) => (
          <div
            key={m.id}
            style={{
              position: 'absolute',
              top: i * slotH,
              height: slotH,
              left: 0, right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BracketCard match={m} isFinal={isFinal} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketView() {
  return (
    <div className={styles.bracketScroll}>
      <div className={styles.bracketInner}>
        <BracketColumn label="32es de finale"   matches={BRACKET_R32}   slotH={70}   />
        <BracketConnector fromCount={16} fromSlotH={70} />
        <BracketColumn label="16es de finale"   matches={BRACKET_R16}   slotH={140}  />
        <BracketConnector fromCount={8}  fromSlotH={140} />
        <BracketColumn label="Quarts de finale" matches={BRACKET_QF}    slotH={280}  />
        <BracketConnector fromCount={4}  fromSlotH={280} />
        <BracketColumn label="Demi-finales"     matches={BRACKET_SF}    slotH={560}  />
        <BracketConnector fromCount={2}  fromSlotH={560} />
        <BracketColumn label="🏆 Finale"        matches={BRACKET_FINAL} slotH={1120} isFinal />
      </div>
    </div>
  );
}

/* ─── Page principale ───────────────────────────────────────── */

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
          { key: 'groupes',       label: 'Phase de groupes' },
          { key: 'eliminatoires', label: '32es de finale' },
          { key: 'arbre',         label: 'Arbre du tournoi' },
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

      {/* Phase de groupes */}
      {tab === 'groupes' && (
        <div>
          <p className={styles.note}>Phase terminée · 27 Juin 2026 · 32 équipes qualifiées sur 48</p>
          <div className={styles.groupsGrid}>
            {GROUPS.map(g => <GroupTable key={g.id} group={g} />)}
          </div>
        </div>
      )}

      {/* 32es de finale — liste */}
      {tab === 'eliminatoires' && (
        <div>
          <h2 className={styles.roundTitle}>32es de finale</h2>
          <p className={styles.note}>28 Juin — 3 Juillet 2026</p>
          <div className={styles.matchGrid}>
            {R32.map((m, i) => <MatchRow key={i} match={m} />)}
          </div>
          <div className={styles.upcomingNote}>
            16es de finale : 4-7 Juil · Quarts : 10-12 Juil · Demies : 15-16 Juil · Finale : 19 Juil (MetLife Stadium, New Jersey)
          </div>
        </div>
      )}

      {/* Arbre du tournoi */}
      {tab === 'arbre' && (
        <div>
          <p className={styles.note}>
            Tableau complet · Phase finale du 28 Juin au 19 Juillet · Faites défiler horizontalement →
          </p>
          <BracketView />
        </div>
      )}

    </div>
  );
}
