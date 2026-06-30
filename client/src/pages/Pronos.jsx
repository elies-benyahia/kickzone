import { useState } from 'react';
import { usePronostics, useCreatePronostic } from '../hooks/api';
import PronoCard from '../components/PronoCard';
import styles from './Pronos.module.css';
import toast from 'react-hot-toast';

const FILTERS = [
  { key: 'all',      label: 'Tous' },
  { key: 'CORRECT', label: '✅ Corrects' },
  { key: 'RATE',    label: '❌ Ratés' },
  { key: null,      label: '⏳ En attente' },
];

function PronoForm({ onClose }) {
  const { mutateAsync, isPending } = useCreatePronostic();
  const [form, setForm] = useState({
    homeTeam: '', awayTeam: '',
    scoreHome: '', scoreAway: '',
    prediction: '', confidence: 65,
    league: '', matchDate: '', author: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.homeTeam || !form.awayTeam || !form.matchDate) {
      toast.error('Équipes et date requis');
      return;
    }
    try {
      await mutateAsync({
        homeTeam:   form.homeTeam,
        awayTeam:   form.awayTeam,
        scoreHome:  form.scoreHome !== '' ? Number(form.scoreHome) : null,
        scoreAway:  form.scoreAway !== '' ? Number(form.scoreAway) : null,
        prediction: form.prediction || `${form.homeTeam} vs ${form.awayTeam}`,
        confidence: Number(form.confidence),
        league:     form.league || null,
        matchDate:  form.matchDate,
        author:     form.author || 'Anonyme',
      });
      toast.success('Pronostic publié !');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création');
    }
  };

  return (
    <div className={styles.formOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <h2>Nouveau pronostic</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Ton pseudo (optionnel)</label>
            <input value={form.author} onChange={e => set('author', e.target.value)}
              placeholder="Anonyme" className={styles.input} />
          </div>

          <div className={styles.matchRow}>
            <div className={styles.teamInput}>
              <label>Équipe domicile</label>
              <input value={form.homeTeam} onChange={e => set('homeTeam', e.target.value)}
                placeholder="France" required className={styles.input} />
            </div>
            <div className={styles.scoreInputs}>
              <div className={styles.scoreBox}>
                <input type="number" min="0" max="30"
                  value={form.scoreHome} onChange={e => set('scoreHome', e.target.value)}
                  placeholder="—" className={styles.scoreInput} />
              </div>
              <span className={styles.scoreSep}>-</span>
              <div className={styles.scoreBox}>
                <input type="number" min="0" max="30"
                  value={form.scoreAway} onChange={e => set('scoreAway', e.target.value)}
                  placeholder="—" className={styles.scoreInput} />
              </div>
            </div>
            <div className={styles.teamInput} style={{ textAlign: 'right' }}>
              <label>Équipe extérieur</label>
              <input value={form.awayTeam} onChange={e => set('awayTeam', e.target.value)}
                placeholder="Espagne" required className={styles.input} />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Compétition</label>
              <input value={form.league} onChange={e => set('league', e.target.value)}
                placeholder="World Cup" className={styles.input} />
            </div>
            <div className={styles.field}>
              <label>Date du match</label>
              <input type="datetime-local" value={form.matchDate} onChange={e => set('matchDate', e.target.value)}
                required className={styles.input} />
            </div>
          </div>

          <div className={styles.field}>
            <label>Analyse / Commentaire (optionnel)</label>
            <textarea value={form.prediction} onChange={e => set('prediction', e.target.value)}
              placeholder="Explique ton pronostic..." rows={3} className={styles.textarea} />
          </div>

          <div className={styles.field}>
            <label>Confiance : <strong>{form.confidence}%</strong></label>
            <input type="range" min="10" max="99" value={form.confidence}
              onChange={e => set('confidence', e.target.value)} className={styles.range} />
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

export default function Pronos() {
  const { data: pronostics, isLoading } = usePronostics();
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const total   = pronostics?.length ?? 0;
  const correct = pronostics?.filter(p => p.result === 'CORRECT').length ?? 0;
  const rate    = total > 0 ? Math.round(correct / total * 100) : 0;

  const filtered = (pronostics ?? []).filter(p => {
    if (filter === 'all') return true;
    if (filter === null) return p.result === 'EN_ATTENTE' || !p.result;
    return p.result === filter;
  });

  const rateColor = rate >= 60 ? 'var(--green-live)' : rate >= 40 ? 'var(--blue)' : 'var(--orange)';

  return (
    <div className="container" style={{ padding: '1.5rem var(--gutter)' }}>
      {showForm && <PronoForm onClose={() => setShowForm(false)} />}

      <div className={styles.headerTop}>
        <div>
          <h1 className={styles.title}>Pronostics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            Les pronostics de la communauté KickZone
          </p>
        </div>
        <button className={styles.newPronoBtn} onClick={() => setShowForm(true)}>
          + Nouveau prono
        </button>
      </div>

      {total > 0 && (
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{ color: rateColor }}>{rate}%</span>
            <span className={styles.statLbl}>Taux de réussite</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{ color: 'var(--green-live)' }}>{correct}</span>
            <span className={styles.statLbl}>Corrects</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{ color: 'var(--orange)' }}>{pronostics?.filter(p => p.result === 'RATE').length ?? 0}</span>
            <span className={styles.statLbl}>Ratés</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{total}</span>
            <span className={styles.statLbl}>Total</span>
          </div>
          <div className={styles.progressWrap}>
            <div className={styles.progressBar} style={{ width: `${rate}%`, background: rateColor }} />
          </div>
        </div>
      )}

      <div className={styles.filters}>
        {FILTERS.map(f => (
          <button key={String(f.key)}
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <div className={styles.empty}>Chargement...</div>}
      {!isLoading && filtered.length === 0 && (
        <div className={styles.empty}>Aucun pronostic dans cette catégorie.</div>
      )}
      <div className={styles.grid}>
        {filtered.map(p => <PronoCard key={p.id} prono={p} />)}
      </div>
    </div>
  );
}
