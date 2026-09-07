// LigueDesChampions — phase de ligue (format 2024/25) : 36 équipes, 1 classement, 8 journées.
//   1-8 -> 8es de finale, 9-24 -> barrages, 25-36 -> éliminés.
// Classement réel via l'API si la clé est configurée, sinon les 36 équipes engagées à 0 point.

import { useState } from 'react';
import { useStandings } from '../hooks/api';
import { UCL_CALENDAR, UCL_TEAMS } from '../data/uclCalendar'; // données dans src/data/
import styles from './LigueDesChampions.module.css';

const SEASON = '2026/2027';


function demoStandings() {
  const rows = UCL_TEAMS.map(([name, country], i) => ({
    rank: i + 1,
    team: { id: `demo-${i}`, name, country, logo: null },
    points: 0,
    goalsDiff: 0,
    all: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } },
    form: null,
  }));
  return [{ league: { standings: [rows] } }];
}

const zoneOf = (rank) => {
  if (rank <= 8) return 'top8';
  if (rank <= 24) return 'playoff';
  return 'out';
};

export default function LigueDesChampions() {
  const { data, isLoading } = useStandings(2);
  const [view, setView] = useState('classement');
  const [md, setMd] = useState(1);

  const apiTable = data?.[0]?.league?.standings?.[0];
  const usingReal = Array.isArray(apiTable) && apiTable.length >= 24;
  const table = usingReal ? apiTable : demoStandings()[0].league.standings[0];

  const matchday = UCL_CALENDAR.find((j) => j.md === md);

  return (
    <div className="container" style={{ padding: '1.5rem var(--gutter)' }}>
      <header className={styles.head}>
        <h1 className={styles.title}>🏆 Ligue des Champions</h1>
        <span className={styles.season}>Phase de ligue — saison {SEASON}</span>
      </header>

      <div className={styles.viewTabs}>
        <button
          className={`${styles.viewTab} ${view === 'classement' ? styles.viewActive : ''}`}
          onClick={() => setView('classement')}
        >
          Classement
        </button>
        <button
          className={`${styles.viewTab} ${view === 'calendrier' ? styles.viewActive : ''}`}
          onClick={() => setView('calendrier')}
        >
          Calendrier
        </button>
      </div>

      {view === 'calendrier' ? (
        <div className={styles.calendar}>
          <div className={styles.mdBar}>
            {UCL_CALENDAR.map((j) => (
              <button
                key={j.md}
                className={`${styles.mdChip} ${md === j.md ? styles.mdActive : ''}`}
                onClick={() => setMd(j.md)}
              >
                J{j.md}
              </button>
            ))}
          </div>

          {matchday.days.map((day) => (
            <div key={day.d} className={styles.calDay}>
              <h3 className={styles.calDate}>{day.d}</h3>
              <ul className={styles.calList}>
                {day.m.map(([home, away, time], i) => (
                  <li key={i} className={styles.calMatch}>
                    <span className={styles.calHome}>{home}</span>
                    <span className={styles.calTime}>{time}</span>
                    <span className={styles.calAway}>{away}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
      <>
      <p className={styles.intro}>
        Depuis 2024/2025, la Ligue des Champions se joue avec <strong>36 équipes</strong> dans
        un <strong>classement unique</strong>. Chaque club dispute 8 matchs. À l'issue de la
        phase de ligue&nbsp;: les <strong>8 premiers</strong> sont qualifiés directement pour
        les 8es de finale, les équipes classées <strong>de la 9e à la 24e place</strong>
        disputent un tour de barrages, et les <strong>12 dernières</strong> sont éliminées.
      </p>

      {!usingReal && (
        <p className={styles.demoNote}>
          ℹ️ Les 36 équipes engagées en {SEASON}, avant la 1re journée (toutes à 0 point).
        </p>
      )}

      {isLoading ? (
        <div className={styles.loading}>Chargement du classement…</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thRank}>#</th>
                <th className={styles.thTeam}>Club</th>
                <th>Pts</th>
                <th>J</th>
                <th>G</th>
                <th>N</th>
                <th>P</th>
                <th>BP</th>
                <th>BC</th>
                <th>Diff</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => {
                const zone = zoneOf(row.rank);
                return (
                  <tr key={row.team.id} className={styles[zone]}>
                    <td className={styles.rank}>{row.rank}</td>
                    <td className={styles.teamCell}>
                      {row.team.logo ? (
                        <img
                          src={row.team.logo}
                          alt=""
                          width={18}
                          height={18}
                          onError={(e) => { e.target.style.visibility = 'hidden'; }}
                        />
                      ) : (
                        <span className={styles.country}>{row.team.country}</span>
                      )}
                      <span>{row.team.name}</span>
                    </td>
                    <td className={styles.pts}>{row.points}</td>
                    <td>{row.all.played}</td>
                    <td>{row.all.win}</td>
                    <td>{row.all.draw}</td>
                    <td>{row.all.lose}</td>
                    <td>{row.all.goals?.for ?? 0}</td>
                    <td>{row.all.goals?.against ?? 0}</td>
                    <td className={row.goalsDiff > 0 ? styles.pos : row.goalsDiff < 0 ? styles.neg : ''}>
                      {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className={styles.legend}>
            <span><i className={styles.dotTop8} />1–8 · 8es de finale</span>
            <span><i className={styles.dotPlayoff} />9–24 · Barrages</span>
            <span><i className={styles.dotOut} />25–36 · Éliminés</span>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
