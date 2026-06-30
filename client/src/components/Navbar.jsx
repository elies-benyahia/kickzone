import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/api';
import { useAuth } from '../contexts/AuthContext';
import TransferFlashTicker from './TransferFlashTicker';
import styles from './Navbar.module.css';

const COMPETITIONS = [
  { name: 'Coupe du Monde', logo: 'https://media.api-sports.io/football/leagues/1.png',   path: '/coupe-du-monde' },
  { name: 'Champions League', logo: 'https://media.api-sports.io/football/leagues/2.png', path: '/matches' },
  { name: 'Europa League', logo: 'https://media.api-sports.io/football/leagues/3.png',    path: '/matches' },
  { name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png',  path: '/matches' },
  { name: 'Ligue 1', logo: 'https://media.api-sports.io/football/leagues/61.png',         path: '/matches' },
  { name: 'Bundesliga', logo: 'https://media.api-sports.io/football/leagues/78.png',      path: '/matches' },
  { name: 'Serie A', logo: 'https://media.api-sports.io/football/leagues/135.png',        path: '/matches' },
  { name: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png',        path: '/matches' },
  { name: 'Coupe de France', logo: 'https://media.api-sports.io/football/leagues/65.png', path: '/matches' },
  { name: 'Copa del Rey', logo: 'https://media.api-sports.io/football/leagues/6.png',     path: '/matches' },
  { name: 'Nations League', logo: 'https://media.api-sports.io/football/leagues/5.png',   path: '/matches' },
  { name: 'Copa America', logo: 'https://media.api-sports.io/football/leagues/9.png',     path: '/matches' },
];

const CATEGORY_LABEL = {
  TRANSFERT: 'Transfert', ACTU: 'Actu', ANALYSE: 'Analyse',
  INTERVIEW: 'Interview', RESULTATS: 'Résultats',
};

function DarkToggle() {
  const [isLight, setIsLight] = useState(() => localStorage.getItem('kz_theme') === 'light');

  const toggle = () => {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('kz_theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('kz_theme', 'dark');
    }
  };

  return (
    <button className={styles.darkToggle} onClick={toggle} aria-label={isLight ? 'Mode sombre' : 'Mode clair'}>
      {isLight ? '🌙' : '☀'}
    </button>
  );
}

function MegaMenu({ onClose }) {
  const navigate = useNavigate();
  return (
    <div className={styles.megaMenu}>
      <div className={styles.megaInner}>
        <div className={styles.megaSection}>
          <div className={styles.megaLabel}>Compétitions populaires</div>
          <div className={styles.megaGrid}>
            {COMPETITIONS.map((c) => (
              <button key={c.name} className={styles.megaItem} onClick={() => { navigate(c.path); onClose(); }}>
                <img src={c.logo} alt="" width={20} height={20} onError={e => e.target.style.display='none'} />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className={styles.megaDivider} />
        <div className={styles.megaAside}>
          <div className={styles.megaLabel}>Explorer</div>
          <button className={styles.megaAsideItem} onClick={() => { navigate('/matches'); onClose(); }}>
            Tous les matchs
          </button>
          <button className={styles.megaAsideItem} onClick={() => { navigate('/coupe-du-monde'); onClose(); }}>
            Coupe du Monde 2026
          </button>
          <button className={styles.megaAsideItem} onClick={() => { navigate('/classements'); onClose(); }}>
            Classements
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchBar() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [debouncedQ, setDebouncedQ] = useState('');
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data, isFetching } = useSearch(debouncedQ);
  const players  = data?.players  ?? [];
  const teams    = data?.teams    ?? [];
  const articles = data?.articles ?? [];
  const hasResults = players.length > 0 || teams.length > 0 || articles.length > 0;
  const isSearching = q.length >= 2 && (isFetching || debouncedQ !== q);

  const go = (path) => { navigate(path); setOpen(false); setQ(''); };

  return (
    <div className={styles.searchWrap} ref={ref}>
      <button className={styles.searchIcon} onClick={() => { setOpen(true); }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className={styles.searchOverlay} onClick={() => setOpen(false)}>
          <div className={styles.searchModal} onClick={e => e.stopPropagation()}>
            <div className={styles.searchInputWrap}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.searchModalIcon}>
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                autoFocus
                value={q}
                onChange={e => { setQ(e.target.value); }}
                placeholder="Rechercher équipe, joueur, article..."
                className={styles.searchField}
              />
              {q && <button className={styles.searchClear} onClick={() => setQ('')}>×</button>}
            </div>

            <div className={styles.searchResults}>
              {isSearching && <div className={styles.dropLoading}>Recherche...</div>}
              {!isSearching && q.length >= 2 && !hasResults && <div className={styles.dropEmpty}>Aucun résultat pour « {debouncedQ} »</div>}

              {teams.length > 0 && (
                <>
                  <div className={styles.dropSection}>Équipes</div>
                  {teams.map(t => (
                    <button key={t.team?.id} className={styles.dropItem} onClick={() => go(`/equipes/${t.team?.id}`)}>
                      <img src={t.team?.logo} alt="" width={20} height={20} style={{ borderRadius:3, objectFit:'contain' }} onError={e => e.target.style.display='none'} />
                      <span>{t.team?.name}</span>
                      <span className={styles.dropMeta}>{t.team?.country}</span>
                    </button>
                  ))}
                </>
              )}

              {players.length > 0 && (
                <>
                  <div className={styles.dropSection}>Joueurs</div>
                  {players.map(p => (
                    <button key={p.player?.id} className={styles.dropItem} onClick={() => go(`/joueur/${p.player?.id}`)}>
                      <img
                        src={`https://media.api-sports.io/football/players/${p.player?.id}.png`}
                        alt="" width={20} height={20}
                        style={{ borderRadius: '50%', objectFit: 'cover' }}
                        onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.player?.name??'P')}&size=20&background=1a56db&color=fff`; }}
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
                  {articles.map(a => (
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

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!user) return null;

  const initial = (user.username?.[0] ?? user.email[0]).toUpperCase();
  return (
    <div className={styles.userMenu} ref={ref}>
      <button className={styles.userBtn} onClick={() => setOpen(o => !o)}>
        <span className={styles.userAvatar}>{initial}</span>
        <span className={styles.userName}>{user.username ?? user.email.split('@')[0]}</span>
        <span className={styles.userCaret}>▾</span>
      </button>
      {open && (
        <div className={styles.userDrop}>
          <Link to="/profil" className={styles.userDropItem} onClick={() => setOpen(false)}>Mon profil</Link>
          <Link to="/pronos" className={styles.userDropItem} onClick={() => setOpen(false)}>Mes pronos</Link>
          {user.role === 'ADMIN' && (
            <Link to="/admin" className={styles.userDropItem} onClick={() => setOpen(false)}>Admin</Link>
          )}
          <hr className={styles.userSep} />
          <button className={`${styles.userDropItem} ${styles.userDropOut}`} onClick={() => { logout(); setOpen(false); navigate('/'); }}>
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (!megaRef.current?.contains(e.target)) setMegaOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <img
            src="/images/logo.png"
            alt="KickZone"
            className={styles.logoImg}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <span className={styles.logoKZ} style={{ display: 'none' }}>KZ</span>
        </Link>

        {/* Nav */}
        <nav className={`${styles.nav} ${mobileOpen ? styles.navOpen : ''}`}>
          <NavLink to="/" end className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={() => setMobileOpen(false)}>
            Accueil
          </NavLink>

          {/* Matchs avec mega menu */}
          <div className={styles.navItem} ref={megaRef} onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
            <NavLink to="/matches" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={() => setMobileOpen(false)}>
              Matchs
              <span className={styles.chevron}>▾</span>
            </NavLink>
            {megaOpen && <MegaMenu onClose={() => setMegaOpen(false)} />}
          </div>

          <NavLink to="/coupe-du-monde" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={() => setMobileOpen(false)}>
            Coupe du Monde
          </NavLink>
          <NavLink to="/transferts" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={() => setMobileOpen(false)}>
            Transferts
          </NavLink>
          <NavLink to="/actu" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={() => setMobileOpen(false)}>
            Actu
          </NavLink>
          <NavLink to="/pronos" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={() => setMobileOpen(false)}>
            Pronos
          </NavLink>
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <SearchBar />
          <DarkToggle />
          <UserMenu />
        </div>

        <button className={styles.burger} onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
      <TransferFlashTicker />
    </header>
  );
}
