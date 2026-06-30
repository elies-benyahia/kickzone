import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePronostics } from '../hooks/api';
import PronoCard from '../components/PronoCard';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: allPronos } = usePronostics();
  const myPronos = (allPronos ?? []).filter(p => p.userId === user?.id);

  const correct = myPronos.filter(p => p.result === 'CORRECT').length;
  const total   = myPronos.length;
  const rate    = total > 0 ? Math.round(correct / total * 100) : 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            {(user?.username?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()}
          </div>
          <div className={styles.info}>
            <h1 className={styles.name}>{user?.username ?? user?.email}</h1>
            {user?.username && <p className={styles.email}>{user.email}</p>}
            {joined && <p className={styles.joined}>Membre depuis le {joined}</p>}
            <span className={`${styles.badge} ${user?.role === 'ADMIN' ? styles.badgeAdmin : styles.badgeUser}`}>
              {user?.role === 'ADMIN' ? 'Admin' : 'Membre'}
            </span>
          </div>
          <button className={styles.logout} onClick={handleLogout}>
            Déconnexion
          </button>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{total}</span>
            <span className={styles.statLbl}>Pronos</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum} style={{ color: 'var(--green-live)' }}>{correct}</span>
            <span className={styles.statLbl}>Corrects</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum} style={{ color: rate >= 60 ? 'var(--green-live)' : rate >= 40 ? 'var(--blue)' : 'var(--orange)' }}>
              {rate}%
            </span>
            <span className={styles.statLbl}>Réussite</span>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Mes pronostics</h2>
          {myPronos.length === 0 ? (
            <div className={styles.empty}>
              Tu n'as pas encore fait de pronostic.{' '}
              <button className={styles.link} onClick={() => navigate('/pronos')}>Commencer →</button>
            </div>
          ) : (
            <div className={styles.grid}>
              {myPronos.map(p => <PronoCard key={p.id} prono={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
