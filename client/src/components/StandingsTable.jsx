// ============================================================================
//  StandingsTable — tableau de classement générique (pages Classements, Match).
//  Reçoit `standings` au format de l'API-Football :
//     standings[0].league.standings[0] = tableau des lignes (une par équipe).
//  Options :
//   - compact       : version courte (5 lignes, colonnes réduites)
//   - highlightIds   : ids d'équipes à surligner (ex : les 2 équipes d'un match)
// ============================================================================

import { Link } from 'react-router-dom';
import styles from './StandingsTable.module.css';

// Petit carré coloré pour un résultat récent : V (vert) / N (gris) / D (rouge).
function FormBadge({ result }) {
  const map = { W: { label: 'V', color: '#16a34a' }, D: { label: 'N', color: '#6b7280' }, L: { label: 'D', color: '#dc2626' } };
  const m = map[result] ?? { label: '?', color: '#9ca3af' };
  return <span className={styles.formBadge} style={{ background: m.color }} title={result}>{m.label}</span>;
}

// L'API renvoie la forme sous forme de chaîne "WWDLW". On garde les 5 derniers.
function parseForm(formStr) {
  if (!formStr) return [];
  return formStr.split('').filter(c => ['W', 'D', 'L'].includes(c)).slice(-5);
}

export default function StandingsTable({ standings, compact = false, highlightIds = [] }) {
  // Pas de données -> message simple.
  if (!standings || !standings[0]) {
    return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>Classement indisponible.</p>;
  }

  const table = standings[0]?.league?.standings?.[0] ?? []; // le tableau des équipes
  const rows = compact ? table.slice(0, 5) : table;         // version compacte = 5 premières
  const total = table.length;

  // Couleur de bord de ligne selon la place (qualification européenne / relégation).
  const getZone = (rank) => {
    if (rank <= 1) return 'ucl';
    if (rank <= 3) return 'ucl-q';
    if (rank <= 4) return 'uel';
    if (rank <= 6) return 'uecl';
    if (rank >= total - 2) return 'relegate';
    return '';
  };

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thRank}>#</th>
            <th className={styles.thTeam}>Équipe</th>
            <th title="Points">Pts</th>
            {/* Colonnes détaillées uniquement hors mode compact */}
            {!compact && (
              <>
                <th title="Matchs joués">MJ</th>
                <th title="Victoires">V</th>
                <th title="Nuls">N</th>
                <th title="Défaites">D</th>
                <th title="Buts pour">BP</th>
                <th title="Buts contre">BC</th>
                <th title="Différence de buts">Diff</th>
                <th className={styles.thForm} title="5 derniers résultats">Forme</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {/* Une <tr> par équipe */}
          {rows.map(row => {
            const zone = compact ? '' : getZone(row.rank);
            const isHighlighted = highlightIds.includes(row.team.id);
            const form = parseForm(row.form);
            return (
              <tr key={row.rank} className={`${styles.row} ${zone ? styles[zone] : ''} ${isHighlighted ? styles.highlighted : ''}`}>
                <td className={styles.rank}>
                  <span className={`${styles.rankNum} ${zone ? styles[`rank_${zone}`] : ''}`}>{row.rank}</span>
                </td>
                <td className={styles.teamCell}>
                  <img src={row.team.logo} alt="" width={18} height={18} onError={e => e.target.style.display = 'none'} />
                  <Link to={`/equipes/${row.team.id}`} className={styles.teamName}>{row.team.name}</Link>
                </td>
                <td className={styles.pts}>{row.points}</td>
                {!compact && (
                  <>
                    <td>{row.all.played}</td>
                    <td>{row.all.win}</td>
                    <td>{row.all.draw}</td>
                    <td>{row.all.lose}</td>
                    <td>{row.all.goals?.for ?? 0}</td>
                    <td>{row.all.goals?.against ?? 0}</td>
                    <td className={row.goalsDiff > 0 ? styles.pos : row.goalsDiff < 0 ? styles.neg : ''}>
                      {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                    </td>
                    <td className={styles.formCell}>
                      {form.map((r, i) => <FormBadge key={i} result={r} />)}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Légende des couleurs (hors mode compact) */}
      {!compact && (
        <div className={styles.legend}>
          <span><span className={`${styles.dot} ${styles.dotUcl}`} />UCL</span>
          <span><span className={`${styles.dot} ${styles.dotUelQ}`} />UCL (Q)</span>
          <span><span className={`${styles.dot} ${styles.dotUel}`} />UEL</span>
          <span><span className={`${styles.dot} ${styles.dotRelegate}`} />Relégation</span>
        </div>
      )}
    </div>
  );
}
