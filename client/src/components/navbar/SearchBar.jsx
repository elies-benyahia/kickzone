// SearchBar — recherche globale (équipes / joueurs / articles) dans une modale.

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/api';
import styles from '../Navbar.module.css';

const CATEGORY_LABEL = { TRANSFERT: 'Transfert', ACTU: 'Actu', ANALYSE: 'Analyse', INTERVIEW: 'Interview', RESULTATS: 'Résultats' };

// Petite icône loupe (SVG inline).
const SearchIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function SearchBar() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [debouncedQ, setDebouncedQ] = useState(''); // texte "retardé"
  const ref = useRef(null);
  const navigate = useNavigate();

  // Debounce : on attend 350 ms après la dernière frappe (pas 1 appel API par lettre).
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  // Ferme la modale au clic extérieur.
  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data, isFetching } = useSearch(debouncedQ);
  const players = data?.players ?? [];
  const teams = data?.teams ?? [];
  const articles = data?.articles ?? [];
  const hasResults = players.length || teams.length || articles.length;
  const isSearching = q.length >= 2 && (isFetching || debouncedQ !== q);

  const go = (path) => { navigate(path); setOpen(false); setQ(''); };

  return (
    <div className={styles.searchWrap} ref={ref}>
      <button className={styles.searchIcon} onClick={() => setOpen(true)}><SearchIcon /></button>

      {open && (
        <div className={styles.searchOverlay} onClick={() => setOpen(false)}>
          <div className={styles.searchModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.searchInputWrap}>
              <SearchIcon className={styles.searchModalIcon} />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher équipe, joueur, article..."
                className={styles.searchField}
              />
              {q && <button className={styles.searchClear} onClick={() => setQ('')}>×</button>}
            </div>

            <div className={styles.searchResults}>
              {isSearching && <div className={styles.dropLoading}>Recherche...</div>}
              {!isSearching && q.length >= 2 && !hasResults && (
                <div className={styles.dropEmpty}>Aucun résultat pour « {debouncedQ} »</div>
              )}

              {teams.length > 0 && (
                <>
                  <div className={styles.dropSection}>Équipes</div>
                  {teams.map((t) => (
                    <button key={t.team?.id} className={styles.dropItem} onClick={() => go(`/equipes/${t.team?.id}`)}>
                      <img src={t.team?.logo} alt="" width={20} height={20} style={{ borderRadius: 3, objectFit: 'contain' }} onError={(e) => (e.target.style.display = 'none')} />
                      <span>{t.team?.name}</span>
                      <span className={styles.dropMeta}>{t.team?.country}</span>
                    </button>
                  ))}
                </>
              )}

              {players.length > 0 && (
                <>
                  <div className={styles.dropSection}>Joueurs</div>
                  {players.map((p) => (
                    <button key={p.player?.id} className={styles.dropItem} onClick={() => go(`/joueur/${p.player?.id}`)}>
                      <img
                        src={`https://media.api-sports.io/football/players/${p.player?.id}.png`}
                        alt="" width={20} height={20} style={{ borderRadius: '50%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.player?.name ?? 'P')}&size=20&background=1a56db&color=fff`; }}
                      />
                      <span>{p.player?.name}</span>
                      <span className={styles.dropMeta}>{p.statistics?.[0]?.team?.name}</span>
                    </button>
                  ))}
                </>
              )}

              {articles.length > 0 && (
                <>
                  <div className={styles.dropSection}>Articles</div>
                  {articles.map((a) => (
                    <button key={a.id} className={styles.dropItem} onClick={() => go(`/article/${a.slug}`)}>
                      <span className={styles.dropItemText}>{a.title}</span>
                      <span className={styles.dropMeta}>{CATEGORY_LABEL[a.category] ?? a.category}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
