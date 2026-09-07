// ArticleForm — formulaire d'article de l'admin. `initial` fourni -> modification (PUT), sinon création (POST).

import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../hooks/api';
import styles from '../../pages/Admin.module.css';

const CATEGORIES = ['TRANSFERT', 'ACTU', 'ANALYSE', 'INTERVIEW', 'RESULTATS'];

export default function ArticleForm({ onSaved, initial }) {
  const [form, setForm] = useState({ title: '', summary: '', content: '', imageUrl: '', category: 'ACTU', author: '', ...initial });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initial?.id) await api.put(`/articles/${initial.id}`, form);
      else await api.post('/articles', form);
      toast.success(initial?.id ? 'Article modifié' : 'Article créé');
      onSaved();
    } catch { toast.error('Erreur lors de la sauvegarde'); }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <div className={styles.field}><label>Titre *</label><input value={form.title} onChange={set('title')} required /></div>
        <div className={styles.field}>
          <label>Catégorie *</label>
          <select value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className={styles.field}><label>Auteur</label><input value={form.author} onChange={set('author')} /></div>
      <div className={styles.field}><label>Image URL</label><input value={form.imageUrl} onChange={set('imageUrl')} /></div>
      <div className={styles.field}><label>Résumé</label><textarea rows={2} value={form.summary} onChange={set('summary')} /></div>
      <div className={styles.field}><label>Contenu</label><textarea rows={8} value={form.content} onChange={set('content')} /></div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary">{initial?.id ? 'Sauvegarder' : "Créer l'article"}</button>
        <button type="button" className="btn btn-outline" onClick={onSaved}>Annuler</button>
      </div>
    </form>
  );
}
