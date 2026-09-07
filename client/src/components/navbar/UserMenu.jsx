// UserMenu — menu du compte (avatar + déroulant). Rien si personne n'est connecté.

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../Navbar.module.css';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!user) return null;

  const initial = (user.username?.[0] ?? user.email[0]).toUpperCase();

  return (
    <div className={styles.userMenu} ref={ref}>
      <button className={styles.userBtn} onClick={() => setOpen((o) => !o)}>
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
