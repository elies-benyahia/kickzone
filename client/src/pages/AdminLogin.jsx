// ============================================================================
//  AdminLogin — formulaire de connexion de l'espace d'administration (/admin/login).
//  En cas de succès : on stocke le jeton JWT et on redirige vers /admin.
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../hooks/api';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();          // empêche le rechargement de la page
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('kz_token', data.token); // mémorise le jeton
      navigate('/admin');                            // va au tableau de bord
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.logo}>KickZone ⚽</div>
        <h1 className={styles.title}>Connexion Admin</h1>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.field}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        </div>
        <div className={styles.field}>
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
