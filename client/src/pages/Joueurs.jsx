import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlayerSearch } from '../hooks/api';
import styles from './Joueurs.module.css';

export default function Joueurs() {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: results, isLoading } = usePlayerSearch(query);

  return (
    <div className="container" style={{ padding: '2rem var(--gutter)', maxWidth: 700, margin: '0 auto' }}>
      <h1 className={styles.title}>Recherche de joueur</h1>
      <p className={styles.subtitle}>Tape le nom d'un joueur pour voir sa fiche, son parcours et sa valeur marchande.</p>

      <div className={styles.searchWrap}>
        <input
          className={styles.input}
          type="text"
          placeholder="Ex: Mbappé, Haaland, Bellingham..."
          value={query}
          onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => setShowSuggestions(true)}
          autoComplete="off"
        />
        {isLoading && <span className={styles.spinner}>⏳</span>}

        {showSuggestions && results && results.length > 0 && (
          <ul className={styles.suggestions}>
            {results.slice(0, 8).map(r => {
              const p = r.player;
              const team = r.statistics?.[0]?.team;
              return (
                <li key={p.id}>
                  <Link to={`/joueur/${p.id}`} className={styles.suggestion}>
                    {p.photo && (
                      <img src={p.photo} alt={p.name} className={styles.suggestionPhoto}
                        onError={e => e.target.style.display = 'none'} />
                    )}
                    <div className={styles.suggestionInfo}>
                      <span className={styles.suggestionName}>{p.name}</span>
                      <span className={styles.suggestionMeta}>
                        {p.nationality} · {team?.name ?? ''}
                      </span>
                    </div>
                    {team?.logo && (
                      <img src={team.logo} alt="" width={24} height={24}
                        className={styles.suggestionLogo} onError={e => e.target.style.display = 'none'} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {showSuggestions && query.length >= 2 && !isLoading && results?.length === 0 && (
          <div className={styles.noResult}>Aucun joueur trouvé pour "{query}"</div>
        )}
      </div>

      {query.length < 2 && (
        <div className={styles.hint}>
          Commence à taper au moins 2 lettres pour voir les suggestions.
        </div>
      )}
    </div>
  );
}
