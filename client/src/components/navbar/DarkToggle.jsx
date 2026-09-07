// DarkToggle — bouton thème clair / sombre. Le choix est mémorisé dans localStorage.

import { useState } from 'react';
import styles from '../Navbar.module.css';

export default function DarkToggle() {
  const [isLight, setIsLight] = useState(() => localStorage.getItem('kz_theme') === 'light');

  const toggle = () => {
    const next = !isLight;
    setIsLight(next);
    // data-theme sur <html> : le CSS s'adapte.
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
