import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/api';
import MatchTicker from './MatchTicker';
import styles from './Navbar.module.css';

const NAV = [
  { to: '/',            label: 'Accueil' },
  { to: '/matches',     label: 'Matchs' },
  { to: '/transferts',  label: 'Transferts' },
  { to: '/actu',        label: 'Actu' },
  { to: '/classements', label: 'Classements' },
  { to: '/pronos',      label: 'Pronos' },
  { to: '/joueurs',     label: 'Joueurs' },
];

function DarkToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('kz_theme') === 'dark');

  const toggle = () => {
    const next = !dark;
    setDark(next);
    const theme = next ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
    localStorage.setItem('kz_theme', theme);
  };

  return (
    <button className={styles.darkToggle} onClick={toggle} aria-label="Mode sombre" title={dark ? 'Mode clair' : 'Mode sombre'}>
      {dark ? '☀️' : '🌙'}
    </button>
  );
}

function SearchBar() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [debouncedQ, setDebouncedQ] = useState('');
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data } = useSearch(debouncedQ);
  const players = data?.players ?? [];
  const teams = data?.teams ?? [];
  const hasResults = players.length > 0 || teams.length > 0;

  const handleFocus = () => { if (q.length >= 2) setOpen(true); };
  const handleChange = (e) => { setQ(e.target.value); setOpen(e.target.value.length >= 2); };

  return (
    <div className={styles.searchWrap} ref={ref}>
      <div className={styles.searchInput}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          value={q}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="Rechercher équipe, joueur..."
          className={styles.searchField}
        />
        {q && <button className={styles.searchClear} onClick={() => { setQ(''); setOpen(false); }}>×</button>}
      </div>
      {open && hasResults && (
        <div className={styles.dropdown}>
          {teams.length > 0 && (
            <div>
              <div className={styles.dropSection}>Équipes</div>
              {teams.map(t => (
                <button key={t.team?.id} className={styles.dropItem} onClick={() => { navigate(`/equipes/${t.team?.id}`); setOpen(false); setQ(''); }}>
                  <img src={t.team?.logo} alt="" width={18} height={18} style={{borderRadius:3}} onError={e=>e.target.style.display='none'} />
                  {t.team?.name}
                  <span className={styles.dropMeta}>{t.team?.country}</span>
                </button>
              ))}
            </div>
          )}
          {players.length > 0 && (
            <div>
              <div className={styles.dropSection}>Joueurs</div>
              {players.map(p => (
                <button key={p.player?.id} className={styles.dropItem} onClick={() => { navigate(`/joueur/${p.player?.id}`); setOpen(false); setQ(''); }}>
                  <img src={`https://media.api-sports.io/football/players/${p.player?.id}.png`} alt="" width={18} height={18} style={{borderRadius:'50%'}} onError={e=>e.target.style.display='none'} />
                  {p.player?.name}
                  <span className={styles.dropMeta}>{p.statistics?.[0]?.team?.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {open && debouncedQ.length >= 2 && !hasResults && (
        <div className={styles.dropdown}>
          <div className={styles.dropEmpty}>Aucun résultat pour "{debouncedQ}"</div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <img src="/logo.png" alt="KickZone" className={styles.logoImg} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='inline'; }} />
          <span style={{display:'none'}}>KickZone ⚽</span>
        </Link>
        <nav className={`${styles.nav} ${open ? styles.navOpen : ''}`}>
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.actions}>
          <SearchBar />
          <DarkToggle />
        </div>
        <button className={styles.burger} onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
      <MatchTicker />
    </header>
  );
}
