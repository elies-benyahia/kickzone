// LineupsTab — onglet "Composition" : les deux "onze" sur un terrain, ou en liste.

import { useState } from 'react';
import styles from '../../pages/Match.module.css';

// Place les joueurs d'une équipe (par ligne G/D/M/F) sur une moitié de terrain.
function FootballPitch({ players, isHome }) {
  const byPos = { G: [], D: [], M: [], F: [] };
  players.forEach((p) => {
    const pos = p.player?.pos || 'M';
    (byPos[pos] || byPos.M).push(p.player);
  });

  const rows = [
    { key: 'G', top: isHome ? '82%' : '12%', players: byPos.G },
    { key: 'D', top: isHome ? '62%' : '30%', players: byPos.D },
    { key: 'M', top: isHome ? '42%' : '50%', players: byPos.M },
    { key: 'F', top: isHome ? '18%' : '72%', players: byPos.F },
  ];

  return (
    <div className={styles.pitchHalf}>
      {rows.map(({ key, top, players: pos }) => (
        <div key={key} className={styles.posRow} style={{ top }}>
          {pos.map((p, i) => (
            <div key={i} className={styles.playerDot} style={{ left: `${((i + 1) / (pos.length + 1)) * 100}%` }}>
              <div className={styles.dotCircle} style={{ background: isHome ? 'var(--blue)' : 'var(--orange)' }}>{p.number}</div>
              <span className={styles.dotName}>{p.name?.split(' ').pop()}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function LineupsTab({ lineups }) {
  const [view, setView] = useState('terrain');
  if (!lineups || lineups.length === 0) {
    return <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>Compositions non disponibles (pas encore publiées).</p>;
  }

  const home = lineups[0];
  const away = lineups[1] ?? lineups[0];

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        <button className={`${styles.tab} ${view === 'terrain' ? styles.tabActive : ''}`} onClick={() => setView('terrain')}>⚽ Terrain</button>
        <button className={`${styles.tab} ${view === 'liste' ? styles.tabActive : ''}`} onClick={() => setView('liste')}>📋 Liste</button>
      </div>

      {view === 'terrain' && (
        <div className={styles.pitch}>
          <svg viewBox="0 0 400 600" className={styles.pitchSvg} preserveAspectRatio="xMidYMid meet">
            <rect width="400" height="600" fill="#2d7a3a" />
            <rect x="20" y="20" width="360" height="560" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
            <line x1="20" y1="300" x2="380" y2="300" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
            <circle cx="200" cy="300" r="45" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
            <rect x="110" y="20" width="180" height="70" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <rect x="110" y="510" width="180" height="70" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <circle cx="200" cy="300" r="3" fill="white" />
          </svg>
          <div className={styles.pitchOverlay}>
            <div className={styles.formationLabel}>{away?.formation}</div>
            <FootballPitch players={away?.startXI ?? []} isHome={false} />
            <div className={styles.midLine} />
            <FootballPitch players={home?.startXI ?? []} isHome={true} />
            <div className={styles.formationLabel} style={{ bottom: 4, top: 'auto' }}>{home?.formation}</div>
          </div>
          <div className={styles.pitchLegend}>
            <span><span className={styles.legendDot} style={{ background: 'var(--blue)' }} />{home?.team?.name}</span>
            <span><span className={styles.legendDot} style={{ background: 'var(--orange)' }} />{away?.team?.name}</span>
          </div>
        </div>
      )}

      {view === 'liste' && (
        <div className={styles.lineups}>
          {[home, away].map((team, i) => (
            <div key={i} className={styles.teamLineup}>
              <h3 className={styles.lineupTeam}>
                <img src={team?.team?.logo} alt="" width={20} height={20} onError={(e) => (e.target.style.display = 'none')} />
                {team?.team?.name}
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{team?.formation}</span>
              </h3>
              <div className={styles.playersList}>
                <div className={styles.playersSection}>Titulaires</div>
                {team?.startXI?.map((p, j) => (
                  <div key={j} className={styles.playerRow}>
                    <span className={styles.playerNum}>{p.player.number}</span>
                    <span className={styles.playerName}>{p.player.name}</span>
                    <span className={styles.playerPos}>{p.player.pos}</span>
                  </div>
                ))}
                <div className={styles.playersSection} style={{ marginTop: 8 }}>Remplaçants</div>
                {team?.substitutes?.map((p, j) => (
                  <div key={j} className={styles.playerRow} style={{ opacity: 0.65 }}>
                    <span className={styles.playerNum}>{p.player.number}</span>
                    <span className={styles.playerName}>{p.player.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
