// AdminPronoForm — formulaire de création rapide d'un pronostic dans l'admin.

import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../hooks/api';
import styles from '../../pages/Admin.module.css';

export default function AdminPronoForm({ onSaved }) {
  const [form, setForm] = useState({ fixtureId: '', homeTeam: '', awayTeam: '', prediction: '', confidence: 65, league: 'Ligue 1', matchDate: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pronostics', form);
      toast.success('Pronostic créé');
      onSaved();
    } catch { toast.error('Erreur'); }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <div className={styles.field}><label>Équipe domicile *</label><input value={form.homeTeam} onChange={set('homeTeam')} required /></div>
        <div className={styles.field}><label>Équipe extérieur *</label><input value={form.awayTeam} onChange={set('awayTeam')} required /></div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.field}><label>Ligue</label><input value={form.league} onChange={set('league')} /></div>
        <div className={styles.field}><label>Date du match *</label><input type="datetime-local" value={form.matchDate} onChange={set('matchDate')} required /></div>
      </div>
      <div className={styles.field}><label>Prédiction *</label><input value={form.prediction} onChange={set('prediction')} placeholder="Ex: Victoire PSG 2-1" required /></div>
      <div className={styles.field}><label>Confiance : {form.confidence}%</label><input type="range" min={1} max={100} value={form.confidence} onChange={set('confidence')} /></div>
      <div className={styles.field}><label>Fixture ID (API-Football)</label><input type="number" value={form.fixtureId} onChange={set('fixtureId')} /></div>
      <button type="submit" className="btn btn-primary">Créer le pronostic</button>
    </form>
  );
}
