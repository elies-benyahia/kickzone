import { useStandings } from '../hooks/api';
import styles from './LigueDesChampions.module.css';

/*
 * Ligue des Champions — phase de ligue (nouveau format depuis 2024/25)
 * 36 équipes, un seul classement, 8 matchs par équipe :
 *   1 → 8   : qualifiés directement pour les 8es de finale
 *   9 → 24  : barrages (play-off) pour accéder aux 8es
 *   25 → 36 : éliminés
 *
 * Les données réelles viennent de l'API (saison en cours). Si l'API n'est pas
 * configurée, on affiche un classement 2026/2027 de démonstration.
 */

const SEASON = '2026/2027';
const LOGO = (id) => `https://media.api-sports.io/football/teams/${id}.png`;

// Classement de démonstration 2026/2027 (après 4 journées de phase de ligue)
const DEMO = [
  ['Bayern Munich', 157, 4, 4, 0, 0, 13, 3],
  ['Real Madrid', 541, 4, 3, 1, 0, 10, 4],
  ['Arsenal', 42, 4, 3, 1, 0, 8, 2],
  ['Paris Saint-Germain', 85, 4, 3, 0, 1, 11, 5],
  ['Manchester City', 50, 4, 3, 0, 1, 9, 4],
  ['Liverpool', 40, 4, 3, 0, 1, 8, 5],
  ['Inter', 505, 4, 2, 2, 0, 7, 3],
  ['FC Barcelone', 529, 4, 2, 1, 1, 9, 6],
  ['Bayer Leverkusen', 168, 4, 2, 1, 1, 7, 5],
  ['Atlético Madrid', 530, 4, 2, 1, 1, 6, 5],
  ['Borussia Dortmund', 165, 4, 2, 1, 1, 8, 7],
  ['Chelsea', 49, 4, 2, 1, 1, 6, 5],
  ['Atalanta', 499, 4, 2, 0, 2, 7, 6],
  ['AC Milan', 489, 4, 2, 0, 2, 6, 6],
  ['Napoli', 492, 4, 2, 0, 2, 5, 5],
  ['Benfica', 211, 4, 2, 0, 2, 6, 7],
  ['PSV Eindhoven', 677, 4, 1, 2, 1, 6, 6],
  ['Juventus', 496, 4, 1, 2, 1, 5, 5],
  ['Sporting CP', 228, 4, 1, 2, 1, 5, 6],
  ['Newcastle', 34, 4, 1, 2, 1, 4, 5],
  ['Feyenoord', 209, 4, 1, 1, 2, 6, 8],
  ['Club Brugge', 569, 4, 1, 1, 2, 5, 7],
  ['AS Monaco', 91, 4, 1, 1, 2, 4, 6],
  ['Tottenham', 47, 4, 1, 1, 2, 5, 8],
  ['Olympique de Marseille', 81, 4, 1, 1, 2, 4, 7],
  ['FC Porto', 212, 4, 1, 1, 2, 4, 7],
  ['Eintracht Frankfurt', 169, 4, 1, 0, 3, 5, 9],
  ['Villarreal', 533, 4, 1, 0, 3, 4, 8],
  ['Celtic', 247, 4, 1, 0, 3, 3, 8],
  ['Galatasaray', 645, 4, 1, 0, 3, 4, 10],
  ['Athletic Bilbao', 531, 4, 0, 2, 2, 3, 5],
  ['Union Saint-Gilloise', 1393, 4, 0, 2, 2, 3, 6],
  ['Sporting Braga', 217, 4, 0, 2, 2, 2, 6],
  ['Olympiacos', 553, 4, 0, 1, 3, 3, 10],
  ['Bodø/Glimt', 327, 4, 0, 1, 3, 2, 9],
  ['FK Qarabag', 556, 4, 0, 0, 4, 2, 12],
];

function demoStandings() {
  const rows = DEMO.map(([name, id, played, win, draw, lose, gf, ga], i) => ({
    rank: i + 1,
    team: { id, name, logo: LOGO(id) },
    points: win * 3 + draw,
    goalsDiff: gf - ga,
    all: { played, win, draw, lose, goals: { for: gf, against: ga } },
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

  const apiTable = data?.[0]?.league?.standings?.[0];
  const usingReal = Array.isArray(apiTable) && apiTable.length >= 24;
  const table = usingReal ? apiTable : demoStandings()[0].league.standings[0];

  return (
    <div className="container" style={{ padding: '1.5rem var(--gutter)' }}>
      <header className={styles.head}>
        <h1 className={styles.title}>🏆 Ligue des Champions</h1>
        <span className={styles.season}>Phase de ligue — saison {SEASON}</span>
      </header>

      <p className={styles.intro}>
        Depuis 2024/2025, la Ligue des Champions se joue avec <strong>36 équipes</strong> dans
        un <strong>classement unique</strong>. Chaque club dispute 8 matchs. À l'issue de la
        phase de ligue&nbsp;: les <strong>8 premiers</strong> sont qualifiés directement pour
        les 8es de finale, les équipes classées <strong>de la 9e à la 24e place</strong>
        disputent un tour de barrages, et les <strong>12 dernières</strong> sont éliminées.
      </p>

      {!usingReal && (
        <p className={styles.demoNote}>
          ℹ️ Classement de démonstration (clé API football non configurée).
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
                      <img
                        src={row.team.logo}
                        alt=""
                        width={18}
                        height={18}
                        onError={(e) => { e.target.style.visibility = 'hidden'; }}
                      />
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
    </div>
  );
}
