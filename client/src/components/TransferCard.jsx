import { Link } from 'react-router-dom';
import styles from './TransferCard.module.css';

const TYPE_CONFIG = {
  'Free': { label: 'Libre', color: '#16a34a', bg: '#dcfce7' },
  'N/A':  { label: 'N/D',   color: '#6b7280', bg: '#f3f4f6' },
  'Loan': { label: 'Prêt',  color: 'var(--blue)', bg: 'var(--blue-light)' },
};
const getTypeConfig = (type) => {
  if (!type) return TYPE_CONFIG['N/A'];
  if (type.toLowerCase().includes('loan')) return TYPE_CONFIG['Loan'];
  if (type.toLowerCase().includes('free')) return TYPE_CONFIG['Free'];
  return { label: 'Définitif', color: 'var(--orange)', bg: '#fff7ed' };
};

const formatFee = (fee) => {
  if (!fee || fee === 'Free' || fee === 'N/A' || fee === '—') return null;
  return fee;
};

const relativeDate = (d) => {
  if (!d) return '';
  try {
    const diff = Date.now() - new Date(d);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return 'Hier';
    if (days < 30) return `Il y a ${days} jours`;
    return new Date(d).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' });
  } catch { return ''; }
};

export default function TransferCard({ transfer }) {
  const player = transfer.player;
  const tr     = transfer.transfers?.[0];
  if (!player || !tr) return null;

  const typeConf = getTypeConfig(tr.type);
  const fee      = formatFee(tr.fee);
  const date     = relativeDate(tr.date);

  return (
    <div className={styles.card}>
      <div className={styles.player}>
        <img
          src={`https://media.api-sports.io/football/players/${player.id}.png`}
          alt={player.name}
          className={styles.playerPhoto}
          onError={e => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=1a56db&color=fff&size=56`;
          }}
        />
        <div className={styles.playerInfo}>
          <Link to={`/joueur/${player.id}`} className={styles.playerName}>{player.name}</Link>
          {player.nationality && <span className={styles.playerNat}>{player.nationality}</span>}
        </div>
        <span className={styles.typeBadge} style={{ background: typeConf.bg, color: typeConf.color }}>
          {typeConf.label}
        </span>
      </div>

      <div className={styles.clubs}>
        <div className={styles.clubBlock}>
          <img
            src={tr.teams?.out?.logo ?? `https://media.api-sports.io/football/teams/${tr.teams?.out?.id}.png`}
            alt={tr.teams?.out?.name}
            className={styles.clubLogo}
            onError={e => e.target.style.opacity='0.3'}
          />
          <span className={styles.clubName}>{tr.teams?.out?.name ?? '?'}</span>
        </div>

        <div className={styles.arrow}>
          <span className={styles.arrowIcon}>→</span>
          {fee && <span className={styles.fee}>{fee}</span>}
        </div>

        <div className={`${styles.clubBlock} ${styles.clubIn}`}>
          <img
            src={tr.teams?.in?.logo ?? `https://media.api-sports.io/football/teams/${tr.teams?.in?.id}.png`}
            alt={tr.teams?.in?.name}
            className={styles.clubLogo}
            onError={e => e.target.style.opacity='0.3'}
          />
          <span className={styles.clubName}>{tr.teams?.in?.name ?? '?'}</span>
        </div>
      </div>

      {date && <div className={styles.date}>{date}</div>}
    </div>
  );
}
