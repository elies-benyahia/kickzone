import { useParams, Link } from 'react-router-dom';
import { usePlayer } from '../hooks/api';
import styles from './Joueur.module.css';

const fmt = (v) => v ? new Intl.NumberFormat('fr-FR').format(v) : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

export default function Joueur() {
  const { id } = useParams();
  const { data, isLoading } = usePlayer(id);

  if (isLoading) return <div className={styles.loading}>Chargement...</div>;
  if (!data?.player) return <div className={styles.loading}>Joueur introuvable.</div>;

  const { player: { player: p, statistics }, transfers, trophies } = data;
  const stats = statistics?.[0] ?? {};
  const team = stats.team ?? {};
  const league = stats.league ?? {};

  return (
    <div className="container" style={{ padding: '1.5rem var(--gutter)' }}>

      {/* ── Header joueur ── */}
      <div className={styles.header}>
        <div className={styles.photoWrap}>
          <img src={p.photo} alt={p.name} className={styles.photo} onError={e => e.target.src = ''} />
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.nationality}>
            {p.nationality}
            {p.flag && <img src={p.flag} alt={p.nationality} className={styles.flag} onError={e => e.target.style.display = 'none'} />}
          </div>
          <h1 className={styles.name}>{p.name}</h1>
          <div className={styles.currentTeam}>
            {team.logo && <img src={team.logo} alt={team.name} width={28} height={28} onError={e => e.target.style.display = 'none'} />}
            <span>{team.name ?? '—'}</span>
            {league.name && <span className={styles.leagueName}>· {league.name}</span>}
          </div>
          <div className={styles.tags}>
            {p.age && <span className={styles.tag}>🎂 {p.age} ans</span>}
            {stats.games?.position && <span className={styles.tag}>📍 {stats.games.position}</span>}
            {p.height && <span className={styles.tag}>📏 {p.height}</span>}
            {p.weight && <span className={styles.tag}>⚖️ {p.weight}</span>}
            {p.nationality && <span className={styles.tag}>🌍 {p.nationality}</span>}
          </div>
        </div>
      </div>

      <div className={styles.grid}>

        {/* ── Stats saison ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Stats saison 2024/25</h2>
          <div className={styles.statsGrid}>
            {[
              { label: 'Matchs', value: stats.games?.appearences ?? '—' },
              { label: 'Titulaire', value: stats.games?.lineups ?? '—' },
              { label: 'Buts', value: stats.goals?.total ?? '—' },
              { label: 'Passes D.', value: stats.goals?.assists ?? '—' },
              { label: 'Tirs', value: stats.shots?.total ?? '—' },
              { label: 'Tirs cadrés', value: stats.shots?.on ?? '—' },
              { label: 'Passes', value: stats.passes?.total ?? '—' },
              { label: 'Précision passes', value: stats.passes?.accuracy ? `${stats.passes.accuracy}%` : '—' },
              { label: 'Dribbles réussis', value: stats.dribbles?.success ?? '—' },
              { label: 'Fautes', value: stats.fouls?.committed ?? '—' },
              { label: 'Cartons jaunes', value: stats.cards?.yellow ?? '—' },
              { label: 'Cartons rouges', value: stats.cards?.red ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className={styles.stat}>
                <span className={styles.statValue}>{value}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Palmarès ── */}
        {trophies && trophies.length > 0 && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Palmarès 🏆</h2>
            <div className={styles.trophyList}>
              {trophies.slice(0, 10).map((t, i) => (
                <div key={i} className={styles.trophyRow}>
                  <span className={styles.trophyName}>{t.league}</span>
                  <span className={styles.trophyPlace}>{t.place === 'Winner' ? '🥇 Vainqueur' : '🥈 Finaliste'}</span>
                  <span className={styles.trophySeason}>{t.season}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Historique transferts ── */}
        {transfers && transfers.length > 0 && (
          <section className={`${styles.card} ${styles.cardFull}`}>
            <h2 className={styles.cardTitle}>Historique des transferts</h2>
            <div className={styles.transferTable}>
              <div className={styles.transferHeader}>
                <span>Date</span><span>Club départ</span><span></span><span>Club arrivée</span><span>Type</span><span>Montant</span>
              </div>
              {transfers.flatMap(t =>
                t.transfers?.map((tr, i) => (
                  <div key={i} className={styles.transferRow}>
                    <span className={styles.trDate}>{tr.date ? new Date(tr.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '—'}</span>
                    <div className={styles.trTeam}>
                      <img src={tr.teams?.out?.logo} alt="" width={20} height={20} onError={e => e.target.style.display = 'none'} />
                      <span>{tr.teams?.out?.name ?? '—'}</span>
                    </div>
                    <span className={styles.trArrow}>→</span>
                    <div className={styles.trTeam}>
                      <img src={tr.teams?.in?.logo} alt="" width={20} height={20} onError={e => e.target.style.display = 'none'} />
                      <span>{tr.teams?.in?.name ?? '—'}</span>
                    </div>
                    <span className={styles.trType}>{tr.type === 'Free' ? 'Libre' : tr.type === 'Loan' ? 'Prêt' : tr.type ?? '—'}</span>
                    <span className={styles.trFee}>{tr.fee || '—'}</span>
                  </div>
                )) ?? []
              )}
            </div>
          </section>
        )}

      </div>

      <div style={{ marginTop: '1rem' }}>
        <Link to="/joueurs" className="btn btn-outline" style={{ fontSize: '0.85rem' }}>← Retour à la recherche</Link>
      </div>
    </div>
  );
}
