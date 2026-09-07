// PronoForm — fenêtre modale de création d'un pronostic (utilisée par la page Pronos).

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCreatePronostic } from '../hooks/api';
import styles from '../pages/Pronos.module.css';

export default function PronoForm({ onClose }) {
  const { mutateAsync, isPending } = useCreatePronostic(); // POST + état "en cours"
  const [form, setForm] = useState({
    homeTeam: '', awayTeam: '', scoreHome: '', scoreAway: '',
    prediction: '', confidence: 65, league: '', matchDate: '', author: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.homeTeam || !form.awayTeam || !form.matchDate) {
      toast.error('Équipes et date requis');
      return;
    }
    try {
      await mutateAsync({
        homeTeam: form.homeTeam,
        awayTeam: form.awayTeam,
        scoreHome: form.scoreHome !== '' ? Number(form.scoreHome) : null,
        scoreAway: form.scoreAway !== '' ? Number(form.scoreAway) : null,
        prediction: form.prediction || `${form.homeTeam} vs ${form.awayTeam}`,
        confidence: Number(form.confidence),
        league: form.league || null,
        matchDate: form.matchDate,
        author: form.author || 'Anonyme',
      });
      toast.success('Pronostic publié !');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création');
    }
  };

  return (
    <div className={styles.formOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <h2>Nouveau pronostic</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Ton pseudo (optionnel)</label>
            <input value={form.author} onChange={(e) => set('author', e.target.value)} placeholder="Anonyme" className={styles.input} />
          </div>

          <div className={styles.matchRow}>
            <div className={styles.teamInput}>
              <label>Équipe domicile</label>
              <input value={form.homeTeam} onChange={(e) => set('homeTeam', e.target.value)} placeholder="France" required className={styles.input} />
            </div>
            <div className={styles.scoreInputs}>
              <div className={styles.scoreBox}>
                <input type="number" min="0" max="30" value={form.scoreHome} onChange={(e) => set('scoreHome', e.target.value)} placeholder="—" className={styles.scoreInput} />
              </div>
              <span className={styles.scoreSep}>-</span>
              <div className={styles.scoreBox}>
                <input type="number" min="0" max="30" value={form.scoreAway} onChange={(e) => set('scoreAway', e.target.value)} placeholder="—" className={styles.scoreInput} />
              </div>
            </div>
            <div className={styles.teamInput} style={{ textAlign: 'right' }}>
              <label>Équipe extérieur</label>
              <input value={form.awayTeam} onChange={(e) => set('awayTeam', e.target.value)} placeholder="Espagne" required className={styles.input} />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Compétition</label>
              <input value={form.league} onChange={(e) => set('league', e.target.value)} placeholder="Ligue des Champions" className={styles.input} />
            </div>
            <div className={styles.field}>
              <label>Date du match</label>
              <input type="datetime-local" value={form.matchDate} onChange={(e) => set('matchDate', e.target.value)} required className={styles.input} />
            </div>
          </div>

          <div className={styles.field}>
            <label>Analyse / Commentaire (optionnel)</label>
            <textarea value={form.prediction} onChange={(e) => set('prediction', e.target.value)} placeholder="Explique ton pronostic..." rows={3} className={styles.textarea} />
          </div>

          <div className={styles.field}>
            <label>Confiance : <strong>{form.confidence}%</strong></label>
            <input type="range" min="10" max="99" value={form.confidence} onChange={(e) => set('confidence', e.target.value)} className={styles.range} />
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Annuler</button>
            <button type="submit" className={styles.submitBtn} disabled={isPending}>
              {isPending ? 'Enregistrement...' : 'Publier mon prono'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
