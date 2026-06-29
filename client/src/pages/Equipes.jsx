import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTeam, useTeamSquad, useTeamStats, useFixturesByDate } from '../hooks/api';
import styles from './Equipes.module.css';

const TABS = ['Effectif', 'Statistiques'];
const POS_ORDER = ['G', 'D', 'M', 'F'];
const POS_LABEL = { G:'Gardiens', D:'Défenseurs', M:'Milieux', F:'Attaquants' };

export default function Equipes() {
  const { id } = useParams();
  const [tab, setTab] = useState(0);
  const { data: teamData, isLoading } = useTeam(id);
  const { data: squadData } = useTeamSquad(id);
  const { data: statsData } = useTeamStats(id);

  const team = teamData?.[0]?.team;
  const venue = teamData?.[0]?.venue;

  if (isLoading) return <div className={styles.loading}>Chargement...</div>;
  if (!team) return <div className={styles.loading}>Équipe introuvable.</div>;

  const players = squadData?.[0]?.players ?? [];
  const byPos = {};
  POS_ORDER.forEach(p => byPos[p] = []);
  players.forEach(p => {
    const pos = p.position === 'Goalkeeper' ? 'G'
              : p.position === 'Defender' ? 'D'
              : p.position === 'Midfielder' ? 'M' : 'F';
    if (!byPos[pos]) byPos[pos] = [];
    byPos[pos].push(p);
  });

  return (
    <div className="container" style={{padding:'1.5rem var(--gutter)'}}>
      {/* Header équipe */}
      <div className={styles.header}>
        <img src={team.logo} alt={team.name} className={styles.teamLogo} onError={e=>e.target.style.display='none'} />
        <div className={styles.headerInfo}>
          <h1 className={styles.teamName}>{team.name}</h1>
          <div className={styles.teamMeta}>
            <span>📍 {team.country}</span>
            {team.founded && <span>🗓 Fondé en {team.founded}</span>}
            {venue?.name && <span>🏟️ {venue.name} ({venue.capacity?.toLocaleString()} places)</span>}
            {venue?.city && <span>📌 {venue.city}</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((t, i) => (
          <button key={t} className={`${styles.tab} ${tab === i ? styles.tabActive : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {/* Effectif */}
      {tab === 0 && (
        <div className={styles.squad}>
          {players.length === 0 && <p style={{color:'var(--text-muted)'}}>Effectif non disponible.</p>}
          {POS_ORDER.map(pos => byPos[pos].length > 0 && (
            <div key={pos} className={styles.posGroup}>
              <h3 className={styles.posLabel}>{POS_LABEL[pos]}</h3>
              <div className={styles.playerGrid}>
                {byPos[pos].map(p => (
                  <Link to={`/joueur/${p.id}`} key={p.id} className={styles.playerCard}>
                    <img
                      src={`https://media.api-sports.io/football/players/${p.id}.png`}
                      alt={p.name}
                      className={styles.playerPhoto}
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=1a56db&color=fff&size=60`; }}
                    />
                    <div className={styles.playerInfo}>
                      <span className={styles.playerName}>{p.name}</span>
                      {p.number && <span className={styles.playerNum}>#{p.number}</span>}
                      {p.age && <span className={styles.playerAge}>{p.age} ans</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats équipe */}
      {tab === 1 && (
        <div className={styles.statsGrid}>
          {statsData ? (
            <>
              <StatCard label="Matchs joués" value={statsData.fixtures?.played?.total ?? '—'} />
              <StatCard label="Victoires" value={statsData.fixtures?.wins?.total ?? '—'} color="var(--green-live)" />
              <StatCard label="Nuls" value={statsData.fixtures?.draws?.total ?? '—'} color="var(--blue)" />
              <StatCard label="Défaites" value={statsData.fixtures?.loses?.total ?? '—'} color="var(--orange)" />
              <StatCard label="Buts marqués" value={statsData.goals?.for?.total?.total ?? '—'} />
              <StatCard label="Buts encaissés" value={statsData.goals?.against?.total?.total ?? '—'} />
              <StatCard label="Clean sheets" value={statsData.clean_sheet?.total ?? '—'} color="var(--green-live)" />
              <StatCard label="Moy. buts (dom.)" value={statsData.goals?.for?.average?.home ?? '—'} />
            </>
          ) : (
            <p style={{color:'var(--text-muted)'}}>Statistiques non disponibles.</p>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statValue} style={color ? {color} : {}}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
