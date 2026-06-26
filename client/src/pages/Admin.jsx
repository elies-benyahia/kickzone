import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, useArticles, usePronostics } from '../hooks/api';
import toast from 'react-hot-toast';
import styles from './Admin.module.css';

const CATEGORIES = ['TRANSFERT','ACTU','ANALYSE','INTERVIEW','RESULTATS'];

function ArticleForm({ onSaved, initial }) {
  const [form, setForm] = useState({ title:'', summary:'', content:'', imageUrl:'', category:'ACTU', author:'', ...initial });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

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
        <div className={styles.field}><label>Catégorie *</label>
          <select value={form.category} onChange={set('category')}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className={styles.field}><label>Auteur</label><input value={form.author} onChange={set('author')} /></div>
      <div className={styles.field}><label>Image URL</label><input value={form.imageUrl} onChange={set('imageUrl')} /></div>
      <div className={styles.field}><label>Résumé</label><textarea rows={2} value={form.summary} onChange={set('summary')} /></div>
      <div className={styles.field}><label>Contenu</label><textarea rows={8} value={form.content} onChange={set('content')} /></div>
      <div style={{display:'flex',gap:8}}>
        <button type="submit" className="btn btn-primary">{initial?.id ? 'Sauvegarder' : 'Créer l\'article'}</button>
        <button type="button" className="btn btn-outline" onClick={onSaved}>Annuler</button>
      </div>
    </form>
  );
}

function PronoForm({ onSaved }) {
  const [form, setForm] = useState({ fixtureId:'', homeTeam:'', awayTeam:'', prediction:'', confidence:65, league:'Ligue 1', matchDate:'' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

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

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('articles');
  const [editArticle, setEditArticle] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { data: articlesData, refetch: refetchArticles } = useArticles({ limit: 50 });
  const { data: pronostics, refetch: refetchPronos } = usePronostics();
  const articles = articlesData?.data ?? [];

  useEffect(() => {
    const token = localStorage.getItem('kz_token');
    if (!token) navigate('/admin/login');
  }, [navigate]);

  const logout = () => { localStorage.removeItem('kz_token'); navigate('/admin/login'); };
  const deleteArticle = async (id) => {
    if (!window.confirm('Supprimer cet article ?')) return;
    try { await api.delete(`/articles/${id}`); refetchArticles(); toast.success('Supprimé'); } catch { toast.error('Erreur'); }
  };
  const updatePronoResult = async (id, result) => {
    try { await api.put(`/pronostics/${id}`, { result }); refetchPronos(); toast.success('Résultat mis à jour'); } catch { toast.error('Erreur'); }
  };

  const TABS = [{key:'articles',label:'Articles'},{key:'pronos',label:'Pronostics'}];

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <span className={styles.logo}>KickZone Admin ⚽</span>
        <div className={styles.topbarRight}>
          <span style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>
            {articles.length} articles · {pronostics?.length ?? 0} pronos
          </span>
          <button className="btn btn-outline" onClick={logout} style={{fontSize:'0.82rem',padding:'6px 14px'}}>Déconnexion</button>
        </div>
      </div>

      <div className="container" style={{padding:'1.5rem var(--gutter)'}}>
        <div className={styles.tabs}>
          {TABS.map(t => <button key={t.key} className={`${styles.tab} ${tab===t.key?styles.tabActive:''}`} onClick={()=>{setTab(t.key);setShowForm(false);setEditArticle(null);}}>{t.label}</button>)}
        </div>

        {tab === 'articles' && (
          <>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Articles</h2>
              <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditArticle(null); }}>+ Nouvel article</button>
            </div>
            {(showForm || editArticle) && (
              <div className={styles.formWrap}>
                <ArticleForm initial={editArticle} onSaved={() => { setShowForm(false); setEditArticle(null); refetchArticles(); }} />
              </div>
            )}
            <div className={styles.table}>
              {articles.map(a => (
                <div key={a.id} className={styles.row}>
                  <span className={`badge badge-${a.category==='TRANSFERT'?'orange':a.category==='RESULTATS'?'green':'blue'}`}>{a.category}</span>
                  <span className={styles.rowTitle}>{a.title}</span>
                  <div className={styles.rowActions}>
                    <button className="btn btn-outline" style={{fontSize:'0.78rem',padding:'4px 10px'}} onClick={() => { setEditArticle(a); setShowForm(false); }}>Modifier</button>
                    <button className="btn" style={{fontSize:'0.78rem',padding:'4px 10px',background:'#fee2e2',color:'#dc2626'}} onClick={() => deleteArticle(a.id)}>Supprimer</button>
                  </div>
                </div>
              ))}
              {articles.length === 0 && <p style={{color:'var(--text-muted)',padding:'1rem'}}>Aucun article.</p>}
            </div>
          </>
        )}

        {tab === 'pronos' && (
          <>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Pronostics</h2>
              <button className="btn btn-primary" onClick={() => setShowForm(f => !f)}>+ Nouveau prono</button>
            </div>
            {showForm && (
              <div className={styles.formWrap}>
                <PronoForm onSaved={() => { setShowForm(false); refetchPronos(); }} />
              </div>
            )}
            <div className={styles.table}>
              {(pronostics ?? []).map(p => (
                <div key={p.id} className={styles.row}>
                  <span className={styles.rowTitle}>{p.homeTeam} vs {p.awayTeam}</span>
                  <span style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>{p.prediction}</span>
                  <div className={styles.rowActions}>
                    {!p.result && (
                      <>
                        <button className="btn" style={{fontSize:'0.78rem',padding:'4px 10px',background:'#dcfce7',color:'var(--green-live)'}} onClick={() => updatePronoResult(p.id, 'CORRECT')}>✅ Correct</button>
                        <button className="btn" style={{fontSize:'0.78rem',padding:'4px 10px',background:'#fee2e2',color:'#dc2626'}} onClick={() => updatePronoResult(p.id, 'WRONG')}>❌ Raté</button>
                      </>
                    )}
                    {p.result && <span className={`badge ${p.result==='CORRECT'?'badge-green':'badge-gray'}`}>{p.result}</span>}
                  </div>
                </div>
              ))}
              {(!pronostics || pronostics.length === 0) && <p style={{color:'var(--text-muted)',padding:'1rem'}}>Aucun pronostic.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
