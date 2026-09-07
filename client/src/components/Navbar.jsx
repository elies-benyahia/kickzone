// Navbar — barre de navigation. Ses 4 morceaux sont dans components/navbar/ :
// DarkToggle (thème), MegaMenu (menu "Matchs"), SearchBar (recherche), UserMenu (compte).

import { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import TransferFlashTicker from './TransferFlashTicker';
import DarkToggle from './navbar/DarkToggle';
import MegaMenu from './navbar/MegaMenu';
import SearchBar from './navbar/SearchBar';
import UserMenu from './navbar/UserMenu';
import styles from './Navbar.module.css';

// Style appliqué au lien de la page courante.
const linkClass = ({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false); // menu burger (mobile)
  const [megaOpen, setMegaOpen] = useState(false);     // méga-menu "Matchs"
  const megaRef = useRef(null);
  const close = () => setMobileOpen(false);

  // Ferme le méga-menu au clic extérieur.
  useEffect(() => {
    const h = (e) => { if (!megaRef.current?.contains(e.target)) setMegaOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo (texte "KZ" en repli si l'image ne charge pas) */}
        <Link to="/" className={styles.logo}>
          <img src="/images/logo.png" alt="KickZone" className={styles.logoImg}
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          <span className={styles.logoKZ} style={{ display: 'none' }}>KZ</span>
        </Link>

        <nav className={`${styles.nav} ${mobileOpen ? styles.navOpen : ''}`}>
          <NavLink to="/" end className={linkClass} onClick={close}>Accueil</NavLink>

          {/* "Matchs" ouvre le méga-menu au survol */}
          <div className={styles.navItem} ref={megaRef} onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
            <NavLink to="/matches" className={linkClass} onClick={close}>
              Matchs<span className={styles.chevron}>▾</span>
            </NavLink>
            {megaOpen && <MegaMenu onClose={() => setMegaOpen(false)} />}
          </div>

          <NavLink to="/ligue-des-champions" className={linkClass} onClick={close}>Ligue des Champions</NavLink>
          <NavLink to="/transferts" className={linkClass} onClick={close}>Transferts</NavLink>
          <NavLink to="/actu" className={linkClass} onClick={close}>Actu</NavLink>
          <NavLink to="/pronos" className={linkClass} onClick={close}>Pronos</NavLink>
        </nav>

        <div className={styles.actions}>
          <SearchBar />
          <DarkToggle />
          <UserMenu />
        </div>

        <button className={styles.burger} onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
      <TransferFlashTicker />
    </header>
  );
}
