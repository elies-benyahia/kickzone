import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Auth.module.css';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]   = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    if (form.password.length < 6) { setError('Mot de passe trop court (6 caractères minimum)'); return; }
    setLoading(true);
    try {
      await register(form.email, form.password, form.username || undefined);
      navigate('/pronos');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>⚽ KickZone</div>
        <h1 className={styles.title}>Créer un compte</h1>
        <p className={styles.sub}>Rejoins la communauté KickZone et fais tes pronos !</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Pseudo (optionnel)</label>
            <input
              type="text"
              className={styles.input}
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="TonPseudo"
              maxLength={50}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="ton@email.fr"
              required
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Mot de passe</label>
            <input
              type="password"
              className={styles.input}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Confirmer le mot de passe</label>
            <input
              type="password"
              className={styles.input}
              value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Inscription...' : 'Créer mon compte'}
          </button>
        </form>

        <p className={styles.switch}>
          Déjà un compte ?{' '}
          <Link to="/connexion" className={styles.switchLink}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
