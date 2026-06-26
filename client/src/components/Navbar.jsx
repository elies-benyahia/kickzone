import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import MatchTicker from './MatchTicker';
import styles from './Navbar.module.css';

const NAV = [
  { to: '/',           label: 'Accueil' },
  { to: '/matches',    label: 'Matchs' },
  { to: '/transferts', label: 'Transferts' },
  { to: '/actu',       label: 'Actu' },
  { to: '/classements',label: 'Classements' },
  { to: '/pronos',     label: 'Pronos' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>KickZone ⚽</Link>
        <nav className={`${styles.nav} ${open ? styles.navOpen : ''}`}>
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
        </nav>
        <button className={styles.burger} onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
      <MatchTicker />
    </header>
  );
}
